import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDebounce } from 'src/hooks/useDebounce';
import { GridSortModel } from '@mui/x-data-grid';
import { AppDispatch, RootState } from 'src/stores';
import { TFilter } from 'src/configs/filter';
import { PAGE_SIZE_OPTIONS } from 'src/configs/gridConfig';

export const useAdminData = (
  fetchAction: (query: any) => any,
  reduxSelector: (state: RootState) => any,
  fieldMapping: { [key: string]: string } = {}
) => {
  // State for data handling
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE_OPTIONS[0]);
  const [sortBy, setSortBy] = useState<string>("createdDate desc");
  const [filters, setFilters] = useState<TFilter[]>([]);
  
  // Hooks
  const debouncedFilters = useDebounce(filters, 500);
  const dispatch = useDispatch<AppDispatch>();
  const isInitialMount = useRef(true);
  
  // Get data from Redux with safe default values
  const { 
    data = [], 
    total = 0, 
    isLoading = false 
  } = useSelector(reduxSelector) || {};

  // Fetch data handler
  const handleFetchData = useCallback(() => {
    const [orderByField, orderByDir] = sortBy.split(" ");
    const validFilters = debouncedFilters.filter(
      (f) => f.field && f.operator && (f.value || ["isnull", "isnotnull", "isempty", "isnotempty"].includes(f.operator))
    );
    const filterString =
      validFilters.length > 0
        ? validFilters.map((f) => `${f.field}::${f.value}::${f.operator}`).join("|")
        : "";
    
    const query = {
      params: {
        filters: filterString,
        take: pageSize,
        skip: (page - 1) * pageSize,
        orderBy: orderByField || "createdDate",
        dir: orderByDir || "desc",
        paging: true,
        keywords: debouncedFilters.length > 0 ? debouncedFilters[0].value || "''" : "''",
      },
    };
    
    dispatch(fetchAction(query));
  }, [sortBy, page, pageSize, debouncedFilters, fetchAction, dispatch]);

  // Pagination handler
  const handleOnChangePagination = useCallback((newPage: number, newPageSize: number) => {
    setPage(newPage);
    setPageSize(newPageSize);
  }, []);

  // Sort handler
  const handleSort = useCallback((sort: GridSortModel) => {
    const sortOption = sort[0];
    if (sortOption) {
      const gridField = sortOption.field;
      const sortField = fieldMapping[gridField] || gridField;
      setSortBy(`${sortField} ${sortOption.sort}`);
    } else {
      setSortBy("createdDate asc");
    }
  }, [fieldMapping]);

  // Filter handler
  const handleFilterChange = useCallback((newFilters: TFilter[]) => {
    setFilters(newFilters);
    setPage(1); // Reset page when filter changes
  }, []);


  // Fetch data when pagination, sorting, or filters change
  useEffect(() => {
    handleFetchData();
  }, [page, pageSize, sortBy, debouncedFilters]);

  return {
    // State
    page,
    pageSize,
    sortBy,
    filters,
    data,
    total,
    isLoading,
    
    // Handlers
    handleFetchData,
    handleOnChangePagination,
    handleSort,
    handleFilterChange,
    setFilters,
  };
};

export default useAdminData; 