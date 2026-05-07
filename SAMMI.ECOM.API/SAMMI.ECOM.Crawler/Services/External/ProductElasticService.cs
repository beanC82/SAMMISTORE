using Nest;
using SAMMI.ECOM.Crawler.Services.External;
using SAMMI.ECOM.Core.Models.RequestModels.QueryParams;
using SAMMI.ECOM.Core.Models.ResponseModels.PagingList;
using SAMMI.ECOM.Domain.DomainModels.Products;
using SAMMI.ECOM.Domain.Enums;
using SAMMI.ECOM.Infrastructure.Queries.Products;
using SAMMI.ECOM.Utility;

namespace SAMMI.ECOM.Crawler.Services.External
{
    public interface IProductElasticService
    {
        Task<bool> IsConnected();
        Task<bool> AddOrUpdateProduct(ProductDTO model);
        Task<bool> DeleteProduct(int id);
        Task<bool> DeleteRangeProduct(List<int> ids);
        Task<List<SuggestProductDTO>> SuggestProducts(string keyWord, int? size = 5);
        Task<bool> BulkImportProducts();
        Task<List<ProductDTO>> SearchProductsByConstraints(
            string? keyword,
            string? category,
            string? skinType,
            List<string>? ingredients,
            decimal? maxPrice,
            int? size = 5);
        Task<IPagedList<ProductDTO>> GetList(CollectionFilterModel request);
    }
    public class ProductElasticService : IProductElasticService
    {
        private readonly IElasticClient _elasticClient;
        private readonly string _indexName;
        private readonly IProductQueries _productQueries;
        private readonly IProductTaggerService _productTaggerService;

        public ProductElasticService(
            IElasticClient elasticClient,
            IProductQueries productQueries,
            IProductTaggerService productTaggerService)
        {
            _elasticClient = elasticClient;
            _indexName = IndexElasticEnum.Product.GetDescription();
            _productQueries = productQueries;
            _productTaggerService = productTaggerService;
        }
        public async Task<bool> AddOrUpdateProduct(ProductDTO model)
        {
            // Enrich product document for chatbot constraints & warnings.
            await _productTaggerService.ApplyTagsAsync(model);

            // add suggest input
            model.Suggest = new CompletionField()
            {
                Input = new[]
                {
                    model.Code,
                    model.Name,
                    model.Ingredient,
                    model.Uses,
                    model.UsageGuide,
                    model.BrandName,
                    model.CategoryName
                }.Where(input => !string.IsNullOrEmpty(input)).ToArray()
            };
            var response = await _elasticClient.IndexAsync(model,
                i => i.Index(_indexName)
                    .Id(model.Id)
                    .Refresh(Elasticsearch.Net.Refresh.WaitFor));

            return response.IsValid;
        }

        public async Task<bool> BulkImportProducts()
        {
            try
            {
                var products = await _productQueries.GetAll();

                var bulkDescriptor = new BulkDescriptor();

                foreach (var product in products)
                {
                    await _productTaggerService.ApplyTagsAsync(product);

                    product.Suggest = new CompletionField()
                    {
                        Input = new[]
                        {
                            product.Code,
                            product.Name,
                            product.Ingredient,
                            product.Uses,
                            product.UsageGuide,
                            product.BrandName,
                            product.CategoryName
                        }.Where(input => !string.IsNullOrEmpty(input)).ToArray()
                    };

                    bulkDescriptor.Index<ProductDTO>(i => i
                        .Index(_indexName)
                        .Id(product.Id)
                        .Document(product));
                }

                var bulkResponse = await _elasticClient.BulkAsync(bulkDescriptor);

                if (!bulkResponse.IsValid)
                {
                    Console.WriteLine($"Bulk import failed: {bulkResponse.OriginalException?.Message}");
                    return false;
                }

                await _elasticClient.Indices.RefreshAsync(Indices.Index(_indexName));

                return true;
            }
            catch (Exception ex)
            {
                // Log exception
                Console.WriteLine($"Error during bulk import: {ex.Message}");
                return false;
            }
        }

