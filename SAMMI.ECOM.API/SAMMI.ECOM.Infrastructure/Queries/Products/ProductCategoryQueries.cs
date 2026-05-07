using Dapper;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Core.Models.ResponseModels.PagingList;
using SAMMI.ECOM.Domain.AggregateModels.Products;
using SAMMI.ECOM.Domain.DomainModels.Products;
using SAMMI.ECOM.Domain.Enums;
using SAMMI.ECOM.Domain.GlobalModels.Common;
using SAMMI.ECOM.Repository.GenericRepositories;
using SAMMI.ECOM.Utility;

namespace SAMMI.ECOM.Infrastructure.Queries.ProductCategorys
{
    public interface IProductCategoryQueries : IQueryRepository
    {
        Task<IPagedList<ProductCategoryDTO>> GetList(RequestFilterModel filterModel);
        Task<IEnumerable<SelectionItem>> GetSelectionList(RequestFilterModel? request);
        Task<ProductCategoryDTO> GetById(int id);
        Task<IEnumerable<ProductCategoryDTO>> GetAll(RequestFilterModel? filterModel = null);
        Task<string?> GetCodeByLastId(CodeEnum? type = CodeEnum.ProductCategory);
    }
    public class ProductCategoryQueries : QueryRepository<ProductCategory>, IProductCategoryQueries
    {
        public ProductCategoryQueries(SammiEcommerceContext context) : base(context)
        {
        }

        public Task<IEnumerable<ProductCategoryDTO>> GetAll(RequestFilterModel? filterModel = null)
        {
            return WithDefaultTemplateAsync(
                (conn, sqlBuilder, sqlTemplate) =>
                {
                    sqlBuilder.Select("t2.Name AS ParentName");

                    sqlBuilder.LeftJoin("ProductCategory t2 ON t1.ParentId = t2.Id AND t2.IsDeleted != 1");
                    return conn.QueryAsync<ProductCategoryDTO>(sqlTemplate.RawSql, sqlTemplate.Parameters);
                }, filterModel
            );
        }

        public async Task<ProductCategoryDTO> GetById(int id)
        {
            return await WithDefaultTemplateAsync(
                (conn, sqlBuilder, sqlTemplate) =>
                {
                    sqlBuilder.Where("t1.Id = @id", new { id });
                    return conn.QueryFirstOrDefaultAsync<ProductCategoryDTO>(sqlTemplate.RawSql, sqlTemplate.Parameters);
                }
            );
        }

        public Task<IPagedList<ProductCategoryDTO>> GetList(RequestFilterModel filterModel)
        {
            return WithPagingTemplateAsync(
                (conn, sqlBuilder, sqlTemplate) =>
                {
                    sqlBuilder.Select("t2.Name AS ParentName");

                    sqlBuilder.LeftJoin("ProductCategory t2 ON t1.ParentId = t2.Id AND t2.IsDeleted != 1");
                    return conn.QueryAsync<ProductCategoryDTO>(sqlTemplate.RawSql, sqlTemplate.Parameters);
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

        public async Task<string?> GetCodeByLastId(CodeEnum? type = CodeEnum.ProductCategory)
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
