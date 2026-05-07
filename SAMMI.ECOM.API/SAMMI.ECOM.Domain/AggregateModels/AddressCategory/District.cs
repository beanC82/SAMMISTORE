using SAMMI.ECOM.Domain.Seeds;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SAMMI.ECOM.Domain.AggregateModels.AddressCategory;

[Table("District")]
public partial class District : Entity
{
    [Column("Code")]
    [MaxLength(100)]
    public string? Code { get; set; }
    [Column("Name")]
    [MaxLength(100)]
    public string? Name { get; set; }

    [ForeignKey("Province")]
    public int? ProvinceId { get; set; }

    public virtual Province? Province { get; set; }

    public virtual ICollection<Ward> Wards { get; set; } = new List<Ward>();
}
