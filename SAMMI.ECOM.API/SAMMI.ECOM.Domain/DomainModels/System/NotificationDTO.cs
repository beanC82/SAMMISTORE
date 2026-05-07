using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SAMMI.ECOM.Domain.DomainModels.System
{
    public class NotificationDTO
    {
        public string Title { get; set; } = null!;
        public string Content { get; set; } = null!;
        public int ReceiverId { get; set; }
        public int? OrderId { get; set; }
        public bool? IsReaded { get; set; }

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
