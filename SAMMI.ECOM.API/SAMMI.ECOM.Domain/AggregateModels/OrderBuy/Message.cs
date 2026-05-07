using SAMMI.ECOM.Domain.AggregateModels.Others;
using SAMMI.ECOM.Domain.Seeds;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SAMMI.ECOM.Domain.AggregateModels.OrderBuy;

[Table("Message")]
public partial class Message : Entity
{
    [ForeignKey("Employee")]
    public int EmployeeId { get; set; }

    [ForeignKey("Customer")]
    public int CustomerId { get; set; }

    [Column("MessageContent")]
    [MaxLength(255)]
    public string MessageContent { get; set; } = null!;

    [Column("MessageType")]
    [StringLength(50)]
    public string? MessageType { get; set; }

    [Column("IsRead")]
    public bool? IsRead { get; set; }

    public virtual User Customer { get; set; } = null!;

    public virtual User Employee { get; set; } = null!;
}