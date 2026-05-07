using Microsoft.Extensions.Logging;
using SAMMI.ECOM.Core.Authorizations;
using SAMMI.ECOM.Core.Models.GlobalConfigs;
using SAMMI.ECOM.Domain.AggregateModels.Others;
using SAMMI.ECOM.Domain.DomainModels.Users;
using SAMMI.ECOM.Infrastructure.Queries;
using SAMMI.ECOM.Infrastructure.Repositories;
using SAMMI.ECOM.Infrastructure.Services.Auth.Helpers;
using SAMMI.ECOM.Infrastructure.Services.Auth.Helpers.PasswordVerification;
using SAMMI.ECOM.Infrastructure.Services.Auth.Responses;
using System.Security.Cryptography;

namespace SAMMI.ECOM.Infrastructure.Services.Auth
{
    public class EFAuthenticationService : IAuthenticationService<User>
    {
        private readonly IUsersRepository _userIdentityRepository;
        private readonly IUsersQueries _userQueries;

        private readonly ILogger<EFAuthenticationService> _logger;
        private readonly PasswordOptions _passwordOptions;
        private static readonly RandomNumberGenerator _rng = RandomNumberGenerator.Create();
        private readonly AccessTokenProvideOptions _tokenProvideOptions;
        public IdentityErrorDescriber Describer { get; private set; }

        /// <summary>
        /// The cancellation token used to cancel operations.
        /// </summary>
        protected virtual CancellationToken CancellationToken => CancellationToken.None;

        /// <summary>
        /// The <see cref="IPasswordHasher{User}"/> used to hash passwords.
        /// </summary>
        public IPasswordHasher<User> PasswordHasher { get; set; }

        public PasswordValidator<User> PasswordValidator { get; set; }

        public EFAuthenticationService(IUsersRepository userIdentityRepository,
            IUsersQueries userQueries,
            IPasswordHasher<User> passwordHasher,
            ILogger<EFAuthenticationService> logger,
            PasswordOptions passwordOptions,
            AccessTokenProvideOptions tokenProviderOptions)
        {
            _userIdentityRepository = userIdentityRepository;
            _userQueries = userQueries;
            _logger = logger;
            _passwordOptions = passwordOptions;
            _tokenProvideOptions = tokenProviderOptions;
            PasswordHasher = passwordHasher;
            PasswordValidator = new PasswordValidator<User>(_passwordOptions);
            Describer = new IdentityErrorDescriber();
        }

        /// <summary>
        /// Returns a flag indicating whether the given <paramref name="password"/> is valid for the
        /// specified <paramref name="user"/>.
        /// </summary>
        /// <param name="user">The user whose password should be validated.</param>
        /// <param name="password">The password to validate</param>
        /// <returns>The <see cref="Task"/> that represents the asynchronous operation, containing true if
        /// the specified <paramref name="password" /> matches the one store for the <paramref name="user"/>,
        /// otherwise false.</returns>
        private async Task<bool> CheckPasswordAsync(User user, string password)
        {
            if (user is null)
            {
                return false;
            }

            var result = PasswordHasher.VerifyHashedPassword(user, user.Password, password);
            if (result == PasswordVerificationResult.SuccessRehashNeeded)
            {
                await UpdatePasswordHash(user, password, validatePassword: false);
            }

            var success = result != PasswordVerificationResult.Failed;
            if (!success)
            {
                _logger.LogWarning(0, "Invalid password for user {userId}.", user.Id);
            }

            return success;
        }

        /// <summary>
        /// Updates a user's password hash.
        /// </summary>
        /// <param name="user">The user.</param>
        /// <param name="newPassword">The new password.</param>
        /// <param name="validatePassword">Whether to validate the password.</param>
        /// <returns>Whether the password has was successfully updated.</returns>
        private async Task<UserIdentityResult> UpdatePasswordHash(User user, string newPassword,
            bool validatePassword = true)
        {
            if (validatePassword)
            {
                var validate = await ValidatePasswordAsync(user, newPassword);
                if (!validate.Succeeded)
                {
                    return validate;
                }
            }

            var hash = newPassword != null ? PasswordHasher.HashPassword(newPassword) : null;
            await _userIdentityRepository.SetPasswordHashAsync(user, hash, CancellationToken);
            await _userIdentityRepository.SetSecurityStampAsync(user, NewSecurityStamp(), CancellationToken);
            return UserIdentityResult.Success;
        }

        private static string NewSecurityStamp()
        {
            byte[] bytes = new byte[20];
            _rng.GetBytes(bytes);
            return Base32.ToBase32(bytes);
        }

