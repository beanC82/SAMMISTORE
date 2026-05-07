export type TParamsGetAllEmployees = {
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

export type TParamsCreateEmployee = {
    roleIds: number[];
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
    wardName?: string;
    username: string;
    password: string;
    gender: number;
    securityStamp: string;
    idCardNumber?: string;
    birthday?: Date | null;
    verifyToken: string;
    verifiedAt: Date | null;
    isLock: boolean | false;

}

export interface TParamsUpdateEmployee extends TParamsCreateEmployee {
    id: number
}

export type TParamsDeleteEmployee = {
    name: string,
    id: number,
}

export type TParamsDeleteMultipleEmployees = {
    ids: number[],
}