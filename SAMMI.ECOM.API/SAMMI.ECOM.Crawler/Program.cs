using Autofac;
using Autofac.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Configuration;
using Nest;
using SAMMI.ECOM.Core.Authorizations;
using SAMMI.ECOM.Infrastructure.Services;
using SAMMI.ECOM.Infrastructure.Services.Caching;
using SAMMI.ECOM.Crawler.Services;
using SAMMI.ECOM.Crawler.Services.External;
using SAMMI.ECOM.Infrastructure.Queries.Products;
using SAMMI.ECOM.Infrastructure;
using StackExchange.Redis;

var builder = Host.CreateApplicationBuilder(args);

// Redis Setup
var redisConnectionString = builder.Configuration.GetValue<string>("RedisOptions:ConnectionString");
builder.Services.AddSingleton<IConnectionMultiplexer>(ConnectionMultiplexer.Connect(redisConnectionString));

// DB Context Setup
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
var serverVersion = new MySqlServerVersion(new Version(9, 2, 0));

builder.Services.AddDbContext<SammiEcommerceContext>(options =>
    options.UseMySql(connectionString, serverVersion)
);

// Infrastructure Services Setup
builder.Services.AddHttpClient();
builder.Services.AddMemoryCache();
builder.Services.AddHttpContextAccessor(); // Required for UserIdentity

// Use Autofac as the DI provider
builder.ConfigureContainer(new AutofacServiceProviderFactory(), containerBuilder =>
{
    // Register Crawler Services
    containerBuilder.RegisterType<SammishopScraper>().As<ISammishopScraper>().SingleInstance();
    containerBuilder.RegisterType<CloudinaryUploader>().As<ICloudinaryUploader>().SingleInstance();
    containerBuilder.RegisterType<DataSyncService>().As<IDataSyncService>().SingleInstance();

    // Register Infrastructure Services
    containerBuilder.RegisterType<ProductQueries>().As<IProductQueries>().InstancePerLifetimeScope();
    containerBuilder.RegisterType<ProductElasticService>().As<IProductElasticService>().InstancePerLifetimeScope();
    containerBuilder.RegisterType<ProductTaggerService>().As<IProductTaggerService>().InstancePerLifetimeScope();
    containerBuilder.RegisterType<UserIdentity>().AsSelf().InstancePerLifetimeScope();
    containerBuilder.RegisterType<CookieService>().As<ICookieService>().InstancePerLifetimeScope();
    containerBuilder.RegisterType<MemoryCacheService>().As<IMemoryCacheService>().InstancePerLifetimeScope();
    containerBuilder.RegisterGeneric(typeof(RedisService<>)).As(typeof(IRedisService<>)).InstancePerLifetimeScope();

    // Register ElasticClient
    containerBuilder.Register(c =>
    {
        var config = c.Resolve<IConfiguration>();
        var settings = new ConnectionSettings(new Uri(config["ElasticSettings:baseUrl"]))
            .DefaultIndex(config["ElasticSettings:defaultIndex"])
            .BasicAuthentication(config["ElasticSettings:user"], config["ElasticSettings:password"]);

        return new ElasticClient(settings);
    }).As<IElasticClient>().SingleInstance();
});

// Worker
builder.Services.AddHostedService<SAMMI.ECOM.Crawler.Worker>();

var host = builder.Build();
host.Run();
