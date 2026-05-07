using AutoMapper;
using FluentValidation.Results;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Newtonsoft.Json;
using SAMMI.ECOM.Core.Authorizations;
using SAMMI.ECOM.Core.Models;
using ValidationResult = System.ComponentModel.DataAnnotations.ValidationResult;

namespace SAMMI.ECOM.API.Controllers
{
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public abstract class CustomBaseController : ControllerBase
    {
        // Lay ve nguoi dung hien tai dang su dung website
        public UserIdentity? UserIdentity { get; set; }
        public IMapper Mapper { get; set; } = null!;
        protected readonly IMediator _mediator;
        protected readonly ILogger _logger;
        protected CustomBaseController(
            IMediator mediator,
            ILogger logger)
        {
            _mediator = mediator;
            _logger = logger;
        }

        public override OkResult Ok()
        {
            return new OkResult();
        }

        public override OkObjectResult Ok(object? result)
        {
            if (result == null) return new OkObjectResult(null);

            var resultType = result?.GetType();

            if (resultType != null && resultType.IsGenericType)
            {
                if (resultType.GetGenericTypeDefinition() == typeof(IActionResponse<>)
                    || resultType.GetGenericTypeDefinition() == typeof(ActionResponse<>))
                {
                    var message = resultType.GetProperty("Message")?.GetValue(result, null)?.ToString();
                    var resultValue = resultType.GetProperty("Result")?.GetValue(result, null);
                    return new OkObjectResult(EndPointHasResultResponse.Success(resultValue, message));
                }
            }
            else if (result is IActionResponse actionResponse)
            {
                return new OkObjectResult(EndPointResponse.Success(actionResponse.Message));
            }

            return new OkObjectResult(EndPointHasResultResponse.Success(result));
        }

        public override BadRequestResult BadRequest()
        {
            return new BadRequestResult();
        }

        public override BadRequestObjectResult BadRequest(ModelStateDictionary modelState)
        {
            return BadRequest((object)modelState);
        }

        public override BadRequestObjectResult BadRequest(object error)
        {
            switch (error)
            {
                case IActionResponse response:
                    response.ClearResult();
                    return base.BadRequest(response);
                case ModelStateDictionary modelStateDic:
                    {
                        var commonErrors = new List<ErrorGeneric>();
                        foreach (var modelState in modelStateDic)
                        {
                            var validateError =
                                new ValidationResult(string.Join(',', modelState.Value.Errors.Select(r => r.ErrorMessage)),
                                    new[] { modelState.Key });
                            commonErrors.Add(new ErrorGeneric(validateError));
                        }

                        return base.BadRequest(new EndPointResponse()
                        {
                            IsSuccess = false,
                            Message = $"Thất bại, phát hiện {commonErrors.Count} lỗi",
                            Errors = commonErrors
                        });
                    }
                case ErrorGeneric errorGeneric:
                    return base.BadRequest(new EndPointResponse()
                    {
                        IsSuccess = false,
                        Message = "Thất bại, phát hiện có lỗi xảy ra",
                        Errors = new List<ErrorGeneric>() { errorGeneric }
                    });
                case IList<ErrorGeneric> errorGeneric:
                    return base.BadRequest(new EndPointResponse()
                    {
                        IsSuccess = false,
                        Message = "Thất bại, phát hiện có lỗi xảy ra",
                        Errors = errorGeneric.ToList()
                    });
                case string errorMessage:
                    return base.BadRequest(new EndPointResponse()
                    {
                        IsSuccess = false,
                        Message = errorMessage
                    });
                case IList<ValidationFailure> validationResults:
                    return base.BadRequest(new EndPointResponse()
                    {
                        IsSuccess = false,
                        Message = $"Thất bại, phát hiện {validationResults.Count} lỗi.",
                        Errors = validationResults.Select(e => new ErrorGeneric(e.ErrorMessage, e.PropertyName))
                            .ToList()
                    });
                default:
                    return base.BadRequest(new EndPointResponse()
                    {
                        IsSuccess = false,
                        Message = "Yêu cầu không hợp lệ",
                        Errors = new List<ErrorGeneric>
                        {
                            new ErrorGeneric(JsonConvert.SerializeObject(error))
                        }
                    });
            }
        }
        protected bool HasPermission(string permissionCode)
        {
            if (string.IsNullOrWhiteSpace(permissionCode)) return false;

            return UserIdentity.Permissions.Any(p => permissionCode.Equals(p, StringComparison.OrdinalIgnoreCase));
        }
    }
}
