using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using MySqlConnector;
using Oracle.ManagedDataAccess.Client;
using SAMMI.ECOM.Repository.Cores;
using System.Data;

namespace SAMMI.ECOM.Repository.GenericRepositories
{
    public abstract class QueryRepository
    {
        protected DbTypeEnum DatabaseType;
        protected readonly string DbProvider;
        protected readonly DbContext CurrentContext;
        protected string ConnectionString;

        protected string sqlParameterPrefix = "b_";
        protected string DefaultOrderByField = "Id";
        protected const string Local_Collation = "Latin1_General_CI_AI";

        protected readonly Dictionary<Type, DbType> _typeMap = new Dictionary<Type, DbType>();
        protected QueryRepository()
        {

        }
        protected QueryRepository(DbContext context)
        {
            this.CurrentContext = context;
            this.ConnectionString = context.Database.GetConnectionString();
            this.DbProvider = context.Database.ProviderName ?? string.Empty;
            this.DatabaseType = DbProvider switch
            {
                "Pomelo.EntityFrameworkCore.MySql" => DbTypeEnum.MySQL,
                "Oracle.EntityFrameworkCore" => DbTypeEnum.Oracle,
                "Microsoft.EntityFrameworkCore.SqlServer" => DbTypeEnum.SQLServer,
            };
            _typeMap[typeof(byte)] = DbType.Byte;
            _typeMap[typeof(sbyte)] = DbType.SByte;
            _typeMap[typeof(short)] = DbType.Int16;
            _typeMap[typeof(ushort)] = DbType.UInt16;
            _typeMap[typeof(int)] = DbType.Int32;
            _typeMap[typeof(uint)] = DbType.UInt32;
            _typeMap[typeof(long)] = DbType.Int64;
            _typeMap[typeof(ulong)] = DbType.UInt64;
            _typeMap[typeof(float)] = DbType.Single;
            _typeMap[typeof(double)] = DbType.Double;
            _typeMap[typeof(decimal)] = DbType.Decimal;
            _typeMap[typeof(bool)] = DbType.Int16;
            _typeMap[typeof(string)] = DbType.String;
            _typeMap[typeof(char)] = DbType.StringFixedLength;
            _typeMap[typeof(Guid)] = DbType.Guid;
            _typeMap[typeof(DateTime)] = DbType.DateTime;
            _typeMap[typeof(DateTimeOffset)] = DbType.DateTimeOffset;
            _typeMap[typeof(byte[])] = DbType.Binary;
            _typeMap[typeof(byte?)] = DbType.Byte;
            _typeMap[typeof(sbyte?)] = DbType.SByte;
            _typeMap[typeof(short?)] = DbType.Int16;
            _typeMap[typeof(ushort?)] = DbType.UInt16;
            _typeMap[typeof(int?)] = DbType.Int32;
            _typeMap[typeof(uint?)] = DbType.UInt32;
            _typeMap[typeof(long?)] = DbType.Int64;
            _typeMap[typeof(ulong?)] = DbType.UInt64;
            _typeMap[typeof(float?)] = DbType.Single;
            _typeMap[typeof(double?)] = DbType.Double;
            _typeMap[typeof(decimal?)] = DbType.Decimal;
            _typeMap[typeof(bool?)] = DbType.Int16;
            _typeMap[typeof(char?)] = DbType.StringFixedLength;
            _typeMap[typeof(Guid?)] = DbType.Guid;
            _typeMap[typeof(DateTime?)] = DbType.DateTime;
            _typeMap[typeof(DateTimeOffset?)] = DbType.DateTimeOffset;
        }

        public void SetConnectionString(string connString)
        {
            if (string.IsNullOrWhiteSpace(connString)) return;
            this.ConnectionString = connString;
        }

