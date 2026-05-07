namespace SAMMI.ECOM.Core.Models.GlobalConfigs
{
    public class SignInOptions
    {
        public int LockoutOnFailure { get; set; }
        public TimeSpan LockoutOnFailureTime { get; set; }
    }
}
