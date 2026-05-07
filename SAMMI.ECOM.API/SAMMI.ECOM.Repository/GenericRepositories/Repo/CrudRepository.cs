using AutoMapper;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Oracle.ManagedDataAccess.Client;
using SAMMI.ECOM.Core.Authorizations;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Domain.Seeds;
using SAMMI.ECOM.Repository.BulkOperators;
using SAMMI.ECOM.Repository.Cores;
using System.ComponentModel.DataAnnotations;
using System.Data;
using ValidationContext = System.ComponentModel.DataAnnotations.ValidationContext;

namespace SAMMI.ECOM.Repository.GenericRepositories
{
    public class CrudRepository<TEntity> : BaseBulkOperation<TEntity>, ICrudRepository<TEntity> where TEntity : class, IEntity
    {
        public UserIdentity UserIdentity { get; set; }

        private readonly DbContext _context;

        /// <inheritdoc />
        public DbContext Context => _context;

        public DbSet<TEntity> DbSet => _context.Set<TEntity>();

        protected IDbConnection DbConnection
        {
            get
            {
                var dbConnection = new OracleConnection(this.ConnectionString);
                dbConnection.Open();
                return dbConnection;
            }
        }

        /// <summary>
        /// CrudServices needs the correct DbContext and the AutoMapper config
        /// </summary>
        /// <param name="context"></param>
        /// <param name="configAndMapper"></param>
        public CrudRepository(DbContext context) : base(context)
        {
            _context = context ?? throw new ArgumentNullException(
                "The DbContext class is null. Either you haven't registered GenericServices, " +
                "or you are using the multi-DbContext version, in which case you need to use the CrudServices<TContext> and specify which DbContext to use.");
        }

        public virtual Task<TEntity?> GetByIdAsync(object id)
        {
            if (!IsExisted(id)) return Task.FromResult(default(TEntity));

            return _context.Set<TEntity>().FindAsync(id).AsTask();
        }

        /// <inheritdoc />
        public virtual async Task<ActionResponse<TEntity>> CreateAndSave<T>(T entityOrDto)
            where T : class
        {
            var createEntityResp = this.Create(entityOrDto);

            if (!createEntityResp.IsSuccess)
            {
                return createEntityResp;
            }

            _context.Add(createEntityResp.Result);

            await SaveChangeAsync();

            return createEntityResp;
        }

        public virtual ActionResponse<TEntity> Create<T>(T entityOrDto) where T : class
        {
            var actionResponse = CreateEntityHandler(entityOrDto);
            if (actionResponse.IsSuccess)
            {
                _context.Add(actionResponse.Result);
            }

            var validation = ValidateEntity(actionResponse.Result);
            actionResponse.Combine(validation);
            return actionResponse;
        }
        public virtual void Detach(TEntity entity)
        {
            _context.Entry(entity).State = EntityState.Detached;
        }

        private ActionResponse<TEntity> CreateEntityHandler<T>(T entityOrDto)
        where T : class
        {
            var actionResponse = new ActionResponse<TEntity>();
            TEntity? creatingEntity;

            var configuration = new MapperConfiguration(cfg =>
            {
                cfg.ShouldMapProperty = p => p.GetMethod?.IsPublic == true || p.GetMethod?.IsAssembly == true;
                cfg.CreateMap<T, TEntity>();
            });
            var mapper = new Mapper(configuration);

            if (typeof(TEntity) == typeof(T))
            {
                creatingEntity = entityOrDto as TEntity;
            }
            else
            {
                creatingEntity = mapper.Map<TEntity>(entityOrDto);
            }

            if (creatingEntity != null)
            {
                if (string.IsNullOrEmpty(GetPropertyValue<T>(entityOrDto, "CreatedBy")?.ToString()))
                {
                    creatingEntity.CreatedBy = UserIdentity?.UserName ?? "N/A";
                }
                else
                {
                    creatingEntity.CreatedBy = GetPropertyValue<T>(entityOrDto, "CreatedBy")?.ToString() ?? "N/A";
                }

                creatingEntity.CreatedDate = DateTime.Now;
                creatingEntity.IsDeleted = false;
                actionResponse.SetResult(creatingEntity);
            }

            return actionResponse;
        }

