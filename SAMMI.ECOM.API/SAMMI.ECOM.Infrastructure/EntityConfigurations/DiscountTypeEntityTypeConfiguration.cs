using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SAMMI.ECOM.Domain.AggregateModels.EventVoucher;

namespace SAMMI.ECOM.Infrastructure.EntityConfigurations
{
    public class DiscountTypeEntityTypeConfiguration : IEntityTypeConfiguration<DiscountType>
    {
        public void Configure(EntityTypeBuilder<DiscountType> builder)
        {
            builder.HasKey(x => x.Id);
        }
    }
}
