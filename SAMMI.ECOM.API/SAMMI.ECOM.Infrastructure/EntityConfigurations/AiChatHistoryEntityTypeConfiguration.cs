using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SAMMI.ECOM.Domain.AggregateModels.Chat;

namespace SAMMI.ECOM.Infrastructure.EntityConfigurations
{
    public class AiChatHistoryEntityTypeConfiguration : IEntityTypeConfiguration<AiChatHistory>
    {
        public void Configure(EntityTypeBuilder<AiChatHistory> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.ConversationId).IsRequired().HasMaxLength(50);
            builder.Property(x => x.Role).IsRequired().HasMaxLength(20);
            builder.Property(x => x.Content).IsRequired();
            
            // Optional: Index for faster searching by ConversationId or UserId
            builder.HasIndex(x => x.ConversationId);
            builder.HasIndex(x => x.UserId);
        }
    }
}
