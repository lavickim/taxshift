import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import receiptReducer from './slices/receiptSlice';
import transactionReducer from './slices/transactionSlice';
import dashboardReducer from './slices/dashboardSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    receipt: receiptReducer,
    transaction: transactionReducer,
    dashboard: dashboardReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;