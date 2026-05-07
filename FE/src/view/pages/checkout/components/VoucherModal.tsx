import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Stack,
    Typography,
    IconButton,
    Button,
    Box,
    TextField,
    Divider,
    useTheme,
    DialogActions,
    Radio,
    RadioGroup
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import IconifyIcon from 'src/components/Icon';
import { useDispatch, useSelector } from 'react-redux';
import { applyVoucher, fetchListApplyVoucher } from 'src/services/voucher';
import { TParamsVouchers } from 'src/types/voucher';
import { toast } from 'react-toastify';
import { alpha } from '@mui/material/styles';

type VoucherModalProps = {
    open: boolean;
    onClose: () => void;
    onSelectVoucher: (voucherId: number) => void;
    cartDetails?: Array<{
        productId: number;
        discount: number;
        quantity: number;
        price: number;
        productName: string;
    }>;
};

const VoucherModal = ({ open, onClose, onSelectVoucher, cartDetails }: VoucherModalProps) => {

    //Hook
    const { t } = useTranslation();
    const theme = useTheme();

    //Redux
    const dispatch = useDispatch();

    //State
    const [vouchers, setVouchers] = useState([]);
    const [selectedVoucher, setSelectedVoucher] = useState(0);
    const [loading, setLoading] = useState(false);
    const [voucherCode, setVoucherCode] = useState('');
    const [applyLoading, setApplyLoading] = useState(false);

    const fetchVouchers = async () => {
        setLoading(true);
        const formattedDetails = {
            details: cartDetails?.map(item => ({
                cartId: 0,
                productId: Number(item.productId),
                productName: item.productName,
                price: Number(item.price),
                quantity: Number(item.quantity),
            })) || []
        };
        await fetchListApplyVoucher(formattedDetails)
            .then((res) => {
                const data = res?.result
                if (data) {
                    setVouchers(data);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        fetchVouchers();
    }, []);

    const validVouchers = vouchers.filter((voucher: TParamsVouchers) => voucher.isValid);
    const invalidVouchers = vouchers.filter((voucher: TParamsVouchers) => !voucher.isValid);

    const handleApplyVoucher = async () => {
        if (!voucherCode.trim()) return;
        setApplyLoading(true);
        try {
            const formattedDetails = {
                details: cartDetails?.map(item => ({
                    cartId: 1,
                    productId: Number(item.productId),
                    productName: item.productName,
                    price: Number(item.price),
                    quantity: Number(item.quantity),
                })) || []
            };

            const response = await applyVoucher(voucherCode, formattedDetails);
            if (response?.isSuccess) {
                toast.success(t('apply_voucher_success'));
                fetchVouchers();
            } else {
                toast.error(response?.message);
            }
        } catch (error) {
            toast.error(t('apply_voucher_error'));
        } finally {
            setApplyLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="h6">{t('select_voucher')}</Typography>
                    <IconButton onClick={onClose}>
                        <IconifyIcon icon="material-symbols:close" />
                    </IconButton>
                </Stack>
            </DialogTitle>

            <DialogContent>
                <Stack spacing={3}>
                    <Stack direction="row" spacing={1}>
                        <TextField
                            fullWidth
                            placeholder={t('enter_voucher_code')}
                            size="small"
                            value={voucherCode}
                            onChange={(e) => setVoucherCode(e.target.value)}
                        />
                        <Button
                            variant="contained"
                            sx={{ textWrap: 'nowrap' }}
                            onClick={handleApplyVoucher}
                            disabled={!voucherCode.trim() || applyLoading}
                        >
                            {applyLoading ? t('applying...') : t('apply_voucher')}
                        </Button>
                    </Stack>

                    <Divider />

                    {/* Available Vouchers */}
                    <Stack spacing={2}>
                        <Typography variant="subtitle1">{t('sammi_voucher')}</Typography>

                        <RadioGroup
                            value={selectedVoucher}
                            onChange={(e) => {
                                const selectedId = Number(e.target.value);
                                setSelectedVoucher(selectedId);
                                onSelectVoucher(selectedId);
                            }}
                        >
                            {/* Valid Vouchers */}
                            {validVouchers.length > 0 && (
                                <Stack spacing={2}>
                                    <Typography variant="subtitle2" color="success.main">
                                        {t('valid_vouchers')}
                                    </Typography>
                                    {validVouchers.map((voucher: TParamsVouchers) => (
                                        <Box
                                            key={voucher.id}
                                            onClick={() => {
                                                setSelectedVoucher(voucher.voucherId);
                                                onSelectVoucher(voucher.voucherId);
                                            }}
                                            sx={{
                                                p: 2,
                                                border: `1px solid ${theme.palette.divider}`,
                                                borderRadius: 1,
                                                cursor: 'pointer',
                                                position: 'relative',
                                                '&:hover': {
                                                    borderColor: theme.palette.primary.main,
                                                }
                                            }}
                                        >
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    position: 'absolute',
                                                    top: 8,
                                                    right: 8,
                                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                    color: 'primary.main',
                                                    px: 1,
                                                    py: 0.5,
                                                    borderRadius: 1
                                                }}
                                            >
                                                x{voucher.usageLimit}
                                            </Typography>
                                            <Stack direction="row" alignItems="center" spacing={2}>
                                                <IconifyIcon
                                                    icon="pepicons-pencil:ticket"
                                                    width={40}
                                                    color={theme.palette.primary.main}
                                                />
                                                <Stack spacing={0.5} flex={1}>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                                        {voucher.discountTypeId === 3 ? t('free_shipping') : `${t('discount')} ${voucher.discountValue}đ`}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {t('minimum_order')}: {voucher.conditions?.[0]?.conditionValue || 0}đ
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                                                        HSD: {new Date(voucher.endDate).toLocaleDateString()}
                                                    </Typography>
                                                </Stack>
                                                <Radio
                                                    checked={selectedVoucher === voucher.voucherId} 
                                                    value={voucher.voucherId}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </Stack>
                                        </Box>
                                    ))}
                                </Stack>
                            )}

                            {/* Invalid Vouchers */}
                            {invalidVouchers.length > 0 && (
                                <Stack spacing={2} sx={{ mt: 2 }}>
                                    <Typography variant="subtitle2" color="error.main">
                                        {t('invalid_vouchers')}
                                    </Typography>
                                    {invalidVouchers.map((voucher: TParamsVouchers) => (
                                        <Box
                                            key={voucher.id}
                                            sx={{
                                                p: 2,
                                                border: `1px solid ${theme.palette.divider}`,
                                                borderRadius: 1,
                                                opacity: 0.5,
                                                pointerEvents: 'none',
                                                position: 'relative'
                                            }}
                                        >
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    position: 'absolute',
                                                    top: 8,
                                                    right: 8,
                                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                    color: 'primary.main',
                                                    px: 1,
                                                    py: 0.5,
                                                    borderRadius: 1,
                                                    opacity: 0.5
                                                }}
                                            >
                                                x{voucher.usageLimit}
                                            </Typography>
                                            <Stack direction="row" alignItems="center" spacing={2}>
                                                <IconifyIcon
                                                    icon="pepicons-pencil:ticket"
                                                    width={40}
                                                    color={theme.palette.text.disabled}
                                                />
                                                <Stack spacing={0.5} flex={1}>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }} color="text.disabled">
                                                        {voucher.discountTypeId === 3 ? t('free_shipping') : `${t('discount')} ${voucher.discountValue}đ`}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.disabled">
                                                        {t('minimum_order')}: {voucher.conditions?.[0]?.conditionValue || 0}đ
                                                    </Typography>
                                                    <Typography variant="caption" color="text.disabled" sx={{ mt: 1 }}>
                                                        HSD: {new Date(voucher.endDate).toLocaleDateString()}
                                                    </Typography>
                                                </Stack>
                                            </Stack>
                                        </Box>
                                    ))}
                                </Stack>
                            )}
                        </RadioGroup>

                    </Stack>
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} variant="outlined" color="inherit">
                    {t('cancel')}
                </Button>
                <Button variant="contained" disabled={!selectedVoucher}
                    onClick={() => {
                        onSelectVoucher(Number(selectedVoucher));
                        onClose();
                    }}>
                    {t('confirm')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default VoucherModal;
