import { createSlice } from '@reduxjs/toolkit';
import { createCartAsync, deleteCartAsync, getCartDataAsync, getCartsAsync, serviceName } from './action';
import { TItemCartProduct } from 'src/types/cart';

const initialState = {
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
  typeError: '',
  isSuccessCreate: false,
  isErrorCreate: false,
  errorMessageCreate: '',
  isSuccessDelete: false,
  isErrorDelete: false,
  errorMessageDelete: '',
  carts: {
    data: [] as any[],
    total: 0,
  },
  cartData: {
    data: [],
    total: 0,
  },
};

export const cartSlice = createSlice({
  name: serviceName,
  initialState,
  reducers: {
    resetInitialState: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
      state.typeError = '';
      state.isSuccessCreate = false;
      state.isErrorCreate = false;
      state.errorMessageCreate = '';
      state.isSuccessDelete = false;
      state.isErrorDelete = false;
      state.errorMessageDelete = '';
      state.carts.data = [];
      state.carts.total = 0;
    },
    updateCartQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const item: any = state.carts.data.find((cart: any) => cart.productId === productId);
      if (item) {
        item.quantity = quantity;
      }
    },
  },
  extraReducers: (builder) => {
    // Get Cart
    builder
      .addCase(getCartsAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCartsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.carts.data = Array.isArray(action?.payload?.result) ? action.payload.result : [];
        state.carts.total = action?.payload?.length || 0;
      })
      .addCase(getCartsAsync.rejected, (state) => {
        state.isLoading = false;
        state.carts.data = [];
        state.carts.total = 0;
      });

    // Get Cart Data
    builder
      .addCase(getCartDataAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCartDataAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartData.data = Array.isArray(action?.payload?.result) ? action.payload.result : [];
        state.cartData.total = action?.payload?.length || 0;
      })
      .addCase(getCartDataAsync.rejected, (state) => {
        state.isLoading = false;
        state.cartData.data = [];
        state.cartData.total = 0;
      });

    // Create/Update Cart
    builder
      .addCase(createCartAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createCartAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccessCreate = !!action.payload?.isSuccess;
        state.isErrorCreate = !action.payload?.isSuccess;
        state.errorMessageCreate = action.payload?.message || '';
        if (action.payload?.isSuccess) {
          const { productId, quantity }: any = action.meta.arg;
          const existingItem: any = state.carts.data.find((item: any) => item.productId === productId);
          if (existingItem) {
            existingItem.quantity = quantity; 
          } else {
            state.carts.data.push({ productId, quantity });
          }
          state.carts.total = state.carts.data.length;
        }
      })
      .addCase(createCartAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.isErrorCreate = true;
        state.errorMessageCreate = action?.error.message || 'Error creating Cart';
      });

    // Delete Cart
    builder
      .addCase(deleteCartAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteCartAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccessDelete = !!action.payload?.isSuccess;
        state.isErrorDelete = !action.payload?.isSuccess;
        state.errorMessageDelete = action.payload?.message || '';
        if (action.payload?.isSuccess) {
          const productId = action.meta.arg; // Lấy productId từ request
          state.carts.data = state.carts.data.filter((item: any) => item.productId !== productId);
          state.carts.total = state.carts.data.length;
        }
      })
      .addCase(deleteCartAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.isErrorDelete = true;
        state.errorMessageDelete = action?.error.message || 'Error deleting Cart';
      });
  },
});

export const { resetInitialState, updateCartQuantity } = cartSlice.actions;
export default cartSlice.reducer;