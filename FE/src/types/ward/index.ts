export interface PropertyFilterModel {
    field: string;      
    operator: string;     
    filterValue: string;   
}

export type TParamsGetAllWards = {
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

export type TParamsCreateWard = {
    name?: string;
    code?: string;
    districtName?: string;
    districtId?: number,
}

export type TParamsUpdateWard = {
    id: number,
    name?: string,
    code?: string
    districtName?: string,
    districtId?: number,
}

export type TParamsDeleteWard = {
    id: number,
}

export type TParamsDeleteMultipleWards = {
    ids: number[],
}