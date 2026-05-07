using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Domain.DomainModels.Users;

namespace SAMMI.ECOM.Domain.Commands.User
{
    public class UpdateInfoRequest
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public int? Gender { get; set; }
        public DateTime? Birthday { get; set; }
    }
    public class UpdateCustomerInfoRequest : UpdateInfoRequest, IRequest<ActionResponse<CustomerDTO>>
    {
        
    }

    public class UpdateEmployeeInfoRequest : UpdateInfoRequest, IRequest<ActionResponse<EmployeeDTO>>
    {
        public string? StreetAddress { get; set; }
        public int? WardId { get; set; }
        public string? IdCardNumber { get; set; }
    }
}
