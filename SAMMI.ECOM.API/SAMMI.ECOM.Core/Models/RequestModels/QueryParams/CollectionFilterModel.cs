using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SAMMI.ECOM.Core.Models.RequestModels.QueryParams
{
    public class CollectionFilterModel : RequestFilterModel
    {
        public List<int>? BrandIds { get; set; }
        public List<int>? CategoryIds { get; set; }
    }
}
