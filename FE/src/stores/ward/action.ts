import { createAsyncThunk } from "@reduxjs/toolkit";

//services
import { createWard, deleteMultipleWards, deleteWard, getAllWards, updateWard } from "src/services/ward";

//types
import { TParamsCreateWard, TParamsDeleteMultipleWards, TParamsGetAllWards, TParamsUpdateWard } from "src/types/ward";

export const serviceName = 'ward'

export const getAllWardsAsync = createAsyncThunk(`${serviceName}/get-all`, async (data: { params: TParamsGetAllWards }) => {
    const response = await getAllWards(data)
    return response
})

export const createWardAsync = createAsyncThunk(`${serviceName}/create`, async (data: TParamsCreateWard) => {
    const response = await createWard(data)
    return response
})

export const updateWardAsync = createAsyncThunk(`${serviceName}/update`, async (data: TParamsUpdateWard) => {
    const response = await updateWard(data)
    return response
})


export const deleteWardAsync = createAsyncThunk(`${serviceName}/delete`, async (id: number) => {
    const response = await deleteWard(id)
    return response
})

export const deleteMultipleWardsAsync = createAsyncThunk(`${serviceName}/delete-multiple`, async (data: TParamsDeleteMultipleWards) => {
    const response = await deleteMultipleWards(data)
    return response
})