        /// <inheritdoc />
        public virtual async Task<ActionResponse<TEntity>> UpdateAndSave<T>(T entityOrDto) where T : class
        {
            var actionResponse = Update(entityOrDto);
            if (actionResponse.IsSuccess)
            {
                await SaveChangeAsync();
            }

            var entity = actionResponse.Result;

            return new ActionResponse<TEntity>().SetResult(entity);
        }

        public virtual ActionResponse<TEntity> Update<T>(T entityOrDto) where T : class
        {
            TEntity? updater;

            var updaterIds = FindPrimaryKeyValues(ConvertToEntity(entityOrDto));
            if (!updaterIds.Any())
            {
                throw new InvalidOperationException(
                    $"The primary key was not set on the entity class {typeof(TEntity).Name}.");
            }

            if (typeof(T) == typeof(TEntity))
            {
                updater = entityOrDto as TEntity;
            }
            else
            {
                if (updaterIds.Count() > 1)
                {
                    updater = Context.Find<TEntity>(updaterIds);
                }
                else
                {
                    updater = Context.Find<TEntity>(updaterIds.Single());
                }

                var configuration = new MapperConfiguration(cfg =>
                {
                    cfg.ShouldMapProperty = p => p.GetMethod?.IsPublic == true || p.GetMethod?.IsAssembly == true;
                    cfg.CreateMap<T, TEntity>();
                });
                var mapper = new Mapper(configuration);
                mapper.Map(entityOrDto, updater);
            }

            if (updater == null)
            {
                var actResponse = new ActionResponse<TEntity>();
                actResponse.AddError("An error has occurred trying to update entity's properties.");
                return actResponse;
            }

            updater.UpdatedDate = DateTime.Now;
            if (string.IsNullOrEmpty(GetPropertyValue<T>(entityOrDto, "UpdatedBy")?.ToString()))
            {
                updater.UpdatedBy = UserIdentity?.UserName ?? "Unknown";
            }
            else
            {
                updater.UpdatedBy = GetPropertyValue<T>(entityOrDto, "UpdatedBy")?.ToString();
            }
            return UpdateEntity(updater);
        }

        public virtual ActionResponse<TEntity> UpdateEntity(TEntity entity)
        {
            var actionResponse = new ActionResponse<TEntity>();
            actionResponse.SetResult(entity);

            if (!_context.Entry(entity).IsKeySet)
                throw new InvalidOperationException(
                    $"The primary key was not set on the entity class {typeof(TEntity).Name}. For an update we expect the key(s) to be set (otherwise it does a create).");
            if (_context.Entry(entity).State == EntityState.Detached)
            {
                _context.Update(entity);
            }

            _context.Entry(entity).Property(x => x.CreatedBy).IsModified = false;
            _context.Entry(entity).Property(x => x.CreatedDate).IsModified = false;
            actionResponse.Combine(ValidateEntity(entity));

            return actionResponse;
        }

        protected TEntity ConvertToEntity<T>(T convertibleObject)
        {
            if (typeof(TEntity) == typeof(T))
            {
                return convertibleObject as TEntity;
            }

            var configuration = new MapperConfiguration(cfg =>
            {
                cfg.ShouldMapProperty = p => p.GetMethod?.IsPublic == true || p.GetMethod?.IsAssembly == true;
                cfg.CreateMap<T, TEntity>();
            });
            var mapper = new Mapper(configuration);

            return mapper.Map<TEntity>(convertibleObject);
        }

        private ActionResponse<TEntity> ValidateEntity(TEntity entity)
        {
            var status = new ActionResponse<TEntity>();

            var valProvider = new ValidationDbContextServiceProvider(_context);
            var valContext = new ValidationContext(entity, valProvider, null);
            var entityErrors = new List<ValidationResult>();
            if (!Validator.TryValidateObject(
                entity, valContext, entityErrors, true))
            {
                status.AddValidationResults(entityErrors);
            }

            return status;
        }

        protected IEnumerable<string> FindPrimaryKeyNames()
        {
            return Context.Model.FindEntityType(typeof(TEntity)).FindPrimaryKey().Properties
                .Select(x => x.Name);
        }

        protected List<object> FindPrimaryKeyValues(TEntity entity)
        {
            var keyNames = FindPrimaryKeyNames();
            return keyNames.Select(k => GetPropertyValue(entity, k)).ToList();
        }

