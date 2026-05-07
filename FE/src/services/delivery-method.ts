import { API_ENDPOINT } from "src/configs/api"
import instance from "src/helpers/axios"
import { TParamsCreateDeliveryMethod, TParamsDeleteMultipleDeliveryMethods, TParamsGetAllDeliveryMethods, TParamsGetCaculatedFee, TParamsUpdateDeliveryMethod } from "src/types/delivery-method"

export const getAllDeliveryMethods = async (data: {params: TParamsGetAllDeliveryMethods}) => {
    try {
        const res = await instance.get(`${API_ENDPOINT.SETTING.DELIVERY_METHOD.INDEX}`, data)
        return res.data
    } catch (error: any) {
        return error?.response?.data
    }
}

export const getCaculatedFee = async (data: {params: TParamsGetCaculatedFee}) => {
    try {
        const res = await instance.get(`${API_ENDPOINT.GHN.INDEX}/calculate-fee`, data)
        return res.data
    } catch (error) {
        return error
    }
}


export const createDeliveryMethod = async (data: TParamsCreateDeliveryMethod) => {
    try {
        const res = await instance.post(`${API_ENDPOINT.SETTING.DELIVERY_METHOD.INDEX}`, data)
        return res.data
    } 
    catch (error: any) {
        return error?.response?.data
    }
}


export const updateDeliveryMethod = async (data: TParamsUpdateDeliveryMethod) => {
    const { id, ...rests } = data
    try {
        const res = await instance.put(`${API_ENDPOINT.SETTING.DELIVERY_METHOD.INDEX}/${id}`, rests)
        return res.data
    } catch (error: any) {
        return error?.response?.data
    }
}


export const deleteDeliveryMethod = async (id: number) => {
    try {
        const res = await instance.delete(`${API_ENDPOINT.SETTING.DELIVERY_METHOD.INDEX}/${id}`)
        return res.data
    } catch (error: any) {
        return error?.response?.data
    }
}

export const getDeliveryMethodDetail = async (id: number) => {
    try {
        const res = await instance.get(`${API_ENDPOINT.SETTING.DELIVERY_METHOD.INDEX}/${id}`)
        return res.data
    } catch (error: any) {
        return error?.response?.data
    }
}


export const deleteMultipleDeliveryMethods = async (data: TParamsDeleteMultipleDeliveryMethods) => {
    try {
        const res = await instance.delete(`${API_ENDPOINT.SETTING.DELIVERY_METHOD.INDEX}`, {data})
        if(res?.data?.status === "Success") {
            return {
                data: []
            }
        }
        return {
            data: null
        }
    } catch (error: any) {
        return error?.response?.data
    }
}