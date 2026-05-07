import { useTranslation } from "react-i18next"

export const PAYMENT_METHOD = () => {
    const {t} = useTranslation()
    return {
        PAYMENT_LATER: {
            id: 1,
            label: t('payment_later_type'),
            value: 'PAYMENT_LATER'
        },
        VN_PAYMENT: {
            id: 2,
            label: t('vn_payment_type'),
            value: 'VN_PAYMENT'
        },
        PAYPAL: {
            id: 3,
            label: t('paypal_type'),
            value: 'PAYPAL'
        },
    }
}