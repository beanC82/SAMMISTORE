using Dapper;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Core.Models.RequestModels.QueryParams;
using SAMMI.ECOM.Core.Models.ResponseModels.PagingList;
using SAMMI.ECOM.Domain.AggregateModels.OrderBuy;
using SAMMI.ECOM.Domain.DomainModels.OrderBuy;
using SAMMI.ECOM.Domain.DomainModels.Reports;
using SAMMI.ECOM.Domain.Enums;
using SAMMI.ECOM.Domain.GlobalModels.Common;
using SAMMI.ECOM.Repository.GenericRepositories;

namespace SAMMI.ECOM.Infrastructure.Queries.OrderBy
{
    public interface IOrderQueries : IQueryRepository
    {
        Task<IPagedList<OrderDTO>> GetList(RequestFilterModel filterModel);

        Task<IEnumerable<SelectionItem>> GetSelectionList(RequestFilterModel? request);

        Task<IEnumerable<OrderDTO>> GetAll(RequestFilterModel? filterModel = null);

        Task<OrderDTO> GetById(int id);

        Task<IEnumerable<OrderDTO>> GetOrdersByCustomerId(int customerId, RequestFilterModel request);

        Task<IPagedList<OrderDTO>> GetListOrdersByCustomerId(int customerId, RequestFilterModel request);

        Task<SalesRevenue> RevenueOrder(SaleRevenueFilterModel filterModel);

        Task<decimal?> GetTotalRevenueInDay();
    }

    public class OrderQueries : QueryRepository<Order>, IOrderQueries
    {
        public OrderQueries(SammiEcommerceContext context) : base(context)
        {
        }

        public Task<IEnumerable<OrderDTO>> GetAll(RequestFilterModel? filterModel = null)
        {
            return WithDefaultTemplateAsync(
                (conn, sqlBuilder, sqlTemplate) =>
                {
                    return conn.QueryAsync<OrderDTO>(sqlTemplate.RawSql, sqlTemplate.Parameters);
                }, filterModel);
        }

        public async Task<OrderDTO> GetById(int id)
        {
            return await WithDefaultTemplateAsync(
                async (conn, sqlBuilder, sqlTemplate) =>
                {
                    sqlBuilder.Select("t2.FullName AS CustomerName, t2.Phone AS PhoneNumber");
                    sqlBuilder.Select("CONCAT(t1.CustomerAddress, ', ', t4.Name, ', ', t5.Name, ', ', t6.Name) AS CustomerAddress");
                    sqlBuilder.Select("t8.PaymentStatus");
                    sqlBuilder.Select("t10.Name AS PaymentMethod");
                    sqlBuilder.Select("t7.*");
                    sqlBuilder.Select("t9.Name AS ProductName");
                    sqlBuilder.Select("t11.ImageUrl");

                    sqlBuilder.InnerJoin("Users t2 ON t1.CustomerId = t2.Id");
                    sqlBuilder.LeftJoin("Voucher t3 ON t1.VoucherId = t3.Id");
                    sqlBuilder.LeftJoin("Ward t4 ON t1.WardId = t4.Id");
                    sqlBuilder.LeftJoin("District t5 ON t4.DistrictId = t5.Id");
                    sqlBuilder.LeftJoin("Province t6 ON t5.ProvinceId = t5.Id");
                    sqlBuilder.InnerJoin("OrderDetail t7 ON t1.Id = t7.OrderId");
                    sqlBuilder.LeftJoin("Payment t8 ON t1.Id = t8.OrderId AND t8.IsDeleted != 1");
                    sqlBuilder.LeftJoin("Product t9 ON t7.ProductId = t9.Id");
                    sqlBuilder.LeftJoin("PaymentMethod t10 ON t8.PaymentMethodId = t10.Id");
                    sqlBuilder.LeftJoin(@"(SELECT pi.ProductId, i.ImageUrl
                                        FROM ProductImage pi
                                        INNER JOIN Image i ON pi.ImageId = i.Id AND i.IsDeleted != 1
                                        WHERE pi.IsDeleted != 1
                                        AND pi.DisplayOrder = (SELECT MIN(DisplayOrder) FROM ProductImage WHERE ProductId = pi.ProductId AND IsDeleted != 1)
                                        ) t11 ON t9.Id = t11.ProductId");

                    sqlBuilder.Where("t1.Id = @id", new { id });
                    var orderDictonary = new Dictionary<int, OrderDTO>();
                    var orders = await conn.QueryAsync<OrderDTO, OrderDetailDTO, OrderDTO>(sqlTemplate.RawSql,
                        (order, detail) =>
                        {
                            if (!orderDictonary.TryGetValue(order.Id, out var orderEntry))
                            {
                                orderEntry = order;
                                orderEntry.Details = new List<OrderDetailDTO>();
                                orderDictonary[order.Id] = orderEntry;
                            }

                            if (detail != null && orderEntry.Details.All(x => x.Id != detail.Id))
                            {
                                orderEntry.Details ??= new();
                                orderEntry.Details.Add(detail);
                            }

                            return orderEntry;
                        },
                        sqlTemplate.Parameters,
                        splitOn: "Id");

                    var orderDTO = orders.FirstOrDefault();
                    if (orderDTO == null)
                        return orderDTO;
                    orderDTO.TotalQuantity = orderDTO.Details.Sum(x => x.Quantity);
                    orderDTO.TotalPrice = orderDTO.Details.Sum(x => x.Quantity * x.Price);

                    return orderDTO;
                }
            );
        }

