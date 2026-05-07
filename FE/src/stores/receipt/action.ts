import { createAsyncThunk } from "@reduxjs/toolkit";

//services
import { createReceipt, deleteMultipleReceipts, deleteReceipt, getAllReceipts, updateMultipleReceiptStatus, updateReceipt, updateReceiptStatus } from "src/services/receipt";

//types
import { TParamsCreateReceipt, TParamsDeleteMultipleReceipts, TParamsGetAllReceipts, TParamsUpdateMultipleReceiptStatus, TParamsUpdateReceipt, TParamsUpdateReceiptStatus } from "src/types/receipt";

export const serviceName = 'receipt'

export const getAllReceiptsAsync = createAsyncThunk(`${serviceName}/get-all`, async (data: { params: TParamsGetAllReceipts }) => {
    const response = await getAllReceipts(data)
    return response
})

export const createReceiptAsync = createAsyncThunk(`${serviceName}/create`, async (data: TParamsCreateReceipt) => {
    const response = await createReceipt(data)
    return response
})

export const updateReceiptStatusAsync = createAsyncThunk(`${serviceName}/update-status`, async (data: TParamsUpdateReceiptStatus) => {
    const response = await updateReceiptStatus(data)
    return response
})

export const updateMultipleReceiptStatusAsync = createAsyncThunk(`${serviceName}/update-multiple-status`, async (data: TParamsUpdateMultipleReceiptStatus) => {
    const response = await updateMultipleReceiptStatus(data)
    return response
})

export const updateReceiptAsync = createAsyncThunk(`${serviceName}/update`, async (data: TParamsUpdateReceipt) => {
    const response = await updateReceipt(data)
    return response
})


export const deleteReceiptAsync = createAsyncThunk(`${serviceName}/delete`, async (id: number) => {
    const response = await deleteReceipt(id)
    return response
})

export const deleteMultipleReceiptsAsync = createAsyncThunk(`${serviceName}/delete-multiple`, async (data: TParamsDeleteMultipleReceipts) => {
    const response = await deleteMultipleReceipts(data)
    return response
})