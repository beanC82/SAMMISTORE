using SAMMI.ECOM.Domain.Seeds;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SAMMI.ECOM.Domain.AggregateModels.System;

[Table("Permission")]
public partial class Permission : Entity
{
    [Column("Code")]
    [MaxLength(100)]
    public string? Code { get; set; }
    [Column("Name")]
    [StringLength(100)]
    public string Name { get; set; } = null!;

    [Column("Description")]
    [StringLength(255)]
    public string? Description { get; set; }

    public bool? IsShow { get; set; }

    public virtual ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}