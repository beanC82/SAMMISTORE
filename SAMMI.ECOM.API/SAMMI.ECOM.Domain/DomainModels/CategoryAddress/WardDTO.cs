namespace SAMMI.ECOM.Domain.DomainModels.CategoryAddress
{
    public class WardDTO
    {
        public int Id { get; set; }
        public string? Code { get; set; }
        public string? Name { get; set; }
        public int? DistrictId { get; set; }
        public string? DistrictName { get; set; }
        public int? ProvinceId { get; set; }
        public string? ProvinceName { get; set; }


        public DateTime? CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public string? CreatedBy { get; set; }
        public string? UpdatedBy { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public int? DisplayOrder { get; set; }
    }
}
