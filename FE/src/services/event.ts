import { API_ENDPOINT } from "src/configs/api"
import instance from "src/helpers/axios"
import { TParamsCreateEvent, TParamsDeleteMultipleEvents, TParamsGetAllEvents, TParamsUpdateEvent, TParamsUpdateEventActive } from "src/types/event"

export const getAllEvents= async (data: {params: TParamsGetAllEvents}) => {
    try {
        const res = await instance.get(`${API_ENDPOINT.EVENT.INDEX}`, data)
        return res.data
    } catch (error) {
        return error
    }
}

export const getEventCode= async (data: {params: TParamsGetAllEvents}) => {
    try {
        const res = await instance.get(`${API_ENDPOINT.EVENT.INDEX}/get-code-by-last-id`, data)
        return res.data
    } catch (error) {
        return error
    }
}

export const createEvent = async (data: TParamsCreateEvent) => {
    try {
        const res = await instance.post(`${API_ENDPOINT.EVENT.INDEX}`, data)
        return res.data
    } 
    catch (error: any) {
        return error?.response?.data
    }
}


export const updateEvent = async (data: TParamsUpdateEvent) => {

    try {
        const res = await instance.put(`${API_ENDPOINT.EVENT.INDEX}/${data.id}`, data)
        return res.data
    } catch (error: any) {
        return error
    }
}


export const deleteEvent = async (id: number) => {
    try {
        const res = await instance.delete(`${API_ENDPOINT.EVENT.INDEX}/${id}`)
        return res.data
    } catch (error: any) {
        return error?.response?.data
    }
}

export const getEventDetail = async (id: number) => {
    try {
        const res = await instance.get(`${API_ENDPOINT.EVENT.INDEX}/${id}`)
        return res.data
    } catch (error: any) {
        return error?.response?.data
    }
}

export const deleteMultipleEvents= async (data: TParamsDeleteMultipleEvents) => {
    try {
        const res = await instance.delete(`${API_ENDPOINT.EVENT.INDEX}`, {data})
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


export const updateEventActive = async (data: TParamsUpdateEventActive) => {
    try {
        const res: any = await instance.put(`${API_ENDPOINT.EVENT.INDEX}/change-active/${data.id}`, data)
        return res
    }
    catch (error: any) {
        return error?.response?.data
    }
}