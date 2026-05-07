import { ProductImage } from "../product";

export type TParamsGetAllOrders = {
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

export type TParamsPayback = {
    orderCode: string;
}

export interface TItemOrderProduct {
    cartId: number;
    productId: number;
    productName: string;
    price: number;
    newPrice: number;
    quantity: number;
    productImage: string;
    stockQuantity: number;
    id: number;
    createdDate: string;
    updatedDate: string | null;
    createdBy: string;
    updatedBy: string | null;
    isActive: boolean;
    isDeleted: boolean;
    displayOrder: number | null;
}

export type TItemCart = {
    productId: number;
    productName: string;
    quantity: number;
    price: number;
    discount?: number;
    images: ProductImage[];
}

export type TOrderDetail = {
    id: number;
    orderId: number;
    productId: number;
    productName: string;
    imageUrl: string;
    quantity: number;
    price: number;
    tax: number;
}


export type TParamsCreateOrder = {
    customerId: number;
    code: string,
    displayOrder: number;
    paymentStatus: string;
    orderStatus: string;
    shippingStatus: string;
    voucherId?: number;
    wardId: number;
    customerAddress: string;
    costShip: number;
    trackingNumber?: string;
    estimatedDeliveryDate?: Date | string | null;
    actualDeliveryDate?: Date | string | null;
    shippingCompanyId: number;
    details: {
        id: number;
        orderId: number;
        productId: number;
        quantity: number;
        tax?: number;
        amount: number;
    }[];
    totalAmount: number;
    totalQuantity: number;
    discountAmount?: number;
    isBuyNow?: boolean;
    paymentMethodId: number;
}

export type TParamsCreateOrderShop = {
    code: string;
    customerId: number;
    orderStatus: string;    
    shippingStatus: string;
    voucherId?: number;
    discountValue?: number;
    details: {
        orderId: number
        productId: number;
        quantity: number;
        price: number;
        tax?: number;
    }[];
    paymentMethodId: number;
    isActive: boolean;
    isDelete: boolean;
}



export interface TParamsUpdateOrder extends TParamsCreateOrder {
    id: number
}

export type TParamsUpdateOrderStatus = {
    orderId: number,
    paymentStatus: number,
    shippingStatus: number,
}

export type TOrderItem = {
    id: number,
    code: string,
    customerId: number,
    customerName: string,
    phoneNumber: string,
    paymentStatus: string,
    paymentMethod: string,
    shippingStatus: string,
    orderStatus: string,
    voucherId: number,
    wardId: number,
    customerAddress: string,
    costShip: number,
    trackingNumber: string,
    estimatedDeliveryDate: Date,
    actualDeliveryDate: Date,
    shippingCompanyId: number,
    totalPrice: number,
    totalQuantity: number,
    returnUrl: string,
    details: TOrderDetail[],
    discount?: number,
    discountAmount?: number,
    deliveryMethod?: string,
    createdDate?: Date,

}
