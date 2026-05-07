using Dapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using SAMMI.ECOM.Core.Authorizations;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Core.Models.ResponseModels.PagingList;
using SAMMI.ECOM.Domain.Seeds;
using SAMMI.ECOM.Repository.Extensions;
using SAMMI.ECOM.Repository.GenericRepositories.Query;
using SAMMI.ECOM.Repository.GenericRepositories.Query.TemplateBuilder;
using SAMMI.ECOM.Utility;
using System.Collections;
using System.Data;
using System.Globalization;

namespace SAMMI.ECOM.Repository.GenericRepositories
{
    public abstract class QueryRepository<TEntity> : QueryRepository, IQueryRepository
        where TEntity : class, new()
    {
        public UserIdentity? UserIdentity { get; set; }
        public StoreObjectIdentifier StoreObjectIdentifier;
        protected IReadOnlyCollection<string>? PrimaryKeyNames { get; set; }
        protected Dictionary<string, IProperty> TableColumns;
        protected readonly string TableName;
        protected readonly string? Schema;
        protected string DefaultSqlTemplate { get; set; }
        protected string PagingSqlTemplate { get; set; }
        protected ISqlTemplateBuilder SqlTemplateBuilder;

        protected QueryRepository(DbContext context)
            : base(context)
        {
            TableColumns = [];
            var entityType = context.Model.FindEntityType(typeof(TEntity)) ?? throw new NullReferenceException("Entity object Type");
            var annotations = entityType.GetAnnotations().ToList();
            TableName = entityType.GetTableName() ?? throw new ArgumentNullException(nameof(TableName));
            Schema = entityType.GetSchema();

            StoreObjectIdentifier = StoreObjectIdentifier.Table(TableName, Schema);

            PrimaryKeyNames = entityType.FindPrimaryKey()?
                .Properties.Select(p => p.GetColumnName(StoreObjectIdentifier) ?? string.Empty).Where(QueryBuilderExtension.IsNotEmpty).ToList();
            //?? throw new NullReferenceException($"Could not found the primary keys in table {TableName}")

            foreach (var property in entityType.GetProperties())
            {
                if (string.IsNullOrEmpty(property.GetColumnName(StoreObjectIdentifier))) continue;
                TableColumns.Add(property.GetColumnName(StoreObjectIdentifier)!, property);
            }

            if (TableColumns.IsNullOrEmpty())
            {
                throw new NullReferenceException($"Could not found any columns in table {TableName}");
            }


            DefaultOrderByField = PrimaryKeyNames?.FirstOrDefault() ?? "Id";


            this.SqlTemplateBuilder = new SqlTemplateBuilder(this.DatabaseType)
                .SetTableName(this.TableName)
                .SetPrimaryKeys(this.PrimaryKeyNames?.ToArray())
                .SetTableColumns(this.TableColumns.Keys.ToArray());

            this.DefaultSqlTemplate = SqlTemplateBuilder.Build();
            this.PagingSqlTemplate = SqlTemplateBuilder.BuildPaging();

        }

        #region Build sql buider
        private Type? GetTypeOfColumn(string columnName)
        {
            if (!TableColumns.ContainsKeyIgnoreCase(columnName))
                return default;

            var columnType = TableColumns
                    .First(e => e.Key.Equals(columnName, StringComparison.OrdinalIgnoreCase)).Value.ClrType;
            return columnType;

        }

        public virtual Task<IPagedList<TResult>> WithPagingTemplateAsync<TResult>(
            Func<IDbConnection, SqlBuilder, SqlBuilder.Template, Task<IEnumerable<TResult>>> execution,
            RequestFilterModel? queryFilterParams = null)
        {
            var sqlBuilder = new SqlBuilder();
            var dataQueryTemplate = this.BuildBaseExecution<TResult>(sqlBuilder, queryFilterParams);

            using var conn = this.DbConnection;
            var queryDataTsk = Task.Run(() => execution(conn, sqlBuilder, dataQueryTemplate));
            var queryCountingTsk = Task.Run(() => BuildCountingTotalQueryAsync(sqlBuilder));

            Task.WhenAll(queryDataTsk, queryCountingTsk);

            var dataSource = queryDataTsk.Result.Distinct()?.ToList();
            int totalRecords = queryCountingTsk.Result;

            var pagingResult = new PagedList<TResult>(sqlBuilder.SkipNumber,
                sqlBuilder.TakeNumber ?? int.MaxValue,
                totalRecords)
            {
                Subset = dataSource
            };

            return Task.FromResult<IPagedList<TResult>>(pagingResult);
        }

        public virtual async Task<IPagedList<TResult>> WithPagingNoSelectTemplateAsync<TResult>(
            Func<IDbConnection, SqlBuilder, SqlBuilder.Template, Task<IEnumerable<TResult>>> execution,
            RequestFilterModel? queryFilterParams = null)
        {
            return await WithConnectionAsync(
                async conn =>
                {
                    var sqlBuilder = new SqlBuilder();
                    var dataQueryTemplate = this.BuildBaseExecution<TResult>(sqlBuilder, queryFilterParams, false);

                    var queryDataTsk = Task.Run(() => execution(conn, sqlBuilder, dataQueryTemplate));
                    var queryCountingTsk = Task.Run(() => BuildCountingTotalQueryAsync(sqlBuilder));

                    await Task.WhenAll(queryDataTsk, queryCountingTsk);

                    var dataSource = queryDataTsk.Result?.Distinct()?.ToList();

                    int totalRecords = queryCountingTsk.Result;

                    return new PagedList<TResult>(sqlBuilder.SkipNumber,
                        sqlBuilder.TakeNumber ?? int.MaxValue,
                        totalRecords)
                    {
                        Subset = dataSource
                    };
                });
        }

        public virtual async Task<TResult> WithDefaultTemplateAsync<TResult>(
            Func<IDbConnection, SqlBuilder, SqlBuilder.Template, Task<TResult>> execution,
            RequestFilterModel? queryFilterParams = null)
        {
            return await WithConnectionAsync(
                conn =>
                {
                    var sqlBuilder = new SqlBuilder();
                    var dataQueryTemplate = this.BuildBaseExecution<TResult>(sqlBuilder, queryFilterParams);
                    return execution(conn, sqlBuilder, dataQueryTemplate);
                });
        }

        public virtual TResult WithDefaultTemplate<TResult>(
            Func<IDbConnection, SqlBuilder, SqlBuilder.Template, TResult> execution,
            RequestFilterModel? queryFilterParams = null)
        {
            return WithConnection(
                conn =>
                {
                    var sqlBuilder = new SqlBuilder();
                    var dataQueryTemplate = this.BuildBaseExecution<TResult>(sqlBuilder, queryFilterParams);
                    return execution(conn, sqlBuilder, dataQueryTemplate);
                }
            );
        }

        public virtual Task<TResult> WithDefaultNoSelectTemplateAsync<TResult>(
            Func<IDbConnection, SqlBuilder, SqlBuilder.Template, Task<TResult>> execution,
            RequestFilterModel? queryFilterParams = null)
        {
            return WithConnectionAsync(
                conn =>
                {
                    var sqlBuilder = new SqlBuilder();
                    var dataQueryTemplate = this.BuildBaseExecution<TResult>(sqlBuilder, queryFilterParams, false);
                    return execution(conn, sqlBuilder, dataQueryTemplate);
                });
        }

        public virtual TResult WithDefaultNoSelectTemplate<TResult>(
            Func<IDbConnection, SqlBuilder, SqlBuilder.Template, TResult> execution,
            RequestFilterModel? queryFilterParams = null)
        {
            return WithConnection(
                conn =>
                {
                    var sqlBuilder = new SqlBuilder();
                    var dataQueryTemplate = this.BuildBaseExecution<TResult>(sqlBuilder, queryFilterParams, false);
                    return execution(conn, sqlBuilder, dataQueryTemplate);
                }
            );
        }

        public int BuildCountingTotalQuery(SqlBuilder sqlBuilder)
        {
            string sqlCountingTemplate;
            if (sqlBuilder.HasGroupByStatement())
            {
                var groupByFields = sqlBuilder.GetGroupByField().Split(',');
                sqlCountingTemplate = SqlTemplateBuilder
                    .SetGroupedKeys(groupByFields)
                    .BuildCounting();
            }
            else
            {
                sqlCountingTemplate = SqlTemplateBuilder.BuildCounting();
            }
            // Add counting query template
            var countingQueryTemplate = sqlBuilder.AddTemplate(sqlCountingTemplate);

            return WithConnection(conn =>
                conn.ExecuteScalar<int>(countingQueryTemplate.RawSql, countingQueryTemplate.Parameters));
        }

        public async Task<int> BuildCountingTotalQueryAsync(SqlBuilder sqlBuilder)
        {
            string sqlCountingTemplate;
            if (string.IsNullOrEmpty(sqlBuilder.TableName))
            {
                sqlBuilder.TableName = this.TableName;
            }

            if (sqlBuilder.HasGroupByStatement())
            {
                var groupByFields = sqlBuilder.GetGroupByField().Split(',');
                sqlCountingTemplate = SqlTemplateBuilder.SetGroupedKeys(groupByFields).BuildCounting();
            }
            else
            {
                sqlCountingTemplate = SqlTemplateBuilder.BuildCounting();
            }
            // Add counting query template
            var countingQueryTemplate = sqlBuilder.AddTemplate(sqlCountingTemplate);

            using (var dbConnection = this.DbConnection)
                return await dbConnection
                    .ExecuteScalarAsync<int>(countingQueryTemplate.RawSql, countingQueryTemplate.Parameters);
        }

        protected SqlBuilder.Template BuildBaseExecution<TResult>
            (SqlBuilder sqlBuilder, RequestFilterModel? filterModel, bool buildSelectStatement = true)
        {
            var sqlDynamicParameters = new DynamicParameters();
            var resultType = typeof(TResult);
            string orderByColumn = string.IsNullOrEmpty(filterModel?.OrderBy)
                ? string.Empty //PrimaryKeyNames?.FirstOrDefault() ?? TableColumns.Keys.First()
                : TableColumns.FindColumn(filterModel.OrderBy);

            var orderDir = string.IsNullOrEmpty(filterModel?.Dir)
                    || filterModel.Dir.Equals("ASC", StringComparison.OrdinalIgnoreCase)
                 ? "ASC" : "DESC";

            if (filterModel?.Paging ?? false)
            {
                if (PrimaryKeyNames != null && PrimaryKeyNames.Count > 0)
                {
                    sqlBuilder.InsightSelect($"DISTINCT {string.Join(",", PrimaryKeyNames!.Select(k => $"t1.{k}"))}");
                    if (!PrimaryKeyNames.AnyIgnoreCase(orderByColumn))
                    {
                        sqlBuilder.InsightSelect(
                            $"{(this.IsBelongToPrimaryTable(orderByColumn) ? "t1." : string.Empty)}{orderByColumn}"
                        );
                    }
                }
            }

            if (!string.IsNullOrWhiteSpace(orderByColumn))
            {
                if (IsBelongToPrimaryTable(orderByColumn))
                {
                    sqlBuilder.OrderBy($"t1.{orderByColumn} {orderDir}");
                }
                else if (filterModel?.RestrictOrderBy == true)
                {
                    var orderByPrefix = this.IsBelongToPrimaryTable(orderByColumn) ? "t1." : string.Empty;
                    sqlBuilder.OrderBy($"{orderByPrefix}{orderByColumn} {orderDir}");
                }
            }
            else
            {
                //sqlBuilder.OrderBy($"{string.Join(",", this.PrimaryKeyNames!.Select(k => $"t1.{k}"))} {orderDir}");
            }

            if (buildSelectStatement)
            {
                var selectStatements = new HashSet<string>();
                if (resultType.IsClass
                && resultType != typeof(string))
                {
                    selectStatements = FindQueryColumns(resultType);
                }
                else if (resultType.GetInterface(nameof(ICollection)) != null ||
                    resultType.GetInterface(nameof(IEnumerable)) != null)
                {
                    var taskResultType = resultType.GetGenericArguments()[0];
                    if (taskResultType != null && taskResultType != typeof(string))
                    {
                        selectStatements = FindQueryColumns(taskResultType);
                    }
                }

                if (selectStatements.Any()) sqlBuilder.Select($"DISTINCT {string.Join(",\n", selectStatements)}");
            }

            if (this.IsBelongToPrimaryTable("ISDELETED"))
            {
                sqlBuilder.Where(@"t1.ISDELETED = 0");
            }

            if (this.IsBelongToPrimaryTable("IS_DELETED"))
            {
                sqlBuilder.Where(@"t1.IS_DELETED = 0");
            }

            // Build dynamic query from filter expression string
            if (filterModel != null && !string.IsNullOrEmpty(filterModel.Filters))
            {
                for (int i = 0; i < filterModel.PropertyFilterModels.Count; i++)
                {
                    var propertyFilter = (PropertyFilterModel)filterModel.PropertyFilterModels[i].Clone();
                    propertyFilter.FilterColumn = TableColumns.FindColumn(propertyFilter.Field);

                    if (string.IsNullOrEmpty(propertyFilter.FilterColumn)
                        || !this.IsBelongToPrimaryTable(propertyFilter.FilterColumn))
                    {
                        propertyFilter.FilterColumn = propertyFilter.Field;
                    }

                    var predicateParameterName =
                        $"{sqlParameterPrefix}{propertyFilter.FilterColumn}{i}";

                    Type? fieldType = GetTypeOfColumn(propertyFilter.FilterColumn);
                    if (fieldType == null) continue;

                    propertyFilter.FilterColumn = @$"t1.{propertyFilter.FilterColumn}";
                    bool isNullableType = Nullable.GetUnderlyingType(fieldType) != null;

                    propertyFilter.FilterValue = ConvertToSafeValue(propertyFilter.FilterValue?.ToString(),
                        Nullable.GetUnderlyingType(fieldType) ?? fieldType);

                    if (sqlBuilder.AppendPredicate(ref propertyFilter, predicateParameterName, _typeMap[fieldType], isNullableType, Local_Collation))
                    {
                        sqlDynamicParameters.Add(
                            $"{predicateParameterName}",
                            propertyFilter.FilterValue,
                            _typeMap[fieldType]
                        );
                    }
                }
            }

            if (filterModel?.Paging == true)
            {
                sqlBuilder.Take(filterModel.Take)
                    .Skip(filterModel.Skip);
            }

            sqlBuilder.AddParameters(sqlDynamicParameters);

            if (filterModel?.Paging == true)
            {
                return sqlBuilder.AddTemplate(this.PagingSqlTemplate);
            }

            return sqlBuilder.AddTemplate(this.DefaultSqlTemplate);
        }

        private HashSet<string> FindQueryColumns(Type resultType)
        {
            // Build sql select statement based on {TItem} type properties
            var selectingColumns = new HashSet<string>();
            if (PrimaryKeyNames != null && PrimaryKeyNames.Count > 0)
            {
                foreach (var k in this.PrimaryKeyNames!)
                {
                    selectingColumns.Add($"t1.{k}");
                }
            }

            foreach (var propertyInfo in resultType.GetProperties())
            {
                if (!TableColumns.ContainsFieldIgnoreCase(propertyInfo.Name))
                {
                    continue;
                }

                var columnInfo = this.TableColumns.First(e =>
                    e.Value.Name.Equals(propertyInfo.Name, StringComparison.OrdinalIgnoreCase));

                if (PrimaryKeyNames.AnyIgnoreCase(columnInfo.Key)
                    || !propertyInfo.CanWrite
                    || !propertyInfo.PropertyType.IsPublic
                    || (propertyInfo.PropertyType.IsClass && propertyInfo.PropertyType != typeof(string))
                    || (!propertyInfo.PropertyType.IsValueType && propertyInfo.PropertyType != typeof(string)))
                    continue;

                selectingColumns.Add($"t1.{columnInfo.Key} AS {columnInfo.Value.Name}");
            }

            return selectingColumns;
        }

        private object? ConvertToSafeValue(string? valueAsString, Type valueType)
        {
            if ("null".Equals(valueAsString ?? "null", StringComparison.OrdinalIgnoreCase))
            {
                return null;
            }

            switch (Type.GetTypeCode(valueType))
            {
                case TypeCode.Boolean:
                    return "TRUE".Equals(valueAsString, StringComparison.OrdinalIgnoreCase) ? 1 : 0;
                case TypeCode.DateTime:
                case TypeCode.DBNull:
                    if (!DateTime.TryParseExact(valueAsString,
                        "yyyy-MM-dd'T'HH:mm:ss.fff'Z'",
                        CultureInfo.InvariantCulture,
                        DateTimeStyles.None,
                        out var safeTypedValue))
                    {
                        throw new FormatException("String was not recognized as a valid DateTime");
                    }

                    safeTypedValue = safeTypedValue.AddHours(7);
                    return new DateTime(safeTypedValue.Year, safeTypedValue.Month,
                        safeTypedValue.Day, 0, 0, 0);
                default:
                    return valueAsString;
            }
        }

        protected bool IsBelongToPrimaryTable(string columnName)
        {
            return this.TableColumns.ContainsKeyIgnoreCase(columnName);
        }
        #endregion
    }

