import React, { useEffect, useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Chip,
    Divider,
    useTheme,
    CircularProgress,
    Stack,
    Alert,
    IconButton,
    Tooltip
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { getMyVouchers } from 'src/services/voucher';
import IconifyIcon from 'src/components/Icon';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

interface Voucher {
    id: number;
    code: string;
    name: string;
    discountTypeId: number;
    discountName: string | null;
    eventId: number;
    eventName: string | null;
    discountValue: number;
    usageLimit: number;
    usedCount: number;
    startDate: string;
    endDate: string;
    conditions: any | null;
    createdDate: string;
    updatedDate: string;
    createdBy: string;
    updatedBy: string;
    isActive: boolean;
    isDeleted: boolean;
    displayOrder: number;
}

const MyVouchersPage = () => {
    const { t } = useTranslation();
    const theme = useTheme();
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchMyVouchers();
    }, []);

    const fetchMyVouchers = async () => {
        setLoading(true);
        try {
            const response = await getMyVouchers({ params: {} });
            if (response.isSuccess) {
                setVouchers(response.result);
            } else {
                setError(response.message || t('error_fetching_vouchers'));
            }
        } catch (err) {
            setError(t('error_fetching_vouchers'));
            console.error('Error fetching vouchers:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
        } catch (error) {
            return dateString;
        }
    };

    const getDiscountText = (voucher: Voucher) => {
        switch (voucher.discountTypeId) {
            case 1: 
                return `${voucher.discountValue}%`;
            case 2: 
                return `${voucher.discountValue.toLocaleString()}đ`;
            case 3: 
                return t('free_shipping');
            default:
                return `${voucher.discountValue}`;
        }
    };

    const getVoucherStatus = (voucher: Voucher) => {
        const now = new Date();
        const endDate = new Date(voucher.endDate);
        const startDate = new Date(voucher.startDate);
        const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        
        if (now > endDate) {
            return { label: t('expired'), color: 'error' };
        }
        
        if (voucher.usedCount >= voucher.usageLimit) {
            return { label: t('fully_used'), color: 'warning' };
        }

        if (startDate <= oneDayFromNow && startDate > now) {
            return { label: t('new'), color: 'success' };
        }
        
        return null;
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mt: 2 }}>
                {error}
            </Alert>
        );
    }

    if (vouchers.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', backgroundColor: theme.palette.background.paper, borderRadius: '10px', padding: '20px' }}>
                <IconifyIcon icon="mdi:ticket-outline" width={60} color={theme.palette.text.secondary} />
                <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                    {t('no_vouchers_available')}
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ py: 3 }}>
            <Typography variant="h5" sx={{ mb: 3 }}>
                {t('my_vouchers')}
            </Typography>
            
            <Grid container spacing={3}>
                {vouchers.map((voucher) => {
                    const status = getVoucherStatus(voucher);
                    return (
                        <Grid item xs={12} sm={6} md={4} key={voucher.id}>
                            <Card 
                                sx={{ 
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    position: 'relative',
                                    border: `1px solid ${theme.palette.divider}`,
                                    '&:hover': {
                                        boxShadow: theme.shadows[4],
                                    }
                                }}
                            >
                                <Box 
                                    sx={{ 
                                        position: 'absolute',
                                        top: 12,
                                        right: 12,
                                        zIndex: 1
                                    }}
                                >
                                    <Chip 
                                        label={status?.label}
                                        color={status?.color as any}
                                        size="small"
                                    />
                                </Box>
                                
                                <CardContent sx={{ flexGrow: 1, pt: 3 }}>
                                    <Stack spacing={2}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <IconifyIcon icon="mdi:ticket" width={24} color={theme.palette.primary.main} />
                                            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                                                {voucher.name}
                                            </Typography>
                                        </Box>
                                        
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                {t('code')}:
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                {voucher.code}
                                            </Typography>
                                            <Tooltip title={t('copy_code')}>
                                                <IconButton 
                                                    size="small" 
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(voucher.code);
                                                        toast.success(t('code_copied'));
                                                    }}
                                                >
                                                    <IconifyIcon icon="mdi:content-copy" width={16} />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                        
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                {t('discount')}:
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 'medium', color: theme.palette.primary.main }}>
                                                {getDiscountText(voucher)}
                                            </Typography>
                                        </Box>
                                        
                                        <Divider />
                                        
                                        <Stack direction="row" spacing={1}>
                                            <Typography variant="body2" color="text.secondary">
                                                {t('start_date')}:
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                {formatDate(voucher.startDate)}
                                            </Typography>
                                        </Stack>
                                        <Stack direction="row" spacing={1}>
                                            <Typography variant="body2" color="text.secondary">
                                                {t('valid_until')}:
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                {formatDate(voucher.endDate)}
                                            </Typography>
                                        </Stack>
                                        
                                        {voucher.conditions && (
                                            <Box>
                                                <Typography variant="body2" color="text.secondary">
                                                    {t('conditions')}:
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                    {voucher.conditions}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
};

export default MyVouchersPage;
