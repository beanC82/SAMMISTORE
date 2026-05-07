namespace SAMMI.ECOM.API.Services.AI.Models
{
    public class ProductChatIntent
    {
        public string? Keyword { get; set; } // For specific brand or product name
        public string? Category { get; set; }
        public string? SkinType { get; set; } // expected labels: oily|dry|combination|sensitive|normal
        public List<string> Ingredients { get; set; } = new();
        public decimal? MaxPrice { get; set; }
        public int? Limit { get; set; }
        public string? SortBy { get; set; } // expected: price_asc | price_desc | etc.

        public string QueryType { get; set; } = "recommend"; // recommend|compare|ingredient_checker|clarification|follow_up|product_info
        public bool IsOutOfDomain { get; set; }
        public List<string> ClarifyingQuestions { get; set; } = new();
    }
}
