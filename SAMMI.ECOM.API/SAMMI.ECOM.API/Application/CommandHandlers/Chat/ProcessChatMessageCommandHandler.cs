using AutoMapper;
using MediatR;
using SAMMI.ECOM.API.Services.AI;
using SAMMI.ECOM.API.Services.AI.Models;
using SAMMI.ECOM.API.Services.ElasticSearch;
using SAMMI.ECOM.Core.Authorizations;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Domain.AggregateModels.Chat;
using SAMMI.ECOM.Domain.Commands.Chat;
using SAMMI.ECOM.Domain.DomainModels.Chat;
using SAMMI.ECOM.Domain.DomainModels.Products;
using SAMMI.ECOM.Infrastructure.Repositories.Chat;
using SAMMI.ECOM.Infrastructure.Services.Caching;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace SAMMI.ECOM.API.Application.CommandHandlers.Chat
{
    public class ProcessChatMessageCommandHandler : CustombaseCommandHandler<ProcessChatMessageCommand, ChatResponse>
    {
        private readonly IAIClient _aiClient;
        private readonly IProductElasticService _productElasticService;
        private readonly IRedisService<List<ChatMessageDto>> _redisService;
        private readonly IRedisService<ProductChatIntent> _intentRedisService;
        private readonly IAiChatHistoryRepository _aiChatHistoryRepository;
        private readonly ILogger<ProcessChatMessageCommandHandler> _logger;

        public ProcessChatMessageCommandHandler(
            UserIdentity currentUser,
            IMapper mapper,
            IAIClient aiClient,
            IProductElasticService productElasticService,
            IRedisService<List<ChatMessageDto>> redisService,
            IRedisService<ProductChatIntent> intentRedisService,
            IAiChatHistoryRepository aiChatHistoryRepository,
            ILogger<ProcessChatMessageCommandHandler> logger) : base(currentUser, mapper)
        {
            _aiClient = aiClient;
            _productElasticService = productElasticService;
            _redisService = redisService;
            _intentRedisService = intentRedisService;
            _aiChatHistoryRepository = aiChatHistoryRepository;
            _logger = logger;
        }

        public override async Task<ActionResponse<ChatResponse>> Handle(ProcessChatMessageCommand request, CancellationToken cancellationToken)
        {
            var response = new ActionResponse<ChatResponse>();
            
            // 1. Determine Identity & ConversationId
            var conversationId = request.ConversationId;
            if (string.IsNullOrEmpty(conversationId))
            {
                conversationId = Guid.NewGuid().ToString();
            }

            var userId = 0;
            try { userId = _currentUser.Id; } catch { }

            // 2. Load History (Hybrid: Redis then DB)
            var cacheKey = $"ChatSession:{conversationId}";
            var history = await _redisService.GetCache<List<ChatMessageDto>>(cacheKey) ?? new List<ChatMessageDto>();

            if (!history.Any() && userId > 0)
            {
                var dbHistory = await _aiChatHistoryRepository.GetByUserIdAsync(userId, 10);
                history = dbHistory.Select(h => new ChatMessageDto 
                { 
                    Role = h.Role, 
                    Content = h.Content 
                }).ToList();
            }

            // 3. Extract Intent with Context
            var historyText = string.Join("\n", history.Select(h => $"{h.Role}: {h.Content}"));
            
            ProductChatIntent? intent = null;
            // Chỉ tối ưu bộ nhớ đệm (cache) cho những câu truy vấn đầu tiên (không có ngữ cảnh trước đó)
            if (!history.Any() && !string.IsNullOrWhiteSpace(request.Message))
            {
                var normalizedQuery = Regex.Replace(request.Message.ToLower(), @"[^\w\s\d]", "").Trim();
                normalizedQuery = Regex.Replace(normalizedQuery, @"\s+", " ");
                var intentCacheKey = $"Intent:{normalizedQuery}";

                intent = await _intentRedisService.GetCache<ProductChatIntent>(intentCacheKey);
                if (intent == null)
                {
                    intent = await _aiClient.ExtractIntentAsync(request.Message, historyText, cancellationToken);
                    if (intent != null && !intent.IsOutOfDomain)
                    {
                        // Cache trong 24h
                        await _intentRedisService.SetCache(intentCacheKey, intent, TimeSpan.FromHours(24));
                    }
                }
            }
            else
            {
                intent = await _aiClient.ExtractIntentAsync(request.Message, historyText, cancellationToken);
            }

            if (intent == null || intent.IsOutOfDomain)
            {
                var fallbackMsg = intent?.IsOutOfDomain == true
                    ? "Xin lỗi, tôi chỉ có thể hỗ trợ các thông tin liên quan đến mỹ phẩm và mua sắm tại SammiStore."
                    : "Tôi chưa hiểu ý bạn, bạn có thể nói rõ hơn không?";
                
                var fallbackResult = new ChatResponse 
                { 
                    Response = fallbackMsg, 
                    ConversationId = conversationId 
                };
                response.SetResult(fallbackResult);
                return response;
            }

            // 4. Handle Clarification
            if (intent.QueryType == "clarification" && intent.ClarifyingQuestions.Any())
            {
                var clarResult = new ChatResponse
                {
                    Response = intent.ClarifyingQuestions.First(),
                    NextAction = "clarify",
                    SuggestedQuestions = intent.ClarifyingQuestions.Skip(1).ToList(),
                    ConversationId = conversationId
                };
                response.SetResult(clarResult);
                return response;
            }

            // 5. Search Products
            List<ProductDTO> products = new();
            if (intent.QueryType == "recommend" || intent.QueryType == "compare" || intent.QueryType == "ingredient_checker" || intent.QueryType == "product_info")
            {
                products = await _productElasticService.SearchProductsByConstraints(
                    intent.Keyword,
                    intent.Category,
                    intent.SkinType,
                    intent.Ingredients,
                    intent.MaxPrice,
                    10); // Lấy tối đa 10 từ Elastic, cắt xuống Limit ở bên dưới
            }
            // IF queryType == "follow_up", we do NOT search Elastic. We rely entirely on the chat history.

            // 6. Local Filters (Limit & Sort) for returned products
            if (products.Any() && intent.SortBy != null)
            {
                if (intent.SortBy == "price_asc")
                    products = products.OrderBy(p => p.Price).ToList();
                else if (intent.SortBy == "price_desc")
                    products = products.OrderByDescending(p => p.Price).ToList();
            }

            if (products.Any() && intent.Limit.HasValue && intent.Limit > 0)
            {
                products = products.Take(intent.Limit.Value).ToList();
            }

            // 7. Build Warnings
            var warnings = BuildWarnings(intent, products);

            // 7. Generate Response with Context
            var contextPrompt = BuildContextPrompt(request.Message, intent, products, warnings, history);
            var aiResponse = await _aiClient.GenerateResponseAsync(contextPrompt, "Bạn là chuyên gia tư vấn mỹ phẩm của SammiStore.", cancellationToken);

            // 8. Persistence (DB & Redis)
            history.Add(new ChatMessageDto { Role = "user", Content = request.Message });
            history.Add(new ChatMessageDto { Role = "assistant", Content = aiResponse });
            
            // Keep only last 10 messages for context efficiency
            if (history.Count > 10) history = history.Skip(history.Count - 10).ToList();

            await _redisService.SetCache(cacheKey, history, TimeSpan.FromHours(2));

            if (userId > 0)
            {
                _aiChatHistoryRepository.Create(new AiChatHistory 
                { 
                    UserId = userId, 
                    ConversationId = conversationId, 
                    Role = "user", 
                    Content = request.Message, 
                    CreatedDate = DateTime.Now 
                });
                _aiChatHistoryRepository.Create(new AiChatHistory 
                { 
                    UserId = userId, 
                    ConversationId = conversationId, 
                    Role = "assistant", 
                    Content = aiResponse,
                    Metadata = JsonSerializer.Serialize(new
                    {
                        products = products.Take(5).ToList(),
                        suggestedQuestions = intent.ClarifyingQuestions // or any other suggested questions if applicable
                    }),
                    CreatedDate = DateTime.Now 
                });
                await _aiChatHistoryRepository.SaveChangeAsync(cancellationToken);
            }

            response.SetResult(new ChatResponse
            {
                Response = aiResponse,
                RecommendedProducts = products.Take(5).ToList(),
                NextAction = intent.QueryType,
                ConversationId = conversationId
            });

            return response;
        }

        private string BuildContextPrompt(string userMessage, ProductChatIntent intent, List<ProductDTO> products, List<string> warnings, List<ChatMessageDto> history)
        {
            var historyText = string.Join("\n", history.Select(h => $"{h.Role}: {h.Content}"));
            
            return $@"
Chat history:
{historyText}

USER QUESTION: {userMessage}

SYSTEM CONTEXT (STRICTLY USE THIS DATA ONLY):
- Intent: {JsonSerializer.Serialize(intent)}
- Matched Products: {JsonSerializer.Serialize(products.Select(p => new { p.Name, p.Price, p.BrandName, p.Uses, p.UsageGuide, p.Ingredient }))}
- Warnings: {JsonSerializer.Serialize(warnings)}

TASK: Answer the USER QUESTION using the 'Matched Products' and 'Chat history' above.
RULES:
1. DO NOT hallucinate or invent products. You MUST base your answer on the 'Matched Products' and 'Chat history'.
2. If the user asks about a product and it is NOT found in 'Matched Products' or 'Chat history', inform the user that no products were found in the system.
3. DO NOT detail ingredients unless asked.
4. MUST reply in a friendly Vietnamese language.";
        }

        private List<string> BuildWarnings(ProductChatIntent intent, List<ProductDTO> products)
        {
            var warnings = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            var requestedIrritantTags = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            foreach (var ing in intent.Ingredients ?? new List<string>())
            {
                var lower = ing.Trim().ToLowerInvariant();
                if (lower.Contains("alcohol")) requestedIrritantTags.Add("alcohol");
                if (lower.Contains("fragrance")) requestedIrritantTags.Add("fragrance");
                if (lower.Contains("retinol")) requestedIrritantTags.Add("retinoid");
                if (lower.Contains("salicylic") || lower.Contains("bha") || lower.Contains("acid")) requestedIrritantTags.Add("acids");
            }

            var sensitive = string.Equals(intent.SkinType, "sensitive", StringComparison.OrdinalIgnoreCase);
            var useAllIrritants = sensitive || intent.QueryType == "ingredient_checker";

            foreach (var p in products)
            {
                if (p?.PotentialIrritants == null || p.PotentialIrritants.Count == 0) continue;

                foreach (var tag in p.PotentialIrritants)
                {
                    if (!useAllIrritants && requestedIrritantTags.Count > 0 && !requestedIrritantTags.Contains(tag)) continue;

                    var vn = tag switch
                    {
                        "alcohol" => "cồn",
                        "fragrance" => "hương liệu",
                        "retinoid" => "retinoid",
                        "acids" => "tinh chất acid",
                        _ => tag
                    };
                    warnings.Add($"Sản phẩm '{p.Name}' có chứa {vn}, bạn nên lưu ý nếu da nhạy cảm.");
                }
            }
            return warnings.ToList();
        }
    }
}
