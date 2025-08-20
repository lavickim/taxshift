import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Transaction {
  id: string;
  userId: string;
  receiptId?: string;
  amount: number;
  description: string;
  category: string;
  subcategory?: string;
  transactionDate: string;
  type: 'INCOME' | 'EXPENSE';
  paymentMethod?: string;
  accountNumber?: string;
  bankName?: string;
  cardType?: string;
  merchantName?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  tags?: string[];
  notes?: string;
  source: 'MANUAL_ENTRY' | 'RECEIPT_OCR' | 'BANK_IMPORT';
  confidence?: number;
  isVerified: boolean;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface TransactionState {
  transactions: Transaction[];
  currentTransaction: Transaction | null;
  loading: boolean;
  error: string | null;
  filters: {
    startDate?: string;
    endDate?: string;
    category?: string;
    type?: 'INCOME' | 'EXPENSE';
  };
}

const initialState: TransactionState = {
  transactions: [],
  currentTransaction: null,
  loading: false,
  error: null,
  filters: {},
};

const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setTransactions: (state, action: PayloadAction<Transaction[]>) => {
      state.transactions = action.payload;
    },
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      state.transactions.unshift(action.payload);
    },
    updateTransaction: (state, action: PayloadAction<Transaction>) => {
      const index = state.transactions.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.transactions[index] = action.payload;
      }
    },
    removeTransaction: (state, action: PayloadAction<string>) => {
      state.transactions = state.transactions.filter(t => t.id !== action.payload);
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
  },
});

export const {
  setLoading,
  setError,
  setTransactions,
  addTransaction,
  updateTransaction,
  removeTransaction,
  setCurrentTransaction,
  setFilters,
  clearFilters,
} = transactionSlice.actions;

export default transactionSlice.reducer;