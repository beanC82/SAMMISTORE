using Dapper;
using SAMMI.ECOM.Core.Enums;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Core.Models.RequestModels.QueryParams;
using SAMMI.ECOM.Core.Models.ResponseModels.PagingList;
using SAMMI.ECOM.Domain.AggregateModels.OrderBuy;
using SAMMI.ECOM.Domain.DomainModels.OrderBuy;
using SAMMI.ECOM.Domain.GlobalModels.Common;
using SAMMI.ECOM.Repository.GenericRepositories;

namespace SAMMI.ECOM.Infrastructure.Queries.OrderBy
{
    public interface IReviewQueries : IQueryRepository
    {
        Task<IPagedList<ReviewDTO>> GetList(ReviewFilterModel filterModel);
        Task<IEnumerable<SelectionItem>> GetSelectionList(RequestFilterModel? request);
        Task<IEnumerable<ReviewDTO>> GetAll(RequestFilterModel? filterModel = null);
        Task<ReviewDTO> GetById(int id);
        Task<OverallRatingDTO> GetTotalOverall(int productId);
    }
    public class ReviewQueries : QueryRepository<Review>, IReviewQueries
    {
        public ReviewQueries(SammiEcommerceContext context) : base(context)
        {
        }

        public Task<IEnumerable<ReviewDTO>> GetAll(RequestFilterModel? filterModel = null)
        {
            return WithDefaultTemplateAsync(
                (conn, sqlBuilder, sqlTemplate) =>
                {
                    return conn.QueryAsync<ReviewDTO>(sqlTemplate.RawSql, sqlTemplate.Parameters);
                }, filterModel);
        }

        public async Task<ReviewDTO> GetById(int id)
        {
            return await WithDefaultTemplateAsync(
                (conn, sqlBuilder, sqlTemplate) =>
                {
                    sqlBuilder.Select("t2.FullName AS CustomerName");
                    sqlBuilder.Select("t3.ImageUrl");
                    sqlBuilder.Select("t4.ImageUrl AS CustomerImage");

                    sqlBuilder.Join("Users t2 ON t1.UserId = t2.Id AND t2.IsDeleted != 1");
                    sqlBuilder.LeftJoin("Image t3 ON t1.ImageId = t3.Id AND t3.IsDeleted != 1");
                    sqlBuilder.LeftJoin("Image t4 ON t2.AvatarId = t4.Id AND t4.IsDeleted != 1");

                    sqlBuilder.Where("t1.Id = @id", new { id });
                    return conn.QueryFirstOrDefaultAsync<ReviewDTO>(sqlTemplate.RawSql, sqlTemplate.Parameters);
                }
            );
        }

        public Task<IPagedList<ReviewDTO>> GetList(ReviewFilterModel filterModel)
        {
            return WithPagingTemplateAsync(
                (conn, sqlBuilder, sqlTemplate) =>
                {
                    sqlBuilder.Select("t2.FullName AS CustomerName");
                    sqlBuilder.Select("t3.ImageUrl");
                    sqlBuilder.Select("t4.ImageUrl AS CustomerImage");

                    sqlBuilder.InnerJoin("Users t2 ON t1.UserId = t2.Id AND t2.IsDeleted != 1");
                    sqlBuilder.LeftJoin("Image t3 ON t1.ImageId = t3.Id AND t3.IsDeleted != 1");
                    sqlBuilder.LeftJoin("Image t4 ON t2.AvatarId = t4.Id AND t4.IsDeleted != 1");

                    sqlBuilder.Where("t1.ProductId = @productId", new {filterModel.ProductId});
                    switch(filterModel.TypeReview)
                    {
                        case ReviewEnum.Rate:
                            sqlBuilder.Where("t1.Rating = @rating", new {filterModel.RateNumber});
                            break;
                        case ReviewEnum.Comment:
                            sqlBuilder.Where("t1.Comment IS NOT NULL AND t1.Comment != ''");
                            break;
                        case ReviewEnum.Image:
                            sqlBuilder.Where("t1.ImageId IS NOT NULL");
                            break;
                        default:
                            break;
                    }
                    return conn.QueryAsync<ReviewDTO>(sqlTemplate.RawSql, sqlTemplate.Parameters);
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

        public Task<OverallRatingDTO> GetTotalOverall(int productId)
        {
            return WithDefaultTemplateAsync(
                (conn, sqlBuilder, sqlTemplate)
                =>
                {
                    string query = $@"
                        SELECT 
                            COUNT(*) AS TotalRating,
                            AVG(rating) AS AverageRating,
                            SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) AS TotalRating5,
                            SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) AS TotalRating4,
                            SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) AS TotalRating3,
                            SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) AS TotalRating2,
                            SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) AS TotalRating1,
                            SUM(CASE WHEN comment IS NOT NULL AND comment != '' THEN 1 ELSE 0 END) AS TotalComment,
                            SUM(CASE WHEN ImageId IS NOT NULL THEN 1 ELSE 0 END) AS TotalImage
                        FROM Review
                        WHERE ProductId = {productId}";

                    return conn.QueryFirstOrDefaultAsync<OverallRatingDTO>(query);
                });
        }
    }
}
