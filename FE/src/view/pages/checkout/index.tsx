'use client';

// React
import React, { useEffect, useMemo, useState, Suspense } from 'react';

// Next
import { NextPage } from 'next';
import dynamic from 'next/dynamic';

// MUI - Tối ưu import bằng cách nhóm các components liên quan
import {
    alpha,
    Box,
    Button,
    Grid,
    Radio,
    RadioGroup,
    Typography,
    useTheme,
    Divider,
    Container,
    Stack,
    FormControlLabel,
    formControlLabelClasses
} from '@mui/material';

// Translate
import { useTranslation } from 'react-i18next';

// Redux
import { AppDispatch, RootState } from 'src/stores';
import { useDispatch, useSelector } from 'react-redux';


const CheckoutSummary = dynamic(() => import('./components/CheckoutSummary'), {
    loading: () => <Spinner />,
    ssr: false
});

const AddressModal = dynamic(() => import('./components/AddressModal'), {
    loading: () => <Spinner />,
    ssr: false
});

const VoucherModal = dynamic(() => import('./components/VoucherModal'), {
    loading: () => <Spinner />,
    ssr: false
});

// Other imports
import { useAuth } from 'src/hooks/useAuth';
import { formatPrice } from 'src/utils';
import IconifyIcon from 'src/components/Icon';
import Spinner from 'src/components/spinner';
import { getAllPaymentMethods } from 'src/services/payment-method';
import { getAllDeliveryMethods, getCaculatedFee } from 'src/services/delivery-method';
import { createOrderAsync } from 'src/stores/order/action';
import { ROUTE_CONFIG } from 'src/configs/route';
import { useRouter } from 'next/router';
import CustomBreadcrumbs from 'src/components/custom-breadcrum';
import { TItemOrderProduct } from 'src/types/order';
import { TParamsAddresses } from 'src/types/address';
import { getCurrentAddress } from 'src/services/address';
import { createVNPayPaymentUrl } from 'src/services/payment';
import { PAYMENT_METHOD } from 'src/configs/payment';
import { getVoucherDetail } from 'src/services/voucher';
import StepLabel from 'src/components/step-label';
import { toast } from 'react-toastify';
import { getCartDataAsync, getCartsAsync } from 'src/stores/cart/action';

// ----------------------------------------------------------------------

// Types và Interfaces
interface CartItem {
    productId: number;
    quantity: number;
    productName?: string;
    price?: number;
    discount?: number;
    images?: any[];
}

interface PaymentOption {
    label: string;
    value: string;
    type: string;
    id: number;
}

type TProps = {};


