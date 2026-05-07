using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SAMMI.ECOM.Repository.GenericRepositories.Query
{
    public interface ISqlTemplateBuilder
    {
        ISqlTemplateBuilder SetTableName(string tableName);
        ISqlTemplateBuilder SetTableColumns(string[] columns);
        ISqlTemplateBuilder SetPrimaryKeys(string[]? keys);
        ISqlTemplateBuilder SetGroupedKeys(string[]? keys);
        string Build();
        string BuildPaging();
        string BuildCounting();
    }
}
