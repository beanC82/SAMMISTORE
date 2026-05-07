import { API_ENDPOINT } from "src/configs/api"
import instance from "src/helpers/axios"


export const getAllDiscountType= async () => {
    try {
        const res = await instance.get(`${API_ENDPOINT.DISCOUNT_TYPE.INDEX}`)
        return res.data
    } catch (error) {
        return error
    }
}


export const getDiscountTypeDetail = async (id: number) => {
    try {
        const res = await instance.get(`${API_ENDPOINT.DISCOUNT_TYPE.INDEX}/${id}`)
        return res.data
    } catch (error: any) {
        return error?.response?.data
    }
}
