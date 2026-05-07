using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SAMMI.ECOM.Domain.AggregateModels.OrderBuy;

namespace SAMMI.ECOM.Infrastructure.EntityConfigurations
{
    public class ShippingCompanyEntityTypeConfiguration : IEntityTypeConfiguration<ShippingCompany>
    {
        public void Configure(EntityTypeBuilder<ShippingCompany> builder)
        {
            builder.HasKey(x => x.Id);
        }
    }
}
