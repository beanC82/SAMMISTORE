import { createAsyncThunk } from "@reduxjs/toolkit";

//services
import { createUser, deleteMultipleUsers, deleteUser, getAllUsers, updateUser } from "src/services/user";

//types
import { TParamsCreateUser, TParamsDeleteMultipleUsers, TParamsGetAllUsers, TParamsUpdateUser } from "src/types/user";

export const serviceName = 'user'

export const getAllUsersAsync = createAsyncThunk(`${serviceName}/get-all`, async (data: { params: TParamsGetAllUsers }) => {
    const response = await getAllUsers(data)
     return response
})

export const createUserAsync = createAsyncThunk(`${serviceName}/create`, async (data: TParamsCreateUser) => {
    const response = await createUser(data)
    return response
})

export const updateUserAsync = createAsyncThunk(`${serviceName}/update`, async (data: TParamsUpdateUser) => {
    const response = await updateUser(data)
    return response
})

export const deleteUserAsync = createAsyncThunk(`${serviceName}/delete`, async (id: number) => {
    const response = await deleteUser(id)
    return response
})

export const deleteMultipleUsersAsync = createAsyncThunk(`${serviceName}/delete-multiple`, async (data: TParamsDeleteMultipleUsers) => {
    const response = await deleteMultipleUsers(data)
    return response
})