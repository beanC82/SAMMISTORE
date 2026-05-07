using System.Data;
using System.Reflection.PortableExecutable;
using Dapper;
using Microsoft.Extensions.Configuration;
using Nest;
using SAMMI.ECOM.Core.Authorizations;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Core.Models.RequestModels.QueryParams;
using SAMMI.ECOM.Core.Models.ResponseModels.PagingList;
using SAMMI.ECOM.Domain.AggregateModels.Products;
using SAMMI.ECOM.Domain.DomainModels.Products;
using SAMMI.ECOM.Domain.DomainModels.Reports;
using SAMMI.ECOM.Domain.Enums;
using SAMMI.ECOM.Domain.GlobalModels.Common;
using SAMMI.ECOM.Infrastructure.Services;
using SAMMI.ECOM.Infrastructure.Services.Caching;
using SAMMI.ECOM.Repository.GenericRepositories;
using SAMMI.ECOM.Utility;

namespace SAMMI.ECOM.Infrastructure.Queries.Products
{
    public interface IProductQueries : IQueryRepository
    {
        Task<IPagedList<ProductDTO>> GetList(RequestFilterModel filterModel);
        Task<IEnumerable<SelectionItem>> GetSelectionList(RequestFilterModel? request);
        Task<ProductDTO> GetById(int id);
        Task<ProductDTO> GetByIdV2(int id);
        Task<IEnumerable<ProductDTO>> GetAll(RequestFilterModel? filterModel = null);
        Task<string?> GetCodeByLastId(CodeEnum? type = CodeEnum.Product);
        Task<InventoryStatistic> GetListInventory(InventoryFilterModel filterModel);
        Task<IEnumerable<ProductDTO>> GetListBetSellingProduct(int numberTop);
        Task<IEnumerable<ProductDTO>> GetRelated(int productId, int numberTop);
        Task<IEnumerable<ProductDTO>> GetDataNew(int numberTop);
        Task<IEnumerable<ProductDTO>> GetListByCategory(int categoryId, int numberTop);
        Task<IEnumerable<ProductDTO>> GetDataInVoucherCondition(int numberTop);
    }
    public class ProductQueries : QueryRepository<Product>, IProductQueries
    {
        private readonly List<int> ProductId;
        private readonly IRedisService<List<FavouriteProductDTO>>? _redisService;
        private readonly string cacheKey;
        private readonly ICookieService _cookieService;
        private readonly IMemoryCacheService _memoryCacheService;
        public ProductQueries(
            SammiEcommerceContext context,
            IConfiguration config,
            UserIdentity userIdentity,
            ICookieService cookieService,
            IMemoryCacheService memoryCacheService
            ) : base(context)
        {
            ProductId = new List<int>();
            cacheKey = $"{config["RedisOptions:favourite_key"]}{userIdentity.Id}";
            _cookieService = cookieService;
            UserIdentity = userIdentity;
            _memoryCacheService = memoryCacheService;
        }

        private bool IsLikedAsync(int productId)
        {
            if(!string.IsNullOrEmpty(UserIdentity.UserName))
            {
                var productIds = _memoryCacheService.GetFavouriteProduct();
                if(productIds != null && productIds.Count > 0 && productIds.Contains(productId))
                {
                    return true;
                }
            }
            return false;
        }

        public Task<IEnumerable<ProductDTO>> GetAll(RequestFilterModel? filterModel = null)
        {
            return WithDefaultTemplateAsync(
                (conn, sqlBuilder, sqlTemplate) =>
                {
                    var productDirectory = new Dictionary<int, ProductDTO>();
                    sqlBuilder.Select(@"COALESCE(
                                          ROUND(
                                              (
                                                  (t1.StockQuantity * 
                                                      COALESCE(
                                                          (SELECT pod.UnitPrice 
                                                           FROM PurchaseOrderDetail pod
                                                           JOIN PurchaseOrder po ON pod.PurchaseOrderId = po.Id
                                                           WHERE pod.ProductId = t1.Id
                                                           ORDER BY po.CreatedDate DESC 
                                                           LIMIT 1),
                                                          t1.ImportPrice
                                                      )
                                                  ) + 
                                                  COALESCE(
                                                      (SELECT SUM(pod.Quantity * pod.UnitPrice) 
                                                       FROM PurchaseOrderDetail pod
                                                       JOIN PurchaseOrder po ON pod.PurchaseOrderId = po.Id
                                                       WHERE pod.ProductId = t1.Id), 
                                                      0
                                                  )
                                              ) / 
                                              NULLIF(
                                                  (t1.StockQuantity + 
                                                   COALESCE(
                                                       (SELECT SUM(pod.quantity) 
                                                        FROM PurchaseOrderDetail pod
                                                        JOIN PurchaseOrder po ON pod.PurchaseOrderId = po.Id
                                                        WHERE pod.ProductId = t1.Id), 
                                                       0
                                                   )), 
                                                  0
                                              ),
                                              2
                                          ),
                                          t1.ImportPrice
                                        ) AS CapitalPrice");
                    sqlBuilder.Select("t3.Id, t3.PublicId, t3.TypeImage, t3.ImageUrl, t3.DisplayOrder");
                    sqlBuilder.Select("t4.Code AS CategoryCode, t4.Name AS CategoryName");
                    sqlBuilder.Select("t5.Code AS BrandCode, t5.Name AS BrandName");

                    sqlBuilder.LeftJoin("ProductImage t2 ON t1.Id = t2.ProductId AND t2.IsDeleted != 1");
                    sqlBuilder.LeftJoin("Image t3 ON t2.ImageId = t3.Id AND t3.IsDeleted != 1");
                    sqlBuilder.LeftJoin("ProductCategory t4 ON t1.CategoryId = t4.Id AND t4.IsDeleted != 1");
                    sqlBuilder.LeftJoin("Brand t5 ON t1.BrandId = t5.Id AND t5.IsDeleted != 1");
                    return conn.QueryAsync<ProductDTO, ImageDTO, string?, string?, string?, string?, ProductDTO>(
                        sqlTemplate.RawSql,
                        (product, image, categoryCode, categoryName, brandCode, brandName) =>
                        {
                            //Console.WriteLine($"Category: {category?.CategoryCode}, Brand: {brand?.BrandCode}");
                            if (!productDirectory.TryGetValue(product.Id, out var productEntry))
                            {
                                productEntry = product;
                                productEntry.CategoryCode = categoryCode;
                                productEntry.CategoryName = categoryName;
                                productEntry.BrandCode = brandCode;
                                productEntry.BrandName = brandName;
                                productEntry.Images = new List<ImageDTO>();
                                // format currency
                                if ((productEntry.StartDate != null && productEntry.EndDate != null) && (productEntry.StartDate <= DateTime.Now && productEntry.EndDate >= DateTime.Now))
                                    productEntry.NewPrice = Math.Round((decimal)(productEntry.Price * (1 - productEntry.Discount)), 2);
                                else
                                    productEntry.NewPrice = Math.Round(productEntry.Price ?? 0, 2);
                                productDirectory.Add(product.Id, productEntry);
                            }
                            if (image != null && productEntry.Images.All(i => i.Id != image.Id))
                            {
                                productEntry.Images ??= new();
                                productEntry.Images.Add(image);
                            }

                            return productEntry;
                        },
                        sqlTemplate.Parameters,
                        splitOn: "Id,Id,CategoryCode,CategoryName,BrandCode,BrandName");
                }
            );
        }

