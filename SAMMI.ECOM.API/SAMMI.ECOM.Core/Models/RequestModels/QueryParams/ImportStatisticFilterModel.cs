using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SAMMI.ECOM.Core.Models.RequestModels.QueryParams
{
    public class ImportStatisticFilterModel : RequestFilterModel
    {
        public int? EmployeeId { get; set; }
        public int? SupplierId { get; set; }
        public DateTime DateFrom { get; set; } = DateTime.Today;
        public DateTime DateTo { get; set; } = DateTime.Today.AddDays(1);
    }
}
