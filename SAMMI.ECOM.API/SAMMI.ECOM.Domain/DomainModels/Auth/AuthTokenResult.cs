namespace SAMMI.ECOM.Domain.DomainModels.Auth
{
    public class AuthTokenResult
    {
        public string? AccessToken { get; set; }
        public string? RefreshToken { get; set; }
        public string? AntiForgeryToken { get; set; }
    }
}
