

export interface IBaseModel {
    id: number;
    isActive: boolean | true;
    isDelete: boolean | false;
}

export interface PropertyFilterModel {
    field: string;      
    operator: string;     
    filterValue: string;   
}

export interface IBaseModelGetAll {
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

