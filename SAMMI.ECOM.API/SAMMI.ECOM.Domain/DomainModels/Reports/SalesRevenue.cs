using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using SAMMI.ECOM.Core.Models.ResponseModels.PagingList;
using SAMMI.ECOM.Domain.DomainModels.OrderBuy;

namespace SAMMI.ECOM.Domain.DomainModels.Reports
{
    public class SalesRevenue
    {
        public decimal? TotalAmount { get; set; }
        public decimal? TotalQuantity { get; set; }
        public IPagedList<SalesRevenueDetail> RevenueDetails { get; set; }
    }

    public class SalesRevenueDetail
    {
        public string Code { get; set; } = null!;
        public int CustomerId { get; set; }
        public string? CustomerName { get; set; }
        public string? PhoneNumber { get; set; }
        public int? PaymentMethodId { get; set; }
        public string? PaymentMethod { get; set; }
        public string? OrderStatus { get; set; }
        public decimal? TotalPrice { get; set; }
        public int? TotalQuantity { get; set; }


        public int Id { get; set; }
        public DateTime? CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public string? CreatedBy { get; set; }
        public string? UpdatedBy { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public int? DisplayOrder { get; set; }
    }
}
