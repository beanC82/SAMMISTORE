using SAMMI.ECOM.Infrastructure.Services.Caching;
using StackExchange.Redis;

namespace SAMMI.ECOM.API.Extensions.ServiceExtensions
{
    public static class RedisExtensions
    {
        public static IServiceCollection AddRedis(this IServiceCollection services, IConfiguration config)
        {
            try
            {
                var redisConnString = config.GetValue<string>("RedisOptions:ConnectionString");
                var multiplexer = ConnectionMultiplexer.Connect(redisConnString);
                services.AddSingleton<IConnectionMultiplexer>(multiplexer);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error connect Redis: {ex.Message}");
            }

            services.AddScoped(typeof(IRedisService<>), typeof(RedisService<>));

            return services;
        }
    }
}
