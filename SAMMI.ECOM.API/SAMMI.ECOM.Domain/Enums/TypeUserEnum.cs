using System.ComponentModel;

namespace SAMMI.ECOM.Domain.Enums
{
    public enum TypeUserEnum
    {
        Customer,
        Employee,
        Supplier
    }

    public enum RoleTypeEnum
    {
        ADMIN,
        MANAGER,
        EMPLOYEE,
        CUSTOMER
    }

    public enum CodeEnum
    {
        [Description("KH")]
        Customer,
        [Description("NV")]
        Employee,
        [Description("NCC")]
        Supplier,
        [Description("TH")]
        Brand,
        [Description("PC")]
        ProductCategory,
        [Description("SP")]
        Product,
        [Description("EVE")]
        Event,
        [Description("SAMMI")]
        Voucher,
        [Description("PNH")]
        PurchaseOrder
    }
}
