import { createAsyncThunk } from "@reduxjs/toolkit";

//services
import { createDistrict, deleteMultipleDistricts, deleteDistrict, getAllDistricts, updateDistrict } from "src/services/district";

//types
import { TParamsCreateDistrict, TParamsDeleteMultipleDistricts, TParamsGetAllDistricts, TParamsUpdateDistrict } from "src/types/district";

export const serviceName = 'district'

export const getAllDistrictsAsync = createAsyncThunk(`${serviceName}/get-all`, async (data: { params: TParamsGetAllDistricts }) => {
    const response = await getAllDistricts(data)
    return response
})

export const createDistrictAsync = createAsyncThunk(`${serviceName}/create`, async (data: TParamsCreateDistrict) => {
    const response = await createDistrict(data)
    return response
})

export const updateDistrictAsync = createAsyncThunk(`${serviceName}/update`, async (data: TParamsUpdateDistrict) => {
    const response = await updateDistrict(data)
    return response
})


export const deleteDistrictAsync = createAsyncThunk(`${serviceName}/delete`, async (id: number) => {
    const response = await deleteDistrict(id)
    return response
})

export const deleteMultipleDistrictsAsync = createAsyncThunk(`${serviceName}/delete-multiple`, async (data: TParamsDeleteMultipleDistricts) => {
    const response = await deleteMultipleDistricts(data)
    return response
})