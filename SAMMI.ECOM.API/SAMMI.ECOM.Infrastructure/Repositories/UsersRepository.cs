using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Core.Utillity;
using SAMMI.ECOM.Domain.AggregateModels.Others;
using SAMMI.ECOM.Domain.DomainModels.Users;
using SAMMI.ECOM.Domain.Enums;
using SAMMI.ECOM.Infrastructure.Services.Auth;
using SAMMI.ECOM.Repository.GenericRepositories;

namespace SAMMI.ECOM.Infrastructure.Repositories
{
    public interface IUsersRepository : ICrudRepository<User>
    {
        Task<bool> IsExistCode(string code, int? id);
        Task<bool> IsExistUsername(string username, int? id);
        Task<bool> IsExistEmail(string email, int? id, TypeUserEnum? type = null);
        Task<bool> IsExistPhone(string phone, int? id, TypeUserEnum? type = null);
        Task SetSecurityStampAsync(User user, string stamp,
            CancellationToken cancellationToken = default(CancellationToken));

        Task SetPasswordHashAsync(User user, string passwordHash,
            CancellationToken cancellationToken = default(CancellationToken));
        Task<User?> FindByUserNameAsync(string userName);
        Task<UserDTO> GetUserById(int id);
        Task<bool> IsExistedType(int id, TypeUserEnum? type = TypeUserEnum.Employee);
        Task<User> GetByEmail(string email);
        Task<ActionResponse> VerifyToken(string token);
        Task<int> GetCustomerCount();

        Task<ActionResponse> IsExistAnotherTable(int id, TypeUserEnum type = TypeUserEnum.Customer);
        Task<List<int>> GetUserByRole(int roleId);
    }
    public class UsersRepository : CrudRepository<User>, IUsersRepository, IDisposable
    {
        private readonly SammiEcommerceContext _context;
        private readonly IMapper _mapper;
        private bool _disposed;
        public UsersRepository(SammiEcommerceContext context,
            IMapper mapper) : base(context)
        {
            _context = context;
            _mapper = mapper;
        }

        public void Dispose()
        {
            _disposed = true;
        }

        public async Task<bool> IsExistCode(string code, int? id)
        {
            return await _context.Users.AnyAsync(x => x.Code.Trim() == code.Trim() && x.Id != id && x.IsDeleted != true);
        }

        public async Task<bool> IsExistEmail(string email, int? id, TypeUserEnum? type = null)
        {
            var result = _context.Users.Where(x => x.Email.Trim() == email.Trim() && x.Id != id && x.IsDeleted != true);
            if (type != null)
            {
                result = result.Where(x => x.Type == type.ToString());
            }
            return await result.CountAsync() > 0;
        }

        public async Task<bool> IsExistPhone(string phone, int? id, TypeUserEnum? type = null)
        {
            var result = _context.Users.Where(x => x.Phone.Trim() == phone.Trim() && x.Id != id && x.IsDeleted != true);
            if (type != null)
            {
                result = result.Where(x => x.Type == type.ToString());
            }
            return await result.CountAsync() > 0;
        }

        public async Task<bool> IsExistUsername(string username, int? id)
        {
            return await _context.Users.AnyAsync(x => x.Username.Trim() == username.Trim() && x.Id != id && x.IsDeleted != true);
        }

        /// <summary>
        /// Sets the provided security <paramref name="stamp"/> for the specified <paramref name="user"/>.
        /// </summary>
        /// <param name="user">The user whose security stamp should be set.</param>
        /// <param name="stamp">The security stamp to set.</param>
        /// <param name="cancellationToken">The <see cref="CancellationToken"/> used to propagate notifications that the operation should be canceled.</param>
        /// <returns>The <see cref="Task"/> that represents the asynchronous operation.</returns>
        public virtual Task SetSecurityStampAsync(User user, string stamp,
            CancellationToken cancellationToken = default(CancellationToken))
        {
            cancellationToken.ThrowIfCancellationRequested();
            ThrowIfDisposed();
            if (user == null)
            {
                throw new ArgumentNullException(nameof(user));
            }

            if (stamp == null)
            {
                throw new ArgumentNullException(nameof(stamp));
            }

            user.SecurityStamp = stamp;
            return Task.CompletedTask;
        }

        /// <summary>
        /// Sets the password hash for a user.
        /// </summary>
        /// <param name="user">The user to set the password hash for.</param>
        /// <param name="passwordHash">The password hash to set.</param>
        /// <param name="cancellationToken">The <see cref="CancellationToken"/> used to propagate notifications that the operation should be canceled.</param>
        /// <returns>The <see cref="Task"/> that represents the asynchronous operation.</returns>
        public Task SetPasswordHashAsync(User user, string passwordHash,
            CancellationToken cancellationToken = default(CancellationToken))
        {
            cancellationToken.ThrowIfCancellationRequested();
            ThrowIfDisposed();
            if (user == null)
            {
                throw new ArgumentNullException(nameof(user));
            }

            user.Password = passwordHash;
            return Task.CompletedTask;
        }

