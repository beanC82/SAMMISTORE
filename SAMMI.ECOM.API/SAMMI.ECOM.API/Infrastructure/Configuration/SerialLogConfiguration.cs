using Serilog;

namespace SAMMI.ECOM.API.Infrastructure.Configuration
{
    public static class SerialLogConfiguration
    {
        public static void UseSerialLog(this WebApplicationBuilder builder)
        {
            Log.Logger = new LoggerConfiguration()
                .ReadFrom.Configuration(builder.Configuration)
                .Enrich.FromLogContext()
                .WriteTo.Console()
                .WriteTo.File(
                    formatter: new Serilog.Formatting.Json.JsonFormatter(),
                    path: "Logs/log-.txt",
                    rollingInterval: RollingInterval.Day,
                    restrictedToMinimumLevel: Serilog.Events.LogEventLevel.Information)
                .CreateLogger();

            builder.Host.UseSerilog();
        }
    }
}