        public async Task<ProductDTO> GetById(int id)
        {
            return await WithDefaultTemplateAsync(
                async (conn, sqlBuilder, sqlTemplate) =>
                {
                    var productDirectory = new Dictionary<int, ProductDTO>();
                    sqlBuilder.Select(@"COALESCE(
                                          ROUND(
                                              (
                                                  (t1.StockQuantity * 
                                                      COALESCE(
                                                          (SELECT pod.UnitPrice 
                                                           FROM PurchaseOrderDetail pod
                                                           JOIN PurchaseOrder po ON pod.PurchaseOrderId = po.Id
                                                           WHERE pod.ProductId = t1.Id
                                                           ORDER BY po.CreatedDate DESC 
                                                           LIMIT 1),
                                                          t1.ImportPrice
                                                      )
                                                  ) + 
                                                  COALESCE(
                                                      (SELECT SUM(pod.Quantity * pod.UnitPrice) 
                                                       FROM PurchaseOrderDetail pod
                                                       JOIN PurchaseOrder po ON pod.PurchaseOrderId = po.Id
                                                       WHERE pod.ProductId = t1.Id), 
                                                      0
                                                  )
                                              ) / 
                                              NULLIF(
                                                  (t1.StockQuantity + 
                                                   COALESCE(
                                                       (SELECT SUM(pod.quantity) 
                                                        FROM PurchaseOrderDetail pod
                                                        JOIN PurchaseOrder po ON pod.PurchaseOrderId = po.Id
                                                        WHERE pod.ProductId = t1.Id), 
                                                       0
                                                   )), 
                                                  0
                                              ),
                                              2
                                          ),
                                          t1.ImportPrice
                                        ) AS CapitalPrice");
                    sqlBuilder.Select("t3.Id, t3.PublicId, t3.TypeImage, t3.ImageUrl, t3.DisplayOrder");
                    sqlBuilder.Select("t4.Code AS CategoryCode, t4.Name AS CategoryName");
                    sqlBuilder.Select("t5.Code AS BrandCode, t5.Name AS BrandName");

                    sqlBuilder.LeftJoin("ProductImage t2 ON t1.Id = t2.ProductId AND t2.IsDeleted != 1");
                    sqlBuilder.LeftJoin("Image t3 ON t2.ImageId = t3.Id AND t3.IsDeleted != 1");
                    sqlBuilder.LeftJoin("ProductCategory t4 ON t1.CategoryId = t4.Id AND t4.IsDeleted != 1");
                    sqlBuilder.LeftJoin("Brand t5 ON t1.BrandId = t5.Id AND t5.IsDeleted != 1");

                    sqlBuilder.Where("t1.Id = @id", new { id });
                    var products = await conn.QueryAsync<ProductDTO, ImageDTO, string?, string?, string?, string?, ProductDTO>(
                        sqlTemplate.RawSql,
                        (product, image, categoryCode, categoryName, brandCode, brandName) =>
                        {
                            if (!productDirectory.TryGetValue(product.Id, out var productEntry))
                            {
                                productEntry = product;
                                productEntry.CategoryCode = categoryCode;
                                productEntry.CategoryName = categoryName;
                                productEntry.BrandCode = brandCode;
                                productEntry.BrandName = brandName;
                                productEntry.Images = new List<ImageDTO>();
                                // format currency
                                if ((productEntry.StartDate != null && productEntry.EndDate != null) && (productEntry.StartDate <= DateTime.Now && productEntry.EndDate >= DateTime.Now))
                                    productEntry.NewPrice = Math.Round((decimal)(productEntry.Price * (1 - productEntry.Discount)), 2);
                                else
                                    productEntry.NewPrice = Math.Round(productEntry.Price ?? 0, 2);
                                productDirectory.Add(product.Id, productEntry);
                            }
                            if (image != null && productEntry.Images.All(i => i.Id != image.Id))
                            {
                                productEntry.Images ??= new();
                                productEntry.Images.Add(image);
                            }

                            return productEntry;
                        },
                        sqlTemplate.Parameters,
                        splitOn: "Id,Id,CategoryCode,CategoryName,BrandCode,BrandName");
                    return products.FirstOrDefault();
                }
            );
        }

