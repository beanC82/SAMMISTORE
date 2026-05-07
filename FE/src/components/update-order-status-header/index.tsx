// ** MUI Imports
import { Button, IconButton, TextField } from '@mui/material'
import { Box, Typography } from '@mui/material'
import { styled, useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import IconifyIcon from '../Icon'
import { PaymentStatus, ShippingStatus } from 'src/configs/order'
import { useState } from 'react'
import { updateOrderStatus } from 'src/services/order'
import CustomAutocomplete from '../custom-autocomplete'
import { AutocompleteOption } from '../custom-autocomplete'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'
import { RootState } from 'src/stores'

const StyledTableHeader = styled(Box)(({ theme }) => ({
    borderRadius: "15px",
    border: `1px solid ${theme.palette.customColors.borderColor}`,
    padding: "8px 10px",
    width: "100%",
    marginBottom: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
}))

type TProp = {
    selectedRowNumber?: number,
    onClear: () => void,
    actions: { label: string, value: string, disabled?: boolean }[],
    handleAction: (type: string) => void,
    selectedRows?: number[],
    onRefresh?: () => void
}

const UpdateOrderStatusHeader = (props: TProp) => {
    //Props
    const { selectedRowNumber, onClear, actions, handleAction, selectedRows, onRefresh } = props

    const { isSuccessUpdateStatus, errorMessageUpdateStatus } = useSelector((state: RootState) => state.receipt)

    // ** Hook
    const theme = useTheme()
    const { t } = useTranslation()

    // ** State
    const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<AutocompleteOption | null>(null)
    const [selectedShippingStatus, setSelectedShippingStatus] = useState<AutocompleteOption | null>(null)

    // ** Handler
    const handlePaymentStatusChange = (newValue: AutocompleteOption | null) => {
        setSelectedPaymentStatus(newValue)
    }

    const handleShippingStatusChange = (newValue: AutocompleteOption | null) => {
        setSelectedShippingStatus(newValue)
    }

    const handleApplyStatus = async () => {
        if (selectedPaymentStatus && selectedShippingStatus && selectedRows && selectedRows.length > 0) {
            const res: any = await updateOrderStatus({
                orderId: selectedRows[0],
                paymentStatus: parseInt(selectedPaymentStatus.value as string),
                shippingStatus: parseInt(selectedShippingStatus.value as string)
            })
            if (res?.data?.isSuccess === true) {
                onRefresh && onRefresh()
                toast.success(t("order_status_updated_successfully"))
                onClear()
                setSelectedPaymentStatus(null)
                setSelectedShippingStatus(null)
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
        <StyledTableHeader>
            <Box sx={{
                display: "flex",
                alignItems: "center",
                gap: "6px"
            }}>
                <Typography>{t("selected_row")}</Typography>
                <Typography
                    sx={{
                        fontWeight: 600,
                        fontSize: "12px !important",
                        backgroundColor: theme.palette.primary.main,
                        height: "20px",
                        width: "20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "50%",
                        color: theme.palette.customColors.lightPaperBg
                    }}
                >
                    <span>{selectedRowNumber}</span>
                </Typography>
            </Box>
            <Box sx={{
                display: "flex",
                alignItems: "center",
                gap: "6px"
            }}>
                {selectedRowNumber && selectedRowNumber > 0 && (
                    <>
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
                    </>
                )}
                {actions?.map((action) => {
                    return (
                        <Button disabled={action?.disabled} key={action.value} variant="contained" onClick={() => handleAction(action.value)}>
                            {action.label}
                        </Button>
                    )
                })}
                <IconButton onClick={onClear}>
                    <IconifyIcon icon="material-symbols-light:close-rounded" fontSize={"20px"} />
                </IconButton>
            </Box>
        </StyledTableHeader>
    )
}

export default UpdateOrderStatusHeader
