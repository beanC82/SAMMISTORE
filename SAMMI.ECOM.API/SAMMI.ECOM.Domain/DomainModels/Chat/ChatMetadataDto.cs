using SAMMI.ECOM.Domain.DomainModels.Products;

namespace SAMMI.ECOM.Domain.DomainModels.Chat
{
    public class ChatMetadataDto
    {
        public List<ProductDTO>? Products { get; set; }
        public List<string>? SuggestedQuestions { get; set; }
    }
}
