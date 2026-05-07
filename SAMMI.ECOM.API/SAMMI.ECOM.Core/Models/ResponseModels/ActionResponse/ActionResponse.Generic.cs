
using SAMMI.ECOM.Core.Authorizations;

namespace SAMMI.ECOM.Core.Models
{
    public class ActionResponse<T> : ActionResponse, IActionResponse<T>
    {
        public static new ActionResponse<T> Success(T result)
        {
            var response = new ActionResponse<T>();
            response.SetResult(result);
            return response;
        }

        public static new ActionResponse<T> Failed(string message, string errorMember = "")
        {
            var actResponse = new ActionResponse<T>();
            actResponse.AddError(message, errorMember);
            return actResponse;
        }

        public static new ActionResponse<T> Failed(ErrorGeneric err)
        {
            var actResponse = new ActionResponse<T>();
            actResponse.AddError(err);
            return actResponse;
        }

        private T? _result;

        /// <summary>
        /// This is the returned result
        /// </summary>
        public T? Result => _result;

        public ActionResponse()
        {
        }

        public override ActionResponse ClearResult()
        {
            _result = default(T);
            var actionResponse = new ActionResponse();
            actionResponse.Combine(this);
            return actionResponse;
        }

        /// <summary>
        /// This sets the result to be returned
        /// </summary>
        /// <param name="result"></param>
        /// <returns></returns>
        public ActionResponse<T> SetResult(T? result)
        {
            _result = result;
            return this;
        }

        public override ActionResponse<T> AddError(string errorMessage, params string[] propertyNames)
        {
            base.AddError(errorMessage, propertyNames);
            return this;
        }

        public override ActionResponse<T> AddError(ErrorGeneric err)
        {
            base.AddError(err);
            return this;
        }

        public override ActionResponse<T> AddError(UserIdentityError err)
        {
            base.AddError(err);
            return this;
        }

        public override ActionResponse<T> Combine(IActionResponse status)
        {
            base.Combine(status);
            return this;
        }
    }
}