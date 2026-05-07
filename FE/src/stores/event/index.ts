// ** Redux Imports
import { createSlice } from '@reduxjs/toolkit'

// ** Action Imports
import { createEventAsync, deleteMultipleEventsAsync, deleteEventAsync, getAllEventsAsync, getEventCodeAsync, serviceName, updateEventAsync } from './action'
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

  events: {
    data: [],
    total: 0
  },
  eventCode: ''
}

export const eventSlice = createSlice({
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

    //get all Events
    builder.addCase(getAllEventsAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(getAllEventsAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.events.data = Array.isArray(action?.payload?.result?.subset) ? action?.payload?.result?.subset : [];
      state.events.total = action?.payload?.result?.totalItemCount
    })
    builder.addCase(getAllEventsAsync.rejected, (state, action) => {
      state.isLoading = false
      state.events.data = []
      state.events.total = 0
    })

    //get Event Code
    builder.addCase(getEventCodeAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(getEventCodeAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.eventCode = action.payload?.result
    })
    builder.addCase(getEventCodeAsync.rejected, (state, action) => {
      state.isLoading = false
      state.eventCode = ''
    })

    //create Event
    builder.addCase(createEventAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(createEventAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessCreateUpdate = !!action.payload?.isSuccess
      state.isErrorCreateUpdate = !action.payload?.isSuccess
      state.errorMessageCreateUpdate = action.payload?.message
      state.typeError = action.payload?.errors
    })
    builder.addCase(createEventAsync.rejected, (state, action) => {
      state.isLoading = false
      state.isErrorCreateUpdate = true
      state.errorMessageCreateUpdate = action?.error?.message || 'Error creating Event'
    })

    //update Event
    builder.addCase(updateEventAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(updateEventAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessCreateUpdate = !!action.payload?.isSuccess
      state.isErrorCreateUpdate = !action.payload?.isSuccess
      state.typeError = action.payload?.errors
      state.errorMessageCreateUpdate = action.payload?.response?.data?.message
    })
    builder.addCase(updateEventAsync.rejected, (state, action) => {
      const payload = action.payload as ReduxPayload;
      state.isLoading = false
      state.isErrorCreateUpdate = true
      state.errorMessageCreateUpdate = payload?.errors?.errorMessage || 'Error updating Event'
    })

    //delete Event
    builder.addCase(deleteEventAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(deleteEventAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessDelete = !!action.payload?.isSuccess
      state.isErrorDelete = !action.payload?.isSuccess
      state.errorMessageDelete = action.payload?.message
      state.typeError = action.payload?.result?.errorMessage
    })
    builder.addCase(deleteEventAsync.rejected, (state, action) => {
      state.isLoading = false
      state.isErrorDelete = true
      state.errorMessageDelete = action?.error.message || 'Error deleting Event'
    })

    //delete multiple Event
    builder.addCase(deleteMultipleEventsAsync.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(deleteMultipleEventsAsync.fulfilled, (state, action) => {
      state.isLoading = false
      state.isSuccessDeleteMultiple = !!action.payload?.isSuccess
      state.isErrorDeleteMultiple = !action.payload?.isSuccess
      state.errorMessageDeleteMultiple = action.payload?.message
      state.typeError = action.payload?.typeError
    })
    builder.addCase(deleteMultipleEventsAsync.rejected, (state, action) => {
      state.isLoading = false
      state.isErrorDeleteMultiple = true
      state.errorMessageDeleteMultiple = action.error.message || 'Error deleting Event'
    })

  }
})

export const { resetInitialState } = eventSlice.actions
export default eventSlice.reducer
