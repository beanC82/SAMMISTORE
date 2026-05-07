export const PERMISSIONS: any = {
    ADMIN: "ADMIN.GRANTED",
    BASIC: "BASIC.PUBLIC",
    DASHBOARD: "DASHBOARD",
    CHECKOUT: "CHECKOUT",
    MY_CART: "MY_CART",
    ACCOUNT: {
      CHANGE_PASSWORD: {
        CREATE: "ACCOUNT.CHANGE_PASSWORD.CREATE",
        UPDATE: "ACCOUNT.CHANGE_PASSWORD.UPDATE",
        DELETE: "ACCOUNT.CHANGE_PASSWORD.DELETE",
        VIEW: "ACCOUNT.CHANGE_PASSWORD.VIEW",
      },
      MY_ORDER: {
        CREATE: "ACCOUNT.MY_ORDER.CREATE",
        UPDATE: "ACCOUNT.MY_ORDER.UPDATE",
        DELETE: "ACCOUNT.MY_ORDER.DELETE",
        VIEW: "ACCOUNT.MY_ORDER.VIEW",
      },
      MY_PRODUCT: {
        CREATE: "ACCOUNT.MY_PRODUCT.CREATE",
        UPDATE: "ACCOUNT.MY_PRODUCT.UPDATE",
        DELETE: "ACCOUNT.MY_PRODUCT.DELETE",
        VIEW: "ACCOUNT.MY_PRODUCT.VIEW",
      },
      MY_PROFILE: {
        CREATE: "ACCOUNT.MY_PROFILE.CREATE",
        UPDATE: "ACCOUNT.MY_PROFILE.UPDATE",
        DELETE: "ACCOUNT.MY_PROFILE.DELETE",
        VIEW: "ACCOUNT.MY_PROFILE.VIEW",
      },
      MY_VOUCHER: {
        CREATE: "ACCOUNT.MY_VOUCHER.CREATE",
        UPDATE: "ACCOUNT.MY_VOUCHER.UPDATE",
        DELETE: "ACCOUNT.MY_VOUCHER.DELETE",
        VIEW: "ACCOUNT.MY_VOUCHER.VIEW",
      },
    },
    MANAGE_PRODUCT: {
      PRODUCT: {
        VIEW: "MANAGE_PRODUCT.PRODUCT.VIEW",
        CREATE: "MANAGE_PRODUCT.PRODUCT.CREATE",
        UPDATE: "MANAGE_PRODUCT.PRODUCT.UPDATE",
        DELETE: "MANAGE_PRODUCT.PRODUCT.DELETE",
      },
      PRODUCT_CATEGORY: {
        CREATE: "MANAGE_PRODUCT.PRODUCT_CATEGORY.CREATE",
        UPDATE: "MANAGE_PRODUCT.PRODUCT_CATEGORY.UPDATE",
        DELETE: "MANAGE_PRODUCT.PRODUCT_CATEGORY.DELETE",
      },
      BRAND: {
        CREATE: "MANAGE_PRODUCT.BRAND.CREATE",
        UPDATE: "MANAGE_PRODUCT.BRAND.UPDATE",
        DELETE: "MANAGE_PRODUCT.BRAND.DELETE",
      },
    },
    SYSTEM: {
      USER: {
        CREATE: "SYSTEM.USER.CREATE",
        UPDATE: "SYSTEM.USER.UPDATE",
        DELETE: "SYSTEM.USER.DELETE",
        VIEW: "SYSTEM.USER.VIEW",
      },
      ROLE: {
        CREATE: "SYSTEM.ROLE.CREATE",
        UPDATE: "SYSTEM.ROLE.UPDATE",
        DELETE: "SYSTEM.ROLE.DELETE",
        VIEW: "SYSTEM.ROLE.VIEW",
      },
    },
    USER: {
      EMPLOYEE: {
        CREATE: "SYSTEM.EMPLOYEE.CREATE",
        UPDATE: "SYSTEM.EMPLOYEE.UPDATE",
        DELETE: "SYSTEM.EMPLOYEE.DELETE",
        VIEW: "SYSTEM.EMPLOYEE.VIEW",
      },
      CUSTOMER: {
        CREATE: "SYSTEM.CUSTOMER.CREATE",
        UPDATE: "SYSTEM.CUSTOMER.UPDATE",
        DELETE: "SYSTEM.CUSTOMER.DELETE",
        VIEW: "SYSTEM.CUSTOMER.VIEW",
      },
      SUPPLIER: {
        CREATE: "SYSTEM.SUPPLIER.CREATE",
        UPDATE: "SYSTEM.SUPPLIER.UPDATE",
        DELETE: "SYSTEM.SUPPLIER.DELETE",
        VIEW: "SYSTEM.SUPPLIER.VIEW",
      },
    },
    MANAGE_ORDER: {
      REVIEW: {
        UPDATE: "MANAGE_ORDER.REVIEW.UPDATE",
        DELETE: "MANAGE_ORDER.REVIEW.DELETE",
      },
      ORDER: {
        CREATE: "MANAGE_ORDER.ORDER.CREATE",
        UPDATE: "MANAGE_ORDER.ORDER.UPDATE",
        DELETE: "MANAGE_ORDER.ORDER.DELETE",
        VIEW: "MANAGE_ORDER.ORDER.VIEW",
      },
    },
    SETTING: {
      PAYMENT_METHOD: {
        CREATE: "SETTING.PAYMENT_METHOD.CREATE",
        UPDATE: "SETTING.PAYMENT_METHOD.UPDATE",
        DELETE: "SETTING.PAYMENT_METHOD.DELETE",
      },
      DELIVERY_METHOD: {
        CREATE: "SETTING.DELIVERY_METHOD.CREATE",
        UPDATE: "SETTING.DELIVERY_METHOD.UPDATE",
        DELETE: "SETTING.DELIVERY_METHOD.DELETE",
      },
      BANNER: {
        CREATE: "SETTING.BANNER.CREATE",
        UPDATE: "SETTING.BANNER.UPDATE",
        DELETE: "SETTING.BANNER.DELETE",
        VIEW: "SETTING.BANNER.VIEW",
      },
    },
    ADDRESS: {
      PROVINCE: {
        CREATE: "ADDRESS.PROVINCE.CREATE",
        UPDATE: "ADDRESS.PROVINCE.UPDATE",
        DELETE: "ADDRESS.PROVINCE.DELETE",
      },
      DISTRICT: {
        CREATE: "ADDRESS.DISTRICT.CREATE",
        UPDATE: "ADDRESS.DISTRICT.UPDATE",
        DELETE: "ADDRESS.DISTRICT.DELETE",
      },
      WARD: {
        CREATE: "ADDRESS.WARD.CREATE",
        UPDATE: "ADDRESS.WARD.UPDATE",
        DELETE: "ADDRESS.WARD.DELETE",
      },
    },
    GOODS_RECEIPT: {
      RECEIPT_LIST: {
        VIEW: "GOODS_RECEIPT.RECEIPT_LIST.VIEW",
        CREATE: "GOODS_RECEIPT.RECEIPT_LIST.CREATE",
        UPDATE: "GOODS_RECEIPT.RECEIPT_LIST.UPDATE",
        DELETE: "GOODS_RECEIPT.RECEIPT_LIST.DELETE",
      },
    },
    MANAGE_PROMOTION: {
      EVENT: {
        VIEW: "MANAGE_PROMOTION.EVENT.VIEW",
        CREATE: "MANAGE_PROMOTION.EVENT.CREATE",
        UPDATE: "MANAGE_PROMOTION.EVENT.UPDATE",
        DELETE: "MANAGE_PROMOTION.EVENT.DELETE",
      },
      VOUCHER: {
        VIEW: "MANAGE_PROMOTION.VOUCHER.VIEW",
        CREATE: "MANAGE_PROMOTION.VOUCHER.CREATE",
        UPDATE: "MANAGE_PROMOTION.VOUCHER.UPDATE",
        DELETE: "MANAGE_PROMOTION.VOUCHER.DELETE",
      },
    },
    REPORT: {
      REVENUE: {
        VIEW: "REPORT.REVENUE.VIEW",
      },
    },
  };

