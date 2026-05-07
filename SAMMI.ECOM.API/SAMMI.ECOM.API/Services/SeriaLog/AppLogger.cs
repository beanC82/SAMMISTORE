using SAMMI.ECOM.Core.Authorizations;
using Serilog;

namespace SAMMI.ECOM.API.Services.SeriaLog
{
    public static class AppLogger
    {
        /// <summary>
        /// Ghi log hành động có kèm ngữ cảnh, người dùng, và action code
        /// </summary>
        public static void LogAction(
            UserIdentity user,
            string action,
            string message,
            object? contextData = null)
        {
            var logger = Log.ForContext("Action", action);

            if (!string.IsNullOrEmpty(user.UserName))
            {
                logger = logger
                    .ForContext("UserId", user.Id)
                    .ForContext("Username", user.UserName)
                    .ForContext("Role", user.Roles.Select(x => int.Parse(x)).FirstOrDefault());
            }

            if (contextData != null)
            {
                logger = logger.ForContext("Context", contextData, destructureObjects: true);
            }

            logger.Information(message);
        }

        public static void LogWarning(
            UserIdentity user,
            string action,
            string message,
            object? contextData = null)
        {
            var logger = Log.ForContext("Action", action);

            if (!string.IsNullOrEmpty(user.UserName))
            {
                logger = logger
                    .ForContext("UserId", user.Id)
                    .ForContext("Username", user.UserName)
                    .ForContext("Role", user.Roles.Select(x => int.Parse(x)).FirstOrDefault());
            }

            if (contextData != null)
            {
                logger = logger.ForContext("Context", contextData, destructureObjects: true);
            }

            logger.Warning(message);
        }

        /// <summary>
        /// Ghi log lỗi có thông tin người dùng và context
        /// </summary>
        public static void LogError(
            UserIdentity user,
            string action,
            string errorMessage,
            Exception exception,
            object? contextData = null)
        {
            var logger = Log.ForContext("Action", action);

            if (!string.IsNullOrEmpty(user.UserName))
            {
                logger = logger
                    .ForContext("UserId", user.Id)
                    .ForContext("Username", user.UserName)
                    .ForContext("Role", user.Roles.Select(x => int.Parse(x)).FirstOrDefault());
            }

            if (contextData != null)
            {
                logger = logger.ForContext("Context", contextData, destructureObjects: true);
            }

            logger.Error(exception, errorMessage);
        }
    }
}
