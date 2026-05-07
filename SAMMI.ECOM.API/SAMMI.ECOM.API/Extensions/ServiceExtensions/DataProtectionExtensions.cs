using Microsoft.AspNetCore.DataProtection;

namespace SAMMI.ECOM.API.Extensions.ServiceExtensions
{
    public static class DataProtectionExtensions
    {
        public static IServiceCollection AddDataProtectionConfig(this IServiceCollection services)
        {
            services.AddDataProtection()
                .PersistKeysToFileSystem(new DirectoryInfo(@"/var/sammi-api-keys"))
                .SetApplicationName("SammiAPI");

            return services;
        }
    }
}
