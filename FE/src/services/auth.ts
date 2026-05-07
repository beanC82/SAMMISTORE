import axios from "axios"

//config
import { API_ENDPOINT } from "src/configs/api"
import instance from "src/helpers/axios"

//types
import { TChangePassword, TLoginAuth, TRegisterAuth, TUpdateProfile } from "src/types/auth"

export const loginAuth = async (data: TLoginAuth) => {
    try {
        const res = await instance.post(`${API_ENDPOINT.AUTH.INDEX}/login`, {
            username: data.username,
            password: data.password,
            rememberMe: data.rememberMe || true,
            returnUrl: data.returnUrl || '/',
            isEmployee: data.isEmployee || false,
        });

        return res.data;
    } catch (error: any) {
        throw error;
    }
};

export const loginAdminAuth = async (data: TLoginAuth) => {
    try {
        const res = await instance.post(`${API_ENDPOINT.AUTH.INDEX}/login`, {
            username: data.username,
            password: data.password,
            rememberMe: data.rememberMe || true,
            returnUrl: data.returnUrl || '/',
            isEmployee: data.isEmployee || true,
        });

        return res.data;
    } catch (error: any) {
        throw error;
    }
};

export const getLoginUser = async () => {
    try {
        const res = await instance.get(`${API_ENDPOINT.USER.ME.INDEX}`)
        return res.data
    } catch (error) {
        return error
    }
}

export const updateProfile = async (data: TUpdateProfile) => {
    try {
        const res = await instance.post(`${API_ENDPOINT.USER.INDEX}/update-customer-info`, data)
        return res.data
    } catch (error) {
        return error
    }
}

export const logoutAuth = async () => {
    const res = await instance.post(`${API_ENDPOINT.AUTH.INDEX}/logout`)
    return res.data
}

export const registerAuth = async (data: TRegisterAuth) => {
    try {
        const res = await axios.post(`${API_ENDPOINT.AUTH.INDEX}/register`, data)
        return res.data
    } catch (error) {
        return error
    }
}

export const updateAuthMe = async (data: any) => {
    try {
        const res = await instance.put(`${API_ENDPOINT.AUTH.INDEX}/me`, data)
        return res.data
    } catch (error) {
        return error
    }
}

export const getAuthMe = async () => {
    try {
        const res = await instance.get(`${API_ENDPOINT.AUTH.INDEX}/me`)
        return res.data
    } catch (error) {
        return error
    }
}

export const changePasswordMe = async (data: TChangePassword) => {
    try {
        const res = await instance.post(`${API_ENDPOINT.AUTH.INDEX}/change-password`, data)
        return res.data
    } catch (error) {
        return error
    }
}