import { IBaseModelGetAll } from '../index';

export type TParamsGetAllCarts = IBaseModelGetAll & {
}

export type TItemCartProduct = {
    cartId: number,
    productId: number,
    productName: string,
    price: number,
    quantity: number,
}

export type TParamsCreateCart = {
    cartId: number,
    productId: number,
    quantity: number,
    operation: number,
}

export type TParamsDeleteCart = {
    productId: number,
}

export type TParamsGetCartData = {
    productIds: string,
}


