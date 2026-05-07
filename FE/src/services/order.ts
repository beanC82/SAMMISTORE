import axios from "axios"
import { API_ENDPOINT } from "src/configs/api"
import instance from "src/helpers/axios"
import { TParamsCreateOrder, TParamsCreateOrderShop, TParamsGetAllOrders, TParamsPayback, TParamsUpdateOrder, TParamsUpdateOrderStatus } from "src/types/order"


export const getAllOrders = async (data: {params: TParamsGetAllOrders  }) => {
    try {
        const res = await instance.get(`${API_ENDPOINT.MANAGE_ORDER.ORDER.INDEX}`, data)
        return res.data
    } catch (error) {
        return error
    }
}

export const getMyOrders = async (data: {params: TParamsGetAllOrders  }) => {
    try {
        const res = await instance.get(`${API_ENDPOINT.MANAGE_ORDER.ORDER.INDEX}/customer/get-my-orders`, data)
        return res.data
    } catch (error) {
        return error
    }
}

export const getMyOrderDetail = async (code: string) => {
    try {
        const res = await instance.get(`${API_ENDPOINT.MANAGE_ORDER.ORDER.INDEX}/customer/${code}`)
        return res.data
    } catch (error) {
        return error
    }
}

export const getOrderDetail = async (id: number) => {
    try {
        const res = await instance.get(`${API_ENDPOINT.MANAGE_ORDER.ORDER.INDEX}/${id}`)
        return res.data
    } catch (error) {
        return error
    }
}



export const createOrder = async (data: TParamsCreateOrder) => {
    try {
        const res = await instance.post(`${API_ENDPOINT.MANAGE_ORDER.ORDER.INDEX}/create-order`, data)
        return res.data
    }
    catch (error: any) {
        return error?.response?.data
    }
}

export const createOrderShop = async (data: TParamsCreateOrderShop) => {
    try {
        const res = await instance.post(`${API_ENDPOINT.MANAGE_ORDER.ORDER.INDEX}/create-order-shop`, data)
        return res.data
    }
    catch (error: any) {
        return error?.response?.data
    }
}

export const createPayBackOrder = async (data: TParamsPayback) => {
    try {
        const res = await instance.post(`${API_ENDPOINT.MANAGE_ORDER.ORDER.INDEX}/pay-back`, data)
        return res.data
    }
    catch (error: any) {
        return error?.response?.data
    }
}

export const cancelOrder = async (code: string) => {
    try {
        const res = await instance.post(`${API_ENDPOINT.MANAGE_ORDER.ORDER.INDEX}/customer/update-status-order/${code}`)
        return res.data
    } catch (error: any) {
        return error?.response?.data
    }
}


//admin
export const deleteOrder = async (id: number) => {
    try {
        const res = await instance.delete(`${API_ENDPOINT.MANAGE_ORDER.ORDER.INDEX}/${id}`)
        return res.data
    } catch (error: any) {
        return error?.response?.data
    }
}

export const getManageOrderDetail = async (id: number) => {
    try {
        const res = await instance.get(`${API_ENDPOINT.MANAGE_ORDER.ORDER.INDEX}/${id}`)
        return res.data
    } catch (error: any) {
        return error?.response?.data
    }
}

export const getAllManageOrders = async (data: {params: TParamsGetAllOrders  }) => {
    try {
        const res = await instance.get(`${API_ENDPOINT.MANAGE_ORDER.ORDER.INDEX}`, data)
        return res.data
    } catch (error) {
        return error
    }
}

export const updateOrder = async (data: TParamsUpdateOrder) => {
    const { id, ...rests } = data
    try {
        const res = await instance.put(`${API_ENDPOINT.MANAGE_ORDER.ORDER.INDEX}/${id}`, rests)
        return res.data
    } catch (error: any) {
        return error?.response?.data
    }
}

export const updateOrderStatus = async (data: TParamsUpdateOrderStatus) => {
    try {
        const res: any = await instance.post(`${API_ENDPOINT.MANAGE_ORDER.ORDER.INDEX}/update-status-order`, data)
        return res
    }
    catch (error: any) {
        return error?.response?.data
    }
}
