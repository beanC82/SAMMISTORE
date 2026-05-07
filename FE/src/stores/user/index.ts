// ** Redux Imports
import { createSlice } from '@reduxjs/toolkit'

// ** Action Imports
import { createUserAsync, deleteMultipleUsersAsync, deleteUserAsync, getAllUsersAsync, serviceName, updateUserAsync } from './action'

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

  users: {
    data: [],
    total: 0
  }
}

export const userSlice = createSlice({
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

    //get all Users
    builder.addCase(getAllUsersAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(getAllUsersAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.users.data = Array.isArray(action?.payload?.data?.users) ? action?.payload?.data?.users : [];
      state.users.total = action?.payload?.data?.totalCount
    })
    builder.addCase(getAllUsersAsync.rejected, (state, action) => {
      state.isLoading = false
      state.users.data = []
      state.users.total = 0
    })

    //create User
    builder.addCase(createUserAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(createUserAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessCreateUpdate = !!action.payload?.isSuccess
      state.isErrorCreateUpdate = !action.payload?.isSuccess
      state.errorMessageCreateUpdate = action.payload?.message
      state.typeError = action.payload?.typeError
    })
    builder.addCase(createUserAsync.rejected, (state, action) => {
      state.isLoading = false
      state.isErrorCreateUpdate = true
      state.errorMessageCreateUpdate = action?.error?.message || 'Error creating User'
    })

    //update User
    builder.addCase(updateUserAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(updateUserAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessCreateUpdate = !!action.payload?.isSuccess
      state.isErrorCreateUpdate = !action.payload?.isSuccess
      state.errorMessageCreateUpdate = action.payload?.message
      state.typeError = action.payload?.typeError
    })
    builder.addCase(updateUserAsync.rejected, (state, action) => {
      state.isLoading = false
      state.isErrorCreateUpdate = true
      state.errorMessageCreateUpdate = action.error.message || 'Error updating User'
    })

    //delete User
    builder.addCase(deleteUserAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(deleteUserAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessDelete = !!action.payload?.isSuccess
      state.isErrorDelete = !action.payload?.isSuccess
      state.errorMessageDelete = action.payload?.message
      state.typeError = action.payload?.typeError
    })
    builder.addCase(deleteUserAsync.rejected, (state, action) => {
      state.isLoading = false
      state.isErrorDelete = true
      state.errorMessageDelete = action?.error.message || 'Error deleting User'
    })

    //delete multiple User
    builder.addCase(deleteMultipleUsersAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(deleteMultipleUsersAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessDeleteMultiple = !!action.payload?.data
      state.isErrorDeleteMultiple = !action.payload?.data
      state.errorMessageDeleteMultiple = action.payload?.message
      state.typeError = action.payload?.typeError
    })
    builder.addCase(deleteMultipleUsersAsync.rejected, (state, action) => {
      state.isLoading = false
      state.isErrorDeleteMultiple = true
      state.errorMessageDeleteMultiple = action.error.message || 'Error deleting User'
    })

  }
})

export const { resetInitialState } = userSlice.actions
export default userSlice.reducer
