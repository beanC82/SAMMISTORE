using SAMMI.ECOM.Domain.AggregateModels.OrderBuy;
using SAMMI.ECOM.Domain.AggregateModels.Others;
using SAMMI.ECOM.Domain.Seeds;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SAMMI.ECOM.Domain.AggregateModels.AddressCategory;

[Table("Ward")]
public partial class Ward : Entity
{
    [Column("Code")]
    [MaxLength(100)]
    public string? Code { get; set; }
    [Column("Name")]
    [MaxLength(100)]
    public string? Name { get; set; }

    [ForeignKey("District")]
    public int? DistrictId { get; set; }


    public virtual District? District { get; set; }

    public virtual ICollection<CustomerAddress> CustomerAddresses { get; set; } = new List<CustomerAddress>();

    public virtual ICollection<User> Users { get; set; } = new List<User>();
    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
}
