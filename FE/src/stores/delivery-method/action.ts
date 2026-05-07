import { createAsyncThunk } from "@reduxjs/toolkit";

//services
import { createDeliveryMethod, deleteMultipleDeliveryMethods, deleteDeliveryMethod, getAllDeliveryMethods, updateDeliveryMethod } from "src/services/delivery-method";

//types
import { TParamsCreateDeliveryMethod, TParamsDeleteMultipleDeliveryMethods, TParamsGetAllDeliveryMethods, TParamsUpdateDeliveryMethod } from "src/types/delivery-method";

export const serviceName = 'delivery-method'

export const getAllDeliveryMethodsAsync = createAsyncThunk(`${serviceName}/get-all`, async (data: { params: TParamsGetAllDeliveryMethods }) => {
    const response = await getAllDeliveryMethods(data)
    return response
})

export const createDeliveryMethodAsync = createAsyncThunk(`${serviceName}/create`, async (data: TParamsCreateDeliveryMethod) => {
    const response = await createDeliveryMethod(data)
    return response
})

export const updateDeliveryMethodAsync = createAsyncThunk(`${serviceName}/update`, async (data: TParamsUpdateDeliveryMethod) => {
    const response = await updateDeliveryMethod(data)
    return response
})

export const deleteDeliveryMethodAsync = createAsyncThunk(`${serviceName}/delete`, async (id: number) => {
    const response = await deleteDeliveryMethod(id)
    return response
})

export const deleteMultipleDeliveryMethodsAsync = createAsyncThunk(`${serviceName}/delete-multiple`, async (data: TParamsDeleteMultipleDeliveryMethods) => {
    const response = await deleteMultipleDeliveryMethods(data)
    return response
})