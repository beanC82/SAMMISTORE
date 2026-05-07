using System.Data;
using Dapper;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Core.Models.ResponseModels.PagingList;
using SAMMI.ECOM.Domain.AggregateModels.EventVoucher;
using SAMMI.ECOM.Domain.DomainModels.OrderBuy;
using SAMMI.ECOM.Domain.Enums;
using SAMMI.ECOM.Domain.GlobalModels.Common;
using SAMMI.ECOM.Infrastructure.Queries.Auth;
using SAMMI.ECOM.Repository.GenericRepositories;
using SAMMI.ECOM.Utility;

namespace SAMMI.ECOM.Infrastructure.Queries.OrderBy
{
    public interface IVoucherQueries : IQueryRepository
    {
        Task<IPagedList<VoucherDTO>> GetList(RequestFilterModel filterModel);
        Task<IEnumerable<SelectionItem>> GetSelectionList(List<ProductVoucher> details);
        Task<IEnumerable<VoucherDTO>> GetAll(RequestFilterModel? filterModel = null);
        Task<VoucherDTO> GetById(int id);
        Task<string?> GetCodeByLastId(CodeEnum? type = CodeEnum.Voucher);
        Task<IEnumerable<VoucherDTO>> GetVoucherOfCustomer(int customerId);
        Task<IEnumerable<VoucherDTO>> GetVoucherActive(int numberTop);
        Task<IEnumerable<VoucherDTO>> GetDataByEventId(int eventId);
    }

    public class VoucherQueries : QueryRepository<Voucher>, IVoucherQueries
    {
        public VoucherQueries(SammiEcommerceContext context) : base(context)
        {
        }

        public Task<IEnumerable<VoucherDTO>> GetAll(RequestFilterModel? filterModel = null)
        {
            return WithDefaultTemplateAsync(
                (conn, sqlBuilder, sqlTemplate) =>
                {
                    sqlBuilder.Select("t2.Name AS EventName");
                    sqlBuilder.Select("t3.Name AS DiscountName");
                    sqlBuilder.Select("t4.*");

                    sqlBuilder.LeftJoin("Event t2 ON t1.EventId = t2.Id AND t2.IsDeleted != 1");
                    sqlBuilder.LeftJoin("DiscountType t3 ON t1.DiscountTypeId = t3.Id AND t3.IsDeleted != 1");
                    sqlBuilder.LeftJoin("VoucherCondition t4 ON t1.Id = t4.VoucherId AND t4.IsDeleted != 1");

                    var voucherDictonary = new Dictionary<int, VoucherDTO>();
                    return conn.QueryAsync<VoucherDTO, VoucherConditionDTO, VoucherDTO>(sqlTemplate.RawSql,
                        (voucher, condition) =>
                        {
                            if (!voucherDictonary.TryGetValue(voucher.Id, out var voucherEntry))
                            {
                                voucherEntry = voucher;
                                voucherEntry.Conditions = new List<VoucherConditionDTO>();
                                voucherDictonary.Add(voucherEntry.Id, voucherEntry);
                            }

                            if (condition != null && voucherEntry.Conditions.All(x => x.Id != condition.Id))
                            {
                                voucherEntry.Conditions ??= new();
                                voucherEntry.Conditions.Add(condition);
                            }

                            return voucherEntry;
                        },
                        sqlTemplate.Parameters,
                        splitOn: "Id");
                }, filterModel);
        }

        public async Task<VoucherDTO> GetById(int id)
        {
            return await WithDefaultTemplateAsync(
                async (conn, sqlBuilder, sqlTemplate) =>
                {

                    sqlBuilder.Select("t2.Name AS EventName");
                    sqlBuilder.Select("t3.Name AS DiscountName");
                    sqlBuilder.Select("t4.*");

                    sqlBuilder.LeftJoin("Event t2 ON t1.EventId = t2.Id AND t2.IsDeleted != 1");
                    sqlBuilder.LeftJoin("DiscountType t3 ON t1.DiscountTypeId = t3.Id AND t3.IsDeleted != 1");
                    sqlBuilder.LeftJoin("VoucherCondition t4 ON t1.Id = t4.VoucherId AND t4.IsDeleted != 1");

                    sqlBuilder.Where("t1.Id = @id", new {id});
                    var voucherDictonary = new Dictionary<int, VoucherDTO>();
                    var vouchers = await conn.QueryAsync<VoucherDTO, VoucherConditionDTO, VoucherDTO>(sqlTemplate.RawSql,
                        (voucher, condition) =>
                        {
                            if (!voucherDictonary.TryGetValue(voucher.Id, out var voucherEntry))
                            {
                                voucherEntry = voucher;
                                voucherEntry.Conditions = new List<VoucherConditionDTO>();
                                voucherDictonary.Add(voucherEntry.Id, voucherEntry);
                            }

                            if (condition != null && voucherEntry.Conditions.All(x => x.Id != condition.Id))
                            {
                                voucherEntry.Conditions ??= new();
                                voucherEntry.Conditions.Add(condition);
                            }

                            return voucherEntry;
                        },
                        sqlTemplate.Parameters,
                        splitOn: "Id");

                    return vouchers.FirstOrDefault();
                }
            );
        }

