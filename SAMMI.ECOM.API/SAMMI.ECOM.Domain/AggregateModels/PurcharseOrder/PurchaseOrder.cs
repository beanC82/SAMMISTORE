using SAMMI.ECOM.Domain.AggregateModels.Others;
using SAMMI.ECOM.Domain.Seeds;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SAMMI.ECOM.Domain.AggregateModels.PurcharseOrder;
[Table("PurchaseOrder")]
public partial class PurchaseOrder : Entity
{
    [Column("Code")]
    [StringLength(50)]
    public string Code { get; set; }
    [ForeignKey("Employee")]
    public int EmployeeId { get; set; }

    [ForeignKey("Supplier")]
    public int SupplierId { get; set; }

    [Column("Status")]
    [StringLength(50)]
    public string? Status { get; set; }

    [Column("Note")]
    [StringLength(500)]
    public string? Note { get; set; }

    public virtual User Employee { get; set; } = null!;

    public virtual ICollection<PurchaseOrderDetail> PurchaseOrderDetails { get; set; } = new List<PurchaseOrderDetail>();

    public virtual User Supplier { get; set; } = null!;
}

