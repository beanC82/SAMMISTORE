// ** Redux Imports
import { createSlice } from '@reduxjs/toolkit'

// ** Action Imports
import { createCustomerAsync, deleteMultipleCustomersAsync, deleteCustomerAsync, getAllCustomersAsync, serviceName, updateCustomerAsync } from './action'
import { ReduxPayload } from 'src/types/payload'

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

  customers: {
    data: [],
    total: 0
  }
}

export const CustomerSlice = createSlice({
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

    //get all Customers
    builder.addCase(getAllCustomersAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(getAllCustomersAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.customers.data = Array.isArray(action?.payload?.result?.subset) ? action?.payload?.result?.subset : [];
      state.customers.total = action?.payload?.result?.totalItemCount
    })
    builder.addCase(getAllCustomersAsync.rejected, (state, action) => {
      state.isLoading = false
      state.customers.data = []
      state.customers.total = 0
    })

    //create Customer
    builder.addCase(createCustomerAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(createCustomerAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessCreateUpdate = !!action.payload?.isSuccess
      state.isErrorCreateUpdate = !action.payload?.isSuccess
      state.errorMessageCreateUpdate = action.payload?.message
      state.typeError = action.payload?.typeError
    })
    builder.addCase(createCustomerAsync.rejected, (state, action) => {
      const payload = action.payload as ReduxPayload;
      state.isLoading = false
      state.isErrorCreateUpdate = true
      state.errorMessageCreateUpdate = payload?.errors?.errorMessage || 'Error creating Customer'
    })

    //update Customer
    builder.addCase(updateCustomerAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(updateCustomerAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessCreateUpdate = !!action.payload?.isSuccess
      state.isErrorCreateUpdate = !action.payload?.isSuccess
      state.errorMessageCreateUpdate = action.payload?.message
      state.typeError = action.payload?.typeError
    })
    builder.addCase(updateCustomerAsync.rejected, (state, action) => {
      const payload = action.payload as ReduxPayload;
      state.isLoading = false
      state.isErrorCreateUpdate = true
      state.errorMessageCreateUpdate = payload?.errors?.errorMessage || 'Error updating Customer'
    })

    //delete Customer
    builder.addCase(deleteCustomerAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(deleteCustomerAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessDelete = !!action.payload?.isSuccess
      state.isErrorDelete = !action.payload?.isSuccess
      state.errorMessageDelete = action.payload?.message
      state.typeError = action.payload?.typeError
    })
    builder.addCase(deleteCustomerAsync.rejected, (state, action) => {
      state.isLoading = false
      state.isErrorDelete = true
      state.errorMessageDelete = action?.error.message || 'Error deleting Customer'
    })

    //delete multiple Customer
    builder.addCase(deleteMultipleCustomersAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(deleteMultipleCustomersAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessDeleteMultiple = !!action.payload?.isSuccess
      state.isErrorDeleteMultiple = !action.payload?.isSuccess
      state.errorMessageDeleteMultiple = action.payload?.message
      state.typeError = action.payload?.typeError
    })
    builder.addCase(deleteMultipleCustomersAsync.rejected, (state, action) => {
      const payload = action.payload as ReduxPayload;
      state.isLoading = false
      state.isErrorDeleteMultiple = true
      state.errorMessageDeleteMultiple = payload?.errors?.errorMessage || 'Error deleting Customer'
    })

  }
})

export const { resetInitialState } = CustomerSlice.actions
export default CustomerSlice.reducer