        public Task<IPagedList<VoucherDTO>> GetList(RequestFilterModel filterModel)
        {
            return WithPagingTemplateAsync(
                (conn, sqlBuilder, sqlTemplate) =>
                {
                    sqlBuilder.Select("t2.Name AS EventName");
                    sqlBuilder.Select("t3.Name AS DiscountName");
                    sqlBuilder.Select("t4.*");

                    sqlBuilder.LeftJoin("Event t2 ON t1.EventId = t2.Id AND t2.IsDeleted != 1");
                    sqlBuilder.LeftJoin("DiscountType t3 ON t1.DiscountTypeId = t3.Id AND t3.IsDeleted != 1");
                    sqlBuilder.LeftJoin("VoucherCondition t4 ON t1.Id = t4.VoucherId AND t4.IsDeleted != 1");

                    if (filterModel.Any("eventName"))
                    {
                        PropertyFilterModel property = filterModel.GetProperty("eventName");
                        property.FilterColumn = "t2.Name";
                        sqlBuilder.Where(RequestFilterModel.GetCommandFromPropertyFilterModel(property));
                    }

                    var voucherDictonary = new Dictionary<int, VoucherDTO>();
                    return conn.QueryAsync<VoucherDTO, VoucherConditionDTO, VoucherDTO>(sqlTemplate.RawSql,
                        (voucher, condition) =>
                        {
                            if (!voucherDictonary.TryGetValue(voucher.Id, out var voucherEntry))
                            {
                                voucherEntry = voucher;
                                voucherEntry.Conditions = new List<VoucherConditionDTO>();
                                voucherDictonary.Add(voucherEntry.Id, voucherEntry);
                            }

                            if(condition != null && voucherEntry.Conditions.All(x => x.Id != condition.Id))
                            {
                                voucherEntry.Conditions ??= new();
                                voucherEntry.Conditions.Add(condition);
                            }

                            return voucherEntry;
                        },
                        sqlTemplate.Parameters,
                        splitOn: "Id");
                },
                filterModel);
        }

        public Task<IEnumerable<SelectionItem>> GetSelectionList(List<ProductVoucher> details)
        {
            return WithDefaultTemplateAsync(
                (conn, sqlBuilder, sqlTemplate) =>
                {
                    sqlBuilder.Select("t1.Id as Value");
                    sqlBuilder.Select("CONCAT(t1.Code, '-', t1.Name) as Text");

                    sqlBuilder.Where("t1.IsActive = 1 AND t1.StartDate <= NOW() AND t1.EndDate > NOW()");
                    return conn.QueryAsync<SelectionItem>(sqlTemplate.RawSql, sqlTemplate.Parameters);
                }
            );
        }

        public async Task<string?> GetCodeByLastId(CodeEnum? type = CodeEnum.Voucher)
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

        public Task<IEnumerable<VoucherDTO>> GetVoucherOfCustomer(int customerId)
        {
            return WithDefaultTemplateAsync(
                (conn, sqlBuilder, sqlTemplate) =>
                {
                    sqlBuilder.InnerJoin("MyVoucher t2 ON t1.Id = t2.VoucherId AND t2.IsDeleted != 1");

                    //sqlBuilder.Where("t1.StartDate <= NOW() AND t1.EndDate > NOW()");
                    sqlBuilder.Where("t2.CustomerId = @customerId", new { customerId });
                    return conn.QueryAsync<VoucherDTO>(sqlTemplate.RawSql, sqlTemplate.Parameters);
                });
        }

        public async Task<IEnumerable<VoucherDTO>> GetVoucherActive(int numberTop)
        {
            return await WithDefaultTemplateAsync(
                async (conn, sqlBuilder, sqlTemplate) =>
                {
                    sqlBuilder.Select("t1.*");
                    sqlBuilder.Select("t2.*");

                    sqlBuilder.InnerJoin("VoucherCondition t2 ON t1.Id = t2.VoucherId AND t2.IsDeleted != 1");

                    sqlBuilder.Where("t1.EndDate >= NOW() AND t1.IsActive = 1");

                    var voucherDictionary = new Dictionary<int, VoucherDTO>();
                    var vouchers = await conn.QueryAsync<VoucherDTO, VoucherConditionDTO, VoucherDTO>(sqlTemplate.RawSql,
                        (voucher, condition) =>
                        {
                            if (!voucherDictionary.TryGetValue(voucher.Id, out var voucherEntry))
                            {
                                voucherEntry = voucher;
                                voucherEntry.Conditions = new List<VoucherConditionDTO>();
                                voucherDictionary.Add(voucherEntry.Id, voucherEntry);
                            }

                            if (condition != null && voucherEntry.Conditions.All(x => x.Id != condition.Id))
                            {
                                voucherEntry.Conditions ??= new();
                                voucherEntry.Conditions.Add(condition);
                            }

                            return voucherEntry;
                        },
                        sqlTemplate.Parameters,
                        splitOn: "Id");

                    return vouchers.OrderByDescending(x => x.CreatedDate)
                        .ThenByDescending(x => x.UsedCount)
                        .ThenByDescending(x => x.DiscountValue)
                        .ToList();
                }, new RequestFilterModel()
                {
                    Take = numberTop
                });
        }

        public Task<IEnumerable<VoucherDTO>> GetDataByEventId(int eventId)
        {
            return WithConnectionAsync(conn => conn.QueryAsync<VoucherDTO>(
                @$"SELECT t1.Id,
                        t1.Code,
                        t1.Name,
                        t1.DiscountTypeId,
                        t1.DiscountValue,
                        t1.UsageLimit,
                        t1.UsedCount,
                        t1.StartDate,
                        t1.EndDate,
                        t1.EventId
                FROM Voucher t1
                WHERE t1.EventId = @eventId
                AND t1.IsDeleted != 1",
                new { eventId },
                commandType: CommandType.Text
            ));
        }
    }
}
