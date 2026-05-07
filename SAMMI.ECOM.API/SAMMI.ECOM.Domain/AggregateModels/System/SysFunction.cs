using SAMMI.ECOM.Domain.Seeds;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SAMMI.ECOM.Domain.AggregateModels.System;

[Table("SysFunction")]
public partial class SysFunction : Entity
{
    [Column("Name")]
    [StringLength(100)]
    public string Name { get; set; } = null!;

    public virtual ICollection<SysLog> SysLogs { get; set; } = new List<SysLog>();
}