        protected IDbConnection DbConnection
        {
            get
            {
                IDbConnection dbConnection = null;
                switch (this.DatabaseType)
                {
                    case DbTypeEnum.SQLServer:
                        dbConnection = new SqlConnection(this.ConnectionString);
                        break;
                    case DbTypeEnum.MySQL:
                        dbConnection = new MySqlConnection(this.ConnectionString);
                        break;
                    default:
                        dbConnection = new OracleConnection(this.ConnectionString);
                        break;
                }

                dbConnection.Open();
                return dbConnection;
            }
        }

        //private async Task<IDbConnection> GetConnectionAsync(string connectionString)
        //{
        //    try
        //    {
        //        var dbConnection = new OracleConnection(connectionString);
        //        await dbConnection.OpenAsync();

        //        return dbConnection;
        //    }
        //    catch (Exception e)
        //    {
        //        e.Data["SqlGenericRepository.Message-CreateDbConnection"] = "Not new SqlConnection";
        //        e.Data["SqlGenericRepository.ConnectionString"] = connectionString;
        //        throw;
        //    }
        //}

        public T WithConnection<T>(Func<IDbConnection, T> handler)
        {
            using (var dbConnection = this.DbConnection)
                try
                {
                    return handler(dbConnection);
                }
                catch (TimeoutException ex)
                {
                    ex.Data["SqlGenericRepository.Message-WithConnection"] = "Execute TimeoutException";
                    ex.Data["SqlGenericRepository.ConnectionString"] = ConnectionString;
                    throw;
                }
                catch (SqlException ex)
                {
                    ex.Data["SqlGenericRepository.Message-WithConnection"] = "Execute SqlException";
                    ex.Data["SqlGenericRepository.ConnectionString"] = ConnectionString;
                    throw;
                }
                catch (Exception ex)
                {
                    ex.Data["SqlGenericRepository.Message-WithConnection"] = "Execute Exception";
                    ex.Data["SqlGenericRepository.ConnectionString"] = ConnectionString;
                    throw;
                }

        }

        public async Task<T> WithConnectionAsync<T>(Func<IDbConnection, Task<T>> handler)
        {
            using (var dbConnection = this.DbConnection)
                try
                {
                    return await handler(dbConnection);
                }
                catch (TimeoutException ex)
                {
                    ex.Data["SqlGenericRepository.Message-WithConnection"] = "Execute TimeoutException";
                    ex.Data["SqlGenericRepository.ConnectionString"] = ConnectionString;
                    throw;
                }
                catch (SqlException ex)
                {
                    ex.Data["SqlGenericRepository.Message-WithConnection"] = "Execute SqlException";
                    ex.Data["SqlGenericRepository.ConnectionString"] = ConnectionString;
                    throw;
                }
                catch (Exception ex)
                {
                    ex.Data["SqlGenericRepository.Message-WithConnection"] = "Execute Exception";
                    ex.Data["SqlGenericRepository.ConnectionString"] = ConnectionString;
                    throw;
                }
        }

        public T WithCurrentConnection<T>(Func<IDbConnection, T> handler)
        {
            using (var dbConnection = (OracleConnection)CurrentContext.Database.GetDbConnection())
                try
                {
                    return handler(dbConnection);
                }
                catch (TimeoutException ex)
                {
                    ex.Data["SqlGenericRepository.Message-WithConnection"] = "Execute TimeoutException";
                    ex.Data["SqlGenericRepository.ConnectionString"] = ConnectionString;
                    throw;
                }
                catch (SqlException ex)
                {
                    ex.Data["SqlGenericRepository.Message-WithConnection"] = "Execute SqlException";
                    ex.Data["SqlGenericRepository.ConnectionString"] = ConnectionString;
                    throw;
                }
                catch (Exception ex)
                {
                    ex.Data["SqlGenericRepository.Message-WithConnection"] = "Execute Exception";
                    ex.Data["SqlGenericRepository.ConnectionString"] = ConnectionString;
                    throw;
                }
        }
    }
}