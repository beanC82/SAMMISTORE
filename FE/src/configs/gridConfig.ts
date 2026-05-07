import { get } from "http";
import i18n from "./i18n";

type Operator = {
    value: string;
    label: string;
};

type FieldConfig = {
    value: string;
    label: string;
    type: "string" | "number" | "boolean" | "date";
    operators: Operator[];
};


const getStringOperators = (): Operator[] => [
    { value: "contains", label: i18n.t("contains") },
    { value: "doesnotcontain", label: i18n.t("does_not_contain") },
    { value: "eq", label: i18n.t("equal") },
    { value: "neq", label: i18n.t("not_equal") },
    { value: "startswith", label: i18n.t("starts_with") },
    { value: "endswith", label: i18n.t("ends_with") },
    { value: "isnull", label: i18n.t("is_null") },
    { value: "isnotnull", label: i18n.t("is_not_null") },
    { value: "isempty", label: i18n.t("is_empty") },
    { value: "isnotempty", label: i18n.t("is_not_empty") },
];

const getNumberOperators = (): Operator[] => [
    { value: "eq", label: i18n.t("equal") },
    { value: "neq", label: i18n.t("not_equal") },
    { value: "gt", label: i18n.t("greater_than") },
    { value: "gte", label: i18n.t("greater_than_or_equal") },
    { value: "lt", label: i18n.t("less_than") },
    { value: "lte", label: i18n.t("less_than_or_equal") },
    { value: "isnull", label: i18n.t("is_null") },
    { value: "isnotnull", label: i18n.t("is_not_null") },
];

const getBooleanOperators = (): Operator[] => [
    { value: "eq", label: i18n.t("equal") },
    { value: "neq", label: i18n.t("not_equal") },
    { value: "isnull", label: i18n.t("is_null") },
    { value: "isnotnull", label: i18n.t("is_not_null") },
];

const getDateOperators = (): Operator[] => [
    { value: "eq", label: i18n.t("equal") },
    { value: "neq", label: i18n.t("not_equal") },
    { value: "gt", label: i18n.t("greater_than") },
    { value: "gte", label: i18n.t("greater_than_or_equal") },
    { value: "lt", label: i18n.t("less_than") },
    { value: "lte", label: i18n.t("less_than_or_equal") },
    { value: "isnull", label: i18n.t("is_null") },
    { value: "isnotnull", label: i18n.t("is_not_null") },
];


export const getProvinceFields = (): FieldConfig[] => [
    { value: "name", label: i18n.t("province_name"), type: "string", operators: getStringOperators() },
    { value: "code", label: i18n.t("province_code"), type: "string", operators: getStringOperators() },
    { value: "postalCode", label: i18n.t("postal_code"), type: "string", operators: getStringOperators() },
];

export const getDistrictFields = (): FieldConfig[] => [
    { value: "name", label: i18n.t("district_name"), type: "string", operators: getStringOperators() },
    { value: "code", label: i18n.t("district_code"), type: "string", operators: getStringOperators() },
    { value: "provinceName", label: i18n.t("province_name"), type: "string", operators: getStringOperators() },
];

export const getWardFields = (): FieldConfig[] => [
    { value: "name", label: i18n.t("ward_name"), type: "string", operators: getStringOperators() },
    { value: "code", label: i18n.t("ward_code"), type: "string", operators: getStringOperators() },
    { value: "districtName", label: i18n.t("district_name"), type: "string", operators: getStringOperators() },
    { value: "districtCode", label: i18n.t("district_code"), type: "string", operators: getStringOperators() },
];

export const getProductFields = (): FieldConfig[] => [
    { value: "name", label: i18n.t("product_name"), type: "string", operators: getStringOperators() },
    { value: "brandName", label: i18n.t("brand"), type: "string", operators: getStringOperators() },
    { value: "categoryName", label: i18n.t("product_category"), type: "string", operators: getStringOperators() },
    { value: "price", label: i18n.t("price"), type: "number", operators: getNumberOperators() },
    { value: "stockQuantity", label: i18n.t("stock_quantity"), type: "number", operators: getNumberOperators() },
    { value: "discount", label: i18n.t("discount"), type: "number", operators: getNumberOperators() },
    { value: "status", label: i18n.t("status"), type: "boolean", operators: getBooleanOperators() },
];

export const getBrandFields = (): FieldConfig[] => [
    { value: "name", label: i18n.t("brand_name"), type: "string", operators: getStringOperators() },
    { value: "code", label: i18n.t("brand_code"), type: "string", operators: getStringOperators() },
];

export const getProductCategoryFields = (): FieldConfig[] => [
    { value: "code", label: i18n.t("product_category_code"), type: "string", operators: getStringOperators() },
    { value: "name", label: i18n.t("product_category_name"), type: "string", operators: getStringOperators() },
    { value: "parentName", label: i18n.t("parent_name"), type: "string", operators: getStringOperators() },
    { value: "level", label: i18n.t("category_level"), type: "number", operators: getNumberOperators() },
];

export const getEmployeeFields = (): FieldConfig[] => [
    { value: "code", label: i18n.t("employee_code"), type: "string", operators: getStringOperators() },
    { value: "fullName", label: i18n.t("name"), type: "string", operators: getStringOperators() },
    { value: "phone", label: i18n.t("phone"), type: "string", operators: getStringOperators() },
    { value: "email", label: i18n.t("email"), type: "string", operators: getStringOperators() },
    { value: "gender", label: i18n.t("gender"), type: "number", operators: getNumberOperators() },
];

