// ** Redux Imports
import { createSlice } from '@reduxjs/toolkit'

// ** Action Imports
import { createProvinceAsync, deleteMultipleProvincesAsync, deleteProvinceAsync, getAllProvincesAsync, serviceName, updateProvinceAsync } from './action'

interface ProvincePayload {
  response?: {
    data?: {
      errors?: {
        memberName: string,
        errorMessage: string
      }
      message?: string
    }
  }
  isSuccess?: boolean;
}

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

  provinces: {
    data: [],
    total: 0
  }
}

export const provinceSlice = createSlice({
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

    //get all Provinces
    builder.addCase(getAllProvincesAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(getAllProvincesAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.provinces.data = Array.isArray(action?.payload?.result?.subset) ? action?.payload?.result?.subset : [];
      state.provinces.total = action?.payload?.result?.totalItemCount
    })
    builder.addCase(getAllProvincesAsync.rejected, (state, action) => {
      state.isLoading = false
      state.provinces.data = []
      state.provinces.total = 0
    })

    //create Province
    builder.addCase(createProvinceAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(createProvinceAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessCreateUpdate = !!action.payload?.isSuccess
      state.isErrorCreateUpdate = !action.payload?.isSuccess
      state.errorMessageCreateUpdate = action.payload?.response?.data?.errors[0]?.errorMessage || 'Error creating Province'
    })
    builder.addCase(createProvinceAsync.rejected, (state, action) => {
      const payload = action.payload as ProvincePayload;
      state.isLoading = false
      state.isErrorCreateUpdate = true
      state.errorMessageCreateUpdate = payload.response?.data?.errors && payload?.response?.data?.message || 'Error creating Province'
    })

    //update Province
    builder.addCase(updateProvinceAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(updateProvinceAsync.fulfilled, (state, action) => {
      const payload = action.payload as ProvincePayload;
      state.isLoading = false
      state.isSuccessCreateUpdate = !!action.payload?.isSuccess
      state.isErrorCreateUpdate = !action.payload?.isSuccess
      state.errorMessageCreateUpdate = payload.response?.data?.errors && payload?.response?.data?.message || 'Error updating Province'
    })
    builder.addCase(updateProvinceAsync.rejected, (state, action) => {
      const payload = action.payload as ProvincePayload;
      state.isLoading = false
      state.isErrorCreateUpdate = true
      state.errorMessageCreateUpdate = payload.response?.data?.errors && payload?.response?.data?.message || 'Error updating Province'
    })

    //delete Province
    builder.addCase(deleteProvinceAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(deleteProvinceAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessDelete = !!action.payload?.isSuccess
      state.isErrorDelete = !action.payload?.isSuccess
      state.errorMessageDelete = action.payload?.errors?.errorMessage || 'Error deleting Province'
    })
    builder.addCase(deleteProvinceAsync.rejected, (state, action) => {
      state.isLoading = false
      state.isErrorDelete = true
      state.errorMessageDelete = action?.error.message || 'Error deleting Province'
    })

    //delete multiple Province
    builder.addCase(deleteMultipleProvincesAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(deleteMultipleProvincesAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessDeleteMultiple = !!action.payload?.isSuccess
      state.isErrorDeleteMultiple = !action.payload?.isSuccess
      state.errorMessageDeleteMultiple = action.payload?.message
      state.typeError = action.payload?.typeError
    })
    builder.addCase(deleteMultipleProvincesAsync.rejected, (state, action) => {
      state.isLoading = false
      state.isErrorDeleteMultiple = true
      state.errorMessageDeleteMultiple = action.error.message || 'Error deleting Province'
    })

  }
})

export const { resetInitialState } = provinceSlice.actions
export default provinceSlice.reducer
