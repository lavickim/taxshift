import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DashboardSummary {
  totalRevenue: number;
  totalExpense: number;
  netIncome: number;
  transactionCount: number;
  pendingCount: number;
  approvedCount: number;
  currentMonth: string;
}

interface NotificationItem {
  id: string;
  type: 'warning' | 'info' | 'success' | 'error';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

interface DashboardState {
  summary: DashboardSummary;
  notifications: NotificationItem[];
  recentTransactions: any[];
  loading: boolean;
  refreshing: boolean;
  error?: string;
  lastUpdated?: string;
}

const initialState: DashboardState = {
  summary: {
    totalRevenue: 0,
    totalExpense: 0,
    netIncome: 0,
    transactionCount: 0,
    pendingCount: 0,
    approvedCount: 0,
    currentMonth: new Date().toISOString().slice(0, 7),
  },
  notifications: [],
  recentTransactions: [],
  loading: false,
  refreshing: false,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setSummary: (state, action: PayloadAction<DashboardSummary>) => {
      state.summary = action.payload;
      state.loading = false;
      state.refreshing = false;
      state.error = undefined;
      state.lastUpdated = new Date().toISOString();
    },
    setNotifications: (state, action: PayloadAction<NotificationItem[]>) => {
      state.notifications = action.payload;
    },
    addNotification: (state, action: PayloadAction<NotificationItem>) => {
      state.notifications.unshift(action.payload);
    },
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.isRead = true;
      }
    },
    clearNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    setRecentTransactions: (state, action: PayloadAction<any[]>) => {
      state.recentTransactions = action.payload;
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
    updateSummaryField: (state, action: PayloadAction<Partial<DashboardSummary>>) => {
      state.summary = { ...state.summary, ...action.payload };
    },
    resetDashboard: (state) => {
      state.summary = initialState.summary;
      state.notifications = [];
      state.recentTransactions = [];
      state.error = undefined;
      state.lastUpdated = undefined;
    },
  },
});

export const {
  setSummary,
  setNotifications,
  addNotification,
  markNotificationAsRead,
  clearNotification,
  setRecentTransactions,
  setLoading,
  setRefreshing,
  setError,
  clearError,
  updateSummaryField,
  resetDashboard,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;