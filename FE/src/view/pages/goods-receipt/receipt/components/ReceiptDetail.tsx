import React, { useEffect, useState } from 'react';
import { Box, Grid, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, useTheme, Autocomplete, TextField, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import Spinner from 'src/components/spinner';
import { getReceiptDetail, updateReceiptStatus } from 'src/services/receipt';
import { formatDate, formatPrice } from 'src/utils';
import { GOODS_RECEIPT_FULL_STATUS, RECEIPT_STATUS } from 'src/configs/receipt';
import { toast } from 'react-toastify';

interface ReceiptDetailProps {
    id: number;
    onClose: () => void;
}

const ReceiptDetail: React.FC<ReceiptDetailProps> = ({ id, onClose }) => {
    const { t } = useTranslation();
    const theme = useTheme();
    const [loading, setLoading] = useState(false);
    const [receiptData, setReceiptData] = useState<any>(null);
    const [selectedStatus, setSelectedStatus] = useState<any>(null);
    const [updating, setUpdating] = useState(false);

    const statusOptions = Object.values(RECEIPT_STATUS());
    const translatedStatus = Object.values(GOODS_RECEIPT_FULL_STATUS());

    const fetchReceiptDetail = async (id: number) => {
        setLoading(true);
        try {
            const response = await getReceiptDetail(id);
            if (response?.result) {
                setReceiptData(response.result);

                const statusValue = response.result.status;
                let targetNumericStringValue: string | undefined;

                if (typeof statusValue === 'number') {
                    targetNumericStringValue = statusValue.toString();
                } else if (typeof statusValue === 'string') {
                    const foundTranslatedOption = translatedStatus.find(option => option.originalValue === statusValue);
                    targetNumericStringValue = foundTranslatedOption?.value;
                }

                const currentStatus = statusOptions.find(option => option.value === targetNumericStringValue);
                setSelectedStatus(currentStatus || null);
            }
        } catch (error) {
            console.error('Error fetching receipt detail:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async () => {
        if (!selectedStatus || !receiptData) return;

        setUpdating(true);

        const response = await updateReceiptStatus({
            purchaseOrderId: receiptData.id,
            newStatus: parseInt(selectedStatus.value)
        });

        if (response?.data?.isSuccess) {
            toast.success(t('status_updated_successfully'));
            fetchReceiptDetail(id);
            setSelectedStatus(null)
        } else {
            toast.error(response?.message);
        }
    };

    useEffect(() => {
        if (id) {
            fetchReceiptDetail(id);
        }
    }, [id]);

    return (
        <Box sx={{ p: 3, width: '100%' }}>
            {loading && <Spinner />}
            <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h5">{t("receipt_detail")}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Autocomplete
                            size="small"
                            options={statusOptions}
                            getOptionLabel={(option) => option.label}
                            value={selectedStatus}
                            onChange={(_, newValue) => setSelectedStatus(newValue)}
                            sx={{ width: 200 }}
                            renderInput={(params) => <TextField {...params} />}
                        />
                        <Button
                            variant="contained"
                            onClick={handleStatusUpdate}
                            disabled={!selectedStatus || selectedStatus.value === receiptData.status}
                        >
                            {t('apply')}
                        </Button>
                    </Box>
                </Box>

                {receiptData && (
                    <>
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle1" fontWeight="bold">{t("receipt_code")}:</Typography>
                                <Typography variant="body1">{receiptData.code}</Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle1" fontWeight="bold">{t("receipt_date")}:</Typography>
                                <Typography variant="body1">{formatDate(receiptData.createdDate, { dateStyle: "medium", timeStyle: "short" })}</Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle1" fontWeight="bold">{t("supplier_name")}:</Typography>
                                <Typography variant="body1">{receiptData.supplierName}</Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle1" fontWeight="bold">{t("status")}:</Typography>
                                <Typography variant="body1">
                                    {(() => {
                                        const statusValue = receiptData.status;
                                        const foundOption = translatedStatus.find(option =>
                                            (typeof statusValue === 'string' && option.originalValue === statusValue)
                                        );
                                        return foundOption?.label || statusValue;
                                    })()}
                                </Typography>
                            </Grid>
                        </Grid>

                        <Typography variant="h6" sx={{ mb: 2 }}>{t("receipt_items")}</Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>{t("product_name")}</TableCell>
                                        <TableCell align="right">{t("quantity")}</TableCell>
                                        <TableCell align="right">{t("unit_price")}</TableCell>
                                        <TableCell align="right">{t("total")}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {receiptData.details?.map((item: any, index: number) => (
                                        <TableRow key={index}>
                                            <TableCell>{item.productName}</TableCell>
                                            <TableCell align="right">{item.quantity}</TableCell>
                                            <TableCell align="right">{formatPrice(item.unitPrice)}</TableCell>
                                            <TableCell align="right">{formatPrice(item.quantity * item.unitPrice)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                            <Typography variant="h6" sx={{ mr: 2 }}>{t("total")}:</Typography>
                            <Typography variant="h6" color="primary">{formatPrice(receiptData.totalPrice)}</Typography>
                        </Box>
                    </>
                )}
            </Paper>
        </Box>
    );
};

export default ReceiptDetail; 