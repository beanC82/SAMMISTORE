export type TParamsGetAllBrands = {
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

export type TParamsCreateBrand = {
    code: string,
    name: string,
    imageCommand: {
        imageUrl?: string,
        imageBase64: string,
        publicId?: string,
        typeImage?: string,
        value?: string,
        displayOrder?: string,
    }
    // slug: string
}

export type TParamsUpdateBrand = {
    id: number,
    code: string,
    name: string,
    imageCommand: {
        imageUrl?: string,
        imageBase64: string,
        publicId?: string,
        typeImage?: string,
        value?: string,
        displayOrder?: string,
    }
    // slug: string
}

export type TParamsDeleteBrand = {
    id: number,
}

export type TParamsDeleteMultipleBrands = {
    ids: number[],
}