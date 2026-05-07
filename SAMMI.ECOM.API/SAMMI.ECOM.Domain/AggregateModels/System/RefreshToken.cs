using SAMMI.ECOM.Domain.Seeds;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SAMMI.ECOM.Domain.AggregateModels.System
{
    [Table("RefreshToken")]
    public class RefreshToken : Entity
    {
        [StringLength(4000)]
        [Column("Token")]
        public string Token { get; set; } = null!;
        [Column("ExpirationDateUtc")]
        public DateTime ExpirationDateUtc { get; set; }
        [Column("UserId")]
        public int UserId { get; set; }
        [Column("IsExchanged")]
        public bool IsExchanged { get; set; }
        [Column("IsInvalid")]
        public bool IsInvalid { get; set; }
    }
}
