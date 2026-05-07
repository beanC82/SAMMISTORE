import { useTranslation } from "react-i18next"

export const FILTER_REVIEW_CMS = () =>{
    const {t} = useTranslation()
    return [
        {
            label: t('greater_than_4.5'),
            value: '4.5'
        },
        {
            label: t('greater_than_4'),
            value: '4'
        },
        {
            label: t('greater_than_3.5'),
            value: '3.5'
        },
        {
            label: t('greater_than_3'),
            value: '3'
        },
    ]
}