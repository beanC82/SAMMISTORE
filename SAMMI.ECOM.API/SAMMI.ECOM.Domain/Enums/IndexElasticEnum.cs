using System.ComponentModel;

namespace SAMMI.ECOM.Domain.Enums
{
    public enum IndexElasticEnum
    {
        [Description("products")]
        Product,
        [Description("brands")]
        Brand,
        [Description("product-categories")]
        Category
    }

    public enum CompletionElasticEnum
    {
        [Description("products-suggest")]
        SuggestProduct
    }
}
