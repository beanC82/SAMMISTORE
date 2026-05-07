using MediatR;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Domain.DomainModels.Chat;

namespace SAMMI.ECOM.Domain.Commands.Chat
{
    public class ProcessChatMessageCommand : IRequest<ActionResponse<ChatResponse>>
    {
        public string Message { get; set; } = string.Empty;
        public string? ConversationId { get; set; }

        public ProcessChatMessageCommand(string message, string? conversationId)
        {
            Message = message;
            ConversationId = conversationId;
        }
    }
}