export const getCustomerFields = (): FieldConfig[] => [
    { value: "code", label: i18n.t("customer_code"), type: "string", operators: getStringOperators() },
    { value: "fullName", label: i18n.t("name"), type: "string", operators: getStringOperators() },
    { value: "phone", label: i18n.t("phone"), type: "string", operators: getStringOperators() },
    { value: "email", label: i18n.t("email"), type: "string", operators: getStringOperators() },
    { value: "gender", label: i18n.t("gender"), type: "number", operators: getNumberOperators() },
];

export const getSupplierFields = (): FieldConfig[] => [
    { value: "code", label: i18n.t("supplier_code"), type: "string", operators: getStringOperators() },
    { value: "fullName", label: i18n.t("name"), type: "string", operators: getStringOperators() },
    { value: "phone", label: i18n.t("phone"), type: "string", operators: getStringOperators() },
    { value: "email", label: i18n.t("email"), type: "string", operators: getStringOperators() },
    { value: "gender", label: i18n.t("gender"), type: "number", operators: getNumberOperators() },
];

export const getReceiptFields = (): FieldConfig[] => [
    { value: "code", label: i18n.t("receipt_code"), type: "string", operators: getStringOperators() },
    { value: "createdDate", label: i18n.t("receipt_date"), type: "date", operators: getDateOperators() },
    { value: "supplierName", label: i18n.t("supplier_name"), type: "string", operators: getStringOperators() },
    { value: "totalPrice", label: i18n.t("total_price"), type: "number", operators: getNumberOperators() },
    { value: "status", label: i18n.t("status"), type: "string", operators: getStringOperators() },
];

export const getPaymentMethodFields = (): FieldConfig[] => [
    { value: "name", label: i18n.t("payment_method_name"), type: "string", operators: getStringOperators() },
    { value: "createdDate", label: i18n.t("created_at"), type: "date", operators: getDateOperators() },
];

export const getBannerFields = (): FieldConfig[] => [
    { value: "name", label: i18n.t("banner_name"), type: "string", operators: getStringOperators() },
    { value: "level", label: i18n.t("banner_level"), type: "number", operators: getNumberOperators() },
    { value: "createdDate", label: i18n.t("created_at"), type: "date", operators: getDateOperators() },
];

export const getOrderFields = (): FieldConfig[] => [
    { value: "customerName", label: i18n.t("customer_name"), type: "string", operators: getStringOperators() },
    { value: "customerAddress", label: i18n.t("customer_address"), type: "string", operators: getStringOperators() },
    { value: "phoneNumber", label: i18n.t("customer_phone"), type: "string", operators: getStringOperators() },
    { value: "createdDate", label: i18n.t("place_order_date"), type: "date", operators: getDateOperators() },
    { value: "totalPrice", label: i18n.t("total_price"), type: "number", operators: getNumberOperators() },
    { value: "paymentStatus", label: i18n.t("payment_status"), type: "string", operators: getStringOperators() },
    { value: "shippingStatus", label: i18n.t("shipping_status"), type: "string", operators: getStringOperators() },
    { value: "orderStatus", label: i18n.t("order_status"), type: "string", operators: getStringOperators() },
];

export const getEventFields = (): FieldConfig[] => [
    { value: "code", label: i18n.t("event_code"), type: "string", operators: getStringOperators() },
    { value: "name", label: i18n.t("event_name"), type: "string", operators: getStringOperators() },
    { value: "startDate", label: i18n.t("start_date"), type: "date", operators: getDateOperators() },
    { value: "endDate", label: i18n.t("end_date"), type: "date", operators: getDateOperators() },
    { value: "eventType", label: i18n.t("event_type"), type: "string", operators: getStringOperators() },
    { value: "status", label: i18n.t("status"), type: "string", operators: getStringOperators() },
];

export const getVoucherFields = (): FieldConfig[] => [
    { value: "code", label: i18n.t("voucher_code"), type: "string", operators: getStringOperators() },
    { value: "name", label: i18n.t("voucher_name"), type: "string", operators: getStringOperators() },
    { value: "eventName", label: i18n.t("event_name"), type: "string", operators: getStringOperators() },
    { value: "startDate", label: i18n.t("start_date"), type: "date", operators: getDateOperators() },
    { value: "endDate", label: i18n.t("end_date"), type: "date", operators: getDateOperators() },
    { value: "discountType", label: i18n.t("discount_name"), type: "string", operators: getStringOperators() },
    { value: "discountValue", label: i18n.t("discount_value"), type: "number", operators: getNumberOperators() },
    { value: "usageLimit", label: i18n.t("usage_limit"), type: "number", operators: getNumberOperators() },
    { value: "usedCount", label: i18n.t("used_count"), type: "number", operators: getNumberOperators() },
];

export const getRevenueFields = (): FieldConfig[] => [
    { value: "code", label: i18n.t("order_code"), type: "string", operators: getStringOperators() },
    { value: "customerName", label: i18n.t("customer_name"), type: "string", operators: getStringOperators() },
    { value: "phoneNumber", label: i18n.t("phone_number"), type: "string", operators: getStringOperators() },
    { value: "paymentMethod", label: i18n.t("payment_method"), type: "string", operators: getStringOperators() },
    { value: "orderStatus", label: i18n.t("order_status"), type: "string", operators: getStringOperators() },
    { value: "totalPrice", label: i18n.t("total_price"), type: "number", operators: getNumberOperators() },
    { value: "totalQuantity", label: i18n.t("quantity"), type: "number", operators: getNumberOperators() },
    { value: "createdDate", label: i18n.t("created_date"), type: "date", operators: getDateOperators() },
];

export const PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50, 100];
