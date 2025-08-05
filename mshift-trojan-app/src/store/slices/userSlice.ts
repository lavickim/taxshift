import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types/Receipt';

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Mock user data for demo
const mockUser: User = {
  id: 'demo_user_123',
  email: 'demo@moneyshift.co.kr',
  name: '데모 사용자',
  profileImage: undefined,
  isPremium: false,
  createdAt: new Date(),
  preferences: {
    currency: 'KRW',
    language: 'ko',
    notifications: true,
    autoCategory: true,
    dataSharing: true,
  },
};

export const loginUser = createAsyncThunk(
  'user/login',
  async ({ email, password }: { email: string; password: string }) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demo purposes, always return mock user
    return mockUser;
  }
);

export const registerUser = createAsyncThunk(
  'user/register',
  async ({ email, password, name }: { email: string; password: string; name: string }) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      ...mockUser,
      email,
      name,
    };
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    setDemoUser: (state) => {
      state.user = mockUser;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed';
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Registration failed';
      });
  },
});

export const { logout, clearError, updateUser, setDemoUser } = userSlice.actions;
export default userSlice.reducer;