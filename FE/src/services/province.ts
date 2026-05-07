import { API_ENDPOINT } from "src/configs/api"
import instance from "src/helpers/axios"
import { TParamsCreateProvince, TParamsDeleteMultipleProvinces, TParamsGetAllProvinces, TParamsUpdateProvince } from "src/types/province"

export const getAllProvinces= async (data: {params: TParamsGetAllProvinces}) => {
    try {
        const res = await instance.get(`${API_ENDPOINT.ADDRESS.PROVINCE.INDEX}`, data)
        return res.data
    } catch (error) {
        return error
    }
}

export const createProvince = async (data: TParamsCreateProvince) => {
    try {
        const res = await instance.post(`${API_ENDPOINT.ADDRESS.PROVINCE.INDEX}`, data)
        return res.data
    } 
    catch (error: any) {
        return error?.response?.data
    }
}


export const updateProvince = async (data: TParamsUpdateProvince) => {
    // const { id, ...rests } = data
    try {
        const res = await instance.put(`${API_ENDPOINT.ADDRESS.PROVINCE.INDEX}/${data.id}`, data)
        return res.data
    } catch (error: any) {
        return error
    }
}


export const deleteProvince = async (id: number) => {
    try {
        const res = await instance.delete(`${API_ENDPOINT.ADDRESS.PROVINCE.INDEX}/${id}`)
        return res.data
    } catch (error: any) {
        return error?.response?.data
    }
}

export const getProvinceDetail = async (id: number) => {
    try {
        const res = await instance.get(`${API_ENDPOINT.ADDRESS.PROVINCE.INDEX}/${id}`)
        return res.data
    } catch (error: any) {
        return error?.response?.data
    }
}

export const deleteMultipleProvinces= async (data: TParamsDeleteMultipleProvinces) => {
    try {
        const res = await instance.delete(`${API_ENDPOINT.ADDRESS.PROVINCE.INDEX}`, {data})
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