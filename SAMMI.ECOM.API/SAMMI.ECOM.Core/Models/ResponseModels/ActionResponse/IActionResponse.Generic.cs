namespace SAMMI.ECOM.Core.Models
{
    public interface IActionResponse<out T> : IActionResponse
    {
        /// <summary>
        /// Holds the value set using SetSuccessWithResult
        /// </summary>
        T? Result { get; }
    }
}
