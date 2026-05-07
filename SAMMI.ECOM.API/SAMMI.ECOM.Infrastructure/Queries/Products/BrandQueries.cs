using Dapper;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Core.Models.ResponseModels.PagingList;
using SAMMI.ECOM.Domain.AggregateModels.Products;
using SAMMI.ECOM.Domain.DomainModels.Products;
using SAMMI.ECOM.Domain.Enums;
using SAMMI.ECOM.Domain.GlobalModels.Common;
using SAMMI.ECOM.Repository.GenericRepositories;
using SAMMI.ECOM.Utility;

namespace SAMMI.ECOM.Infrastructure.Queries.Brands
{
    public interface IBrandQueries : IQueryRepository
    {
        Task<IPagedList<BrandDTO>> GetList(RequestFilterModel filterModel);
        Task<IEnumerable<SelectionItem>> GetSelectionList(RequestFilterModel? request);
        Task<BrandDTO> GetById(int id);
        Task<IEnumerable<BrandDTO>> GetAll(RequestFilterModel? filterModel = null);
        Task<string?> GetCodeByLastId(CodeEnum? type = CodeEnum.Brand);
    }
    public class BrandQueries : QueryRepository<Brand>, IBrandQueries
    {
        public BrandQueries(SammiEcommerceContext context) : base(context)
        {
        }

        public Task<IEnumerable<BrandDTO>> GetAll(RequestFilterModel? filterModel = null)
        {
            return WithDefaultTemplateAsync(
                (conn, sqlBuilder, sqlTemplate) =>
                {
                    sqlBuilder.Select("t2.ImageUrl");
                    sqlBuilder.LeftJoin("Image t2 ON t1.ImageId = t2.Id AND t2.IsDeleted != 1");
                    return conn.QueryAsync<BrandDTO>(sqlTemplate.RawSql, sqlTemplate.Parameters);
                }, filterModel
            );
        }

        public async Task<BrandDTO> GetById(int id)
        {
            return await WithDefaultTemplateAsync(
                (conn, sqlBuilder, sqlTemplate) =>
                {
                    sqlBuilder.Select("t2.ImageUrl");
                    sqlBuilder.LeftJoin("Image t2 ON t1.ImageId = t2.Id AND t2.IsDeleted != 1");

                    sqlBuilder.Where("t1.Id = @id", new { id });
                    return conn.QueryFirstOrDefaultAsync<BrandDTO>(sqlTemplate.RawSql, sqlTemplate.Parameters);
                }
            );
        }

        public Task<IPagedList<BrandDTO>> GetList(RequestFilterModel filterModel)
        {
            return WithPagingTemplateAsync(
                (conn, sqlBuilder, sqlTemplate) =>
                {
                    sqlBuilder.Select("t2.ImageUrl");
                    sqlBuilder.LeftJoin("Image t2 ON t1.ImageId = t2.Id AND t2.IsDeleted != 1");
                    return conn.QueryAsync<BrandDTO>(sqlTemplate.RawSql, sqlTemplate.Parameters);
                },
                filterModel);
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

        public async Task<string?> GetCodeByLastId(CodeEnum? type = CodeEnum.Brand)
        {
            int idLast = 0;
            string code = type.GetDescription();
            idLast = await WithDefaultNoSelectTemplateAsync(
                async (conn, sqlBuilder, sqlTemplate) =>
                {
                    sqlBuilder.Select("CASE WHEN MAX(t1.Id) IS NOT NULL THEN  MAX(t1.Id) ELSE 0 END");
                    sqlBuilder.OrderDescBy("t1.Id");

                    return await conn.QueryFirstOrDefaultAsync<int>(sqlTemplate.RawSql, sqlTemplate.Parameters);
                }
                );

            return $"{code}{(idLast + 1).ToString("D6")}";
        }
    }
}
