// ** Redux Imports
import { createSlice } from '@reduxjs/toolkit'

// ** Action Imports
import { createDistrictAsync, deleteMultipleDistrictsAsync, deleteDistrictAsync, getAllDistrictsAsync, serviceName, updateDistrictAsync } from './action'
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

  districts: {
    data: [],
    total: 0
  }
}

export const districtSlice = createSlice({
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

    //get all Districts
    builder.addCase(getAllDistrictsAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(getAllDistrictsAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.districts.data = Array.isArray(action?.payload?.result?.subset) ? action?.payload?.result?.subset : [];
      state.districts.total = action?.payload?.result?.totalItemCount
    })
    builder.addCase(getAllDistrictsAsync.rejected, (state, action) => {
      state.isLoading = false
      state.districts.data = []
      state.districts.total = 0
    })

    //create District
    builder.addCase(createDistrictAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(createDistrictAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessCreateUpdate = !!action.payload?.isSuccess
      state.isErrorCreateUpdate = !action.payload?.isSuccess
      state.errorMessageCreateUpdate = action.payload?.message
    })
    builder.addCase(createDistrictAsync.rejected, (state, action: any) => {
      state.isLoading = false
      state.isErrorCreateUpdate = true
      state.errorMessageCreateUpdate = action.payload?.response?.data?.errors && action.payload?.response?.data?.message  || 'Error creating District'
    })

    //update District
    builder.addCase(updateDistrictAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(updateDistrictAsync.fulfilled, (state, action) => {
   
      state.isLoading = false
      state.isSuccessCreateUpdate = !!action.payload?.isSuccess
      state.isErrorCreateUpdate = !action.payload?.isSuccess
      state.errorMessageCreateUpdate = action.payload?.response?.data?.errors && action.payload?.response?.data?.message || 'Error updating District'
    })
    builder.addCase(updateDistrictAsync.rejected, (state, action) => {
      state.isLoading = false
      state.isErrorCreateUpdate = true
      state.errorMessageCreateUpdate = action.error?.message || 'Error updating District'
    })

    //delete District
    builder.addCase(deleteDistrictAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(deleteDistrictAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessDelete = !!action.payload?.isSuccess
      state.isErrorDelete = !action.payload?.isSuccess
      state.errorMessageDelete = action.payload?.message
      state.typeError = action.payload?.result?.errorMessage
    })
    builder.addCase(deleteDistrictAsync.rejected, (state, action) => {
      state.isLoading = false
      state.isErrorDelete = true
      state.errorMessageDelete = action?.error.message || 'Error deleting District'
    })

    //delete multiple District
    builder.addCase(deleteMultipleDistrictsAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(deleteMultipleDistrictsAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessDeleteMultiple = !!action.payload?.isSuccess
      state.isErrorDeleteMultiple = !action.payload?.isSuccess
      state.errorMessageDeleteMultiple = action.payload?.message
      state.typeError = action.payload?.typeError
    })
    builder.addCase(deleteMultipleDistrictsAsync.rejected, (state, action) => {
      state.isLoading = false
      state.isErrorDeleteMultiple = true
      state.errorMessageDeleteMultiple = action.error.message || 'Error deleting District'
    })

  }
})

export const { resetInitialState } = districtSlice.actions
export default districtSlice.reducer
