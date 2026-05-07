using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using SAMMI.ECOM.Core.Models.ResponseModels.PagingList;
using SAMMI.ECOM.Domain.DomainModels.OrderBuy;

namespace SAMMI.ECOM.Domain.DomainModels.Reports
{
    public class ImportStatistic
    {
        public decimal TotalAmount { get; set; }
        public decimal TotalQuantity { get; set; }
        public IPagedList<ImportStatisticDetail> Imports { get; set; }
    }
    public class ImportStatisticDetail
    {
        public string Code { get; set; }
        public int EmployeeId { get; set; }
        public string? EmployeeName { get; set; }
        public int SupplierId { get; set; }
        public string? SupplierName { get; set; }
        public string? Status { get; set; }
        public string? Note { get; set; }
        public int? TotalQuantity { get; set; }
        public decimal? TotalPrice { get; set; }


        public int Id { get; set; }
        public DateTime? CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public string? CreatedBy { get; set; }
        public string? UpdatedBy { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
    }
}
