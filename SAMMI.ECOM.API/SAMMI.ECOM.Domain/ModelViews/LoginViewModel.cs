using System.ComponentModel.DataAnnotations;

namespace SAMMI.ECOM.Domain.ModelViews
{
    public class LoginViewModel
    {
        public string? Username { get; set; }
        [DataType(DataType.Password)]
        public string? Password { get; set; }
        public bool RememberMe { get; set; }
        public string? ReturnUrl { get; set; }
        public bool? IsEmployee { get; set; }
    }
}
