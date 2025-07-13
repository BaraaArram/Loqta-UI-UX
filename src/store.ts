// store.ts: Configures and exports the Redux store for the application.
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import cartReducer from './features/cart/cartSlice';
import themeReducer, { Theme } from './features/theme/themeSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    theme: themeReducer,
  },
  preloadedState: {
    cart: { cart: [], loading: false, error: null },
    theme: { theme: 'bazaar' as Theme },
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store; 