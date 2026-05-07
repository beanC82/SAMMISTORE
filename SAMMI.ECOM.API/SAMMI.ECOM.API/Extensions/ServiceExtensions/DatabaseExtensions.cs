using Microsoft.EntityFrameworkCore;
using SAMMI.ECOM.Infrastructure;

namespace SAMMI.ECOM.API.Extensions.ServiceExtensions
{
    public static class DatabaseExtensions
    {
        public static IServiceCollection AddDatabase(this IServiceCollection services, IConfiguration config)
        {
            var serverVersion = new MySqlServerVersion(new Version(9, 2, 0));

            services.AddDbContext<SammiEcommerceContext>(options =>
                options.UseMySql(config.GetConnectionString("DefaultConnection"), serverVersion)
                       .LogTo(Console.WriteLine, LogLevel.Information)
                       .EnableSensitiveDataLogging()
                       .EnableDetailedErrors()
            );

            return services;
        }
    }
}
