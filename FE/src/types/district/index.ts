export interface PropertyFilterModel {
    field: string;      
    operator: string;     
    filterValue: string;   
}

export type TParamsGetAllDistricts = {
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

export type TParamsCreateDistrict = {
    // id: number;
    name?: string;
    code?: string;
    provinceName?: string;
    provinceId?: string,
}

export type TParamsUpdateDistrict = {
    id: number,
    name?: string,
    code?: string
    provinceName?: string,
    provinceId?: string,
}

export type TParamsDeleteDistrict = {
    id: number,
}

export type TParamsDeleteMultipleDistricts = {
    ids: number[],
}