export interface PropertyFilterModel {
    field: string;      
    operator: string;     
    filterValue: string;   
}

export type TParamsGetAllVouchers = {
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

export type TParamsVouchers = {
    id: number;
    name: string;
    eventId: number;
    eventName: string;
    discountTypeId: number;
    discountName: string;
    discountValue: number;
    usageLimit: number;
    usedCount: number;
    startDate: Date;
    endDate: Date;
    isValid?: boolean;
    conditions?: Array<{
        voucherId: number;
        conditionType: string;
        conditionValue: string;
    }>;
    voucherId: number;
}

export type TParamsCreateVoucher = {
    name: string;
    code: string;
    eventId: number;
    discountTypeId: number;
    discountValue: number;
    usageLimit: number;
    startDate: Date;
    endDate: Date;
    isActive: boolean | true;
    isDeleted: boolean | false;
    conditions: {
        voucherId: number;
        conditionType: number;
        conditionValue: string;
    }[];
}

export type TParamsFetchListApplyVoucher = {
    details: Array<{
        cartId: number;
        productId: number;
        productName: string;
        price: number;
        quantity: number;
    }>
}

export interface TParamsApplyMyVoucher extends TParamsFetchListApplyVoucher {
}


export type TParamsApplyVoucher = {
    name: string;
    code: string;
    eventId: number;
    discountTypeId: number;
    discountValue: number;
    usageLimit: number;
    startDate: Date;
    endDate: Date;
    conditions:{
        id: number;
        voucherId: number;
        conditionType: number;
        conditionValue: string;
    }
}

export interface TParamsUpdateVoucher extends TParamsCreateVoucher {
    id: number,
}

export type TParamsDeleteVoucher = {
    id: number,
}

export type TParamsDeleteMultipleVouchers = {
    ids: number[],
}