using Dapper;
using SAMMI.ECOM.Domain.AggregateModels;
using SAMMI.ECOM.Domain.DomainModels.CategoryAddress;
using SAMMI.ECOM.Repository.GenericRepositories;

namespace SAMMI.ECOM.Infrastructure.Queries.CategoryAddress
{
    public interface ICustomerAddressQueries : IQueryRepository
    {
        Task<IEnumerable<CustomerAddressDTO>> GetAllByUserId(int userId);
        Task<CustomerAddressDTO> GetCurrentAddress(int userId);
    }
    public class CustomerAddressQueries : QueryRepository<CustomerAddress>, ICustomerAddressQueries
    {
        public CustomerAddressQueries(SammiEcommerceContext context) : base(context)
        {
        }

        public Task<IEnumerable<CustomerAddressDTO>> GetAllByUserId(int userId)
        {
            return WithDefaultTemplateAsync(
                (conn, sqlBuilder, sqlTemplate) =>
                {
                    sqlBuilder.Select("t3.Name AS WardName");
                    sqlBuilder.Select("t4.Id AS DistrictId, t4.Name AS DistrictName");
                    sqlBuilder.Select("t5.Id AS ProvinceId, t5.Name AS ProvinceName");

                    sqlBuilder.LeftJoin("Users t2 ON t1.CustomerId = t2.Id AND t2.IsDeleted != 1");
                    sqlBuilder.LeftJoin("Ward t3 ON t1.WardId = t3.Id AND t3.IsDeleted != 1");
                    sqlBuilder.LeftJoin("District t4 ON t3.DistrictId = t4.Id AND t4.IsDeleted != 1");
                    sqlBuilder.LeftJoin("Province t5 ON t4.ProvinceId = t5.Id AND t5.IsDeleted != 1");

                    sqlBuilder.Where("t1.CustomerId = @userId", new { userId });

                    sqlBuilder.OrderBy(@$"CASE
                                            WHEN t1.IsDefault = 1 THEN 1
                                            ELSE 2
                                          END ASC,
                                          t1.CreatedDate DESC");
                    return conn.QueryAsync<CustomerAddressDTO>(sqlTemplate.RawSql, sqlTemplate.Parameters);
                }
            );
        }

        public async Task<CustomerAddressDTO> GetCurrentAddress(int userId)
        {
            var addressDefault = await WithDefaultTemplateAsync(
                (conn, sqlBuilder, sqlTemplate) =>
                {
                    sqlBuilder.Select("t3.Name AS WardName");
                    sqlBuilder.Select("t4.Id AS DistrictId, t4.Name AS DistrictName");
                    sqlBuilder.Select("t5.Id AS ProvinceId, t5.Name AS ProvinceName");

                    sqlBuilder.LeftJoin("Users t2 ON t1.CustomerId = t2.Id AND t2.IsDeleted != 1");
                    sqlBuilder.LeftJoin("Ward t3 ON t1.WardId = t3.Id AND t3.IsDeleted != 1");
                    sqlBuilder.LeftJoin("District t4 ON t3.DistrictId = t4.Id AND t4.IsDeleted != 1");
                    sqlBuilder.LeftJoin("Province t5 ON t4.ProvinceId = t5.Id AND t5.IsDeleted != 1");

                    sqlBuilder.Where("t1.IsDefault = 1");
                    sqlBuilder.Where("t1.CustomerId = @userId", new { userId });

                    return conn.QueryFirstOrDefaultAsync<CustomerAddressDTO>(sqlTemplate.RawSql, sqlTemplate.Parameters);
                }
            );

            if (addressDefault != null)
                return addressDefault;

            return await WithDefaultTemplateAsync(
                (conn, sqlBuilder, sqlTemplate) =>
                {
                    sqlBuilder.Select("t3.Name AS WardName");
                    sqlBuilder.Select("t4.Id AS DistrictId, t4.Name AS DistrictName");
                    sqlBuilder.Select("t5.Id AS ProvinceId, t5.Name AS ProvinceName");

                    sqlBuilder.LeftJoin("Users t2 ON t1.CustomerId = t2.Id AND t2.IsDeleted != 1");
                    sqlBuilder.LeftJoin("Ward t3 ON t1.WardId = t3.Id AND t3.IsDeleted != 1");
                    sqlBuilder.LeftJoin("District t4 ON t3.DistrictId = t4.Id AND t4.IsDeleted != 1");
                    sqlBuilder.LeftJoin("Province t5 ON t4.ProvinceId = t5.Id AND t5.IsDeleted != 1");

                    sqlBuilder.Where("t1.CustomerId = @userId", new { userId });

                    return conn.QueryFirstOrDefaultAsync<CustomerAddressDTO>(sqlTemplate.RawSql, sqlTemplate.Parameters);
                }
            );
        }
    }
}
