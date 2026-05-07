using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Domain.DomainModels.System;

namespace SAMMI.ECOM.Domain.Commands.System
{
    public class CURoleCommand : IRequest<ActionResponse<RoleDTO>>
    {
        public string Code { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }

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
