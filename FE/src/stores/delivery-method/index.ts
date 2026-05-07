// ** Redux Imports
import { createSlice } from '@reduxjs/toolkit'

// ** Action Imports
import { createDeliveryMethodAsync, deleteMultipleDeliveryMethodsAsync, deleteDeliveryMethodAsync, getAllDeliveryMethodsAsync, serviceName, updateDeliveryMethodAsync } from './action'

const initialState = {
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
  typeError: '',
  isSuccessCreateUpdate: false,
  isErrorCreateUpdate: false,
  errorMessageCreateUpdate: '',
  isSuccessDelete: false,
  isErrorDelete: false,
  errorMessageDelete: '',
  isSuccessDeleteMultiple: false,
  isErrorDeleteMultiple: false,
  errorMessageDeleteMultiple: '',

  deliveryMethods: {
    data: [],
    total: 0
  }
}

export const deliveryMethodSlice = createSlice({
  name: serviceName,
  initialState,
  reducers: {
    resetInitialState: state => {
      state.isLoading = false
      state.isSuccess = false
      state.isError = true
      state.message = ""
      state.typeError = ""
      state.isSuccessCreateUpdate = false
      state.isErrorCreateUpdate = true
      state.errorMessageCreateUpdate = ''
      state.isSuccessDelete = false
      state.isErrorDelete = true
      state.errorMessageDelete = ''
      state.isSuccessDeleteMultiple = false
      state.isErrorDeleteMultiple = true
      state.errorMessageDeleteMultiple = ''
    }
  },
  extraReducers: builder => {

    //get all DeliveryMethod
    builder.addCase(getAllDeliveryMethodsAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(getAllDeliveryMethodsAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.deliveryMethods.data = Array.isArray(action?.payload?.data?.deliveryTypes) ? action?.payload?.data?.deliveryTypes : [];
      state.deliveryMethods.total = action?.payload?.data?.totalCount
    })
    builder.addCase(getAllDeliveryMethodsAsync.rejected, (state, action) => {
      state.isLoading = false
      state.deliveryMethods.data = []
      state.deliveryMethods.total = 0
    })

    //create DeliveryMethod
    builder.addCase(createDeliveryMethodAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(createDeliveryMethodAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessCreateUpdate = !!action.payload?.isSuccess
      state.isErrorCreateUpdate = !action.payload?.isSuccess
      state.errorMessageCreateUpdate = action.payload?.message
      state.typeError = action.payload?.typeError
    })
    builder.addCase(createDeliveryMethodAsync.rejected, (state, action) => {
      state.isLoading = false
      state.isErrorCreateUpdate = true
      state.errorMessageCreateUpdate = action?.error?.message || 'Error creating DeliveryMethod'
    })

    //update DeliveryMethod
    builder.addCase(updateDeliveryMethodAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(updateDeliveryMethodAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessCreateUpdate = !!action.payload?.isSuccess
      state.isErrorCreateUpdate = !action.payload?.isSuccess
      state.errorMessageCreateUpdate = action.payload?.message
      state.typeError = action.payload?.typeError
    })
    builder.addCase(updateDeliveryMethodAsync.rejected, (state, action) => {
      state.isLoading = false
      state.isErrorCreateUpdate = true
      state.errorMessageCreateUpdate = action.error.message || 'Error updating DeliveryMethod'
    })

    //delete DeliveryMethod
    builder.addCase(deleteDeliveryMethodAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(deleteDeliveryMethodAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessDelete = !!action.payload?.isSuccess
      state.isErrorDelete = !action.payload?.isSuccess
      state.errorMessageDelete = action.payload?.message
      state.typeError = action.payload?.typeError
    })
    builder.addCase(deleteDeliveryMethodAsync.rejected, (state, action) => {
      state.isLoading = false
      state.isErrorDelete = true
      state.errorMessageDelete = action?.error.message || 'Error deleting DeliveryMethod'
    })

    //delete multiple DeliveryMethod
    builder.addCase(deleteMultipleDeliveryMethodsAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(deleteMultipleDeliveryMethodsAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessDeleteMultiple = !!action.payload?.data
      state.isErrorDeleteMultiple = !action.payload?.data
      state.errorMessageDeleteMultiple = action.payload?.message
      state.typeError = action.payload?.typeError
    })
    builder.addCase(deleteMultipleDeliveryMethodsAsync.rejected, (state, action) => {
      state.isLoading = false
      state.isErrorDeleteMultiple = true
      state.errorMessageDeleteMultiple = action.error.message || 'Error deleting DeliveryMethod'
    })
  }
})

export const { resetInitialState } = deliveryMethodSlice.actions
export default deliveryMethodSlice.reducer
