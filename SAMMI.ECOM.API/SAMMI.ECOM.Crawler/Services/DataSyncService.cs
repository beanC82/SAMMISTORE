using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using SAMMI.ECOM.Domain.AggregateModels.Products;
using SAMMI.ECOM.Infrastructure;
using SAMMI.ECOM.Crawler.Services.External;
using SAMMI.ECOM.Infrastructure.Queries.Products;

namespace SAMMI.ECOM.Crawler.Services
{
    public interface IDataSyncService
    {
        Task SyncProduct(ScrapedProduct scraped, List<(string Url, string PublicId)> images);
    }

    public class DataSyncService : IDataSyncService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<DataSyncService> _logger;

        public DataSyncService(IServiceProvider serviceProvider, ILogger<DataSyncService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        public async Task SyncProduct(ScrapedProduct scraped, List<(string Url, string PublicId)> cloudImages)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<SammiEcommerceContext>();
                var elasticService = scope.ServiceProvider.GetRequiredService<IProductElasticService>();
                var productQueries = scope.ServiceProvider.GetRequiredService<IProductQueries>();
                
                var brand = await GetOrCreateBrandAsync(context, scraped.BrandName);
                var category = await GetOrCreateCategoryAsync(context, scraped.CategoryName);
                
                var truncatedName = scraped.Name?.Length > 100 ? scraped.Name.Substring(0, 97) + "..." : scraped.Name;
                var (product, isNew) = await GetOrCreateProductAsync(context, truncatedName, brand.Id, category.Id);

                UpdateProductDetails(product, scraped, brand.Id, category.Id);
                await context.SaveChangesAsync();

                await SyncProductImagesAsync(context, product, cloudImages);
                await context.SaveChangesAsync();

                // Sync to ElasticSearch for AI Chatbot
                try
                {
                    var productDto = await productQueries.GetById(product.Id);
                    if (productDto != null)
                    {
                        var elasticResult = await elasticService.AddOrUpdateProduct(productDto);
                        if (elasticResult)
                        {
                            _logger.LogInformation($"Successfully indexed product {scraped.Name} to ElasticSearch");
                        }
                        else
                        {
                            _logger.LogWarning($"Failed to index product {scraped.Name} to ElasticSearch");
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Error syncing product {scraped.Name} to ElasticSearch");
                }

                _logger.LogInformation($"{(isNew ? "Inserted" : "Updated")} product: {scraped.Name}");
            }
        }

        private async Task<Brand> GetOrCreateBrandAsync(SammiEcommerceContext context, string brandName)
        {
            var brand = await context.Brands.FirstOrDefaultAsync(b => b.Name.ToLower() == brandName.ToLower());
            if (brand == null)
            {
                brand = new Brand 
                { 
                    Name = brandName, 
                    Code = brandName.Replace(" ", "-").ToLower(), 
                    CreatedDate = DateTime.Now, 
                    IsActive = true 
                };
                context.Brands.Add(brand);
                await context.SaveChangesAsync();
            }
            return brand;
        }

        private async Task<ProductCategory> GetOrCreateCategoryAsync(SammiEcommerceContext context, string categoryName)
        {
            var category = await context.ProductCategories.FirstOrDefaultAsync(c => c.Name.ToLower() == categoryName.ToLower());
            if (category == null)
            {
                category = new ProductCategory
                {
                    Name = categoryName,
                    Code = categoryName.Replace(" ", "-").ToLower(),
                    Level = 1,
                    CreatedDate = DateTime.Now,
                    IsActive = true
                };
                context.ProductCategories.Add(category);
                await context.SaveChangesAsync();
            }
            return category;
        }

        private async Task<(Product Product, bool IsNew)> GetOrCreateProductAsync(SammiEcommerceContext context, string name, int brandId, int categoryId)
        {
            var product = await context.Products
                .Include(p => p.ProductImages)
                .ThenInclude(pi => pi.Image)
                .FirstOrDefaultAsync(p => p.Name == name && p.BrandId == brandId && p.CategoryId == categoryId);

            if (product == null)
            {
                var newProduct = new Product
                {
                    Code = "CRAWL_" + Guid.NewGuid().ToString().Substring(0, 8),
                    Name = name,
                    CreatedDate = DateTime.Now,
                    IsActive = true
                };
                context.Products.Add(newProduct);
                return (newProduct, true);
            }
            return (product, false);
        }

        private void UpdateProductDetails(Product product, ScrapedProduct scraped, int brandId, int categoryId)
        {
            product.Name = scraped.Name?.Length > 100 ? scraped.Name.Substring(0, 97) + "..." : scraped.Name;
            product.Price = scraped.Price;
            product.BrandId = brandId;
            product.CategoryId = categoryId;
            product.Ingredient = scraped.Ingredients;
            product.Uses = scraped.Uses;
            product.UsageGuide = scraped.UsageGuide;
            product.StockQuantity = 100;
            product.Discount = 0;
            product.UpdatedDate = DateTime.Now;
        }

        private async Task SyncProductImagesAsync(SammiEcommerceContext context, Product product, List<(string Url, string PublicId)> cloudImages)
        {
            foreach (var imgData in cloudImages)
            {
                if (string.IsNullOrEmpty(imgData.Url)) continue;

                if (!product.ProductImages.Any(pi => pi.Image.PublicId == imgData.PublicId))
                {
                    var newImg = new Image
                    {
                        ImageUrl = imgData.Url,
                        PublicId = imgData.PublicId,
                        TypeImage = "Product",
                        CreatedDate = DateTime.Now,
                        IsActive = true
                    };
                    context.Images.Add(newImg);
                    await context.SaveChangesAsync();

                    context.ProductImages.Add(new ProductImage
                    {
                        ProductId = product.Id,
                        ImageId = newImg.Id,
                        CreatedDate = DateTime.Now
                    });
                }
            }
        }
    }
}
