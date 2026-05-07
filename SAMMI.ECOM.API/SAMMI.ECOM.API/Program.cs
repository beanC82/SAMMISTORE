using SAMMI.ECOM.API.Extensions.ApplicationBuilderExtensions;
using SAMMI.ECOM.API.Extensions.ServiceExtensions;
using SAMMI.ECOM.API.Infrastructure.Configuration;

var builder = WebApplication.CreateBuilder(args);

// Logging
builder.UseSerialLog();

// Core services
builder.Services.AddControllers();
builder.Services.AddAutoMapper(typeof(Program));
builder.Services.AddCoreServices();

// Extensions (grouped)
builder.Services.AddSwaggerConfig();
builder.Services.AddCorsConfig();
builder.Services.AddDatabase(builder.Configuration);
builder.Services.AddAuthenticationConfig(builder.Configuration);
builder.Services.AddAuthorizationConfig();
builder.Services.AddRedis(builder.Configuration);
await builder.Services.AddElasticSearchConfig(builder.Configuration);
builder.Services.AddSignalRConfig();
builder.Services.AddDataProtectionConfig();

// Autofac
builder.Host.UseAutofacContainer(builder.Configuration);

var app = builder.Build();

// Middleware
app.UseCors("CorsPolicy");
app.UseSwaggerConfig();
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.UseCustomMiddleware();

// Endpoints
app.MapCustomEndpoints();

app.Run();