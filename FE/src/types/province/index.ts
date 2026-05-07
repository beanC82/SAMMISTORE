export interface PropertyFilterModel {
    field: string;      
    operator: string;     
    filterValue: string;   
}

export type TParamsGetAllProvinces = {
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

export type TParamsCreateProvince = {
    // id: number;
    name?: string;
    postalCode?: string;
    code?: string;
}

export type TParamsUpdateProvince = {
    id: number,
    name?: string,
    postalCode?: string,
    code?: string
}

export type TParamsDeleteProvince = {
    id: number,
}

export type TParamsDeleteMultipleProvinces = {
    ids: number[],
}