        protected object? GetPropertyValue(TEntity entity, string propertyName)
        {
            return entity.GetType().GetProperty(propertyName)?.GetValue(entity, null);
        }

        protected object? GetPropertyValue<T>(T entity, string propertyName)
        {
            if (entity is null) return default(T);

            return typeof(T).GetProperty(propertyName)?.GetValue(entity, null);
        }

        /// <inheritdoc />
        public virtual ActionResponse DeleteAndSave(params object[] keys)
        {
            var actionResponse = new ActionResponse();
            var entity = _context.Set<TEntity>().Find(keys);

            if (entity == null)
            {
                actionResponse.AddError(
                    $"Sorry, I could not find the {ExtractDisplayHelpers.GetNameForClass<TEntity>()} you wanted to delete.");
                return actionResponse;
            }

            entity.IsDeleted = true;
            Update(entity);

            actionResponse.Combine(SaveChangeWithValidation());

            return actionResponse;
        }

        /// <inheritdoc />
        public virtual ActionResponse DeleteWithActionAndSave(Func<DbContext, TEntity, IActionResponse> runBeforeDelete,
            params object[] keys)
        {
            var actionResponse = new ActionResponse();
            var entity = _context.Set<TEntity>().Find(keys);
            if (entity == null)
            {
                actionResponse.AddError(
                    $"Sorry, I could not find the {ExtractDisplayHelpers.GetNameForClass<TEntity>()} you wanted to delete.");
                return actionResponse;
            }

            actionResponse.Combine(runBeforeDelete(_context, entity));
            if (!actionResponse.IsSuccess) return actionResponse;

            //entity.IsDeleted = true;
            Update(entity);

            actionResponse.Combine(SaveChangeWithValidation());

            return actionResponse;
        }

        public virtual bool IsExisted(object id)
        {
            var entity = _context.Set<TEntity>().Find(id);
            return entity != null && !entity.IsDeleted;
        }

        public async Task<ActionResponse<TEntity>> RemoveAndSave<T>(T entityOrDto) where T : class
        {
            var actionResponse = new ActionResponse<TEntity>();
            var createEntityResp = CreateEntityHandler(entityOrDto);

            if (!createEntityResp.IsSuccess)
            {
                actionResponse.Combine(createEntityResp);
                return actionResponse;
            }

            var entity = createEntityResp.Result;

            DbSet.Remove(entity);

            await SaveChangeAsync();

            if (!actionResponse.IsSuccess) return actionResponse;

            actionResponse.SetResult(entity);

            return actionResponse;
        }
        public async Task<ActionResponse> RemoveAndSave(params object[] keys)
        {
            var toremoveEntity = await DbSet.FindAsync(keys);
            if (toremoveEntity is null)
                return ActionResponse.Failed(string.Format("The entity with keys {0} could not be found.", string.Join(", ", keys)));

            DbSet.Remove(toremoveEntity);

            await SaveChangeAsync();

            return ActionResponse.Success;
        }

        public async Task<int> SaveChangeAsync(CancellationToken cancellationToken = default)
        {
            return await _context.SaveChangesAsync(cancellationToken);
        }

        public IActionResponse SaveChangeWithValidation(CancellationToken cancellationToken = default)
        {
            return _context.SaveChangesWithValidation();
        }

        public async Task<ActionResponse> SaveChangeWithValidationAsync(CancellationToken cancellationToken = default)
        {
            return await _context.SaveChangesWithValidationAsync(cancellationToken);
        }

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
            using (var dbConnection = (OracleConnection)DbContext.Database.GetDbConnection())
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

        public async Task<TEntity> FindById(object id)
        {
            return await _context.Set<TEntity>().FindAsync(id);
        }

        public virtual ActionResponse DeleteRangeAndSave(object[] keys)
        {
            var actionResponse = new ActionResponse();
            var entities = _context.Set<TEntity>().Where(entity => keys.Contains(entity.Id));

            if (!entities.Any() || entities.Count() != keys.Length)
            {
                actionResponse.AddError(
                    $"Sorry, Some {ExtractDisplayHelpers.GetNameForClass<TEntity>()} were not found.");
                return actionResponse;
            }
            foreach (var entity in entities)
            {
                entity.IsDeleted = true;
                Update(entity);
            }

            actionResponse.Combine(SaveChangeWithValidation());

            return actionResponse;
        }
    }
}