using System.Text.Json.Serialization;

namespace SAMMI.ECOM.Domain.DomainModels.Shipping
{
    public class ProvinceDTO
    {
        public int ProvinceID { get; set; }
        public string Code { get; set; }
        public string ProvinceName { get; set; }
    }
    public class DistrictDTO
    {
        public int DistrictID { get; set; }
        public string Code { get; set; }
        public string DistrictName { get; set; }
        public int ProvinceID { get; set; }
    }
    public class WardDTO
    {
        public string WardCode { get; set; }
        public string WardName { get; set; }
        public int DistrictID { get; set; }
    }

    public class ServiceDTO
    {
        [JsonPropertyName("service_id")]
        public int ServiceID { get; set; }
        [JsonPropertyName("short_name")]
        public string ShortName { get; set; }
        [JsonPropertyName("service_type_id")]
        public int ServiceTypeID { get; set; }
    }

    public class FeeRequestDTO
    {
        public decimal? InnsuranceValue { get; set; }
        public int FromDistrictID { get; set; }
        public int ToDistrictID { get; set; }
        public string ToWardCode { get; set; }
        public int ServiceID { get; set; }
        public int Weight { get; set; } // gram
        public int Length { get; set; } // cm
        public int Width { get; set; }  // cm
        public int Height { get; set; } // cm
    }

    public class FeeResponseDTO
    {
        public int Total { get; set; }
        [JsonPropertyName("service_fee")]
        public int ServiceFee { get; set; }
        [JsonPropertyName("insurance_fee")]
        public int InsuranceFee { get; set; }
        public DateTime LeadTime { get; set; }
    }

    public class LeadTimeResponseDTO
    {
        public long Leadtime { get; set; }
    }

    public class GHNResponse<T>
    {
        public int Code { get; set; }
        public string Message { get; set; }
        public T Data { get; set; }
    }
}
