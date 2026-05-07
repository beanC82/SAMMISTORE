using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using SAMMI.ECOM.Core.Enums;

namespace SAMMI.ECOM.Core.Models.RequestModels.QueryParams
{
    public class ReviewFilterModel : RequestFilterModel
    {
        public int ProductId { get; set; }
        public int? RateNumber { get; set; } = 5;
        public ReviewEnum? TypeReview { get; set; } = 0;
    }
}