        /// <summary>
        /// Should return <see cref="Microsoft.AspNetCore.Identity.IdentityResult.Success"/> if validation is successful. This is
        /// called before updating the password hash.
        /// </summary>
        /// <param name="user">The user.</param>
        /// <param name="password">The password.</param>
        /// <returns>A <see cref="Microsoft.AspNetCore.Identity.IdentityResult"/> representing whether validation was successful.</returns>
        protected async Task<UserIdentityResult> ValidatePasswordAsync(User user, string password)
        {
            var errors = new List<UserIdentityError>();

            var result = await PasswordValidator.ValidateAsync(password);
            if (!result.Succeeded)
            {
                errors.AddRange(result.Errors);
            }

            if (errors.Count > 0)
            {
                _logger.LogWarning(14, "User {userId} password validation failed: {errors}.", user.Id,
                    string.Join(";", errors.Select(e => e.Code)));
                return UserIdentityResult.Failed(errors.ToArray());
            }

            return UserIdentityResult.Success;
        }

        public Task<User> FindByUserNameAsync(string userName)
        {
            return _userIdentityRepository.FindByUserNameAsync(userName);
        }

        public async Task<SignInResult> PasswordSignInAsync(string? userName, string? password, bool? isPersistent,
            bool lockoutOnFailure)
        {
            if (string.IsNullOrWhiteSpace(userName)) return SignInResult.UserNotExisted;

            var user = await _userIdentityRepository.FindByUserNameAsync(userName);
            if (user is null || !user.IsActive)
            {
                return SignInResult.UserNotExisted;
            }

            if(user.IsVerify != true)
            {
                return SignInResult.NotVerify;
            }

            if (user.IsLock)
            {
                return SignInResult.LockedOut;
            }

            return await PasswordSignInAsync(user, password, isPersistent, lockoutOnFailure);
        }

        public async Task<SignInResult> PasswordSignInAsync(User user, string? password,
            bool? isPersistent, bool lockoutOnFailure)
        {
            if (user is null)
            {
                throw new ArgumentNullException(nameof(user));
            }

            var attempt = await CheckPasswordSignInAsync(user, password, lockoutOnFailure);
            return attempt;
        }

        /// <summary>
        /// Attempts a password sign in for a user.
        /// </summary>
        /// <param name="user">The user to sign in.</param>
        /// <param name="password">The password to attempt to sign in with.</param>
        /// <param name="lockoutOnFailure">Flag indicating if the user account should be locked if the sign in fails.</param>
        /// <returns>The task object representing the asynchronous operation containing the <see name="SignInResult"/>
        /// for the sign-in attempt.</returns>
        /// <returns></returns>
        public async Task<SignInResult> CheckPasswordSignInAsync(User user, string? password, bool lockoutOnFailure)
        {
            //return SignInResult.Success;
            if (user is null)
            {
                throw new ArgumentNullException(nameof(user));
            }

            var error = await PreSignInCheck(user);
            if (error != null)
            {
                return error;
            }

            if (await CheckPasswordAsync(user, password))
            {
                return SignInResult.Success;
            }

            _logger.LogWarning(2, "User {userId} failed to provide the correct password.", user.Id);
            return SignInResult.Failed;
        }

        /// <summary>
        /// Used to ensure that a user is allowed to sign in.
        /// </summary>
        /// <param name="user">The user</param>
        /// <returns>Null if the user should be allowed to sign in, otherwise the SignInResult why they should be denied.</returns>
        protected virtual async Task<SignInResult> PreSignInCheck(User user)
        {
            if (!await CanSignInAsync(user))
            {
                return SignInResult.NotAllowed;
            }

            if (user.IsLock)
            {
                return SignInResult.LockedOut;
            }

            return null;
        }

        /// <summary>
        /// Returns a flag indicating whether the specified user can sign in.
        /// </summary>
        /// <param name="user">The user whose sign-in status should be returned.</param>
        /// <returns>
        /// The task object representing the asynchronous operation, containing a flag that is true
        /// if the specified user can sign-in, otherwise false.
        /// </returns>
        public virtual async Task<bool> CanSignInAsync(User user)
        {
            //if (Options.SignIn.RequireConfirmedEmail && !(await UserManager.IsEmailConfirmedAsync(user)))
            //{
            //    Logger.LogWarning(0, "User {userId} cannot sign in without a confirmed email.", await UserManager.GetUserIdAsync(user));
            //    return false;
            //}
            //if (Options.SignIn.RequireConfirmedPhoneNumber && !(await UserManager.IsPhoneNumberConfirmedAsync(user)))
            //{
            //    Logger.LogWarning(1, "User {userId} cannot sign in without a confirmed phone number.", await UserManager.GetUserIdAsync(user));
            //    return false;
            //}

            return true;
        }


        public async Task<UserIdentityResult> ChangePassword(string userName, string oldPassword, string newPassword)
        {
            var user = await _userIdentityRepository.FindByUserNameAsync(userName);
            if (user == null)
            {
                return UserIdentityResult.Failed();
            }

            if (!await CheckPasswordAsync(user, oldPassword))
            {
                return UserIdentityResult.Failed(Describer.PasswordMismatch());
            }

            var result = PasswordHasher.VerifyHashedPassword(user, user.Password, oldPassword);
            if (result == PasswordVerificationResult.SuccessRehashNeeded ||
                result == PasswordVerificationResult.Success)
            {
                var updateResponse = await UpdatePasswordHash(user, newPassword, validatePassword: false);
                if (updateResponse.Succeeded)
                {
                    var updateUserResp = await _userIdentityRepository.UpdateAndSave(user);
                    return updateUserResp.IsSuccess ? UserIdentityResult.Success : UserIdentityResult.Failed();
                }
            }

            return UserIdentityResult.Failed();
        }

