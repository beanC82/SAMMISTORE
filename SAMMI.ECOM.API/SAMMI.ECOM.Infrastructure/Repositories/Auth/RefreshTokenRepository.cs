using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Core.Models.GlobalConfigs;
using SAMMI.ECOM.Domain.AggregateModels.System;
using SAMMI.ECOM.Repository.GenericRepositories;

namespace SAMMI.ECOM.Infrastructure.Repositories.Auth
{
    public interface IRefreshTokenRepository : ICrudRepository<RefreshToken>
    {
        Task<ActionResponse> MarkTokenExchanged(int tokenId);
        Task<ActionResponse> MakeAllInvalidInFamily(int userId);
    }
    public class RefreshTokenRepository : CrudRepository<RefreshToken>, IRefreshTokenRepository, IDisposable
    {
        private readonly SammiEcommerceContext _context;
        private readonly RefreshTokenProvideOptions _tokenProvideOptions;
        private bool _disposed;
        public RefreshTokenRepository(SammiEcommerceContext context,
            RefreshTokenProvideOptions tokenProvideOptions) : base(context)
        {
            _context = context;
            _tokenProvideOptions = tokenProvideOptions;
        }

        public void Dispose()
        {
            _disposed = true;
        }

        public async Task<ActionResponse> MakeAllInvalidInFamily(int userId)
        {
            var entities = DbSet.Where(x => x.UserId == userId);
            foreach (var entity in entities)
            {
                entity.IsInvalid = true;
            }
            await SaveChangeAsync();
            return ActionResponse.Success;
        }

        public Task<ActionResponse> MarkTokenExchanged(int tokenId)
        {
            var tokenEntity = DbSet.FindAsync(tokenId);
            if (tokenEntity.Result is not null)
            {
                tokenEntity.Result.IsExchanged = true;
            }

            var expiredToekns = DbSet.Where(x => x.ExpirationDateUtc <= DateTime.UtcNow.AddDays(0 - this._tokenProvideOptions.Expiration.Days));
            DbSet.RemoveRange(expiredToekns);
            return Task.FromResult(ActionResponse.Success);
        }
    }
}
