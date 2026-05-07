import { useTranslation } from "../../node_modules/react-i18next";
import { ROUTE_CONFIG } from "./route";
import { PERMISSIONS } from "./permission";

export type TVerticalLayoutItem = {
    title: string,
    path?: string,
    icon?: string,
    permission?: string,
    children?: {
        title: string,
        path?: string,
        icon?: string
        permission?: string
    }[],
}

export const VerticalLayoutItems = () => {

    const { t } = useTranslation()
    return [
        {
            title: "Quản trị hệ thống",
            icon: 'icon-park-outline:system',
            children: [
                {
                    title: "Trang quản trị",
                    icon: 'mage:dashboard-bar-notification',
                    path: ROUTE_CONFIG.DASHBOARD,
                },
            ]
        },
        {
            title: t('manage_order'),
            icon: 'lsicon:work-order-info-outline',
            children: [
                {
                    title: t('order_list'),
                    icon: 'lsicon:order-outline',
                    path: ROUTE_CONFIG.MANAGE_ORDER.ORDER,
                },
            ]
        },
        {
            title: t('manage_goods_receipt'),
            icon: 'fluent:receipt-bag-20-regular',
            children: [
                {
                    title: t('receipt_list'),
                    icon: 'material-symbols-light:receipt-long-outline-rounded',
                    path: ROUTE_CONFIG.GOODS_RECEIPT.RECEIPT,
                },
            ]
        },
        {
            title: t('manage_promotion'),
            icon: 'lsicon:badge-promotion-outline',
            children: [
                {
                    title: t('event_list'),
                    icon: 'carbon:event',
                    path: ROUTE_CONFIG.MANAGE_PROMOTION.EVENT,
                },
                {
                    title: t('list_voucher'),
                    icon: 'ci:ticket-voucher',
                    path: ROUTE_CONFIG.MANAGE_PROMOTION.VOUCHER,
                },
            ]
        },
        {
            title: t('manage_statistic'),
            icon: 'akar-icons:statistic-up',
            children: [
                {
                    title: "Thống kê doanh thu",
                    icon: 'material-symbols:payments-outline',
                    path: ROUTE_CONFIG.REPORT.REVENUE,
                },
                {
                    title: "Thống kê nhập hàng",
                    icon: 'fluent:receipt-cube-20-regular',
                    path: ROUTE_CONFIG.REPORT.IMPORT,
                },
                {
                    title: "Thống kê tồn kho",
                    icon: 'material-symbols:inventory-2-outline',
                    path: ROUTE_CONFIG.REPORT.INVENTORY,
                },
            ]
        },
        {
            title: t('product_manage'),
            icon: 'fluent-mdl2:product-release',
            children: [
                {
                    title: t('product_list'),
                    icon: 'fluent-mdl2:product-catalog',
                    path: ROUTE_CONFIG.MANAGE_PRODUCT.PRODUCT,
                    
                },
            ]
        },
        {
            title: t('manage_user'),
            icon: 'iconoir:user',
            children: [
                {
                    title: t('employee'),
                    icon: 'clarity:employee-group-line',
                    path: ROUTE_CONFIG.USER.EMPLOYEE,
                },
                {
                    title: t('customer'),
                    icon: 'ix:customer',
                    path: ROUTE_CONFIG.USER.CUSTOMER,
                },
                {
                    title: t('supplier'),
                    icon: 'carbon:scis-transparent-supply',
                    path: ROUTE_CONFIG.USER.SUPPLIER,
                }
            ]
        },
        {
            title: t('manage_category'),
            icon: 'material-symbols-light:category-outline-rounded',
            children: [
                {
                    title: t('product_category'),
                    icon: 'fluent-mdl2:product-variant',
                    path: ROUTE_CONFIG.MANAGE_CATEGORY.PRODUCT_CATEGORY,
                },
                {
                    title: t('brand'),
                    icon: 'mynaui:brand-slack',
                    path: ROUTE_CONFIG.MANAGE_CATEGORY.BRAND,
                },
                {
                    title: t('banner'),
                    icon: 'material-symbols:planner-banner-ad-pt-outline-rounded',
                    path: ROUTE_CONFIG.MANAGE_CATEGORY.BANNER,
                },
                {
                    title: t('payment_method'),
                    icon: 'streamline:payment-10',
                    path: ROUTE_CONFIG.MANAGE_CATEGORY.PAYMENT_METHOD,
                },
            ]
        },
        {
            title: t('address'),
            icon: 'fluent:location-settings-20-regular',
            children: [
                {
                    title: t('province'),
                    icon: 'healthicons:city-outline',
                    path: ROUTE_CONFIG.ADDRESS.PROVINCE,
                },
                {
                    title: t('district'),
                    icon: 'fluent:building-home-20-regular',
                    path: ROUTE_CONFIG.ADDRESS.DISTRICT,
                },
                {
                    title: t('ward'),
                    icon: 'material-symbols-light:home-work-outline-rounded',
                    path: ROUTE_CONFIG.ADDRESS.WARD,
                },
            ]
        }
    ]
}