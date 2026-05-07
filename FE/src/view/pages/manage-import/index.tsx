import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getImportStatistics } from '@/services/report';
import { getAllEmployees } from '@/services/employee';
import { getAllSuppliers } from '@/services/supplier';
import { formatCurrency } from '@/utils/format';
import { formatDate, formatPrice } from '@/utils';
import { useTranslation } from 'react-i18next';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  CircularProgress,
  useTheme
} from '@mui/material';
import { ImportStatistic, ImportStatisticDetail } from '@/types/report';
import CustomDataGrid from 'src/components/custom-data-grid';
import CustomPagination from 'src/components/custom-pagination';
import { PAGE_SIZE_OPTIONS } from 'src/configs/gridConfig';
import { hexToRGBA } from 'src/utils/hex-to-rgba';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { getImportColumns } from '@/configs/gridColumn';

// Configure dayjs with plugins and locale
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('vi');
dayjs.tz.setDefault('Asia/Ho_Chi_Minh');

const ImportStatisticsPage = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [startDate, setStartDate] = useState<dayjs.Dayjs>(dayjs().tz('Asia/Ho_Chi_Minh').startOf('year'));
  const [endDate, setEndDate] = useState<dayjs.Dayjs>(dayjs().tz('Asia/Ho_Chi_Minh').endOf('year'));
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [supplierId, setSupplierId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  // Add employee query
  const { data: employeeData, isLoading: isLoadingEmployees } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const response = await getAllEmployees({
        params: {
          take: -1,
          skip: 0,
          paging: false,
          orderBy: "name",
          dir: "asc",
          keywords: "''",
          filters: ""
      }
      });
      return response;
    }
  });

  const employees = employeeData?.result?.subset || [];

  // Add supplier query
  const { data: supplierData, isLoading: isLoadingSuppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const response = await getAllSuppliers({
        params: {
          take: -1,
          skip: 0,
          paging: false,
          orderBy: "name",
          dir: "asc",
          keywords: "''",
          filters: ""
        }
      });
      return response;
    }
  });

  const suppliers = supplierData?.result?.subset || [];

  // Define columns inside the component
  const columns: GridColDef[] = [
    {
      field: 'code',
      headerName: t('receipt_code'),
      flex: 1,
      minWidth: 250,
      renderCell: (params: GridRenderCellParams) => <Typography>{params.row.code}</Typography>
    },
    {
      field: 'employeeName',
      headerName: t('employee'),
      flex: 1,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) => <Typography>{params.row.employeeName}</Typography>
    },
    {
      field: 'supplierName',
      headerName: t('supplier'),
      flex: 1,
      minWidth: 350,
      renderCell: (params: GridRenderCellParams) => <Typography>{params.row.supplierName}</Typography>
    },
    {
      field: 'totalPrice',
      headerName: t('total_price'),
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => <Typography>{formatPrice(params.row.totalPrice || 0)}</Typography>
    },
    {
      field: 'totalQuantity',
      headerName: t('quantity'),
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => <Typography>{params.row.totalQuantity}</Typography>
    },
    {
      field: 'createdDate',
      headerName: t('created_date'),
      flex: 1,
      minWidth: 250,
      renderCell: (params: GridRenderCellParams) => (
        <Typography>
          {formatDate(params.row.createdDate, { dateStyle: "medium", timeStyle: "short" })}
        </Typography>
      )
    }
  ];

  const { data: importData, isLoading } = useQuery<{result: ImportStatistic}>({
    queryKey: ['import-statistics', startDate, endDate, employeeId, supplierId, page, pageSize],
    queryFn: async () => {
      const dateFrom = startDate.tz('Asia/Ho_Chi_Minh').format();
      const dateTo = endDate.tz('Asia/Ho_Chi_Minh').format();

      return getImportStatistics({
        dateFrom,
        dateTo,
        employeeId: employeeId || undefined,
        supplierId: supplierId || undefined,
        skip: (page - 1) * pageSize,
        take: pageSize,
        paging: true,
        type: 1,
        orderBy: 'CreatedDate',
        dir: 'DESC',
      });
    },
    refetchOnWindowFocus: false
  });

  const importTableData = Array.isArray(importData?.result?.imports?.subset)
    ? importData.result.imports.subset
    : [];

  const totalAmount = importData?.result?.totalAmount || 0;
  const totalQuantity = importData?.result?.totalQuantity || 0;
  const totalCount = importData?.result?.imports?.totalItemCount || 0;

  const handleOnChangePagination = useCallback((newPage: number, newPageSize: number) => {
    setPage(newPage);
    setPageSize(newPageSize);
  }, []);

  const handleEmployeeChange = (event: SelectChangeEvent<number | string>) => {
    setEmployeeId(event.target.value === '' ? null : Number(event.target.value));
  };

  const handleSupplierChange = (event: SelectChangeEvent<number | string>) => {
    setSupplierId(event.target.value === '' ? null : Number(event.target.value));
  };

  const PaginationComponent = () => {
    return (
      <CustomPagination
        pageSize={pageSize}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        onChangePagination={handleOnChangePagination}
        page={page}
        rowLength={totalCount}
      />
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" component="div" gutterBottom>
            {t('import_statistics')}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
              <Box sx={{ display: 'flex', gap: 2 }}>
                <DatePicker
                  label={t('from_date')}
                  value={startDate}
                  onChange={(newValue) => {
                    if (newValue) {
                      setStartDate(newValue.tz('Asia/Ho_Chi_Minh'));
                    }
                  }}
                  format="DD/MM/YYYY"
                  slotProps={{ textField: { size: 'small' } }}
                />
                <DatePicker
                  label={t('to_date')}
                  value={endDate}
                  onChange={(newValue) => {
                    if (newValue) {
                      setEndDate(newValue.tz('Asia/Ho_Chi_Minh'));
                    }
                  }}
                  format="DD/MM/YYYY"
                  slotProps={{ textField: { size: 'small' } }}
                />
              </Box>
            </LocalizationProvider>
            
            <FormControl sx={{ minWidth: 200 }} size="small">
              <InputLabel id="employee-select-label">{t('select_employee')}</InputLabel>
              <Select
                labelId="employee-select-label"
                value={employeeId || ''}
                onChange={handleEmployeeChange}
                label={t('select_employee')}
                disabled={isLoadingEmployees}
              >
                <MenuItem value=""><em>{t('none')}</em></MenuItem>
                {employees.map((employee: any) => (
                  <MenuItem key={employee.id} value={employee.id}>
                    {employee.fullName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl sx={{ minWidth: 200 }} size="small">
              <InputLabel id="supplier-select-label">{t('select_supplier')}</InputLabel>
              <Select
                labelId="supplier-select-label"
                value={supplierId || ''}
                onChange={handleSupplierChange}
                label={t('select_supplier')}
                disabled={isLoadingSuppliers}
              >
                <MenuItem value=""><em>{t('none')}</em></MenuItem>
                {suppliers.map((supplier: any) => (
                  <MenuItem key={supplier.id} value={supplier.id}>
                    {supplier.fullName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
                  {t('total_amount')}: {formatCurrency(totalAmount)}
                </Typography>
                <Typography variant="subtitle1" fontWeight="bold">
                  {t('total_quantity')}: {totalQuantity}
                </Typography>
              </>
            )}
          </Box>

          <CustomDataGrid
            rows={importTableData}
            columns={columns}
            getRowId={(row) => row.code}
            disableRowSelectionOnClick
            autoHeight
            loading={isLoading}
            sortingOrder={['desc', 'asc']}
            sortingMode='server'
            slots={{
              pagination: PaginationComponent,
              noRowsOverlay: () => <Box sx={{ p: 2, textAlign: "center" }}>{t('no_data_import')}</Box>,
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

export default ImportStatisticsPage; 