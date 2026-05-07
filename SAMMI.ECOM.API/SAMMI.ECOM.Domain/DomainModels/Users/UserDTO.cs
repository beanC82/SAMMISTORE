namespace SAMMI.ECOM.Domain.DomainModels.Users
{
    public class UserDTO
    {
        public int Id { get; set; }
        public string Code { get; set; } = null!;
        public string IdentityGuid { get; set; } = null!;
        public string? Type { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? StreetAddress { get; set; }
        public int? WardId { get; set; }
        public string? WardName { get; set; }
        public int? DistrictId { get; set; }
        public string? DistrictName { get; set; }
        public int? ProvinceId { get; set; }
        public string? ProvinceName { get; set; }
        public string? Username { get; set; }
        public bool? IsLock { get; set; }
        public string? Avatar { get; set; }
        public DateTime? Birthday { get; set; }
        public string? IdCardNumber { get; set; }


        public DateTime? CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public string? CreatedBy { get; set; }
        public string? UpdatedBy { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public int? DisplayOrder { get; set; }
    }

    public class EmployeeDTO : UserDTO
    {
        public int? Gender { get; set; }
        public bool? IsAdmin { get; set; }
        public int RoleId { get; set; }
    }

    public class CustomerDTO : UserDTO
    {
        public int? Gender { get; set; }
        public int RoleId { get; set; }
    }

    public class SupplierDTO : UserDTO
    {
    }
}
