namespace SAMMI.ECOM.Domain.ModelViews
{
    public class ChangePasswordModelView
    {
        public string? OldPassword { get; set; }
        public string NewPassword { get; set; } = null!;
        public string ConfirmPassword { get; set; } = null!;
    }

    public class ChangePasswordUserModelView : ChangePasswordModelView
    {
        public string Username { get; set; } = null!;
        //public string? Permission { get; set; }
    }
}
