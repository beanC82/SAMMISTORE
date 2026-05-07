import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import {
    Box,
    Button,
    Container,
    Grid,
    IconButton,
    Typography,
    Paper,
    Divider,
    useTheme,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    styled,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { TParamsCreateOrderShop } from '../../../../../types/order';
import { createOrderShop } from '../../../../../services/order';
import { getAllProducts } from '../../../../../services/product';
import { toast } from 'react-toastify';
import CustomTextField from 'src/components/text-field';
import CustomAutocomplete from 'src/components/custom-autocomplete';
import Spinner from 'src/components/spinner';
import { getAllCustomers } from '@/services/customer';
import { getAllPaymentMethods } from '@/services/payment-method';


interface Product {
    id: number;
    name: string;
    code: string;
    price: number;
    stockQuantity: number;
}

interface AutocompleteOption {
    label: string;
    value: number;
}

interface OrderItem {
    id: number;
    productId: number;
    quantity: number;
    price: number;
    total: number;
}

interface OrderFormValues {
    customerId: string;
    voucherId?: string;
    discountValue?: string;
    paymentMethodId: string;
    details: OrderItem[];
}

interface PaymentMethod {
    id: number;
    name: string;
    code: string;
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    padding: theme.spacing(1),
    '& .MuiTextField-root': {
        margin: 0,
        width: '100%',
    },
}));

interface ICreateOrder {
    onClose: () => void;
    onCreateNew: () => void;
}

