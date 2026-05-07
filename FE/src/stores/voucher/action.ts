import { createAsyncThunk } from "@reduxjs/toolkit";

//services
import { createVoucher, deleteMultipleVouchers, deleteVoucher, getAllVouchers, updateVoucher, getVoucherCode } from "src/services/voucher";

//types
import { TParamsCreateVoucher, TParamsDeleteMultipleVouchers, TParamsGetAllVouchers, TParamsUpdateVoucher } from "src/types/voucher";

export const serviceName = 'voucher'

export const getAllVouchersAsync = createAsyncThunk(`${serviceName}/get-all`, async (data: {params: TParamsGetAllVouchers}) => {
    const response = await getAllVouchers(data)
    return response
})

export const getVoucherCodeAsync = createAsyncThunk(`${serviceName}/get-code`, async (data: {params: TParamsGetAllVouchers}) => {
    const response = await getVoucherCode(data)
    return response
})


export const createVoucherAsync = createAsyncThunk(`${serviceName}/create`, async (data: TParamsCreateVoucher) => {
    const response = await createVoucher(data)
    return response
})

export const updateVoucherAsync = createAsyncThunk(`${serviceName}/update`, async (data: TParamsUpdateVoucher) => {
    const response = await updateVoucher(data)
    return response
})


export const deleteVoucherAsync = createAsyncThunk(`${serviceName}/delete`, async (id: number) => {
    const response = await deleteVoucher(id)
    return response
})

export const deleteMultipleVouchersAsync = createAsyncThunk(`${serviceName}/delete-multiple`, async (data: TParamsDeleteMultipleVouchers) => {
    const response = await deleteMultipleVouchers(data)
    return response
})