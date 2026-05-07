namespace SAMMI.ECOM.Domain.DomainModels.Chat
{
    public class ChatHistoryResponse
    {
        public List<ChatMessageDto> Messages { get; set; } = new();
        public string? ConversationId { get; set; }
    }
}
