using SAMMI.ECOM.Core.Models;
using System.Data.Common;

namespace SAMMI.ECOM.API.Infrastructure.Configuration
{
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionMiddleware> _logger;

        public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (DbException dbEx)
            {
                // Xử lý lỗi kết nối database
                _logger.LogError(dbEx, "Lỗi kết nối cơ sở dữ liệu khi xử lý request {RequestPath}", context.Request.Path);
                await HandleDbExceptionAsync(context, dbEx);
            }
            catch (Exception ex)
            {
                // Xử lý các lỗi khác
                _logger.LogError(ex, "Lỗi hệ thống khi xử lý request {RequestPath}", context.Request.Path);
                await HandleGenericExceptionAsync(context, ex);
            }
        }

        private async Task HandleDbExceptionAsync(HttpContext context, DbException ex)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = StatusCodes.Status503ServiceUnavailable;

            // Tùy chỉnh thông báo dựa trên loại lỗi
            string errorMessage;
            if (ex.Message.Contains("timeout", StringComparison.OrdinalIgnoreCase))
            {
                errorMessage = "Kết nối đến máy chủ quá hạn. Vui lòng thử lại sau.";
            }
            else if (ex.Message.Contains("cannot connect", StringComparison.OrdinalIgnoreCase) ||
                     ex.Message.Contains("server was not found", StringComparison.OrdinalIgnoreCase))
            {
                errorMessage = "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau.";
            }
            else if (ex.Message.Contains("login failed", StringComparison.OrdinalIgnoreCase))
            {
                errorMessage = "Thông tin xác thực cơ sở dữ liệu không đúng. Vui lòng liên hệ quản trị viên.";
            }
            else
            {
                errorMessage = "Không thể kết nối đến máy chủ. Vui lòng thử lại sau.";
            }

            var response = new ActionResponse().AddError(errorMessage);

            await context.Response.WriteAsJsonAsync(response);
        }

        private async Task HandleGenericExceptionAsync(HttpContext context, Exception ex)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;

            var response = new ActionResponse().AddError("Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.");

            await context.Response.WriteAsJsonAsync(response);
        }
    }
}
