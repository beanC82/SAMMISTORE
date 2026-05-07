import React from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, OutlinedInput, SelectChangeEvent, IconButton } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { TFilter } from 'src/configs/filter';
import ClearIcon from '@mui/icons-material/Clear';

interface OrderFilterProps {
    onFilterChange: (filters: TFilter[]) => void;
}

const OrderFilter: React.FC<OrderFilterProps> = ({ onFilterChange }) => {
    const { t } = useTranslation();
    const [orderStatus, setOrderStatus] = React.useState<string>('');
    const [paymentStatus, setPaymentStatus] = React.useState<string>('');
    const [shippingStatus, setShippingStatus] = React.useState<string>('');

    const orderStatusOptions = [
        { value: 'Pending', label: t('pending') },
        { value: 'WaitingForPayment', label: t('waiting_for_payment') },
        { value: 'Processing', label: t('processing') },
        { value: 'Completed', label: t('completed') },
        { value: 'Cancelled', label: t('cancelled') },
    ];

    const paymentStatusOptions = [
        { value: 'Pending', label: t('pending') },
        { value: 'Unpaid', label: t('unpaid') },
        { value: 'Paid', label: t('paid') },
        { value: 'Failed', label: t('failed') },
    ];

    const shippingStatusOptions = [
        { value: 'NotShipped', label: t('not_shipped') },
        { value: 'Processing', label: t('processing') },
        { value: 'Delivered', label: t('delivered') },
        { value: 'Lost', label: t('lost') },
    ];

    const handleOrderStatusChange = (event: SelectChangeEvent) => {
        const value = event.target.value;
        setOrderStatus(value);
        // Create filters immediately
        const filters: TFilter[] = [];
        if (value) {
            filters.push({
                field: 'orderStatus',
                operator: 'eq',
                value: value
            });
        }
        // Add other existing filters
        if (paymentStatus) {
            filters.push({
                field: 'paymentStatus',
                operator: 'eq',
                value: paymentStatus
            });
        }
        if (shippingStatus) {
            filters.push({
                field: 'shippingStatus',
                operator: 'eq',
                value: shippingStatus
            });
        }
        onFilterChange(filters);
    };

    const handleClearOrderStatus = () => {
        setOrderStatus('');
        const filters: TFilter[] = [];
        if (paymentStatus) {
            filters.push({
                field: 'paymentStatus',
                operator: 'eq',
                value: paymentStatus
            });
        }
        if (shippingStatus) {
            filters.push({
                field: 'shippingStatus',
                operator: 'eq',
                value: shippingStatus
            });
        }
        onFilterChange(filters);
    };

    const handlePaymentStatusChange = (event: SelectChangeEvent) => {
        const value = event.target.value;
        setPaymentStatus(value);
        // Create filters immediately
        const filters: TFilter[] = [];
        if (value) {
            filters.push({
                field: 'paymentStatus',
                operator: 'eq',
                value: value
            });
        }
        // Add other existing filters
        if (orderStatus) {
            filters.push({
                field: 'orderStatus',
                operator: 'eq',
                value: orderStatus
            });
        }
        if (shippingStatus) {
            filters.push({
                field: 'shippingStatus',
                operator: 'eq',
                value: shippingStatus
            });
        }
        onFilterChange(filters);
    };

    const handleClearPaymentStatus = () => {
        setPaymentStatus('');
        const filters: TFilter[] = [];
        if (orderStatus) {
            filters.push({
                field: 'orderStatus',
                operator: 'eq',
                value: orderStatus
            });
        }
        if (shippingStatus) {
            filters.push({
                field: 'shippingStatus',
                operator: 'eq',
                value: shippingStatus
            });
        }
        onFilterChange(filters);
    };

    const handleShippingStatusChange = (event: SelectChangeEvent) => {
        const value = event.target.value;
        setShippingStatus(value);
        // Create filters immediately
        const filters: TFilter[] = [];
        if (value) {
            filters.push({
                field: 'shippingStatus',
                operator: 'eq',
                value: value
            });
        }
        // Add other existing filters
        if (orderStatus) {
            filters.push({
                field: 'orderStatus',
                operator: 'eq',
                value: orderStatus
            });
        }
        if (paymentStatus) {
            filters.push({
                field: 'paymentStatus',
                operator: 'eq',
                value: paymentStatus
            });
        }
        onFilterChange(filters);
    };

    const handleClearShippingStatus = () => {
        setShippingStatus('');
        const filters: TFilter[] = [];
        if (orderStatus) {
            filters.push({
                field: 'orderStatus',
                operator: 'eq',
                value: orderStatus
            });
        }
        if (paymentStatus) {
            filters.push({
                field: 'paymentStatus',
                operator: 'eq',
                value: paymentStatus
            });
        }
        onFilterChange(filters);
    };

    return (
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'nowrap', p: 2 }}>

            <FormControl sx={{
                minWidth: 200,
                '& .MuiOutlinedInput-root': { height: 40 },
                '& .MuiInputLabel-root': {
                    top: -6
                }
            }}>
                <InputLabel>{t('payment_status')}</InputLabel>
                <Select<string>
                    value={paymentStatus}
                    onChange={handlePaymentStatusChange}
                    input={<OutlinedInput label={t('payment_status')} />}
                    endAdornment={
                        paymentStatus && (
                            <IconButton
                                size="small"
                                onClick={handleClearPaymentStatus}
                                sx={{ position: 'absolute', right: 30 }}
                            >
                                <ClearIcon fontSize="small" />
                            </IconButton>
                        )
                    }
                    sx={{
                        '& .MuiSelect-select': {
                            textAlign: paymentStatus ? 'left' : 'center'
                        }
                    }}
                >
                    {paymentStatusOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl sx={{
                minWidth: 200,
                '& .MuiOutlinedInput-root': { height: 40 },
                '& .MuiInputLabel-root': {
                    top: -6
                }
            }}>
                <InputLabel>{t('shipping_status')}</InputLabel>
                <Select<string>
                    value={shippingStatus}
                    onChange={handleShippingStatusChange}
                    input={<OutlinedInput label={t('shipping_status')} />}
                    endAdornment={
                        shippingStatus && (
                            <IconButton
                                size="small"
                                onClick={handleClearShippingStatus}
                                sx={{ position: 'absolute', right: 30 }}
                            >
                                <ClearIcon fontSize="small" />
                            </IconButton>
                        )
                    }
                    sx={{
                        '& .MuiSelect-select': {
                            textAlign: shippingStatus ? 'left' : 'center'
                        }
                    }}
                >
                    {shippingStatusOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl sx={{
                minWidth: 200,
                '& .MuiOutlinedInput-root': { height: 40 },
                '& .MuiInputLabel-root': {
                    top: -6
                }
            }}>
                <InputLabel>{t('order_status')}</InputLabel>
                <Select<string>
                    value={orderStatus}
                    onChange={handleOrderStatusChange}
                    input={<OutlinedInput label={t('order_status')} />}
                    endAdornment={
                        orderStatus && (
                            <IconButton
                                size="small"
                                onClick={handleClearOrderStatus}
                                sx={{ position: 'absolute', right: 30 }}
                            >
                                <ClearIcon fontSize="small" />
                            </IconButton>
                        )
                    }
                    sx={{
                        '& .MuiSelect-select': {
                            textAlign: orderStatus ? 'left' : 'center'
                        }
                    }}
                >
                    {orderStatusOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    );
};

export default OrderFilter;