        public Task<IPagedList<OrderDTO>> GetList(RequestFilterModel filterModel)
        {
            return WithPagingTemplateAsync(
                (conn, sqlBuilder, sqlTemplate) =>
                {
                    sqlBuilder.Select("t2.FullName AS CustomerName, t2.Phone AS PhoneNumber");
                    sqlBuilder.Select("CONCAT(t1.CustomerAddress, ', ', t4.Name, ', ', t5.Name, ', ', t6.Name) AS CustomerAddress");
                    sqlBuilder.Select("SUM(t7.Quantity) AS TotalQuantity, SUM(t7.Quantity * t7.Price) AS TotalPrice");
                    sqlBuilder.Select("t8.PaymentStatus");
                    sqlBuilder.Select("t9.Name AS PaymentMethod");

                    sqlBuilder.InnerJoin("Users t2 ON t1.CustomerId = t2.Id");
                    sqlBuilder.LeftJoin("Voucher t3 ON t1.VoucherId = t3.Id");
                    sqlBuilder.LeftJoin("Ward t4 ON t1.WardId = t4.Id");
                    sqlBuilder.LeftJoin("District t5 ON t4.DistrictId = t5.Id");
                    sqlBuilder.LeftJoin("Province t6 ON t5.ProvinceId = t5.Id");
                    sqlBuilder.InnerJoin("OrderDetail t7 ON t1.Id = t7.OrderId");
                    sqlBuilder.LeftJoin("Payment t8 ON t1.Id = t8.OrderId AND t8.IsDeleted != 1");
                    sqlBuilder.LeftJoin("PaymentMethod t9 ON t8.PaymentMethodId = t9.Id");

                    if (filterModel.Any("PaymentStatus"))
                    {
                        sqlBuilder.Where("t8.PaymentStatus = @PaymentStatus", new { PaymentStatus = filterModel.Get("PaymentStatus") });
                    }

                    if(filterModel.Any("CustomerName"))
                    {
                        PropertyFilterModel propertyName = filterModel.GetProperty("CustomerName");
                        propertyName.FilterColumn = "t2.FullName";
                        PropertyFilterModel propertyPhone = filterModel.GetProperty("CustomerName");
                        propertyName.FilterColumn = "t2.Phone";
                        sqlBuilder.Where($"{RequestFilterModel.GetCommandFromPropertyFilterModel(propertyName)} OR {RequestFilterModel.GetCommandFromPropertyFilterModel(propertyPhone)}");
                    }

                    //if(filterModel.Any("CustomerAddress"))
                    //{
                    //    PropertyFilterModel property = filterModel.GetProperty("CustomerAddress");
                    //    property.FilterColumn = "CONCAT(t1.CustomerAddress, ', ', t4.Name, ', ', t5.Name, ', ', t6.Name)";
                    //    sqlBuilder.Where(RequestFilterModel.GetCommandFromPropertyFilterModel(property));
                    //}


                    sqlBuilder.GroupBy(@"t1.Id,
                        t1.Code,
                        t1.CustomerId,
                        t1.OrderStatus,
                        t1.ShippingStatus,
                        t1.VoucherId,
                        t1.WardId,
                        t1.CustomerAddress,
                        t1.CostShip,
                        t1.TrackingNumber,
                        t1.EstimatedDeliveryDate,
                        t1.ActualDeliveryDate,
                        t1.ShippingCompanyId,
                        t1.CreatedDate,
                        t1.UpdatedDate,
                        t1.CreatedBy,
                        t1.UpdatedBy,
                        t1.IsActive,
                        t1.IsDeleted,
                        t1.DisplayOrder");
                    sqlBuilder.GroupBy("t2.FullName, t2.Phone, t4.Name, t5.Name, t6.Name, t8.PaymentStatus, t9.Name");
                    return conn.QueryAsync<OrderDTO>(sqlTemplate.RawSql, sqlTemplate.Parameters);
                },
                filterModel);
        }

        public async Task<IPagedList<OrderDTO>> GetListOrdersByCustomerId(int customerId, RequestFilterModel request)
        {
            return await WithPagingTemplateAsync(
                async (conn, sqlBuilder, sqlTemplate) =>
                {
                    sqlBuilder.Select("t2.FullName AS CustomerName, t2.Phone AS PhoneNumber");
                    sqlBuilder.Select("CONCAT(t1.CustomerAddress, ', ', t4.Name, ', ', t5.Name, ', ', t6.Name) AS CustomerAddress");
                    sqlBuilder.Select("t8.PaymentStatus, t8.PaymentMethodId");
                    sqlBuilder.Select("t10.Name AS PaymentMethod");
                    sqlBuilder.Select("t7.*");
                    sqlBuilder.Select("t9.Name AS ProductName");
                    sqlBuilder.Select("t11.ImageUrl");

                    sqlBuilder.InnerJoin("Users t2 ON t1.CustomerId = t2.Id");
                    sqlBuilder.LeftJoin("Voucher t3 ON t1.VoucherId = t3.Id");
                    sqlBuilder.LeftJoin("Ward t4 ON t1.WardId = t4.Id");
                    sqlBuilder.LeftJoin("District t5 ON t4.DistrictId = t5.Id");
                    sqlBuilder.LeftJoin("Province t6 ON t5.ProvinceId = t5.Id");
                    sqlBuilder.InnerJoin("OrderDetail t7 ON t1.Id = t7.OrderId");
                    sqlBuilder.LeftJoin("Payment t8 ON t1.Id = t8.OrderId AND t8.IsDeleted != 1");
                    sqlBuilder.LeftJoin("Product t9 ON t7.ProductId = t9.Id");
                    sqlBuilder.LeftJoin("PaymentMethod t10 ON t8.PaymentMethodId = t10.Id");
                    sqlBuilder.LeftJoin(@"(SELECT pi.ProductId, i.ImageUrl
                                        FROM ProductImage pi
                                        INNER JOIN Image i ON pi.ImageId = i.Id AND i.IsDeleted != 1
                                        WHERE pi.IsDeleted != 1
                                        AND pi.DisplayOrder = (SELECT MIN(DisplayOrder) FROM ProductImage WHERE ProductId = pi.ProductId AND IsDeleted != 1)
                                        ) t11 ON t9.Id = t11.ProductId"
                    );

                    sqlBuilder.Where("t2.Id = @customerId", new { customerId });
                    if (request.Any("PaymentStatus"))
                    {
                        sqlBuilder.Where("t8.PaymentStatus = @PaymentStatus", new { PaymentStatus = request.Get("PaymentStatus") });
                    }

                    var orderDictonary = new Dictionary<int, OrderDTO>();
                    var orders = await conn.QueryAsync<OrderDTO, OrderDetailDTO, OrderDTO>(sqlTemplate.RawSql,
                        (order, detail) =>
                        {
                            if (!orderDictonary.TryGetValue(order.Id, out var orderEntry))
                            {
                                orderEntry = order;
                                orderEntry.Details = new List<OrderDetailDTO>();
                                orderDictonary[order.Id] = orderEntry;
                            }

                            if (detail != null && orderEntry.Details.All(x => x.Id != detail.Id))
                            {
                                orderEntry.Details ??= new();
                                orderEntry.Details.Add(detail);
                            }

                            return orderEntry;
                        },
                        sqlTemplate.Parameters,
                        splitOn: "Id");

                    foreach (var order in orders)
                    {
                        order.TotalQuantity = order.Details.Sum(x => x.Quantity);
                        order.TotalPrice = order.Details.Sum(x => x.Quantity * x.Price);
                    }
                    return orders;
                }, request
            );
        }

