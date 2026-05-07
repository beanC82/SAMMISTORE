using Dapper;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Core.Models.RequestModels.QueryParams;
using SAMMI.ECOM.Core.Models.ResponseModels.PagingList;
using SAMMI.ECOM.Domain.AggregateModels.PurcharseOrder;
using SAMMI.ECOM.Domain.DomainModels.OrderBuy;
using SAMMI.ECOM.Domain.DomainModels.Reports;
using SAMMI.ECOM.Domain.Enums;
using SAMMI.ECOM.Repository.GenericRepositories;
using SAMMI.ECOM.Utility;

namespace SAMMI.ECOM.Infrastructure.Queries.OrderBy
{
    public interface IPurchaseOrderQueries : IQueryRepository
    {
        Task<IPagedList<PurchaseOrderDTO>> GetList(RequestFilterModel filterModel);
        Task<PurchaseOrderDTO> GetPurchaseOrder(int id);
        Task<ImportStatistic> GetImportStatistic(ImportStatisticFilterModel filterModel);
        Task<string?> GetCodeByLastId();
    }
    public class PurchaseOrderQueries : QueryRepository<PurchaseOrder>, IPurchaseOrderQueries
    {
        public PurchaseOrderQueries(SammiEcommerceContext context) : base(context)
        {
        }