const CreateOrder: React.FC<ICreateOrder> = ({ onClose, onCreateNew }) => {
    const router = useRouter();
    const { t } = useTranslation();
    const theme = useTheme();
    const [loading, setLoading] = useState(false);
    const [productOptions, setProductOptions] = useState<Product[]>([]);
    const [customerOptions, setCustomerOptions] = useState<{ label: string; value: string }[]>([]);
    const [paymentMethodOptions, setPaymentMethodOptions] = useState<{ label: string; value: string }[]>([]);

    const orderStatuses = [
        { value: 'PENDING', label: t('pending') },
        { value: 'WAITINGFORPAYPENT', label: t('waiting_for_payment') },
        { value: 'PROCESSING', label: t('processing') },
        { value: 'COMPLETED', label: t('completed') },
        { value: 'CANCELLED', label: t('cancelled') },
    ];

    const shippingStatuses = [
        { value: 'NOTSHIPPED', label: t('not_shipped') },
        { value: 'PROCESSING', label: t('processing') },
        { value: 'DELIVERED', label: t('delivered') },
        { value: 'LOST', label: t('lost') },
    ];

    const paymentMethods = [
        { value: '1', label: t('cash_on_delivery') },
        { value: '2', label: t('vnpay') },
        { value: '3', label: t('at_shop') },
    ];

    const schema = yup.object({
        customerId: yup.string().required(t('required_customer_name')),
        voucherId: yup.string().optional(),
        discountValue: yup.string().optional(),
        paymentMethodId: yup.string().required(t('required_payment_method')),
        details: yup.array().of(
            yup.object({
                id: yup.number().required(),
                productId: yup.number().required(t('required_product_name')),
                quantity: yup.number().required(t('required_quantity')).min(1, t('quantity_min_1')),
                price: yup.number().required(t('required_price')).min(0, t('price_min_0')),
                total: yup.number().required(),
            })
        ).min(1, t('required_at_least_one_product')).required(),
    }).required();

    const defaultValues: OrderFormValues = {
        customerId: '',
        voucherId: '0',
        discountValue: '0',
        paymentMethodId: '',
        details: [{ id: 0, productId: 0, quantity: 0, price: 0, total: 0 }],
    };

    const {
        control,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
    } = useForm<OrderFormValues>({
        resolver: yupResolver<OrderFormValues>(schema),
        defaultValues,
        mode: 'onChange',
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'details',
    });

    const items = watch('details');

    // Fetch products
    const fetchProducts = async () => {
        try {
            setLoading(true);
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
                    data.map((item: { name: string; code: string; price: number; id: number; stockQuantity: number }) => ({
                        id: item.id,
                        name: item.name,
                        code: item.code,
                        price: item.price || 0,
                        stockQuantity: item.stockQuantity || 0,
                    }))
                );
            }
        } catch (err) {
            console.error('Error fetching products:', err);
            toast.error(t('failed_to_fetch_products'));
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const res = await getAllCustomers({
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
                setCustomerOptions(
                    data.map((item: { fullName: string; id: string }) => ({
                        label: item.fullName,
                        value: item.id,
                    }))
                );
            }
        } catch (err) {
            console.error('Error fetching customers:', err);
            toast.error(t('failed_to_fetch_customers'));
        } finally {
            setLoading(false);
        }
    };

    const fetchPaymentMethods = async () => {
        try {
            setLoading(true);
            const res = await getAllPaymentMethods({
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
                setPaymentMethodOptions(
                    data.map((item: PaymentMethod) => ({
                        label: item.name,
                        value: item.id.toString(),
                    }))
                );
            }
        } catch (err) {
            console.error('Error fetching payment methods:', err);
            toast.error(t('failed_to_fetch_payment_methods'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
        fetchProducts();
        fetchPaymentMethods();
    }, []);

    const onSubmit = async (data: OrderFormValues) => {
        try {
            setLoading(true);
            const payload: TParamsCreateOrderShop = {
                customerId: Number(data.customerId),
                orderStatus: "",
                code: "",
                shippingStatus: "",
                voucherId: data.voucherId ? Number(data.voucherId) : 0,
                discountValue: data.discountValue ? Number(data.discountValue) : undefined,
                paymentMethodId: Number(data.paymentMethodId),
                details: (data.details || []).map((detail) => ({
                    productId: detail.productId,
                    quantity: detail.quantity,
                    price: detail.price,
                    total: detail.total,
                    orderId: 0,
                })),
                isActive: true,
                isDelete: false,
            };

            const response = await createOrderShop(payload);
            if (response?.result?.returnUrl) {

                window.open(response.result.returnUrl, '_blank');
            } else {
                // For other payment methods or no returnUrl
                toast.success(t('create_order_successfully'));
                onClose();
            }
        } catch (error) {
            toast.error(t('failed_to_create_order'));
            console.error('Create order error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = () => {
        append({ id: 0, productId: 0, quantity: 0, price: 0, total: 0 });
    };

    const handleRemoveItem = (index: number) => {
        remove(index);
    };

    const handleProductChange = (index: number, productId: number) => {
        const selectedProduct = productOptions.find((option) => option.id === productId);
        if (selectedProduct) {
            setValue(`details.${index}.productId`, selectedProduct.id);
            setValue(`details.${index}.quantity`, 1);
            setValue(`details.${index}.price`, selectedProduct.price);
            setValue(`details.${index}.total`, selectedProduct.price);
        }
    };

    const handleQuantityChange = (index: number, quantity: number) => {
        const price = watch(`details.${index}.price`);
        setValue(`details.${index}.quantity`, quantity);
        setValue(`details.${index}.total`, quantity * price);
    };

    const handlePriceChange = (index: number, price: number) => {
        const quantity = watch(`details.${index}.quantity`);
        setValue(`details.${index}.price`, price);
        setValue(`details.${index}.total`, quantity * price);
    };

    const getAvailableProducts = (currentIndex: number): AutocompleteOption[] => {
        const formDetails = watch('details');
        const selectedProductIds = formDetails
            .map((item, idx) => (idx !== currentIndex ? item.productId : null))
            .filter((id): id is number => id !== null && id !== 0);

        return productOptions
            .filter(option => !selectedProductIds.includes(option.id))
            .map(option => ({
                label: `${option.name} (${option.code})`,
                value: option.id,
                stockQuantity: option.stockQuantity
            }));
    };

    return (
        <Container maxWidth="lg">
            {loading && <Spinner />}
            {!loading && (
                <Box sx={{ py: 4 }}>
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 4
                    }}>
                        <Typography variant="h4" component="h1" sx={{
                            color: theme.palette.primary.main,
                            fontWeight: 600,
                        }}>
                            {t('create_new_order')}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button
                                variant="outlined"
                                onClick={() => onClose()}
                                sx={{
                                    borderColor: theme.palette.error.main,
                                    color: theme.palette.error.main,
                                    '&:hover': {
                                        borderColor: theme.palette.error.dark,
                                        backgroundColor: theme.palette.error.light
                                    }
                                }}
                            >
                                {t('cancel')}
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={loading}
                                form="create-order-form"
                                sx={{
                                    backgroundColor: theme.palette.primary.main,
                                    '&:hover': {
                                        backgroundColor: theme.palette.primary.dark
                                    }
                                }}
                            >
                                {loading ? t('creating') : t('create_order')}
                            </Button>
                        </Box>
                    </Box>

                    <form id="create-order-form" onSubmit={handleSubmit(onSubmit)}>
                        <Paper sx={{
                            p: 3,
                            boxShadow: theme.shadows[2],
                            borderRadius: 2,
                            mb: 4
                        }}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Controller
                                            name="customerId"
                                            control={control}
                                            render={({ field: { onChange, value } }) => (
                                                <CustomAutocomplete
                                                    options={customerOptions}
                                                    value={customerOptions.find(option => option.value === value) || null}
                                                    onChange={(newValue) => onChange(newValue?.value || '')}
                                                    label={t('customer_name')}
                                                    error={!!errors.customerId}
                                                    helperText={errors.customerId?.message}
                                                    required
                                                    placeholder={t('enter_customer_name')}
                                                    sx={{ flex: 1 }}
                                                />
                                            )}
                                        />
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={() => onCreateNew()}
                                            sx={{ minWidth: '40px', px: 1 }}
                                        >
                                            <AddIcon />
                                        </Button>
                                    </Box>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Controller
                                        name="voucherId"
                                        control={control}
                                        render={({ field }) => (
                                            <CustomTextField
                                                {...field}
                                                fullWidth
                                                defaultValue={0}
                                                label={t('voucher')}
                                                type="number"
                                            />
                                        )}
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Controller
                                        name="discountValue"
                                        control={control}
                                        render={({ field }) => (
                                            <CustomTextField
                                                {...field}
                                                fullWidth
                                                label={t('discount_value')}
                                                type="number"
                                            />
                                        )}
                                    />
                                </Grid>

                                <Grid item xs={6}>
                                    <Controller
                                        name="paymentMethodId"
                                        control={control}
                                        render={({ field: { onChange, value } }) => (
                                            <CustomAutocomplete
                                                options={paymentMethodOptions}
                                                value={paymentMethodOptions.find(option => option.value === value) || null}
                                                onChange={(newValue) => onChange(newValue?.value || '')}
                                                label={t('payment_method')}
                                                error={!!errors.paymentMethodId}
                                                helperText={errors.paymentMethodId?.message}
                                                required
                                                placeholder={t('select_payment_method')}
                                            />
                                        )}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>

                        <Typography variant="h6" gutterBottom sx={{
                            color: theme.palette.primary.main,
                            fontWeight: 600,
                            mb: 3
                        }}>
                            {t('order_details')}
                        </Typography>

                        {/* Items Table Header */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6">{t('product_list')}</Typography>
                            <Button
                                onClick={handleAddItem}
                                variant="contained"
                                color="primary"
                            >
                                <AddIcon />
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
                                        <TableCell width="20%">{t('price')}</TableCell>
                                        <TableCell width="20%">{t('total')}</TableCell>
                                        <TableCell width="5%"></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {fields.map((field, index) => (
                                        <TableRow key={field.id}>
                                            <StyledTableCell width="5%">{index + 1}</StyledTableCell>
                                            <StyledTableCell width="35%">
                                                <Controller
                                                    name={`details.${index}.productId`}
                                                    control={control}
                                                    render={({ field: { onChange, value } }) => {
                                                        const options = getAvailableProducts(index);
                                                        const selectedOption = options.find(option => option.value === value) || null;
                                                        return (
                                                            <CustomAutocomplete
                                                                options={options}
                                                                value={selectedOption}
                                                                onChange={(newValue) => {
                                                                    if (newValue) {
                                                                        onChange(newValue.value);
                                                                        const selectedProduct = productOptions.find(p => p.id === newValue.value);
                                                                        if (selectedProduct) {
                                                                            handleProductChange(index, selectedProduct.id);
                                                                        }
                                                                    } else {
                                                                        onChange(0);
                                                                    }
                                                                }}
                                                                getOptionLabel={(option) => option.label}
                                                                renderOption={(props, option) => {
                                                                    const product = productOptions.find(p => p.id === option.value);
                                                                    if (!product) return null;
                                                                    return (
                                                                        <li {...props}>
                                                                            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                                    <Typography variant="body2">
                                                                                        {product.name}
                                                                                    </Typography>
                                                                                    <Typography
                                                                                        variant="caption"
                                                                                        sx={{
                                                                                            color: product.stockQuantity > 0 ? 'success.main' : 'error.main',
                                                                                            fontWeight: 'bold'
                                                                                        }}
                                                                                    >
                                                                                        {t('stock_quantity')}: {product.stockQuantity}
                                                                                    </Typography>
                                                                                </Box>
                                                                                <Typography variant="caption" color="text.secondary">
                                                                                    {product.code} - {product.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                                                                </Typography>
                                                                            </Box>
                                                                        </li>
                                                                    );
                                                                }}
                                                                error={!!errors.details?.[index]?.productId}
                                                                helperText={errors.details?.[index]?.productId?.message}
                                                                placeholder={t('select_product')}
                                                                required
                                                            />
                                                        );
                                                    }}
                                                />
                                            </StyledTableCell>

                                            <StyledTableCell width="15%">
                                                <Controller
                                                    name={`details.${index}.quantity`}
                                                    control={control}
                                                    render={({ field }) => (
                                                        <CustomTextField
                                                            {...field}
                                                            fullWidth
                                                            required
                                                            type="number"
                                                            onChange={(e) => {
                                                                const newQuantity = parseInt(e.target.value) || 0;
                                                                field.onChange(newQuantity);
                                                                handleQuantityChange(index, newQuantity);
                                                            }}
                                                            error={!!errors.details?.[index]?.quantity}
                                                            helperText={errors.details?.[index]?.quantity?.message}
                                                        />
                                                    )}
                                                />
                                            </StyledTableCell>

                                            <StyledTableCell width="20%">
                                                <Controller
                                                    name={`details.${index}.price`}
                                                    control={control}
                                                    render={({ field }) => (
                                                        <CustomTextField
                                                            {...field}
                                                            fullWidth
                                                            required
                                                            disabled
                                                            type="number"
                                                            onChange={(e) => {
                                                                const newPrice = parseFloat(e.target.value) || 0;
                                                                field.onChange(newPrice);
                                                                handlePriceChange(index, newPrice);
                                                            }}
                                                            error={!!errors.details?.[index]?.price}
                                                            helperText={errors.details?.[index]?.price?.message}
                                                        />
                                                    )}
                                                />
                                            </StyledTableCell>

                                            <StyledTableCell width="20%">
                                                <CustomTextField
                                                    fullWidth
                                                    type="number"
                                                    value={watch(`details.${index}.total`)}
                                                    disabled
                                                />
                                            </StyledTableCell>

                                            <StyledTableCell width="5%" sx={{ padding: '6px 24px 6px 16px' }}>
                                                <IconButton
                                                    color="error"
                                                    onClick={() => handleRemoveItem(index)}
                                                    disabled={fields.length <= 1}
                                                    sx={{
                                                        '&:hover': {
                                                            backgroundColor: theme.palette.error.light
                                                        }
                                                    }}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </StyledTableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Footer */}
                        <Box sx={{
                            mt: 2,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 2,
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Typography variant="subtitle1" fontWeight="bold">
                                    {t('total')}:
                                </Typography>
                                <Typography variant="h6" color="primary">
                                    {watch('details')
                                        .reduce((sum, item) => sum + item.total, 0)
                                        .toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                </Typography>
                            </Box>
                        </Box>

                        <Divider sx={{ my: 3 }} />
                    </form>
                </Box>
            )}
        </Container>
    );
};

export default CreateOrder;
