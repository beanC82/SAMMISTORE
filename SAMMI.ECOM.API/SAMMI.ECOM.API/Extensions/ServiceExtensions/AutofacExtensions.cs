using Autofac;
using Autofac.Extensions.DependencyInjection;
using SAMMI.ECOM.API.Infrastructure.AutofacModules;

namespace SAMMI.ECOM.API.Extensions.ServiceExtensions
{
    public static class AutofacExtensions
    {
        public static void UseAutofacContainer(this ConfigureHostBuilder host, IConfiguration config)
        {
            host.UseServiceProviderFactory(new AutofacServiceProviderFactory());
            host.ConfigureContainer<ContainerBuilder>(b =>
            {
                b.RegisterModule(new ApplicationModule(config));
                b.RegisterModule<MediatorModule>();
            });
        }
    }
}
