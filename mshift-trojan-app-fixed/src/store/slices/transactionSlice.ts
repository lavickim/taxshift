import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TransactionItem } from '../../components/TransactionCard';

interface TransactionState {
  transactions: TransactionItem[];
  filteredTransactions: TransactionItem[];
  activeTab: 'all' | 'pending' | 'approved';
  searchQuery: string;
  selectedTransaction?: TransactionItem;
  loading: boolean;
  refreshing: boolean;
  error?: string;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
  };
}

const initialState: TransactionState = {
  transactions: [],
  filteredTransactions: [],
  activeTab: 'all',
  searchQuery: '',
  loading: false,
  refreshing: false,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 20,
  },
};

const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    setTransactions: (state, action: PayloadAction<TransactionItem[]>) => {
      state.transactions = action.payload;
      state.loading = false;
      state.refreshing = false;
      state.error = undefined;
    },
    setFilteredTransactions: (state, action: PayloadAction<TransactionItem[]>) => {
      state.filteredTransactions = action.payload;
    },
    setActiveTab: (state, action: PayloadAction<'all' | 'pending' | 'approved'>) => {
      state.activeTab = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSelectedTransaction: (state, action: PayloadAction<TransactionItem | undefined>) => {
      state.selectedTransaction = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setRefreshing: (state, action: PayloadAction<boolean>) => {
      state.refreshing = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
      state.refreshing = false;
    },
    clearError: (state) => {
      state.error = undefined;
    },
    updateTransaction: (state, action: PayloadAction<TransactionItem>) => {
      const index = state.transactions.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.transactions[index] = action.payload;
      }
    },
    addTransaction: (state, action: PayloadAction<TransactionItem>) => {
      state.transactions.unshift(action.payload);
    },
    removeTransaction: (state, action: PayloadAction<number>) => {
      state.transactions = state.transactions.filter(t => t.id !== action.payload);
    },
    setPagination: (state, action: PayloadAction<Partial<TransactionState['pagination']>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    resetTransactions: (state) => {
      state.transactions = [];
      state.filteredTransactions = [];
      state.selectedTransaction = undefined;
      state.error = undefined;
      state.pagination = initialState.pagination;
    },
  },
});

export const {
  setTransactions,
  setFilteredTransactions,
  setActiveTab,
  setSearchQuery,
  setSelectedTransaction,
  setLoading,
  setRefreshing,
  setError,
  clearError,
  updateTransaction,
  addTransaction,
  removeTransaction,
  setPagination,
  resetTransactions,
} = transactionSlice.actions;

export default transactionSlice.reducer;