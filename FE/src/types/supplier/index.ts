export type TParamsGetAllSuppliers = {
    skip?: number;
    take?: number;
    filters?: string;
    orderBy?: string;
    dir?: string;
    type?: number | (1 | 2 | 3 | 4 | 5 | 6)
    paging?: boolean;
    restrictOrderBy?: boolean;
    keywords?: string;
}

export type TParamsCreateSupplier = {
    code: string;
    identityGuid: string;
    type: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string | null;
    phone: string;
    streetAddress: string | null;
    wardId: number;
    username: string;
    password: string;
    gender: number;
    securityStamp: string;
}

export interface TParamsUpdateSupplier extends TParamsCreateSupplier {
    id: number
}

export type TParamsDeleteSupplier = {
    name: string,
    id: number,
}

export type TParamsDeleteMultipleSuppliers = {
    ids: number[],
}