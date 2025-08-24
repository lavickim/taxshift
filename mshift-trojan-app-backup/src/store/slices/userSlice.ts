import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../../types';
import apiService from '../../services/api';

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

export const loginUser = createAsyncThunk(
  'user/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response: AuthResponse = await apiService.login(credentials);
      if (response.success) {
        return response.user;
      } else {
        return rejectWithValue(response.error || '로그인에 실패했습니다.');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || '로그인 중 오류가 발생했습니다.');
    }
  }
);

export const registerUser = createAsyncThunk(
  'user/register',
  async (userData: RegisterRequest, { rejectWithValue }) => {
    try {
      const response: AuthResponse = await apiService.register(userData);
      if (response.success) {
        return response.user;
      } else {
        return rejectWithValue(response.error || '회원가입에 실패했습니다.');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || '회원가입 중 오류가 발생했습니다.');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'user/logout',
  async (_, { rejectWithValue }) => {
    try {
      await apiService.logout();
    } catch (error: any) {
      return rejectWithValue(error.message || '로그아웃 중 오류가 발생했습니다.');
    }
  }
);

export const getUserProfile = createAsyncThunk(
  'user/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const user = await apiService.getUserProfile();
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message || '사용자 정보 조회 중 오류가 발생했습니다.');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    resetUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
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
        state.error = action.payload as string || 'Login failed';
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
        state.error = action.payload as string || 'Registration failed';
      })
      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Logout failed';
        // 로그아웃이 실패해도 로컬에서는 로그아웃 처리
        state.user = null;
        state.isAuthenticated = false;
      })
      // Get Profile
      .addCase(getUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Profile fetch failed';
      });
  },
});

export const { clearError, updateUser, resetUser } = userSlice.actions;
export default userSlice.reducer;