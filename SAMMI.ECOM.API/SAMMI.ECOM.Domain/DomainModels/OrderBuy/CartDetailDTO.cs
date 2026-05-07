namespace SAMMI.ECOM.Domain.DomainModels.OrderBuy
{
    public class CartDetailDTO
    {
        public int CartId { get; set; }
        public int ProductId { get; set; }
        public string? ProductName { get; set; }
        public decimal? Price { get; set; }
        public decimal? NewPrice { get; set; }
        public int Quantity { get; set; }
        public string? ProductImage { get; set; }
        public int? StockQuantity { get; set; }


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
