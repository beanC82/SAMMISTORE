using MediatR;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Infrastructure;
using SAMMI.ECOM.Utility;
using Serilog.Context;

namespace SAMMI.ECOM.API.Application.Behaviors
{
    public class TransactionBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
        where TResponse : IActionResponse, new()
        where TRequest : IRequest<TResponse>
    {
        private readonly ILogger<TransactionBehavior<TRequest, TResponse>> _logger;
        private readonly SammiEcommerceContext _dbContext;

        public TransactionBehavior(ILogger<TransactionBehavior<TRequest, TResponse>> logger,
            SammiEcommerceContext dbContext)
        {
            _logger = logger;
            _dbContext = dbContext;
        }

        public async Task<TResponse> Handle(TRequest request,
            RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
        {
            var response = default(TResponse);
            var typeName = request.GetGenericTypeName();

            try
            {
                if (_dbContext.HasActiveTransaction)
                {
                    return await next();
                }

                var strategy = _dbContext.Database.CreateExecutionStrategy();

                await strategy.ExecuteAsync(async () =>
                {
                    Guid transactionId;

                    using (var transaction = await _dbContext.BeginTransactionAsync())
                    using (LogContext.PushProperty("TransactionContext", transaction.TransactionId))
                    {
                        response = await next();
                        transactionId = transaction.TransactionId;
                        var resultType = response?.GetType();
                        if (response is IActionResponse actionResponse && !actionResponse.IsSuccess)
                        {
                            _dbContext.RollbackTransaction();
                            transactionId = Guid.Empty;
                            _logger.LogError(new Exception("Command handling failed"), "ERROR Handling transaction for {CommandName} ({@Command}) {Message}", typeName, request, JsonConvert.SerializeObject(response));
                        }
                        else
                        {
                            await _dbContext.CommitTransactionAsync(transaction);
                        }
                    }
                });

                return response;
            }
            catch (Exception e)
            {
                _logger.LogError(e, "ERROR Handling transaction for {CommandName} ({@Command})", typeName, request);
                throw;
            }
        }
    }
}
