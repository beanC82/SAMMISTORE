import { createAsyncThunk } from "@reduxjs/toolkit";
import { createEmployee, deleteEmployee, deleteMultipleEmployees, getAllEmployees, updateEmployee } from "src/services/employee";

//service
import { TParamsCreateEmployee, TParamsDeleteMultipleEmployees, TParamsGetAllEmployees, TParamsUpdateEmployee } from "src/types/employee";

export const serviceName = 'employee'

export const getAllEmployeesAsync = createAsyncThunk(`${serviceName}/get-all`, async (data: { params: TParamsGetAllEmployees }) => {
    const response = await getAllEmployees(data)
    return response
})

export const createEmployeeAsync = createAsyncThunk(`${serviceName}/create`, async (data: TParamsCreateEmployee) => {
    const response = await createEmployee(data)
    return response
})

export const updateEmployeeAsync = createAsyncThunk(`${serviceName}/update`, async (data: TParamsUpdateEmployee) => {
    const response = await updateEmployee(data)
    return response
})

export const deleteEmployeeAsync = createAsyncThunk(`${serviceName}/delete`, async (id: number) => {
    const response = await deleteEmployee(id)
    return response
})

export const deleteMultipleEmployeesAsync = createAsyncThunk(`${serviceName}/delete-multiple`, async (data: TParamsDeleteMultipleEmployees) => {
    const response = await deleteMultipleEmployees(data)
    return response
})