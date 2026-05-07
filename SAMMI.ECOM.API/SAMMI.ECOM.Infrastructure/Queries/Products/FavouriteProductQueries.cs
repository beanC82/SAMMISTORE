using Dapper;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Core.Models.ResponseModels.PagingList;
using SAMMI.ECOM.Domain.AggregateModels.Others;
using SAMMI.ECOM.Domain.AggregateModels.Products;
using SAMMI.ECOM.Domain.DomainModels.Products;
using SAMMI.ECOM.Domain.Enums;
using SAMMI.ECOM.Domain.GlobalModels.Common;
using SAMMI.ECOM.Repository.GenericRepositories;
using SAMMI.ECOM.Utility;

namespace SAMMI.ECOM.Infrastructure.Queries.FavouriteProducts
{
    public interface IFavouriteProductQueries : IQueryRepository
    {
        Task<IPagedList<FavouriteProductDTO>> GetList(RequestFilterModel filterModel);
        Task<FavouriteProductDTO> GetById(int id);
        Task<IEnumerable<FavouriteProductDTO>> GetAll(int customerId, RequestFilterModel? filterModel = null);
    }
    public class FavouriteProductQueries : QueryRepository<FavouriteProduct>, IFavouriteProductQueries
    {
        public FavouriteProductQueries(SammiEcommerceContext context) : base(context)
        {
        }

        public Task<IEnumerable<FavouriteProductDTO>> GetAll(int customerId, RequestFilterModel? filterModel = null)
        {
            return WithDefaultTemplateAsync(
                (conn, sqlBuilder, sqlTemplate) =>
                {
                    sqlBuilder.Select("t2.Name AS ProductName, t2.StockQuantity, t2.Price");
                    sqlBuilder.Select($@"CASE
                                            WHEN t2.StartDate IS NOT NULL
                                            AND t2.EndDate IS NOT NULL
                                            AND NOW() >= t2.StartDate
                                            AND NOW() <= t2.EndDate
                                            THEN t2.Price * (1 - t2.Discount)
                                            ELSE t2.Price
                                        END AS NewPrice");
                    sqlBuilder.Select("t3.ImageUrl AS ProductImage");

                    sqlBuilder.InnerJoin("Product t2 ON t1.ProductId = t2.Id AND t2.IsDeleted != 1");
                    sqlBuilder.LeftJoin(@"(SELECT pi.ProductId,
                                          i.ImageUrl
                                    FROM ProductImage pi
                                    INNER JOIN Image i ON pi.ImageId = i.Id AND i.IsDeleted != 1
                                    WHERE pi.IsDeleted != 1
                                    AND pi.DisplayOrder = (SELECT MIN(DisplayOrder) FROM ProductImage WHERE ProductId = pi.ProductId AND IsDeleted != 1)
                                    ) t3 ON t2.Id = t3.ProductId");

                    sqlBuilder.Where("t1.CustomerId = @customerId", new {customerId});

                    return conn.QueryAsync<FavouriteProductDTO>(sqlTemplate.RawSql, sqlTemplate.Parameters);
                }, filterModel
            );
        }

        public async Task<FavouriteProductDTO> GetById(int id)
        {
            return await WithDefaultTemplateAsync(
                (conn, sqlBuilder, sqlTemplate) =>
                {
                    sqlBuilder.Where("t1.Id = @id", new { id });
                    return conn.QueryFirstOrDefaultAsync<FavouriteProductDTO>(sqlTemplate.RawSql, sqlTemplate.Parameters);
                }
            );
        }

        public Task<IPagedList<FavouriteProductDTO>> GetList(RequestFilterModel filterModel)
        {
            return WithPagingTemplateAsync(
                (conn, sqlBuilder, sqlTemplate) =>
                {
                    return conn.QueryAsync<FavouriteProductDTO>(sqlTemplate.RawSql, sqlTemplate.Parameters);
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
    }
}
