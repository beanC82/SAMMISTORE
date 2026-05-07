using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Dapper;
using SAMMI.ECOM.Core.Models.ResponseModels.PagingList;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Domain.DomainModels.System;
using SAMMI.ECOM.Domain.GlobalModels.Common;
using SAMMI.ECOM.Repository.GenericRepositories;
using SAMMI.ECOM.Domain.DomainModels.Auth;
using SAMMI.ECOM.Domain.AggregateModels.System;
using System.Data;

namespace SAMMI.ECOM.Infrastructure.Queries.System
{
    public interface IPermissionQueries : IQueryRepository
    {
        Task<IPagedList<PermissionDTO>> GetList(RequestFilterModel filterModel);
        Task<IEnumerable<SelectionItem>> GetSelectionList(RequestFilterModel? request);
        Task<IEnumerable<PermissionDTO>> GetAll(RequestFilterModel? filterModel = null);
        Task<PermissionDTO> GetById(int id);
        Task<IEnumerable<RolePermissionDTO>> GetPermissionOfRole(int roleId);
    }
    public class PermissionQueries : QueryRepository<Permission>, IPermissionQueries
    {
        public PermissionQueries(SammiEcommerceContext context) : base(context)
        {
        }

        public Task<IEnumerable<PermissionDTO>> GetAll(RequestFilterModel? filterModel = null)
        {
            return WithDefaultTemplateAsync(
                (conn, sqlBuilder, sqlTemplate) =>
                {
                    sqlBuilder.Where("t1.IsShow = 1");
                    return conn.QueryAsync<PermissionDTO>(sqlTemplate.RawSql, sqlTemplate.Parameters);
                }, filterModel);
        }

        public async Task<PermissionDTO> GetById(int id)
        {
            return await WithDefaultTemplateAsync(
                (conn, sqlBuilder, sqlTemplate) =>
                {
                    sqlBuilder.Where("t1.IsShow = 1");
                    sqlBuilder.Where("t1.Id = @id", new { id });
                    return conn.QueryFirstOrDefaultAsync<PermissionDTO>(sqlTemplate.RawSql, sqlTemplate.Parameters);
                }
            );
        }

        public Task<IPagedList<PermissionDTO>> GetList(RequestFilterModel filterModel)
        {
            return WithPagingTemplateAsync(
                (conn, sqlBuilder, sqlTemplate) =>
                {
                    sqlBuilder.Where("t1.IsShow = 1");
                    return conn.QueryAsync<PermissionDTO>(sqlTemplate.RawSql, sqlTemplate.Parameters);
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
                    sqlBuilder.Where("t1.IsShow = 1");
                    return conn.QueryAsync<SelectionItem>(sqlTemplate.RawSql, sqlTemplate.Parameters);
                }, request
            );
        }

        public Task<IEnumerable<RolePermissionDTO>> GetPermissionOfRole(int roleId)
        {
            return WithConnectionAsync(conn => conn.QueryAsync<RolePermissionDTO>(@"
                SELECT
                t1.Id AS RoleId, t1.Name AS RoleName,
                t2.Allow,
                t3.Id AS PermissionId, t3.Name AS PermissionName, t3.Code AS PermissionCode
                FROM Role t1
                LEFT JOIN RolePermission t2 ON t1.Id = t2.RoleId AND t2.IsDeleted != 1
                LEFT JOIN Permission t3 on t2.PermissionId = t3.Id AND t3.IsDeleted != 1
                WHERE t1.IsDeleted != 1
                AND t1.Id = @roleId
            ",
            new { roleId },
            commandType: CommandType.Text));
        }
    }
}
