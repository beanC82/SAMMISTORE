namespace SAMMI.ECOM.Domain.DomainModels.Auth
{
    public class RolePermissionDTO
    {
        public int PermissionId { get; set; }
        public string PermissionCode { get; set; }
        public string PermissionName { get; set; }
        public int RoleId { get; set; }
        public string RoleName { get; set; }
        public bool Allow { get; set; }
    }
}
