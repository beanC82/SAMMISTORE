import { createAsyncThunk } from "@reduxjs/toolkit";
import { createReview, deleteMultipleReview, deleteMyReview, deleteReview, getAllManageReviews, getAllReviews, updateMyReview, updateReview } from "src/services/review";
import { TParamsCreateReview, TParamsDeleteMultipleReviews, TParamsGetAllReviews, TParamsUpdateReview } from "src/types/review";

export const serviceName = 'review'

export const getAllReviewsAsync = createAsyncThunk(`${serviceName}/get-all`, async (data: { params: TParamsGetAllReviews }) => {
    const response = await getAllReviews(data)
    return response
})

export const createReviewAsync = createAsyncThunk(`${serviceName}/create`, async (data: TParamsCreateReview) => {
    const response = await createReview(data)
    return response
})

export const updateReviewAsync = createAsyncThunk(`${serviceName}/update`, async (data: TParamsUpdateReview) => {
    const response = await updateReview(data)
    return response
})

export const updateMyReviewAsync = createAsyncThunk(`${serviceName}/my-update`, async (data: TParamsUpdateReview) => {
    const response = await updateMyReview(data)
    return response
})

export const deleteReviewAsync = createAsyncThunk(`${serviceName}/delete`, async (id: number) => {
    const response = await deleteReview(id)
    return response
})

export const deleteMyReviewAsync = createAsyncThunk(`${serviceName}/delete-me`, async (id: number) => {
    const response = await deleteMyReview(id)
    return response
})

export const deleteMultipleReviewAsync = createAsyncThunk(`${serviceName}/delete-multiple`, async (data: TParamsDeleteMultipleReviews) => {
    const response = await deleteMultipleReview(data)
    return response
})
