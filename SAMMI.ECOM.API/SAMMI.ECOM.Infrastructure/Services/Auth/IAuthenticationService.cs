using SAMMI.ECOM.Domain.AggregateModels.Others;
using SAMMI.ECOM.Domain.DomainModels.Users;
using SAMMI.ECOM.Infrastructure.Services.Auth.Responses;

namespace SAMMI.ECOM.Infrastructure.Services.Auth
{
    public interface IAuthenticationService<T>
    {
        Task<UserIdentityResult> ValidateUserAsync(User user);
        Task<UserIdentityResult> ValidatePassword(string password);
        Task<T> FindByUserNameAsync(string name);
        UserDTO? FindById(string id);
        string EncryptPassword(string rawPassword);
        Task<SignInResult> PasswordSignInAsync(string? userName, string? password, bool? isPersistent, bool lockoutOnFailure);
        Task<UserIdentityResult> ChangePassword(string userName, string oldPassword, string newPassword);
        Task<UserIdentityResult> ChangePasswordUser(string userName, string newPassword);
        string CreateVerifyToken();
    }
}
