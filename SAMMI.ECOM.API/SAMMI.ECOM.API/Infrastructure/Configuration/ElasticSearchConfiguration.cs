using Nest;
using SAMMI.ECOM.Domain.DomainModels.Products;
using SAMMI.ECOM.Domain.Enums;
using SAMMI.ECOM.Utility;

namespace SAMMI.ECOM.API.Infrastructure.Configuration
{
    public static class ElasticSearchConfiguration
    {
        public static async Task AddElasticSearch(this IServiceCollection services, IConfiguration configuration)
        {
            var settings = new ConnectionSettings(new Uri(configuration["ElasticSettings:baseUrl"] ?? ""))
                .PrettyJson()
                .CertificateFingerprint(configuration["ElasticSettings:finger"])
                .BasicAuthentication(configuration["ElasticSettings:user"],
                    configuration["ElasticSettings:password"]);

            settings.EnableApiVersioningHeader();
            AddDefaultMappings(settings);

            var client = new ElasticClient(settings);
            var pingResponse = await client.PingAsync();
            if (!pingResponse.IsValid)
            {
                Console.WriteLine("Error connect ElasticSearch: ", pingResponse.DebugInformation);
                return;
            }
            Console.WriteLine("Elasticsearch connected!!");
            services.AddSingleton<IElasticClient>(client);
            await CreateIndex(client);
        }

        private static void AddDefaultMappings(ConnectionSettings settings)
        {
            settings.DefaultMappingFor<ProductDTO>(m => m
                .Ignore(p => p.CreatedDate)
                .Ignore(p => p.UpdatedDate)
                .Ignore(p => p.CreatedBy)
                .Ignore(p => p.UpdatedBy)
                .Ignore(p => p.DisplayOrder));

            //settings.DefaultMappingFor<BrandDTO>(m => m
            //    .Ignore(p => p.CreatedDate)
            //    .Ignore(p => p.UpdatedDate)
            //    .Ignore(p => p.CreatedBy)
            //    .Ignore(p => p.UpdatedBy)
            //    .Ignore(p => p.DisplayOrder));

            //settings.DefaultMappingFor<ProductCategoryDTO>(m => m
            //    .Ignore(p => p.CreatedDate)
            //    .Ignore(p => p.UpdatedDate)
            //    .Ignore(p => p.CreatedBy)
            //    .Ignore(p => p.UpdatedBy)
            //    .Ignore(p => p.DisplayOrder));
        }


        private static async Task CreateIndex(IElasticClient client)
        {
            //await CreateIndexForType<ProductDTO>(client, IndexElasticEnum.Product.GetDescription());
            // create index products
            CreateIndexProduct(client);
            CreateIndexForType<ProductCategoryDTO>(client, IndexElasticEnum.Category.GetDescription());
            CreateIndexForType<ProductCategoryDTO>(client, IndexElasticEnum.Brand.GetDescription());
        }

        private static async Task CreateIndexProduct(IElasticClient client)
        {
            string indexName = IndexElasticEnum.Product.GetDescription();
            var existsResponse = await client.Indices.ExistsAsync(indexName);

            if (!existsResponse.Exists)
            {
                var createIndexResponse = await client.Indices.CreateAsync(indexName, index => index
                    .Map<ProductDTO>(x => x.AutoMap()  // AutoMap tự động ánh xạ các thuộc tính
                        .Properties(p => p
                            .Text(t => t.Name(n => n.Name))
                            .Completion(c => c.Name(n => n.Suggest))
                            // Used for hard filters inside chatbot retrieval.
                            .Keyword(k => k.Name(n => n.SkinTypes))
                            .Keyword(k => k.Name(n => n.PotentialIrritants))
                        )
                     )
                    .Settings(s => s
                        .NumberOfReplicas(1) // Số lượng bản sao
                        .NumberOfShards(1))  // Số lượng shards
                );

                if (!createIndexResponse.IsValid)
                {
                    throw new Exception($"Failed to create index {indexName}: {createIndexResponse.ServerError?.Error.Reason}");
                }
            }
        }


        private static async Task CreateIndexForType<T>(IElasticClient client, string indexName) where T : class
        {
            var existsResponse = await client.Indices.ExistsAsync(indexName);

            if (!existsResponse.Exists)
            {
                var createIndexResponse = await client.Indices.CreateAsync(indexName, index => index
                    .Map<T>(x => x.AutoMap()) // AutoMap tự động ánh xạ các thuộc tính
                    .Settings(s => s
                        .NumberOfReplicas(1) // Số lượng bản sao
                        .NumberOfShards(1))  // Số lượng shards
                );

                if (!createIndexResponse.IsValid)
                {
                    throw new Exception($"Failed to create index {indexName}: {createIndexResponse.ServerError?.Error.Reason}");
                }
            }
        }
    }
}
