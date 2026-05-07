using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SAMMI.ECOM.Domain.AggregateModels.System;

namespace SAMMI.ECOM.Infrastructure.EntityConfigurations
{
    public class SysFunctionEntityTypeConfiguration : IEntityTypeConfiguration<SysFunction>
    {
        public void Configure(EntityTypeBuilder<SysFunction> builder)
        {
            builder.HasKey(x => x.Id);
        }
    }
}
