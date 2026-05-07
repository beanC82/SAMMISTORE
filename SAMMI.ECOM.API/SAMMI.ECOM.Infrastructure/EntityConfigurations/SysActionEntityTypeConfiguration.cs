using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SAMMI.ECOM.Domain.AggregateModels.System;

namespace SAMMI.ECOM.Infrastructure.EntityConfigurations
{
    public class SysActionEntityTypeConfiguration : IEntityTypeConfiguration<SysAction>
    {
        public void Configure(EntityTypeBuilder<SysAction> builder)
        {
            builder.HasKey(x => x.Id);
        }
    }
}
