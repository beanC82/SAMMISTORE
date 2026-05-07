using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SAMMI.ECOM.Domain.AggregateModels.AddressCategory;

namespace SAMMI.ECOM.Infrastructure.EntityConfigurations
{
    public class ProvinceEntityTypeConfiguration : IEntityTypeConfiguration<Province>
    {
        public void Configure(EntityTypeBuilder<Province> builder)
        {
            builder.HasKey(x => x.Id);
        }
    }
}
