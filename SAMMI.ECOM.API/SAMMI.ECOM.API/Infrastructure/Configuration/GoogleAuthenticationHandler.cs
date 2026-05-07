using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Authentication.OAuth;
using SAMMI.ECOM.Core.Authorizations;
using SAMMI.ECOM.Domain.AggregateModels.Others;
using SAMMI.ECOM.Domain.AggregateModels.Products;
using SAMMI.ECOM.Domain.Enums;
using SAMMI.ECOM.Infrastructure.Queries;
using SAMMI.ECOM.Infrastructure.Repositories;
using SAMMI.ECOM.Infrastructure.Repositories.Permission;
using SAMMI.ECOM.Infrastructure.Repositories.Products;
using SAMMI.ECOM.Utility;
using System.Security.Claims;

namespace SAMMI.ECOM.API.Infrastructure.Configuration
{
    public class GoogleAuthenticationHandler
    {
        private readonly IUsersRepository _userRepository;
        private readonly IMapper _mapper;
        private readonly IMediator _mediator;
        private readonly IUsersQueries _userQueries;
        private readonly IRoleRepository _roleRepository;
        private readonly IImageRepository _imageRepository;
        public GoogleAuthenticationHandler(
            IUsersRepository userRepository,
            IMapper mapper,
            IMediator mediator,
            IUsersQueries userQueries,
            IRoleRepository roleRepository,
            IImageRepository imageRepository
            )
        {
            _userRepository = userRepository;
            _mapper = mapper;
            _mediator = mediator;
            _userQueries = userQueries;
            _roleRepository = roleRepository;
            _imageRepository = imageRepository;
        }
        public async Task HandleOnCreatingTicket(OAuthCreatingTicketContext context)
        {
            var googleId = context.Principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var email = context.Principal.FindFirst(ClaimTypes.Email)?.Value;
            var name = context.Principal.FindFirst(ClaimTypes.Name)?.Value;
            var surname = context.Principal.FindFirst(ClaimTypes.Surname)?.Value;
            var firstName = context.Principal.FindFirst(ClaimTypes.GivenName)?.Value;
            var picture = context.Principal.FindFirst("picture")?.Value;

            if (string.IsNullOrEmpty(googleId) || string.IsNullOrEmpty(email))
            {
                context.Fail("Không thể lấy thông tin người dùng từ Google.");
                return;
            }

            // Tìm hoặc tạo người dùng
            var user = await _userRepository.GetByEmail(email);
            if (user == null)
            {
                //add image
                Image imageUser = null;
                if (!string.IsNullOrEmpty(picture))
                {
                    imageUser = new Image()
                    {
                        ImageUrl = picture,
                        TypeImage = ImageEnum.User.ToString(),
                    };
                    await _imageRepository.CreateAndSave(imageUser);
                }

                user = new User()
                {
                    Code = await _userQueries.GetCodeByLastId(Domain.Enums.CodeEnum.Customer),
                    IdentityGuid = Guid.NewGuid().ToString(),
                    Type = TypeUserEnum.Customer.ToString(),
                    FirstName = firstName,
                    LastName = surname,
                    FullName = name,
                    Email = email,
                    Username = await GenerateUsernameAsync(email),
                    RoleId = (await _roleRepository.FindByCode(RoleTypeEnum.CUSTOMER.ToString())).Id,
                    IsVerify = true,
                    AvatarId = imageUser != null ? imageUser.Id : null
                };
                await _userRepository.CreateAndSave(user);
            }

            var userPermissions = await _userQueries.GetPermissionOfRole(user.Id).ConfigureAwait(false);
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Username),
                new Claim(ClaimTypes.Name, user.FullName ?? string.Empty),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(GlobalClaimsTypes.LocalId, user.Id.ToString())
            };

            if (userPermissions != null && userPermissions.Any())
            {
                var permissionIds = string.Join(',', userPermissions.Select(p => p.PermissionId.ToString()));
                claims.Add(new Claim(GlobalClaimsTypes.Permissions, permissionIds.Compress()));

                var userRoleIds = userPermissions.DistinctBy(x => x.RoleId).Select(x => x.RoleId).ToArray();
                claims.AddRange(userRoleIds.Select(roleId => new Claim(ClaimTypes.Role, roleId.ToString())));
            }

            context.Principal.AddIdentity(new ClaimsIdentity(claims));
        }

        private async Task<string> GenerateUsernameAsync(string email)
        {
            string baseUsername = email.Split('@')[0].Replace(".", "").ToLower();
            int suffix = 1;
            string finalUsername = baseUsername;
            while (await _userRepository.IsExistUsername(finalUsername, 0))
            {
                finalUsername = $"{baseUsername}{suffix}";
                suffix++;
            }

            return finalUsername;
        }
    }
}
