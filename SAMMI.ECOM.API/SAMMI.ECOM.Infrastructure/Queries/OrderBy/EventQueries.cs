using Dapper;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Core.Models.ResponseModels.PagingList;
using SAMMI.ECOM.Domain.AggregateModels.EventVoucher;
using SAMMI.ECOM.Domain.DomainModels.OrderBuy;
using SAMMI.ECOM.Domain.Enums;
using SAMMI.ECOM.Domain.GlobalModels.Common;
using SAMMI.ECOM.Repository.GenericRepositories;
using SAMMI.ECOM.Utility;

namespace SAMMI.ECOM.Infrastructure.Queries.OrderBy
{
    public interface IEventQueries : IQueryRepository
    {
        Task<IPagedList<EventDTO>> GetList(RequestFilterModel filterModel);
        Task<IEnumerable<SelectionItem>> GetSelectionList(RequestFilterModel? request);
        Task<IEnumerable<EventDTO>> GetAll(RequestFilterModel? filterModel = null);
        Task<EventDTO> GetById(int id);
        Task<string?> GetCodeByLastId(CodeEnum? type = CodeEnum.Event);
    }
    public class EventQueries : QueryRepository<Event>, IEventQueries
    {
        private readonly Lazy<IVoucherQueries> _voucherQueries;
        public EventQueries(SammiEcommerceContext context,
            Lazy<IVoucherQueries> voucherQueries) : base(context)
        {
            _voucherQueries = voucherQueries;
        }

        public Task<IEnumerable<EventDTO>> GetAll(RequestFilterModel? filterModel = null)
        {
            return WithDefaultTemplateAsync(
                (conn, sqlBuilder, sqlTemplate) =>
                {
                    sqlBuilder.Select("t2.ImageUrl");
                    sqlBuilder.LeftJoin("Image t2 ON t1.ImageId = t2.Id AND t2.IsDeleted != 1");
                    return conn.QueryAsync<EventDTO>(sqlTemplate.RawSql, sqlTemplate.Parameters);
                }, filterModel);
        }

        public async Task<EventDTO> GetById(int id)
        {
            var eventDTO = await WithDefaultTemplateAsync(
                (conn, sqlBuilder, sqlTemplate) =>
                {
                    sqlBuilder.Select("t2.ImageUrl");
                    sqlBuilder.LeftJoin("Image t2 ON t1.ImageId = t2.Id AND t2.IsDeleted != 1");

                    sqlBuilder.Where("t1.Id = @id", new { id });
                    return conn.QueryFirstOrDefaultAsync<EventDTO>(sqlTemplate.RawSql, sqlTemplate.Parameters);
                }
            );

            if(eventDTO == null)
                return eventDTO;
            var vouchers = await _voucherQueries.Value.GetAll(new RequestFilterModel()
            {
                Filters = $"EventId::{id}::eq"
            });
            eventDTO.Vouchers = vouchers != null && vouchers.Any() ? vouchers.ToList() : null;
            return eventDTO;
        }

        public Task<IPagedList<EventDTO>> GetList(RequestFilterModel filterModel)
        {
            return WithPagingTemplateAsync(
                (conn, sqlBuilder, sqlTemplate) =>
                {
                    sqlBuilder.Select("t2.ImageUrl");
                    sqlBuilder.LeftJoin("Image t2 ON t1.ImageId = t2.Id AND t2.IsDeleted != 1");
                    return conn.QueryAsync<EventDTO>(sqlTemplate.RawSql, sqlTemplate.Parameters);
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

        public async Task<string?> GetCodeByLastId(CodeEnum? type = CodeEnum.Event)
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
    }
}
