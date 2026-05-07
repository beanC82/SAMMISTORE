using SAMMI.ECOM.Domain.AggregateModels.AddressCategory;
using SAMMI.ECOM.Domain.AggregateModels.EventVoucher;
using SAMMI.ECOM.Domain.AggregateModels.OrderBuy;
using SAMMI.ECOM.Domain.AggregateModels.Products;
using SAMMI.ECOM.Domain.AggregateModels.PurcharseOrder;
using SAMMI.ECOM.Domain.AggregateModels.System;
using SAMMI.ECOM.Domain.Seeds;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SAMMI.ECOM.Domain.AggregateModels.Others;

[Table("Users")]
public partial class User : Entity
{
    [Column("Code")]
    [Required]
    [StringLength(256)]
    public string Code { get; set; } = null!;

    [Column("IdentityGuid")]
    [Required]
    [StringLength(36)]
    public string IdentityGuid { get; set; } = null!;

    [Column("Type")]
    [StringLength(50)]
    public string? Type { get; set; }

    [Column("FirstName")]
    [StringLength(50)]
    public string? FirstName { get; set; }

    [Column("LastName")]
    [StringLength(50)]
    public string? LastName { get; set; }

    [Column("FullName")]
    [StringLength(100)]
    public string? FullName { get; set; }

    [Column("Email")]
    [StringLength(100)]
    public string? Email { get; set; }

    [Column("Phone")]
    [StringLength(20)]
    public string? Phone { get; set; }

    [Column("StreetAddress")]
    [StringLength(200)]
    public string? StreetAddress { get; set; }

    [ForeignKey("Ward")]
    [Column("WardId")]
    public int? WardId { get; set; }

    [Column("IsAdmin")]
    public bool? IsAdmin { get; set; }

    [Column("Username")]
    [StringLength(100)]
    public string? Username { get; set; }

    [Column("Password")]
    [StringLength(255)]
    public string? Password { get; set; }

    [Column("Gender")]
    public int? Gender { get; set; }

    [Column("IsLock")]
    public bool IsLock { get; set; } = false;

    // để tăng cường bảo mật: Xác thực phiên người dùng, Phát hiện các thay đổi quan trọng
    [StringLength(68)]
    [Column("SecurityStamp")]
    public string? SecurityStamp { get; set; }

    [ForeignKey("Avatar")]
    [Column("AvatarId")]
    public int? AvatarId { get; set; }

    [Column("IdCardNumber")]
    public string? IdCardNumber { get; set; } // căn cước công dân
    [ForeignKey("Role")]
    public int? RoleId { get; set; }

    [Column("IsVerify")]
    public bool? IsVerify { get; set; }

    [Column("VerifyToken")]
    public string? VerifyToken { get; set; }
    [Column("VerifiedAt")]
    public DateTime? VerifiedAt { get; set; }
    [Column("Birthday")]
    public DateTime? Birthday { get; set; }

    public virtual ICollection<CustomerAddress> CustomerAddresses { get; set; } = new List<CustomerAddress>();

    public virtual ICollection<FavouriteProduct> FavouriteProducts { get; set; } = new List<FavouriteProduct>();

    public virtual ICollection<Message> MessageCustomers { get; set; } = new List<Message>();

    public virtual ICollection<Message> MessageEmployees { get; set; } = new List<Message>();

    public virtual ICollection<MyVoucher> MyVouchers { get; set; } = new List<MyVoucher>();

    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    public virtual ICollection<PurchaseOrder> PurchaseOrderEmployees { get; set; } = new List<PurchaseOrder>();

    public virtual ICollection<PurchaseOrder> PurchaseOrderSuppliers { get; set; } = new List<PurchaseOrder>();

    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();

    public virtual Ward? Ward { get; set; }

    public virtual Role? Role { get; set; }

    public virtual Image? Avatar { get; set; }
    public virtual ICollection<Cart> Carts { get; set; } = new List<Cart>();
}