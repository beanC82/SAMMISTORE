import { API_ENDPOINT } from "src/configs/api"
import instance from "src/helpers/axios"
import { TParamsCreateDistrict, TParamsDeleteMultipleDistricts, TParamsGetAllDistricts, TParamsUpdateDistrict } from "src/types/district"

export const getAllDistricts= async (data: {params: TParamsGetAllDistricts}) => {
    try {
        const res = await instance.get(`${API_ENDPOINT.ADDRESS.DISTRICT.INDEX}`, data)
        return res.data
    } catch (error) {
        return error
    }
}

export const createDistrict = async (data: TParamsCreateDistrict) => {
    try {
        const res = await instance.post(`${API_ENDPOINT.ADDRESS.DISTRICT.INDEX}`, data)
        return res.data
    } 
    catch (error: any) {
        return error?.response?.data
    }
}


export const updateDistrict = async (data: TParamsUpdateDistrict) => {
    // const { id, ...rests } = data
    try {
        const res = await instance.put(`${API_ENDPOINT.ADDRESS.DISTRICT.INDEX}/${data.id}`, data)
        return res.data
    } catch (error: any) {
        return error
    }
}


export const deleteDistrict = async (id: number) => {
    try {
        const res = await instance.delete(`${API_ENDPOINT.ADDRESS.DISTRICT.INDEX}/${id}`)
        return res.data
    } catch (error: any) {
        return error?.response?.data
    }
}

export const getDistrictDetail = async (id: number) => {
    try {
        const res = await instance.get(`${API_ENDPOINT.ADDRESS.DISTRICT.INDEX}/${id}`)
        return res.data
    } catch (error: any) {
        return error?.response?.data
    }
}

export const deleteMultipleDistricts= async (data: TParamsDeleteMultipleDistricts) => {
    try {
        const res = await instance.delete(`${API_ENDPOINT.ADDRESS.DISTRICT.INDEX}`, {data})
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