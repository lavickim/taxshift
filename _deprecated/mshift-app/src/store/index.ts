import { configureStore } from '@reduxjs/toolkit';
import userSlice from './slices/userSlice';
import transactionSlice from './slices/transactionSlice';
import dashboardSlice from './slices/dashboardSlice';
import bookkeepingSlice from './slices/bookkeepingSlice';

export const store = configureStore({
  reducer: {
    user: userSlice,
    transaction: transactionSlice,
    dashboard: dashboardSlice,
    bookkeeping: bookkeepingSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;