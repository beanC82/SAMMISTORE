import { API_ENDPOINT } from "src/configs/api"
import instance from "src/helpers/axios"
import { TParamsCreateBanner, TParamsDeleteMultipleBanners, TParamsGetAllBanners, TParamsUpdateBanner } from "src/types/banner"

export const getAllBanners = async (data: {params: TParamsGetAllBanners}) => {
    try {
        const res = await instance.get(`${API_ENDPOINT.SETTING.BANNER.INDEX}`, data)
        return res.data
    } catch (error) {
        return error
    }
}

export const getHomeBanners = async (data: {numberTop: number}) => {
    try {
        const res = await instance.get(`${API_ENDPOINT.SETTING.BANNER.INDEX}/get-banners`, {params: data})
        return res.data
    } catch (error) {
        return error
    }
}

export const createBanner = async (data: TParamsCreateBanner) => {
    try {
        const res = await instance.post(`${API_ENDPOINT.SETTING.BANNER.INDEX}`, data)
        return res.data
    } 
    catch (error: any) {
        return error?.response?.data
    }
}


export const updateBanner = async (data: TParamsUpdateBanner) => {
    const { id, ...rests } = data
    try {
        const res = await instance.put(`${API_ENDPOINT.SETTING.BANNER.INDEX}/${id}`, rests)
        return res.data
    } catch (error: any) {
        return error?.response?.data
    }
}


export const deleteBanner = async (id: number) => {
    try {
        const res = await instance.delete(`${API_ENDPOINT.SETTING.BANNER.INDEX}/${id}`)
        return res.data
    } catch (error: any) {
        return error?.response?.data
    }
}

export const getBannerDetail = async (id: number) => {
    try {
        const res = await instance.get(`${API_ENDPOINT.SETTING.BANNER.INDEX}/${id}`)
        return res.data
    } catch (error: any) {
        return error?.response?.data
    }
}


export const deleteMultipleBanners = async (data: TParamsDeleteMultipleBanners) => {
    try {
        const res = await instance.delete(`${API_ENDPOINT.SETTING.BANNER.INDEX}`, {data})
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