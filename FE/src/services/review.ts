import { API_ENDPOINT } from "src/configs/api"
import instance from "src/helpers/axios"
import { TParamsCreateReview, TParamsDeleteMultipleReviews, TParamsGetAllReviews, TParamsUpdateReview, TParamsGetAllReviewsByProductId } from "src/types/review"


export const getAllReviews = async (data: {params: TParamsGetAllReviews  }) => {
    try {
        const res = await instance.get(`${API_ENDPOINT.MANAGE_ORDER.REVIEW.INDEX}`, data)
        return res.data
    } catch (error) {
        return error
    }
}

export const getReviewDetail = async (id: number) => {
    try {
        const res = await instance.get(`${API_ENDPOINT.MANAGE_ORDER.REVIEW.INDEX}/${id}`)
        return res.data
    } catch (error) {
        return error
    }
}

export const getAllReviewByProductId = async (data: {params: TParamsGetAllReviewsByProductId }) => {
    try {
        const res = await instance.get(`${API_ENDPOINT.MANAGE_ORDER.REVIEW.INDEX}/get-reviews-product`, {
            ...data,
            params: {
                ...data.params,
                isPublic: true
            }
        })
        return res.data
    } catch (error) {
        return error
    }
}



export const getOverallReview = async (productId: number) => {
    try {
        const res = await instance.get(`${API_ENDPOINT.MANAGE_ORDER.REVIEW.INDEX}/get-overall-rating/${productId}`, {
            params: {
                isPublic: true
            }
        })
        return res.data
    } catch (error) {
        return error
    }
}


export const createReview = async (data: TParamsCreateReview) => {
    try {
        const res = await instance.post(`${API_ENDPOINT.MANAGE_ORDER.REVIEW.INDEX}`, data)
        return res.data
    }
    catch (error: any) {
        return error?.response?.data
    }
}


export const deleteReview = async (id: number) => {
    try {
        const res = await instance.delete(`${API_ENDPOINT.MANAGE_ORDER.REVIEW.INDEX}/${id}`)
        return res.data
    } catch (error: any) {
        return error?.response?.data
    }
}

export const deleteMyReview = async (id: number) => {
    try {
        const res = await instance.delete(`${API_ENDPOINT.MANAGE_ORDER.REVIEW.INDEX}/me/${id}`)
        return res.data
    } catch (error: any) {
        return error?.response?.data
    }
}

export const deleteMultipleReview = async (data: TParamsDeleteMultipleReviews) => {
    try {
        const res = await instance.delete(`${API_ENDPOINT.MANAGE_ORDER.REVIEW.INDEX}`, {data})
        return res.data
    } catch (error: any) {
        return error?.response?.data
    }
}

export const getManageReviewDetail = async (id: number) => {
    try {
        const res = await instance.get(`${API_ENDPOINT.MANAGE_ORDER.REVIEW.INDEX}/${id}`)
        return res.data
    } catch (error: any) {
        return error?.response?.data
    }
}

export const getAllManageReviews = async (data: {params: TParamsGetAllReviews  }) => {
    try {
        const res = await instance.get(`${API_ENDPOINT.MANAGE_ORDER.REVIEW.INDEX}`, data)
        return res.data
    } catch (error) {
        return error
    }
}

export const updateReview = async (data: TParamsUpdateReview) => {
    const { id, ...rests } = data
    try {
        const res = await instance.put(`${API_ENDPOINT.MANAGE_ORDER.REVIEW.INDEX}/${id}`, rests)
        return res.data
    } catch (error: any) {
        return error?.response?.data
    }
}

export const updateMyReview = async (data: TParamsUpdateReview) => {
    const { id, ...rests } = data
    try {
        const res = await instance.put(`${API_ENDPOINT.MANAGE_ORDER.REVIEW.INDEX}/me/${id}`, rests)
        return res.data
    } catch (error: any) {
        return error?.response?.data
    }
}
