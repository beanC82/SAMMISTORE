using SAMMI.ECOM.Domain.AggregateModels.Others;
using SAMMI.ECOM.Domain.Seeds;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SAMMI.ECOM.Domain.AggregateModels.OrderBuy;

[Table("Notification")]
public partial class Notification : Entity
{
    [Column("Title")]
    [MaxLength(255)]
    public string Title { get; set; } = null!;

    [Column("Content")]
    [MaxLength(int.MaxValue)]
    public string Content { get; set; } = null!;

    [ForeignKey("Receiver")]
    public int ReceiverId { get; set; }

    [ForeignKey("Order")]
    public int? OrderId { get; set; }

    [Column("IsReaded")]
    public bool? IsReaded { get; set; }

    public virtual Order? Order { get; set; }

    public virtual User Receiver { get; set; } = null!;
}