        public async Task<bool> DeleteProduct(int id)
        {
            var exist = await _elasticClient.DocumentExistsAsync<ProductDTO>(id, d => d.Index(_indexName));
            if (!exist.IsValid || !exist.Exists)
            {
                return false;
            }
            var response = await _elasticClient.UpdateAsync<ProductDTO>(id, u => u.Index(_indexName)
                .Doc(new ProductDTO { IsDeleted = true })
                .Refresh(Elasticsearch.Net.Refresh.WaitFor));
            //var response = await _elasticClient.DeleteAsync<ProductDTO>(id, d => d.Index(_indexName));
            return response.IsValid;
        }

        public async Task<bool> DeleteRangeProduct(List<int> ids)
        {
            if (ids == null || !ids.Any())
            {
                return false;
            }

            var bulkRequest = new BulkDescriptor();
            foreach (var id in ids)
            {
                var exist = await _elasticClient.DocumentExistsAsync<ProductDTO>(id, d => d.Index(_indexName));
                if (!exist.IsValid || !exist.Exists)
                {
                    continue;
                }
                bulkRequest.Update<ProductDTO>(u => u
                    .Index(_indexName)
                    .Id(id)
                    .Doc(new ProductDTO { IsDeleted = true })
                    );
            }

            var response = await _elasticClient.BulkAsync(bulkRequest);
            if (!response.IsValid)
            {
                Console.WriteLine($"Bulk delete failed: {response.DebugInformation}");
            }
            return response.IsValid && !response.ItemsWithErrors.Any();
        }

