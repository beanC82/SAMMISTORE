import { createAsyncThunk } from "@reduxjs/toolkit";

//services
import { createAddress, deleteMultipleAddresses, deleteAddress, getAllAddresses, updateAddress, getCurrentAddress } from "src/services/address";

//types
import { TParamsCreateAddress, TParamsDeleteMultipleAddresses, TParamsGetAllAddresses, TParamsUpdateAddress } from "src/types/address";

export const serviceName = 'address'

export const getAllAddressesAsync = createAsyncThunk(`${serviceName}/get-all`, async () => {
    const response = await getAllAddresses()
    return response
})

export const getCurrentAddressAsync = createAsyncThunk(`${serviceName}/get-current`, async () => {
    const response = await getCurrentAddress()
    return response
})

export const createAddressAsync = createAsyncThunk(`${serviceName}/create`, async (data: TParamsCreateAddress) => {
    const response = await createAddress(data)
    return response
})

export const updateAddressAsync = createAsyncThunk(`${serviceName}/update`, async (data: TParamsUpdateAddress) => {
    const response = await updateAddress(data)
    return response
})


export const deleteAddressAsync = createAsyncThunk(`${serviceName}/delete`, async (id: number) => {
    const response = await deleteAddress(id)
    return response
})

export const deleteMultipleAddressesAsync = createAsyncThunk(`${serviceName}/delete-multiple`, async (data: TParamsDeleteMultipleAddresses) => {
    const response = await deleteMultipleAddresses(data)
    return response
})