using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SAMMI.ECOM.Domain.AggregateModels.EventVoucher;

namespace SAMMI.ECOM.Infrastructure.EntityConfigurations
{
    public class VoucherEntityTypeConfiguration : IEntityTypeConfiguration<Voucher>
    {
        public void Configure(EntityTypeBuilder<Voucher> builder)
        {
            builder.HasKey(x => x.Id);

            builder.HasOne(d => d.DiscountType)
                .WithMany(p => p.Vouchers)
                .HasForeignKey(d => d.DiscountTypeId);
        }
    }
}
