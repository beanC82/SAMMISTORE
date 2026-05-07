using SAMMI.ECOM.Domain.Seeds;
using System.ComponentModel.DataAnnotations.Schema;

namespace SAMMI.ECOM.Domain.AggregateModels.OrderBuy;
[Table("Payment")]
public partial class Payment : Entity
{
    [ForeignKey("Order")]
    public int OrderId { get; set; }

    [ForeignKey("PaymentMethod")]
    public int PaymentMethodId { get; set; }

    [Column("PaymentAmount")]
    public decimal PaymentAmount { get; set; }

    [Column("PaymentStatus")]
    public string? PaymentStatus { get; set; }

    [Column("TransactionId")]
    public string? TransactionId { get; set; }

    [Column("PaymentDate")]
    public DateTime? PaymentDate { get; set; }


    public virtual Order Order { get; set; } = null!;
    public virtual PaymentMethod PaymentMethod { get; set; } = null!;
}