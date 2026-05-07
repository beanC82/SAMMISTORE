
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using SAMMI.ECOM.Domain.Enums;

namespace SAMMI.ECOM.API.Services.MediaResource
{
    public interface ICloudinaryService
    {
        Task<string> UploadBase64Image(string base64Image, string fileName, string type);
        Task<bool> UploadImages(List<IFormFile> files, ImageEnum type);
        Task<bool> DeleteImage(string publicId);
    }
    public class CloudinaryService : ICloudinaryService
    {
        private readonly Cloudinary _cloudinary;
        private readonly IConfiguration _configuration;
        public CloudinaryService(IConfiguration config)
        {
            _configuration = config;
            var account = new Account(
                config["CloundSettings:CloudName"],
                config["CloundSettings:CloudKey"],
                config["CloundSettings:CloudSecret"]);
            _cloudinary = new Cloudinary(account);
        }
        public async Task<bool> DeleteImage(string publicId)
        {
            var deleteParams = new DeletionParams(publicId);
            var result = await _cloudinary.DestroyAsync(deleteParams);
            return result.Result == "ok";
        }

        public async Task<string> UploadBase64Image(string base64Image, string fileName, string type)
        {
            byte[] imageBytes = Convert.FromBase64String(base64Image);
            var folderMapping = new Dictionary<ImageEnum, string>
            {
                { ImageEnum.Product, _configuration["CloundSettings:ImageProductFolder"] },
                { ImageEnum.Brand, _configuration["CloundSettings:ImageBrandFolder"] },
                { ImageEnum.User, _configuration["CloundSettings:ImageUserFolder"] },
                { ImageEnum.Banner, _configuration["CloundSettings:ImageBannerFolder"] },
                { ImageEnum.Event, _configuration["CloundSettings:ImageEventFolder"] }
            };
            if (!Enum.TryParse(type, true, out ImageEnum imageType))
            {
                imageType = ImageEnum.Product;
            }
            string folder = folderMapping.TryGetValue(imageType, out var mappedFolder)
                            ? mappedFolder
                            : _configuration["CloundSettings:ImageProductFolder"];
            using (var stream = new MemoryStream(imageBytes))
            {
                var uploadParams = new ImageUploadParams()
                {
                    File = new FileDescription(fileName, stream),
                    PublicId = fileName,
                    Folder = folder
                };

                try
                {
                    var uploadResult = await _cloudinary.UploadAsync(uploadParams);
                    if (uploadResult.Error != null)
                    {
                        Console.WriteLine("Error upload cloudinary: ", uploadResult.Error.Message);
                    }
                    return uploadResult != null && uploadResult.SecureUri != null ? uploadResult.SecureUri.ToString() : null;
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Error upload cloudinary: ", ex.ToString());
                }

                return null;
            }
        }

        public async Task<bool> UploadImages(List<IFormFile> files, ImageEnum type)
        {
            // Lấy thư mục tương ứng với ImageEnum
            var folderMapping = new Dictionary<ImageEnum, string>
            {
                { ImageEnum.Product, _configuration["CloundSettings:ImageProductFolder"] },
                { ImageEnum.Brand, _configuration["CloundSettings:ImageBrandFolder"] },
                { ImageEnum.User, _configuration["CloundSettings:ImageUserFolder"] },
                { ImageEnum.Banner, _configuration["CloundSettings:ImageBannerFolder"] },
                { ImageEnum.Event, _configuration["CloundSettings:ImageEventFolder"] }
            };

            string folder = folderMapping.TryGetValue(type, out var mappedFolder)
                            ? mappedFolder
                            : _configuration["CloundSettings:ImageProductFolder"];

            // Duyệt qua danh sách tệp và tải lên từng tệp
            foreach (var file in files)
            {
                if (file.Length > 0)
                {
                    using (var stream = file.OpenReadStream())
                    {
                        var uploadParams = new ImageUploadParams()
                        {
                            File = new FileDescription(file.FileName, stream),
                            PublicId = Path.GetFileNameWithoutExtension(file.FileName),
                            Folder = folder
                        };

                        try
                        {
                            var uploadResult = await _cloudinary.UploadAsync(uploadParams);
                            if (uploadResult.Error != null)
                            {
                                Console.WriteLine($"Error uploading file {file.FileName}: {uploadResult.Error.Message}");
                                return false; // Dừng lại nếu có lỗi
                            }
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"Exception uploading file {file.FileName}: {ex.Message}");
                            return false; // Dừng lại nếu có lỗi
                        }
                    }
                }
            }

            return true; // Trả về true nếu tất cả tệp được tải lên thành công
        }
    }
}