        /// <summary>
        /// Throws if this class has been disposed.
        /// </summary>
        protected void ThrowIfDisposed()
        {
            if (_disposed)
            {
                throw new ObjectDisposedException(GetType().Name);
            }
        }

        public async Task<User?> FindByUserNameAsync(string userName)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(x => x.Username.ToLower().Equals(userName.ToLower())
                    && !x.IsDeleted);

            if (user == null)
            {
                user = await _context.Users
                .FirstOrDefaultAsync(x => x.Email.ToLower().Equals(userName.ToLower())
                    && !x.IsDeleted);
            }
            return user;
        }

        public async Task<UserDTO> GetUserById(int id)
        {
            return _mapper.Map<UserDTO>(await GetByIdAsync(id));
        }

        public async Task<bool> IsExistedType(int id, TypeUserEnum? type = TypeUserEnum.Employee)
        {
            return await DbSet.SingleOrDefaultAsync(x => x.Id == id && x.Type == type.ToString() && x.IsDeleted != true) != null;
        }

        public async Task<User> GetByEmail(string email)
        {
            return await DbSet.SingleOrDefaultAsync(x => x.Email == email && x.IsDeleted != true);
        }

        public async Task<ActionResponse> VerifyToken(string token)
        {
            var actionResponse = new ActionResponse();
            var user = await DbSet.SingleOrDefaultAsync(x => x.VerifyToken == token && x.IsDeleted != true);
            if(user == null)
            {
                actionResponse.AddError("Liên kết xác nhận không hợp lệ. Vui lòng kiểm tra lại hoặc yêu cầu gửi lại email xác nhận.");
                return actionResponse;
            }
            if(user.IsVerify == true)
            {
                actionResponse.AddError("Liên kết xác nhận đã được sử dụng. Vui lòng đăng nhập hoặc yêu cầu gửi lại email xác nhận nếu cần.");
                return actionResponse;
            }
            if (DateTime.Now > user.VerifiedAt.Value.AddHours(24))
            {
                actionResponse.AddError("Liên kết xác nhận đã hết hạn. Vui lòng yêu cầu gửi lại email xác nhận để nhận liên kết mới.");
                return actionResponse;
            }

            user.IsVerify = true;
            actionResponse.Combine(await UpdateAndSave(user));
            return actionResponse;
        }

        public Task<int> GetCustomerCount()
        {
            return DbSet.Where(x => x.Type == TypeUserEnum.Customer.ToString() && x.IsDeleted != true).CountAsync();
        }

        public async Task<ActionResponse> IsExistAnotherTable(int id, TypeUserEnum type = TypeUserEnum.Customer)
        {
            var actionRes = new ActionResponse();
            bool result = false;
            string errorMessage = "Không thể xóa người dùng! ";
            if (type == TypeUserEnum.Customer)
            {
                result = await _context.CustomerAddresses.Where(x => x.CustomerId == id).CountAsync() > 1 ? true : false;
                if (result)
                {
                    actionRes.AddError($"{errorMessage}Người dùng đã có địa chỉ liên quan");
                    return actionRes;
                }

                result = await _context.FavouriteProducts.AnyAsync(x => x.CustomerId == id);
                if (result)
                {
                    actionRes.AddError($"{errorMessage}Người dùng đã có sản phẩm yêu thích");
                    return actionRes;
                }

                result = await _context.MyVouchers.AnyAsync(x => x.CustomerId == id);
                if (result)
                {
                    actionRes.AddError($"{errorMessage}Người dùng đã có voucher liên quan");
                    return actionRes;
                }

                result = await _context.Orders.AnyAsync(x => x.CustomerId == id);
                if (result)
                {
                    actionRes.AddError($"{errorMessage}Người dùng đã có đơn hàng liên quan");
                    return actionRes;
                }

                result = await _context.Reviews.AnyAsync(x => x.UserId == id);
                if (result)
                {
                    actionRes.AddError($"{errorMessage}Người dùng đã có đánh giá liên quan");
                    return actionRes;
                }
            }

            result = await _context.PurchaseOrders.AnyAsync(x => x.SupplierId == id || x.EmployeeId == id);
            if (result)
            {
                actionRes.AddError($"{errorMessage}Người dùng đã có đơn nhập hàng liên quan");
                return actionRes;
            }

            return actionRes;
        }

        public Task<List<int>> GetUserByRole(int roleId)
        {
            return DbSet.Where(x => x.RoleId == roleId && x.IsDeleted != true)
                .Select(x => x.Id).ToListAsync();
        }
    }
}
