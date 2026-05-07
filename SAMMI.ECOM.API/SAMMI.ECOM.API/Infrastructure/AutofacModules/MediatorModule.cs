using Autofac;
using FluentValidation;
using MediatR;
using SAMMI.ECOM.API.Application.Behaviors;
using SAMMI.ECOM.API.Application.CommandHandlers;
using System.Reflection;

namespace SAMMI.ECOM.API.Infrastructure.AutofacModules
{
    public class MediatorModule : Autofac.Module
    {
        protected override void Load(ContainerBuilder builder)
        {
            // Register IMediator
            builder.RegisterAssemblyTypes(typeof(IMediator).GetTypeInfo().Assembly)
                .AsImplementedInterfaces();

            // Register all IRequestHandler
            builder.RegisterAssemblyTypes(typeof(CUProvinceCommandHandler).GetTypeInfo().Assembly)
                .AsClosedTypesOf(typeof(IRequestHandler<,>));

            // Register all IValidator
            builder
                .RegisterAssemblyTypes(typeof(CUProvinceCommandValidator).GetTypeInfo().Assembly)
                .Where(t => t.IsClosedTypeOf(typeof(IValidator<>)))
                .AsImplementedInterfaces();

            // Register IPipelineBehavior
            builder.RegisterGeneric(typeof(ValidatorBehavior<,>)).As(typeof(IPipelineBehavior<,>));
            builder.RegisterGeneric(typeof(TransactionBehavior<,>)).As(typeof(IPipelineBehavior<,>));
        }
    }
}
