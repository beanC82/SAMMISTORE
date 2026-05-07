import axios from "axios"
import { API_ENDPOINT } from "src/configs/api"
import instance from "src/helpers/axios"
import { TParamsCreateCart, TParamsGetAllCarts, TParamsGetCartData } from "src/types/cart"

export const getCarts = async (data: {params: TParamsGetAllCarts}) => {
    try {
        const res = await instance.get(`${API_ENDPOINT.CART.INDEX}/get-cart`, data)
        return res.data
    } catch (error) {
        return error
    }
}


export const createCart = async (data: TParamsCreateCart) => {
    try {
        const res = await instance.post(`${API_ENDPOINT.CART.INDEX}/add-to-cart`, data)
        return res.data
    }
    catch (error: any) {
        return error?.response?.data
    }
}

export const deleteCart = async (id: number) => {
    try {
        const res = await instance.delete(`${API_ENDPOINT.CART.INDEX}/${id}`)
        return res.data
    } catch (error: any) {
        return error?.response?.data
    }
}


export const getCartData = async (data: { params: { productIds: string } }) => {
    try {
        const res = await instance.get(`${API_ENDPOINT.CART.INDEX}/get-order-select-products`, data)
        return res.data
    } catch (error) {
        return error
    }
}
