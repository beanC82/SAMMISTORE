using Microsoft.Extensions.Caching.Memory;
using SAMMI.ECOM.Domain.DomainModels.Products;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace SAMMI.ECOM.API.Services.Gemini
{
    public interface IProductTaggerService
    {
        Task ApplyTagsAsync(ProductDTO product, CancellationToken cancellationToken = default);
    }

    public class ProductTaggerService : IProductTaggerService
    {
        private readonly IConfiguration _configuration;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IMemoryCache _memoryCache;

        public ProductTaggerService(
            IConfiguration configuration,
            IHttpClientFactory httpClientFactory,
            IMemoryCache memoryCache)
        {
            _configuration = configuration;
            _httpClientFactory = httpClientFactory;
            _memoryCache = memoryCache;
        }

        public async Task ApplyTagsAsync(ProductDTO product, CancellationToken cancellationToken = default)
        {
            if (product == null) return;

            var input = $"{product.Ingredient ?? string.Empty}\n{product.UsageGuide ?? string.Empty}".Trim();
            if (string.IsNullOrWhiteSpace(input))
            {
                product.SkinTypes = new List<string> { "normal" };
                product.PotentialIrritants = new List<string>();
                return;
            }

            var cacheKey = $"product-tags:{Sha256(input.ToLowerInvariant())}";
            if (_memoryCache.TryGetValue(cacheKey, out ProductTagResult? cached) && cached != null)
            {
                product.SkinTypes = cached.SkinTypes;
                product.PotentialIrritants = cached.PotentialIrritants;
                return;
            }

            // Default to heuristic tags; use Gemini if API key is configured and request succeeds.
            var result = await TryGeminiTaggingAsync(input, cancellationToken);
            if (result == null)
            {
                result = HeuristicTagging(input);
            }

            product.SkinTypes = result.SkinTypes;
            product.PotentialIrritants = result.PotentialIrritants;

            _memoryCache.Set(cacheKey, result, TimeSpan.FromDays(14));
        }

        private ProductTagResult HeuristicTagging(string input)
        {
            var lower = input.ToLowerInvariant();

            var skinTypes = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            var potentialIrritants = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            // Potential irritants (keywords are heuristic and should be tuned later).
            if (ContainsAny(lower, "fragrance", "parfum", "hương liệu", "hương thơm", "linalool", "limonene"))
                potentialIrritants.Add("fragrance");
            if (ContainsAny(lower, "alcohol denat", "ethanol", "cồn", "denatured alcohol"))
                potentialIrritants.Add("alcohol");
            if (ContainsAny(lower, "retinol", "retinal", "tretinoin", "retino")) // retinoids
                potentialIrritants.Add("retinoid");
            if (ContainsAny(lower, "salicylic acid", "bha", "aha", "glycolic acid", "lactic acid"))
                potentialIrritants.Add("acids");

            // Some calming/skin-barrier cues (reduce likelihood of irritation).
            var hasCalming = ContainsAny(lower, "panthenol", "allantoin", "centella", "cica", "madecassoside", "bisabolol");
            var hasBarrierSupport = ContainsAny(lower, "ceramide", "cholesterol", "fatty acid", "hyaluronic acid", "sodium hyaluronate", "beta-glucan");

            if (ContainsAny(lower, "salicylic acid", "bha", "zinc", "charcoal") || ContainsAny(lower, "mụn", "mụn trứng cá"))
                skinTypes.Add("oily");

            if (ContainsAny(lower, "niacinamide", "vitamin b3", "zinc pca") && !skinTypes.Contains("oily"))
                skinTypes.Add("combination");

            if (hasBarrierSupport || ContainsAny(lower, "dry", "khô", "thiếu ẩm", "mất nước"))
                skinTypes.Add("dry");

            if (hasCalming || potentialIrritants.Contains("fragrance") || potentialIrritants.Contains("alcohol"))
                skinTypes.Add("sensitive");

            if (skinTypes.Count == 0)
                skinTypes.Add("normal");

            return new ProductTagResult()
            {
                SkinTypes = skinTypes.ToList(),
                PotentialIrritants = potentialIrritants.ToList()
            };
        }

        private async Task<ProductTagResult?> TryGeminiTaggingAsync(string input, CancellationToken cancellationToken)
        {
            var apiKey = _configuration["GeminiSettings:ApiKey"] ?? Environment.GetEnvironmentVariable("GEMINI_API_KEY");
            if (string.IsNullOrWhiteSpace(apiKey))
                return null;

            var model = _configuration["GeminiSettings:Model"] ?? "gemini-1.5-flash";

            // Keep the prompt strict so we can parse JSON reliably.
            var prompt = $@"Bạn là chuyên gia phân tích mỹ phẩm.
Hãy suy luận (không chẩn đoán y khoa) dựa trên danh sách ingredient/usageGuide của sản phẩm.
Trả về JSON KHÔNG kèm giải thích với schema:
{{
  ""skinTypes"": string[] ,   // các nhãn trong tập: [""oily"",""dry"",""combination"",""sensitive"",""normal""]
  ""potentialIrritants"": string[] // các nhãn gợi ý: [""fragrance"",""alcohol"",""retinoid"",""acids"",""essential_oils"",""unknown""]
}}
Quy tắc:
- Chỉ trả các nhãn phù hợp nhất (0-3 nhãn).
- Nếu không chắc, chọn ""normal"" cho skinTypes và [] cho potentialIrritants.
INPUT:
{input}";

            var url = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}";

            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        role = "user",
                        parts = new[] { new { text = prompt } }
                    }
                },
                generationConfig = new
                {
                    temperature = 0.2,
                    responseMimeType = "application/json"
                }
            };

            try
            {
                var client = _httpClientFactory.CreateClient();
                using var response = await client.PostAsJsonAsync(url, requestBody, cancellationToken);
                if (!response.IsSuccessStatusCode) return null;

                var json = await response.Content.ReadAsStringAsync(cancellationToken);
                using var doc = JsonDocument.Parse(json);

                // Typical Gemini response: candidates[0].content.parts[0].text
                var text = doc.RootElement
                    .GetProperty("candidates")[0]
                    .GetProperty("content")
                    .GetProperty("parts")[0]
                    .GetProperty("text")
                    .GetString();

                if (string.IsNullOrWhiteSpace(text))
                    return null;

                // Sometimes text is already JSON, sometimes it's wrapped; try parse directly first.
                if (TryParseTagResultJson(text, out var parsed))
                    return parsed;

                // Fallback: attempt to extract the first JSON object in the text.
                var start = text.IndexOf('{');
                var end = text.LastIndexOf('}');
                if (start >= 0 && end > start)
                {
                    var maybeJson = text.Substring(start, end - start + 1);
                    if (TryParseTagResultJson(maybeJson, out parsed))
                        return parsed;
                }

                return null;
            }
            catch
            {
                // Ignore Gemini errors and fallback heuristic.
                return null;
            }
        }

        private static bool TryParseTagResultJson(string text, out ProductTagResult result)
        {
            try
            {
                using var doc = JsonDocument.Parse(text);
                var root = doc.RootElement;

                var skinTypes = root.TryGetProperty("skinTypes", out var st)
                    ? st.EnumerateArray().Select(x => x.GetString() ?? string.Empty).Where(s => !string.IsNullOrWhiteSpace(s)).ToList()
                    : new List<string>();

                var potentialIrritants = root.TryGetProperty("potentialIrritants", out var pi)
                    ? pi.EnumerateArray().Select(x => x.GetString() ?? string.Empty).Where(s => !string.IsNullOrWhiteSpace(s)).ToList()
                    : new List<string>();

                if (skinTypes.Count == 0)
                    skinTypes = new List<string> { "normal" };

                result = new ProductTagResult()
                {
                    SkinTypes = skinTypes,
                    PotentialIrritants = potentialIrritants
                };

                return true;
            }
            catch
            {
                result = new ProductTagResult();
                return false;
            }
        }

        private static bool ContainsAny(string haystack, params string[] needles)
        {
            foreach (var n in needles)
            {
                if (haystack.Contains(n.ToLowerInvariant()))
                    return true;
            }
            return false;
        }

        private static string Sha256(string raw)
        {
            using var sha = SHA256.Create();
            var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(raw));
            var sb = new StringBuilder(bytes.Length * 2);
            foreach (var b in bytes)
                sb.Append(b.ToString("x2"));
            return sb.ToString();
        }

        private class ProductTagResult
        {
            public List<string> SkinTypes { get; set; } = new();
            public List<string> PotentialIrritants { get; set; } = new();
        }
    }
}

