import { createAsyncThunk } from "@reduxjs/toolkit";
import { createRole, deleteRole, getAllRoles, updateRole } from "src/services/role";
import { TParamsCreateRole, TParamsGetAllRoles, TParamsUpdateRole } from "src/types/role";

export const serviceName = 'role'

export const getAllRolesAsync = createAsyncThunk(`${serviceName}/get-all`, async (data: { params: TParamsGetAllRoles }) => {
    const response = await getAllRoles(data)
    return response
})

export const createRoleAsync = createAsyncThunk(`${serviceName}/create`, async (data: TParamsCreateRole) => {
    const response = await createRole(data)
    return response
})

export const updateRoleAsync = createAsyncThunk(`${serviceName}/update`, async (data: TParamsUpdateRole) => {
    const response = await updateRole(data)
    return response
})

export const deleteRoleAsync = createAsyncThunk(`${serviceName}/delete`, async (id: number) => {
    const response = await deleteRole(id)
    return response
})