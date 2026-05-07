using SAMMI.ECOM.Domain.Seeds;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SAMMI.ECOM.Domain.AggregateModels.System;

[Table("SysLog")]
public partial class SysLog : Entity
{
    [Column("Username")]
    [StringLength(50)]
    public string Username { get; set; } = null!;

    [ForeignKey("Action")]
    public int ActionId { get; set; }

    [ForeignKey("Function")]
    public int FunctionId { get; set; }

    [Column("IPAddress")]
    [StringLength(50)]
    public string? Ipaddress { get; set; }

    public virtual SysAction Action { get; set; } = null!;

    public virtual SysFunction Function { get; set; } = null!;
}