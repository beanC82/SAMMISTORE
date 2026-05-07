using MediatR;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Domain.DomainModels.Chat;

namespace SAMMI.ECOM.Domain.Commands.Chat
{
    public class GetChatHistoryQuery : IRequest<ActionResponse<ChatHistoryResponse>>
    {
    }
}
