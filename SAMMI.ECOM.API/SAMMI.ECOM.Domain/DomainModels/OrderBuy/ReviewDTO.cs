namespace SAMMI.ECOM.Domain.DomainModels.OrderBuy
{
    public class ReviewDTO
    {
        public int ProductId { get; set; }
        public int UserId { get; set; }
        public string? CustomerName { get; set; }
        public string? CustomerImage { get; set; }
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public int? ImageId { get; set; }
        public string? ImageUrl { get; set; }

        public int Id { get; set; }
        public DateTime? CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public string? CreatedBy { get; set; }
        public string? UpdatedBy { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public int? DisplayOrder { get; set; }
    }

    public class OverallRatingDTO
    {
        public int TotalRating { get; set; }
        public decimal AverageRating { get; set; }
        public int TotalRating5 { get; set; }
        public int TotalRating4 { get; set; }
        public int TotalRating3 { get; set; }
        public int TotalRating2 { get; set; }
        public int TotalRating1 { get; set; }
        public int TotalComment { get; set; }
        public int TotalImage { get; set; }
    }
}
