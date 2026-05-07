using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SAMMI.ECOM.Domain.AggregateModels.OrderBuy;

namespace SAMMI.ECOM.Infrastructure.EntityConfigurations
{
    public class OrderEntityTypeConfiguration : IEntityTypeConfiguration<Order>
    {
        public void Configure(EntityTypeBuilder<Order> builder)
        {
            builder.HasKey(x => x.Id);

            builder.HasOne(d => d.Customer)
                .WithMany(p => p.Orders)
                .HasForeignKey(d => d.CustomerId)
                .OnDelete(DeleteBehavior.ClientSetNull);

            builder.HasOne(d => d.Voucher)
                .WithMany(p => p.Orders)
                .HasForeignKey(d => d.VoucherId);

            builder.HasOne(d => d.Ward)
                .WithMany(p => p.Orders)
                .HasForeignKey(d => d.WardId);

            builder.HasOne(d => d.ShippingCompany)
                .WithMany(p => p.Orders)
                .HasForeignKey(d => d.ShippingCompanyId)
                .OnDelete(DeleteBehavior.ClientSetNull);
        }
    }
}
