using SAMMI.ECOM.Repository.Cores;
using SAMMI.ECOM.Repository.GenericRepositories.Query.TemplateBuilder;

namespace SAMMI.ECOM.Repository.GenericRepositories.Query
{
    public class SqlTemplateBuilder : ISqlTemplateBuilder
    {
        private ISqlTemplate sqlTemplate;
        public SqlTemplateBuilder(DbTypeEnum dbType)
        {
            sqlTemplate = dbType switch
            {
                DbTypeEnum.MySQL => new MySQLTemplate(),
                DbTypeEnum.SQLServer => new MySQLTemplate(),
                _ => new Oracle11gTemplate()
            };
        }
        public ISqlTemplateBuilder SetTableName(string tableName)
        {
            if (string.IsNullOrWhiteSpace(tableName)) throw new ArgumentNullException(nameof(tableName));
            this.sqlTemplate.TableName = tableName;
            return this;
        }
        public ISqlTemplateBuilder SetTableColumns(string[] columns)
        {
            if (!columns?.Any() ?? false) throw new ArgumentNullException(nameof(columns));
            this.sqlTemplate.TableColumns = columns;
            return this;
        }
        public ISqlTemplateBuilder SetPrimaryKeys(string[]? keys)
        {
            this.sqlTemplate.PrimaryKeys = keys;
            return this;
        }
        public ISqlTemplateBuilder SetGroupedKeys(string[]? keys)
        {
            this.sqlTemplate.GroupedColumns = keys;
            return this;
        }
        public string Build()
        {
            if (string.IsNullOrWhiteSpace(this.sqlTemplate.TableName))
                throw new ArgumentNullException(nameof(this.sqlTemplate.TableName), "Must to set the value of table name.");

            return this.sqlTemplate.GetTemplate();
        }
        public string BuildPaging()
        {
            if (string.IsNullOrWhiteSpace(this.sqlTemplate.TableName))
                throw new ArgumentNullException(nameof(this.sqlTemplate.TableName), "Must to set the value of table name.");

            return this.sqlTemplate.GetPagingTemplate();
        }
        public string BuildCounting()
        {
            if (string.IsNullOrWhiteSpace(this.sqlTemplate.TableName))
                throw new ArgumentNullException(nameof(this.sqlTemplate.TableName), "Must to set the value of table name.");

            return this.sqlTemplate.GetCountingTemplate();
        }
    }
}
