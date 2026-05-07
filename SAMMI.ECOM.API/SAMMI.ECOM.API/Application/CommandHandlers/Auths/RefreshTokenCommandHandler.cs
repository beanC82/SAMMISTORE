using AutoMapper;
using MediatR;
using Microsoft.IdentityModel.Tokens;
using SAMMI.ECOM.Core.Authorizations;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Core.Models.GlobalConfigs;
using SAMMI.ECOM.Domain.Commands.Auth;
using SAMMI.ECOM.Domain.DomainModels.Auth;
using SAMMI.ECOM.I18N.Generals;
using SAMMI.ECOM.Infrastructure;
using SAMMI.ECOM.Infrastructure.Queries.Auth;
using SAMMI.ECOM.Infrastructure.Repositories.Auth;
using System.IdentityModel.Tokens.Jwt;

namespace SAMMI.ECOM.API.Application.CommandHandlers.Auths
{
    public class RefreshTokenCommandHandler : CustombaseCommandHandler<RefreshTokenCommand, AuthTokenResult>
    {
        private readonly RefreshTokenProvideOptions _tokenProvideOptions;
        private readonly IRefreshTokenRepository _tokenRepository;

        private readonly IRefreshTokenQueries _tokenQueries;

        private readonly IMediator _mediator;

        private readonly SammiEcommerceContext _context;
        public RefreshTokenCommandHandler(
            RefreshTokenProvideOptions tokenProvideOptions,
            IRefreshTokenRepository tokenRepository,
            IRefreshTokenQueries tokenQueries,
            IMediator mediator,
            SammiEcommerceContext context,
            UserIdentity currentUser,
            IMapper mapper) : base(currentUser, mapper)
        {
            _tokenProvideOptions = tokenProvideOptions;
            _tokenRepository = tokenRepository;
            _tokenQueries = tokenQueries;
            _mediator = mediator;
            _context = context;
        }

        public override async Task<ActionResponse<AuthTokenResult>> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
        {
            var jwtValidationResult = ValidateTokenAsJwt(request.RefreshToken);

            if (!jwtValidationResult.IsValid)
            {
                return ActionResponse<AuthTokenResult>.Failed(I18nMessage.TokenInvalid);
            }

            var storedValidationResult = await _tokenQueries.ValidateRefreshToken(request.RefreshToken);
            switch (storedValidationResult.Result)
            {
                case ValidationRefreshTokenResult.Valid:
                    await _tokenRepository.MarkTokenExchanged(storedValidationResult.TokenId);
                    return await _mediator.Send(new GenerateTokenCommand(jwtValidationResult.UserId));
                case ValidationRefreshTokenResult.Exchanged:
                    await _tokenRepository.MakeAllInvalidInFamily(storedValidationResult.TokenId);
                    if (_context.HasActiveTransaction)
                    {
                        await _context.CommitTransactionAsync(_context.GetCurrentTransaction()!);
                    }
                    break;
                default:
                    break;
            }

            return ActionResponse<AuthTokenResult>.Failed(I18nMessage.AnErrorHasOccurred);
        }

        private (bool IsValid, int UserId) ValidateTokenAsJwt(string refToken)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();

                SecurityToken validatedToken;
                var principal = tokenHandler.ValidateToken(refToken,
                    new TokenValidationParameters()
                    {
                        ValidateLifetime = true,
                        ValidateIssuer = true,
                        ValidateIssuerSigningKey = true,
                        ValidateAudience = false,
                        ValidIssuer = _tokenProvideOptions.JWTIssuer,
                        IssuerSigningKey = _tokenProvideOptions.SigningCredentials.Key
                    },
                    out validatedToken);

                var jwtTokenInstance = (JwtSecurityToken)validatedToken;
                var userId = Convert.ToInt32(jwtTokenInstance.Claims.First(x => x.Type == GlobalClaimsTypes.LocalId).Value);

                return (true, userId);
            }
            catch (Exception)
            {
                return (false, 0);
            }
        }
    }
}