        public async Task<IEnumerable<OrderDTO>> GetOrdersByCustomerId(int customerId, RequestFilterModel request)
        {
            return await WithDefaultTemplateAsync(
                async (conn, sqlBuilder, sqlTemplate) =>
                {
                    sqlBuilder.Select("t2.FullName AS CustomerName, t2.Phone AS PhoneNumber");
                    sqlBuilder.Select("CONCAT(t1.CustomerAddress, ', ', t4.Name, ', ', t5.Name, ', ', t6.Name) AS CustomerAddress");
                    sqlBuilder.Select("t8.PaymentStatus, t8.PaymentMethodId");
                    sqlBuilder.Select("t10.Name AS PaymentMethod");
                    sqlBuilder.Select("t7.*");
                    sqlBuilder.Select("t9.Name AS ProductName");
                    sqlBuilder.Select("t11.ImageUrl");

                    sqlBuilder.InnerJoin("Users t2 ON t1.CustomerId = t2.Id");
                    sqlBuilder.LeftJoin("Voucher t3 ON t1.VoucherId = t3.Id");
                    sqlBuilder.LeftJoin("Ward t4 ON t1.WardId = t4.Id");
                    sqlBuilder.LeftJoin("District t5 ON t4.DistrictId = t5.Id");
                    sqlBuilder.LeftJoin("Province t6 ON t5.ProvinceId = t5.Id");
                    sqlBuilder.InnerJoin("OrderDetail t7 ON t1.Id = t7.OrderId");
                    sqlBuilder.LeftJoin("Payment t8 ON t1.Id = t8.OrderId AND t8.IsDeleted != 1");
                    sqlBuilder.LeftJoin("Product t9 ON t7.ProductId = t9.Id");
                    sqlBuilder.LeftJoin("PaymentMethod t10 ON t8.PaymentMethodId = t10.Id");
                    sqlBuilder.LeftJoin(@"(SELECT pi.ProductId, i.ImageUrl
                                        FROM ProductImage pi
                                        INNER JOIN Image i ON pi.ImageId = i.Id AND i.IsDeleted != 1
                                        WHERE pi.IsDeleted != 1
                                        AND pi.DisplayOrder = (SELECT MIN(DisplayOrder) FROM ProductImage WHERE ProductId = pi.ProductId AND IsDeleted != 1)
                                        ) t11 ON t9.Id = t11.ProductId"
                    );

                    sqlBuilder.Where("t2.Id = @customerId", new { customerId });
                    if (request.Any("PaymentStatus"))
                    {
                        sqlBuilder.Where("t8.PaymentStatus = @PaymentStatus", new { PaymentStatus = request.Get("PaymentStatus") });
                    }
                    var orderDictonary = new Dictionary<int, OrderDTO>();
                    var orders = await conn.QueryAsync<OrderDTO, OrderDetailDTO, OrderDTO>(sqlTemplate.RawSql,
                        (order, detail) =>
                        {
                            if (!orderDictonary.TryGetValue(order.Id, out var orderEntry))
                            {
                                orderEntry = order;
                                orderEntry.Details = new List<OrderDetailDTO>();
                                orderDictonary[order.Id] = orderEntry;
                            }

                            if (detail != null && orderEntry.Details.All(x => x.Id != detail.Id))
                            {
                                orderEntry.Details ??= new();
                                orderEntry.Details.Add(detail);
                            }

                            return orderEntry;
                        },
                        sqlTemplate.Parameters,
                        splitOn: "Id");

                    foreach (var order in orders)
                    {
                        order.TotalQuantity = order.Details.Sum(x => x.Quantity);
                        order.TotalPrice = order.Details.Sum(x => x.Quantity * x.Price);
                    }
                    return orders;
                }
            );
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

