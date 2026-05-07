import { useTranslation } from "react-i18next"

export const LOCAL_PRODUCT_CART = 'productCart'

export const OBJECT_PRODUCT_STATUS = () => {
    const {t} = useTranslation()
    return {
        "0": {
            label: t("private"),
            value: "0",
        },
        "1": {
            label: t("public"),
            value: "1",
        },
    }
}

export const REVIEW_PRODUCT_FILTER = () => {
    const {t} = useTranslation()
    return [
        {
            label: t("greater_than_4.5"),
            value: "4.5"
        },
        {
            label: t("greater_than_4"),
            value: "4"
        },
        {
            label: t("greater_than_3.5"),
            value: "3.5"
        },
        {
            label: t("greater_than_3"),
            value: "3"
        },
    ]
}