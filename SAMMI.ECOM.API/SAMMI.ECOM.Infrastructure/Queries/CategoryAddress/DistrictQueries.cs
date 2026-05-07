using Dapper;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Core.Models.ResponseModels.PagingList;
using SAMMI.ECOM.Domain.AggregateModels.AddressCategory;
using SAMMI.ECOM.Domain.DomainModels.CategoryAddress;
using SAMMI.ECOM.Domain.GlobalModels.Common;
using SAMMI.ECOM.Repository.GenericRepositories;

namespace SAMMI.ECOM.Infrastructure.Queries.CategoryAddress
{
    public interface IDistrictQueries : IQueryRepository
    {
        Task<IPagedList<DistrictDTO>> GetList(RequestFilterModel filterModel);
        Task<IEnumerable<SelectionItem>> GetSelectionList(RequestFilterModel? request);
        Task<DistrictDTO> GetById(int id);
    }
    public class DistrictQueries : QueryRepository<District>, IDistrictQueries
    {
        public DistrictQueries(SammiEcommerceContext context) : base(context)
        {
        }

        public async Task<DistrictDTO> GetById(int id)
        {
            return await WithDefaultTemplateAsync(
                (conn, sqlBuilder, sqlTemplate) =>
                {
                    sqlBuilder.Where("t1.Id = @id", new { id });
                    return conn.QueryFirstOrDefaultAsync<DistrictDTO>(sqlTemplate.RawSql, sqlTemplate.Parameters);
                }
            );
        }

        public Task<IPagedList<DistrictDTO>> GetList(RequestFilterModel filterModel)
        {
            return WithPagingTemplateAsync(
                (conn, sqlBuilder, sqlTemplate) =>
                {
                    sqlBuilder.LeftJoin("Province t2 ON t1.ProvinceId = t2.Id AND t2.IsDeleted = 0");
                    sqlBuilder.Select("t2.Name AS ProvinceName");
                    return conn.QueryAsync<DistrictDTO>(sqlTemplate.RawSql, sqlTemplate.Parameters);
                },
                filterModel);
        }

        //provinceId::4::eq
        public Task<IEnumerable<SelectionItem>> GetSelectionList(RequestFilterModel? request)
        {
            return WithDefaultTemplateAsync(
                (conn, sqlBuilder, sqlTemplate) =>
                {
                    sqlBuilder.Select("t1.Id as Value");
                    sqlBuilder.Select("t1.Name as Text");

                    if (request != null && request.Any("provinceId"))
                    {
                        int provinceId = int.Parse(request.Get("provinceId")?.ToString());
                        sqlBuilder.Where("t1.ProvinceId = @provinceId", new { provinceId });
                    }
                    return conn.QueryAsync<SelectionItem>(sqlTemplate.RawSql, sqlTemplate.Parameters);
                }, request
            );
        }
    }
}
