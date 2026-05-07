import { API_ENDPOINT } from "src/configs/api"
import instance from "src/helpers/axios"
import { TParamsCreateRole, TParamsGetAllRoles, TParamsUpdateRole } from "src/types/role"

export const getAllRoles = async (data: {params: TParamsGetAllRoles}) => {
    try {
        const res = await instance.get(`${API_ENDPOINT.SYSTEM.ROLE.INDEX}`, data)
        return res.data
    } catch (error: any) {
        return error?.response?.data
    }
}

export const createRole = async (data: TParamsCreateRole) => {
    try {
        const res = await instance.post(`${API_ENDPOINT.SYSTEM.ROLE.INDEX}`, data)
        return res.data
    } 
    catch (error: any) {
        return error?.response?.data
    }
}


export const updateRole = async (data: TParamsUpdateRole) => {
    const { id, ...rests } = data
    try {
        const res = await instance.put(`${API_ENDPOINT.SYSTEM.ROLE.INDEX}/${id}`, rests)
        return res.data
    } catch (error: any) {
        return error?.response?.data
    }
}


export const deleteRole = async (id: number) => {
    try {
        const res = await instance.delete(`${API_ENDPOINT.SYSTEM.ROLE.INDEX}/${id}`)
        return res.data
    } catch (error: any) {
        return error?.response?.data
    }
}

export const getRoleDetail = async (id: number) => {
    try {
        const res = await instance.get(`${API_ENDPOINT.SYSTEM.ROLE.INDEX}/${id}`)
        return res.data
    } catch (error: any) {
        return error?.response?.data
    }
}