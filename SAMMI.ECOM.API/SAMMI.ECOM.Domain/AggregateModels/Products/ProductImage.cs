using SAMMI.ECOM.Domain.Seeds;
using System.ComponentModel.DataAnnotations.Schema;

namespace SAMMI.ECOM.Domain.AggregateModels.Products
{
    [Table("ProductImage")]
    public partial class ProductImage : Entity
    {
        [ForeignKey("Product")]
        public int? ProductId { get; set; }
        [ForeignKey("ImageId")]
        public int? ImageId { get; set; }

        public virtual Product Product { get; set; } = null!;
        public virtual Image Image { get; set; } = null!;
    }
}
