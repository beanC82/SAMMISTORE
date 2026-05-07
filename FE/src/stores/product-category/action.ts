import { createAsyncThunk } from "@reduxjs/toolkit";

//services
import { createProductCategory, deleteMultipleProductCategories, deleteProductCategory, getAllProductCategories, updateProductCategory } from "src/services/product-category";

//types
import { TParamsCreateProductCategory, TParamsDeleteMultipleProductCategories, TParamsGetAllProductCategories, TParamsUpdateProductCategory } from "src/types/product-category";

export const serviceName = 'product-category'

export const getAllProductCategoriesAsync = createAsyncThunk(`${serviceName}/get-all`, async (data: { params: TParamsGetAllProductCategories }) => {
    const response = await getAllProductCategories(data)
    return response
})

export const createProductCategoryAsync = createAsyncThunk(`${serviceName}/create`, async (data: TParamsCreateProductCategory) => {
    const response = await createProductCategory(data)
    return response
})

export const updateProductCategoryAsync = createAsyncThunk(`${serviceName}/update`, async (data: TParamsUpdateProductCategory) => {
    const response = await updateProductCategory(data)
    return response
})

export const deleteProductCategoryAsync = createAsyncThunk(`${serviceName}/delete`, async (id: number) => {
    const response = await deleteProductCategory(id)
    return response
})

export const deleteMultipleProductCategoriesAsync = createAsyncThunk(`${serviceName}/delete-multiple`, async (data: TParamsDeleteMultipleProductCategories) => {
    const response = await deleteMultipleProductCategories(data)
    return response
})