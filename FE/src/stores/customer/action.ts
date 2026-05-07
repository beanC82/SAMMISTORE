import { createAsyncThunk } from "@reduxjs/toolkit";
import { createCustomer, deleteCustomer, deleteMultipleCustomers, getAllCustomers, updateCustomer } from "src/services/customer";

//service
import { TParamsCreateCustomer, TParamsDeleteMultipleCustomers, TParamsGetAllCustomers, TParamsUpdateCustomer } from "src/types/customer";

export const serviceName = 'customer'

export const getAllCustomersAsync = createAsyncThunk(`${serviceName}/get-all`, async (data: { params: TParamsGetAllCustomers }) => {
    const response = await getAllCustomers(data)
    return response
})

export const createCustomerAsync = createAsyncThunk(`${serviceName}/create`, async (data: TParamsCreateCustomer) => {
    const response = await createCustomer(data)
    return response
})

export const updateCustomerAsync = createAsyncThunk(`${serviceName}/update`, async (data: TParamsUpdateCustomer) => {
    const response = await updateCustomer(data)
    return response
})

export const deleteCustomerAsync = createAsyncThunk(`${serviceName}/delete`, async (id: number) => {
    const response = await deleteCustomer(id)
    return response
})

export const deleteMultipleCustomersAsync = createAsyncThunk(`${serviceName}/delete-multiple`, async (data: TParamsDeleteMultipleCustomers) => {
    const response = await deleteMultipleCustomers(data)
    return response
})