import { createAsyncThunk } from "@reduxjs/toolkit";

//services
import { createBanner, deleteMultipleBanners, deleteBanner, getAllBanners, updateBanner } from "src/services/banner";

//types
import { TParamsCreateBanner, TParamsDeleteMultipleBanners, TParamsGetAllBanners, TParamsUpdateBanner } from "src/types/banner";

export const serviceName = 'banner'

export const getAllBannersAsync = createAsyncThunk(`${serviceName}/get-all`, async (data: { params: TParamsGetAllBanners }) => {
    const response = await getAllBanners(data)
    return response
})

export const createBannerAsync = createAsyncThunk(`${serviceName}/create`, async (data: TParamsCreateBanner) => {
    const response = await createBanner(data)
    return response
})

export const updateBannerAsync = createAsyncThunk(`${serviceName}/update`, async (data: TParamsUpdateBanner) => {
    const response = await updateBanner(data)
    return response
})

export const deleteBannerAsync = createAsyncThunk(`${serviceName}/delete`, async (id: number) => {
    const response = await deleteBanner(id)
    return response
})

export const deleteMultipleBannersAsync = createAsyncThunk(`${serviceName}/delete-multiple`, async (data: TParamsDeleteMultipleBanners) => {
    const response = await deleteMultipleBanners(data)
    return response
})