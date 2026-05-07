import { useTranslation } from "react-i18next"

export const RECEIPT_STATUS = () => {
    const { t } = useTranslation()
    return {
        "0": {
            label: t("draft"),
            value: "0",
        },
        "1": {
            label: t("pending_approval"),
            value: "1",
        },
        "2": {
            label: t("approved"),
            value: "2",
        },
        "3": {
            label: t("processing"),
            value: "3",
        },
        "4": {
            label: t("completed"),
            value: "4",
        },
        "5": {
            label: t("canceled"),
            value: "5",
        },
    }
}
export const GOODS_RECEIPT_STATUS = () => {
    const { t } = useTranslation()
    return {
        "0": {
            label: t("draft"),
            value: "0",
            originalValue: "Draft",
        },
        "1": {
            label: t("pending_approval"),
            value: "1",
            originalValue: "PendingApproval",
        },
    }
}

export const GOODS_RECEIPT_FULL_STATUS = () => {
    const { t } = useTranslation()
    return {
        "0": {
            label: t("draft"),
            value: "0",
            originalValue: "Draft",
        },
        "1": {
            label: t("pending_approval"),
            value: "1",
            originalValue: "PendingApproval",
        },
        "2": {
            label: t("approved"),
            value: "2",
            originalValue: "Approved",
        },
        "3": {
            label: t("processing"),
            value: "3",
            originalValue: "Processing",
        },
        "4": {
            label: t("completed"),
            value: "4",
            originalValue: "Completed",
        },
        "5": {
            label: t("canceled"),
            value: "5",
            originalValue: "Canceled",
        },
    }
}

export const getReceiptStatusLabel = (status: string) => {
    const statusMap: { [key: string]: string } = {
        "Draft": "0",
        "PendingApproval": "1",
        "Approved": "2",
        "Processing": "3",
        "Completed": "4",
        "Canceled": "5"
    };
    const { t } = useTranslation();
    const statusOptions = RECEIPT_STATUS();
    const mappedValue = statusMap[status];
    return mappedValue ? statusOptions[mappedValue as keyof typeof statusOptions]?.label : status;
} 