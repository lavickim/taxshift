// 백엔드 API 응답과 일치하는 타입 정의

export interface User {
  userId: number;
  username: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Asset {
  assetId: number;
  userId: number;
  assetName: string;
  assetType: 'CASH' | 'BANK_ACCOUNT' | 'CARD' | 'INVESTMENT' | 'OTHER';
  bankName?: string;
  accountNumber?: string;
  balance: number;
  colorCode: string;
  iconName: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  categoryId: number;
  userId?: number;
  categoryName: string;
  categoryType: 'INCOME' | 'EXPENSE';
  iconName: string;
  colorCode: string;
  parentCategoryId?: number;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  transactionId: number;
  userId: number;
  assetId: number;
  categoryId: number;
  transactionType: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  amount: number;
  description: string;
  memo?: string;
  transactionDate: string;
  transactionTime: string;
  receiptPhotoUrl?: string;
  location?: string;
  targetAssetId?: number;
  isRecurring?: boolean;
  recurringType?: string;
  recurringInterval?: number;
  recurringEndDate?: string;
  parentTransactionId?: number;
  createdAt: string;
  updatedAt: string;
}

// API 요청/응답 타입들

export interface LoginRequest {
  identifier: string; // username or email
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: User;
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface DashboardData {
  totalTransactions: number;
  recentTransactions: Transaction[];
  monthlyTrend: MonthlyTrendData[];
  categoryStats: CategoryStatsData[];
  monthlySummary: MonthlySummaryData;
}

export interface MonthlyTrendData {
  year: number;
  month: number;
  totalIncome: number;
  totalExpense: number;
}

export interface CategoryStatsData {
  categoryName: string;
  totalAmount: number;
  percentage?: number;
}

export interface MonthlySummaryData {
  key: string;
  value: number;
}

export interface FinancialOverview {
  totalAssets: number;
  monthlySummary: MonthlySummaryData;
  quarterlyTrend: MonthlyTrendData[];
  totalTransactions: number;
  generatedAt: string;
}

export interface MonthlyAnalysis {
  monthlyData: MonthlyTrendData[];
  summary: {
    totalIncome: number;
    totalExpense: number;
    netIncome: number;
    avgIncome: number;
    avgExpense: number;
    maxIncome: number;
    maxExpense: number;
    period: string;
  };
}

// Navigation 타입들
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
  TransactionDetail: { transactionId: number };
  AddTransaction: undefined;
  EditTransaction: { transactionId: number };
  Categories: undefined;
  Settings: undefined;
};

export type BottomTabParamList = {
  Home: undefined;
  Transactions: undefined;
  AddTransaction: undefined;
  Statistics: undefined;
  Settings: undefined;
};