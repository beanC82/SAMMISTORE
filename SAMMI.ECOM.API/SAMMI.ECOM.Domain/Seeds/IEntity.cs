namespace SAMMI.ECOM.Domain.Seeds
{
    public interface IEntity
    {
        int Id { get; set; }
        string? Culture { get; set; }
        DateTime CreatedDate { get; set; }
        DateTime? UpdatedDate { get; set; }
        string? CreatedBy { get; set; }
        string? UpdatedBy { get; set; }
        bool IsActive { get; set; }
        bool IsDeleted { get; set; }
        int? DisplayOrder { get; set; }
    }
}
