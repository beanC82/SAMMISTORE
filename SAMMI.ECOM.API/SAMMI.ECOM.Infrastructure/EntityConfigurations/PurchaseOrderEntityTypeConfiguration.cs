using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SAMMI.ECOM.Domain.AggregateModels.PurcharseOrder;

namespace SAMMI.ECOM.Infrastructure.EntityConfigurations
{
    public class PurchaseOrderEntityTypeConfiguration : IEntityTypeConfiguration<PurchaseOrder>
    {
        public void Configure(EntityTypeBuilder<PurchaseOrder> builder)
        {
            builder.HasKey(x => x.Id);

            builder.HasOne(d => d.Employee)
                .WithMany(p => p.PurchaseOrderEmployees)
                .HasForeignKey(d => d.EmployeeId)
                .OnDelete(DeleteBehavior.ClientSetNull);

            builder.HasOne(d => d.Supplier)
                .WithMany(p => p.PurchaseOrderSuppliers)
                .HasForeignKey(d => d.SupplierId)
                .OnDelete(DeleteBehavior.ClientSetNull);
        }
    }
}
