using MediatR;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Domain.DomainModels.Auth;
using SAMMI.ECOM.Domain.Enums;

namespace SAMMI.ECOM.Domain.Commands.Auth
{
    public class GenerateTokenCommand : IRequest<ActionResponse<AuthTokenResult>>
    {
        public string? Username { get; set; }
        public int? UserId { get; set; }
        public TypeUserEnum TypeUser { get; set; }
        public GenerateTokenCommand()
        {

        }

        public GenerateTokenCommand(int UserId)
        {
            this.UserId = UserId;
        }
    }
}
