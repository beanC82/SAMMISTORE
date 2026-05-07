import { createAsyncThunk } from "@reduxjs/toolkit";
import { cancelOrder, createOrder, deleteOrder, getAllManageOrders, getAllOrders, getMyOrderDetail, getMyOrders, updateOrder } from "src/services/order";
import { TParamsCreateOrder, TParamsGetAllOrders, TParamsUpdateOrder } from "src/types/order";

export const serviceName = 'order'

export const getAllOrdersAsync = createAsyncThunk(`${serviceName}/get-all-by-me`, async (data: { params: TParamsGetAllOrders }) => {
    const response = await getAllOrders(data)
    return response
})

export const getMyOrdersAsync = createAsyncThunk(`${serviceName}/get-my-orders`, async (data: { params: TParamsGetAllOrders }) => {
    const response = await getMyOrders(data)
    return response
})

export const getMyOrderDetailAsync = createAsyncThunk(`${serviceName}/get-my-order-detail`, async (code: string) => {
    const response = await getMyOrderDetail(code)
    return response
})

export const createOrderAsync = createAsyncThunk(`${serviceName}/create`, async (data: TParamsCreateOrder) => {
    const response = await createOrder(data)
    return response
})

export const cancelOrderAsync = createAsyncThunk(`${serviceName}/cancel`, async (code: string) => {
    const response = await cancelOrder(code)
    return response
})


//admin cms
export const getAllManageOrderAsync = createAsyncThunk(`${serviceName}/get-all`, async (data: { params: TParamsGetAllOrders }) => {
    const response = await getAllManageOrders(data)
    return response
})

export const updateOrderAsync = createAsyncThunk(`${serviceName}/update`, async (data: TParamsUpdateOrder) => {
    const response = await updateOrder(data)
    return response
})


export const deleteOrderAsync = createAsyncThunk(`${serviceName}/delete`, async (id: number) => {
    const response = await deleteOrder(id)
    return response
})
