import { createAsyncThunk } from "@reduxjs/toolkit";

//services
import { createPaymentMethod, deleteMultiplePaymentMethods, deletePaymentMethod, getAllPaymentMethods, updatePaymentMethod } from "src/services/payment-method";

//types
import { TParamsCreatePaymentMethod, TParamsDeleteMultiplePaymentMethods, TParamsGetAllPaymentMethods, TParamsUpdatePaymentMethod } from "src/types/payment-method";

export const serviceName = 'paymentMethod'

export const getAllPaymentMethodsAsync = createAsyncThunk(`${serviceName}/get-all`, async (data: { params: TParamsGetAllPaymentMethods }) => {
    const response = await getAllPaymentMethods(data)
    return response
})

export const createPaymentMethodAsync = createAsyncThunk(`${serviceName}/create`, async (data: TParamsCreatePaymentMethod) => {
    const response = await createPaymentMethod(data)
    return response
})

export const updatePaymentMethodAsync = createAsyncThunk(`${serviceName}/update`, async (data: TParamsUpdatePaymentMethod) => {
    const response = await updatePaymentMethod(data)
    return response
})

export const deletePaymentMethodAsync = createAsyncThunk(`${serviceName}/delete`, async (id: number) => {
    const response = await deletePaymentMethod(id)
    return response
})

export const deleteMultiplePaymentMethodsAsync = createAsyncThunk(`${serviceName}/delete-multiple`, async (data: TParamsDeleteMultiplePaymentMethods) => {
    const response = await deleteMultiplePaymentMethods(data)
    return response
})