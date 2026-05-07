import axios from "axios"
import { is } from "immutable"
import { API_ENDPOINT } from "src/configs/api"
import instance from "src/helpers/axios"
import { TParamsCreateProduct, TParamsDeleteMultipleProducts, TParamsGetAllProducts, TParamsGetRelatedProduct, TParamsGetRelatedProducts, TParamsUpdateProduct, TParamsGetSuggest } from "src/types/product"



export const getAllProducts = async (data: {params: TParamsGetAllProducts}) => {
    try {
        const res = await instance.get(`${API_ENDPOINT.MANAGE_PRODUCT.PRODUCT.INDEX}`, data)
        return res.data
    } catch (error) {
        return error
    }
}

export const getEndowProducts = async (data: {numberTop: number, isPublic: boolean}) => {
    try {
        const res = await instance.get(`${API_ENDPOINT.MANAGE_PRODUCT.PRODUCT.INDEX}/get-products-endow`, {params: data})
        return res.data
    } catch (error) {
        return error
    }
}

export const getBestSellingProducts = async (data: {numberTop: number, isPublic: boolean}) => {
    try {
        const res = await instance.get(`${API_ENDPOINT.MANAGE_PRODUCT.PRODUCT.INDEX}/get-product-best-selling`, {params: data})
        return res.data
    } catch (error) {
        return error
    }
}

export const getSuggestProduct = async (data: {params: TParamsGetSuggest}) => {
    try {
        const res = await instance.get(`${API_ENDPOINT.MANAGE_PRODUCT.PRODUCT.INDEX}/get-suggest`, data)
        return res.data
    } catch (error) {
        return error
    }
}

export const getProductCode = async (data: {params: TParamsGetAllProducts}) => {
    try {
        const res = await instance.get(`${API_ENDPOINT.MANAGE_PRODUCT.PRODUCT.INDEX}/get-code-by-last-id`, data)
        return res.data
    } catch (error) {
        return error
    }
}

export const getAllProductsPublic = async (data: {params: TParamsGetAllProducts}) => {
    try {
        const res = await axios.get(`${API_ENDPOINT.MANAGE_PRODUCT.PRODUCT.INDEX}/public`, data)
        return res.data
    } catch (error) {
        return error
    }
}

export const createProduct = async (data: TParamsCreateProduct) => {
    try {
        const res = await instance.post(`${API_ENDPOINT.MANAGE_PRODUCT.PRODUCT.INDEX}`, data)
        return res.data
    }
    catch (error: any) {
        return error?.response?.data
    }
}


export const updateProduct = async (data: TParamsUpdateProduct) => {
    const { id, ...rests } = data
    try {
        const res = await instance.put(`${API_ENDPOINT.MANAGE_PRODUCT.PRODUCT.INDEX}/${data.id}`, data)
        return res.data
    } catch (error: any) {
        return error?.response?.data
    }
}


export const deleteProduct = async (id: number) => {
    try {
        const res = await instance.delete(`${API_ENDPOINT.MANAGE_PRODUCT.PRODUCT.INDEX}/${id}`)
        return res.data
    } catch (error: any) {
        return error?.response?.data
    }
}

export const getProductDetail = async (id: number) => {
    try {
        const res = await instance.get(`${API_ENDPOINT.MANAGE_PRODUCT.PRODUCT.INDEX}/${id}`)
        return res.data
    } catch (error: any) {
        return error?.response?.data
    }
}

export const getPublicProductDetail = async (id: number) => {
    try {
        const res = await instance.get(`${API_ENDPOINT.MANAGE_PRODUCT.PRODUCT.INDEX}/get-product/${id}`, {params: {isPublic: true}})
        return res.data
    } catch (error: any) {
        return error?.response?.data
    }
}

export const getProductDetailPublic = async (id: number) => {
    try {
        const res = await axios.get(`${API_ENDPOINT.MANAGE_PRODUCT.PRODUCT.INDEX}/public/${id}`)
        return res.data
    } catch (error: any) {
        return error?.response?.data
    }
}

export const getProductDetailPublicBySlug = async (slug: string) => {
    try {

        const data = {params: {isPublic: true}}

        const res = await axios.get(`${API_ENDPOINT.MANAGE_PRODUCT.PRODUCT.INDEX}/public/slug/${slug}`, data)
        return res.data
    } catch (error: any) {
        return error?.response?.data
    }
}

export const getListRelatedProductBySlug = async (data: {params: TParamsGetRelatedProduct}) => {
    try {
        const res = await axios.get(`${API_ENDPOINT.MANAGE_PRODUCT.PRODUCT.INDEX}/related`, data)
        return res.data
    } catch (error: any) {
        return error?.response?.data
    }
}

export const getListRelatedProducts = async (data: {params: TParamsGetRelatedProducts}) => {
    try {
        const res = await instance.get(`${API_ENDPOINT.MANAGE_PRODUCT.PRODUCT.INDEX}/get-related-products`, {
            ...data,
            params: {
                ...data.params,
                isPublic: true
            }
        })
        return res.data
    } catch (error: any) {
        return error?.response?.data
    }
}


export const deleteMultipleProducts = async (data: TParamsDeleteMultipleProducts) => {
    try {
        const res = await instance.delete(`${API_ENDPOINT.MANAGE_PRODUCT.PRODUCT.INDEX}`, {data})
        return res.data
    } catch (error: any) {
        return error?.response?.data
    }
}


export const likeProduct = async (productId: number) => {
    try {
        const res = await instance.post(`${API_ENDPOINT.FAVOURITE_PRODUCT.INDEX}/${productId}`)
        return res.data
    } catch (error: any) {
        return error?.response?.data
    }
}

export const unlikeProduct = async (productId: number) => {
    try {
        const res = await instance.delete(`${API_ENDPOINT.FAVOURITE_PRODUCT.INDEX}/${productId}`)
        return res.data
    } catch (error: any) {
        return error?.response?.data
    }
}


export const getMyLikedProduct = async (data: {params: TParamsGetAllProducts}) => {
    try {
        const res = await instance.get(`${API_ENDPOINT.FAVOURITE_PRODUCT.INDEX}`, data)
        return res.data
    } catch (error: any) {
        return error?.response?.data
    }
}

export const getAllLikedProduct = async (data: {params: TParamsGetAllProducts}) => {
    try {
        const res = await instance.get(`${API_ENDPOINT.FAVOURITE_PRODUCT.INDEX}`, data)
        return res.data
    } catch (error: any) {
        return error?.response?.data
    }
}

export const getAllViewedProduct = async (data: {params: TParamsGetAllProducts}) => {
    try {
        const res = await instance.get(`${API_ENDPOINT.MANAGE_PRODUCT.PRODUCT.INDEX}/viewed/me`, data)
        return res.data
    } catch (error: any) {
        return error?.response?.data
    }
}

export const getAllProductsByCategoryId = async (data: {params: TParamsGetAllProducts}) => {
    try {
        const res = await instance.get(`${API_ENDPOINT.MANAGE_PRODUCT.PRODUCT.INDEX}/get-products-by-category`, {
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