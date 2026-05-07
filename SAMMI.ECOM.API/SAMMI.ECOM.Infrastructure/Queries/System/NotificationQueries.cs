using Dapper;
using Org.BouncyCastle.Crypto.Modes.Gcm;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Core.Models.ResponseModels.PagingList;
using SAMMI.ECOM.Domain.AggregateModels.OrderBuy;
using SAMMI.ECOM.Domain.AggregateModels.System;
using SAMMI.ECOM.Domain.DomainModels.System;
using SAMMI.ECOM.Domain.GlobalModels.Common;
using SAMMI.ECOM.Repository.GenericRepositories;

namespace SAMMI.ECOM.Infrastructure.Queries.System
{
    public interface INotificationQueries : IQueryRepository
    {
        Task<IEnumerable<NotificationDTO>> GetAll(int userId);
        Task<NotificationDTO> GetById(int id);
    }
    public class NotificationQueries : QueryRepository<Notification>, INotificationQueries
    {
        public NotificationQueries(SammiEcommerceContext context) : base(context)
        {
        }

        public Task<IEnumerable<NotificationDTO>> GetAll(int userId)
        {
            return WithDefaultTemplateAsync(
                (conn, sqlBuilder, sqlTemplate) =>
                {
                    sqlBuilder.Where("t1.ReceiverId = @userid", new {userId});

                    sqlBuilder.OrderDescBy("t1.CreatedDate");
                    return conn.QueryAsync<NotificationDTO>(sqlTemplate.RawSql, sqlTemplate.Parameters);
                });
        }

        public async Task<NotificationDTO> GetById(int id)
        {
            return await WithDefaultTemplateAsync(
                (conn, sqlBuilder, sqlTemplate) =>
                {
                    sqlBuilder.Where("t1.Id = @id", new { id });
                    return conn.QueryFirstOrDefaultAsync<NotificationDTO>(sqlTemplate.RawSql, sqlTemplate.Parameters);
                }
            );
        }
    }
}
