import { API_ENDPOINT } from "src/configs/api"
import instance from "src/helpers/axios"
import { TParamsCreateReceipt, TParamsDeleteMultipleReceipts, TParamsGetAllReceipts, TParamsUpdateMultipleReceiptStatus, TParamsUpdateReceipt, TParamsUpdateReceiptStatus } from "src/types/receipt"

export const getAllReceipts = async (data: { params: TParamsGetAllReceipts }) => {
    try {
        const res = await instance.get(`${API_ENDPOINT.GOODS_RECEIPT.INDEX}`, data)
        return res.data
    } catch (error) {
        return error
    }
}

export const getReceiptCode = async () => {
    try {
        const res = await instance.get(`${API_ENDPOINT.GOODS_RECEIPT.INDEX}/get-code-by-last-id`)
        return res.data
    } catch (error) {
        return error
    }
}

export const createReceipt = async (data: TParamsCreateReceipt) => {
    try {
        const res = await instance.post(`${API_ENDPOINT.GOODS_RECEIPT.INDEX}`, data)
        return res.data
    }
    catch (error: any) {
        return error?.response?.data
    }
}

export const updateReceiptStatus = async (data: TParamsUpdateReceiptStatus) => {
    try {
        const res: any = await instance.post(`${API_ENDPOINT.GOODS_RECEIPT.INDEX}/update-status`, data)
        return res
    }
    catch (error: any) {
        return error?.response?.data
    }
}

export const updateMultipleReceiptStatus = async (data: TParamsUpdateMultipleReceiptStatus) => {
    try {
        const res: any = await instance.post(`${API_ENDPOINT.GOODS_RECEIPT.INDEX}/update-purchases-status`, data)
        return res
    }
    catch (error: any) {
        return error?.response?.data
    }
}


export const updateReceipt = async (data: TParamsUpdateReceipt) => {
    // const { id, ...rests } = data
    try {
        const res = await instance.put(`${API_ENDPOINT.GOODS_RECEIPT.INDEX}/${data.id}`, data)
        return res.data
    } catch (error: any) {
        return error
    }
}


export const deleteReceipt = async (id: number) => {
    try {
        const res = await instance.delete(`${API_ENDPOINT.GOODS_RECEIPT.INDEX}/${id}`)
        return res.data
    } catch (error: any) {
        return error?.response?.data
    }
}

export const getReceiptDetail = async (id: number) => {
    try {
        const res = await instance.get(`${API_ENDPOINT.GOODS_RECEIPT.INDEX}/${id}`)
        return res.data
    } catch (error: any) {
        return error?.response?.data
    }
}

export const deleteMultipleReceipts = async (data: TParamsDeleteMultipleReceipts) => {
    try {
        const res = await instance.delete(`${API_ENDPOINT.GOODS_RECEIPT.INDEX}`, { data })
        if (res?.data?.status === "Success") {
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