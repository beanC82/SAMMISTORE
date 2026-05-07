namespace SAMMI.ECOM.Domain.DomainModels.System
{
    public class BannerDTO
    {
        public string Name { get; set; } = null!;
        public int? ImageId { get; set; }
        public string? ImageUrl { get; set; }
        public int Level { get; set; }

        public int Id { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public string? CreatedBy { get; set; }
        public string? UpdatedBy { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public int? DisplayOrder { get; set; }
    }
}
