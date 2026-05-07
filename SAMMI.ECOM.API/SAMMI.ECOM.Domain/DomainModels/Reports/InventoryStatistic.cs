using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using SAMMI.ECOM.Core.Models.ResponseModels.PagingList;
using SAMMI.ECOM.Domain.DomainModels.Products;

namespace SAMMI.ECOM.Domain.DomainModels.Reports
{
    public class InventoryStatistic
    {
        public int TotalStockQuantity { get; set; }
        public decimal TotalAmount { get; set; }
        public IPagedList<InventoryStatisticDetail> InventoryDetails { get; set; }
    }

    public class InventoryStatisticDetail
    {
        public string Code { get; set; } = null!;
        public string Name { get; set; } = null!;
        public int StockQuantity { get; set; }
        public decimal? Price { get; set; }
        public int? Status { get; set; }
        public int? CategoryId { get; set; }
        public string? CategoryCode { get; set; }
        public string? CategoryName { get; set; }
        public DateTime? LastReceiptDate { get; set; }
        public int? DaysSinceLastReceipt { get; set; }


        public int Id { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public string? CreatedBy { get; set; }
        public string? UpdatedBy { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public int? DisplayOrder { get; set; }
    }
}
