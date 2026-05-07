using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using SAMMI.ECOM.API.Infrastructure.VNPay;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Domain.Commands.OrderBuy;
using SAMMI.ECOM.Domain.DomainModels.VNPay;

namespace SAMMI.ECOM.Infrastructure.Services.VNPay
{
    public interface IVNPayService
    {
        string CreatePaymentUrl(CreatePaymentCommand model, HttpContext context);
        ActionResponse<VNPayReponseDTO> PaymentExecute(IQueryCollection collections);
        bool ValidateChecksum(string inputHash);
    }
    public class VNPayService : IVNPayService
    {
        private readonly IConfiguration _configuration;
        private static readonly Dictionary<string, string> PlatformStorage = new Dictionary<string, string>(); // Lưu tạm platform
        public VNPayService(IConfiguration configuration)
        {
            _configuration = configuration.GetSection("VNPAYOptions");
        }
        public string CreatePaymentUrl(CreatePaymentCommand model, HttpContext context)
        {
            var timeZoneById = TimeZoneInfo.FindSystemTimeZoneById(_configuration["TimeZoneId"]);
            var timeNow = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, timeZoneById);
            var tick = DateTime.Now.Ticks.ToString();
            var pay = new VNPayLibrary();

            var urlCallBack = _configuration["ReturnUrl"];
            pay.AddRequestData("vnp_Version", _configuration["Version"]);
            pay.AddRequestData("vnp_Command", _configuration["Command"]);
            pay.AddRequestData("vnp_TmnCode", _configuration["TmnCode"]);
            pay.AddRequestData("vnp_Amount", ((int)model.PaymentAmount * 100).ToString());
            pay.AddRequestData("vnp_CreateDate", timeNow.ToString("yyyyMMddHHmmss"));
            pay.AddRequestData("vnp_CurrCode", _configuration["CurrCode"]);
            pay.AddRequestData("vnp_IpAddr", pay.GetIpAddress(context));
            pay.AddRequestData("vnp_Locale", _configuration["Locale"]);
            pay.AddRequestData("vnp_OrderInfo", $"Thanh toán cho đơn hàng #{model.OrderCode}_{model.UserIdentity}_{model.PlatForm}");
            pay.AddRequestData("vnp_OrderType", "shopping");
            pay.AddRequestData("vnp_ReturnUrl", urlCallBack);
            //pay.AddRequestData("vnp_PlatForm", model.PlatForm);
            //pay.AddRequestData("vnp_IPNUrl", _configuration["IPNUrl"]);
            pay.AddRequestData("vnp_TxnRef", tick);

            var paymentUrl = pay.CreateRequestUrl(_configuration["BaseUrl"], _configuration["HashSecret"]);

            return paymentUrl;
        }

        public ActionResponse<VNPayReponseDTO> PaymentExecute(IQueryCollection collections)
        {
            var pay = new VNPayLibrary();
            var response = pay.GetFullResponseData(collections, _configuration["HashSecret"]);

            return response;
        }

        public bool ValidateChecksum(string inputHash)
        {
            var pay = new VNPayLibrary();
            return pay.ValidateSignature(inputHash, _configuration["HashSecret"]);
        }
    }
}
