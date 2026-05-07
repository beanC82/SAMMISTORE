namespace SAMMI.ECOM.API.Extensions.ServiceExtensions
{
    public static class CoreServiceExtensions
    {
        public static IServiceCollection AddCoreServices(this IServiceCollection services)
        {
            services.AddMemoryCache();
            services.AddHttpClient();

            services.Configure<RouteOptions>(options =>
            {
                options.LowercaseUrls = true;
            });

            services.Configure<CookiePolicyOptions>(options =>
            {
                options.MinimumSameSitePolicy = SameSiteMode.None;
            });

            services.AddHttpsRedirection(options =>
            {
                options.HttpsPort = null;
            });

            return services;
        }
    }
}
