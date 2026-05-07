using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SAMMI.ECOM.Core.Models.RequestModels.QueryParams
{
    public class InventoryFilterModel : RequestFilterModel
    {
        public int? MaximumStockQuantity { get; set; } // số lượng tồn tối đa
        public int? DaysOfExistence { get; set; } // số lượng ngày tồn
    }
}
