using SAMMI.ECOM.Domain.AggregateModels.AddressCategory;
using SAMMI.ECOM.Domain.AggregateModels.Others;
using SAMMI.ECOM.Domain.Seeds;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SAMMI.ECOM.Domain.AggregateModels;

[Table("CustomerAddress")]
public partial class CustomerAddress : Entity
{
    [ForeignKey("Customer")]
    public int? CustomerId { get; set; }

    [Column("StreetAddress")]
    [MaxLength(200)]
    public string? StreetAddress { get; set; }

    [ForeignKey("Ward")]
    public int? WardId { get; set; }

    [Column("IsDefault")]
    public bool? IsDefault { get; set; }

    public virtual User? Customer { get; set; }

    public virtual Ward? Ward { get; set; }
}