    public abstract class QueryRepository<TEntity, TSQLBuilder> : QueryRepository<TEntity>
       where TEntity : class, IEntity, new()
       where TSQLBuilder : SqlBuilder, new()
    {
        protected QueryRepository(DbContext context) : base(context)
        {
        }

        public async Task<IPagedList<TResult>> WithPagingTemplateAsync<TResult>(
            Func<IDbConnection, TSQLBuilder, SqlBuilder.Template, Task<IEnumerable<TResult>>> execution,
            RequestFilterModel? queryFilterParams = null)
        {
            return await WithConnectionAsync(
                async conn =>
                {
                    var sqlBuilder = this.CreateSQLBuilder();
                    var dataQueryTemplate = this.BuildBaseExecution<TResult>(sqlBuilder, queryFilterParams);

                    var queryDataTsk = Task.Run(() => execution(conn, sqlBuilder, dataQueryTemplate));
                    var queryCountingTsk = Task.Run(() => BuildCountingTotalQueryAsync(sqlBuilder));

                    await Task.WhenAll(queryDataTsk, queryCountingTsk);

                    var dataSource = queryDataTsk.Result?.Distinct()?.ToList();

                    int totalRecords = queryCountingTsk.Result;

                    return new PagedList<TResult>(sqlBuilder.SkipNumber,
                        sqlBuilder.TakeNumber ?? int.MaxValue,
                        totalRecords)
                    {
                        Subset = dataSource
                    };
                });
        }

        public Task<TResult> WithDefaultTemplateAsync<TResult>(
            Func<IDbConnection, TSQLBuilder, SqlBuilder.Template, Task<TResult>> execution,
            RequestFilterModel? queryFilterParams = null)
        {
            return WithConnectionAsync(
                conn =>
                {
                    var sqlBuilder = this.CreateSQLBuilder();
                    var dataQueryTemplate = this.BuildBaseExecution<TResult>(sqlBuilder, queryFilterParams);
                    return execution(conn, sqlBuilder, dataQueryTemplate);
                });
        }

        public TResult WithDefaultTemplate<TResult>(
            Func<IDbConnection, TSQLBuilder, SqlBuilder.Template, TResult> execution,
            RequestFilterModel? queryFilterParams = null)
        {
            return WithConnection(
                conn =>
                {
                    var sqlBuilder = this.CreateSQLBuilder();
                    var dataQueryTemplate = this.BuildBaseExecution<TResult>(sqlBuilder, queryFilterParams);
                    return execution(conn, sqlBuilder, dataQueryTemplate);
                });
        }

        public TResult WithDefaultNoSelectTemplate<TResult>(
            Func<IDbConnection, TSQLBuilder, SqlBuilder.Template, TResult> execution,
            RequestFilterModel? queryFilterParams = null)
        {
            return WithConnection(
                conn =>
                {
                    var sqlBuilder = this.CreateSQLBuilder();
                    var dataQueryTemplate = this.BuildBaseExecution<TResult>(sqlBuilder, queryFilterParams, false);
                    return execution(conn, sqlBuilder, dataQueryTemplate);
                });
        }

        private TSQLBuilder CreateSQLBuilder()
        {
            TSQLBuilder sQLBuilder;
            try
            {
                var sqlBuilderType = typeof(TSQLBuilder);
                sQLBuilder = (TSQLBuilder)Activator.CreateInstance(sqlBuilderType, this.TableName);
            }
            catch (Exception)
            {
                sQLBuilder = new TSQLBuilder();
                sQLBuilder.TableName = this.TableName;
            }

            return sQLBuilder;
        }
    }
}
