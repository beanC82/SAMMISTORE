using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SAMMI.ECOM.Domain.AggregateModels.AddressCategory;

namespace SAMMI.ECOM.Infrastructure.EntityConfigurations
{
    public class WardEntityTypeConfiguration : IEntityTypeConfiguration<Ward>
    {
        public void Configure(EntityTypeBuilder<Ward> builder)
        {
            builder.HasKey(x => x.Id);

            builder.HasOne(d => d.District)
                .WithMany(p => p.Wards)
                .HasForeignKey(d => d.DistrictId);
        }
    }
}
