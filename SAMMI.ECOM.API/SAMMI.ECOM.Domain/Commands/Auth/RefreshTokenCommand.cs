using MediatR;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Domain.DomainModels.Auth;

namespace SAMMI.ECOM.Domain.Commands.Auth
{
    public class RefreshTokenCommand : IRequest<ActionResponse<AuthTokenResult>>
    {
        public string RefreshToken { get; set; } = null!;
    }
}
