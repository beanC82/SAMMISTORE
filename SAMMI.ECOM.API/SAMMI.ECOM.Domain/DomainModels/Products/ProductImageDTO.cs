namespace SAMMI.ECOM.Domain.DomainModels.Products
{
    public class ImageDTO
    {
        public string? ImageUrl { get; set; }
        public string? PublicId { get; set; }
        public string? TypeImage { get; set; }


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
