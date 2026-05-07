using AutoMapper;
using Microsoft.IdentityModel.Tokens;
using SAMMI.ECOM.Core.Authorizations;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Core.Models.GlobalConfigs;
using SAMMI.ECOM.Domain.AggregateModels.System;
using SAMMI.ECOM.Domain.Commands.Auth;
using SAMMI.ECOM.Domain.DomainModels.Auth;
using SAMMI.ECOM.Domain.DomainModels.Users;
using SAMMI.ECOM.Domain.Enums;
using SAMMI.ECOM.I18N.Auths;
using SAMMI.ECOM.Infrastructure.Queries;
using SAMMI.ECOM.Infrastructure.Repositories.Auth;
using SAMMI.ECOM.Utility;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace SAMMI.ECOM.API.Application.CommandHandlers.Auths
{
    public class GenerateTokenCommandHandler : CustombaseCommandHandler<GenerateTokenCommand, AuthTokenResult>
    {
        protected readonly AccessTokenProvideOptions _accessTokenOptions;
        protected readonly RefreshTokenProvideOptions _refreshTokenOptions;

        private readonly IUsersQueries _userQueries;
        private readonly IRefreshTokenRepository _tokenRepository;
        public GenerateTokenCommandHandler(
            AccessTokenProvideOptions accessTokenOptions,
            RefreshTokenProvideOptions refreshTokenOptions,
            IUsersQueries userQueries,
            IRefreshTokenRepository refreshTokenRepository,
            UserIdentity currentUser,
            IMapper mapper)
            : base(currentUser, mapper)
        {
            _accessTokenOptions = accessTokenOptions;
            _refreshTokenOptions = refreshTokenOptions;
            _userQueries = userQueries;
            _tokenRepository = refreshTokenRepository;
        }

        public override async Task<ActionResponse<AuthTokenResult>> Handle(GenerateTokenCommand request, CancellationToken cancellationToken)
        {
            var actResponse = new ActionResponse<AuthTokenResult>();
            if (string.IsNullOrWhiteSpace(request.Username) && !request.UserId.HasValue)
            {
                return ActionResponse<AuthTokenResult>.Failed("The user identifier parameter is not allow null");
            }

            UserDTO? user;
            if (!string.IsNullOrWhiteSpace(request.Username))
            {
                user = request.TypeUser == TypeUserEnum.Employee ?
                        _userQueries.FindByUsername(request.Username) :
                        _userQueries.FindCustomerByUsername(request.Username);
            }
            else
            {
                user = request.TypeUser == TypeUserEnum.Employee ?
                        _userQueries.FindById(request.UserId!.Value) :
                        _userQueries.FindCustomerById(request.UserId!.Value);
            }

            int roleId = 0;

            if (user is CustomerDTO customer)
            {
                roleId = customer.RoleId;
            }
            else if (user is EmployeeDTO employee)
            {
                roleId = employee.RoleId;
            }

            if (user == null)
            {
                return ActionResponse<AuthTokenResult>.Failed(SignInError.Failed);
            }

            if (user.IsLock == true)
            {
                return ActionResponse<AuthTokenResult>.Failed(string.Format(SignInError.UserIsLocked, user.Username));
            }

            var now = DateTime.Now;
            var tokenResult = new AuthTokenResult();

            var tokenHandler = new JwtSecurityTokenHandler();
            var claimsIdentity = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Username),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.MobilePhone, user.Phone),
                new Claim(GlobalClaimsTypes.LocalId, user.Id.ToString())
            });

            var userPermissions = await _userQueries.GetPermissionOfRole(roleId);
            if (userPermissions != null && userPermissions.Any())
            {
                var permissionCodes = string.Join(',', userPermissions.Select(p => p.PermissionCode.ToString()));
                claimsIdentity.AddClaim(new Claim(GlobalClaimsTypes.Permissions, permissionCodes.Compress()));
            }

            var userRoleIds = userPermissions?.DistinctBy(x => x.RoleId).Select(x => x.RoleId).ToArray();
            if (userRoleIds != null && userRoleIds.Any())
            {
                claimsIdentity.AddClaims(userRoleIds.Select(p => new Claim(ClaimTypes.Role, p.ToString())));
            }

            var tokenDecriptor = new SecurityTokenDescriptor
            {
                Subject = claimsIdentity,
                Issuer = _accessTokenOptions.JWTIssuer,
                NotBefore = now,
                Expires = now.Add(_accessTokenOptions.Expiration),
                SigningCredentials = _accessTokenOptions.SigningCredentials,
            };

            var accessToken = tokenHandler.CreateToken(tokenDecriptor);
            tokenResult.AccessToken = tokenHandler.WriteToken(accessToken);

            var refreshTokenClaims = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Username),
                new Claim(GlobalClaimsTypes.LocalId, user.Id.ToString())
            });

            var refTokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = refreshTokenClaims,
                Issuer = _refreshTokenOptions.JWTIssuers.ToString(),
                NotBefore = now,
                Expires = now.Add(_refreshTokenOptions.Expiration),
                SigningCredentials = _refreshTokenOptions.SigningCredentials,
            };

            var refreshToken = tokenHandler.CreateToken(refTokenDescriptor);
            var refreshTokenEntity = new RefreshToken()
            {
                Token = tokenHandler.WriteToken(refreshToken),
                ExpirationDateUtc = DateTime.UtcNow.Add(_refreshTokenOptions.Expiration),
                UserId = user.Id,
                IsExchanged = false,
                IsInvalid = false,
            };

            actResponse.Combine(await _tokenRepository.CreateAndSave(refreshTokenEntity));
            tokenResult.RefreshToken = refreshTokenEntity.Token;
            actResponse.SetResult(tokenResult);

            return actResponse;
        }
    }
}
