using SAMMI.ECOM.API.Infrastructure.Configuration;

namespace SAMMI.ECOM.API.Extensions.ApplicationBuilderExtensions
{
    public static class MiddlewareExtensions
    {
        public static IApplicationBuilder UseCustomMiddleware(this IApplicationBuilder app)
        {
            app.UseMiddleware<ExceptionMiddleware>();
            return app;
        }
    }
}
