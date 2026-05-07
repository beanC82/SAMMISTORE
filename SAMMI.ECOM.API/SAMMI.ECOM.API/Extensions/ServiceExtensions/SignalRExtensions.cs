namespace SAMMI.ECOM.API.Extensions.ServiceExtensions
{
    public static class SignalRExtensions
    {
        public static IServiceCollection AddSignalRConfig(this IServiceCollection services)
        {
            services.AddSignalR();
            return services;
        }
    }
}