        public Task<decimal?> GetTotalRevenueInDay()
        {
            return WithDefaultTemplateAsync(
                (conn, sqlBuilder, sqlTemplate) =>
                {
                    sqlBuilder.Select("SUM(t2.Quantity * t2.Price) AS TotalRevenue");
                    sqlBuilder.InnerJoin("OrderDetail t2 ON t1.Id = t2.OrderId AND t2.IsDeleted != 1");
                    sqlBuilder.Where($"t1.OrderStatus = @orderStatus", new { orderStatus = OrderStatusEnum.Completed.ToString() });
                    sqlBuilder.Where($"t1.CreatedDate BETWEEN @startDate AND @endDate", new { startDate = DateTime.Now.Date.ToString("yyyy/MM/dd"), endDate = DateTime.Now.AddDays(1).ToString("yyyy/MM/dd") });
                    return conn.QuerySingleAsync<decimal?>(sqlTemplate.RawSql, sqlTemplate.Parameters);
                }
            );
        }

        public async Task<SalesRevenue> RevenueOrder(SaleRevenueFilterModel filterModel)
        {
            var detailPageList = await WithPagingTemplateAsync(
                async (conn, sqlBuilder, sqlTemplate) =>
                {
                    sqlBuilder.Select("SUM(t2.Quantity) AS 'TotalQuantity', SUM(t2.Quantity * t2.Price) - COALESCE(t1.DiscountValue, 0) AS 'TotalPrice'");
                    sqlBuilder.Select("t3.FullName AS 'CustomerName', t3.Phone AS 'PhoneNumber'");
                    sqlBuilder.Select("t4.PaymentMethodId");
                    sqlBuilder.Select("t5.Name AS 'PaymentMethod'");

                    sqlBuilder.InnerJoin("OrderDetail t2 ON t1.Id = t2.OrderId AND t2.IsDeleted != 1");
                    sqlBuilder.InnerJoin("Users t3 ON t1.CustomerId = t3.Id AND t3.IsDeleted != 1");
                    sqlBuilder.InnerJoin("Payment t4 ON t1.Id = t4.OrderId AND t4.IsDeleted != 1");
                    sqlBuilder.LeftJoin("PaymentMethod t5 ON t4.PaymentMethodId = t5.Id AND t5.IsDeleted != 1");

                    sqlBuilder.Where($"t1.OrderStatus = @orderStatus", new {orderStatus = OrderStatusEnum.Completed.ToString() });
                    sqlBuilder.Where($"t1.CreatedDate >= '{string.Format("{0:yyyy-MM-dd HH:mm:ss}", filterModel.DateFrom)}' AND t1.CreatedDate <= '{string.Format("{0:yyyy-MM-dd HH:mm:ss}", filterModel.DateTo)}'");
                    if (filterModel.PaymentMethodId != null && filterModel.PaymentMethodId != 0)
                    {
                        sqlBuilder.Where($"t4.PaymentMethodId = {filterModel.PaymentMethodId}");
                    }

                    sqlBuilder.GroupBy(@"t1.Id,
                        t1.Code,
                        t1.CustomerId,
                        t1.OrderStatus,
                        t1.CreatedDate,
                        t1.UpdatedDate,
                        t1.CreatedBy,
                        t1.UpdatedBy,
                        t1.IsActive,
                        t1.IsDeleted,
                        t1.DisplayOrder,
                        t3.FullName, t3.Phone,
                        t4.PaymentMethodId, t5.Name");

                    //sqlBuilder.OrderBy("t1.CreatedDate DESC");
                    //sqlBuilder.OrderBy("t1.CustomerId ASC");

                    string query = $@"
                        SELECT
                        DISTINCT t1.Id,
                        t1.Code AS Code,
                        t1.CustomerId AS CustomerId,
                        t1.OrderStatus AS OrderStatus,
                        t1.CreatedDate AS CreatedDate,
                        t1.UpdatedDate AS UpdatedDate,
                        t1.CreatedBy AS CreatedBy,
                        t1.UpdatedBy AS UpdatedBy,
                        t1.IsActive AS IsActive,
                        t1.IsDeleted AS IsDeleted,
                        t1.DisplayOrder AS DisplayOrder,
                        SUM(t2.Quantity) AS 'TotalQuantity', SUM(t2.Quantity * t2.Price) - t1.DiscountValue AS 'TotalPrice',
                        t3.FullName AS 'CustomerName', t3.Phone AS 'PhoneNumber',
                        t4.PaymentMethodId,
                        t5.Name AS 'PaymentMethod'
                        FROM (
		                    SELECT DISTINCT
		                    DISTINCT t1.Id
		                    FROM Orders t1
                            INNER JOIN OrderDetail t2 ON t1.Id = t2.OrderId AND t2.IsDeleted != 1
                            INNER JOIN Users t3 ON t1.CustomerId = t3.Id AND t3.IsDeleted != 1
                            INNER JOIN Payment t4 ON t1.Id = t4.OrderId AND t4.IsDeleted != 1
                            LEFT JOIN PaymentMethod t5 ON t4.PaymentMethodId = t5.Id AND t5.IsDeleted != 1
                            WHERE t1.ISDELETED = 0 AND t1.OrderStatus = '{OrderStatusEnum.Completed.ToString()}'
                            AND t1.CreatedDate >= '{string.Format("{0:yyyy-MM-dd HH:mm:ss}", filterModel.DateFrom)}' AND t1.CreatedDate <= '{string.Format("{0:yyyy-MM-dd HH:mm:ss}", filterModel.DateTo)}'
                            {((filterModel.PaymentMethodId != null && filterModel.PaymentMethodId != 0)
                                ? $"AND t4.PaymentMethodId = {filterModel.PaymentMethodId}"
                                : "")}
                            GROUP BY t1.Id,
                                t1.Code,
                                t1.CustomerId,
                                t1.OrderStatus,
                                t1.CreatedDate,
                                t1.UpdatedDate,
                                t1.CreatedBy,
                                t1.UpdatedBy,
                                t1.IsActive,
                                t1.IsDeleted,
                                t1.DisplayOrder,
                                t3.FullName, t3.Phone,
                                t4.PaymentMethodId, t5.Name

                        LIMIT @numberOfTakingRecords

                        OFFSET @numberOfSkipingRecords
                        ) s
                        INNER JOIN Orders t1 ON t1.Id = s.Id

                        INNER JOIN OrderDetail t2 ON t1.Id = t2.OrderId AND t2.IsDeleted != 1
                        INNER JOIN Users t3 ON t1.CustomerId = t3.Id AND t3.IsDeleted != 1
                        INNER JOIN Payment t4 ON t1.Id = t4.OrderId AND t4.IsDeleted != 1
                        LEFT JOIN PaymentMethod t5 ON t4.PaymentMethodId = t5.Id AND t5.IsDeleted != 1
                        GROUP BY t1.Id,
                                t1.Code,
                                t1.CustomerId,
                                t1.OrderStatus,
                                t1.CreatedDate,
                                t1.UpdatedDate,
                                t1.CreatedBy,
                                t1.UpdatedBy,
                                t1.IsActive,
                                t1.IsDeleted,
                                t1.DisplayOrder,
                                t3.FullName, t3.Phone,
                                t4.PaymentMethodId, t5.Name
                        ORDER BY t1.Id DESC , t1.CreatedDate DESC , t1.CustomerId ASC";

                    return await conn.QueryAsync<SalesRevenueDetail>(sqlTemplate.RawSql, sqlTemplate.Parameters);
                }, filterModel);

            detailPageList.Subset = detailPageList.Subset.OrderByDescending(x => x.CreatedDate)
                .ThenBy(x => x.CustomerId)
                .ToList();

            var totalRevenue = await WithDefaultTemplateAsync(
                (conn, sqlBuilder, sqlTemplate) =>
                {
                    sqlBuilder.Select("SUM(t2.Quantity) AS 'TotalQuantity', SUM(t2.Quantity * t2.Price) - COALESCE(t1.DiscountValue, 0) AS 'TotalPrice'");

                    sqlBuilder.InnerJoin("OrderDetail t2 ON t1.Id = t2.OrderId AND t2.IsDeleted != 1");
                    sqlBuilder.InnerJoin("Payment t3 ON t1.Id = t3.OrderId AND t3.IsDeleted != 1");

                    sqlBuilder.Where($"t1.OrderStatus = @orderStatus", new { orderStatus = OrderStatusEnum.Completed.ToString() });
                    sqlBuilder.Where($"t1.CreatedDate >= '{string.Format("{0:yyyy-MM-dd HH:mm:ss}", filterModel.DateFrom)}' AND t1.CreatedDate <= '{string.Format("{0:yyyy-MM-dd HH:mm:ss}", filterModel.DateTo)}'");
                    if (filterModel.PaymentMethodId != null && filterModel.PaymentMethodId != 0)
                    {
                        sqlBuilder.Where($"t3.PaymentMethodId = {filterModel.PaymentMethodId}");
                    }
                    sqlBuilder.GroupBy(@"t1.Id,
                        t1.Code,
                        t1.CustomerId,
                        t1.OrderStatus,
                        t1.CreatedDate,
                        t1.UpdatedDate,
                        t1.CreatedBy,
                        t1.UpdatedBy,
                        t1.IsActive,
                        t1.IsDeleted,
                        t1.DisplayOrder");

                    return conn.QueryAsync<SalesRevenueDetail>(sqlTemplate.RawSql, sqlTemplate.Parameters);
                });

            var salesRevenue = new SalesRevenue
            {
                TotalAmount = totalRevenue.Sum(x => x.TotalPrice),
                TotalQuantity = totalRevenue.Sum(x => x.TotalQuantity),
                RevenueDetails = detailPageList,
            };

            return salesRevenue;
        }
    }
}