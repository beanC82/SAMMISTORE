namespace SAMMI.ECOM.Domain.DomainModels.CategoryAddress
{
    public class CustomerAddressDTO
    {
        public int? CustomerId { get; set; }
        public string? StreetAddress { get; set; }
        public int? WardId { get; set; }
        public string? WardName { get; set; }
        public int? DistrictId { get; set; }
        public string? DistrictName { get; set; }
        public int? ProvinceId { get; set; }
        public string? ProvinceName { get; set; }
        public bool? IsDefault { get; set; }


        public int Id { get; set; }
        public DateTime? CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public string? CreatedBy { get; set; }
        public string? UpdatedBy { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public int? DisplayOrder { get; set; }
    }
}
