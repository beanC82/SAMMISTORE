// ** Redux Imports
import { createSlice } from '@reduxjs/toolkit'

// ** Action Imports
import { createProductAsync, deleteMultipleProductsAsync, deleteProductAsync, getAllLikedProductsAsync, getAllProductsAsync, getAllViewedProductsAsync, likeProductAsync, serviceName, unlikeProductAsync, updateProductAsync } from './action'
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

  isSuccessLike: false,
  isErrorLike: false,
  errorMessageLike: '',

  isSuccessUnlike: false,
  isErrorUnlike: false,
  errorMessageUnlike: '',

  products: {
    data: [],
    total: 0
  },
  likedProducts: {
    data: [],
    total: 0
  },
  viewedProducts: {
    data: [],
    total: 0
  }
}

export const productSlice = createSlice({
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

      state.isSuccessLike = false
      state.isErrorLike = true
      state.errorMessageLike = ''

      state.isSuccessUnlike = false
      state.isErrorUnlike = true
      state.errorMessageUnlike = ''
    }
  },
  extraReducers: builder => {

    //get all Product
    builder.addCase(getAllProductsAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(getAllProductsAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.products.data = Array.isArray(action?.payload?.result?.subset) ? action?.payload?.result?.subset: [];
      state.products.total = action?.payload?.result?.totalItemCount
    })
    builder.addCase(getAllProductsAsync.rejected, (state, action) => {
      state.isLoading = false
      state.products.data = []
      state.products.total = 0
    })

    //create Product
    builder.addCase(createProductAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(createProductAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessCreateUpdate = !!action.payload?.isSuccess
      state.isErrorCreateUpdate = !action.payload?.isSuccess
      state.errorMessageCreateUpdate = action.payload?.message
      state.typeError = action.payload?.typeError
    })
    builder.addCase(createProductAsync.rejected, (state, action) => {
      const payload = action.payload as ReduxPayload;
      state.isLoading = false
      state.isErrorCreateUpdate = true
      state.errorMessageCreateUpdate =  payload?.errors?.errorMessage || 'Error creating Product'
    })

    //update Product
    builder.addCase(updateProductAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(updateProductAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessCreateUpdate = !!action.payload?.isSuccess
      state.isErrorCreateUpdate = !action.payload?.isSuccess
      state.errorMessageCreateUpdate = action.payload?.message
      state.typeError = action.payload?.typeError
    })
    builder.addCase(updateProductAsync.rejected, (state, action) => {
      state.isLoading = false
      state.isErrorCreateUpdate = true
      state.errorMessageCreateUpdate = action.error.message || 'Error updating Product'
    })

    //delete Product
    builder.addCase(deleteProductAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(deleteProductAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessDelete = !!action.payload?.isSuccess
      state.isErrorDelete = !action.payload?.isSuccess
      state.errorMessageDelete = action.payload?.message
      state.typeError = action.payload?.result?.errorMessage
    })
    builder.addCase(deleteProductAsync.rejected, (state, action) => {
      state.isLoading = false
      state.isErrorDelete = true
      state.errorMessageDelete = action?.error.message || 'Error deleting Product'
    })

    //delete multiple Product
    builder.addCase(deleteMultipleProductsAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(deleteMultipleProductsAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessDeleteMultiple = !!action.payload?.data
      state.isErrorDeleteMultiple = !action.payload?.data
      state.errorMessageDeleteMultiple = action.payload?.message
      state.typeError = action.payload?.typeError
    })
    builder.addCase(deleteMultipleProductsAsync.rejected, (state, action) => {
      state.isLoading = false
      state.isErrorDeleteMultiple = true
      state.errorMessageDeleteMultiple = action.error.message || 'Error deleting Product'
    })

    //like Product
    builder.addCase(likeProductAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(likeProductAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessLike = !!action.payload?.isSuccess
      state.isErrorLike = !action.payload?.isSuccess
      state.errorMessageLike = action.payload?.response?.result?.errorMessage
    })
    builder.addCase(likeProductAsync.rejected, (state, action) => {
      state.isLoading = false
      state.isErrorLike = true
      state.errorMessageLike = action?.error?.message || 'Error liking Product'
    })

    //unlike Product
    builder.addCase(unlikeProductAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(unlikeProductAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessUnlike = !!action.payload?.isSuccess
      state.isErrorUnlike = !action.payload?.isSuccess
      state.errorMessageUnlike = action.payload?.message
      state.typeError = action.payload?.typeError
    })
    builder.addCase(unlikeProductAsync.rejected, (state, action) => {
      state.isLoading = false
      state.isErrorUnlike = true
      state.errorMessageUnlike = action?.error?.message || 'Error unliking Product'
    })


    //get all liked Product
    builder.addCase(getAllLikedProductsAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(getAllLikedProductsAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.likedProducts.data = Array.isArray(action?.payload?.data?.products) ? action?.payload?.data?.products : [];
      state.likedProducts.total = action?.payload?.data?.totalCount
    })
    builder.addCase(getAllLikedProductsAsync.rejected, (state, action) => {
      state.isLoading = false
      state.likedProducts.data = []
      state.likedProducts.total = 0
    })

    //get all viewed Product
    builder.addCase(getAllViewedProductsAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(getAllViewedProductsAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.viewedProducts.data = Array.isArray(action?.payload?.data?.products) ? action?.payload?.data?.products : [];
      state.viewedProducts.total = action?.payload?.data?.totalCount
    })
    builder.addCase(getAllViewedProductsAsync.rejected, (state, action) => {
      state.isLoading = false
      state.viewedProducts.data = []
      state.viewedProducts.total = 0
    })
  }
})

export const { resetInitialState } = productSlice.actions
export default productSlice.reducer
