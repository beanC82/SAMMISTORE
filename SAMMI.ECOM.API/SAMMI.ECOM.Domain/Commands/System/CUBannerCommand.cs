using MediatR;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Domain.Commands.Products;
using SAMMI.ECOM.Domain.DomainModels.System;

namespace SAMMI.ECOM.Domain.Commands.System
{
    public class CUBannerCommand : IRequest<ActionResponse<BannerDTO>>
    {
        public string Name { get; set; } = null!;
        public int? ImageId { get; set; }
        public CreateImageCommand? ImageCommand { get; set; }
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
