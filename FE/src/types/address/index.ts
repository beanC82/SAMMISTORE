import { IBaseModel, IBaseModelGetAll } from "..";



export interface TParamsGetAllAddresses extends IBaseModelGetAll {}

export type TParamsAddresses = {
    streetAddress: string;
    wardId: number;
    isDefault?: boolean;
    wardName: string;
    districtName: string;
    provinceName: string;
}

export interface TParamsCreateAddress extends IBaseModel {
    customerId: number;
    streetAddress: string;
    wardId: number;
    isDefault: boolean;
}

export interface TParamsUpdateAddress extends TParamsCreateAddress {
    id: number,
}

export type TParamsDeleteAddress = {
    id: number,
}

export type TParamsDeleteMultipleAddresses = {
    addressIds: number[],
}