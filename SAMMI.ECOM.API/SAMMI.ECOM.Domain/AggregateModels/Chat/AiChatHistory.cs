using SAMMI.ECOM.Domain.Seeds;
using System.ComponentModel.DataAnnotations.Schema;

namespace SAMMI.ECOM.Domain.AggregateModels.Chat
{
    [Table("AiChatHistories")]
    public class AiChatHistory : Entity
    {
        [Column("UserId")]
        public int? UserId { get; set; }

        [Column("ConversationId")]
        public string ConversationId { get; set; } = string.Empty;

        [Column("Role")]
        public string Role { get; set; } = string.Empty; // user | assistant

        [Column("Content")]
        public string Content { get; set; } = string.Empty;

        [Column("Metadata")]
        public string? Metadata { get; set; }
    }
}
