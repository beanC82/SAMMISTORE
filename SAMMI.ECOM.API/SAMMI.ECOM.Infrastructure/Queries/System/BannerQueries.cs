using Dapper;
using Org.BouncyCastle.Crypto.Modes.Gcm;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Core.Models.ResponseModels.PagingList;
using SAMMI.ECOM.Domain.AggregateModels.System;
using SAMMI.ECOM.Domain.DomainModels.System;
using SAMMI.ECOM.Domain.GlobalModels.Common;
using SAMMI.ECOM.Repository.GenericRepositories;

namespace SAMMI.ECOM.Infrastructure.Queries.System
{
    public interface IBannerQueries : IQueryRepository
    {
        Task<IPagedList<BannerDTO>> GetList(RequestFilterModel filterModel);
        Task<IEnumerable<SelectionItem>> GetSelectionList(RequestFilterModel? request);
        Task<IEnumerable<BannerDTO>> GetAll(RequestFilterModel? filterModel = null);
        Task<BannerDTO> GetById(int id);
        Task<IEnumerable<BannerDTO>> GetBanners(RequestFilterModel filterModel = null);
    }
    public class BannerQueries : QueryRepository<Banner>, IBannerQueries
    {
        public BannerQueries(SammiEcommerceContext context) : base(context)
        {
        }

        public Task<IEnumerable<BannerDTO>> GetAll(RequestFilterModel? filterModel = null)
        {
            return WithDefaultTemplateAsync(
                (conn, sqlBuilder, sqlTemplate) =>
                {
                    sqlBuilder.Select("t2.ImageUrl");
                    sqlBuilder.LeftJoin("Image t2 ON t1.ImageId = t2.Id AND t2.IsDeleted != 1");

                    return conn.QueryAsync<BannerDTO>(sqlTemplate.RawSql, sqlTemplate.Parameters);
                }, filterModel);
        }

        public Task<IEnumerable<BannerDTO>> GetBanners(RequestFilterModel filterModel = null)
        {
            return WithDefaultTemplateAsync(
                (conn, sqlBuilder, sqlTemplate) =>
                {
                    sqlBuilder.Select("t2.ImageUrl");
                    sqlBuilder.LeftJoin("Image t2 ON t1.ImageId = t2.Id AND t2.IsDeleted != 1");

                    sqlBuilder.Where("t1.IsActive = 1");
                    return conn.QueryAsync<BannerDTO>(sqlTemplate.RawSql, sqlTemplate.Parameters);
                }, filterModel);
        }

        public async Task<BannerDTO> GetById(int id)
        {
            return await WithDefaultTemplateAsync(
                (conn, sqlBuilder, sqlTemplate) =>
                {
                    sqlBuilder.Select("t2.ImageUrl");
                    sqlBuilder.LeftJoin("Image t2 ON t1.ImageId = t2.Id AND t2.IsDeleted != 1");
                    sqlBuilder.Where("t1.Id = @id", new { id });
                    return conn.QueryFirstOrDefaultAsync<BannerDTO>(sqlTemplate.RawSql, sqlTemplate.Parameters);
                }
            );
        }

        public Task<IPagedList<BannerDTO>> GetList(RequestFilterModel filterModel)
        {
            return WithPagingTemplateAsync(
                (conn, sqlBuilder, sqlTemplate) =>
                {
                    sqlBuilder.Select("t2.ImageUrl");
                    sqlBuilder.LeftJoin("Image t2 ON t1.ImageId = t2.Id AND t2.IsDeleted != 1");
                    return conn.QueryAsync<BannerDTO>(sqlTemplate.RawSql, sqlTemplate.Parameters);
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
