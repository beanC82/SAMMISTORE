using Dapper;
using Microsoft.Extensions.Configuration;
using SAMMI.ECOM.Core.Authorizations;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Core.Models.ResponseModels.PagingList;
using SAMMI.ECOM.Domain.AggregateModels.OrderBuy;
using SAMMI.ECOM.Domain.DomainModels.OrderBuy;
using SAMMI.ECOM.Domain.GlobalModels.Common;
using SAMMI.ECOM.Infrastructure.Services.Caching;
using SAMMI.ECOM.Repository.GenericRepositories;

namespace SAMMI.ECOM.Infrastructure.Queries.OrderBy
{
    public interface ICartDetailQueries : IQueryRepository
    {
        Task<IPagedList<CartDetailDTO>> GetList(RequestFilterModel filterModel);
        Task<IEnumerable<SelectionItem>> GetSelectionList(RequestFilterModel? request);
        Task<IEnumerable<CartDetailDTO>> GetAll(RequestFilterModel? filterModel = null);
        Task<CartDetailDTO> GetById(int id);
        Task<IEnumerable<CartDetailDTO>> GetMyCart();
        Task<IEnumerable<CartDetailDTO>> GetMyCart(List<int> ProductIds);
        Task CacheCart(int userId);
        Task RemoveCartCache(int userId);
    }
    public class CartDetailQueries : QueryRepository<CartDetail>, ICartDetailQueries
    {
        private readonly IRedisService<List<CartDetailDTO>>? _redisService;
        private readonly IConfiguration _config;
        public CartDetailQueries(SammiEcommerceContext context,
            IRedisService<List<CartDetailDTO>> redisService,
            IConfiguration config,
            UserIdentity identity) : base(context)
        {
            UserIdentity = identity;
            _redisService = redisService;
            _config = config;
        }
        private string GetCartKey(int userId) => $"{_config["RedisOptions:cart_key"]}{userId}";
        public async Task CacheCart(int userId)
        {
            if (_redisService == null || !_redisService.IsConnected())
                return;

            await _redisService.RemoveCache(GetCartKey(userId));

            var cartItems = (await GetMyCart()).ToList();
            if (cartItems != null && cartItems.Count() > 0)
            {
                await _redisService.SetCache(GetCartKey(userId), cartItems, TimeSpan.FromDays(10));
            }
        }

        public async Task RemoveCartCache(int userId)
        {
            if (_redisService == null || !_redisService.IsConnected())
                return;
            await _redisService.RemoveCache(GetCartKey(userId));
        }

        public Task<IEnumerable<CartDetailDTO>> GetAll(RequestFilterModel? filterModel = null)
        {
            return WithDefaultTemplateAsync(
                (conn, sqlBuilder, sqlTemplate) =>
                {
                    return conn.QueryAsync<CartDetailDTO>(sqlTemplate.RawSql, sqlTemplate.Parameters);
                }, filterModel);
        }

        public async Task<CartDetailDTO> GetById(int id)
        {
            return await WithDefaultTemplateAsync(
                (conn, sqlBuilder, sqlTemplate) =>
                {
                    sqlBuilder.Where("t1.Id = @id", new { id });
                    return conn.QueryFirstOrDefaultAsync<CartDetailDTO>(sqlTemplate.RawSql, sqlTemplate.Parameters);
                }
            );
        }

        public Task<IPagedList<CartDetailDTO>> GetList(RequestFilterModel filterModel)
        {
            return WithPagingTemplateAsync(
                (conn, sqlBuilder, sqlTemplate) =>
                {
                    return conn.QueryAsync<CartDetailDTO>(sqlTemplate.RawSql, sqlTemplate.Parameters);
                },
                filterModel);
        }

        public Task<IEnumerable<CartDetailDTO>> GetMyCart()
        {
            return WithDefaultTemplateAsync(
                (conn, sqlBuilder, sqlTemplate) =>
                {
                    sqlBuilder.Select("t3.Name AS ProductName, t3.StockQuantity, t3.Price");
                    sqlBuilder.Select($@"CASE
                                            WHEN t3.StartDate IS NOT NULL
                                            AND t3.EndDate IS NOT NULL
                                            AND NOW() >= t3.StartDate
                                            AND NOW() <= t3.EndDate
                                            THEN t3.Price * (1 - t3.Discount)
                                            ELSE t3.Price
                                        END AS NewPrice");
                    sqlBuilder.Select("t4.ImageUrl AS ProductImage");

                    sqlBuilder.InnerJoin("Cart t2 ON t1.CartId = t2.Id AND t2.IsDeleted != 1");
                    sqlBuilder.InnerJoin("Product t3 ON t1.ProductId = t3.Id AND t3.IsDeleted != 1");
                    sqlBuilder.LeftJoin(@"(SELECT pi.ProductId,
                                          i.ImageUrl
                                    FROM ProductImage pi
                                    INNER JOIN Image i ON pi.ImageId = i.Id AND i.IsDeleted != 1
                                    WHERE pi.IsDeleted != 1
                                    AND pi.DisplayOrder = (SELECT MIN(DisplayOrder) FROM ProductImage WHERE ProductId = pi.ProductId AND IsDeleted != 1)
                                    ) t4 ON t3.Id = t4.ProductId");
                    sqlBuilder.Where("t2.CustomerId = @userId", new { userId = UserIdentity.Id });

                    return conn.QueryAsync<CartDetailDTO>(sqlTemplate.RawSql, sqlTemplate.Parameters);
                });
        }

        public Task<IEnumerable<CartDetailDTO>> GetMyCart(List<int> ProductIds)
        {
            return WithDefaultTemplateAsync(
                (conn, sqlBuilder, sqlTemplate) =>
                {
                    sqlBuilder.Select("t3.Name AS ProductName, t3.StockQuantity, t3.Price");
                    sqlBuilder.Select($@"CASE
                                            WHEN t3.StartDate IS NOT NULL
                                            AND t3.EndDate IS NOT NULL
                                            AND NOW() >= t3.StartDate
                                            AND NOW() <= t3.EndDate
                                            THEN t3.Price * (1 - t3.Discount)
                                            ELSE t3.Price
                                        END AS NewPrice");
                    sqlBuilder.Select("t4.ImageUrl AS ProductImage");

                    sqlBuilder.InnerJoin("Cart t2 ON t1.CartId = t2.Id AND t2.IsDeleted != 1");
                    sqlBuilder.InnerJoin("Product t3 ON t1.ProductId = t3.Id AND t3.IsDeleted != 1");
                    sqlBuilder.LeftJoin(@"(SELECT pi.ProductId,
                                          i.ImageUrl
                                    FROM ProductImage pi
                                    INNER JOIN Image i ON pi.ImageId = i.Id AND i.IsDeleted != 1
                                    WHERE pi.IsDeleted != 1
                                    AND pi.DisplayOrder = (SELECT MIN(DisplayOrder) FROM ProductImage WHERE ProductId = pi.ProductId AND IsDeleted != 1)
                                    ) t4 ON t3.Id = t4.ProductId");
                    sqlBuilder.Where("t2.CustomerId = @userId", new { userId = UserIdentity.Id });
                    sqlBuilder.Where("t1.ProductId IN @productIds", new { productIds = ProductIds });

                    return conn.QueryAsync<CartDetailDTO>(sqlTemplate.RawSql, sqlTemplate.Parameters);
                });
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
