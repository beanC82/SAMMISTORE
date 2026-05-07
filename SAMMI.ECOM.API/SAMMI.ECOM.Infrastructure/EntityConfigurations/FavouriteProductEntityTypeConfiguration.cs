using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SAMMI.ECOM.Domain.AggregateModels.Others;

namespace SAMMI.ECOM.Infrastructure.EntityConfigurations
{
    public class FavouriteProductEntityTypeConfiguration : IEntityTypeConfiguration<FavouriteProduct>
    {
        public void Configure(EntityTypeBuilder<FavouriteProduct> builder)
        {
            builder.HasKey(x => x.Id);

            builder.HasOne(d => d.Customer)
                .WithMany(p => p.FavouriteProducts)
                .HasForeignKey(d => d.CustomerId)
                .OnDelete(DeleteBehavior.ClientSetNull);

            builder.HasOne(d => d.Product).WithMany(p => p.FavouriteProducts)
                .HasForeignKey(d => d.ProductId)
                .OnDelete(DeleteBehavior.ClientSetNull);
        }
    }
}
