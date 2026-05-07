import { useTranslation } from "react-i18next"

export const OBJECT_USER_STATUS = () => {
    const {t} = useTranslation()
    return {
        "0": {
            label: t("inactive"),
            value: "0",
        },
        "1": {
            label: t("active"),
            value: "1",
        },
    }
}