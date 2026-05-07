using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SAMMI.ECOM.Repository.GenericRepositories.Query
{
    public interface ISqlTemplate
    {
        string TableName { get; set; }
        string[]? TableColumns { get; set; }
        string[]? GroupedColumns { get; set; }
        string[]? PrimaryKeys { get; set; }
        string GetTemplate();
        string GetPagingTemplate();
        string GetCountingTemplate();
    }
}
