using System.Text.Json.Serialization;

namespace SAMMI.ECOM.Core.Models
{
    public class PropertyFilterModel : ICloneable
    {
        public string Field { get; set; } = null!;
        public string Operator { get; set; } = null!;
        public object? FilterValue { get; set; } = null!;
        [JsonIgnore]
        public string? FilterColumn { get; set; }

        public object Clone()
        {
            return this.MemberwiseClone();
        }
    }
}
