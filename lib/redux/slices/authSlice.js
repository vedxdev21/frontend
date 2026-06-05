import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';
import { userAPI, authAPI } from '@/lib/api';

// Async thunks
export const fetchUser = createAsyncThunk('auth/fetchUser', async (_, { rejectWithValue }) => {
  try {
    const { data } = await userAPI.getMe();
    return data.user || data.data?.user || data.data || data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to fetch user');
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (formData, { rejectWithValue }) => {
  try {
    const { data } = await userAPI.updateMe(formData);
    return data.user || data.data?.user || data.data || data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to update profile');
  }
});

export const profileSetup = createAsyncThunk('auth/profileSetup', async (formData, { rejectWithValue }) => {
  try {
    const { data } = await userAPI.profileSetup(formData);
    return data.user || data.data?.user || data.data || data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to setup profile');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: true,
    isAuthenticated: false,
    error: null,
  },
  reducers: {
    loginSuccess: (state, action) => {
      const { accessToken, refreshToken, user } = action.payload;
      Cookies.set('accessToken', accessToken, { expires: 7, sameSite: 'Lax' });
      Cookies.set('refreshToken', refreshToken, { expires: 30, sameSite: 'Lax' });
      state.user = user;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    logout: (state) => {
      try { authAPI.logout(); } catch {}
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      if (typeof window !== 'undefined') window.location.href = '/login';
    },
    setUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchUser
      .addCase(fetchUser.pending, (state) => { state.loading = true; })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addCase(fetchUser.rejected, (state) => {
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
      })
      // updateProfile
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload };
      })
      // profileSetup
      .addCase(profileSetup.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload };
      });
  },
});

export const { loginSuccess, logout, setUser, setLoading, clearError } = authSlice.actions;

// Selectors
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;

export default authSlice.reducer;
