//react
import { useEffect, useState } from "react"

//Mui
import { Box, IconButton, Grid, Typography, Container, Stack, Divider, alpha, useTheme, Button } from "@mui/material"

//components
import IconifyIcon from "src/components/Icon"
import Spinner from "src/components/spinner"
import CustomAutocomplete from "src/components/custom-autocomplete"
import { AutocompleteOption } from "src/components/custom-autocomplete"

//services
import { getManageOrderDetail, updateOrderStatus } from "src/services/order";

//translation
import { useTranslation } from "react-i18next"
import { formatPrice } from "src/utils"
import Image from "src/components/image"
import StepLabel from "src/components/step-label";
import { PaymentStatus, ShippingStatus, OrderStatus } from "src/configs/order"
import { toast } from "react-toastify"

interface TOrderDetail {
    id: number
    onClose: () => void
    onRefresh?: () => void
}

type StepLabelProps = {
    step: string;
    title: string;
};

const getPaymentStatus = (status: string) => {
    return Object.values(PaymentStatus).find(item => item.label === status)?.title || ''
}

const getShippingStatus = (status: string) => {
    return Object.values(ShippingStatus).find(item => item.label === status)?.title || ''
}

const getOrderStatus = (status: string) => {
    return Object.values(OrderStatus).find(item => item.label === status)?.title || ''
}

const OrderDetail = (props: TOrderDetail) => {
    //state
    const [loading, setLoading] = useState(false)
    const [orderData, setOrderData] = useState<any>(null)
    const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<AutocompleteOption | null>(null)
    const [selectedShippingStatus, setSelectedShippingStatus] = useState<AutocompleteOption | null>(null)

    //props
    const { id, onClose, onRefresh } = props

    //translation
    const { t } = useTranslation()

    //theme
    const theme = useTheme()

    const fetchOrderDetail = async (id: number) => {
        setLoading(true)
        await getManageOrderDetail(id).then((res) => {
            const data = res?.result
            if (data) {
                setOrderData(data)
                // Set initial values for autocomplete
                const paymentStatus = Object.values(PaymentStatus).find(item => item.label === data.paymentStatus)
                const shippingStatus = Object.values(ShippingStatus).find(item => item.label === data.shippingStatus)
                if (paymentStatus) {
                    setSelectedPaymentStatus({
                        label: t(paymentStatus.title),
                        value: paymentStatus.value.toString()
                    })
                }
                if (shippingStatus) {
                    setSelectedShippingStatus({
                        label: t(shippingStatus.title),
                        value: shippingStatus.value.toString()
                    })
                }
            }
            setLoading(false)
        }).catch(() => {
            setLoading(false)
        })
    }

    useEffect(() => {
        if (id) {
            fetchOrderDetail(id)
        }
    }, [id])

    const handlePaymentStatusChange = (newValue: AutocompleteOption | null) => {
        setSelectedPaymentStatus(newValue)
    }

    const handleShippingStatusChange = (newValue: AutocompleteOption | null) => {
        setSelectedShippingStatus(newValue)
    }

    const handleApplyStatus = async () => {
        if (selectedPaymentStatus && selectedShippingStatus) {
            const res: any = await updateOrderStatus({
                orderId: id,
                paymentStatus: parseInt(selectedPaymentStatus.value as string),
                shippingStatus: parseInt(selectedShippingStatus.value as string)
            })
            if (res?.data?.isSuccess === true) {
                toast.success(t("order_status_updated_successfully"))
                onClose()
                if (onRefresh) {
                    onRefresh()
                }
            } else {
                toast.error(res?.message)
            }
        }
    }

    // Convert status objects to autocomplete options
    const paymentStatusOptions = Object.values(PaymentStatus).map(status => ({
        label: t(status.title),
        value: status.value.toString()
    }))

    const shippingStatusOptions = Object.values(ShippingStatus).map(status => ({
        label: t(status.title),
        value: status.value.toString()
    }))

    return (
        <>
            {loading && <Spinner />}
            <Container maxWidth="lg">
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <CustomAutocomplete
                        options={paymentStatusOptions}
                        value={selectedPaymentStatus}
                        onChange={handlePaymentStatusChange}
                        label={t("payment_status")}
                        sx={{ width: 200 }}
                    />
                    <CustomAutocomplete
                        options={shippingStatusOptions}
                        value={selectedShippingStatus}
                        onChange={handleShippingStatusChange}
                        label={t("shipping_status")}
                        sx={{ width: 200 }}
                    />
                    <Button
                        variant="contained"
                        onClick={handleApplyStatus}
                        disabled={!selectedPaymentStatus || !selectedShippingStatus}
                    >
                        {t("apply")}
                    </Button>
                </Stack>

                <Stack spacing={3}>
                    <Box
                        sx={{
                            p: 3,
                            borderRadius: 1,
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
                        }}
                    >
                        <StepLabel step="2" title={t('order_information')} />
                        <Stack spacing={2} sx={{ mt: 3 }}>
                            {orderData?.details?.map((item: any, index: number) => (
                                <Stack key={index} direction="row" alignItems="center" spacing={2}>
                                    <Image
                                        src={item.imageUrl || '/public/svgs/placeholder.svg'}
                                        sx={{ width: 64, height: 64, borderRadius: 1.5 }}
                                    />
                                    <Stack spacing={0.5} flexGrow={1}>
                                        <Typography variant="subtitle2">
                                            {item.productName}
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
                                    <Typography variant="body2" color="text.primary" fontWeight='bold'>{t('subtotal')}</Typography>
                                    <Typography variant="subtitle2">
                                        {formatPrice(orderData?.totalPrice)}
                                    </Typography>
                                </Stack>

                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body2" color="text.primary" fontWeight='bold'>
                                        {t('shipping_price')}
                                    </Typography>
                                    <Typography variant="subtitle2">{formatPrice(orderData?.shippingFee || 0)}</Typography>
                                </Stack>

                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body2" color="text.primary" fontWeight='bold'>
                                        {t('discount')}
                                    </Typography>
                                    <Typography variant="subtitle2">
                                        {formatPrice(orderData?.discount || 0)}
                                    </Typography>
                                </Stack>

                                <Divider sx={{ borderStyle: 'dashed' }} />

                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="subtitle1" fontWeight='bold'>{t('total')}</Typography>
                                    <Typography variant="subtitle1" fontWeight='bold'>
                                        {formatPrice(orderData?.totalPrice + (orderData?.shippingFee || 0) - (orderData?.discount || 0))}
                                    </Typography>
                                </Stack>
                            </Stack>
                        </Stack>
                    </Box>

                    <Box
                        sx={{
                            p: 3,
                            bgcolor: 'background.neutral',
                            borderRadius: 1,
                        }}
                    >
                        <StepLabel step="3" title={t('payment_delivery_information')} />
                        <Stack spacing={2} sx={{ mt: 3 }}>
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
                </Stack>
            </Container>
        </>
    )
}

export default OrderDetail