using SAMMI.ECOM.Domain.DomainModels.Products;

namespace SAMMI.ECOM.Domain.DomainModels.Chat
{
    public class ChatMessageDto
    {
        public string Role { get; set; } = string.Empty; // user | assistant
        public string Content { get; set; } = string.Empty;
        public List<ProductDTO>? Products { get; set; }
        public List<string>? SuggestedQuestions { get; set; }
    }
}
