import { API_ENDPOINT } from "src/configs/api"
import instance from "src/helpers/axios"
import { TParamsCreatePaymentMethod, TParamsDeleteMultiplePaymentMethods, TParamsGetAllPaymentMethods, TParamsUpdatePaymentMethod } from "src/types/payment-method"

export const getAllPaymentMethods = async (data: {params: TParamsGetAllPaymentMethods}) => {
    try {
        const res = await instance.get(`${API_ENDPOINT.SETTING.PAYMENT_METHOD.INDEX}`, data)
        return res.data
    } catch (error) {
        return error
    }
}

export const createPaymentMethod = async (data: TParamsCreatePaymentMethod) => {
    try {
        const res = await instance.post(`${API_ENDPOINT.SETTING.PAYMENT_METHOD.INDEX}`, data)
        return res.data
    } 
    catch (error: any) {
        return error?.response?.data
    }
}

export const updatePaymentMethod = async (data: TParamsUpdatePaymentMethod) => {
    const { id, ...rests } = data
    try {
        const res = await instance.put(`${API_ENDPOINT.SETTING.PAYMENT_METHOD.INDEX}/${id}`, rests)
        return res.data
    } catch (error: any) {
        return error?.response?.data
    }
}

export const deletePaymentMethod = async (id: number) => {
    try {
        const res = await instance.delete(`${API_ENDPOINT.SETTING.PAYMENT_METHOD.INDEX}/${id}`)
        return res.data
    } catch (error: any) {
        return error?.response?.data
    }
}

export const getPaymentMethodDetail = async (id: number) => {
    try {
        const res = await instance.get(`${API_ENDPOINT.SETTING.PAYMENT_METHOD.INDEX}/${id}`)
        return res.data
    } catch (error: any) {
        return error?.response?.data
    }
}

export const deleteMultiplePaymentMethods = async (data: TParamsDeleteMultiplePaymentMethods) => {
    try {
        const res = await instance.delete(`${API_ENDPOINT.SETTING.PAYMENT_METHOD.INDEX}`, {data})
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

export interface PaymentMethod {
  id: number;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
}

export const getPaymentMethods = async () => {
  const response = await instance.get<PaymentMethod[]>(`${API_ENDPOINT.SETTING.PAYMENT_METHOD.INDEX}`);
  return response.data;
};