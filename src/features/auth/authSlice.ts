import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  is_active?: boolean;
  date_joined?: string;
  last_login?: string;
  profile_pic?: string | null;
  is_staff?: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  hydrated: boolean;
  isStaff: boolean | undefined;
  isStaffLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null,
  refreshToken: typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null,
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('accessToken') : false,
  loading: false,
  error: null,
  hydrated: false,
  isStaff: undefined,
  isStaffLoading: false,
};

// Helper functions for localStorage
const setAccessToken = (token: string | null | undefined) => {
  if (token && token !== 'undefined') {
    localStorage.setItem('accessToken', token);
  } else {
    localStorage.removeItem('accessToken');
  }
};

const setRefreshToken = (token: string | null | undefined) => {
  if (token && token !== 'undefined') {
    localStorage.setItem('refreshToken', token);
  } else {
    localStorage.removeItem('refreshToken');
  }
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      // Import axios dynamically to avoid circular dependency
      const axios = (await import('../../lib/axios')).default;
      
      const res = await axios.post('/auth/token/create/', credentials);
      console.log('LOGIN RESPONSE:', res);
      const { access, refresh } = res.data.data.data;
      console.log('LOGIN TOKENS:', { access, refresh });
      
      const profileRes = await axios.get('/auth/me/', {
        headers: { Authorization: `Bearer ${access}` },
      });
      console.log('PROFILE RESPONSE:', profileRes);
      
      return {
        user: profileRes.data.data,
        accessToken: access,
        refreshToken: refresh,
      };
    } catch (err: any) {
      console.log('LOGIN ERROR:', err, err?.response);
      return rejectWithValue(err.response?.data?.detail || err.message || 'Login failed');
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async (_, { getState }) => {
  const state = getState() as { auth: AuthState };
  const refreshToken = state.auth.refreshToken;
  try {
    if (refreshToken) {
      const axios = (await import('../../lib/axios')).default;
      console.log('LOGOUT REQUEST:', { url: '/auth/token/destroy/', body: { refresh: refreshToken } });
      const res = await axios.post('/auth/token/destroy/', { refresh: refreshToken });
      console.log('LOGOUT RESPONSE:', res);
    }
  } catch (err) {
    console.warn('LOGOUT API call failed, clearing tokens anyway:', err);
  } finally {
    if (typeof window !== 'undefined') {
      setAccessToken(null);
      setRefreshToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
  return {};
});

export const register = createAsyncThunk(
  'auth/register',
  async (userData: { email: string; password: string; [key: string]: any }, { rejectWithValue }) => {
    try {
      const axios = (await import('../../lib/axios')).default;
      const res = await axios.post('/auth/register/', userData);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || err.message || 'Registration failed');
    }
  }
);

export const refreshAccessToken = createAsyncThunk(
  'auth/refreshAccessToken',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { auth: AuthState };
    const refreshToken = state.auth.refreshToken || (typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null);
    if (!refreshToken) {
      return rejectWithValue('No refresh token available');
    }
    try {
      const axios = (await import('../../lib/axios')).default;
      const res = await axios.post('/auth/token/refresh/', { refresh: refreshToken });
      const { access } = res.data;
      if (typeof window !== 'undefined') {
        setAccessToken(access);
      }
      return access;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || err.message || 'Token refresh failed');
    }
  }
);

// Thunk to fetch staff status
export const fetchStaffStatus = createAsyncThunk('auth/fetchStaffStatus', async (_, { getState, rejectWithValue }) => {
  const state = getState() as { auth: AuthState };
  const accessToken = state.auth.accessToken;
  
  // If already fetched and we have a valid result, don't make another request
  if (state.auth.isStaff !== undefined) {
    console.log('Staff status already cached, skipping API call');
    return state.auth.isStaff;
  }
  
  if (!accessToken) {
    console.log('No access token, returning false for staff status');
    return false;
  }
  
  console.log('Fetching staff status from API...');
  try {
    const axios = (await import('../../lib/axios')).default;
    const res = await axios.get('/auth/staff-check/', {
      headers: { Authorization: `Bearer ${accessToken}` },
      withCredentials: true,
    });
    console.log('Staff status API response:', res.data);
    return res.data?.data?.is_staff === true;
  } catch (err) {
    console.error('Staff status API error:', err);
    return false;
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
    setHydrated(state, action: PayloadAction<boolean>) { 
      state.hydrated = action.payload; 
    },
    setTokensFromStorage(state) {
      if (typeof window !== 'undefined') {
        let accessToken = localStorage.getItem('accessToken');
        let refreshToken = localStorage.getItem('refreshToken');
        if (!accessToken || accessToken === 'undefined') accessToken = null;
        if (!refreshToken || refreshToken === 'undefined') refreshToken = null;
        state.accessToken = accessToken;
        state.refreshToken = refreshToken;
        state.isAuthenticated = !!accessToken;
      }
    },
    resetStaffStatus(state) {
      state.isStaff = undefined;
      state.isStaffLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isStaff = undefined; // will be fetched after login
        state.isStaffLoading = false; // reset loading state
        if (typeof window !== 'undefined') {
          setAccessToken(action.payload.accessToken);
          setRefreshToken(action.payload.refreshToken);
          console.log('SAVED TO LOCALSTORAGE:', {
            accessToken: localStorage.getItem('accessToken'),
            refreshToken: localStorage.getItem('refreshToken'),
          });
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        if (typeof window !== 'undefined') {
          setAccessToken(null);
          setRefreshToken(null);
        }
      })
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isStaff = undefined;
        state.isStaffLoading = false;
        if (typeof window !== 'undefined') {
          setAccessToken(null);
          setRefreshToken(null);
        }
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false;
        // Registration does not log in the user by default
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.accessToken = action.payload;
        state.isAuthenticated = !!action.payload;
        if (typeof window !== 'undefined') {
          setAccessToken(action.payload);
        }
      })
      .addCase(refreshAccessToken.rejected, (state) => {
        state.accessToken = null;
        state.isAuthenticated = false;
      })
      .addCase(fetchStaffStatus.pending, (state) => {
        state.isStaffLoading = true;
      })
      .addCase(fetchStaffStatus.fulfilled, (state, action) => {
        state.isStaff = action.payload;
        state.isStaffLoading = false;
      })
      .addCase(fetchStaffStatus.rejected, (state) => {
        state.isStaff = false;
        state.isStaffLoading = false;
      });
  },
});

export const { clearError, setUser, setHydrated, setTokensFromStorage, resetStaffStatus } = authSlice.actions;
export default authSlice.reducer; 