using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SAMMI.ECOM.Domain.AggregateModels.System;

namespace SAMMI.ECOM.Infrastructure.EntityConfigurations
{
    public class BannerEntityTypeConfiguration : IEntityTypeConfiguration<Banner>
    {
        public void Configure(EntityTypeBuilder<Banner> builder)
        {
            builder.HasKey(x => x.Id);

            builder.HasOne(d => d.Image)
                .WithMany(p => p.BannerImages)
                .HasForeignKey(d => d.ImageId)
                .OnDelete(DeleteBehavior.ClientSetNull);
        }
    }
}
