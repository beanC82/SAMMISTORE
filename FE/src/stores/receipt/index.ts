// ** Redux Imports
import { createSlice } from '@reduxjs/toolkit'

// ** Action Imports
import { createReceiptAsync, deleteMultipleReceiptsAsync, deleteReceiptAsync, getAllReceiptsAsync, serviceName, updateMultipleReceiptStatusAsync, updateReceiptAsync, updateReceiptStatusAsync } from './action'

interface ReceiptPayload {
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

  isSuccessUpdateStatus: false,
  isErrorUpdateStatus: false,
  errorMessageUpdateStatus: '',

  isSuccessUpdateMultipleStatus: false,
  isErrorUpdateMultipleStatus: false,
  errorMessageUpdateMultipleStatus: '',

  isSuccessDelete: false,
  isErrorDelete: false,
  errorMessageDelete: '',

  isSuccessDeleteMultiple: false,
  isErrorDeleteMultiple: false,
  errorMessageDeleteMultiple: '',

  receipts: {
    data: [],
    total: 0
  }
}

export const receiptSlice = createSlice({
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

      state.isSuccessUpdateStatus = false
      state.isErrorUpdateStatus = true
      state.errorMessageUpdateStatus = ''

      state.isSuccessUpdateMultipleStatus = false
      state.isErrorUpdateMultipleStatus = true
      state.errorMessageUpdateMultipleStatus = ''

      state.isSuccessDelete = false
      state.isErrorDelete = true
      state.errorMessageDelete = ''

      state.isSuccessDeleteMultiple = false
      state.isErrorDeleteMultiple = true
      state.errorMessageDeleteMultiple = ''
    }
  },
  extraReducers: builder => {

    //get all Receipts
    builder.addCase(getAllReceiptsAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(getAllReceiptsAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.receipts.data = Array.isArray(action?.payload?.result?.subset) ? action?.payload?.result?.subset : [];
      state.receipts.total = action?.payload?.result?.totalItemCount
    })
    builder.addCase(getAllReceiptsAsync.rejected, (state, action) => {
      state.isLoading = false
      state.receipts.data = []
      state.receipts.total = 0
    })  

    //create Receipt
    builder.addCase(createReceiptAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(createReceiptAsync.fulfilled, (state, action) => {
      console.log("action result", action)
      state.isLoading = false
      state.isSuccessCreateUpdate = !!action.payload?.isSuccess
      state.isErrorCreateUpdate = !action.payload?.isSuccess
      state.errorMessageCreateUpdate = action.payload?.response?.data?.message
      state.typeError = action.payload?.errors
    })
    builder.addCase(createReceiptAsync.rejected, (state, action) => {
      const payload = action.payload as ReceiptPayload;
      state.isLoading = false
      state.isErrorCreateUpdate = true
      state.errorMessageCreateUpdate = payload?.message || 'Error creating Receipt'
    })

    //update Receipt
    builder.addCase(updateReceiptAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(updateReceiptAsync.fulfilled, (state, action) => {
      console.log("action update", action)
      state.isLoading = false
      state.isSuccessCreateUpdate = !!action.payload?.isSuccess
      state.isErrorCreateUpdate = !action.payload?.isSuccess
      state.typeError = action.payload?.errors
      state.errorMessageCreateUpdate = action.payload?.response?.data?.message
    })
    builder.addCase(updateReceiptAsync.rejected, (state, action) => {
      const payload = action.payload as ReceiptPayload;
      state.isLoading = false
      state.isErrorCreateUpdate = true
      state.errorMessageCreateUpdate = payload?.message || 'Error updating Receipt'
    })

    //update Receipt status
    builder.addCase(updateReceiptStatusAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(updateReceiptStatusAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessUpdateStatus = !!action.payload?.isSuccess
      state.isErrorUpdateStatus = !action.payload?.isSuccess
      state.typeError = action.payload?.errors
    })
    builder.addCase(updateReceiptStatusAsync.rejected, (state, action) => {
      const payload = action.payload as ReceiptPayload;
      state.isLoading = false
      state.isErrorUpdateStatus = true
      state.errorMessageUpdateStatus = payload?.message || 'Error updating Receipt'
    })

    //update multiple Receipt status
    builder.addCase(updateMultipleReceiptStatusAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(updateMultipleReceiptStatusAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessUpdateMultipleStatus = !!action.payload?.isSuccess
      state.isErrorUpdateMultipleStatus = !action.payload?.isSuccess
      state.typeError = action.payload?.errors
    })
    builder.addCase(updateMultipleReceiptStatusAsync.rejected, (state, action) => {
      const payload = action.payload as ReceiptPayload;
      state.isLoading = false
      state.isErrorUpdateMultipleStatus = true
      state.errorMessageUpdateMultipleStatus = payload?.message || 'Error updating Receipt'
    })

    //delete Receipt
    builder.addCase(deleteReceiptAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(deleteReceiptAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessDelete = !!action.payload?.isSuccess
      state.isErrorDelete = !action.payload?.isSuccess
      state.errorMessageDelete = action.payload?.message
      state.typeError = action.payload?.result?.errorMessage
    })
    builder.addCase(deleteReceiptAsync.rejected, (state, action) => {
      state.isLoading = false
      state.isErrorDelete = true
      state.errorMessageDelete = action?.error.message || 'Error deleting Receipt'
    })

    //delete multiple Receipt
    builder.addCase(deleteMultipleReceiptsAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(deleteMultipleReceiptsAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessDeleteMultiple = !!action.payload?.isSuccess
      state.isErrorDeleteMultiple = !action.payload?.isSuccess
      state.errorMessageDeleteMultiple = action.payload?.message
      state.typeError = action.payload?.typeError
    })
    builder.addCase(deleteMultipleReceiptsAsync.rejected, (state, action) => {
      state.isLoading = false
      state.isErrorDeleteMultiple = true
      state.errorMessageDeleteMultiple = action.error.message || 'Error deleting Receipt'
    })

  }
})

export const { resetInitialState } = receiptSlice.actions
export default receiptSlice.reducer
