import { createAsyncThunk } from "@reduxjs/toolkit";

//services
import { createProvince, deleteMultipleProvinces, deleteProvince, getAllProvinces, updateProvince } from "src/services/province";

//types
import { TParamsCreateProvince, TParamsDeleteMultipleProvinces, TParamsGetAllProvinces, TParamsUpdateProvince } from "src/types/province";

export const serviceName = 'province'

export const getAllProvincesAsync = createAsyncThunk(`${serviceName}/get-all`, async (data: { params: TParamsGetAllProvinces }) => {
    const response = await getAllProvinces(data)
    return response
})

export const createProvinceAsync = createAsyncThunk(`${serviceName}/create`, async (data: TParamsCreateProvince) => {
    const response = await createProvince(data)
    return response
})

export const updateProvinceAsync = createAsyncThunk(`${serviceName}/update`, async (data: TParamsUpdateProvince) => {
    const response = await updateProvince(data)
    console.log("response", response)
    return response
})


export const deleteProvinceAsync = createAsyncThunk(`${serviceName}/delete`, async (id: number) => {
    const response = await deleteProvince(id)
    return response
})

export const deleteMultipleProvincesAsync = createAsyncThunk(`${serviceName}/delete-multiple`, async (data: TParamsDeleteMultipleProvinces) => {
    const response = await deleteMultipleProvinces(data)
    return response
})