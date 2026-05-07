import { API_ENDPOINT } from "src/configs/api"
import instance from "src/helpers/axios"
import { TParamsCreateEmployee, TParamsDeleteMultipleEmployees, TParamsGetAllEmployees, TParamsUpdateEmployee } from "src/types/employee"

export const getAllEmployees = async (data: {params: TParamsGetAllEmployees}) => {
    try {
        const res = await instance.get(`${API_ENDPOINT.USER.EMPLOYEE.INDEX}`, data)
        return res.data
    } catch (error) {
        return error
    }
}

export const getEmployeeCode = async (data: {params: {type: number}}) => {
    try {
        const res = await instance.get(`${API_ENDPOINT.USER.INDEX}/get-code-by-last-id`, data)
        return res.data
    } catch (error) {
        return error
    }
}

export const createEmployee = async (data: TParamsCreateEmployee) => {
    try {
        const res = await instance.post(`${API_ENDPOINT.USER.EMPLOYEE.INDEX}`, data)
        return res.data
    } 
    catch (error: any) {
        return error?.response?.data
    }
}


export const updateEmployee = async (data: TParamsUpdateEmployee) => {
    const { id, ...rests } = data
    try {
        const res = await instance.put(`${API_ENDPOINT.USER.EMPLOYEE.INDEX}/${data.id}`, data)
        return res.data
    } catch (error: any) {
        return error?.response?.data
    }
}


export const deleteEmployee = async (id: number) => {
    try {
        const res = await instance.delete(`${API_ENDPOINT.USER.EMPLOYEE.DELETE}/${id}`)
        return res.data
    } catch (error: any) {
        return error?.response?.data
    }
}

export const getEmployeeDetail = async (id: number) => {
    try {
        const res = await instance.get(`${API_ENDPOINT.USER.EMPLOYEE.INDEX}/${id}`)
        return res.data
    } catch (error: any) {
        return error?.response?.data
    }
}


export const deleteMultipleEmployees = async (data: TParamsDeleteMultipleEmployees) => {
    try {
        const res = await instance.delete(`${API_ENDPOINT.USER.EMPLOYEE.INDEX}`, {data})
        if(res?.data?.status === "Success") {
            return {
                data: []
            }
        }
        return {
            data: null
        }
    } catch (error: any) {
        return error?.response?.data
    }
}