using Newtonsoft.Json;
using SAMMI.ECOM.Domain.Enums;

namespace SAMMI.ECOM.Domain.Commands.OrderBuy
{
    public class VoucherConditionCommand
    {
        public int VoucherId { get; set; }
        public ConditionTypeEnum ConditionType { get; set; }
        public object ConditionValue { get; set; }

        public int Id { get; set; }
        public DateTime? CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public string? CreatedBy { get; set; }
        public string? UpdatedBy { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public int? DisplayOrder { get; set; }
    }

    public class TierLevelCommand
    {
        [JsonProperty("level")]
        public int Level { get; set; } // Cấp bậc
        [JsonProperty("discount")]
        public decimal Discount { get; set; } // Giảm giá tương ứng
    }

    public class AllowedRegionCommand
    {
        public string RegionId { get; set; }
    }

    public class RequiredProductCommand
    {
        public string ProductId { get; set; }
    }
}
