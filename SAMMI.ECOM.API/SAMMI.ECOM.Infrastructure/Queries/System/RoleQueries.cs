using Dapper;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Core.Models.ResponseModels.PagingList;
using SAMMI.ECOM.Domain.AggregateModels.System;
using SAMMI.ECOM.Domain.DomainModels.System;
using SAMMI.ECOM.Domain.GlobalModels.Common;
using SAMMI.ECOM.Repository.GenericRepositories;

namespace SAMMI.ECOM.Infrastructure.Queries.System
{
    public interface IRoleQueries : IQueryRepository
    {
        Task<IPagedList<RoleDTO>> GetList(RequestFilterModel filterModel);
        Task<IEnumerable<SelectionItem>> GetSelectionList(RequestFilterModel? request);
        Task<IEnumerable<RoleDTO>> GetAll(RequestFilterModel? filterModel = null);
        Task<RoleDTO> GetById(int id);
    }
    public class RoleQueries : QueryRepository<Role>, IRoleQueries
    {
        public RoleQueries(SammiEcommerceContext context) : base(context)
        {
        }

        public Task<IEnumerable<RoleDTO>> GetAll(RequestFilterModel? filterModel = null)
        {
            return WithDefaultTemplateAsync(
                (conn, sqlBuilder, sqlTemplate) =>
                {
                    return conn.QueryAsync<RoleDTO>(sqlTemplate.RawSql, sqlTemplate.Parameters);
                }, filterModel);
        }

        public async Task<RoleDTO> GetById(int id)
        {
            return await WithDefaultTemplateAsync(
                (conn, sqlBuilder, sqlTemplate) =>
                {
                    sqlBuilder.Where("t1.Id = @id", new { id });
                    return conn.QueryFirstOrDefaultAsync<RoleDTO>(sqlTemplate.RawSql, sqlTemplate.Parameters);
                }
            );
        }

        public Task<IPagedList<RoleDTO>> GetList(RequestFilterModel filterModel)
        {
            return WithPagingTemplateAsync(
                (conn, sqlBuilder, sqlTemplate) =>
                {
                    return conn.QueryAsync<RoleDTO>(sqlTemplate.RawSql, sqlTemplate.Parameters);
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