        public async Task<UserIdentityResult> ChangePasswordUser(string userName, string newPassword)
        {
            var user = await _userIdentityRepository.FindByUserNameAsync(userName);
            if (user is null)
            {
                return UserIdentityResult.Failed();
            }

            var updateResponse = await UpdatePasswordHash(user, newPassword, validatePassword: false);
            if (updateResponse.Succeeded)
            {
                var updateUserResp = await _userIdentityRepository.UpdateAndSave(user);
                return updateUserResp.IsSuccess ? UserIdentityResult.Success : UserIdentityResult.Failed();
            }

            return UserIdentityResult.Failed();
        }

        /// <summary>
        /// Creates the specified <paramref name="user"/> in the backing store with no password,
        /// as an asynchronous operation.
        /// </summary>
        /// <param name="user">The user to create.</param>
        /// <returns>
        /// The <see cref="Task"/> that represents the asynchronous operation, containing the <see cref="UserIdentityResult"/>
        /// of the operation.
        /// </returns>
        public async Task<UserIdentityResult> CreateUser(User user)
        {
            await UpdateSecurityStampInternal(user);
            var result = await ValidateUserAsync(user);

            if (!result.Succeeded)
            {
                return result;
            }

            user.IdentityGuid = Guid.NewGuid().ToString();
            user.Username = NormalizeUserName(user.Username);

            var persistentResponse = await _userIdentityRepository.CreateAndSave(user);

            if (persistentResponse.IsSuccess)
            {
                return UserIdentityResult.Success;
            }

            return UserIdentityResult.Failed(Describer.PersistentError(persistentResponse.Message));
        }

        public string EncryptPassword(string password)
        {
            return PasswordHasher.HashPassword(password);
        }

        /// <summary>
        /// Should return <see cref="Microsoft.AspNetCore.Identity.IdentityResult.Success"/> if validation is successful. This is
        /// called before saving the user via Create or Update.
        /// </summary>
        /// <param name="user">The user</param>
        /// <returns>A <see cref="Microsoft.AspNetCore.Identity.IdentityResult"/> representing whether validation was successful.</returns>
        public async Task<UserIdentityResult> ValidateUserAsync(User user)
        {
            var errors = new List<UserIdentityError>();
            if (string.IsNullOrWhiteSpace(user.Username))
            {
                errors.Add(Describer.InvalidUserName(user.Username));
            }
            else
            {
                var owner = await _userIdentityRepository.FindByUserNameAsync(user.Username);
                if (owner is not null &&
                    !string.Equals(owner.Id, user.Id))
                {
                    errors.Add(Describer.DuplicateUserName(user.Username));
                }
            }

            if (!string.IsNullOrEmpty(user.Password))
            {
                var validPassword = await ValidatePasswordAsync(user, user.Password);
                if (validPassword.Errors.Any())
                {
                    errors.AddRange(validPassword.Errors);
                }
            }

            if (errors.Count > 0)
            {
                _logger.LogWarning(13, "User {userId} validation failed: {errors}.", user.Id,
                    string.Join(";", errors.Select(e => e.Code)));
                return UserIdentityResult.Failed(errors.ToArray());
            }

            return UserIdentityResult.Success;
        }

        // Update the security stamp if the store supports it
        private async Task UpdateSecurityStampInternal(User user)
        {
            await _userIdentityRepository.SetSecurityStampAsync(user, NewSecurityStamp(), CancellationToken);
        }

        public virtual string NormalizeUserName(string key)
        {
            return key?.Normalize().ToUpperInvariant() ?? string.Empty;
        }

        public UserDTO? FindById(string id)
        {
            return default;
        }

        public async Task<UserIdentityResult> ValidatePassword(string password)
        {
            var errors = new List<UserIdentityError>();

            var result = await PasswordValidator.ValidateAsync(password);
            if (!result.Succeeded)
            {
                errors.AddRange(result.Errors);
            }

            if (errors.Count > 0)
            {
                _logger.LogWarning(14, "Password validation failed: {errors}.",
                    string.Join(";", errors.Select(e => e.Code)));
                return UserIdentityResult.Failed(errors.ToArray());
            }

            return UserIdentityResult.Success;
        }

        public string CreateVerifyToken()
        {
            var salt = new byte[128 / 8];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(salt);
            }
            var token = Convert.ToBase64String(salt)
                .Replace("+", "-")
                .Replace("/", "_")
                .Replace("=", "");
            return token;
        }
    }
}