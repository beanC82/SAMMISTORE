using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SAMMI.ECOM.Domain.AggregateModels;

namespace SAMMI.ECOM.Infrastructure.EntityConfigurations
{
    public class CustomerAddressEntityTypeConfiguration : IEntityTypeConfiguration<CustomerAddress>
    {
        public void Configure(EntityTypeBuilder<CustomerAddress> builder)
        {
            builder.HasKey(x => x.Id);

            builder.HasOne(d => d.Customer)
                .WithMany(p => p.CustomerAddresses)
                .HasForeignKey(d => d.CustomerId);

            builder.HasOne(d => d.Ward)
                .WithMany(p => p.CustomerAddresses)
                .HasForeignKey(d => d.WardId);
        }
    }
}
