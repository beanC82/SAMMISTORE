using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace SAMMI.ECOM.Core.Models.GlobalConfigs
{
    public class RefreshTokenProvideOptions
    {
        public string JWTSecretKey { get; set; } = string.Empty;
        public string? JWTIssuer { get; set; }
        public string[] JWTIssuers
        {
            get
            {
                return string.IsNullOrWhiteSpace(JWTIssuer) ? new string[] { } : JWTIssuer.Split(',');
            }
        }
        public TimeSpan Expiration { get; set; } = TimeSpan.FromDays(7);

        public SigningCredentials SigningCredentials
        {
            get
            {
                var signingKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(JWTSecretKey));
                return new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);
            }
        }
    }
}
