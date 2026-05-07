using SAMMI.ECOM.Domain.AggregateModels.PurcharseOrder;
using SAMMI.ECOM.Repository.GenericRepositories;

namespace SAMMI.ECOM.Infrastructure.Queries.OrderBy
{
    public interface IPurchaseOrderDetailQueries : IQueryRepository
    {
    }
    public class PurchaseOrderDetailQueries : QueryRepository<PurchaseOrderDetail>, IPurchaseOrderDetailQueries
    {
        public PurchaseOrderDetailQueries(SammiEcommerceContext context) : base(context)
        {
        }
    }
}
