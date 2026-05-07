using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Core.Models.ResponseModels.PagingList;
using SAMMI.ECOM.Repository.GenericRepositories.Query.TemplateBuilder;
using System.Data;

namespace SAMMI.ECOM.Repository.GenericRepositories
{
    public interface IQueryRepository
    {
        protected Task<IPagedList<TResult>> WithPagingTemplateAsync<TResult>(Func<IDbConnection, SqlBuilder, SqlBuilder.Template, Task<IEnumerable<TResult>>> execution,
            RequestFilterModel? queryFilterParams = null);
        protected Task<TResult> WithDefaultTemplateAsync<TResult>(
            Func<IDbConnection, SqlBuilder, SqlBuilder.Template, Task<TResult>> execution,
            RequestFilterModel? queryFilterParams = null);
        protected Task<TResult> WithDefaultNoSelectTemplateAsync<TResult>(
            Func<IDbConnection, SqlBuilder, SqlBuilder.Template, Task<TResult>> execution,
            RequestFilterModel? queryFilterParams = null);
        protected TResult WithDefaultTemplate<TResult>(
            Func<IDbConnection, SqlBuilder, SqlBuilder.Template, TResult> execution,
            RequestFilterModel? queryFilterParams = null);
        protected TResult WithDefaultNoSelectTemplate<TResult>(
            Func<IDbConnection, SqlBuilder, SqlBuilder.Template, TResult> execution,
            RequestFilterModel? queryFilterParams = null);

        protected Task<TResult> WithConnectionAsync<TResult>(Func<IDbConnection, Task<TResult>> handler);
        protected TResult WithConnection<TResult>(Func<IDbConnection, TResult> handler);
    }
}