        /*
        Giá vốn trung bình = Tổng giá trị hàng tồn kho ÷ Tổng số lượng tồn kho

        Trong đó:
        Tổng giá trị hàng tồn kho = (Số lượng tồn kho hiện tại × Giá nhập cuối cùng) + (Tổng số lượng nhập × Giá nhập từ các lần nhập).
        Tổng số lượng tồn kho = Số lượng tồn kho hiện tại + Tổng số lượng nhập.
         */
        public Task<IPagedList<ProductDTO>> GetList(RequestFilterModel filterModel)
        {
            return WithPagingTemplateAsync(
                (conn, sqlBuilder, sqlTemplate) =>
                {
                    var productDirectory = new Dictionary<int, ProductDTO>();
                    sqlBuilder.Select(@"COALESCE(
                                          ROUND(
                                              (
                                                  (t1.StockQuantity * 
                                                      COALESCE(
                                                          (SELECT pod.UnitPrice 
                                                           FROM PurchaseOrderDetail pod
                                                           JOIN PurchaseOrder po ON pod.PurchaseOrderId = po.Id
                                                           WHERE pod.ProductId = t1.Id
                                                           ORDER BY po.CreatedDate DESC 
                                                           LIMIT 1),
                                                          t1.ImportPrice
                                                      )
                                                  ) + 
                                                  COALESCE(
                                                      (SELECT SUM(pod.Quantity * pod.UnitPrice) 
                                                       FROM PurchaseOrderDetail pod
                                                       JOIN PurchaseOrder po ON pod.PurchaseOrderId = po.Id
                                                       WHERE pod.ProductId = t1.Id), 
                                                      0
                                                  )
                                              ) / 
                                              NULLIF(
                                                  (t1.StockQuantity + 
                                                   COALESCE(
                                                       (SELECT SUM(pod.quantity) 
                                                        FROM PurchaseOrderDetail pod
                                                        JOIN PurchaseOrder po ON pod.PurchaseOrderId = po.Id
                                                        WHERE pod.ProductId = t1.Id), 
                                                       0
                                                   )), 
                                                  0
                                              ),
                                              2
                                          ),
                                          t1.ImportPrice
                                        ) AS CapitalPrice");

                    sqlBuilder.Select("t3.Id, t3.PublicId, t3.TypeImage, t3.ImageUrl, t2.DisplayOrder");
                    sqlBuilder.Select("t4.Code AS CategoryCode, t4.Name AS CategoryName");
                    sqlBuilder.Select("t5.Code AS BrandCode, t5.Name AS BrandName");

                    sqlBuilder.LeftJoin("ProductImage t2 ON t1.Id = t2.ProductId AND t2.IsDeleted != 1");
                    sqlBuilder.LeftJoin("Image t3 ON t2.ImageId = t3.Id AND t3.IsDeleted != 1");
                    sqlBuilder.LeftJoin("ProductCategory t4 ON t1.CategoryId = t4.Id AND t4.IsDeleted != 1");
                    sqlBuilder.LeftJoin("Brand t5 ON t1.BrandId = t5.Id AND t5.IsDeleted != 1");
                    return conn.QueryAsync<ProductDTO, ImageDTO, string?, string?, string?, string?, ProductDTO>(
                        sqlTemplate.RawSql,
                        (product, image, categoryCode, categoryName, brandCode, brandName) =>
                        {
                            //Console.WriteLine($"Category: {category?.CategoryCode}, Brand: {brand?.BrandCode}");
                            if (!productDirectory.TryGetValue(product.Id, out var productEntry))
                            {
                                productEntry = product;
                                productEntry.CategoryCode = categoryCode;
                                productEntry.CategoryName = categoryName;
                                productEntry.BrandCode = brandCode;
                                productEntry.BrandName = brandName;
                                productEntry.Images = new List<ImageDTO>();
                                // format currency
                                if ((productEntry.StartDate != null && productEntry.EndDate != null) && (productEntry.StartDate <= DateTime.Now && productEntry.EndDate >= DateTime.Now))
                                    productEntry.NewPrice = Math.Round((decimal)(productEntry.Price * (1 - productEntry.Discount)), 2);
                                else
                                    productEntry.NewPrice = Math.Round(productEntry.Price ?? 0, 2);
                                productDirectory.Add(product.Id, productEntry);
                            }
                            if (image != null && productEntry.Images.All(i => i.Id != image.Id))
                            {
                                productEntry.Images ??= new();
                                productEntry.Images.Add(image);
                            }

                            return productEntry;
                        },
                        sqlTemplate.Parameters,
                        splitOn: "Id,Id,CategoryCode,CategoryName,BrandCode,BrandName");
                },
                filterModel);
        }

        public Task<IEnumerable<SelectionItem>> GetSelectionList(RequestFilterModel? request)
        {
            return WithDefaultTemplateAsync(
                (conn, sqlBuilder, sqlTemplate) =>
                {
                    sqlBuilder.Select("t1.Id as Value");
                    sqlBuilder.Select("t1.Name as Text");

                    return conn.QueryAsync<SelectionItem>(sqlTemplate.RawSql, sqlTemplate.Parameters);
                }, request
            );
        }

        public async Task<string?> GetCodeByLastId(CodeEnum? type = CodeEnum.Product)
        {
            int idLast = 0;
            string code = type.GetDescription();
            idLast = await WithDefaultNoSelectTemplateAsync(
                async (conn, sqlBuilder, sqlTemplate) =>
                {
                    sqlBuilder.Select("CASE WHEN MAX(t1.Id) IS NOT NULL THEN  MAX(t1.Id) ELSE 0 END");
                    sqlBuilder.OrderDescBy("t1.Id");

                    return await conn.QueryFirstOrDefaultAsync<int>(sqlTemplate.RawSql, sqlTemplate.Parameters);
                }
                );

            return $"{code}{(idLast + 1).ToString("D6")}";
        }

