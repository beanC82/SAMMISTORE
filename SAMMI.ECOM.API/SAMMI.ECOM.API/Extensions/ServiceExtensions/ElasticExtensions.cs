using SAMMI.ECOM.API.Application;
using SAMMI.ECOM.API.Infrastructure.Configuration;

namespace SAMMI.ECOM.API.Extensions.ServiceExtensions
{
    public static class ElasticExtensions
    {
        public static async Task AddElasticSearchConfig(this IServiceCollection services, IConfiguration config)
        {
            await services.AddElasticSearch(config);
        }
    }
}
