using MediatR;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Domain.DomainModels.Users;
using System.ComponentModel;

namespace SAMMI.ECOM.Domain.Commands.User
{
    public class CUUserCommand
    {
        public int Id { get; set; }
        public string Code { get; set; } = null!;
        public string IdentityGuid { get; set; } = null!;
        public string? Type { get; set; }
        
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string Phone { get; set; }
        public string? StreetAddress { get; set; }
        public int? WardId { get; set; }
        [DefaultValue(false)]
        public bool IsLock { get; set; } = false;

        public DateTime? CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public string? CreatedBy { get; set; }
        public string? UpdatedBy { get; set; }
        [DefaultValue(true)]
        public bool IsActive { get; set; } = true;
        [DefaultValue(false)]
        public bool IsDeleted { get; set; }
        public int? DisplayOrder { get; set; }

    }

    public class CreateEmployeeCommand : CUUserCommand, IRequest<ActionResponse<EmployeeDTO>>
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string IdCardNumber { get; set; }
        [DefaultValue(false)]
        public bool? IsAdmin { get; set; } = false!;
        public int? Gender { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
        public string? SecurityStamp { get; set; }
        public int RoleId { get; set; }
        public string? VerifyToken { get; set; }
        public DateTime? VerifiedAt { get; set; }
        public DateTime? Birthday { get; set; }
    }

    public class UpdateEmployeeCommand : CUUserCommand, IRequest<ActionResponse<EmployeeDTO>>
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string IdCardNumber { get; set; }
        [DefaultValue(false)]
        public bool? IsAdmin { get; set; } = false!;
        public int RoleId { get; set; }
        public int? Gender { get; set; }
        public DateTime? Birthday { get; set; }
    }

    public class CUCustomerCommand : CUUserCommand, IRequest<ActionResponse<CustomerDTO>>
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public int? Gender { get; set; }
        public string? Username { get; set; }
        public string? Password { get; set; }
        public string? SecurityStamp { get; set; }
        public int? RoleId { get; set; }
        public string? VerifyToken { get; set; }
        public DateTime? VerifiedAt { get; set; }
        public DateTime? Birthday { get; set; }
    }

    public class CreateCustomerFasterCommand : IRequest<ActionResponse<CustomerDTO>>
    {
        public int Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public int? Gender { get; set; }
        public string? Email { get; set; }
        public string Phone { get; set; }

        public DateTime? CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public string? CreatedBy { get; set; }
        public string? UpdatedBy { get; set; }
        [DefaultValue(true)]
        public bool IsActive { get; set; } = true;
        [DefaultValue(false)]
        public bool IsDeleted { get; set; }
        public int? DisplayOrder { get; set; }
    }

    public class CUSupplierCommand : CUUserCommand, IRequest<ActionResponse<SupplierDTO>>
    {

    }
}
