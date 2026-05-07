import React, { useEffect, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm, SubmitHandler } from 'react-hook-form';
import * as yup from 'yup';
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  styled,
  useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useTranslation } from 'react-i18next';
import { parseISO, isValid } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { getAllSuppliers } from 'src/services/supplier';
import { getAllEmployees } from 'src/services/employee';
import { getAllProducts } from 'src/services/product';
import CustomTextField from 'src/components/text-field';
import CustomAutocomplete from 'src/components/custom-autocomplete';
import Spinner from 'src/components/spinner';
import { useDispatch, useSelector } from 'react-redux';
import { createReceiptAsync, updateReceiptAsync } from 'src/stores/receipt/action';
import { AppDispatch, RootState } from 'src/stores';
import { getReceiptCode, getReceiptDetail } from 'src/services/receipt';
import { toast } from 'react-toastify';
import { resetInitialState } from 'src/stores/receipt';

interface ReceiptItem {
  id: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface ReceiptFormData {
  receiptCode: string;
  receiptDate: Date | null;
  supplierId: string;
  employeeId: string;
  status: string;
  items: ReceiptItem[];
}

interface CreateUpdateReceiptProps {
  id?: number;
  onClose: () => void;
  onCreateNew: () => void;
  newEntityName?: string;
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(1),
  '& .MuiTextField-root': {
    margin: 0,
    width: '100%',
  },
}));

