// ** Redux Imports
import { createSlice } from '@reduxjs/toolkit'

// ** Action Imports
import { createBannerAsync, deleteMultipleBannersAsync, deleteBannerAsync, getAllBannersAsync, serviceName, updateBannerAsync } from './action'

// Add ReduxPayload import
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

  banners: {
    data: [],
    total: 0
  }
}

export const bannerSlice = createSlice({
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

    //get all Banner
    builder.addCase(getAllBannersAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(getAllBannersAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.banners.data = Array.isArray(action?.payload?.result?.subset) ? action?.payload?.result?.subset : [];
      state.banners.total = action?.payload?.result?.totalItemCount
    })
    builder.addCase(getAllBannersAsync.rejected, (state, action) => {
      state.isLoading = false
      state.banners.data = []
      state.banners.total = 0
    })

    //create Banner
    builder.addCase(createBannerAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(createBannerAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessCreateUpdate = !!action.payload?.isSuccess
      state.isErrorCreateUpdate = !action.payload?.isSuccess
      state.errorMessageCreateUpdate = action.payload?.message
      state.typeError = action.payload?.errors
    })
    builder.addCase(createBannerAsync.rejected, (state, action) => {
      const payload = action.payload as ReduxPayload;
      state.isLoading = false
      state.isErrorCreateUpdate = true
      state.errorMessageCreateUpdate = payload?.errors?.errorMessage || 'Error creating Banner'
    })

    //update Banner
    builder.addCase(updateBannerAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(updateBannerAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessCreateUpdate = !!action.payload?.isSuccess
      state.isErrorCreateUpdate = !action.payload?.isSuccess
      state.typeError = action.payload?.errors
    })
    builder.addCase(updateBannerAsync.rejected, (state, action) => {
      const payload = action.payload as ReduxPayload;
      state.isLoading = false
      state.isErrorCreateUpdate = true
      state.errorMessageCreateUpdate = payload?.errors?.errorMessage || 'Error updating Banner'
    })

    //delete Banner
    builder.addCase(deleteBannerAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(deleteBannerAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessDelete = !!action.payload?.isSuccess
      state.isErrorDelete = !action.payload?.isSuccess
      state.errorMessageDelete = action.payload?.message
      state.typeError = action.payload?.result?.errorMessage
    })
    builder.addCase(deleteBannerAsync.rejected, (state, action) => {
      state.isLoading = false
      state.isErrorDelete = true
      state.errorMessageDelete = action?.error.message || 'Error deleting Banner'
    })

    //delete multiple Banner
    builder.addCase(deleteMultipleBannersAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(deleteMultipleBannersAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessDeleteMultiple = !!action.payload?.data
      state.isErrorDeleteMultiple = !action.payload?.data
      state.errorMessageDeleteMultiple = action.payload?.message
      state.typeError = action.payload?.typeError
    })
    builder.addCase(deleteMultipleBannersAsync.rejected, (state, action) => {
      state.isLoading = false
      state.isErrorDeleteMultiple = true
      state.errorMessageDeleteMultiple = action.error.message || 'Error deleting Banner'
    })
  }
})

export const { resetInitialState } = bannerSlice.actions
export default bannerSlice.reducer