        public async Task<InventoryStatistic> GetListInventory(InventoryFilterModel filterModel)
        {
            var inventoryList = await WithPagingTemplateAsync(
                (conn, sqlBuilder, sqlTemplate) =>
                {
                    sqlBuilder.Select("MAX(t3.CreatedDate) AS LastReceiptDate");
                    sqlBuilder.Select("DATEDIFF(NOW(), MAX(t3.CreatedDate)) AS DaysSinceLastReceipt");

                    sqlBuilder.LeftJoin("PurchaseOrderDetail t2 ON t1.Id = t2.ProductId AND t2.IsDeleted != 1");
                    sqlBuilder.LeftJoin("PurchaseOrder t3 ON t2.PurchaseOrderId = t3.Id AND t3.IsDeleted != 1");

                    sqlBuilder.Where("(t1.Status = 1 OR t1.Status = 0)");
                    if (filterModel.MaximumStockQuantity != null)
                    {
                        sqlBuilder.Where("t1.StockQuantity < @minimumStockQuantity", new { minimumStockQuantity = filterModel.MaximumStockQuantity });
                    }

                    sqlBuilder.GroupBy(@"t1.Id,
                        t1.Code,
                        t1.Name,
                        t1.StockQuantity,
                        t1.Price,
                        t1.Status,
                        t1.CategoryId,
                        t1.CreatedDate,
                        t1.UpdatedDate,
                        t1.CreatedBy,
                        t1.UpdatedBy,
                        t1.IsActive,
                        t1.IsDeleted,
                        t1.DisplayOrder");

                    if (filterModel.DaysOfExistence != null)
                    {
                        sqlBuilder.Having("DATEDIFF(NOW(), MAX(t3.CreatedDate)) > @daysOfExistence OR MAX(t3.CreatedDate) IS NULL", new { daysOfExistence = filterModel.DaysOfExistence });
                    }

                    //sqlBuilder.OrderBy("t1.StockQuantity DESC");

                    string query = @$"
                        SELECT
                        DISTINCT t1.Id,
                        t1.Code AS Code,
                        t1.Name AS Name,
                        t1.StockQuantity AS StockQuantity,
                        t1.Price AS Price,
                        t1.Status AS Status,
                        t1.CategoryId AS CategoryId,
                        t1.CreatedDate AS CreatedDate,
                        t1.UpdatedDate AS UpdatedDate,
                        t1.CreatedBy AS CreatedBy,
                        t1.UpdatedBy AS UpdatedBy,
                        t1.IsActive AS IsActive,
                        t1.IsDeleted AS IsDeleted,
                        t1.DisplayOrder AS DisplayOrder,
                        MAX(t3.CreatedDate) AS LastReceiptDate,
                        DATEDIFF(NOW(), MAX(t3.CreatedDate)) AS DaysSinceLastReceipt
                        FROM (
		                    SELECT DISTINCT
		                    DISTINCT t1.Id
		                    FROM Product t1
                            LEFT JOIN PurchaseOrderDetail t2 ON t1.Id = t2.ProductId AND t2.IsDeleted != 1
                            LEFT JOIN PurchaseOrder t3 ON t2.PurchaseOrderId = t3.Id AND t3.IsDeleted != 1
                            WHERE t1.ISDELETED = 0 AND (t1.Status = 1 OR t1.Status = 0) {((filterModel.MaximumStockQuantity != null) ? string.Format("AND t1.StockQuantity < {0}", filterModel.MaximumStockQuantity) : "")}

                            {((filterModel.DaysOfExistence != null) ? string.Format(@"
                            GROUP BY t1.Id
                            HAVING DATEDIFF(NOW(), MAX(t3.CreatedDate)) > {0} OR MAX(t3.CreatedDate) IS NULL"
                            , filterModel.DaysOfExistence) : "")}

                            ORDER BY t1.Id DESC

                            LIMIT @numberOfTakingRecords

                            OFFSET @numberOfSkipingRecords
                        ) s
                        INNER JOIN Product t1 ON t1.Id = s.Id

                        LEFT JOIN PurchaseOrderDetail t2 ON t1.Id = t2.ProductId AND t2.IsDeleted != 1
                        LEFT JOIN PurchaseOrder t3 ON t2.PurchaseOrderId = t3.Id AND t3.IsDeleted != 1
                        GROUP BY t1.Id,
                                t1.Code,
                                t1.Name,
                                t1.StockQuantity,
                                t1.Price,
                                t1.Status,
                                t1.CategoryId,
                                t1.CreatedDate,
                                t1.UpdatedDate,
                                t1.CreatedBy,
                                t1.UpdatedBy,
                                t1.IsActive,
                                t1.IsDeleted,
                                t1.DisplayOrder

                        {((filterModel.DaysOfExistence != null) ? string.Format("HAVING DATEDIFF(NOW(), MAX(t3.CreatedDate)) > {0} OR MAX(t3.CreatedDate) IS NULL", filterModel.DaysOfExistence) : "")}

                        ORDER BY t1.Id DESC , t1.StockQuantity DESC
                        ";
                    return conn.QueryAsync<InventoryStatisticDetail>(sqlTemplate.RawSql, sqlTemplate.Parameters);
                }, filterModel);

            inventoryList.Subset = inventoryList.Subset.OrderByDescending(x => x.StockQuantity).ToList();

            var totalInventory = await WithDefaultTemplateAsync(
                (conn, sqlBuilder, sqlTemplate) =>
                {
                    //sqlBuilder.Select("MAX(t3.CreatedDate) AS LastReceiptDate");
                    //sqlBuilder.Select("DATEDIFF(NOW(), MAX(t3.CreatedDate)) AS DaysSinceLastReceipt");

                    sqlBuilder.LeftJoin("PurchaseOrderDetail t2 ON t1.Id = t2.ProductId AND t2.IsDeleted != 1");
                    sqlBuilder.LeftJoin("PurchaseOrder t3 ON t2.PurchaseOrderId = t3.Id AND t3.IsDeleted != 1");

                    sqlBuilder.Where("(t1.Status = 1 OR t1.Status = 0)");
                    if (filterModel.MaximumStockQuantity != null)
                    {
                        sqlBuilder.Where("t1.StockQuantity < @minimumStockQuantity", new { minimumStockQuantity = filterModel.MaximumStockQuantity });
                    }

                    sqlBuilder.GroupBy(@"t1.Id,
                        t1.Code,
                        t1.Name,
                        t1.StockQuantity,
                        t1.Price,
                        t1.Status,
                        t1.CategoryId,
                        t1.CreatedDate,
                        t1.UpdatedDate,
                        t1.CreatedBy,
                        t1.UpdatedBy,
                        t1.IsActive,
                        t1.IsDeleted,
                        t1.DisplayOrder");

                    if(filterModel.DaysOfExistence != null)
                    {
                        sqlBuilder.Having("DATEDIFF(NOW(), MAX(t3.CreatedDate)) > @daysOfExistence OR MAX(t3.CreatedDate) IS NULL", new { daysOfExistence = filterModel.DaysOfExistence });
                    }

                    return conn.QueryAsync<InventoryStatisticDetail>(sqlTemplate.RawSql, sqlTemplate.Parameters);
                }, filterModel);

            var inventoryStatistic = new InventoryStatistic
            {
                TotalStockQuantity = totalInventory.Sum(x => x.StockQuantity),
                TotalAmount = totalInventory.Sum(x => x.Price * x.StockQuantity ?? 0),
                InventoryDetails = inventoryList
            };
            return inventoryStatistic;
        }

        public Task<IEnumerable<ProductDTO>> GetListBetSellingProduct(int numberTop)
        {
            return WithDefaultTemplateAsync(
                (conn, sqlBuilder, sqlTemplate) =>
                {
                    //sqlBuilder.Select("t4.*");
                    //sqlBuilder.Select("SUM(t2.Quantity) AS TotalSold");

                    //sqlBuilder.LeftJoin("OrderDetail t2 ON t1.Id = t2.ProductId AND t2.IsDeleted != 1");
                    //sqlBuilder.LeftJoin("Orders t3 ON t2.OrderId = t3.Id AND t3.OrderStatus = @orderStatus", new {orderStatus = OrderStatusEnum.Completed.ToString()});
                    //sqlBuilder.LeftJoin(@"(SELECT pi.ProductId,
                    //                          pi.DisplayOrder,
                    //                          i.Id,
                    //                          i.ImageUrl,
                    //                          i.PublicId,
                    //                          i.TypeImage
                    //                    FROM ProductImage pi
                    //                    INNER JOIN Image i ON pi.ImageId = i.Id AND i.IsDeleted != 1
                    //                    WHERE pi.IsDeleted != 1
                    //                    AND pi.DisplayOrder = (SELECT MIN(DisplayOrder) FROM ProductImage WHERE ProductId = pi.ProductId AND IsDeleted != 1)
                    //                    ) t4 ON t1.Id = t4.ProductId"
                    //);

                    //sqlBuilder.GroupBy(@"
                    //    t1.Id,
                    //    t1.Code,
                    //    t1.Name,
                    //    t1.StockQuantity,
                    //    t1.Price,
                    //    t1.Discount,
                    //    t1.Ingredient,
                    //    t1.Uses,
                    //    t1.UsageGuide,
                    //    t1.BrandId,
                    //    t1.Status,
                    //    t1.CategoryId,
                    //    t1.StartDate,
                    //    t1.EndDate,
                    //    t1.CreatedDate,
                    //    t1.UpdatedDate,
                    //    t1.CreatedBy,
                    //    t1.UpdatedBy,
                    //    t1.IsActive,
                    //    t1.IsDeleted,
                    //    t1.DisplayOrder,
                    //    t4.ProductId,
                    //    t4.DisplayOrder,
                    //    t4.Id,
                    //    t4.ImageUrl,
                    //    t4.PublicId,
                    //    t4.TypeImage
                    //    ");

                    //sqlBuilder.OrderDescBy("TotalSold");

                    //sqlBuilder.Take(numberTop);

                    string query = @$"
                        SELECT
                        DISTINCT t1.Id,
                        t1.Code AS Code,
                        t1.Name AS Name,
                        t1.StockQuantity AS StockQuantity,
                        t1.Price AS Price,
                        t1.Discount AS Discount,
                        t1.Ingredient AS Ingredient,
                        t1.Uses AS Uses,
                        t1.UsageGuide AS UsageGuide,
                        t1.BrandId AS BrandId,
                        t1.Status AS Status,
                        t1.CategoryId AS CategoryId,
                        t1.StartDate AS StartDate,
                        t1.EndDate AS EndDate,
                        t1.CreatedDate AS CreatedDate,
                        t1.UpdatedDate AS UpdatedDate,
                        t1.CreatedBy AS CreatedBy,
                        t1.UpdatedBy AS UpdatedBy,
                        t1.IsActive AS IsActive,
                        t1.IsDeleted AS IsDeleted,
                        t1.DisplayOrder AS DisplayOrder,
                        t4.*,
                        SUM(t2.Quantity) AS TotalSold FROM Product t1
                        LEFT JOIN OrderDetail t2 ON t1.Id = t2.ProductId AND t2.IsDeleted != 1
                        LEFT JOIN Orders t3 ON t2.OrderId = t3.Id AND t3.OrderStatus = '{OrderStatusEnum.Completed.ToString()}'
                        LEFT JOIN (SELECT pi.ProductId,
                                          pi.DisplayOrder,
                                          i.Id,
                                          i.ImageUrl,
                                          i.PublicId,
                                          i.TypeImage
                                    FROM ProductImage pi
                                    INNER JOIN Image i ON pi.ImageId = i.Id AND i.IsDeleted != 1
                                    WHERE pi.IsDeleted != 1
                                    AND pi.DisplayOrder = (SELECT MIN(DisplayOrder) FROM ProductImage WHERE ProductId = pi.ProductId AND IsDeleted != 1)
                                    ) t4 ON t1.Id = t4.ProductId
                        WHERE t1.ISDELETED = 0

                        GROUP BY t1.Id,
                                t1.Code,
                                t1.Name,
                                t1.StockQuantity,
                                t1.Price,
                                t1.Discount,
                                t1.Ingredient,
                                t1.Uses,
                                t1.UsageGuide,
                                t1.BrandId,
                                t1.Status,
                                t1.CategoryId,
                                t1.StartDate,
                                t1.EndDate,
                                t1.CreatedDate,
                                t1.UpdatedDate,
                                t1.CreatedBy,
                                t1.UpdatedBy,
                                t1.IsActive,
                                t1.IsDeleted,
                                t1.DisplayOrder,
                                t4.ProductId,
                                t4.DisplayOrder,
                                t4.Id,
                                t4.ImageUrl,
                                t4.PublicId,
                                t4.TypeImage

                        ORDER BY TotalSold DESC

                        LIMIT {numberTop}";

                    var productDirectory = new Dictionary<int, ProductDTO>();
                    return conn.QueryAsync<ProductDTO, ImageDTO, ProductDTO>(
                        query,
                        (product, image) =>
                        {
                            if(!productDirectory.TryGetValue(product.Id, out var productEntry))
                            {
                                productEntry = product;
                                productEntry.Images = new List<ImageDTO>();
                                if ((productEntry.StartDate != null && productEntry.EndDate != null) && (productEntry.StartDate <= DateTime.Now && productEntry.EndDate >= DateTime.Now))
                                    productEntry.NewPrice = Math.Round((decimal)(productEntry.Price * (1 - productEntry.Discount)), 2);
                                else
                                    productEntry.NewPrice = Math.Round(productEntry.Price ?? 0, 2);
                                productEntry.IsLiked = IsLikedAsync(productEntry.Id);
                                productDirectory.Add(product.Id, productEntry);
                            }

                            if (image != null && productEntry.Images.All(i => i.Id != image.Id))
                            {
                                productEntry.Images ??= new();
                                productEntry.Images.Add(image);
                            }
                            return productEntry;
                        },
                        sqlTemplate.Parameters,
                        splitOn: "ProductId"
                        );
                });
        }

        public Task<IEnumerable<ProductDTO>> GetRelated(int productId, int numberTop)
        {
            return WithDefaultTemplateAsync(
                (conn, sqlBuilder, sqlTemplate) =>
                {
                    string query = @$"
                        SELECT
                        DISTINCT t1.Id,
                        t1.Code AS Code,
                        t1.Name AS Name,
                        t1.StockQuantity AS StockQuantity,
                        t1.Price AS Price,
                        t1.Discount AS Discount,
                        t1.Ingredient AS Ingredient,
                        t1.Uses AS Uses,
                        t1.UsageGuide AS UsageGuide,
                        t1.BrandId AS BrandId,
                        t1.Status AS Status,
                        t1.CategoryId AS CategoryId,
                        t1.StartDate AS StartDate,
                        t1.EndDate AS EndDate,
                        t1.CreatedDate AS CreatedDate,
                        t1.UpdatedDate AS UpdatedDate,
                        t1.CreatedBy AS CreatedBy,
                        t1.UpdatedBy AS UpdatedBy,
                        t1.IsActive AS IsActive,
                        t1.IsDeleted AS IsDeleted,
                        t1.DisplayOrder AS DisplayOrder,
                        t4.*,
                        SUM(t2.Quantity) AS TotalSold FROM Product t1 
                        LEFT JOIN OrderDetail t2 ON t1.Id = t2.ProductId AND t2.IsDeleted != 1
                        LEFT JOIN Orders t3 ON t2.OrderId = t3.Id AND t3.OrderStatus = '{OrderStatusEnum.Completed.ToString()}'
                        LEFT JOIN (SELECT pi.ProductId,
                                          pi.DisplayOrder,
                                          i.Id,
                                          i.ImageUrl,
                                          i.PublicId,
                                          i.TypeImage
                                    FROM ProductImage pi
                                    INNER JOIN Image i ON pi.ImageId = i.Id AND i.IsDeleted != 1
                                    WHERE pi.IsDeleted != 1
                                    AND pi.DisplayOrder = (SELECT MIN(DisplayOrder) FROM ProductImage WHERE ProductId = pi.ProductId AND IsDeleted != 1)
                                    ) t4 ON t1.Id = t4.ProductId
                        WHERE t1.ISDELETED = 0 AND t1.Id != {productId}
                          AND (t1.CategoryId = (
                                  SELECT categoryId
                                  FROM Product
                                  WHERE Id = {productId}
                                )
                                OR t1.BrandId = (
                                  SELECT BrandId
                                  FROM Product
                                  WHERE Id = {productId}
                                )
                              )

                        GROUP BY t1.Id,
                                t1.Code,
                                t1.Name,
                                t1.StockQuantity,
                                t1.Price,
                                t1.Discount,
                                t1.Ingredient,
                                t1.Uses,
                                t1.UsageGuide,
                                t1.BrandId,
                                t1.Status,
                                t1.CategoryId,
                                t1.StartDate,
                                t1.EndDate,
                                t1.CreatedDate,
                                t1.UpdatedDate,
                                t1.CreatedBy,
                                t1.UpdatedBy,
                                t1.IsActive,
                                t1.IsDeleted,
                                t1.DisplayOrder,
                                t4.ProductId,
                                t4.DisplayOrder,
                                t4.Id,
                                t4.ImageUrl,
                                t4.PublicId,
                                t4.TypeImage

                        ORDER BY TotalSold DESC

                        LIMIT {numberTop}";

                    var productDirectory = new Dictionary<int, ProductDTO>();
                    return conn.QueryAsync<ProductDTO, ImageDTO, ProductDTO>(
                        query,
                        (product, image) =>
                        {
                            if (!productDirectory.TryGetValue(product.Id, out var productEntry))
                            {
                                productEntry = product;
                                productEntry.Images = new List<ImageDTO>();
                                if ((productEntry.StartDate != null && productEntry.EndDate != null) && (productEntry.StartDate <= DateTime.Now && productEntry.EndDate >= DateTime.Now))
                                    productEntry.NewPrice = Math.Round((decimal)(productEntry.Price * (1 - productEntry.Discount)), 2);
                                else
                                    productEntry.NewPrice = Math.Round(productEntry.Price ?? 0, 2);
                                productEntry.IsLiked = IsLikedAsync(productEntry.Id);
                                productEntry.ImportPrice = 0;
                                productDirectory.Add(product.Id, productEntry);
                            }

                            if (image != null && productEntry.Images.All(i => i.Id != image.Id))
                            {
                                productEntry.Images ??= new();
                                productEntry.Images.Add(image);
                            }
                            return productEntry;
                        },
                        sqlTemplate.Parameters,
                        splitOn: "ProductId"
                        );
                });
        }

        public Task<IEnumerable<ProductDTO>> GetDataNew(int numberTop)
        {
            return WithDefaultTemplateAsync(
                (conn, sqlBuilder, sqlTemplate) =>
                {
                    string query = @$"
                        SELECT
                        DISTINCT t1.Id,
                        t1.Code AS Code,
                        t1.Name AS Name,
                        t1.StockQuantity AS StockQuantity,
                        t1.Price AS Price,
                        t1.Discount AS Discount,
                        t1.Ingredient AS Ingredient,
                        t1.Uses AS Uses,
                        t1.UsageGuide AS UsageGuide,
                        t1.BrandId AS BrandId,
                        t1.Status AS Status,
                        t1.CategoryId AS CategoryId,
                        t1.StartDate AS StartDate,
                        t1.EndDate AS EndDate,
                        t1.CreatedDate AS CreatedDate,
                        t1.UpdatedDate AS UpdatedDate,
                        t1.CreatedBy AS CreatedBy,
                        t1.UpdatedBy AS UpdatedBy,
                        t1.IsActive AS IsActive,
                        t1.IsDeleted AS IsDeleted,
                        t1.DisplayOrder AS DisplayOrder,
                        t2.*
                        FROM Product t1 
                        LEFT JOIN (SELECT pi.ProductId,
                                          pi.DisplayOrder,
                                          i.Id,
                                          i.ImageUrl,
                                          i.PublicId,
                                          i.TypeImage
                                    FROM ProductImage pi
                                    INNER JOIN Image i ON pi.ImageId = i.Id AND i.IsDeleted != 1
                                    WHERE pi.IsDeleted != 1
                                    AND pi.DisplayOrder = (SELECT MIN(DisplayOrder) FROM ProductImage WHERE ProductId = pi.ProductId AND IsDeleted != 1)
                                    ) t2 ON t1.Id = t2.ProductId
                        WHERE t1.ISDELETED = 0 AND t1.Status = 1

                        ORDER BY CreatedDate DESC

                        LIMIT {numberTop}";

                    var productDirectory = new Dictionary<int, ProductDTO>();
                    return conn.QueryAsync<ProductDTO, ImageDTO, ProductDTO>(
                        query,
                        (product, image) =>
                        {
                            if (!productDirectory.TryGetValue(product.Id, out var productEntry))
                            {
                                productEntry = product;
                                productEntry.Images = new List<ImageDTO>();
                                if ((productEntry.StartDate != null && productEntry.EndDate != null) && (productEntry.StartDate <= DateTime.Now && productEntry.EndDate >= DateTime.Now))
                                    productEntry.NewPrice = Math.Round((decimal)(productEntry.Price * (1 - productEntry.Discount)), 2);
                                else
                                    productEntry.NewPrice = Math.Round(productEntry.Price ?? 0, 2);
                                productEntry.IsLiked = IsLikedAsync(productEntry.Id);
                                productEntry.ImportPrice = 0;
                                productDirectory.Add(product.Id, productEntry);
                            }

                            if (image != null && productEntry.Images.All(i => i.Id != image.Id))
                            {
                                productEntry.Images ??= new();
                                productEntry.Images.Add(image);
                            }
                            return productEntry;
                        },
                        sqlTemplate.Parameters,
                        splitOn: "ProductId"
                        );
                });
        }

        public Task<IEnumerable<ProductDTO>> GetListByCategory(int categoryId, int numberTop)
        {
            return WithDefaultTemplateAsync(
                (conn, sqlBuilder, sqlTemplate) =>
                {
                    string query = @$"
                        SELECT
                        DISTINCT t1.Id,
                        t1.Code AS Code,
                        t1.Name AS Name,
                        t1.StockQuantity AS StockQuantity,
                        t1.Price AS Price,
                        t1.Discount AS Discount,
                        t1.Ingredient AS Ingredient,
                        t1.Uses AS Uses,
                        t1.UsageGuide AS UsageGuide,
                        t1.BrandId AS BrandId,
                        t1.Status AS Status,
                        t1.CategoryId AS CategoryId,
                        t1.StartDate AS StartDate,
                        t1.EndDate AS EndDate,
                        t1.CreatedDate AS CreatedDate,
                        t1.UpdatedDate AS UpdatedDate,
                        t1.CreatedBy AS CreatedBy,
                        t1.UpdatedBy AS UpdatedBy,
                        t1.IsActive AS IsActive,
                        t1.IsDeleted AS IsDeleted,
                        t1.DisplayOrder AS DisplayOrder,
                        t2.*
                        FROM Product t1 
                        LEFT JOIN (SELECT pi.ProductId,
                                          pi.DisplayOrder,
                                          i.Id,
                                          i.ImageUrl,
                                          i.PublicId,
                                          i.TypeImage
                                    FROM ProductImage pi
                                    INNER JOIN Image i ON pi.ImageId = i.Id AND i.IsDeleted != 1
                                    WHERE pi.IsDeleted != 1
                                    AND pi.DisplayOrder = (SELECT MIN(DisplayOrder) FROM ProductImage WHERE ProductId = pi.ProductId AND IsDeleted != 1)
                                    ) t2 ON t1.Id = t2.ProductId
                        WHERE t1.ISDELETED = 0 AND t1.Status = 1 AND t1.CategoryId = {categoryId}

                        ORDER BY CreatedDate DESC

                        LIMIT {numberTop}";

                    var productDirectory = new Dictionary<int, ProductDTO>();
                    return conn.QueryAsync<ProductDTO, ImageDTO, ProductDTO>(
                        query,
                        (product, image) =>
                        {
                            if (!productDirectory.TryGetValue(product.Id, out var productEntry))
                            {
                                productEntry = product;
                                productEntry.Images = new List<ImageDTO>();
                                if ((productEntry.StartDate != null && productEntry.EndDate != null) && (productEntry.StartDate <= DateTime.Now && productEntry.EndDate >= DateTime.Now))
                                    productEntry.NewPrice = Math.Round((decimal)(productEntry.Price * (1 - productEntry.Discount)), 2);
                                else
                                    productEntry.NewPrice = Math.Round(productEntry.Price ?? 0, 2);
                                productEntry.IsLiked = IsLikedAsync(productEntry.Id);
                                productEntry.ImportPrice = 0;
                                productDirectory.Add(product.Id, productEntry);
                            }

                            if (image != null && productEntry.Images.All(i => i.Id != image.Id))
                            {
                                productEntry.Images ??= new();
                                productEntry.Images.Add(image);
                            }
                            return productEntry;
                        },
                        sqlTemplate.Parameters,
                        splitOn: "ProductId"
                        );
                });
        }

        public async Task<ProductDTO> GetByIdV2(int id)
        {
            return await WithDefaultTemplateAsync(
                async (conn, sqlBuilder, sqlTemplate) =>
                {
                    var productDirectory = new Dictionary<int, ProductDTO>();
                    sqlBuilder.Select("t4.Code AS CategoryCode, t4.Name AS CategoryName");
                    sqlBuilder.Select("t5.Code AS BrandCode, t5.Name AS BrandName");
                    sqlBuilder.Select("t3.Id, t3.PublicId, t3.TypeImage, t3.ImageUrl, t2.DisplayOrder");
                    sqlBuilder.Select("SUM(t6.Quantity) AS TotalSold");

                    sqlBuilder.LeftJoin("ProductImage t2 ON t1.Id = t2.ProductId AND t2.IsDeleted != 1");
                    sqlBuilder.LeftJoin("Image t3 ON t2.ImageId = t3.Id AND t3.IsDeleted != 1");
                    sqlBuilder.LeftJoin("ProductCategory t4 ON t1.CategoryId = t4.Id AND t4.IsDeleted != 1");
                    sqlBuilder.LeftJoin("Brand t5 ON t1.BrandId = t5.Id AND t5.IsDeleted != 1");
                    sqlBuilder.LeftJoin("OrderDetail t6 ON t1.Id = t6.ProductId AND t6.IsDeleted != 1");
                    sqlBuilder.LeftJoin($"Orders t7 ON t6.OrderId = t7.Id AND t7.OrderStatus = '{OrderStatusEnum.Completed.ToString()}'");

                    sqlBuilder.Where("t1.Id = @id", new { id });

                    sqlBuilder.GroupBy(@"t1.Id,
                        t1.Code,
                        t1.Name,
                        t1.StockQuantity,
                        t1.ImportPrice,
                        t1.Price,
                        t1.Discount,
                        t1.Ingredient,
                        t1.Uses,
                        t1.UsageGuide,
                        t1.BrandId,
                        t1.Status,
                        t1.CategoryId,
                        t1.StartDate,
                        t1.EndDate,
                        t1.CreatedDate,
                        t1.UpdatedDate,
                        t1.CreatedBy,
                        t1.UpdatedBy,
                        t1.IsActive,
                        t1.IsDeleted,
                        t1.DisplayOrder,
                        t4.Code, t4.Name,
                        t5.Code, t5.Name,
                        t3.Id, t3.PublicId, t3.TypeImage, t3.ImageUrl, t2.DisplayOrder");
                    var products = await conn.QueryAsync<ProductDTO, ImageDTO, ProductDTO>(
                        sqlTemplate.RawSql,
                        (product, image) =>
                        {
                            if (!productDirectory.TryGetValue(product.Id, out var productEntry))
                            {
                                productEntry = product;
                                productEntry.Images = new List<ImageDTO>();
                                // format currency
                                if ((productEntry.StartDate != null && productEntry.EndDate != null) && (productEntry.StartDate <= DateTime.Now && productEntry.EndDate >= DateTime.Now))
                                    productEntry.NewPrice = Math.Round((decimal)(productEntry.Price * (1 - productEntry.Discount)), 2);
                                else
                                    productEntry.NewPrice = Math.Round(productEntry.Price ?? 0, 2);
                                productEntry.IsLiked = IsLikedAsync(productEntry.Id);
                                productEntry.ImportPrice = 0;
                                productDirectory.Add(product.Id, productEntry);
                            }
                            if (image != null && productEntry.Images.All(i => i.Id != image.Id))
                            {
                                productEntry.Images ??= new();
                                productEntry.Images.Add(image);
                            }

                            return productEntry;
                        },
                        sqlTemplate.Parameters,
                        splitOn: "Id");
                    return products.FirstOrDefault();
                }
            );
        }

        public async Task<IEnumerable<ProductDTO>> GetDataInVoucherCondition(int numberTop)
        {
            var conditions = await WithConnectionAsync(conn => conn.QueryAsync<string>(@$"
                SELECT t1.ConditionValue
                FROM VoucherCondition t1
                INNER JOIN Voucher t2 ON t1.VoucherId = t2.Id AND t2.IsDeleted != 1 AND t2.StartDate <= NOW() AND t2.EndDate > NOW()
                WHERE t1.ConditionType = '{ConditionTypeEnum.RequiredProducts.ToString()}'",
                commandType: CommandType.Text));

            var productCodesHashet = new HashSet<string>();
            foreach (var condition in conditions)
            {
                var productCodes = condition.Split(',');
                foreach (var productCode in productCodes)
                {
                    productCodesHashet.Add(productCode);
                }
            }

            return await WithDefaultTemplateAsync(
                (conn, sqlBuilder, sqlTemplate) =>
                {
                    sqlBuilder.Select($@"CASE
                                            WHEN t1.StartDate IS NOT NULL
                                            AND t1.EndDate IS NOT NULL
                                            AND NOW() >= t1.StartDate
                                            AND NOW() < t1.EndDate
                                            THEN t1.Price * (1 - t1.Discount)
                                            ELSE t1.Price
                                        END AS NewPrice");
                    sqlBuilder.Select("SUM(t3.Quantity) AS TotalSold");
                    sqlBuilder.Select("t2.*");

                    sqlBuilder.LeftJoin(@"(SELECT pi.ProductId,
                                          pi.DisplayOrder,
                                          i.Id,
                                          i.ImageUrl,
                                          i.PublicId,
                                          i.TypeImage
                                    FROM ProductImage pi
                                    INNER JOIN Image i ON pi.ImageId = i.Id AND i.IsDeleted != 1
                                    WHERE pi.IsDeleted != 1
                                    AND pi.DisplayOrder = (SELECT MIN(DisplayOrder) FROM ProductImage WHERE ProductId = pi.ProductId AND IsDeleted != 1)
                                    ) t2 ON t1.Id = t2.ProductId");
                    sqlBuilder.LeftJoin("OrderDetail t3 ON t1.Id = t3.ProductId AND t3.IsDeleted != 1");
                    sqlBuilder.LeftJoin($"Orders t4 ON t3.OrderId = t4.Id AND t4.OrderStatus = '{OrderStatusEnum.Completed.ToString()}'");

                    if (productCodesHashet.Any())
                    {
                        sqlBuilder.Where("t1.Code IN @productCodes OR (t1.StartDate <= NOW() AND t1.EndDate > NOW())", new { productCodes = productCodesHashet });
                    }
                    else
                    {
                        sqlBuilder.Where("t1.StartDate <= NOW() AND t1.EndDate > NOW()");
                    }

                    sqlBuilder.GroupBy(@"t1.Id,
                        t1.Code,
                        t1.Name,
                        t1.StockQuantity,
                        t1.ImportPrice,
                        t1.Price,
                        t1.Discount,
                        t1.Ingredient,
                        t1.Uses,
                        t1.UsageGuide,
                        t1.BrandId,
                        t1.Status,
                        t1.CategoryId,
                        t1.StartDate,
                        t1.EndDate,
                        t1.CreatedDate,
                        t1.UpdatedDate,
                        t1.CreatedBy,
                        t1.UpdatedBy,
                        t1.IsActive,
                        t1.IsDeleted,
                        t1.DisplayOrder,
                        t2.Id, t2.PublicId, t2.TypeImage, t2.ImageUrl, t2.DisplayOrder");

                    var productDirectory = new Dictionary<int, ProductDTO>();
                    return conn.QueryAsync<ProductDTO, ImageDTO, ProductDTO>(sqlTemplate.RawSql,
                        (product, image) =>
                        {
                            if (!productDirectory.TryGetValue(product.Id, out var productEntry))
                            {
                                productEntry = product;
                                productEntry.Images = new List<ImageDTO>();
                                productEntry.IsLiked = IsLikedAsync(productEntry.Id);
                                productEntry.ImportPrice = 0;
                                productDirectory.Add(product.Id, productEntry);
                            }
                            if (image != null && productEntry.Images.All(i => i.Id != image.Id))
                            {
                                productEntry.Images ??= new();
                                productEntry.Images.Add(image);
                            }

                            return productEntry;
                        },
                        sqlTemplate.Parameters,
                        splitOn: "Id");
                }, new RequestFilterModel()
                {
                    Take = numberTop
                });
        }
    }
}
