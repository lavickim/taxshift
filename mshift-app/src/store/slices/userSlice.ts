import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  id?: string;
  email?: string;
  name?: string;
  isAuthenticated: boolean;
  profile?: {
    businessName?: string;
    businessType?: string;
    phoneNumber?: string;
    address?: string;
  };
  settings: {
    notifications: boolean;
    darkMode: boolean;
    language: string;
  };
  loading: boolean;
  error?: string;
}

const initialState: UserState = {
  isAuthenticated: false,
  settings: {
    notifications: true,
    darkMode: false,
    language: 'ko',
  },
  loading: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ id: string; email: string; name: string }>) => {
      state.id = action.payload.id;
      state.email = action.payload.email;
      state.name = action.payload.name;
      state.isAuthenticated = true;
      state.error = undefined;
    },
    setProfile: (state, action: PayloadAction<UserState['profile']>) => {
      state.profile = action.payload;
    },
    updateSettings: (state, action: PayloadAction<Partial<UserState['settings']>>) => {
      state.settings = { ...state.settings, ...action.payload };
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = undefined;
    },
    logout: (state) => {
      state.id = undefined;
      state.email = undefined;
      state.name = undefined;
      state.profile = undefined;
      state.isAuthenticated = false;
      state.error = undefined;
    },
  },
});

export const {
  setUser,
  setProfile,
  updateSettings,
  setLoading,
  setError,
  clearError,
  logout,
} = userSlice.actions;

export default userSlice.reducer;