const CreateUpdateReceipt: React.FC<CreateUpdateReceiptProps> = ({ id, onClose, onCreateNew, newEntityName }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const dispatch: AppDispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [supplierOptions, setSupplierOptions] = useState<{ label: string; value: string }[]>([]);
  const [employeeOptions, setEmployeeOptions] = useState<{ label: string; value: string }[]>([]);
  const [productOptions, setProductOptions] = useState<
    { label: string; value: number; price: number; id: number }[]
  >([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [receiptCode, setReceiptCode] = useState('');
  
  // Get Redux state
  const { isSuccessCreateUpdate, isErrorCreateUpdate, errorMessageCreateUpdate } = useSelector(
    (state: RootState) => state.receipt
  );

  // Construct statusOptions directly using the t function from useTranslation
  const statusOptions = {
    "0": {
        label: t("draft"),
        value: "0",
        originalValue: "Draft",
    },
    "1": {
        label: t("pending_approval"),
        value: "1",
        originalValue: "PendingApproval",
    },
    // Add other statuses here if they exist in GOODS_RECEIPT_STATUS
  };

  // Add status mapping function
  const mapStatusToValue = (status: string): string => {
    const statusMap: { [key: string]: string } = {
      'Draft': '0',
      'PendingApproval': '1',
      // Add other mappings as needed
    };
    return statusMap[status] || status;
  };

  const schema = yup.object().shape({
    receiptCode: yup.string().required(t('receipt_code_required')),
    receiptDate: yup.date().nullable().required(t('receipt_date_required')),
    supplierId: yup.string().required(t('supplier_required')),
    employeeId: yup.string().required(t('employee_required')),
    status: yup.string().required(t('status_required')),
    items: yup
      .array()
      .of(
        yup.object().shape({
          id: yup.number().required(),
          productId: yup.number().required(t('product_required')),
          quantity: yup.number().required(t('quantity_required')).min(1, t('quantity_min_1')),
          unitPrice: yup.number().required(t('unit_price_required')).min(0, t('unit_price_min_0')),
          total: yup.number().required(),
        })
      )
      .min(1, t('at_least_one_item')),
  });

  const defaultValues: ReceiptFormData = {
    receiptCode: '',
    receiptDate: new Date(),
    supplierId: '',
    employeeId: '',
    status: '',
    items: [{ id: 0, productId: 0, quantity: 0, unitPrice: 0, total: 0 }],
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ReceiptFormData>({
    defaultValues,
    mode: 'onChange',
    resolver: yupResolver(schema) as any,
  });

  const items = watch('items');

  const getReceiptDefaultCode = async () => {
    const res = await getReceiptCode();
    setReceiptCode(res?.result);
};

  const fetchAllSupplier = async () => {
    setLoading(true);
    try {
      const res = await getAllSuppliers({
        params: {
          take: -1,
          skip: 0,
          paging: false,
          orderBy: 'name',
          dir: 'asc',
          keywords: "''",
          filters: '',
        },
      });
      const data = res?.result?.subset;
      if (data) {
        setSupplierOptions(
          data.map((item: { fullName: string; id: string }) => ({
            label: item.fullName,
            value: item.id,
          }))
        );
      }
    } catch (err) {
      console.error('Error fetching suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllEmployee = async () => {
    setLoading(true);
    try {
      const res = await getAllEmployees({
        params: {
          take: -1,
          skip: 0,
          paging: false,
          orderBy: 'name',
          dir: 'asc',
          keywords: "''",
          filters: '',
        },
      });
      const data = res?.result?.subset;
      if (data) {
        setEmployeeOptions(
          data.map((item: { fullName: string; id: string }) => ({
            label: item.fullName,
            value: item.id,
          }))
        );
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllProducts = async () => {
    setLoading(true);
    try {
      const res = await getAllProducts({
        params: {
          take: -1,
          skip: 0,
          paging: false,
          orderBy: 'name',
          dir: 'asc',
          keywords: "''",
          filters: '',
        },
      });
      const data = res?.result?.subset;
      if (data) {
        setProductOptions(
          data.map((item: { name: string; code: string; price: number; id: number }) => ({
            label: item.name,
            value: item.code,
            price: item.price || 0,
            id: item.id,
          }))
        );
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReceiptDetail = async (receiptId: number) => {
    try {
      const res = await getReceiptDetail(receiptId);
      if (res?.result) {
        const data = res.result;

        let parsedDate: Date | null = null;
        if (data.receiptDate) {
          parsedDate = parseISO(data.receiptDate);
          if (isValid(parsedDate)) {
            // Format the date in the local timezone
            const formattedDate = formatInTimeZone(parsedDate, 'Asia/Ho_Chi_Minh', "yyyy-MM-dd'T'HH:mm:ssXXX");
            parsedDate = parseISO(formattedDate);
          } else {
            parsedDate = new Date();
          }
        } else {
          parsedDate = new Date();
        }

        const supplierExists = supplierOptions.find(
          (option) => option.value === data.supplierId.toString()
        );
        if (!supplierExists && data.supplierName) {
          setSupplierOptions((prev) => [
            ...prev,
            { label: data.supplierName, value: data.supplierId.toString() },
          ]);
        }

        const employeeExists = employeeOptions.find(
          (option) => option.value === data.employeeId.toString()
        );
        if (!employeeExists && data.employeeName) {
          setEmployeeOptions((prev) => [
            ...prev,
            { label: data.employeeName, value: data.employeeId.toString() },
          ]);
        }

        const statusExists = Object.values(statusOptions).find(
          (option) => option.originalValue === data.status
        );
        if (!statusExists) {
          console.warn('Status not found:', data.status);
        }

        const itemsWithValidProducts = data.details.map((detail: any) => {
          const productExists = productOptions.find((option) => option.id === detail.productId);
          if (!productExists) {
            setProductOptions((prev) => [
              ...prev,
              {
                label: detail.productName || 'Không có tên sản phẩm',
                value: detail.productId.toString(),
                price: detail.unitPrice,
                id: detail.productId,
              },
            ]);
          }
          return {
            id: detail.id,
            productId: detail.productId,
            quantity: detail.quantity,
            unitPrice: detail.unitPrice,
            total: detail.quantity * detail.unitPrice,
          };
        });

        setValue('receiptCode', data.code);
        setValue('receiptDate', parsedDate);
        setValue('supplierId', data.supplierId.toString());
        setValue('employeeId', data.employeeId.toString());
        setValue('status', mapStatusToValue(data.status));
        setValue('items', itemsWithValidProducts);
      }
    } catch (err) {
      console.error('Error fetching receipt detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllSupplier();
    fetchAllEmployee();
    fetchAllProducts();
    getReceiptDefaultCode();
  }, []);

  useEffect(() => {
    if (id && supplierOptions.length && employeeOptions.length && productOptions.length) {
      setIsEditMode(true);
      fetchReceiptDetail(id);
    } else if (!id) {
      setIsEditMode(false);
      reset(defaultValues);
    }
  }, [id, supplierOptions, employeeOptions, productOptions]);


  const onSubmit: SubmitHandler<ReceiptFormData> = async (data) => {
    setLoading(true);
    try {
      const receiptData = {
        code: data.receiptCode,
        employeeId: parseInt(data.employeeId),
        supplierId: parseInt(data.supplierId),
        status: parseInt(data.status),
        note: '',
        receiptDate: data.receiptDate?.toISOString(),
        details: data.items.map((item) => ({
          purchaseOrderId: 0,
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      };

      if (isEditMode && id) {
        const result = await dispatch(updateReceiptAsync({ id, ...receiptData }));
        if (result?.payload?.isSuccess) {
          onClose();
        }
      } else {
        const result = await dispatch(createReceiptAsync(receiptData));
        if (result?.payload?.isSuccess) {
          onClose();
        }
      }
    } catch (error) {
      console.error('Error saving receipt:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    const currentItems = watch('items');
    const newItem: ReceiptItem = {
      id: 0,
      productId: 0,
      quantity: 0,
      unitPrice: 0,
      total: 0,
    };
    setValue('items', [...currentItems, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    const currentItems = watch('items');
    const updatedItems = currentItems.filter((_, i) => i !== index);
    setValue('items', updatedItems);
  };

  const handleProductChange = (index: number, productId: number) => {
    const selectedProduct = productOptions.find((option) => option.id === productId);
    if (selectedProduct) {
      setValue(`items.${index}.productId`, selectedProduct.id);
      setValue(`items.${index}.quantity`, 1);
      setValue(`items.${index}.unitPrice`, selectedProduct.price);
      setValue(`items.${index}.total`, selectedProduct.price);
    }
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const productId = watch(`items.${index}.productId`);
    const selectedProduct = productOptions.find((option) => option.id === productId);

    if (selectedProduct) {
      setValue(`items.${index}.quantity`, quantity);
      setValue(`items.${index}.total`, quantity * selectedProduct.price);
    }
  };

  const handleUnitPriceChange = (index: number, unitPrice: number) => {
    const quantity = watch(`items.${index}.quantity`);
    setValue(`items.${index}.unitPrice`, unitPrice);
    setValue(`items.${index}.total`, quantity * unitPrice);
  };

  const getAvailableProducts = (currentIndex: number) => {
    const currentItems = watch('items');
    const selectedProductIds = currentItems
      .map((item, idx) => (idx !== currentIndex ? item.productId : null))
      .filter((id): id is number => id !== null && id !== 0);

    return productOptions.filter(option => !selectedProductIds.includes(option.id));
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      {loading && <Spinner />}
      {!loading && (
        <Box sx={{ p: 3, width: '100%' }}>
          <Paper sx={{ p: 2 }}>
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5">{isEditMode ? t('update_receipt') : t('create_receipt')}</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button variant="outlined" onClick={onClose}>
                    {t('cancel')}
                  </Button>
                  <Button type="submit" variant="contained" color="primary">
                    {isEditMode ? t('update') : t('create')}
                  </Button>
                </Box>
              </Box>

              {/* Form Fields */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Controller
                    name="receiptCode"
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <CustomTextField
                        fullWidth 
                        required
                        label={t('receipt_code')}
                        onChange={onChange}
                        onBlur={onBlur}
                        value={value}
                        placeholder={receiptCode}
                        error={!!errors.receiptCode}
                        helperText={errors.receiptCode?.message}
                        disabled={isEditMode}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Controller
                    name="receiptDate"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <DateTimePicker
                        value={value}
                        onChange={(newValue) => onChange(newValue)}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: 'small',
                            label: t('receipt_date'),
                            placeholder: t('select_receipt_date'),
                            error: !!errors.receiptDate,
                            helperText: errors.receiptDate?.message,
                          },
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Controller
                    name="supplierId"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <CustomAutocomplete
                        options={supplierOptions}
                        value={supplierOptions.find((option) => option.value === value) || null}
                        onChange={(newValue) => {
                          onChange(newValue?.value || '');
                        }}
                        label={t('supplier_name')}
                        error={!!errors.supplierId}
                        helperText={errors.supplierId?.message}
                        placeholder={t('enter_supplier_name')}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Controller
                    name="employeeId"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <CustomAutocomplete
                        options={employeeOptions}
                        value={employeeOptions.find((option) => option.value === value) || null}
                        onChange={(newValue) => {
                          onChange(newValue?.value || '');
                        }}
                        label={t('employee_name')}
                        error={!!errors.employeeId}
                        helperText={errors.employeeId?.message}
                        placeholder={t('enter_employee_name')}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <CustomAutocomplete
                        options={Object.values(statusOptions)}
                        disabled={isEditMode}
                        value={Object.values(statusOptions).find((option) => option.value === value) || null}
                        onChange={(newValue) => {
                          onChange(newValue?.value || '');
                        }}
                        label={t('status')}
                        error={!!errors.status}
                        helperText={errors.status?.message}
                        placeholder={t('select_status')}
                      />
                    )}
                  />
                </Grid>
              </Grid>

              {/* Items Table Header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, mb: 2 }}>
                <Typography variant="h6">{t('product_list')}</Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    onCreateNew();
                  }}
                >
                  {t('create_new_product')}
                </Button>
              </Box>

              {/* Items Table */}
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell width="5%">#</TableCell>
                      <TableCell width="35%">{t('product_name')}</TableCell>
                      <TableCell width="15%">{t('quantity')}</TableCell>
                      <TableCell width="20%">{t('import_price')}</TableCell>
                      <TableCell width="20%">{t('total_product_price')}</TableCell>
                      <TableCell width="5%">
                        <IconButton color="primary" onClick={handleAddItem}>
                          <AddIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((item, index) => (
                      <TableRow key={item.id}>
                        <StyledTableCell width="5%">{index + 1}</StyledTableCell>
                        <StyledTableCell width="35%">
                          <Controller
                            name={`items.${index}.productId`}
                            control={control}
                            render={({ field: { onChange, value } }) => (
                              <CustomAutocomplete
                                options={getAvailableProducts(index)}
                                value={productOptions.find((option) => option.id === value) || null}
                                onChange={(newValue) => {
                                  if (newValue && newValue.id !== undefined) {
                                    onChange(newValue.id);
                                    handleProductChange(index, newValue.id);
                                  } else {
                                    onChange(0);
                                  }
                                }}
                                error={!!errors.items?.[index]?.productId}
                                helperText={errors.items?.[index]?.productId?.message}
                                placeholder={t('enter_product_name')}
                                required
                              />
                            )}
                          />
                        </StyledTableCell>

                        <StyledTableCell width="15%">
                          <Controller
                            name={`items.${index}.quantity`}
                            control={control}
                            render={({ field: { onChange, onBlur, value } }) => (
                              <CustomTextField
                                fullWidth
                                type="number"
                                onChange={(e) => {
                                  const newQuantity = parseInt(e.target.value) || 0;
                                  onChange(newQuantity);
                                  handleQuantityChange(index, newQuantity);
                                }}
                                onBlur={onBlur}
                                value={value}
                                error={!!errors.items?.[index]?.quantity}
                                helperText={errors.items?.[index]?.quantity?.message}
                              />
                            )}
                          />
                        </StyledTableCell>

                        <StyledTableCell width="20%">
                          <Controller
                            name={`items.${index}.unitPrice`}
                            control={control}
                            render={({ field: { onChange, onBlur, value } }) => (
                              <CustomTextField
                                fullWidth
                                type="number"
                                onChange={(e) => {
                                  const newUnitPrice = parseFloat(e.target.value) || 0;
                                  onChange(newUnitPrice);
                                  handleUnitPriceChange(index, newUnitPrice);
                                }}
                                onBlur={onBlur}
                                value={value}
                                error={!!errors.items?.[index]?.unitPrice}
                                helperText={errors.items?.[index]?.unitPrice?.message}
                              />
                            )}
                          />
                        </StyledTableCell>

                        <StyledTableCell width="20%">
                          <CustomTextField fullWidth type="number" value={item.total} disabled />
                        </StyledTableCell>
                        <StyledTableCell width="5%" sx={{ padding: '6px 24px 6px 16px' }}>
                          <IconButton
                            color="error"
                            onClick={() => handleRemoveItem(index)}
                            disabled={items.length <= 1}
                          >
                            <RemoveIcon />
                          </IconButton>
                        </StyledTableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Footer */}
              <Box
                sx={{
                  mt: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 2,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {t('total')}:
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {items
                      .reduce((sum, item) => sum + item.total, 0)
                      .toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                  </Typography>
                </Box>
              </Box>
            </form>
          </Paper>
        </Box>
      )}
    </LocalizationProvider>
  );
};

export default CreateUpdateReceipt;