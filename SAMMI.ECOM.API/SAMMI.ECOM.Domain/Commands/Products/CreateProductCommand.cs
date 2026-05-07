using MediatR;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Domain.DomainModels.Products;

namespace SAMMI.ECOM.Domain.Commands.Products
{
    public class ProductCommand : IRequest<ActionResponse<ProductDTO>>
    {
        public string Code { get; set; } = null!;
        public string Name { get; set; } = null!;
        public decimal Price { get; set; }
        public decimal? Discount { get; set; }
        public string? Ingredient { get; set; }
        public string? Uses { get; set; }
        public string? UsageGuide { get; set; }
        public int? BrandId { get; set; }
        public int? CategoryId { get; set; }
        public int? Status { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }


        public int Id { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public string? CreatedBy { get; set; }
        public string? UpdatedBy { get; set; }
        public bool IsActive { get; set; } = true;
        public bool IsDeleted { get; set; }
        public int? DisplayOrder { get; set; }
    }
    public class CreateProductCommand : ProductCommand
    {
        public decimal? ImportPrice { get; set; }
        public int StockQuantity { get; set; }
        public List<CreateImageCommand>? Images { get; set; }
    }

    public class UpdateProductCommand : ProductCommand
    {
        public List<ImageDTO>? ExistImages { get; set; }
        public List<CreateImageCommand>? NewImages { get; set; }
    }
}

