// ** Redux Imports
import { createSlice } from '@reduxjs/toolkit'

// ** Axios Imports
import { changePasswordAsync, registerAuthAsync, serviceName, updateAuthMeAsync, updateProfileAsync } from './action'

//Type
import { UserDataType } from 'src/contexts/types'

type TInitialState = {
  isLoading: boolean,
  isSuccess: boolean,
  isError: boolean,
  errorMessage: string,
  typeError: string,
  isSuccessUpdateMe: boolean,
  isErrorUpdateMe: boolean,
  errorMessageUpdateMe: string,

  isSuccessUpdateProfile: boolean,
  isErrorUpdateProfile: boolean,
  errorMessageUpdateProfile: string,

  isSuccessChangePassword: boolean,
  isErrorChangePassword: boolean,
  errorMessageChangePassword: string,
  userData: UserDataType | null
}


const initialState: TInitialState = {
  isLoading: false,
  isSuccess: false,
  isError: false,
  errorMessage: '',
  // statusCode: 0
  typeError: '',
  isSuccessUpdateMe: false,
  isErrorUpdateMe: false,
  errorMessageUpdateMe: '',

  isSuccessUpdateProfile: false,
  isErrorUpdateProfile: false,
  errorMessageUpdateProfile: '',

  isSuccessChangePassword: false,
  isErrorChangePassword: false,
  errorMessageChangePassword: '',
  userData: null
}

export const authSlice = createSlice({
  name: serviceName,
  initialState,
  reducers: {
    resetInitialState: state => {
      state.isLoading = false
      state.isSuccess = false
      state.isError = true
      state.errorMessage = ""
      state.typeError = ""

      state.isSuccessUpdateMe = false
      state.isErrorUpdateMe = true
      state.errorMessageUpdateMe = ""

      state.isSuccessUpdateProfile = false
      state.isErrorUpdateProfile = true
      state.errorMessageUpdateProfile = ""


      state.isSuccessChangePassword = false
      state.isErrorChangePassword = true
      state.errorMessageChangePassword = ""
    }
  },
  extraReducers: builder => {

    //register
    builder.addCase(registerAuthAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(registerAuthAsync.fulfilled, (state, action) => {

      state.isLoading = false
      state.isSuccess = !!action.payload?.isSuccess
      state.isError = !action.payload?.isSuccess
      state.errorMessage = action.payload?.response?.data?.message
    })
    builder.addCase(registerAuthAsync.rejected, (state, action) => {
      state.isLoading = false
      state.isSuccess = false
      state.isError = true
      state.errorMessage = ""
      state.typeError = ""
    })

    //update profile
    builder.addCase(updateProfileAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(updateProfileAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessUpdateProfile = !!action.payload?.isSuccess
      state.isErrorUpdateProfile = !action.payload?.isSuccess
      state.errorMessageUpdateProfile = action.payload?.response?.data?.message
    })
    builder.addCase(updateProfileAsync.rejected, (state, action) => {
      state.isLoading = false
      state.isSuccessUpdateProfile = false
      state.isErrorUpdateProfile = true
      state.errorMessageUpdateProfile = action.error?.message || ''
    })

    //update me
    builder.addCase(updateAuthMeAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(updateAuthMeAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessUpdateMe = !!action.payload?.data?.email
      state.isErrorUpdateMe = !action.payload?.data?.email
      state.errorMessageUpdateMe = action.payload?.message
      state.typeError = action.payload?.typeError
      state.userData = action.payload?.data
    })
    builder.addCase(updateAuthMeAsync.rejected, (state, action) => {
      state.isLoading = false
      state.isSuccessUpdateMe = false
      state.isErrorUpdateMe = false
      state.errorMessageUpdateMe = ""
      state.typeError = ""
      state.userData = null
    })

    //change password me
    builder.addCase(changePasswordAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(changePasswordAsync.fulfilled, (state, action) => {
      console.log(action)
      state.isLoading = false
      state.isSuccessChangePassword = action.payload?.message === undefined ? true : false
      state.isErrorChangePassword = action.payload?.message === undefined ? false : true
      state.errorMessageChangePassword = action.payload?.message
      state.typeError = action.payload?.typeError
    })
    builder.addCase(changePasswordAsync.rejected, (state, action) => {
      state.isLoading = false
      state.isSuccessChangePassword = false
      state.isErrorChangePassword = true
      state.errorMessageChangePassword = ""
      state.typeError = ""
    })
  }
})

export const { resetInitialState } = authSlice.actions
export default authSlice.reducer
