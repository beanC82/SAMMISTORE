import { createAsyncThunk } from "@reduxjs/toolkit";
import { createSupplier, deleteSupplier, deleteMultipleSuppliers, getAllSuppliers, updateSupplier } from "src/services/supplier";

//service
import { TParamsCreateSupplier, TParamsDeleteMultipleSuppliers, TParamsGetAllSuppliers, TParamsUpdateSupplier } from "src/types/supplier";

export const serviceName = 'supplier'

export const getAllSuppliersAsync = createAsyncThunk(`${serviceName}/get-all`, async (data: { params: TParamsGetAllSuppliers }) => {
    const response = await getAllSuppliers(data)
    return response
})

export const createSupplierAsync = createAsyncThunk(`${serviceName}/create`, async (data: TParamsCreateSupplier) => {
    const response = await createSupplier(data)
    return response
})

export const updateSupplierAsync = createAsyncThunk(`${serviceName}/update`, async (data: TParamsUpdateSupplier) => {
    const response = await updateSupplier(data)
    return response
})

export const deleteSupplierAsync = createAsyncThunk(`${serviceName}/delete`, async (id: number) => {
    const response = await deleteSupplier(id)
    return response
})

export const deleteMultipleSuppliersAsync = createAsyncThunk(`${serviceName}/delete-multiple`, async (data: TParamsDeleteMultipleSuppliers) => {
    const response = await deleteMultipleSuppliers(data)
    return response
})