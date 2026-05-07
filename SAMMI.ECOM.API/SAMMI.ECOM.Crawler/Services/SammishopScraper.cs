using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using System.Text.RegularExpressions;
using SAMMI.ECOM.Domain.AggregateModels.Products;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using System.Net;

namespace SAMMI.ECOM.Crawler.Services
{
    public class ScrapedProduct
    {
        public string Code { get; set; }
        public string Name { get; set; }
        public string BrandName { get; set; }
        public decimal Price { get; set; }
        public string Description { get; set; }
        public string Ingredients { get; set; }
        public string Uses { get; set; }
        public string UsageGuide { get; set; }
        public string CategoryName { get; set; }
        public List<string> ImageUrls { get; set; } = new();
        public string SourceUrl { get; set; }
    }

    public interface ISammishopScraper
    {
        Task<List<string>> GetProductUrls(int page);
        Task<ScrapedProduct> GetProductDetail(string url);
    }

    public class SammishopScraper : ISammishopScraper
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<SammishopScraper> _logger;
        private readonly string _baseUrl;

        public SammishopScraper(ILogger<SammishopScraper> logger, Microsoft.Extensions.Configuration.IConfiguration config, IHttpClientFactory httpClientFactory)
        {
            _httpClient = httpClientFactory.CreateClient();
            // Haravan/Shopify often requires a User-Agent to return JSON correctly in some cases
            _httpClient.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
            _logger = logger;
            _baseUrl = config["CrawlerSettings:BaseUrl"] ?? "https://sammishop.com";
        }

        public async Task<List<string>> GetProductUrls(int page)
        {
            var url = $"{_baseUrl}/collections/all/products.json?page={page}";
            _logger.LogInformation($"Fetching product list from API: {url}");
            
            try
            {
                var response = await _httpClient.GetFromJsonAsync<HaravanProductList>(url);
                if (response?.Products == null) return new List<string>();

                var links = response.Products
                                    .Select(p => $"{_baseUrl}/products/{p.Handle}")
                                    .ToList();

                return links;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error fetching product list from {url}");
                return new List<string>();
            }
        }

        public async Task<ScrapedProduct> GetProductDetail(string url)
        {
            // Extract handle from URL: https://sammishop.com/products/handle-name
            var handle = url.Split('/').Last().Split('?').First();
            var jsonUrl = $"{_baseUrl}/products/{handle}.js";
            
            _logger.LogInformation($"Fetching product detail from API: {jsonUrl}");

            try
            {
                var detail = await _httpClient.GetFromJsonAsync<HaravanProductDetail>(jsonUrl);
                if (detail == null) return null;

                var product = new ScrapedProduct
                {
                    SourceUrl = url,
                    Code = handle,
                    Name = detail.Title,
                    BrandName = detail.Vendor ?? "Sammi",
                    CategoryName = detail.ProductType ?? "Chăm sóc da",
                    Price = detail.Price / 100, // Haravan prices are in cents equivalent (without decimals)
                    Description = detail.Description
                };

                // Images
                product.ImageUrls = detail.Images?
                                          .Select(img => img.StartsWith("//") ? "https:" + img : img)
                                          .ToList() ?? new List<string>();

                // Heuristic parsing for sections from HTML description
                if (!string.IsNullOrEmpty(detail.Description))
                {
                    var cleanText = StripHtml(detail.Description);
                    product.Ingredients = ExtractSection(cleanText, "Thành phần");
                    product.Uses = ExtractSection(cleanText, "Công dụng");
                    product.UsageGuide = ExtractSection(cleanText, "Hướng dẫn sử dụng", "Cách dùng");
                }

                return product;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error fetching product detail from {jsonUrl}");
                return null;
            }
        }

        private string StripHtml(string input)
        {
            return Regex.Replace(input, "<.*?>", "\n");
        }

        private string ExtractSection(string text, params string[] keywords)
        {
            foreach (var kw in keywords)
            {
                var pattern = $@"{kw}:?\s*(.*?)(?=\n[A-Z\d]|$|Công dụng|Thành phần|Hướng dẫn|Cách dùng)";
                var match = Regex.Match(text, pattern, RegexOptions.Singleline | RegexOptions.IgnoreCase);
                if (match.Success && !string.IsNullOrWhiteSpace(match.Groups[1].Value))
                {
                    return match.Groups[1].Value.Trim();
                }
            }
            return null;
        }

        // Helper classes for Haravan/Shopify JSON
        private class HaravanProductList
        {
            [JsonPropertyName("products")]
            public List<HaravanProductSummary> Products { get; set; }
        }

        private class HaravanProductSummary
        {
            [JsonPropertyName("id")]
            public long Id { get; set; }
            [JsonPropertyName("title")]
            public string Title { get; set; }
            [JsonPropertyName("handle")]
            public string Handle { get; set; }
        }

        private class HaravanProductDetail
        {
            [JsonPropertyName("id")]
            public long Id { get; set; }
            [JsonPropertyName("title")]
            public string Title { get; set; }
            [JsonPropertyName("handle")]
            public string Handle { get; set; }
            [JsonPropertyName("description")]
            public string Description { get; set; }
            [JsonPropertyName("vendor")]
            public string Vendor { get; set; }
            [JsonPropertyName("type")]
            public string ProductType { get; set; }
            [JsonPropertyName("price")]
            public decimal Price { get; set; }
            [JsonPropertyName("images")]
            public List<string> Images { get; set; }
        }
    }
}
