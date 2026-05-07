using Nest;
using SAMMI.ECOM.Domain.DomainModels;

namespace SAMMI.ECOM.API.Services.ElasticSearch
{
    public interface IElasticService<T> where T : EntityDTO
    {
        Task<bool> IsConnected();
        Task<bool> AddOrUpdate(string index, T model);
        Task<bool> Delete(string index, int id);
        Task<bool> DeleteRange(string index, List<int> ids);
        Task<IEnumerable<T>> GetData(string index, int? size = 20);
    }

    public class ElasticService<T> : IElasticService<T> where T : EntityDTO, new()
    {
        private readonly IElasticClient _elasticClient;
        public ElasticService(IElasticClient elasticClient)
        {
            _elasticClient = elasticClient;
        }

        public async Task<bool> AddOrUpdate(string index, T model)
        {
            var response = await _elasticClient.IndexAsync(model,
                i => i.Index(index)
                    .Id(model.Id)
                    .Refresh(Elasticsearch.Net.Refresh.WaitFor));

            return response.IsValid;
        }

        public async Task<bool> Delete(string index, int id)
        {
            var exist = await _elasticClient.DocumentExistsAsync<T>(id, d => d.Index(index));
            if (!exist.IsValid || !exist.Exists)
            {
                return false;
            }
            var response = await _elasticClient.UpdateAsync<T>(id, u => u.Index(index)
                .Doc(new T { IsDeleted = true })
                .Refresh(Elasticsearch.Net.Refresh.WaitFor));
            return response.IsValid;
        }

        public async Task<bool> DeleteRange(string index, List<int> ids)
        {
            if (ids == null || !ids.Any())
            {
                return false;
            }

            var bulkRequest = new BulkDescriptor();
            foreach (var id in ids)
            {
                var exist = await _elasticClient.DocumentExistsAsync<T>(id, d => d.Index(index));
                if (!exist.IsValid || !exist.Exists)
                {
                    continue;
                }
                bulkRequest.Update<T>(u => u
                    .Index(index)
                    .Id(id)
                    .Doc(new T { IsDeleted = true })
                    );
            }

            var response = await _elasticClient.BulkAsync(bulkRequest);
            if (!response.IsValid)
            {
                Console.WriteLine($"Bulk delete failed: {response.DebugInformation}");
            }
            return response.IsValid && !response.ItemsWithErrors.Any();
        }

        public async Task<IEnumerable<T>> GetData(string index, int? size = 20)
        {
            var response = await _elasticClient.SearchAsync<T>(s => s
                .Index(index)
                .Size(size ?? 20)
                .Query(q => q.MatchAll()));
            if (!response.IsValid)
                return null;
            return response.Documents;
        }

        public async Task<bool> IsConnected()
        {
            var pingResponse = await _elasticClient.PingAsync();
            if (!pingResponse.IsValid)
            {
                Console.WriteLine($"Elasticsearch connection failed: {pingResponse.DebugInformation}");
            }
            return pingResponse.IsValid;
        }
    }
}
