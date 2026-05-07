"use client"

//React
import React, { useEffect, useState } from 'react'

//Next
import { NextPage } from 'next'

//MUI
import { Box, IconButton, Typography, Container, Stack, Divider, useTheme, Button } from '@mui/material'

//Translate
import { useTranslation } from 'react-i18next'

//Redux
import { AppDispatch, RootState } from 'src/stores'
import { useDispatch, useSelector } from 'react-redux'

//Other
import { useAuth } from 'src/hooks/useAuth'
import { TItemOrderProduct, TOrderDetail, TOrderItem } from 'src/types/order'
import { useRouter } from 'next/router'
import Spinner from 'src/components/spinner'
import { toast } from 'react-toastify'
import { resetInitialState, updateProductToCart } from 'src/stores/order'
import { resetInitialState as resetReview } from 'src/stores/review'
import IconifyIcon from 'src/components/Icon'
import { convertUpdateMultipleProductsCard, formatDate, formatPrice } from 'src/utils'
import { getMyOrderDetail, getOrderDetail } from 'src/services/order'
import WriteReviewModal from './components/WriteReviewModal'
import { createVNPayPaymentUrl } from 'src/services/payment'
import { PAYMENT_METHOD } from 'src/configs/payment'
import { OrderStatus, PaymentStatus, ShippingStatus } from 'src/configs/order'
import Image from 'src/components/image'
import StepLabel from 'src/components/step-label'
import OrderStatusStepper from './components/OrderStatusStepper'
import Link from 'next/link'

type TProps = {}

const getPaymentStatus = (status: string) => {
    return Object.values(PaymentStatus).find(item => item.label === status)?.title || ''
}

const getShippingStatus = (status: string) => {
    return Object.values(ShippingStatus).find(item => item.label === status)?.title || ''
}

const getOrderStatus = (status: string) => {
    return Object.values(OrderStatus).find(item => item.label === status)?.title || ''
}

