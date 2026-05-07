using MediatR;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Domain.Commands.Products;
using SAMMI.ECOM.Domain.DomainModels.OrderBuy;
using SAMMI.ECOM.Domain.Enums;

namespace SAMMI.ECOM.Domain.Commands.OrderBuy
{
    public class UpdateEventCommand : IRequest<ActionResponse<EventDTO>>
    {
        public string Code { get; set; } = null!;
        public string Name { get; set; } = null!;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public PromotionEventType? EventType { get; set; }
        public CreateImageCommand? ImageCommand { get; set; }
        public int? ImageId { get; set; }
        public string? Description { get; set; }


        public int Id { get; set; }
        public DateTime? CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public string? CreatedBy { get; set; }
        public string? UpdatedBy { get; set; }
        public bool IsActive { get; set; } = true;
        public bool IsDeleted { get; set; }
        public int? DisplayOrder { get; set; }
    }

    public class CreateEventCommand : UpdateEventCommand
    {
        public List<CUVoucherCommand> VoucherCommands { get; set; }
    }
}
