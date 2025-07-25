// cartSlice.ts: Redux slice for cart state, actions, and async thunks.
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from '../../lib/axios';

export interface CartCoupon {
  code: string;
  discount: number;
}

export interface CartItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  thumbnail?: string;
  category_detail?: { name: string; slug: string };
  total_price?: number;
}

export interface CartTotalPrice {
  with_discount: number;
  without_discount: number;
}

interface CartState {
  cart: {
    items: CartItem[];
    coupon?: CartCoupon;
    total_price?: CartTotalPrice;
  } | null;
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  cart: null,
  loading: false,
  error: null,
};

// Helper to normalize cart items from API
const normalizeCartItems = (items: any[]) =>
  items.map(item => ({
    product_id: item.product.product_id,
    name: item.product.name,
    price: item.product.price,
    quantity: item.quantity,
    thumbnail: item.product.thumbnail,
    category_detail: item.product.category_detail,
    total_price: item.total_price ? parseFloat(item.total_price) : undefined,
  }));

export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue }) => {
  try {
    console.log('[fetchCart] Request: GET /api/v1/cart/');
    const res = await axios.get('/api/v1/cart/', { withCredentials: true });
    console.log('[fetchCart] Response:', res.data);
    const data = res.data.data || {};
    return {
      items: normalizeCartItems(data.items || []),
      coupon: data.coupon,
      total_price: data.total_price,
    };
  } catch (err: any) {
    console.error('[fetchCart] Error:', err);
    return rejectWithValue(err.response?.data?.message || err.message || 'Failed to load cart.');
  }
});

export const addToCart = createAsyncThunk('cart/addToCart', async ({ productId, quantity }: { productId: string; quantity: number }, { rejectWithValue }) => {
  try {
    console.log('[addToCart] Request: POST /api/v1/cart/' + productId + '/add/', { quantity, override: false });
    await axios.post(`/api/v1/cart/${productId}/add/`, { quantity, override: false }, { withCredentials: true });
    const res = await axios.get('/api/v1/cart/', { withCredentials: true });
    console.log('[addToCart] Response:', res.data);
    const data = res.data.data || {};
    return {
      items: normalizeCartItems(data.items || []),
      coupon: data.coupon,
      total_price: data.total_price,
    };
  } catch (err: any) {
    console.error('[addToCart] Error:', err);
    return rejectWithValue(err.response?.data?.message || err.message || 'Failed to add to cart.');
  }
});

export const removeFromCart = createAsyncThunk('cart/removeFromCart', async (productId: string, { rejectWithValue }) => {
  try {
    console.log('[removeFromCart] Request: DELETE /api/v1/cart/' + productId + '/remove/');
    await axios.delete(`/api/v1/cart/${productId}/remove/`, { withCredentials: true });
    const res = await axios.get('/api/v1/cart/', { withCredentials: true });
    console.log('[removeFromCart] Response:', res.data);
    const data = res.data.data || {};
    return {
      items: normalizeCartItems(data.items || []),
      coupon: data.coupon,
      total_price: data.total_price,
    };
  } catch (err: any) {
    console.error('[removeFromCart] Error:', err);
    return rejectWithValue(err.response?.data?.message || err.message || 'Failed to remove item.');
  }
});

export const clearCart = createAsyncThunk('cart/clearCart', async (_, { rejectWithValue }) => {
  try {
    console.log('[clearCart] Request: POST /api/v1/cart/clear/');
    await axios.post('/api/v1/cart/clear/', {}, { withCredentials: true });
    console.log('[clearCart] Response: Cart cleared');
    return null; // Return null as the cart is now empty
  } catch (err: any) {
    console.error('[clearCart] Error:', err);
    return rejectWithValue(err.response?.data?.message || err.message || 'Failed to clear cart.');
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCart(state, action: PayloadAction<CartState['cart']>) {
      state.cart = action.payload;
    },
    addToCartLocal(state, action: PayloadAction<{ product: CartItem }>) {
      const item = action.payload.product;
      if (state.cart) {
        const existing = state.cart.items.find(i => i.product_id === item.product_id);
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          state.cart.items.push(item);
        }
      }
    },
    removeFromCartLocal(state, action: PayloadAction<string>) {
      if (state.cart) {
        state.cart.items = state.cart.items.filter(i => i.product_id !== action.payload);
      }
    },
    clearCartLocal(state) {
      state.cart = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(clearCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.loading = false;
        state.cart = null;
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default cartSlice.reducer;
export const { setCart, addToCartLocal, removeFromCartLocal, clearCartLocal } = cartSlice.actions; 