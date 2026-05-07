import { createAsyncThunk } from "@reduxjs/toolkit";

//services
import { createBrand, deleteMultipleBrands, deleteBrand, getAllBrands, updateBrand } from "src/services/brand";

//types
import { TParamsCreateBrand, TParamsDeleteMultipleBrands, TParamsGetAllBrands, TParamsUpdateBrand } from "src/types/brand";

export const serviceName = 'brand'

export const getAllBrandsAsync = createAsyncThunk(`${serviceName}/get-all`, async (data: { params: TParamsGetAllBrands }) => {
    const response = await getAllBrands(data)
    return response
})

export const createBrandAsync = createAsyncThunk(`${serviceName}/create`, async (data: TParamsCreateBrand) => {
    const response = await createBrand(data)
    return response
})

export const updateBrandAsync = createAsyncThunk(`${serviceName}/update`, async (data: TParamsUpdateBrand) => {
    const response = await updateBrand(data)
    return response
})

export const deleteBrandAsync = createAsyncThunk(`${serviceName}/delete`, async (id: number) => {
    const response = await deleteBrand(id)
    return response
})

export const deleteMultipleBrandsAsync = createAsyncThunk(`${serviceName}/delete-multiple`, async (data: TParamsDeleteMultipleBrands) => {
    const response = await deleteMultipleBrands(data)
    return response
})