        public async Task<ImportStatistic> GetImportStatistic(ImportStatisticFilterModel filterModel)
        {
            var detailPageList = await WithPagingTemplateAsync(
                (conn, sqlBuilder, sqlTemplate) =>
                {
                    sqlBuilder.Select("SUM(t2.Quantity) AS 'TotalQuantity', SUM(t2.Quantity * t2.UnitPrice) AS 'TotalPrice'");
                    sqlBuilder.Select("t3.FullName AS EmployeeName");
                    sqlBuilder.Select("t4.FullName AS SupplierName");

                    sqlBuilder.InnerJoin("PurchaseOrderDetail t2 ON t1.Id = t2.PurchaseOrderId AND t2.IsDeleted != 1");
                    sqlBuilder.InnerJoin("Users t3 ON t1.EmployeeId = t3.Id AND t3.IsDeleted != 1");
                    sqlBuilder.InnerJoin("Users t4 ON t1.SupplierId = t4.Id AND t4.IsDeleted != 1");

                    sqlBuilder.Where("t1.Status = @status", new { status = PurchaseOrderStatus.Completed.ToString() });
                    sqlBuilder.Where(string.Format("t1.CreatedDate >= '{0}' AND t1.CreatedDate <= '{1}'", string.Format("{0:yyyy-MM-dd HH:mm:ss}", filterModel.DateFrom), string.Format("{0:yyyy-MM-dd HH:mm:ss}", filterModel.DateTo)));
                    if (filterModel.EmployeeId != null && filterModel.EmployeeId != 0)
                    {
                        sqlBuilder.Where("t1.EmployeeId = @employeeId", new { employeeId = filterModel.EmployeeId });
                    }
                    if (filterModel.SupplierId != null && filterModel.SupplierId != 0)
                    {
                        sqlBuilder.Where("t1.SupplierId = @supplierId", new { supplierId = filterModel.SupplierId });
                    }

                    sqlBuilder.GroupBy(@"t1.Id,
                        t1.Code,
                        t1.EmployeeId,
                        t1.SupplierId,
                        t1.Status,
                        t1.Note,
                        t1.CreatedDate,
                        t1.UpdatedDate,
                        t1.CreatedBy,
                        t1.UpdatedBy,
                        t1.IsActive,
                        t1.IsDeleted,
                        t3.FullName,
                        t4.FullName");

                    //sqlBuilder.OrderBy("t1.CreatedDate DESC, t1.EmployeeId, t1.SupplierId");

                    string query = $@"
                        SELECT
                        DISTINCT t1.Id,
                        t1.Code AS Code,
                        t1.EmployeeId AS EmployeeId,
                        t1.SupplierId AS SupplierId,
                        t1.Status AS Status,
                        t1.Note AS Note,
                        t1.CreatedDate AS CreatedDate,
                        t1.UpdatedDate AS UpdatedDate,
                        t1.CreatedBy AS CreatedBy,
                        t1.UpdatedBy AS UpdatedBy,
                        t1.IsActive AS IsActive,
                        t1.IsDeleted AS IsDeleted,
                        SUM(t2.Quantity) AS 'TotalQuantity', SUM(t2.Quantity * t2.UnitPrice) AS 'TotalPrice',
                        t3.FullName AS EmployeeName,
                        t4.FullName AS SupplierName
                        FROM (
		                        SELECT DISTINCT
		                        DISTINCT t1.Id
		                        FROM PurchaseOrder t1
                        INNER JOIN PurchaseOrderDetail t2 ON t1.Id = t2.PurchaseOrderId AND t2.IsDeleted != 1
                        INNER JOIN Users t3 ON t1.EmployeeId = t3.Id AND t3.IsDeleted != 1
                        INNER JOIN Users t4 ON t1.SupplierId = t4.Id AND t4.IsDeleted != 1
                        WHERE t1.ISDELETED = 0 AND t1.Status = '{PurchaseOrderStatus.Completed.ToString()}'
                        AND t1.CreatedDate >= '{string.Format("{0:yyyy-MM-dd HH:mm:ss}", filterModel.DateFrom)}' AND t1.CreatedDate <= '{string.Format("{0:yyyy-MM-dd HH:mm:ss}", filterModel.DateTo)}'
                        {((filterModel.EmployeeId != null && filterModel.EmployeeId != 0)
                                ? $"AND t1.EmployeeId = {filterModel.EmployeeId}"
                                : "")}
                        {((filterModel.SupplierId != null && filterModel.SupplierId != 0)
                                ? $"AND t1.SupplierId = {filterModel.SupplierId}"
                                : "")}
                        GROUP BY t1.Id,
                                t1.Code,
                                t1.EmployeeId,
                                t1.SupplierId,
                                t1.Status,
                                t1.Note,
                                t1.CreatedDate,
                                t1.UpdatedDate,
                                t1.CreatedBy,
                                t1.UpdatedBy,
                                t1.IsActive,
                                t1.IsDeleted,
                                t3.FullName,
                                t4.FullName

                        ORDER BY t1.Id DESC

                        LIMIT @numberOfTakingRecords

                        OFFSET @numberOfSkipingRecords
                        ) s
                        INNER JOIN PurchaseOrder t1 ON t1.Id = s.Id

                        INNER JOIN PurchaseOrderDetail t2 ON t1.Id = t2.PurchaseOrderId AND t2.IsDeleted != 1
                        INNER JOIN Users t3 ON t1.EmployeeId = t3.Id AND t3.IsDeleted != 1
                        INNER JOIN Users t4 ON t1.SupplierId = t4.Id AND t4.IsDeleted != 1
                        GROUP BY t1.Id,
                                t1.Code,
                                t1.EmployeeId,
                                t1.SupplierId,
                                t1.Status,
                                t1.Note,
                                t1.CreatedDate,
                                t1.UpdatedDate,
                                t1.CreatedBy,
                                t1.UpdatedBy,
                                t1.IsActive,
                                t1.IsDeleted,
                                t3.FullName,
                                t4.FullName

                        ORDER BY t1.Id DESC , t1.CreatedDate DESC, t1.EmployeeId, t1.SupplierId";
                    return conn.QueryAsync<ImportStatisticDetail>(sqlTemplate.RawSql, sqlTemplate.Parameters);
                }, filterModel);

            detailPageList.Subset = detailPageList.Subset
                .OrderByDescending(x => x.CreatedDate)
                .ThenBy(x => x.EmployeeId)
                .ThenBy(x => x.SupplierId)
                .ToList();

            var totalImport = await WithDefaultTemplateAsync(
                (conn, sqlBuilder, sqlTemplate) =>
                {
                    sqlBuilder.Select("SUM(t2.Quantity) AS 'TotalQuantity', SUM(t2.Quantity * t2.UnitPrice) AS 'TotalPrice'");

                    sqlBuilder.InnerJoin("PurchaseOrderDetail t2 ON t1.Id = t2.PurchaseOrderId AND t2.IsDeleted != 1");

                    sqlBuilder.Where("t1.Status = @status", new { status = PurchaseOrderStatus.Completed.ToString() });
                    sqlBuilder.Where(string.Format("t1.CreatedDate >= '{0}' AND t1.CreatedDate <= '{1}'", string.Format("{0:yyyy-MM-dd HH:mm:ss}", filterModel.DateFrom), string.Format("{0:yyyy-MM-dd HH:mm:ss}", filterModel.DateTo)));
                    if (filterModel.EmployeeId != null && filterModel.EmployeeId != 0)
                    {
                        sqlBuilder.Where("t1.EmployeeId = @employeeId", new { employeeId = filterModel.EmployeeId });
                    }
                    if (filterModel.SupplierId != null && filterModel.SupplierId != 0)
                    {
                        sqlBuilder.Where("t1.SupplierId = @supplierId", new { supplierId = filterModel.SupplierId });
                    }

                    sqlBuilder.GroupBy(@"t1.Id,
                        t1.Code,
                        t1.EmployeeId,
                        t1.SupplierId,
                        t1.Status,
                        t1.Note,
                        t1.CreatedDate,
                        t1.UpdatedDate,
                        t1.CreatedBy,
                        t1.UpdatedBy,
                        t1.IsActive,
                        t1.IsDeleted");

                    return conn.QueryAsync<ImportStatisticDetail>(sqlTemplate.RawSql, sqlTemplate.Parameters);
                });

            var importStatistic = new ImportStatistic
            {
                Imports = detailPageList,
                TotalQuantity = totalImport.Sum(x => x.TotalQuantity ?? 0),
                TotalAmount = totalImport.Sum(x => (x.TotalPrice * x.TotalQuantity) ?? 0)
            };
            return importStatistic;
        }

        public Task<IPagedList<PurchaseOrderDTO>> GetList(RequestFilterModel filterModel)
        {
            return WithPagingTemplateAsync(
                (conn, sqlBuilder, sqlTemplate) =>
                {
                    sqlBuilder.Select("t2.FullName AS EmployeeName");
                    sqlBuilder.Select("t3.FullName AS SupplierName");
                    sqlBuilder.Select("SUM(t4.Quantity) AS TotalQuantity, SUM(t4.Quantity * t4.UnitPrice) AS TotalPrice");

                    sqlBuilder.InnerJoin("Users t2 ON t1.EmployeeId = t2.Id");
                    sqlBuilder.InnerJoin("Users t3 ON t1.SupplierId = t3.Id");
                    sqlBuilder.LeftJoin("PurchaseOrderDetail t4 ON t1.Id = t4.PurchaseOrderId");

                    sqlBuilder.GroupBy(@"t1.Id,
                    t1.EmployeeId,
                    t1.SupplierId,
                    t1.Status,
                    t1.Note,
                    t1.CreatedDate,
                    t1.UpdatedDate,
                    t1.CreatedBy,
                    t1.UpdatedBy,
                    t1.IsActive,
                    t1.IsDeleted,
                    t2.FullName, t3.FullName");

                    return conn.QueryAsync<PurchaseOrderDTO>(sqlTemplate.RawSql, sqlTemplate.Parameters);
                }, filterModel);
        }

        public async Task<PurchaseOrderDTO> GetPurchaseOrder(int id)
        {
            return await WithDefaultTemplateAsync(
                async (conn, sqlBuilder, sqlTemplate) =>
                {
                    sqlBuilder.Select("t2.FullName AS EmployeeName");
                    sqlBuilder.Select("t3.FullName AS SupplierName");
                    sqlBuilder.Select("t4.*");
                    sqlBuilder.Select("t5.Name AS ProductName");
                    sqlBuilder.Select("t6.ImageUrl");

                    sqlBuilder.InnerJoin("Users t2 ON t1.EmployeeId = t2.Id");
                    sqlBuilder.InnerJoin("Users t3 ON t1.SupplierId = t3.Id");
                    sqlBuilder.LeftJoin("PurchaseOrderDetail t4 ON t1.Id = t4.PurchaseOrderId");
                    sqlBuilder.LeftJoin("Product t5 ON t4.ProductId = t5.Id");
                    sqlBuilder.LeftJoin(@"(SELECT pi.ProductId, i.ImageUrl
                                        FROM ProductImage pi
                                        INNER JOIN Image i ON pi.ImageId = i.Id AND i.IsDeleted != 1
                                        WHERE pi.IsDeleted != 1
                                        AND i.DisplayOrder = (SELECT MIN(DisplayOrder) FROM Image WHERE Id = i.Id AND IsDeleted != 1)
                                        ) t6 ON t5.Id = t6.ProductId");

                    sqlBuilder.Where("t1.Id = @id", new { id });
                    var purchaseDictionary = new Dictionary<int, PurchaseOrderDTO>();
                    var iePurchase = await conn.QueryAsync<PurchaseOrderDTO, PurchaseOrderDetailDTO, PurchaseOrderDTO>(sqlTemplate.RawSql,
                        (purchase, detail) =>
                        {
                            if (!purchaseDictionary.TryGetValue(purchase.Id, out var purchaseEntity))
                            {
                                purchaseEntity = purchase;
                                purchaseEntity.Details = new List<PurchaseOrderDetailDTO>();
                                purchaseDictionary.Add(purchase.Id, purchaseEntity);
                            }

                            if (detail != null && purchaseEntity.Details.All(x => x.Id != detail.Id))
                            {
                                purchaseEntity.Details ??= new();
                                purchaseEntity.Details.Add(detail);
                            }
                            return purchaseEntity;
                        },
                        sqlTemplate.Parameters,
                        splitOn: "Id");

                    var purchaseDTO = iePurchase.FirstOrDefault();
                    purchaseDTO.TotalQuantity = purchaseDTO.Details.Sum(x => x.Quantity);
                    purchaseDTO.TotalPrice = purchaseDTO.Details.Sum(x => x.Quantity * x.UnitPrice);
                    return purchaseDTO;
                });
        }


        public async Task<string?> GetCodeByLastId()
        {
            int idLast = 0;
            string code = CodeEnum.PurchaseOrder.GetDescription();
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

    }
}
