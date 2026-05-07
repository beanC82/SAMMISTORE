import { API_ENDPOINT } from "src/configs/api"
import instance from "src/helpers/axios"
import { TParamsCreateCustomer, TParamsCreateCustomerFaster, TParamsDeleteMultipleCustomers, TParamsGetAllCustomers, TParamsUpdateCustomer } from "src/types/customer"

export const getAllCustomers = async (data: {params: TParamsGetAllCustomers}) => {
    try {
        const res = await instance.get(`${API_ENDPOINT.USER.CUSTOMER.INDEX}`, data)
        return res.data
    } catch (error) {
        return error
    }
}

export const getCustomerCode = async (data: {params: {type: number}}) => {
    try {
        const res = await instance.get(`${API_ENDPOINT.USER.INDEX}/get-code-by-last-id`, data)
        return res.data
    } catch (error) {
        return error
    }
}

export const createCustomer = async (data: TParamsCreateCustomer) => {
    try {
        const res = await instance.post(`${API_ENDPOINT.USER.CUSTOMER.INDEX}`, data)
        return res.data
    } 
    catch (error: any) {
        return error?.response?.data
    }
}

export const createCustomerFaster = async (data: TParamsCreateCustomerFaster) => {
    try {
        const res = await instance.post(`${API_ENDPOINT.USER.CUSTOMER.INDEX}/create-faster`, data)
        return res.data
    } 
    catch (error: any) {
        return error?.response?.data
    }
}


export const updateCustomer = async (data: TParamsUpdateCustomer) => {
    const { id, ...rests } = data
    try {
        const res = await instance.put(`${API_ENDPOINT.USER.CUSTOMER.INDEX}/${data.id}`, data)
        return res.data
    } catch (error: any) {
        return error?.response?.data
    }
}


export const deleteCustomer = async (id: number) => {
    try {
        const res = await instance.delete(`${API_ENDPOINT.USER.CUSTOMER.DELETE}/${id}`)
        return res.data
    } catch (error: any) {
        return error?.response?.data
    }
}

export const getCustomerDetail = async (id: number) => {
    try {
        const res = await instance.get(`${API_ENDPOINT.USER.CUSTOMER.INDEX}/${id}`)
        return res.data
    } catch (error: any) {
        return error?.response?.data
    }
}


export const deleteMultipleCustomers = async (data: TParamsDeleteMultipleCustomers) => {
    try {
        const res = await instance.delete(`${API_ENDPOINT.USER.CUSTOMER.INDEX}`, {data})
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