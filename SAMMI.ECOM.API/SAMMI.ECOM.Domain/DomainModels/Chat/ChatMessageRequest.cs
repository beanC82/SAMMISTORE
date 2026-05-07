namespace SAMMI.ECOM.Domain.DomainModels.Chat
{
    public class ChatMessageRequest
    {
        public string Message { get; set; } = string.Empty;
        public string? ConversationId { get; set; }
    }
}
