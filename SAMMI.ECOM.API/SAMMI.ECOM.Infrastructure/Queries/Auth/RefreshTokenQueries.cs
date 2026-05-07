using Dapper;
using SAMMI.ECOM.Domain.AggregateModels.System;
using SAMMI.ECOM.Domain.DomainModels.Auth;
using SAMMI.ECOM.Repository.GenericRepositories;

namespace SAMMI.ECOM.Infrastructure.Queries.Auth
{
    public enum ValidationRefreshTokenResult
    {
        Valid,
        Invalid,
        Expired,
        Exchanged
    }
    public interface IRefreshTokenQueries : IQueryRepository
    {
        Task<(ValidationRefreshTokenResult Result, int TokenId)> ValidateRefreshToken(string refreshToken);
    }
    public class RefreshTokenQueries : QueryRepository<RefreshToken>, IRefreshTokenQueries
    {
        public RefreshTokenQueries(SammiEcommerceContext context) : base(context)
        {
        }

        public async Task<(ValidationRefreshTokenResult Result, int TokenId)> ValidateRefreshToken(string refreshToken)
        {
            var refreshTokenEntity = await WithDefaultTemplateAsync(
                (conn, sqlBuilder, sqlTemplate) =>
                {
                    sqlBuilder.Where("t1.Token = @refreshToken", new { refreshToken });

                    return conn.QueryFirstOrDefaultAsync<RefreshTokenDTO>(sqlTemplate.RawSql, sqlTemplate.Parameters);
                });

            if (refreshTokenEntity is null || refreshTokenEntity.IsInvalid)
            {
                return (ValidationRefreshTokenResult.Invalid, 0);
            }

            if (refreshTokenEntity.ExpirationDateUtc < DateTime.UtcNow)
            {
                return (ValidationRefreshTokenResult.Expired, 0);
            }

            if (refreshTokenEntity.IsExchanged)
            {
                return (ValidationRefreshTokenResult.Exchanged, 0);
            }

            return (ValidationRefreshTokenResult.Valid, refreshTokenEntity.Id);
        }
    }
}
