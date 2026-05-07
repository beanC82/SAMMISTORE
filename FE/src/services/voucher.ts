import { API_ENDPOINT } from "src/configs/api"
import instance from "src/helpers/axios"
import { TParamsApplyMyVoucher, TParamsApplyVoucher, TParamsCreateVoucher, TParamsDeleteMultipleVouchers, TParamsFetchListApplyVoucher, TParamsGetAllVouchers, TParamsUpdateVoucher } from "src/types/voucher"

export const getAllVouchers = async (data: { params: TParamsGetAllVouchers }) => {
    try {
        const res = await instance.get(`${API_ENDPOINT.VOUCHER.INDEX}`, data)
        return res.data
    } catch (error) {
        return error
    }
}

export const getMyVouchers = async (data: { params: TParamsGetAllVouchers }) => {
    try {
        const res = await instance.get(`${API_ENDPOINT.VOUCHER.INDEX}/my-voucher`, data)
        return res.data
    } catch (error) {
        return error
    }
}

export const getTopVouchers = async (data: {numberTop: number, isPublic: boolean}) => {
    try {
        const res = await instance.get(`${API_ENDPOINT.VOUCHER.INDEX}/get-top-vouchers`, {params: data})
        return res.data
    } catch (error) {
        return error
    }
}

export const getVoucherCode = async (data: { params: TParamsGetAllVouchers }) => {
    try {
        const res = await instance.get(`${API_ENDPOINT.VOUCHER.INDEX}/get-code-by-last-id`, data)
        return res.data
    } catch (error) {
        return error
    }
}

export const createVoucher = async (data: TParamsCreateVoucher) => {
    try {
        const res = await instance.post(`${API_ENDPOINT.VOUCHER.INDEX}`, data)
        return res.data
    }
    catch (error: any) {
        return error?.response?.data
    }
}

export const saveVoucher = async (voucherId: number) => {
    try {
        const res = await instance.post(`${API_ENDPOINT.VOUCHER.INDEX}/save-voucher`, voucherId)
        return res.data
    }
    catch (error: any) {
        return error?.response?.data
    }
}

export const fetchListApplyVoucher = async (data: TParamsFetchListApplyVoucher) => {
    try {
        const res = await instance.post(`${API_ENDPOINT.VOUCHER.INDEX}/my-voucher-apply`, data)
        return res.data
    }
    catch (error: any) {
        return error?.response?.data
    }
}

export const applyVoucher = async (voucherCode: string, data: TParamsApplyMyVoucher) => {
    try {
        const res = await instance.post(`${API_ENDPOINT.VOUCHER.INDEX}/apply-voucher/${voucherCode}`, data);
        return res.data;
    } catch (error: any) {
        return error?.response?.data;
    }
}

export const updateVoucher = async (data: TParamsUpdateVoucher) => {

    try {
        const res = await instance.put(`${API_ENDPOINT.VOUCHER.INDEX}/${data.id}`, data)
        return res.data
    } catch (error: any) {
        return error
    }
}


export const deleteVoucher = async (id: number) => {
    try {
        const res = await instance.delete(`${API_ENDPOINT.VOUCHER.INDEX}/${id}`)
        return res.data
    } catch (error: any) {
        return error?.response?.data
    }
}

export const getVoucherDetail = async (id: number) => {
    try {
        const res = await instance.get(`${API_ENDPOINT.VOUCHER.INDEX}/${id}`)
        return res.data
    } catch (error: any) {
        return error?.response?.data
    }
}

export const deleteMultipleVouchers = async (data: TParamsDeleteMultipleVouchers) => {
    try {
        const res = await instance.delete(`${API_ENDPOINT.VOUCHER.INDEX}`, { data })
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