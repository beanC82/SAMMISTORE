using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace SAMMI.ECOM.Infrastructure.Services
{
    public interface ICookieService
    {
        void SetCookie(string key, string value, int expireDays = 7, bool httpOnly = true, bool secure = true, SameSiteMode sameSite = SameSiteMode.Strict);
        string GetCookie(string key);
        void DeleteCookie(string key);
        void SaveFavouriteProduct(List<int> productId);
        List<int> GetFavouriteProduct();
    }

    public class CookieService : ICookieService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private const string FAVOURITE_PRODUCT_COOKIE = "SAMMI_ECOM_FAVOURITE_PRODUCT";

        public CookieService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public void SetCookie(string key, string value, int expireDays = 7, bool httpOnly = true, bool secure = true, SameSiteMode sameSite = SameSiteMode.Strict)
        {
            var cookieOptions = new CookieOptions
            {
                Expires = DateTime.Now.AddDays(expireDays),
                HttpOnly = httpOnly,
                Secure = secure,
                SameSite = sameSite
            };

            _httpContextAccessor.HttpContext.Response.Cookies.Append(key, value, cookieOptions);
        }

        public string GetCookie(string key)
        {
            return _httpContextAccessor.HttpContext.Request.Cookies.TryGetValue(key, out var value) ? value : null;
        }

        public void DeleteCookie(string key)
        {
            _httpContextAccessor.HttpContext.Response.Cookies.Delete(key);
        }

        public void SaveFavouriteProduct(List<int> productId)
        {
            var productIdsString = string.Join(",", productId);
            SetCookie(FAVOURITE_PRODUCT_COOKIE, productIdsString, 30, true, true, SameSiteMode.Strict);
        }

        public List<int> GetFavouriteProduct()
        {
            var productIdsString = GetCookie(FAVOURITE_PRODUCT_COOKIE);
            return string.IsNullOrEmpty(productIdsString) ? new List<int>() : productIdsString.Split(',').Select(int.Parse).ToList();
        }
    }
}
