// ** Redux Imports
import { createSlice } from '@reduxjs/toolkit'

// ** Action Imports
import { createAddressAsync, deleteMultipleAddressesAsync, deleteAddressAsync, getAllAddressesAsync, serviceName, updateAddressAsync, getCurrentAddressAsync } from './action'
import { ReduxPayload } from 'src/types/payload'

const initialState = {
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
  typeError: '',
  isSuccessCreate: false,
  isErrorCreate: false,
  errorMessageCreate: '',

  isSuccessUpdate: false,
  isErrorUpdate: false,
  errorMessageUpdate: '',

  isSuccessDelete: false,
  isErrorDelete: false,
  errorMessageDelete: '',
  
  isSuccessDeleteMultiple: false,
  isErrorDeleteMultiple: false,
  errorMessageDeleteMultiple: '',

  addresses: {
    data: [],
    total: 0
  },
  currentAddress: {
    data: [],
    total: 0
  }
}

export const addressesSlice = createSlice({
  name: serviceName,
  initialState,
  reducers: {
    resetInitialState: state => {
      state.isLoading = false
      state.isSuccess = false
      state.isError = true
      state.message = ""
      state.typeError = ""

      state.isSuccessCreate = false
      state.isErrorCreate = true
      state.errorMessageCreate = ''

      state.isSuccessUpdate = false
      state.isErrorUpdate = true
      state.errorMessageUpdate = ''
      
      state.isSuccessDelete = false
      state.isErrorDelete = true
      state.errorMessageDelete = ''

      state.isSuccessDeleteMultiple = false
      state.isErrorDeleteMultiple = true
      state.errorMessageDeleteMultiple = ''
    }
  },
  extraReducers: builder => {

    //get all Addresses
    builder.addCase(getAllAddressesAsync.pending, (state, action) => {
      state.isLoading = true
    })

    builder.addCase(getAllAddressesAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.addresses.data = Array.isArray(action?.payload?.result) ? action?.payload?.result : [];
      state.addresses.total = action?.payload?.result?.totalItemCount
    })
    
    builder.addCase(getAllAddressesAsync.rejected, (state, action) => {
      state.isLoading = false
      state.addresses.data = []
      state.addresses.total = 0
    })

    //get current Addresses
    builder.addCase(getCurrentAddressAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(getCurrentAddressAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.currentAddress.data = Array.isArray(action?.payload?.result) ? action?.payload?.result : [];
      state.currentAddress.total = action?.payload?.result?.totalItemCount
    })
    builder.addCase(getCurrentAddressAsync.rejected, (state, action) => {
      state.isLoading = false
      state.currentAddress.data = []
      state.currentAddress.total = 0
    })

    //create Address
    builder.addCase(createAddressAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(createAddressAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessCreate = !!action.payload?.isSuccess
      state.isErrorCreate = !action.payload?.isSuccess
      state.errorMessageCreate = action.payload?.message
      state.typeError = action.payload?.errors
    })
    builder.addCase(createAddressAsync.rejected, (state, action) => {
      const payload = action.payload as ReduxPayload;
      state.isLoading = false
      state.isErrorCreate = true
      state.errorMessageCreate = payload?.errors?.errorMessage || 'Error creating Address'
    })

    //update Address
    builder.addCase(updateAddressAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(updateAddressAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessUpdate = !!action.payload?.isSuccess
      state.isErrorUpdate = !action.payload?.isSuccess
      state.typeError = action.payload?.errors
    })
    builder.addCase(updateAddressAsync.rejected, (state, action) => {
      const payload = action.payload as ReduxPayload;
      state.isLoading = false
      state.isErrorUpdate = true
      state.errorMessageUpdate = payload?.errors?.errorMessage || 'Error updating Address'
    })

    //delete Address
    builder.addCase(deleteAddressAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(deleteAddressAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessDelete = !!action.payload?.isSuccess
      state.isErrorDelete = !action.payload?.isSuccess
      state.errorMessageDelete = action.payload?.message
      state.typeError = action.payload?.result?.errorMessage
    })
    builder.addCase(deleteAddressAsync.rejected, (state, action) => {
      state.isLoading = false
      state.isErrorDelete = true
      state.errorMessageDelete = action?.error.message || 'Error deleting Address'
    })

    //delete multiple Address
    builder.addCase(deleteMultipleAddressesAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(deleteMultipleAddressesAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessDeleteMultiple = !!action.payload?.isSuccess
      state.isErrorDeleteMultiple = !action.payload?.isSuccess
      state.errorMessageDeleteMultiple = action.payload?.message
      state.typeError = action.payload?.typeError
    })
    builder.addCase(deleteMultipleAddressesAsync.rejected, (state, action) => {
      state.isLoading = false
      state.isErrorDeleteMultiple = true
      state.errorMessageDeleteMultiple = action.error.message || 'Error deleting Address'
    })

  }
})

export const { resetInitialState } = addressesSlice.actions
export default addressesSlice.reducer
