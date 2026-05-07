using SAMMI.ECOM.API.Services.AI.Models;

namespace SAMMI.ECOM.API.Services.AI
{
    public interface IAIClient
    {
        Task<ProductChatIntent?> ExtractIntentAsync(string userQuery, string? historyText = null, CancellationToken cancellationToken = default);
        Task<string> GenerateResponseAsync(string prompt, string? systemInstruction = null, CancellationToken cancellationToken = default);
    }
}
