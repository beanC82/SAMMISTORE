using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using StackExchange.Redis;

namespace SAMMI.ECOM.Infrastructure.Services.Caching
{
    public interface IRedisService<T> where T : class
    {
        Task<T?> GetCache<T>(string key);
        Task SetCache<T>(string key, T data, TimeSpan? expiry = null);
        Task RemoveCache(string key);
        bool IsConnected();
    }
    public class RedisService<T> : IRedisService<T> where T : class
    {
        private readonly IConnectionMultiplexer _redis;
        private readonly IDatabase _redisDb;
        private readonly ILogger<RedisService<T>> _logger;

        public RedisService(IConnectionMultiplexer redis, ILogger<RedisService<T>> logger)
        {
            _redis = redis;
            _redisDb = redis.GetDatabase();
            _logger = logger;
        }

        public async Task<T?> GetCache<T>(string key)
        {
            try
            {
                if (!_redis.IsConnected)
                {
                    _logger.LogWarning("Redis is not connected. Skipping GetCache for key: {Key}", key);
                    return default;
                }

                var cachedData = await _redisDb.StringGetAsync(key);
                if (cachedData.IsNullOrEmpty) return default;
                return JsonConvert.DeserializeObject<T>(cachedData);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting cache from Redis for key: {Key}", key);
                return default;
            }
        }

        public async Task SetCache<T>(string key, T data, TimeSpan? expiry = null)
        {
            try
            {
                if (data == null) return;
                if (!_redis.IsConnected)
                {
                    _logger.LogWarning("Redis is not connected. Skipping SetCache for key: {Key}", key);
                    return;
                }

                var serializedData = JsonConvert.SerializeObject(data);
                await _redisDb.StringSetAsync(key, serializedData, expiry ?? TimeSpan.FromMinutes(60));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error setting cache in Redis for key: {Key}", key);
            }
        }

        public async Task RemoveCache(string key)
        {
            try
            {
                if (!_redis.IsConnected) return;
                await _redisDb.KeyDeleteAsync(key);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing cache from Redis for key: {Key}", key);
            }
        }

        public bool IsConnected()
        {
            return _redis != null && _redis.IsConnected;
        }
    }
}
