using SAMMI.ECOM.Domain.DomainModels.Products;

namespace SAMMI.ECOM.Domain.DomainModels.Chat
{
    public class ChatResponse
    {
        public string Response { get; set; } = string.Empty;
        public List<ProductDTO> RecommendedProducts { get; set; } = new();
        public string? NextAction { get; set; } // clarify, search, compare
        public List<string>? SuggestedQuestions { get; set; }
        public string? ConversationId { get; set; }
    }
}