        public async Task<IPagedList<ProductDTO>> GetList(CollectionFilterModel request)
        {
            return default;
            //try
            //{
            //    // Xây dựng truy vấn tìm kiếm
            //    var searchDescriptor = new SearchDescriptor<ProductDTO>()
            //        .Index(_indexName)
            //    .From(request.Skip)
            //        .Size(request.Take)
            //        .Query(q => request.Keywords != null
            //            ? q.MultiMatch(m => m
            //                .Fields(f => f
            //                    .Field(p => p.Name)
            //                    .Field(p => p.Code)
            //                    .Field(p => p.Ingredient)
            //                    .Field(p => p.BrandName)
            //                    .Field(p => p.CategoryName))
            //                .Query(request.Keywords))
            //            : q.MatchAll())
            //        .Sort(s => s
            //            .Field(f => f.Field(p => p.Name).Ascending())); // Sắp xếp theo tên (tùy chọn)

            //    // Thực hiện truy vấn
            //    var searchResponse = await _elasticClient.SearchAsync<ProductDTO>(searchDescriptor);

            //    if (!searchResponse.IsValid)
            //    {
            //        Console.WriteLine($"Search failed: {searchResponse.OriginalException?.Message}");
            //        return new PagedList<ProductDTO>(new List<ProductDTO>(), skip, take, 0);
            //    }

            //    // Tạo kết quả phân trang
            //    var products = searchResponse.Documents.ToList();
            //    var totalItemCount = (int)searchResponse.Total; // Tổng số document

            //    return new PagedList<ProductDTO>(products, skip, take, totalItemCount);
            //}
            //catch (Exception ex)
            //{
            //    Console.WriteLine($"Error during search: {ex.Message}");
            //    return new PagedList<ProductDTO>(new List<ProductDTO>(), skip, take, 0);
            //}
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

        public async Task<List<SuggestProductDTO>> SuggestProducts(string keyWord, int? size = 5)
        {
            if (string.IsNullOrEmpty(keyWord))
            {
                return new List<SuggestProductDTO>();
            }
            string suggestName = CompletionElasticEnum.SuggestProduct.GetDescription();

            try
            {
                var response = await _elasticClient.SearchAsync<ProductDTO>(s => s
                .Index(_indexName)
                .Size(size ?? 5)
                .Query(q => q.Bool(b => b
                    .Must(
                        q => q.Term(t => t.IsActive, true),
                        q => q.Term(t => t.IsDeleted, false),
                        q => q.Term(t => t.Status, 1),
                        q => q.Range(r => r.Field(f => f.StockQuantity).GreaterThan(0)),
                        q => q.MultiMatch(m => m.Query(keyWord)
                            .Fields(f => f.Field(p => p.Name)
                                .Field(p => p.Code)
                                .Field(p => p.Ingredient)
                                .Field(p => p.Uses)
                                .Field(p => p.UsageGuide)
                            )
                            .Type(TextQueryType.BestFields)
                        )
                    )
                ))
                .Suggest(su => su
                    .Completion(suggestName, c => c
                        .Field(f => f.Suggest)
                        .Prefix(keyWord)
                        .Size(size)
                        )
                    )
                );

                return response.Hits.Select(h => h.Source)
                    .Select(x => new SuggestProductDTO()
                    {
                        Id = x.Id,
                        Code = x.Code,
                        Name = x.Name,
                        Price = x.Price,
                        Discount = x.Discount,
                        NewPrice = Math.Round(
                            (x.StartDate <= DateTime.Now && x.EndDate >= DateTime.Now)
                                ? (decimal)(x.Price * (1 - (x.Discount ?? 0)))
                                : x.Price ?? 0,
                            2),
                        ProductImage = x.Images?.OrderBy(i => i.DisplayOrder).FirstOrDefault()?.ImageUrl ?? null
                    }).ToList();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error during suggest: {ex.Message}");
                return new List<SuggestProductDTO>();
            }
        }

        public async Task<List<ProductDTO>> SearchProductsByConstraints(
            string? keyword,
            string? category,
            string? skinType,
            List<string>? ingredients,
            decimal? maxPrice,
            int? size = 5)
        {
            var take = size ?? 5;

            var keywordTokens = new List<string>();
            if (!string.IsNullOrWhiteSpace(keyword))
                keywordTokens.Add(keyword);
            if (!string.IsNullOrWhiteSpace(category))
                keywordTokens.Add(category);
            if (ingredients != null && ingredients.Count > 0)
                keywordTokens.AddRange(ingredients.Where(x => !string.IsNullOrWhiteSpace(x)));

            var keywordQuery = string.Join(" ", keywordTokens).Trim();

            try
            {
                var mustQueries = new List<Func<QueryContainerDescriptor<ProductDTO>, QueryContainer>>
                {
                    mm => mm.Term(t => t.IsActive, true),
                    mm => mm.Term(t => t.IsDeleted, false),
                    mm => mm.Term(t => t.Status, 1),
                    mm => mm.Range(r => r.Field(f => f.StockQuantity).GreaterThan(0))
                };

                if (!string.IsNullOrWhiteSpace(skinType))
                {
                    mustQueries.Add(mm => mm.Terms(t => t.Field(f => f.SkinTypes).Terms(new[] { skinType })));
                }

                if (maxPrice != null)
                {
                    mustQueries.Add(mm => mm.Range(r => r.Field(f => f.NewPrice).LessThanOrEquals((double?)maxPrice.Value)));
                }

                if (!string.IsNullOrWhiteSpace(keywordQuery))
                {
                    mustQueries.Add(mm => mm.MultiMatch(m => m
                        .Query(keywordQuery)
                        .Type(TextQueryType.BestFields)
                        .Fields(f => f
                            .Field(p => p.Name)
                            .Field(p => p.Code)
                            .Field(p => p.Ingredient)
                            .Field(p => p.Uses)
                            .Field(p => p.UsageGuide)
                            .Field(p => p.CategoryName)
                            .Field(p => p.BrandName))));
                }

                var response = await _elasticClient.SearchAsync<ProductDTO>(s => s
                    .Index(_indexName)
                    .Size(take)
                    .Query(q => q.Bool(b => b
                        .Must(mustQueries.ToArray())
                    ))
                    .Sort(sort => sort.Descending(f => f.StockQuantity))
                );

                return response.Hits.Select(h => h.Source).ToList();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"SearchProductsByConstraints error: {ex.Message}");
                return new List<ProductDTO>();
            }
        }
    }
}
