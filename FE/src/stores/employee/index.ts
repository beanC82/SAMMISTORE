// ** Redux Imports
import { createSlice } from '@reduxjs/toolkit'

// ** Action Imports
import { createEmployeeAsync, deleteMultipleEmployeesAsync, deleteEmployeeAsync, getAllEmployeesAsync, serviceName, updateEmployeeAsync } from './action'
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

  employees: {
    data: [],
    total: 0
  }
}

export const employeeSlice = createSlice({
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

    //get all Employees
    builder.addCase(getAllEmployeesAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(getAllEmployeesAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.employees.data = Array.isArray(action?.payload?.result?.subset) ? action?.payload?.result?.subset : [];
      state.employees.total = action?.payload?.result?.totalItemCount
    })
    builder.addCase(getAllEmployeesAsync.rejected, (state, action) => {
      state.isLoading = false
      state.employees.data = []
      state.employees.total = 0
    })

    //create Employee
    builder.addCase(createEmployeeAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(createEmployeeAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessCreateUpdate = !!action.payload?.isSuccess
      state.isErrorCreateUpdate = !action.payload?.isSuccess
      state.errorMessageCreateUpdate = action.payload?.message
      state.typeError = action.payload?.typeError
    })
    builder.addCase(createEmployeeAsync.rejected, (state, action) => {
      const payload = action.payload as ReduxPayload;
      state.isLoading = false
      state.isErrorCreateUpdate = true
      state.errorMessageCreateUpdate = payload?.errors?.errorMessage || 'Error creating Employee'
    })

    //update Employee
    builder.addCase(updateEmployeeAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(updateEmployeeAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessCreateUpdate = !!action.payload?.isSuccess
      state.isErrorCreateUpdate = !action.payload?.isSuccess
      state.errorMessageCreateUpdate = action.payload?.message
      state.typeError = action.payload?.typeError
    })
    builder.addCase(updateEmployeeAsync.rejected, (state, action) => {
      const payload = action.payload as ReduxPayload;
      state.isLoading = false
      state.isErrorCreateUpdate = true
      state.errorMessageCreateUpdate = payload?.errors?.errorMessage || 'Error updating Employee'
    })

    //delete Employee
    builder.addCase(deleteEmployeeAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(deleteEmployeeAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessDelete = !!action.payload?.isSuccess
      state.isErrorDelete = !action.payload?.isSuccess
      state.errorMessageDelete = action.payload?.message
      state.typeError = action.payload?.typeError
    })
    builder.addCase(deleteEmployeeAsync.rejected, (state, action) => {
      state.isLoading = false
      state.isErrorDelete = true
      state.errorMessageDelete = action?.error.message || 'Error deleting Employee'
    })

    //delete multiple Employee
    builder.addCase(deleteMultipleEmployeesAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(deleteMultipleEmployeesAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessDeleteMultiple = !!action.payload?.isSuccess
      state.isErrorDeleteMultiple = !action.payload?.isSuccess
      state.errorMessageDeleteMultiple = action.payload?.message
      state.typeError = action.payload?.typeError
    })
    builder.addCase(deleteMultipleEmployeesAsync.rejected, (state, action) => {
      const payload = action.payload as ReduxPayload;
      state.isLoading = false
      state.isErrorDeleteMultiple = true
      state.errorMessageDeleteMultiple = payload?.errors?.errorMessage || 'Error deleting Employee'
    })

  }
})

export const { resetInitialState } = employeeSlice.actions
export default employeeSlice.reducer
