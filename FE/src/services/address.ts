import { API_ENDPOINT } from "src/configs/api"
import instance from "src/helpers/axios"
import { TParamsCreateAddress, TParamsDeleteMultipleAddresses, TParamsGetAllAddresses, TParamsUpdateAddress } from "src/types/address"

export const getAllAddresses= async () => {
    try {
        const res = await instance.get(`${API_ENDPOINT.CUSTOMER_ADDRESS.INDEX}/get-all-current-address`)
        return res.data
    } catch (error) {
        return error
    }
}

export const getCurrentAddress= async () => {
    try {
        const res = await instance.get(`${API_ENDPOINT.CUSTOMER_ADDRESS.INDEX}/get-current-address`)
        return res.data
    } catch (error) {
        return error
    }
}

export const createAddress = async (data: TParamsCreateAddress) => {
    try {
        const res = await instance.post(`${API_ENDPOINT.CUSTOMER_ADDRESS.INDEX}`, data)
        return res.data
    } 
    catch (error: any) {
        return error?.response?.data
    }
}


export const updateAddress = async (data: TParamsUpdateAddress) => {

    try {
        const res = await instance.put(`${API_ENDPOINT.CUSTOMER_ADDRESS.INDEX}/${data.id}`, data)
        return res.data
    } catch (error: any) {
        return error
    }
}


export const deleteAddress = async (id: number) => {
    try {
        const res = await instance.delete(`${API_ENDPOINT.CUSTOMER_ADDRESS.INDEX}/${id}`)
        return res.data
    } catch (error: any) {
        return error?.response?.data
    }
}

export const getAddressDetail = async (id: number) => {
    try {
        const res = await instance.get(`${API_ENDPOINT.CUSTOMER_ADDRESS.INDEX}/${id}`)
        return res.data
    } catch (error: any) {
        return error?.response?.data
    }
}

export const deleteMultipleAddresses= async (data: TParamsDeleteMultipleAddresses) => {
    try {
        const res = await instance.delete(`${API_ENDPOINT.CUSTOMER_ADDRESS.INDEX}`, {data})
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