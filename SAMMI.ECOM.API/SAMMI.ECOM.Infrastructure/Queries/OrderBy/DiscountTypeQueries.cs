using Dapper;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Domain.AggregateModels.EventVoucher;
using SAMMI.ECOM.Domain.DomainModels.OrderBuy;
using SAMMI.ECOM.Domain.GlobalModels.Common;
using SAMMI.ECOM.Repository.GenericRepositories;

namespace SAMMI.ECOM.Infrastructure.Queries.OrderBy
{
    public interface IDiscountTypeQueries : IQueryRepository
    {
        Task<IEnumerable<SelectionItem>> GetSelectionList(RequestFilterModel? request);
        Task<IEnumerable<DiscountTypeDTO>> GetAll(RequestFilterModel? filterModel = null);
        Task<DiscountTypeDTO> GetById(int id);
    }
    public class DiscountTypeQueries : QueryRepository<DiscountType>, IDiscountTypeQueries
    {
        public DiscountTypeQueries(SammiEcommerceContext context) : base(context)
        {
        }

        public Task<IEnumerable<DiscountTypeDTO>> GetAll(RequestFilterModel? filterModel = null)
        {
            return WithDefaultTemplateAsync(
                (conn, sqlBuilder, sqlTemplate) =>
                {
                    return conn.QueryAsync<DiscountTypeDTO>(sqlTemplate.RawSql, sqlTemplate.Parameters);
                }, filterModel);
        }

        public async Task<DiscountTypeDTO> GetById(int id)
        {
            return await WithDefaultTemplateAsync(
                (conn, sqlBuilder, sqlTemplate) =>
                {
                    sqlBuilder.Where("t1.Id = @id", new { id });
                    return conn.QueryFirstOrDefaultAsync<DiscountTypeDTO>(sqlTemplate.RawSql, sqlTemplate.Parameters);
                }
            );
        }

        public Task<IEnumerable<SelectionItem>> GetSelectionList(RequestFilterModel? request)
        {
            return WithDefaultTemplateAsync(
                (conn, sqlBuilder, sqlTemplate) =>
                {
                    sqlBuilder.Select("t1.Id as Value");
                    sqlBuilder.Select("t1.Name as Text");

                    return conn.QueryAsync<SelectionItem>(sqlTemplate.RawSql, sqlTemplate.Parameters);
                }, request
            );
        }
    }
}
