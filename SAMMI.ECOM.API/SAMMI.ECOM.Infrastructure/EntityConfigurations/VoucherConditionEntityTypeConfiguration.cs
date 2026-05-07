using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SAMMI.ECOM.Domain.AggregateModels.EventVoucher;

namespace SAMMI.ECOM.Infrastructure.EntityConfigurations
{
    public class VoucherConditionEntityTypeConfiguration : IEntityTypeConfiguration<VoucherCondition>
    {
        public void Configure(EntityTypeBuilder<VoucherCondition> builder)
        {
            builder.HasKey(x => x.Id);

            builder.HasOne(d => d.Voucher)
                .WithMany(p => p.VoucherConditions)
                .HasForeignKey(d => d.VoucherId);
        }
    }
}
