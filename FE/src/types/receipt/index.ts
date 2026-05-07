export interface PropertyFilterModel {
    field: string;
    operator: string;
    filterValue: string;
}

export type TParamsGetAllReceipts = {
    skip?: number;
    take?: number;
    filters?: string;
    orderBy?: string;
    dir?: string;
    type?: number | (1 | 2 | 3 | 4 | 5 | 6)
    paging?: boolean;
    restrictOrderBy?: boolean;
    keywords?: string;
    propertyFilterModels?: PropertyFilterModel[];
}

export type TParamsCreateReceipt = {
    // id: number;
    name?: string;
    code?: string;
    provinceName?: string;
    provinceId?: string,
}

export type TParamsUpdateReceipt = {
    id: number,
    name?: string,
    code?: string,
    provinceName?: string,
    provinceId?: string,
}

export type TParamsUpdateReceiptStatus = {
    purchaseOrderId: number,
    newStatus: number,
}

export type TParamsUpdateMultipleReceiptStatus = {
    purchaseOrderIds: number[],
    newStatus: number,
}

export type TParamsDeleteReceipt = {
    id: number,
}

export type TParamsDeleteMultipleReceipts = {
    receiptIds: number[],
}