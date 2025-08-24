import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Transaction } from '../../types/Receipt';

interface DashboardState {
  totalIncome: number;
  totalExpense: number;
  recentTransactions: Transaction[];
  monthlyData: Array<{ month: string; income: number; expense: number }>;
  categoryBreakdown: Array<{ category: string; amount: number; percentage: number }>;
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  totalIncome: 0,
  totalExpense: 0,
  recentTransactions: [],
  monthlyData: [],
  categoryBreakdown: [],
  loading: false,
  error: null,
};

// Mock data for demo
const mockTransactions: Transaction[] = [
  {
    id: '1',
    userId: 'demo_user_123',
    receiptId: 'receipt_1',
    amount: 17710,
    description: '스타벅스 강남점',
    category: '카페/음료',
    date: new Date('2024-08-05T14:23:00'),
    type: 'expense',
    paymentMethod: '신용카드',
    location: '서울시 강남구',
    tags: ['커피', '음료'],
    createdAt: new Date('2024-08-05T14:23:00'),
    updatedAt: new Date('2024-08-05T14:23:00'),
  },
  {
    id: '2',
    userId: 'demo_user_123',
    amount: 18000,
    description: '김밥천국 역삼점',
    category: '음식점',
    date: new Date('2024-08-05T12:15:00'),
    type: 'expense',
    paymentMethod: '현금',
    location: '서울시 강남구',
    tags: ['식사', '한식'],
    createdAt: new Date('2024-08-05T12:15:00'),
    updatedAt: new Date('2024-08-05T12:15:00'),
  },
  {
    id: '3',
    userId: 'demo_user_123',
    amount: 3500000,
    description: '급여',
    category: '급여',
    date: new Date('2024-08-01T09:00:00'),
    type: 'income',
    paymentMethod: '계좌이체',
    tags: ['급여', '수입'],
    createdAt: new Date('2024-08-01T09:00:00'),
    updatedAt: new Date('2024-08-01T09:00:00'),
  },
  {
    id: '4',
    userId: 'demo_user_123',
    amount: 53190,
    description: 'SK에너지 강남주유소',
    category: '교통',
    date: new Date('2024-08-04T16:45:00'),
    type: 'expense',
    paymentMethod: '신용카드',
    location: '서울시 강남구',
    tags: ['주유', '교통'],
    createdAt: new Date('2024-08-04T16:45:00'),
    updatedAt: new Date('2024-08-04T16:45:00'),
  },
  {
    id: '5',
    userId: 'demo_user_123',
    amount: 42000,
    description: '치킨마루 강남점 (배달)',
    category: '배달음식',
    date: new Date('2024-08-03T19:20:00'),
    type: 'expense',
    paymentMethod: '신용카드',
    tags: ['배달', '치킨', '저녁'],
    createdAt: new Date('2024-08-03T19:20:00'),
    updatedAt: new Date('2024-08-03T19:20:00'),
  },
];

export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchData',
  async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const totalIncome = mockTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = mockTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const categoryBreakdown = mockTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        const existing = acc.find(c => c.category === t.category);
        if (existing) {
          existing.amount += t.amount;
        } else {
          acc.push({ category: t.category, amount: t.amount, percentage: 0 });
        }
        return acc;
      }, [] as Array<{ category: string; amount: number; percentage: number }>);
    
    // Calculate percentages
    categoryBreakdown.forEach(item => {
      item.percentage = (item.amount / totalExpense) * 100;
    });
    
    const monthlyData = [
      { month: '6월', income: 3500000, expense: 1250000 },
      { month: '7월', income: 3500000, expense: 1380000 },
      { month: '8월', income: 3500000, expense: 890000 },
    ];
    
    return {
      totalIncome,
      totalExpense,
      recentTransactions: mockTransactions.slice(0, 5),
      categoryBreakdown,
      monthlyData,
    };
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.totalIncome = action.payload.totalIncome;
        state.totalExpense = action.payload.totalExpense;
        state.recentTransactions = action.payload.recentTransactions;
        state.categoryBreakdown = action.payload.categoryBreakdown;
        state.monthlyData = action.payload.monthlyData;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch dashboard data';
      });
  },
});

export const { clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer;