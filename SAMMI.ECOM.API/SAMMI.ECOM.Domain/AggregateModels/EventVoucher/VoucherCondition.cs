using SAMMI.ECOM.Domain.Seeds;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SAMMI.ECOM.Domain.AggregateModels.EventVoucher
{
    [Table("VoucherCondition")]
    public class VoucherCondition : Entity
    {
        [ForeignKey("Voucher")]
        public int VoucherId { get; set; }
        [MaxLength(50)]
        public string ConditionType { get; set; }
        [MaxLength(255)]
        public string ConditionValue { get; set; }

        public virtual Voucher Voucher { get; set; } = null!;
    }
}
