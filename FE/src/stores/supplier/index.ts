// ** Redux Imports
import { createSlice } from '@reduxjs/toolkit'

// ** Action Imports
import { createSupplierAsync, deleteMultipleSuppliersAsync, deleteSupplierAsync, getAllSuppliersAsync, serviceName, updateSupplierAsync } from './action'
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

  suppliers: {
    data: [],
    total: 0
  }
}

export const SupplierSlice = createSlice({
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

    //get all Suppliers
    builder.addCase(getAllSuppliersAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(getAllSuppliersAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.suppliers.data = Array.isArray(action?.payload?.result?.subset) ? action?.payload?.result?.subset : [];
      state.suppliers.total = action?.payload?.result?.totalItemCount
    })
    builder.addCase(getAllSuppliersAsync.rejected, (state, action) => {
      state.isLoading = false
      state.suppliers.data = []
      state.suppliers.total = 0
    })

    //create Supplier
    builder.addCase(createSupplierAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(createSupplierAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessCreateUpdate = !!action.payload?.isSuccess
      state.isErrorCreateUpdate = !action.payload?.isSuccess
      state.errorMessageCreateUpdate = action.payload?.message
      state.typeError = action.payload?.typeError
    })
    builder.addCase(createSupplierAsync.rejected, (state, action) => {
      const payload = action.payload as ReduxPayload;
      state.isLoading = false
      state.isErrorCreateUpdate = true
      state.errorMessageCreateUpdate = payload?.errors?.errorMessage || 'Error creating Supplier'
    })

    //update Supplier
    builder.addCase(updateSupplierAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(updateSupplierAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessCreateUpdate = !!action.payload?.isSuccess
      state.isErrorCreateUpdate = !action.payload?.isSuccess
      state.errorMessageCreateUpdate = action.payload?.message
      state.typeError = action.payload?.typeError
    })
    builder.addCase(updateSupplierAsync.rejected, (state, action) => {
      const payload = action.payload as ReduxPayload;
      state.isLoading = false
      state.isErrorCreateUpdate = true
      state.errorMessageCreateUpdate = payload?.errors?.errorMessage || 'Error updating Supplier'
    })

    //delete Supplier
    builder.addCase(deleteSupplierAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(deleteSupplierAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessDelete = !!action.payload?.isSuccess
      state.isErrorDelete = !action.payload?.isSuccess
      state.errorMessageDelete = action.payload?.message
      state.typeError = action.payload?.typeError
    })
    builder.addCase(deleteSupplierAsync.rejected, (state, action) => {
      state.isLoading = false
      state.isErrorDelete = true
      state.errorMessageDelete = action?.error.message || 'Error deleting Supplier'
    })

    //delete multiple Supplier
    builder.addCase(deleteMultipleSuppliersAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(deleteMultipleSuppliersAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessDeleteMultiple = !!action.payload?.isSuccess
      state.isErrorDeleteMultiple = !action.payload?.isSuccess
      state.errorMessageDeleteMultiple = action.payload?.message
      state.typeError = action.payload?.typeError
    })
    builder.addCase(deleteMultipleSuppliersAsync.rejected, (state, action) => {
      const payload = action.payload as ReduxPayload;
      state.isLoading = false
      state.isErrorDeleteMultiple = true
      state.errorMessageDeleteMultiple = payload?.errors?.errorMessage || 'Error deleting Supplier'
    })

  }
})

export const { resetInitialState } = SupplierSlice.actions
export default SupplierSlice.reducer
