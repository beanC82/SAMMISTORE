using SAMMI.ECOM.Domain.Seeds;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SAMMI.ECOM.Domain.AggregateModels.OrderBuy;

[Table("ShippingCompany")]
public partial class ShippingCompany : Entity
{
    [Column("Name")]
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = null!;

    [Column("ContactInfo")]
    [MaxLength(255)]
    public string? ContactInfo { get; set; }

    [Column("Website")]
    [MaxLength(255)]
    public string? Website { get; set; }

    public bool IsDefault { get; set; }

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
}
