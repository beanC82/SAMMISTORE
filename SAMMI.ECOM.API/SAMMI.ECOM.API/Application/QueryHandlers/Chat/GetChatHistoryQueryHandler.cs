using AutoMapper;
using SAMMI.ECOM.Core.Authorizations;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Domain.Commands.Chat;
using SAMMI.ECOM.Domain.DomainModels.Chat;
using SAMMI.ECOM.Infrastructure.Repositories.Chat;
using MediatR;

namespace SAMMI.ECOM.API.Application.QueryHandlers.Chat
{
    public class GetChatHistoryQueryHandler : IRequestHandler<GetChatHistoryQuery, ActionResponse<ChatHistoryResponse>>
    {
        private readonly IAiChatHistoryRepository _aiChatHistoryRepository;
        private readonly UserIdentity _currentUser;

        public GetChatHistoryQueryHandler(
            IAiChatHistoryRepository aiChatHistoryRepository,
            UserIdentity currentUser)
        {
            _aiChatHistoryRepository = aiChatHistoryRepository;
            _currentUser = currentUser;
        }

        public async Task<ActionResponse<ChatHistoryResponse>> Handle(GetChatHistoryQuery request, CancellationToken cancellationToken)
        {
            var response = new ActionResponse<ChatHistoryResponse>();

            var userId = 0;
            try { userId = _currentUser.Id; } catch { }

            if (userId <= 0)
            {
                response.AddError("Unauthorized", "Bạn chưa đăng nhập.");
                return response;
            }

            var dbHistory = await _aiChatHistoryRepository.GetByUserIdAsync(userId, 50); // Get more messages for full history

            var result = new ChatHistoryResponse
            {
                Messages = dbHistory.Select(h => {
                    var dto = new ChatMessageDto
                    {
                        Role = h.Role,
                        Content = h.Content
                    };
                    
                    if (!string.IsNullOrEmpty(h.Metadata))
                    {
                        try 
                        {
                            var meta = System.Text.Json.JsonSerializer.Deserialize<ChatMetadataDto>(h.Metadata, new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                            if (meta != null)
                            {
                                dto.Products = meta.Products;
                                dto.SuggestedQuestions = meta.SuggestedQuestions;
                            }
                        }
                        catch { /* Ignore malformed metadata */ }
                    }
                    return dto;
                }).ToList(),
                ConversationId = dbHistory.LastOrDefault()?.ConversationId
            };

            response.SetResult(result);
            return response;
        }
    }
}
