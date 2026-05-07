import { API_ENDPOINT } from "src/configs/api"
import instance from "src/helpers/axios"
import { TParamsCreateSupplier, TParamsDeleteMultipleSuppliers, TParamsGetAllSuppliers, TParamsUpdateSupplier } from "src/types/supplier"

export const getAllSuppliers = async (data: {params: TParamsGetAllSuppliers}) => {
    try {
        const res = await instance.get(`${API_ENDPOINT.USER.SUPPLIER.INDEX}`, data)
        return res.data
    } catch (error) {
        return error
    }
}

export const createSupplier = async (data: TParamsCreateSupplier) => {
    try {
        const res = await instance.post(`${API_ENDPOINT.USER.SUPPLIER.INDEX}`, data)
        return res.data
    } 
    catch (error: any) {
        return error?.response?.data
    }
}

export const getSupplierCode = async (data: {params: {type: number}}) => {
    try {
        const res = await instance.get(`${API_ENDPOINT.USER.INDEX}/get-code-by-last-id`, data)
        return res.data
    } catch (error) {
        return error
    }
}


export const updateSupplier = async (data: TParamsUpdateSupplier) => {
    const { id, ...rests } = data
    try {
        const res = await instance.put(`${API_ENDPOINT.USER.SUPPLIER.INDEX}/${data.id}`, data)
        return res.data
    } catch (error: any) {
        return error?.response?.data
    }
}


export const deleteSupplier = async (id: number) => {
    try {
        const res = await instance.delete(`${API_ENDPOINT.USER.SUPPLIER.DELETE}/${id}`)
        return res.data
    } catch (error: any) {
        return error?.response?.data
    }
}

export const getSupplierDetail = async (id: number) => {
    try {
        const res = await instance.get(`${API_ENDPOINT.USER.SUPPLIER.INDEX}/${id}`)
        return res.data
    } catch (error: any) {
        return error?.response?.data
    }
}


export const deleteMultipleSuppliers = async (data: TParamsDeleteMultipleSuppliers) => {
    try {
        const res = await instance.delete(`${API_ENDPOINT.USER.SUPPLIER.INDEX}`, {data})
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