export type TParamsGetAllReviews = {
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

export interface TParamsGetAllReviewsByProductId extends TParamsGetAllReviews {
    productId: number,
    rateNumber?: number,
    typeReview?: number,
}

export type TParamsCreateReview = {
    productId: number,
    orderId: number,
    rating: number,
    comment?: string,
    imageId?: number
    imageCommand?: {
        imageUrl: string,
        imageBase64: string,
        publicId: string,
        typeImage: string,
        value: string
    }
}

export interface TParamsUpdateReview {
    id: number
    star: number,
    content: string,
}

export type TParamsDeleteMultipleReviews = {
    reviewIds: number[]
}

export type TReviewItem = {
    id: number;
    productId: number;
    userId: number;
    customerName: string;
    customerImage?: string;
    rating: number;
    comment: string;
    imageId?: number;
    imageUrl?: string;
    createdDate: string;
    updatedDate?: string;
    createdBy?: string;
    updatedBy?: string;
    isActive: boolean;
    isDeleted: boolean;
    displayOrder?: number;
}



