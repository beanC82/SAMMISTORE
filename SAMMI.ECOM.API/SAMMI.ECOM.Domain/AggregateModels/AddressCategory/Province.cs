using SAMMI.ECOM.Domain.Seeds;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SAMMI.ECOM.Domain.AggregateModels.AddressCategory;

[Table("Province")]
public partial class Province : Entity
{
    [Column("Code")]
    [MaxLength(100)]
    public string? Code { get; set; }
    [Column("Name")]
    [MaxLength(100)]
    public string? Name { get; set; }

    [Column("PostalCode")]
    [MaxLength(20)]
    public string? PostalCode { get; set; }

    [Column("Country")]
    [MaxLength(100)]
    public string? Country { get; set; }

    public virtual ICollection<District> Districts { get; set; } = new List<District>();
}