const MyOrderDetailPage: NextPage<TProps> = () => {
    //States
    const [orderData, setOrderData] = useState<TOrderItem>({} as any)
    const [isLoading, setIsLoading] = useState(false)
    const [openReview, setOpenReview] = useState({
        open: false,
        userId: 0,
        productId: 0
    })
    const [openCancelDialog, setOpenCancelDialog] = useState<boolean>(false)
    const paymentData = PAYMENT_METHOD()

    //hooks
    const { user } = useAuth()
    const { t, i18n } = useTranslation()
    const router = useRouter()

    //Theme
    const theme = useTheme()

    //Dispatch
    const dispatch: AppDispatch = useDispatch()
    const { isSuccessCancel, details, isErrorCancel, errorMessageCancel } = useSelector((state: RootState) => state.order)
    const { isSuccessCreate, isErrorCreate, errorMessageCreate, isLoading: reviewLoading } = useSelector((state: RootState) => state.review)

    const orderId = typeof router.query.orderId === 'string' ? +router.query.orderId : 0
    const orderCode = typeof router.query.orderCode === 'string' ? router.query.orderCode : ''

    //Fetch API
    const handleGetOrderDetail = async () => {
        setIsLoading(true)
        await getMyOrderDetail(orderCode).then((res) => {
            setIsLoading(false)
            setOrderData(res?.result)
        })
    }

    const handlePaymentMethod = (type: string) => {
        switch (type) {
            case paymentData.VN_PAYMENT.value: {
                handlePaymentVNPay()
                break
            }
            default:
                break
        }
    }

    const handlePaymentVNPay = async () => {
        setIsLoading(true)
        await createVNPayPaymentUrl({
            totalPrice: orderData.totalPrice,
            orderId: orderData.id,
            language: i18n.language === "vi" ? "vn" : i18n.language
        }).then((res) => {
            if (res.data) {
                window.open(res.data, "_blank", "noopener,noreferrer")
            }
            setIsLoading(false)
        })
    }

    useEffect(() => {
        if (orderCode) {
            handleGetOrderDetail()
        }
    }, [orderCode])

    useEffect(() => {
        if (isSuccessCancel) {
            toast.success(t("cancel_order_success"))
            handleGetOrderDetail()
            dispatch(resetInitialState())
        } else if (isErrorCancel && errorMessageCancel) {
            toast.error(errorMessageCancel)
            dispatch(resetInitialState())
        }
    }, [isSuccessCancel, isErrorCancel, errorMessageCancel])

    useEffect(() => {
        if (isSuccessCreate) {
            toast.success(t("create_review_success"))
            handleGetOrderDetail()
            dispatch(resetReview())
            setOpenReview({ open: false, userId: 0, productId: 0 })
        } else if (isErrorCreate && errorMessageCreate) {
            toast.error(errorMessageCreate)
            dispatch(resetReview())
        }
    }, [isSuccessCreate, isErrorCreate, errorMessageCreate])

    return (
        <>
            {isLoading && <Spinner />}
            <WriteReviewModal
                open={openReview.open}
                orderId={orderId}
                orderDetails={orderData?.details || []}
                onClose={() => setOpenReview({ open: false, userId: 0, productId: 0 })}
            />
            <Container maxWidth="lg">
                <Stack spacing={3}>
                    {/* Order Status Stepper */}
                    <OrderStatusStepper
                        orderStatus={orderData?.orderStatus}
                    />
                    <Box
                        sx={{
                            p: 3,
                            borderRadius: 1,
                            backgroundColor: theme.palette.background.paper,
                        }}
                    >
                        <StepLabel step="1" title={t('customer_information')} />
                        <Stack spacing={2} sx={{ mt: 3 }}>
                            <Stack spacing={1} direction="row" alignItems="center">
                                <Typography variant="subtitle2" fontWeight="bold">
                                    {t('customer_name')}:
                                </Typography>
                                <Typography variant="body2">
                                    {orderData?.customerName}
                                </Typography>
                            </Stack>

                            <Stack spacing={1} direction="row" alignItems="center">
                                <Typography variant="subtitle2" fontWeight='bold'>
                                    {t('phone')}:
                                </Typography>
                                <Typography variant="body2">
                                    {orderData?.phoneNumber}
                                </Typography>
                            </Stack>

                            <Stack spacing={1} direction="row" alignItems="center">
                                <Typography variant="subtitle2" fontWeight='bold'>
                                    {t('address')}:
                                </Typography>
                                <Typography variant="body2">
                                    {orderData?.customerAddress}
                                </Typography>
                            </Stack>
                        </Stack>
                    </Box>

                    <Box
                        sx={{
                            p: 3,
                            borderRadius: 1,
                            backgroundColor: theme.palette.background.paper,
                        }}
                    >
                        <StepLabel step="2" title={t('order_information')} />
                        <Stack spacing={2} sx={{ mt: 3 }}>
                            {orderData?.details?.map((item: TOrderDetail, index: number) => (
                                <Stack key={index} direction="row" alignItems="center" spacing={2}>
                                    <Image
                                        src={item.imageUrl || '/public/svgs/placeholder.svg'}
                                        sx={{ width: 64, height: 64, borderRadius: 1.5 }}
                                    />
                                    <Stack spacing={0.5} flexGrow={1}>
                                        <Link href={`/product/${item.productId}`} passHref style={{ textDecoration: 'none', color: 'inherit' }}>
                                            <Typography
                                                variant="subtitle2"
                                                sx={{
                                                    '&:hover': {
                                                        color: 'primary.main',
                                                        cursor: 'pointer'
                                                    },
                                                    transition: 'color 0.3s ease'
                                                }}
                                            >
                                                {item.productName}
                                            </Typography>
                                        </Link>
                                        <Typography variant="body2">
                                            x{item.quantity}
                                        </Typography>
                                    </Stack>

                                    <Typography variant="subtitle2">
                                        {formatPrice(item.price)}
                                    </Typography>
                                </Stack>
                            ))}

                            <Divider sx={{ borderStyle: 'dashed' }} />

                            <Stack spacing={1} sx={{ typography: 'body2' }}>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body2">{t('subtotal')}</Typography>
                                    <Typography variant="subtitle2">
                                        {formatPrice(orderData?.totalPrice)}
                                    </Typography>
                                </Stack>

                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body2">
                                        {t('shipping_price')}
                                    </Typography>
                                    <Typography variant="subtitle2">{formatPrice(orderData?.costShip || 0)}</Typography>
                                </Stack>

                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body2">{t('discount')}</Typography>
                                    <Typography variant="subtitle2">
                                        {formatPrice(orderData?.discount || 0)}
                                    </Typography>
                                </Stack>

                                <Divider sx={{ borderStyle: 'dashed' }} />

                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="subtitle1" fontWeight='bold'>{t('total')}</Typography>
                                    <Typography variant="subtitle1" fontWeight='bold'>
                                        {formatPrice(orderData?.totalPrice + (orderData?.costShip || 0) - (orderData?.discount || 0))}
                                    </Typography>
                                </Stack>
                            </Stack>
                        </Stack>
                    </Box>

                    <Box
                        sx={{
                            p: 3,
                            backgroundColor: theme.palette.background.paper,
                            borderRadius: 1,
                        }}
                    >
                        <StepLabel step="3" title={t('payment_delivery_information')} />
                        <Stack spacing={2} sx={{ mt: 3 }}>
                            <Stack spacing={1} direction="row" alignItems="center">
                                <Typography variant="subtitle2" fontWeight='bold'>{t('order_code')}: </Typography>
                                <Typography variant="body2">
                                    {orderCode}
                                </Typography>
                            </Stack>
                            <Stack spacing={1} direction="row" alignItems="center">
                                <Typography variant="subtitle2" fontWeight='bold'>{t('payment_method')}: </Typography>
                                <Typography variant="body2">
                                    {orderData?.paymentMethod}
                                </Typography>
                            </Stack>

                            <Stack spacing={1} direction="row" alignItems="center">
                                <Typography variant="subtitle2" fontWeight='bold'>{t('payment_status')}: </Typography>
                                <Typography variant="body2">
                                    {t(getPaymentStatus(orderData?.paymentStatus))}
                                </Typography>
                            </Stack>

                            <Stack spacing={1} direction="row" alignItems="center">
                                <Typography variant="subtitle2" fontWeight='bold'>{t('delivery_method')}: </Typography>
                                <Typography variant="body2">{orderData?.deliveryMethod || 'GHN'}</Typography>
                            </Stack>

                            <Stack spacing={1} direction="row" alignItems="center">
                                <Typography variant="subtitle2" fontWeight='bold'>{t('delivery_status')}: </Typography>
                                <Typography variant="body2">
                                    {t(getShippingStatus(orderData?.shippingStatus))}
                                </Typography>
                            </Stack>

                            <Stack spacing={1} direction="row" alignItems="center">
                                <Typography variant="subtitle2" fontWeight='bold'>{t('order_status')}: </Typography>
                                <Typography variant="body2">
                                    {t(getOrderStatus(orderData?.orderStatus))}
                                </Typography>
                            </Stack>
                        </Stack>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        {(orderData?.orderStatus === OrderStatus.Pending.label
                            || orderData?.orderStatus === OrderStatus.WaitingForPayment.label) &&
                            orderData?.paymentStatus !== PaymentStatus.Paid.label
                            && orderData?.paymentMethod === 'VNPay' && (
                                <Button
                                    variant="contained"
                                    color='error'
                                    onClick={() => handlePaymentMethod(orderData.paymentMethod)}
                                    startIcon={<IconifyIcon icon="tabler:device-ipad-cancel" />}
                                >
                                    {t('go_to_payment')}
                                </Button>
                            )}
                        {(orderData?.orderStatus === OrderStatus.WaitingForPayment.label || orderData?.orderStatus === OrderStatus.Pending.label) &&
                            orderData?.paymentMethod !== 'VNPay' && (
                                <Button
                                    variant="contained"
                                    color='error'
                                    onClick={() => setOpenCancelDialog(true)}
                                    startIcon={<IconifyIcon icon="tabler:device-ipad-cancel" />}
                                >
                                    {t('cancel_order')}
                                </Button>
                            )}
                        {orderData?.orderStatus === OrderStatus.Completed.label &&
                            (
                                <Button
                                    variant="contained"
                                    color='primary'
                                    startIcon={<IconifyIcon icon="fluent:stack-star-16-regular" />}
                                    onClick={() => setOpenReview({
                                        open: true,
                                        userId: user?.id || 0,
                                        productId: orderData?.details?.[0]?.productId || 0
                                    })}
                                >
                                    {t('rate_product')}
                                </Button>
                            )
                        }
                    </Box>
                </Stack>
            </Container>
        </>
    )
}

export default MyOrderDetailPage
