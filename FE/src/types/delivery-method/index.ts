export type TParamsGetAllDeliveryMethods = {
    limit?: number,
    page?: number,
    search?: string,
    order?: string
}

export type TParamsCreateDeliveryMethod = {
    name: string,
    price: string
}

export type TParamsUpdateDeliveryMethod = {
    id: number,
    name: string,
    price: string
}

export type TParamsDeleteDeliveryMethod = {
    id: number,
}

export type TParamsDeleteMultipleDeliveryMethods = {
    ids: number[],
}

export type TParamsGetCaculatedFee = {
    wardId: number,
    totalAmount: number,
}