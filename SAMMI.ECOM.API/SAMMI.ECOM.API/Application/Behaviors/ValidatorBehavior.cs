using FluentValidation;
using MediatR;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Utility;

namespace SAMMI.ECOM.API.Application.Behaviors
{
    public class ValidatorBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
        where TResponse : IActionResponse, new()
        where TRequest : IRequest<TResponse>
    {
        private readonly IValidator<TRequest>[] _validators;

        public ValidatorBehavior(IValidator<TRequest>[] validators)
        {
            _validators = validators;
        }

        public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
        {
            var typeName = request.GetGenericTypeName();

            var failures = _validators
                .Select(v => v.Validate(request))
                .SelectMany(result => result.Errors)
                .Where(error => error != null)
                .ToList();

            failures = failures.GroupBy(x => x.PropertyName)
                .Select(v => v.First())
                .ToList();

            if (failures.Any())
            {
                var actionResponse = new TResponse();
                actionResponse.AddValidationResults(failures);
                return actionResponse;
            }

            return await next();
        }
    }
}