export const LIST_PERMISSION_DATA: any = [
  {
    id: 14,
    name: "dashboard",
    isParent: false,
    value: "DASHBOARD",
    isHideCreate: true,
    isHideUpdate: true,
    isHideDelete: true,
    isHideCheckAll: true
  },
  {
    id: 11,
    name: "province",
    isParent: false,
    value: "PROVINCE",
    parentValue: "SETTING",
    isHideView: true,
  },
  {
    id: 1,
    name: "product_manage",
    isParent: true,
    value: "MANAGE_PRODUCT",
  },
  {
    id: 2,
    name: "product",
    isParent: false,
    value: "PRODUCT",
    parentValue: "MANAGE_PRODUCT",
  },
  {
    id: 3,
    name: "product_type",
    isParent: false,
    value: "PRODUCT_TYPE",
    parentValue: "MANAGE_PRODUCT",
    isHideView: true
  },
  {
    id: 4,
    name: "system",
    isParent: true,
    value: "SYSTEM",
  },
  {
    id: 5,
    name: "user",
    isParent: false,
    value: "USER",
    parentValue: "SYSTEM",
  },
  {
    id: 6,
    name: "role",
    isParent: false,
    value: "ROLE",
    parentValue: "SYSTEM",
  },
  {
    id: 7,
    name: "manage_order",
    isParent: true,
    value: "MANAGE_ORDER",
  },
  {
    id: 8,
    name: "review",
    isParent: false,
    value: "REVIEW",
    parentValue: "MANAGE_ORDER",
    isHideView: true,
    isHideCreate: true
  },
  {
    id: 9,
    name: "order",
    isParent: false,
    value: "ORDER",
    parentValue: "MANAGE_ORDER",
  },
  {
    id: 10,
    name: "setting",
    isParent: true,
    value: "SETTING",
  },
  {
    id: 12,
    name: "delivery_type",
    isParent: false,
    value: "DELIVERY_TYPE",
    parentValue: "SETTING",
    isHideView: true,
  },  {
    id: 13,
    name: "payment_type",
    isParent: false,
    value: "PAYMENT_TYPE",
    parentValue: "SETTING",
    isHideView: true,
  },
  {
    id: 15,
    name: "report",
    isParent: true,
    value: "REPORT",
  },
  {
    id: 16,
    name: "revenue",
    isParent: false,
    value: "REVENUE",
    parentValue: "REPORT",
    isHideCreate: true,
    isHideUpdate: true,
    isHideDelete: true,
  },
]