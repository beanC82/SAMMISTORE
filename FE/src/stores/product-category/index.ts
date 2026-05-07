// ** Redux Imports
import { createSlice } from '@reduxjs/toolkit'

// ** Action Imports
import { createProductCategoryAsync, deleteMultipleProductCategoriesAsync, deleteProductCategoryAsync, getAllProductCategoriesAsync, serviceName, updateProductCategoryAsync } from './action'
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

  productCategories: {
    data: [],
    total: 0
  }
}

export const productCategorySlice = createSlice({
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

    //get all ProductCategory
    builder.addCase(getAllProductCategoriesAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(getAllProductCategoriesAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.productCategories.data = Array.isArray(action?.payload?.result?.subset) ? action?.payload?.result?.subset : [];
      state.productCategories.total = action?.payload?.result?.totalItemCount
    })
    builder.addCase(getAllProductCategoriesAsync.rejected, (state, action) => {
      state.isLoading = false
      state.productCategories.data = []
      state.productCategories.total = 0
    })

    //create ProductCategory
    builder.addCase(createProductCategoryAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(createProductCategoryAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessCreateUpdate = !!action.payload?.isSuccess
      state.isErrorCreateUpdate = !action.payload?.isSuccess
      state.errorMessageCreateUpdate = action.payload?.message
    })
    builder.addCase(createProductCategoryAsync.rejected, (state, action) => {
      const payload = action.payload as ReduxPayload;
      state.isLoading = false
      state.isErrorCreateUpdate = true
      state.errorMessageCreateUpdate = payload?.errors?.errorMessage || 'Error creating ProductCategory'
    })

    //update ProductCategory
    builder.addCase(updateProductCategoryAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(updateProductCategoryAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessCreateUpdate = !!action.payload?.isSuccess
      state.isErrorCreateUpdate = !action.payload?.isSuccess
      state.errorMessageCreateUpdate = action.payload?.errors?.errorMessage || 'Error updating ProductCategory'
    })
    builder.addCase(updateProductCategoryAsync.rejected, (state, action) => {
      const payload = action.payload as ReduxPayload;
      state.isLoading = false
      state.isErrorCreateUpdate = true
      state.errorMessageCreateUpdate = payload?.errors?.errorMessage || 'Error updating ProductCategory'
    })

    //delete ProductCategory
    builder.addCase(deleteProductCategoryAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(deleteProductCategoryAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessDelete = !!action.payload?.isSuccess
      state.isErrorDelete = !action.payload?.isSuccess
      state.errorMessageDelete = action.payload?.message
      state.typeError = action.payload?.typeError
    })
    builder.addCase(deleteProductCategoryAsync.rejected, (state, action) => {
      state.isLoading = false
      state.isErrorDelete = true
      state.errorMessageDelete = action?.error.message || 'Error deleting ProductCategory'
    })

    //delete multiple ProductCategory
    builder.addCase(deleteMultipleProductCategoriesAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(deleteMultipleProductCategoriesAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessDeleteMultiple = !!action.payload?.data
      state.isErrorDeleteMultiple = !action.payload?.data
      state.errorMessageDeleteMultiple = action.payload?.message
      state.typeError = action.payload?.typeError
    })
    builder.addCase(deleteMultipleProductCategoriesAsync.rejected, (state, action) => {
      const payload = action.payload as ReduxPayload;
      state.isLoading = false
      state.isErrorDeleteMultiple = true
      state.errorMessageDeleteMultiple = payload?.errors?.errorMessage || 'Error deleting ProductCategory'
    })
  }
})

export const { resetInitialState } = productCategorySlice.actions
export default productCategorySlice.reducer
