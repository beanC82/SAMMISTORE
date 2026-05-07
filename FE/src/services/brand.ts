import { API_ENDPOINT } from "src/configs/api"
import instance from "src/helpers/axios"
import { TParamsCreateBrand, TParamsDeleteMultipleBrands, TParamsGetAllBrands, TParamsUpdateBrand } from "src/types/brand"

export const getAllBrands = async (data: {params: TParamsGetAllBrands}) => {
    try {
        const res = await instance.get(`${API_ENDPOINT.MANAGE_PRODUCT.BRAND.INDEX}`, data)
        return res.data
    } catch (error) {
        return error
    }
}

export const getOutstandingBrand = async (data: {numberTop: number, isPublic: boolean}) => {
    try {
        const res = await instance.get(`${API_ENDPOINT.MANAGE_PRODUCT.BRAND.INDEX}/get-brands`, {params: data})
        return res.data
    } catch (error) {
        return error
    }
}

export const getBrandCode = async (data: {params: TParamsGetAllBrands}) => {
    try {
        const res = await instance.get(`${API_ENDPOINT.MANAGE_PRODUCT.BRAND.INDEX}/get-code-by-last-id`, data)
        return res.data
    } catch (error) {
        return error
    }
}

export const createBrand = async (data: TParamsCreateBrand) => {
    try {
        const res = await instance.post(`${API_ENDPOINT.MANAGE_PRODUCT.BRAND.INDEX}`, data)
        return res.data
    } 
    catch (error: any) {
        return error?.response?.data
    }
}


export const updateBrand = async (data: TParamsUpdateBrand) => {
    // const { id, ...rests } = data
    try {
        const res = await instance.put(`${API_ENDPOINT.MANAGE_PRODUCT.BRAND.INDEX}/${data.id}`, data)
        return res.data
    } catch (error: any) {
        return error?.response?.data
    }
}


export const deleteBrand = async (id: number) => {
    try {
        const res = await instance.delete(`${API_ENDPOINT.MANAGE_PRODUCT.BRAND.INDEX}/${id}`)
        return res.data
    } catch (error: any) {
        return error?.response?.data
    }
}

export const getBrandDetail = async (id: number) => {
    try {
        const res = await instance.get(`${API_ENDPOINT.MANAGE_PRODUCT.BRAND.INDEX}/${id}`)
        return res.data
    } catch (error: any) {
        return error?.response?.data
    }
}


export const deleteMultipleBrands = async (data: TParamsDeleteMultipleBrands) => {
    try {
        const res = await instance.delete(`${API_ENDPOINT.MANAGE_PRODUCT.BRAND.INDEX}`, {data})
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