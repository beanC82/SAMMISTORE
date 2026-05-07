using Microsoft.Extensions.Hosting;
using SAMMI.ECOM.Crawler.Services;
using SAMMI.ECOM.Infrastructure.Services.Caching;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace SAMMI.ECOM.Crawler
{
    public class Worker : BackgroundService
    {
        private readonly ILogger<Worker> _logger;
        private readonly ISammishopScraper _scraper;
        private readonly ICloudinaryUploader _uploader;
        private readonly IDataSyncService _syncService;
        private readonly IConfiguration _config;
        private readonly IRedisService<string> _redisService;

        private const string LAST_PAGE_KEY = "Crawler:LastPage";

        public Worker(
            ILogger<Worker> logger, 
            ISammishopScraper scraper, 
            ICloudinaryUploader uploader, 
            IDataSyncService syncService,
            IConfiguration config,
            IRedisService<string> redisService)
        {
            _logger = logger;
            _scraper = scraper;
            _uploader = uploader;
            _syncService = syncService;
            _config = config;
            _redisService = redisService;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            var intervalHours = _config.GetValue<int>("CrawlerSettings:IntervalHours", 12);

            while (!stoppingToken.IsCancellationRequested)
            {
                _logger.LogInformation("Crawler started at: {time}", DateTimeOffset.Now);

                try
                {
                    // Read last processed page from Redis
                    int currentPage = 1;
                    var lastPageStr = await _redisService.GetCache<string>(LAST_PAGE_KEY);
                    if (!string.IsNullOrEmpty(lastPageStr) && int.TryParse(lastPageStr, out var lastPage))
                    {
                        currentPage = lastPage + 1;
                    }

                    _logger.LogInformation($"Starting crawler cycle from page {currentPage}");

                    while (!stoppingToken.IsCancellationRequested)
                    {
                        var productUrls = await _scraper.GetProductUrls(currentPage);
                        if (productUrls == null || productUrls.Count == 0)
                        {
                            _logger.LogInformation($"No more products found on page {currentPage}. Resetting progress for next cycle.");
                            await _redisService.SetCache(LAST_PAGE_KEY, "0");
                            break;
                        }

                        _logger.LogInformation($"Found {productUrls.Count} products on page {currentPage}");

                        foreach (var url in productUrls)
                        {
                            if (stoppingToken.IsCancellationRequested) break;

                            try
                            {
                                var detail = await _scraper.GetProductDetail(url);
                                if (detail == null || string.IsNullOrEmpty(detail.Name)) continue;

                                var cloudImages = new List<(string Url, string PublicId)>();
                                
                                // Only process first 1-2 images to save time and cloudinary space during dev
                                foreach (var imgUrl in detail.ImageUrls.Take(1))
                                {
                                    var fileName = $"c_{Guid.NewGuid().ToString().Substring(0, 8)}";
                                    var uploaded = await _uploader.UploadFromUrl(imgUrl, fileName);
                                    if (uploaded.Url != null)
                                    {
                                        cloudImages.Add(uploaded);
                                    }
                                }

                                await _syncService.SyncProduct(detail, cloudImages);
                            }
                            catch (Exception ex)
                            {
                                _logger.LogError(ex, $"Error processing product at {url}");
                            }

                            // Minimal delay between products
                            await Task.Delay(1000, stoppingToken);
                        }

                        // Successfully processed the page, save to Redis
                        await _redisService.SetCache(LAST_PAGE_KEY, currentPage.ToString());
                        currentPage++;
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Crawler encountered a fatal error during the loop");
                }

                _logger.LogInformation("Crawler cycle finished. Waiting {hours} hours...", intervalHours);
                await Task.Delay(TimeSpan.FromHours(intervalHours), stoppingToken);
            }
        }
    }
}
