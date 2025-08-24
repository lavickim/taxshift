import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Transaction, DashboardData } from '../../types';
import apiService from '../../services/api';

interface TransactionState {
  transactions: Transaction[];
  currentTransaction: Transaction | null;
  dashboardData: DashboardData | null;
  loading: boolean;
  error: string | null;
  filters: {
    startDate?: string;
    endDate?: string;
    categoryId?: number;
    transactionType?: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  };
}

// Async thunks
export const fetchTransactions = createAsyncThunk(
  'transaction/fetchTransactions',
  async (_, { rejectWithValue }) => {
    try {
      return await apiService.getTransactions();
    } catch (error: any) {
      return rejectWithValue(error.message || '거래내역 조회 중 오류가 발생했습니다.');
    }
  }
);

export const fetchDashboardData = createAsyncThunk(
  'transaction/fetchDashboardData',
  async (_, { rejectWithValue }) => {
    try {
      return await apiService.getDashboardData();
    } catch (error: any) {
      return rejectWithValue(error.message || '대시보드 데이터 조회 중 오류가 발생했습니다.');
    }
  }
);

export const createTransaction = createAsyncThunk(
  'transaction/createTransaction',
  async (transactionData: Partial<Transaction>, { rejectWithValue }) => {
    try {
      return await apiService.createTransaction(transactionData);
    } catch (error: any) {
      return rejectWithValue(error.message || '거래내역 생성 중 오류가 발생했습니다.');
    }
  }
);

export const updateTransaction = createAsyncThunk(
  'transaction/updateTransaction',
  async ({ id, data }: { id: number; data: Partial<Transaction> }, { rejectWithValue }) => {
    try {
      return await apiService.updateTransaction(id, data);
    } catch (error: any) {
      return rejectWithValue(error.message || '거래내역 수정 중 오류가 발생했습니다.');
    }
  }
);

export const deleteTransaction = createAsyncThunk(
  'transaction/deleteTransaction',
  async (id: number, { rejectWithValue }) => {
    try {
      await apiService.deleteTransaction(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || '거래내역 삭제 중 오류가 발생했습니다.');
    }
  }
);

const initialState: TransactionState = {
  transactions: [],
  currentTransaction: null,
  dashboardData: null,
  loading: false,
  error: null,
  filters: {},
};

const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentTransaction: (state, action: PayloadAction<Transaction | null>) => {
      state.currentTransaction = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<TransactionState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    resetTransactions: (state) => {
      state.transactions = [];
      state.currentTransaction = null;
      state.dashboardData = null;
      state.loading = false;
      state.error = null;
      state.filters = {};
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Transactions
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch transactions';
      })
      // Fetch Dashboard Data
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardData = action.payload;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch dashboard data';
      })
      // Create Transaction
      .addCase(createTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions.unshift(action.payload);
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to create transaction';
      })
      // Update Transaction
      .addCase(updateTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTransaction.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.transactions.findIndex(t => t.transactionId === action.payload.transactionId);
        if (index !== -1) {
          state.transactions[index] = action.payload;
        }
        if (state.currentTransaction?.transactionId === action.payload.transactionId) {
          state.currentTransaction = action.payload;
        }
      })
      .addCase(updateTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to update transaction';
      })
      // Delete Transaction
      .addCase(deleteTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = state.transactions.filter(t => t.transactionId !== action.payload);
        if (state.currentTransaction?.transactionId === action.payload) {
          state.currentTransaction = null;
        }
      })
      .addCase(deleteTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to delete transaction';
      });
  },
});

export const {
  clearError,
  setCurrentTransaction,
  setFilters,
  clearFilters,
  resetTransactions,
} = transactionSlice.actions;

export default transactionSlice.reducer;