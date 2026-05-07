import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getInventoryStatistics } from '@/services/report';
import { formatCurrency } from '@/utils/format';
import { formatDate } from '@/utils';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  CircularProgress,
  useTheme,
  styled,
  Chip,
  ChipProps
} from '@mui/material';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import CustomDataGrid from 'src/components/custom-data-grid';
import CustomPagination from 'src/components/custom-pagination';
import { PAGE_SIZE_OPTIONS } from 'src/configs/gridConfig';
import { hexToRGBA } from 'src/utils/hex-to-rgba';

const StyledPublicProduct = styled(Chip)<ChipProps>(({ theme }) => ({
  backgroundColor: "#28c76f29",
  color: "#28c76f",
  fontSize: "14px",
  padding: "8px 4px",
  fontWeight: 600
}))

const StyledPrivateProduct = styled(Chip)<ChipProps>(({ theme }) => ({
  backgroundColor: "#da251d29",
  color: "#da251d",
  fontSize: "14px",
  padding: "8px 4px",
  fontWeight: 600
}))

interface InventoryDetail {
  id: number;
  code: string;
  name: string;
  stockQuantity: number;
  price: number;
  status: number;
  categoryId: number;
  categoryCode: string | null;
  categoryName: string | null;
  lastReceiptDate: string | null;
  daysSinceLastReceipt: number | null;
  createdDate: string;
  updatedDate: string | null;
  createdBy: string;
  updatedBy: string | null;
  isActive: boolean;
  isDeleted: boolean;
  displayOrder: number | null;
}

interface InventoryResponse {
  result: {
    totalStockQuantity: number;
    totalAmount: number;
    inventoryDetails: {
      subset: InventoryDetail[];
      count: number;
      pageCount: number;
      totalItemCount: number;
      skip: number;
      take: number;
      hasPreviousPage: boolean;
      hasNextPage: boolean;
      isFirstPage: boolean;
      isLastPage: boolean;
    };
  };
  isSuccess: boolean;
  message: string;
  errors: any;
}

const InventoryStatisticsPage = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [maximumStockQuantity, setMaximumStockQuantity] = useState<number | null>(null);
  const [daysOfExistence, setDaysOfExistence] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  // Define columns
  const columns: GridColDef[] = [
    {
      field: 'code',
      headerName: t('product_code'),
      flex: 1,
      minWidth: 250,
      renderCell: (params: GridRenderCellParams) => <Typography>{params.row.code}</Typography>
    },
    {
      field: 'name',
      headerName: t('product_name'),
      flex: 1,
      minWidth: 250,
      renderCell: (params: GridRenderCellParams) => <Typography>{params.row.name}</Typography>
    },
    {
      field: 'stockQuantity',
      headerName: t('quantity'),
      flex: 1,
      minWidth: 120,
      align: 'right',
      renderCell: (params: GridRenderCellParams) => <Typography>{params.row.stockQuantity}</Typography>
    },
    {
      field: 'price',
      headerName: t('price'),
      flex: 1,
      minWidth: 100,
      align: 'right',
      renderCell: (params: GridRenderCellParams) => <Typography>{formatCurrency(params.row.price || 0)}</Typography>
    },
    {
      field: 'status',
      headerName: t('status'),
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        return (
          <>
            {row?.status === 1 ? (
              <StyledPublicProduct label={t('active')} />
            ) : (
              <StyledPrivateProduct label={t('inactive')} />
            )}
          </>
        )
      }
    },
    {
      field: 'lastReceiptDate',
      headerName: t('last_receipt_date'),
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Typography>
          {params.row.lastReceiptDate
            ? formatDate(params.row.lastReceiptDate, { dateStyle: "medium", timeStyle: "short" })
            : '-'}
        </Typography>
      )
    },
    {
      field: 'daysSinceLastReceipt',
      headerName: t('days_since_last_receipt'),
      flex: 1,
      minWidth: 180,
      align: 'right',
      renderCell: (params: GridRenderCellParams) => (
        <Typography>{params.row.daysSinceLastReceipt || '-'}</Typography>
      )
    }
  ];

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['inventory-statistics', maximumStockQuantity, daysOfExistence, page, pageSize],
    queryFn: async () => {
      const response = await getInventoryStatistics({
        maximumStockQuantity: maximumStockQuantity || undefined,
        daysOfExistence: daysOfExistence || undefined,
        skip: (page - 1) * pageSize,
        take: pageSize,
        paging: true,
        type: 1,
        orderBy: 'CreatedDate',
        dir: 'DESC'
      });
      return response as InventoryResponse;
    },
    refetchOnWindowFocus: false
  });

  const inventoryTableData = Array.isArray(data?.result?.inventoryDetails?.subset) 
    ? data.result.inventoryDetails.subset 
    : [];

  const totalStockQuantity = data?.result?.totalStockQuantity || 0;
  const totalAmount = data?.result?.totalAmount || 0;
  const totalItemCount = data?.result?.inventoryDetails?.totalItemCount || 0;

  const handleOnChangePagination = useCallback((newPage: number, newPageSize: number) => {
    setPage(newPage);
    setPageSize(newPageSize);
  }, []);

  const handleMaximumStockQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value === '' ? null : Number(event.target.value);
    setMaximumStockQuantity(value);
  };

  const handleDaysOfExistenceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value === '' ? null : Number(event.target.value);
    setDaysOfExistence(value);
  };

  const PaginationComponent = () => {
    return (
      <CustomPagination
        pageSize={pageSize}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        onChangePagination={handleOnChangePagination}
        page={page}
        rowLength={totalItemCount}
      />
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" component="div" gutterBottom>
            {t('inventory_statistics')}
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
            <TextField
              label={t('maximum_stock_quantity')}
              type="number"
              size="small"
              value={maximumStockQuantity === null ? '' : maximumStockQuantity}
              onChange={handleMaximumStockQuantityChange}
              InputProps={{ inputProps: { min: 0 } }}
              sx={{ width: 200 }}
            />
            <TextField
              label={t('days_of_existence')}
              type="number"
              size="small"
              value={daysOfExistence === null ? '' : daysOfExistence}
              onChange={handleDaysOfExistenceChange}
              InputProps={{ inputProps: { min: 0 } }}
              sx={{ width: 200 }}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            {isLoading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CircularProgress size={20} />
                <Typography variant="subtitle1">{t('loading')}</Typography>
              </Box>
            ) : (
              <>
                <Typography variant="subtitle1" fontWeight="bold">
                  {t('total_quantity')}: {totalStockQuantity}
                </Typography>
                <Typography variant="subtitle1" fontWeight="bold">
                  {t('total_amount')}: {formatCurrency(totalAmount)}
                </Typography>
              </>
            )}
          </Box>

          <CustomDataGrid
            rows={inventoryTableData}
            columns={columns}
            getRowId={(row) => row.id}
            disableRowSelectionOnClick
            autoHeight
            loading={isLoading}
            sortingOrder={['desc', 'asc']}
            sortingMode='server'
            slots={{
              pagination: PaginationComponent,
              noRowsOverlay: () => <Box sx={{ p: 2, textAlign: "center" }}>{t('no_data_inventory')}</Box>,
            }}
            disableColumnFilter
            disableColumnMenu
            sx={{
              ".selected-row": {
                backgroundColor: `${hexToRGBA(theme.palette.primary.main, 0.08)} !important`,
                color: `${theme.palette.primary.main} !important`
              }
            }}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default InventoryStatisticsPage;
