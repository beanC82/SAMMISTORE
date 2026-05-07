// ** Redux Imports
import { createSlice } from '@reduxjs/toolkit'

// ** Action Imports
import { createWardAsync, deleteMultipleWardsAsync, deleteWardAsync, getAllWardsAsync, serviceName, updateWardAsync } from './action'

interface WardPayload {
  result?: {
    subset?: any[];
    id?: string;
    errorMessage?: string;
    totalItemCount?: number;
  };
  message?: string;
  isSuccess?: boolean;
  errors?: {
    memberName: string,
    errorMessage: string
  }
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

  wards: {
    data: [],
    total: 0
  }
}

export const WardSlice = createSlice({
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

    //get all Wards
    builder.addCase(getAllWardsAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(getAllWardsAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.wards.data = Array.isArray(action?.payload?.result?.subset) ? action?.payload?.result?.subset : [];
      state.wards.total = action?.payload?.result?.totalItemCount
    })
    builder.addCase(getAllWardsAsync.rejected, (state, action) => {
      state.isLoading = false
      state.wards.data = []
      state.wards.total = 0
    })

    //create Ward
    builder.addCase(createWardAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(createWardAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessCreateUpdate = !!action.payload?.isSuccess
      state.isErrorCreateUpdate = !action.payload?.isSuccess
      state.errorMessageCreateUpdate = action.payload?.response?.data?.errors && action.payload?.response?.data?.message || 'Error creating Ward'
    })
    builder.addCase(createWardAsync.rejected, (state, action: any) => {
      state.isLoading = false
      state.isErrorCreateUpdate = true
      state.errorMessageCreateUpdate = action.payload?.response?.data?.errors && action.payload?.response?.data?.message  || 'Error creating Ward'
    })

    //update Ward
    builder.addCase(updateWardAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(updateWardAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessCreateUpdate = !!action.payload?.isSuccess
      state.isErrorCreateUpdate = !action.payload?.isSuccess
      state.errorMessageCreateUpdate = action.payload?.response?.data?.errors && action.payload?.response?.data?.message  || 'Error updating Ward'
    })
    builder.addCase(updateWardAsync.rejected, (state, action: any) => {
      state.isLoading = false
      state.isErrorCreateUpdate = true
      state.errorMessageCreateUpdate = action.payload?.response?.data?.errors && action.payload?.response?.data?.message  || 'Error updating Ward'
    })

    //delete Ward
    builder.addCase(deleteWardAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(deleteWardAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessDelete = !!action.payload?.isSuccess
      state.isErrorDelete = !action.payload?.isSuccess
      state.errorMessageDelete = action.payload?.message
      state.typeError = action.payload?.result?.errorMessage
    })
    builder.addCase(deleteWardAsync.rejected, (state, action) => {
      state.isLoading = false
      state.isErrorDelete = true
      state.errorMessageDelete = action?.error.message || 'Error deleting Ward'
    })

    //delete multiple Ward
    builder.addCase(deleteMultipleWardsAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(deleteMultipleWardsAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessDeleteMultiple = !!action.payload?.isSuccess
      state.isErrorDeleteMultiple = !action.payload?.isSuccess
      state.errorMessageDeleteMultiple = action.payload?.message
      state.typeError = action.payload?.typeError
    })
    builder.addCase(deleteMultipleWardsAsync.rejected, (state, action) => {
      state.isLoading = false
      state.isErrorDeleteMultiple = true
      state.errorMessageDeleteMultiple = action.error.message || 'Error deleting Ward'
    })

  }
})

export const { resetInitialState } = WardSlice.actions
export default WardSlice.reducer
