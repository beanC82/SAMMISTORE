// ** Redux Imports
import { Dispatch } from 'redux'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import { createRoleAsync, deleteRoleAsync, getAllRolesAsync, serviceName, updateRoleAsync } from './action'

interface DataParams {
  q: string
  role: string
  status: string
  currentPlan: string
}

interface Redux {
  getState: any
  dispatch: Dispatch<any>
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

  roles: {
    data: [],
    total: 0
  }
}

export const roleSlice = createSlice({
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
    }
  },
  extraReducers: builder => {

    //get all roles
    builder.addCase(getAllRolesAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(getAllRolesAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.roles.data = Array.isArray(action?.payload?.data?.roles) ? action?.payload?.data?.roles : [];
      state.roles.total = action?.payload?.data?.totalCount
    })
    builder.addCase(getAllRolesAsync.rejected, (state, action) => {
      state.isLoading = false
      state.roles.data = []
      state.roles.total = 0
    })

    //create role
    builder.addCase(createRoleAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(createRoleAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessCreateUpdate = !!action.payload?.isSuccess
      state.isErrorCreateUpdate = !action.payload?.isSuccess
      state.errorMessageCreateUpdate = action.payload?.message
      state.typeError = action.payload?.typeError
    })
    builder.addCase(createRoleAsync.rejected, (state, action) => {
      state.isLoading = false
      state.isErrorCreateUpdate = true
      state.errorMessageCreateUpdate = action.error.message || 'Error creating role'
    })

    //update role
    builder.addCase(updateRoleAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(updateRoleAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessCreateUpdate = !!action.payload?.isSuccess
      state.isErrorCreateUpdate = !action.payload?.isSuccess
      state.errorMessageCreateUpdate = action.payload?.message
      state.typeError = action.payload?.typeError
    })
    builder.addCase(updateRoleAsync.rejected, (state, action) => {
      state.isLoading = false
      state.isErrorCreateUpdate = true
      state.errorMessageCreateUpdate = action.error.message || 'Error updating role'
    })
    
    //delete role
    builder.addCase(deleteRoleAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(deleteRoleAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessDelete = !!action.payload?.isSuccess
      state.isErrorDelete = !action.payload?.isSuccess
      state.errorMessageDelete = action.payload?.message
      state.typeError = action.payload?.typeError
    })
    builder.addCase(deleteRoleAsync.rejected, (state, action) => {
      state.isLoading = false
      state.isErrorDelete = true
      state.errorMessageDelete = action.error.message || 'Error deleting role'
    })
    
  }
})

export const { resetInitialState } = roleSlice.actions
export default roleSlice.reducer
