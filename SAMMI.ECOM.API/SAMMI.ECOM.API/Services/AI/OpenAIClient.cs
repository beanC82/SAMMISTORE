using OpenAI.Chat;
using SAMMI.ECOM.API.Services.AI.Models;
using System.Text.Json;

namespace SAMMI.ECOM.API.Services.AI
{
    public class OpenAIClient : IAIClient
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<OpenAIClient> _logger;
        private readonly ChatClient? _chatClient;
        private readonly string _model;

        public OpenAIClient(IConfiguration configuration, ILogger<OpenAIClient> logger)
        {
            _configuration = configuration;
            _logger = logger;
            var apiKey = _configuration["OpenAISettings:ApiKey"] ?? Environment.GetEnvironmentVariable("OPENAI_API_KEY") ?? "";
            _model = _configuration["OpenAISettings:Model"] ?? "gpt-4o-mini";
            
            if (!string.IsNullOrWhiteSpace(apiKey))
            {
                _chatClient = new ChatClient(_model, apiKey);
            }
        }

        public async Task<ProductChatIntent?> ExtractIntentAsync(string userQuery, string? historyText = null, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(userQuery))
                return null;

            if (_chatClient == null)
            {
                _logger.LogError("OpenAI ChatClient is not initialized (missing API Key).");
                return null;
            }

            var prompt = $@"Bạn là chuyên gia phân tích dữ liệu AI cho hệ thống e-commerce SammiStore.
Nhiệm vụ: Phân tích ngữ cảnh và trích xuất ý định mua sắm từ câu hỏi của người dùng thành JSON.

LƯU Ý ĐẶC BIỆT: Hãy linh hoạt, hiểu ngữ nghĩa của người dùng. 
Nếu người dùng nói những câu như: ""Cho tôi 2 sản phẩm tốt nhất về giá trong các sản phẩm trên"", bạn phải hiểu:
 - Là câu follow-up trên danh sách cũ (QueryType = ""follow_up"")
 - Giới hạn là 2 (Limit = 2)
 - Ưu tiên giá rẻ (SortBy = ""price_asc"")

Cấu trúc JSON (CHỈ TRẢ VỀ JSON HỢP LỆ VÀ ĐẦY ĐỦ CÁC TRƯỜNG):
{{
  ""keyword"": ""string hoặc null (từ khoá chung, hoặc TÊN SẢN PHẨM/THƯƠNG HIỆU rải rác trong câu. Ví dụ: 'Hada Labo', 'sữa rửa mặt nghệ')"",
  ""category"": ""string hoặc null"",
  ""skin_type"": ""string hoặc null (oily, dry, combination, sensitive, normal)"",
  ""ingredients"": [""danh sách thành phần""],
  ""max_price"": number (hoặc null),
  ""limit"": number (hoặc null, số lượng sp yêu cầu),
  ""sortBy"": ""string hoặc null (price_asc, price_desc, rating_desc)"",
  ""queryType"": ""string (recommend, compare, ingredient_checker, clarification, follow_up, product_info)"",
  ""isOutOfDomain"": boolean (chỉ true nếu HOÀN TOÀN KHÔNG liên quan đến mỹ phẩm/làm đẹp/chào hỏi cơ bản),
  ""clarifyingQuestions"": [""câu hỏi làm rõ""]
}}

Luật QueryType:
- product_info: Yêu cầu cung cấp, hỏi đáp thông tin chi tiết (công dụng, cách dùng, phù hợp loại da...) của sản phẩm.
- follow_up: Yêu cầu thao tác (lọc, chọn rẻ nhất...) trên danh sách sản phẩm vừa đưa ra.
- recommend: Tìm sản phẩm mới dựa trên tiêu chí.
- compare: So sánh các sản phẩm.
- ingredient_checker: Hỏi hoặc kiểm tra thành phần.
- clarification: HỆ THỐNG HỎI NGƯỜI DÙNG khi câu yêu cầu quá chung chung (VD: ""kiếm sữa rửa mặt"" -> hệ thống hỏi lại ""bạn thuộc loại da gì?""). TUYỆT ĐỐI KHÔNG dùng loại này khi người dùng đang hỏi đáp về chức năng/công dụng sản phẩm (thì phải dùng product_info).

Lịch sử trò chuyện gần nhất: 
{historyText ?? "Không có"}

YÊU CẦU CỦA NGƯỜI DÙNG: {userQuery}";

            var options = new ChatCompletionOptions
            {
                Temperature = 0.1f, // Độ sáng tạo thấp để JSON luôn lấy đúng thông tin và cực nhanh
                ResponseFormat = ChatResponseFormat.CreateJsonObjectFormat()
            };

            var messages = new List<ChatMessage>
            {
                new SystemChatMessage("Bạn là hệ thống trích xuất JSON. Bạn buộc phải trả về raw JSON hợp lệ đúng cấu trúc."),
                new UserChatMessage(prompt)
            };

            try
            {
                var response = await _chatClient.CompleteChatAsync(messages, options, cancellationToken);
                var responseText = response.Value.Content[0].Text;

                if (string.IsNullOrWhiteSpace(responseText)) return null;

                var serializerOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return JsonSerializer.Deserialize<ProductChatIntent>(responseText, serializerOptions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to parse OpenAI intent JSON");
                return null;
            }
        }

        public async Task<string> GenerateResponseAsync(string prompt, string? systemInstruction = null, CancellationToken cancellationToken = default)
        {
            if (_chatClient == null) return "Xin lỗi, hệ thống đang bảo trì.";

            var defaultSystem = "Bạn là chuyên gia tư vấn mỹ phẩm thân thiện của SammiStore. Trả lời súc tích, nhanh gọn ưu tiên hiệu năng thời gian. Nếu người dùng yêu cầu số lượng sản phẩm nhất định (ví dụ: 2 sản phẩm), BẮT BUỘC chỉ trả về/đề xuất đúng số lượng đó và sát yêu cầu nhất (rẻ nhất, tốt nhất).";
            var options = new ChatCompletionOptions
            {
                Temperature = 0.5f, // Đủ tự nhiên nhưng vẫn tập trung chính xác vào yêu cầu
                MaxOutputTokenCount = 700 // Giới hạn token để phản hồi stream về máy khách nhanh nhất có thể
            };

            var messages = new List<ChatMessage>
            {
                new SystemChatMessage(systemInstruction ?? defaultSystem),
                new UserChatMessage(prompt)
            };

            try
            {
                var response = await _chatClient.CompleteChatAsync(messages, options, cancellationToken);
                return response.Value.Content[0].Text;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calling OpenAI API (GenerateResponseAsync)");
                return "Xin lỗi, tôi đang gặp chút sự cố trong việc xử lý kết quả.";
            }
        }
    }
}