const CheckoutPage: NextPage<TProps> = () => {
    // ============= States =============
    // States cho loading và UI
    const [loading, setLoading] = useState<boolean>(false);
    const [openWarning, setOpenWarning] = useState(false);
    const [openAddress, setOpenAddress] = useState(false);
    const [openVoucher, setOpenVoucher] = useState(false);

    // States cho payment
    const [paymentOptions, setPaymentOptions] = useState<PaymentOption[]>([]);
    const [selectedPayment, setSelectedPayment] = useState<string>('');

    // States cho delivery
    const [selectedDelivery, setSelectedDelivery] = useState<string>('');
    const [shippingPrice, setShippingPrice] = useState<number>(0);
    const [leadTime, setLeadTime] = useState<Date | null>(null);


    const [myCurrentAddress, setMyCurrentAddress] = useState<TParamsAddresses>();
    const [selectedVoucherId, setSelectedVoucherId] = useState<number>(0);
    const [voucherDiscount, setVoucherDiscount] = useState<number>(0);

    const { user } = useAuth();
    const { i18n, t } = useTranslation();
    const router = useRouter();
    const theme = useTheme();
    const dispatch: AppDispatch = useDispatch();
    const PAYMENT_DATA = PAYMENT_METHOD();


    const { addresses } = useSelector((state: RootState) => state.address);
    const { cartData, isLoading } = useSelector((state: RootState) => state.cart);

    const breadcrumbItems = useMemo(() => [
        {
            label: t('home'),
            href: '/',
            icon: <IconifyIcon color="primary" icon="healthicons:home-outline" />
        },
        {
            label: t('checkout'),
            href: '/checkout'
        },
    ], [t]);

    const deliveryOption = useMemo(() => [{
        label: t('fast_delivery'),
        value: 'fast_delivery',
        price: shippingPrice,
        leadTime: leadTime,
    }], [t, shippingPrice, leadTime]);

    const handleFormatProductData = (items: any) => {
        return items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
        }));
    };

    // ============= Memoized Calculations =============
    const memoQueryProduct = useMemo(() => {
        const result = { totalPrice: 0, selectedProduct: [] };
        const data: any = router.query;
        if (data) {
            result.totalPrice = data.totalPrice || 0;
            result.selectedProduct = data.selectedProduct ? handleFormatProductData(JSON.parse(data.selectedProduct)) : [];
        }
        return result;
    }, [router.query, cartData?.data]);


    const memoShippingPrice = useMemo(() => {
        const shippingPrice = deliveryOption.find((item) => item.value === selectedDelivery)?.price ?? 0;
        return shippingPrice ? Number(shippingPrice) : 0;
    }, [selectedDelivery, deliveryOption]);

    useEffect(() => {
        if (selectedVoucherId) {
            setLoading(true);
            getVoucherDetail(Number(selectedVoucherId))
                .then(res => {
                    if (res?.result) {
                        const discountValue = res.result.discountValue || 0;
                        const discountType = res.result.discountTypeId;

                        let calculatedDiscount = 0;
                        if (discountType === 1) { 
                            calculatedDiscount = (Number(memoQueryProduct.totalPrice) * Number(discountValue)) / 100;
                        } else if (discountType === 2) {
                            calculatedDiscount = Number(discountValue);
                        } else if (discountType === 3) { 
                            calculatedDiscount = Number(shippingPrice);
                        }

                        setVoucherDiscount(calculatedDiscount);
                    } else {
                        setVoucherDiscount(0);
                        toast.error(t('voucher_not_found'));
                    }
                })
                .catch(error => {
                    console.error('Error getting voucher details:', error);
                    setVoucherDiscount(0);
                    toast.error(t('error_getting_voucher'));
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setVoucherDiscount(0);
        }
    }, [selectedVoucherId, memoQueryProduct.totalPrice, shippingPrice, t]);

    useEffect(() => {
        if (user?.id && memoQueryProduct.selectedProduct.length > 0) {
            dispatch(
                getCartDataAsync({
                    params: {
                        productIds: memoQueryProduct.selectedProduct.map((item: TItemOrderProduct) => item.productId).join(',')
                    }
                })
            );
        }
    }, []);

    // ============= Handlers =============
    const handlePlaceOrder = () => {
        const subtotal = Number(memoQueryProduct.totalPrice);
        const shipping = Number(shippingPrice);
        const totalPrice = Number(subtotal) + Number(shipping) - Number(voucherDiscount);

        const orderDetails = memoQueryProduct.selectedProduct.map((item: TItemOrderProduct) => ({
            orderId: 0,
            productId: Number(item.productId),
            quantity: item.quantity,
            tax: 0,
            id: 0,
            amount: item.price * item.quantity,
        }));

        dispatch(
            createOrderAsync({
                displayOrder: 0,
                customerId: user ? user.id : 0,
                code: '1',
                paymentStatus: '',
                orderStatus: '',
                shippingStatus: '',
                voucherId: Number(selectedVoucherId),
                wardId: myCurrentAddress?.wardId || 0,
                customerAddress: `${myCurrentAddress?.streetAddress}, ${myCurrentAddress?.wardName}, ${myCurrentAddress?.districtName}, ${myCurrentAddress?.provinceName}`,
                costShip: shippingPrice,
                trackingNumber: '',
                estimatedDeliveryDate: new Date(deliveryOption.find((item) => item.value === selectedDelivery)?.leadTime || new Date()),
                actualDeliveryDate: new Date(),
                shippingCompanyId: 0,
                details: orderDetails,
                totalAmount: totalPrice,
                totalQuantity: memoQueryProduct.selectedProduct.reduce((acc: number, item: TItemOrderProduct) => acc + item.quantity, 0),
                discountAmount: voucherDiscount,
                isBuyNow: false,
                paymentMethodId: Number(selectedPayment),
            })
        ).then(res => {
            if (res?.payload?.isSuccess) {
                const returnUrl = res?.payload?.result?.returnUrl;
                if (returnUrl) {
                    window.location.href = returnUrl;
                } else {
                    router.push(ROUTE_CONFIG.PAYMENT)
                }
                dispatch(
                    getCartsAsync({
                        params: {
                            take: -1,
                            skip: 0,
                            paging: false,
                            orderBy: 'name',
                            dir: 'asc',
                            keywords: "''",
                            filters: '',
                        },
                    })
                );
            } else {
                toast.error(res?.payload?.message);
            }
        });
    };

    const onChangeDelivery = (value: string) => setSelectedDelivery(value);
    const onChangePayment = (value: string) => setSelectedPayment(value);

    const handlePaymentVNPay = async (data: { orderId: number; totalPrice: number }) => {
        setLoading(true);
        try {
            const res = await createVNPayPaymentUrl({
                totalPrice: data.totalPrice,
                orderId: +data?.orderId,
                language: i18n.language === 'vi' ? 'vn' : i18n.language
            });
            if (res?.result) {
                window.open(res.result, '_blank');
            }
        } catch (error) {
            console.error('Error creating VNPay payment URL:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentTypeOrder = (id: string, data: { orderId: number; totalPrice: number }) => {
        switch (id) {
            case PAYMENT_DATA.VN_PAYMENT.value:
                handlePaymentVNPay(data);
                break;
            default:
                break;
        }
    };

    const getShippingFee = async () => {
        if (myCurrentAddress?.wardId && memoQueryProduct.totalPrice) {
            try {
                const res = await getCaculatedFee({
                    params: {
                        wardId: myCurrentAddress.wardId,
                        totalAmount: Math.floor(memoQueryProduct.totalPrice)
                    }
                });
                if (res?.result) {
                    setShippingPrice(res.result.total);
                    setLeadTime(res.result.leadTime);
                }
            } catch (error) {
                console.error('Error calculating shipping fee:', error);
            }
        }
    };

    const getMyCurrentAddress = async () => {
        try {
            const res = await getCurrentAddress();
            setMyCurrentAddress(res?.result);
        } catch (error) {
            console.error('Error getting current address:', error);
        }
    };

    const getListPaymentMethod = async () => {
        setLoading(true);
        try {
            const res = await getAllPaymentMethods({
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
            if (res?.result?.subset) {
                setPaymentOptions(
                    res.result.subset.map((item: { name: string; id: string; type: string }) => ({
                        label: item.name,
                        value: item.id,
                        type: item.type,
                        id: item.id
                    }))
                );
                setSelectedPayment(res.result.subset[0]?.id);
            }
        } catch (error) {
            console.error('Error getting payment methods:', error);
        } finally {
            setLoading(false);
        }
    };

    // ============= Effects =============
    useEffect(() => {
        if (user) {
            getMyCurrentAddress();
        }
    }, [addresses, user]);

    useEffect(() => {
        getListPaymentMethod();
    }, []);

    useEffect(() => {
        getShippingFee();
    }, [myCurrentAddress, memoQueryProduct.totalPrice]);


    // ============= Render =============
    return (
        <Box sx={{
            maxWidth: '1440px',
            margin: '0 auto',
            width: '100%',
            py: { xs: 2, sm: 1, md: 2, lg: 8 },
            px: { xs: 2, sm: 2, md: 4, lg: 8 },
        }}>
            {loading || isLoading ? <Spinner /> : null}

            <Suspense fallback={<Spinner />}>
                <AddressModal open={openAddress} onClose={() => setOpenAddress(false)} />
                <VoucherModal
                    open={openVoucher}
                    onClose={() => setOpenVoucher(false)}
                    onSelectVoucher={(voucherId: number) => {
                        setSelectedVoucherId(voucherId);
                    }}
                    cartDetails={memoQueryProduct.selectedProduct}
                />
            </Suspense>

            {/* Breadcrumbs */}
            <Box sx={{ mb: { xs: 1, sm: 2, md: 4 } }}>
                <CustomBreadcrumbs items={breadcrumbItems} />
            </Box>

            {/* Main Content */}
            <Stack spacing={3} sx={{
                alignItems: 'center',
                justifyContent: 'center',
                padding: { xs: 4, sm: 4, md: 4, lg: 8 },
                borderRadius: '15px',
                width: '100% !important',
                backgroundColor: theme.palette.background.paper,
            }}>
                <Grid container>
                    <Grid item xs={12} md={8} sx={{
                        pr: { xs: 0, sm: 0, md: 4, lg: 8 },
                    }}>
                        <Stack spacing={4} divider={<Divider sx={{ borderStyle: 'dashed' }} />}>
                            {/* Step 1: Shipping Address */}
                            <Box>
                                <StepLabel title={t('shipping_info')} step="1" />
                                {user ? (
                                    <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                                        <Stack direction="column" alignItems="flex-start" spacing={1}>
                                            <Typography sx={{ fontWeight: 'bold', fontSize: { xs: '16px', md: '18px' } }}>
                                                {user?.fullName} {user?.phone}
                                            </Typography>
                                            <Typography sx={{ fontWeight: 'bold', fontSize: { xs: '16px', md: '18px' } }}>
                                                {myCurrentAddress?.streetAddress}, {myCurrentAddress?.wardName}, {myCurrentAddress?.districtName}, {myCurrentAddress?.provinceName}
                                            </Typography>
                                        </Stack>
                                        <Button variant="outlined" size="small"
                                            onClick={() => setOpenAddress(true)} sx={{ textWrap: 'nowrap' }}>
                                            {t('change_address')}
                                        </Button>
                                    </Stack>
                                ) : (
                                    <Button variant="outlined" size="small"
                                        onClick={() => setOpenAddress(true)}>
                                        {t('add_address')}
                                    </Button>
                                )}
                            </Box>

                            {/* Step 2: Delivery Method */}
                            <Box>
                                <StepLabel title={t('delivery_method')} step="2" />
                                <RadioGroup
                                    aria-labelledby="radio-delivery-group"
                                    name="radio-delivery-group"
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChangeDelivery(e.target.value)}
                                    sx={{
                                        rowGap: 2,
                                        columnGap: 2,
                                        display: 'grid',
                                        gridTemplateColumns: {
                                            xs: 'repeat(1, 1fr)',
                                            sm: 'repeat(2, 1fr)',
                                        },
                                    }}
                                >
                                    {deliveryOption.map((delivery) => (
                                        <FormControlLabel
                                            key={delivery.value}
                                            value={delivery.value}
                                            control={
                                                <Radio
                                                    disableRipple
                                                    checked={selectedDelivery === delivery.value}
                                                    checkedIcon={<IconifyIcon icon="carbon:checkmark-outline" />}
                                                    sx={{ mx: 1 }}
                                                />
                                            }
                                            label={
                                                <Stack spacing={0.5} sx={{ width: 1 }}>
                                                    <Stack direction="row" alignItems="center">
                                                        <IconifyIcon icon="carbon:delivery" width={24} />
                                                        <Typography variant="subtitle1" sx={{ flexGrow: 1, ml: 1 }}>
                                                            {delivery.label}
                                                        </Typography>
                                                        <Typography variant="h6">{formatPrice(Number(delivery.price))}</Typography>
                                                    </Stack>
                                                    {delivery.leadTime && (
                                                        <Typography variant="caption" sx={{ color: theme.palette.success.main, ml: 4 }}>
                                                            {t('ensure_estimated_delivery')}: {new Date(delivery.leadTime).toLocaleDateString('en-GB', {
                                                                day: '2-digit',
                                                                month: '2-digit',
                                                                year: 'numeric'
                                                            })}
                                                        </Typography>
                                                    )}
                                                </Stack>
                                            }
                                            sx={{
                                                m: 0,
                                                py: 2,
                                                pr: 2,
                                                borderRadius: 1,
                                                border: (theme) => `solid 1px ${alpha(theme.palette.grey[500], 0.24)}`,
                                                ...(selectedDelivery === delivery.value && {
                                                    boxShadow: (theme) => `0 0 0 2px ${theme.palette.text.primary}`,
                                                }),
                                                [`& .${formControlLabelClasses.label}`]: { width: 1 },
                                            }}
                                        />
                                    ))}
                                </RadioGroup>
                            </Box>

                            {/* Step 3: Payment Method */}
                            <Box>
                                <StepLabel title={t('payment_method')} step="3" />
                                <RadioGroup
                                    value={selectedPayment}
                                    aria-labelledby="radio-payment-group"
                                    name="radio-payment-group"
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChangePayment(e.target.value)}
                                    sx={{
                                        rowGap: 2,
                                        columnGap: 2,
                                        display: 'grid',
                                        gridTemplateColumns: {
                                            xs: 'repeat(1, 1fr)',
                                            sm: 'repeat(2, 1fr)',
                                        },
                                    }}
                                >
                                    {paymentOptions.map((payment) => (
                                        <FormControlLabel
                                            key={payment.value}
                                            value={payment.value}
                                            control={
                                                <Radio
                                                    disableRipple
                                                    checkedIcon={<IconifyIcon icon="carbon:checkmark-outline" />}
                                                    sx={{ mx: 1 }}
                                                />
                                            }
                                            label={
                                                <Stack spacing={0.5} sx={{ width: 1 }}>
                                                    <Stack direction="row" alignItems="center">
                                                        <IconifyIcon
                                                            icon={payment.type === 'VNPAY' ? 'carbon:wallet' : 'carbon:money'}
                                                            width={24}
                                                        />
                                                        <Typography variant="subtitle1" sx={{ flexGrow: 1, ml: 1 }}>
                                                            {payment.label}
                                                        </Typography>
                                                    </Stack>
                                                </Stack>
                                            }
                                            sx={{
                                                m: 0,
                                                py: 2,
                                                pr: 2,
                                                borderRadius: 1,
                                                border: (theme) => `solid 1px ${alpha(theme.palette.grey[500], 0.24)}`,
                                                ...(selectedPayment === payment.value && {
                                                    boxShadow: (theme) => `0 0 0 2px ${theme.palette.text.primary}`,
                                                }),
                                                [`& .${formControlLabelClasses.label}`]: { width: 1 },
                                            }}
                                        />
                                    ))}
                                </RadioGroup>
                            </Box>

                            {/* Step 4: Voucher */}
                            <Box>
                                <StepLabel title={t('voucher')} step="4" />
                                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <IconifyIcon icon="pepicons-pencil:ticket" color={theme.palette.customColors.main} />
                                        <Typography variant="subtitle1" sx={{ flexGrow: 1, ml: 1 }}>
                                            {t('sammi_voucher')}
                                        </Typography>
                                    </Stack>
                                    <Button variant="outlined" size="small"
                                        onClick={() => setOpenVoucher(true)}>
                                        {t('select_voucher')}
                                    </Button>
                                </Stack>
                            </Box>
                        </Stack>
                    </Grid>

                    {/* Order Summary */}
                    <Grid item xs={12} md={4}>
                        <Suspense fallback={<Spinner />}>
                            <CheckoutSummary
                                totalPrice={memoQueryProduct.totalPrice}
                                shippingPrice={memoShippingPrice}
                                voucherDiscount={voucherDiscount}
                                selectedProduct={cartData?.data}
                                onSubmit={handlePlaceOrder}
                            />
                        </Suspense>
                    </Grid>
                </Grid>
            </Stack>
        </Box>
    );
};

export default CheckoutPage;