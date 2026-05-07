using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Jpeg;
using SixLabors.ImageSharp.Processing;

namespace SAMMI.ECOM.API.Services.MediaResource
{
    public interface IFileStorageService
    {
        Task<string> SaveFileImage(IFormFile file);
        Task<List<string>> SaveFileImages(List<IFormFile> files);
        bool DeleteFile(string fileName);
    }
    public class FileStorageService : IFileStorageService
    {
        private readonly IWebHostEnvironment _env;
        private readonly IConfiguration _config;
        private readonly IConfiguration _imageResource;
        public FileStorageService(IWebHostEnvironment env,
            IConfiguration config)
        {
            _env = env;
            _config = config;
            _imageResource = config.GetSection("ImageResource");
        }

        public bool DeleteFile(string fileName)
        {
            string folder = _imageResource.GetValue<string>("FolderStorage");
            string filePath = Path.Combine(_env.WebRootPath, folder, fileName);
            if (File.Exists(filePath))
            {
                File.Delete(filePath);
                return true;
            }
            return false;
        }

        public async Task<string> SaveFileImage(IFormFile file)
        {
            string folder = _imageResource.GetValue<string>("FolderStorage");
            int width = _imageResource.GetValue<int>("Size_With");
            int height = _imageResource.GetValue<int>("Size_Height");
            int quality = _imageResource.GetValue<int>("Quality");


            var uploadFolder = Path.Combine(_env.WebRootPath, folder);
            if (!Directory.Exists(uploadFolder))
            {
                Directory.CreateDirectory(uploadFolder);
            }
            if (file == null || file.Length == 0)
            {
                return null;
            }

            string extension = Path.GetExtension(file.FileName)?.ToLower();

            if (string.IsNullOrEmpty(extension))
            {
                extension = ".jpg";
            }
            string fileName = $"{Guid.NewGuid()}{extension}";
            string filePath = Path.Combine(uploadFolder, fileName);
            try
            {
                using (var image = Image.Load(file.OpenReadStream()))
                {
                    image.Mutate(x => x.Resize(new ResizeOptions
                    {
                        Size = new Size(width, height),
                        Mode = ResizeMode.Max
                    }));

                    var encoder = new JpegEncoder
                    {
                        Quality = quality
                    };
                    await image.SaveAsJpegAsync(filePath, encoder);
                }

                return fileName;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error when save iamge: ", ex.ToString());
                return null;
            }

        }

        public async Task<List<string>> SaveFileImages(List<IFormFile> files)
        {
            var filePaths = new List<string>();
            if (files == null || files.Count == 0)
                return null;

            foreach (var file in files)
            {
                string result = await SaveFileImage(file);
                if (result == null)
                {
                    return null;
                }
                else
                    filePaths.Add(result);
            }

            return filePaths;
        }
    }
}
