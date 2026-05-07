namespace SAMMI.ECOM.Domain.GlobalModels.Common
{
    public class SelectionItem
    {
        public string? Text { get; set; }
        public string? Code { get; set; }
        public int? Value { get; set; }
        public object? GlobalValue { get; set; }
        public int? ParentId { get; set; }
        public int? DisplayOrder { get; set; }
        public string? TreePath { get; set; }
        public bool? IsDefault { get; set; }
    }
}
