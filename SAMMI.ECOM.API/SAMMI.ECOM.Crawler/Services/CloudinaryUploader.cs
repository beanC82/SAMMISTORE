using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace SAMMI.ECOM.Crawler.Services
{
    public interface ICloudinaryUploader
    {
        Task<(string Url, string PublicId)> UploadFromUrl(string imageUrl, string fileName);
    }

    public class CloudinaryUploader : ICloudinaryUploader
    {
        private readonly Cloudinary _cloudinary;
        private readonly string _folder;
        private readonly HttpClient _httpClient;
        private readonly ILogger<CloudinaryUploader> _logger;

        public CloudinaryUploader(IConfiguration config, ILogger<CloudinaryUploader> logger, HttpClient httpClient)
        {
            var account = new Account(
                config["CloundSettings:CloudName"],
                config["CloundSettings:CloudKey"],
                config["CloundSettings:CloudSecret"]);
            _cloudinary = new Cloudinary(account);
            _folder = config["CloundSettings:ImageProductFolder"] ?? "uploads/products";
            _httpClient = httpClient;
            _logger = logger;
        }

        public async Task<(string Url, string PublicId)> UploadFromUrl(string imageUrl, string fileName)
        {
            try
            {
                var response = await _httpClient.GetAsync(imageUrl);
                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError($"Failed to download image from {imageUrl}");
                    return (null, null);
                }

                using (var stream = await response.Content.ReadAsStreamAsync())
                {
                    var uploadParams = new ImageUploadParams()
                    {
                        File = new FileDescription(fileName, stream),
                        PublicId = fileName,
                        Folder = _folder
                    };

                    var uploadResult = await _cloudinary.UploadAsync(uploadParams);
                    if (uploadResult.Error != null)
                    {
                        _logger.LogError($"Cloudinary upload error: {uploadResult.Error.Message}");
                        return (null, null);
                    }

                    return (uploadResult.SecureUri.ToString(), uploadResult.PublicId);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Exception uploading image {imageUrl} to Cloudinary");
                return (null, null);
            }
        }
    }
}
