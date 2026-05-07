using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SAMMI.ECOM.Domain.AggregateModels.EventVoucher;

namespace SAMMI.ECOM.Infrastructure.EntityConfigurations
{
    public class MyVoucherEntityTypeConfiguration : IEntityTypeConfiguration<MyVoucher>
    {
        public void Configure(EntityTypeBuilder<MyVoucher> builder)
        {
            builder.HasKey(x => x.Id);

            builder.HasOne(d => d.Customer)
                .WithMany(p => p.MyVouchers)
                .HasForeignKey(d => d.CustomerId)
                .OnDelete(DeleteBehavior.ClientSetNull);

            builder.HasOne(d => d.Voucher)
                .WithMany(p => p.MyVouchers)
                .HasForeignKey(d => d.VoucherId)
                .OnDelete(DeleteBehavior.ClientSetNull);
        }
    }
}
