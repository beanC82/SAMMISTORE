namespace SAMMI.ECOM.Core.Models.ResponseModels.PagingList
{
    public class PagedList<T> : PagedListMetaData, IPagedList<T>
    {
        public List<T> Subset { get; set; }

        public PagedList()
        {
            Subset = new List<T>();
        }

        public PagedList(int skip, int take, int totalItemCount)
        {
            Subset = new List<T>();
            TotalItemCount = totalItemCount;
            Take = take;
            Skip = skip;
            PageCount = TotalItemCount > 0 ? (int)Math.Ceiling(TotalItemCount / (double)Take) : 0;
            bool flag = PageCount > 0 && Skip <= TotalItemCount;
            HasPreviousPage = flag && Skip >= Take;
            HasNextPage = flag && Skip + Take < TotalItemCount && Skip >= 0;
            IsFirstPage = flag && Skip == 0;
            IsLastPage = flag && Skip + Take >= TotalItemCount;
        }

        public PagedList(IQueryable<T> superset, int skip, int take)
            : this(skip, take, superset?.Count() ?? 0)
        {
            if (TotalItemCount <= 0 || superset == null)
                return;

            if (Subset == null)
            {
                Subset = skip == 0
                    ? superset.Take(take).ToList()
                    : superset.Skip(skip).Take(take).ToList();
            }
            else
            {
                Subset.AddRange(skip == 0
                    ? superset.Take(take).ToList()
                    : superset.Skip(skip).Take(take).ToList());
            }
        }

        public PagedList(IEnumerable<T> superset, int skip, int take)
            : this(skip, take, superset?.Count() ?? 0)
        {
            if (TotalItemCount <= 0 || superset == null)
                return;

            if (Subset == null)
            {
                Subset = skip == 0
                    ? superset.Take(take).ToList()
                    : superset.Skip(skip).Take(take).ToList();
            }
            else
            {
                Subset.AddRange(skip == 0
                    ? superset.Take(take).ToList()
                    : superset.Skip(skip).Take(take).ToList());
            }
        }

        public IEnumerator<T> GetEnumerator()
        {
            return Subset.GetEnumerator();
        }

        public T this[int index] => Subset[index];

        public int Count => Subset?.Count ?? 0;
    }
}
