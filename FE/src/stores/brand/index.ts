// ** Redux Imports
import { createSlice } from '@reduxjs/toolkit'

// ** Action Imports
import { createBrandAsync, deleteMultipleBrandsAsync, deleteBrandAsync, getAllBrandsAsync, serviceName, updateBrandAsync } from './action'
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

  brands: {
    data: [],
    total: 0
  }
}

export const BrandSlice = createSlice({
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

    //get all Brand
    builder.addCase(getAllBrandsAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(getAllBrandsAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.brands.data = Array.isArray(action?.payload?.result?.subset) ? action?.payload?.result?.subset : [];
      state.brands.total = action?.payload?.result?.totalItemCount
    })
    builder.addCase(getAllBrandsAsync.rejected, (state, action) => {
      state.isLoading = false
      state.brands.data = []
      state.brands.total = 0
    })

    //create Brand
    builder.addCase(createBrandAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(createBrandAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessCreateUpdate = !!action.payload?.isSuccess
      state.isErrorCreateUpdate = !action.payload?.isSuccess
      state.errorMessageCreateUpdate = action.payload?.message
      state.typeError = action.payload?.typeError
    })
    builder.addCase(createBrandAsync.rejected, (state, action) => {
      const payload = action.payload as ReduxPayload;
      state.isLoading = false
      state.isErrorCreateUpdate = true
      state.errorMessageCreateUpdate = payload?.errors?.errorMessage || 'Error creating Brand'
    })

    //update Brand
    builder.addCase(updateBrandAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(updateBrandAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessCreateUpdate = !!action.payload?.isSuccess
      state.isErrorCreateUpdate = !action.payload?.isSuccess
      state.errorMessageCreateUpdate = action.payload?.message
      state.typeError = action.payload?.typeError
    })
    builder.addCase(updateBrandAsync.rejected, (state, action) => {
      const payload = action.payload as ReduxPayload;
      state.isLoading = false
      state.isErrorCreateUpdate = true
      state.errorMessageCreateUpdate = payload?.errors?.errorMessage || 'Error updating Brand'
    })

    //delete Brand
    builder.addCase(deleteBrandAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(deleteBrandAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessDelete = !!action.payload?.isSuccess
      state.isErrorDelete = !action.payload?.isSuccess
      state.errorMessageDelete = action.payload?.message
      state.typeError = action.payload?.typeError
    })
    builder.addCase(deleteBrandAsync.rejected, (state, action) => {
      state.isLoading = false
      state.isErrorDelete = true
      state.errorMessageDelete = action?.error.message || 'Error deleting Brand'
    })

    //delete multiple Brand
    builder.addCase(deleteMultipleBrandsAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(deleteMultipleBrandsAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessDeleteMultiple = !!action.payload?.data
      state.isErrorDeleteMultiple = !action.payload?.data
      state.errorMessageDeleteMultiple = action.payload?.message
      state.typeError = action.payload?.typeError
    })
    builder.addCase(deleteMultipleBrandsAsync.rejected, (state, action) => {
      const payload = action.payload as ReduxPayload;
      state.isLoading = false
      state.isErrorDeleteMultiple = true
      state.errorMessageDeleteMultiple = payload?.errors?.errorMessage || 'Error deleting Brand'
    })
  }
})

export const { resetInitialState } = BrandSlice.actions
export default BrandSlice.reducer
