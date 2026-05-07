using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SAMMI.ECOM.Domain.AggregateModels.Others;

namespace SAMMI.ECOM.Infrastructure.EntityConfigurations
{
    public class UserEntityTypeConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.HasKey(x => x.Id);

            builder.HasOne(d => d.Ward)
                .WithMany(p => p.Users)
                .HasForeignKey(d => d.WardId);

            builder.HasOne(d => d.Avatar)
                .WithMany(p => p.UserImages)
                .HasForeignKey(d => d.AvatarId)
                .OnDelete(DeleteBehavior.ClientSetNull);

            builder.HasOne(d => d.Role)
                .WithMany(p => p.Users)
                .HasForeignKey(d => d.RoleId)
                .OnDelete(DeleteBehavior.ClientSetNull);
        }
    }
}
