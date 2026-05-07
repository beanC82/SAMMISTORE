using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Memory;
using SAMMI.ECOM.Core.Authorizations;
using SAMMI.ECOM.Domain.AggregateModels.Products;

namespace SAMMI.ECOM.Infrastructure.Services.Caching
{
    public interface IMemoryCacheService
    {
        T GetOrCreate<T>(string key, Func<T> createItem, TimeSpan? absoluteExpirationRelativeToNow = null);
        T GetCache<T>(string key);
        void Set<T>(string key, T value, TimeSpan? absoluteExpirationRelativeToNow = null);
        bool TryGetValue<T>(string key, out T value);
        void Remove(string key);
        void SetFavouriteProduct(List<int> ProductIds);
        List<int> GetFavouriteProduct();
    }

    public class MemoryCacheService : IMemoryCacheService
    {
        private readonly IMemoryCache _memoryCache;
        private readonly string FAVOURITE_PRODUCT_CACHE_KEY = "FAVOURITE_PRODUCT_CACHE_KEY_";

        public MemoryCacheService(IMemoryCache memoryCache,
            UserIdentity userIdentity)
        {
            _memoryCache = memoryCache;
            FAVOURITE_PRODUCT_CACHE_KEY += userIdentity.Id;
        }

        public T GetOrCreate<T>(string key, Func<T> createItem, TimeSpan? absoluteExpirationRelativeToNow = null)
        {
            if (!_memoryCache.TryGetValue(key, out T cacheEntry))
            {
                cacheEntry = createItem();
                var cacheEntryOptions = new MemoryCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = absoluteExpirationRelativeToNow ?? TimeSpan.FromHours(5)
                };

                _memoryCache.Set(key, cacheEntry, cacheEntryOptions);
            }

            return cacheEntry;
        }

        public void Set<T>(string key, T value, TimeSpan? absoluteExpirationRelativeToNow = null)
        {
            var cacheEntryOptions = new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = absoluteExpirationRelativeToNow ?? TimeSpan.FromHours(5)
            };

            _memoryCache.Set(key, value, cacheEntryOptions);
        }

        public bool TryGetValue<T>(string key, out T value)
        {
            return _memoryCache.TryGetValue(key, out value);
        }

        public void Remove(string key)
        {
            _memoryCache.Remove(key);
        }

        public void SetFavouriteProduct(List<int> ProductIds)
        {
            var productIdsString = string.Join(",", ProductIds);
            Set(FAVOURITE_PRODUCT_CACHE_KEY, productIdsString, TimeSpan.FromDays(1));
        }

        public List<int> GetFavouriteProduct()
        {
            var productIdsString = GetCache<string>(FAVOURITE_PRODUCT_CACHE_KEY);
            return string.IsNullOrEmpty(productIdsString) ? new List<int>() : productIdsString.Split(',').Select(int.Parse).ToList();
        }

        public T GetCache<T>(string key)
        {
            if (_memoryCache.TryGetValue(key, out T value))
            {
                return value;
            }
            return default;
        }
    }
}
