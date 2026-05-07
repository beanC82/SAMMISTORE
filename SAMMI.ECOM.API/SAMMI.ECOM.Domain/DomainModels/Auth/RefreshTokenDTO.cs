namespace SAMMI.ECOM.Domain.DomainModels.Auth
{
    public class RefreshTokenDTO
    {
        public int Id { get; set; }
        public string Token { get; set; } = null!;
        public DateTime ExpirationDateUtc { get; set; }
        public int UserId { get; set; }
        public bool IsExchanged { get; set; }
        public bool IsInvalid { get; set; }
    }
}
