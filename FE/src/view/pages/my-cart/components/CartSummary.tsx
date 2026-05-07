import { Box, Button, Divider, Stack, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { t } from 'i18next';
import { formatPrice } from 'src/utils';

type TProps = {
    subtotal: number;
    total: number;
    save: number;
    onCheckout: () => void;
};

const CartSummary = ({ subtotal, total, save, onCheckout }: TProps) => {
    const theme = useTheme();

    return (
        <Stack
            spacing={3}
            sx={{
                p: 5,
                borderRadius: 2,
                border: (theme) => `solid 1px ${alpha(theme.palette.grey[500], 0.24)}`,
            }}
        >
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {t('summary')}
            </Typography>

            <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" sx={{ typography: 'subtitle2' }}>
                    <Box component="span" sx={{ typography: 'body2' }}>
                        {t('subtotal')}
                    </Box>
                    <Typography>{formatPrice(subtotal)}</Typography>
                </Stack>

                <Stack direction="row" justifyContent="space-between" sx={{ typography: 'subtitle2' }}>
                    <Box component="span" sx={{ typography: 'body2' }}>
                        {t('save_money')}
                    </Box>
                    <Typography sx={{ color: save > 0 ? theme.palette.success.main : 'inherit' }}>
                        {formatPrice(save)}
                    </Typography>
                </Stack>

            </Stack>

            <Divider sx={{ borderStyle: 'dashed' }} />

            <Stack direction="row" justifyContent="space-between" sx={{ typography: 'h6' }}>
                <Box component="span" sx={{ fontWeight: 'bold' }}>{t('total')}</Box>
                <Box component="span" sx={{ fontWeight: 'bold' }} color={theme.palette.primary.main}>
                    {formatPrice(total)}
                </Box>
            </Stack>

            <Button
                size="large"
                variant="contained"
                color="primary"
                onClick={onCheckout}
                disabled={total === 0}
            >
                {t('buy_item')}
            </Button>
        </Stack>
    );
};

export default CartSummary;