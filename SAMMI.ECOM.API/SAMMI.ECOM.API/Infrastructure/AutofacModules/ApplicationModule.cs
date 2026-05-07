using Autofac;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Caching.Memory;
using Nest;
using SAMMI.ECOM.API.Application;
using SAMMI.ECOM.API.Controllers;
using SAMMI.ECOM.API.Infrastructure.Configuration;
using SAMMI.ECOM.API.Services.AI;
using SAMMI.ECOM.API.Services.ElasticSearch;
using SAMMI.ECOM.API.Services.Gemini;
using SAMMI.ECOM.API.Services.MediaResource;
using SAMMI.ECOM.Core.Authorizations;
using SAMMI.ECOM.Core.Models.GlobalConfigs;
using SAMMI.ECOM.Core.Utillity;
using SAMMI.ECOM.Domain.AggregateModels.Others;
using SAMMI.ECOM.Infrastructure.Queries;
using SAMMI.ECOM.Infrastructure.Repositories;
using SAMMI.ECOM.Infrastructure.Services;
using SAMMI.ECOM.Infrastructure.Services.Auth;
using SAMMI.ECOM.Infrastructure.Services.Auth.Helpers.PasswordVerification;
using SAMMI.ECOM.Infrastructure.Services.Caching;
using SAMMI.ECOM.Infrastructure.Services.GHN_API;
using SAMMI.ECOM.Infrastructure.Services.SignalR;
using SAMMI.ECOM.Repository.GenericRepositories;
using System.Reflection;

namespace SAMMI.ECOM.API.Infrastructure.AutofacModules
{
    public class ApplicationModule : Autofac.Module
    {
        private IConfiguration configuration;

        public ApplicationModule(IConfiguration configuration)
        {
            this.configuration = configuration;
        }

        protected override void Load(ContainerBuilder builder)
        {
            builder.Register(c => c.Resolve<HttpContext>())
               .As<HttpContext>()
               .SingleInstance();

            builder.RegisterType<HttpContextAccessor>()
                .As<IHttpContextAccessor>()
                .SingleInstance();

            builder.RegisterType<UserIdentity>()
                .AsSelf()
                .UsingConstructor(typeof(IHttpContextAccessor));

            builder.Register(s => configuration.GetSection("PasswordOptions")
                .Get<PasswordOptions>() ?? new PasswordOptions())
                .SingleInstance();
            builder.Register(s => configuration.GetSection("TokenProvideOptions")
                .Get<AccessTokenProvideOptions>() ?? new AccessTokenProvideOptions())
                .SingleInstance();
            builder.Register(s => configuration.GetSection("RefreshTokenProvideOptions")
                .Get<RefreshTokenProvideOptions>() ?? new RefreshTokenProvideOptions())
                .SingleInstance();


            builder.RegisterGeneric(typeof(PasswordHasher<>))
                .As(typeof(IPasswordHasher<>))
                .SingleInstance();

            builder.RegisterType<EFAuthenticationService>().As<IAuthenticationService<User>>();

            builder.RegisterType<FileStorageService>().As<IFileStorageService>();
            builder.RegisterType<CloudinaryService>().As<ICloudinaryService>();
            builder.RegisterType<GHNService>().As<IGHNService>().InstancePerLifetimeScope();
            builder.RegisterType<GoogleAuthenticationHandler>()
                .AsSelf()
                .InstancePerLifetimeScope();

            builder.RegisterType<ElasticClient>().As<IElasticClient>().SingleInstance();
            builder.RegisterType<ProductElasticService>().As<IProductElasticService>().SingleInstance();
            builder.RegisterType<ProductTaggerService>().As<IProductTaggerService>().SingleInstance();
            builder.RegisterType<OpenAIClient>().As<IAIClient>().SingleInstance();
            builder.RegisterGeneric(typeof(ElasticService<>))
                .As(typeof(IElasticService<>))
                .SingleInstance();

            builder.RegisterType<EmailHelper>().As<EmailHelper>().SingleInstance();

            builder.RegisterType<PermissionAuthorizationHandler>().As<IAuthorizationHandler>().InstancePerLifetimeScope();

            builder.RegisterType<CookieService>().As<ICookieService>().InstancePerLifetimeScope();

            builder.RegisterType<MemoryCacheService>().As<IMemoryCacheService>().InstancePerLifetimeScope();

            builder.RegisterType<MemoryCacheService>().As<IMemoryCacheService>().InstancePerLifetimeScope();

            builder.RegisterType<SignalRNotificationService>()
                .AsSelf()
                .SingleInstance();

            // Register all the Repository classes (they implement CrudRepository) in assembly holding the Repositories
            builder.RegisterAssemblyTypes(typeof(UsersRepository).GetTypeInfo().Assembly)
                .AsClosedTypesOf(typeof(ICrudRepository<>));

            // Register all the Queries classes (they implement QueryRepository) in assembly holding the QueryRepositories
            builder.RegisterAssemblyTypes(typeof(UsersQueries).GetTypeInfo().Assembly)
                .AsImplementedInterfaces();

            builder.RegisterAssemblyTypes(typeof(CustomBaseController).Assembly).PropertiesAutowired();
            base.Load(builder);
        }
    }
}
