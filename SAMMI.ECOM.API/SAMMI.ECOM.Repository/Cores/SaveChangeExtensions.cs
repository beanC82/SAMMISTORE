using Microsoft.EntityFrameworkCore;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Repository.GenericRepositories;
using System.ComponentModel.DataAnnotations;
using ValidationContext = System.ComponentModel.DataAnnotations.ValidationContext;

namespace SAMMI.ECOM.Repository.Cores
{
    internal static class SaveChangeExtensions
    {
        //see https://blogs.msdn.microsoft.com/dotnet/2016/09/29/implementing-seeding-custom-conventions-and-interceptors-in-ef-core-1-0/
        //for why I call DetectChanges before ChangeTracker, and why I then turn ChangeTracker.AutoDetectChangesEnabled off/on around SaveChanges

        /// <summary>
        /// This will validate any entity classes that will be added or updated
        /// If the validation does not produce any errors then SaveChangesAsync will be called 
        /// </summary>
        /// <param name="dbContext"></param>
        /// <param name="config"></param>
        /// <param name="cancellationToken"></param>
        /// <returns>List of errors, empty if there were no errors</returns>
        internal static async Task<ActionResponse> SaveChangesWithValidationAsync(
            this DbContext dbContext,
            CancellationToken cancellationToken = default)
        {
            var status = dbContext.ExecuteValidation();
            return !status.IsSuccess
                ? status
                : await dbContext.SaveChangesWithValidationAsync(cancellationToken);
        }

        //see https://blogs.msdn.microsoft.com/dotnet/2016/09/29/implementing-seeding-custom-conventions-and-interceptors-in-ef-core-1-0/
        //for why I call DetectChanges before ChangeTracker, and why I then turn ChangeTracker.AutoDetectChangesEnabled off/on around SaveChanges

        /// <summary>
        /// This will validate any entity classes that will be added or updated
        /// If the validation does not produce any errors then SaveChanges will be called 
        /// </summary>
        /// <param name="dbContext"></param>
        /// <param name="config"></param>
        /// <returns>List of errors, empty if there were no errors</returns>
        internal static IActionResponse SaveChangesWithValidation(
            this DbContext dbContext)
        {
            var actionResponse = new ActionResponse();
            var status = dbContext.ExecuteValidation();
            if (!status.IsSuccess)
            {
                return status;
            }

            dbContext.SaveChanges();

            return actionResponse;
        }

        internal static ActionResponse ExecuteValidation(this DbContext context)
        {
            var status = new ActionResponse();
            //This is needed, otherwise you get a "collection has changed" exception
            var entriesToCheck = context.ChangeTracker.Entries()
                .Where(e => e.State == EntityState.Added || e.State == EntityState.Modified || e.State == EntityState.Deleted)
                .ToList();

            foreach (var entry in entriesToCheck)
            {
                var entity = entry.Entity;
                var valProvider = new ValidationDbContextServiceProvider(context);
                var valContext = new ValidationContext(entity, valProvider, null);
                var entityErrors = new List<ValidationResult>();
                if (!Validator.TryValidateObject(
                    entity, valContext, entityErrors, true))
                {
                    status.AddValidationResults(entityErrors);
                }
            }

            return status;
        }
    }
}