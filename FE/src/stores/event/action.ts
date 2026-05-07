import { createAsyncThunk } from "@reduxjs/toolkit";

//services
import { createEvent, deleteMultipleEvents, deleteEvent, getAllEvents, updateEvent, getEventCode } from "src/services/event";

//types
import { TParamsCreateEvent, TParamsDeleteMultipleEvents, TParamsGetAllEvents, TParamsUpdateEvent } from "src/types/event";

export const serviceName = 'event'

export const getAllEventsAsync = createAsyncThunk(`${serviceName}/get-all`, async (data: { params: TParamsGetAllEvents }) => {
    const response = await getAllEvents(data)
    return response
})

export const getEventCodeAsync = createAsyncThunk(`${serviceName}/get-code`, async (data: { params: TParamsGetAllEvents }) => {
    const response = await getEventCode(data)
    return response
})

export const createEventAsync = createAsyncThunk(`${serviceName}/create`, async (data: TParamsCreateEvent) => {
    const response = await createEvent(data)
    return response
})

export const updateEventAsync = createAsyncThunk(`${serviceName}/update`, async (data: TParamsUpdateEvent) => {
    const response = await updateEvent(data)
    return response
})


export const deleteEventAsync = createAsyncThunk(`${serviceName}/delete`, async (id: number) => {
    const response = await deleteEvent(id)
    return response
})

export const deleteMultipleEventsAsync = createAsyncThunk(`${serviceName}/delete-multiple`, async (data: TParamsDeleteMultipleEvents) => {
    const response = await deleteMultipleEvents(data)
    return response
})