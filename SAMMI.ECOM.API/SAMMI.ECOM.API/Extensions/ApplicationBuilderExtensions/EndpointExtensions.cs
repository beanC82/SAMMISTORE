using SAMMI.ECOM.Infrastructure.Hubs;

namespace SAMMI.ECOM.API.Extensions.ApplicationBuilderExtensions
{
    public static class EndpointExtensions
    {
        public static IEndpointRouteBuilder MapCustomEndpoints(this IEndpointRouteBuilder endpoints)
        {
            endpoints.MapControllers();
            endpoints.MapHub<NotificationHub>("/notificationHub");
            return endpoints;
        }
    }
}
