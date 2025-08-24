const API_BASE_URL = __DEV__ 
  ? 'http://192.168.45.224:8081/api' 
  : 'https://api.moneyshift.co.kr/api';

export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/v1/auth/login',
  REGISTER: '/v1/auth/register',
  LOGOUT: '/v1/auth/logout',
  REFRESH_TOKEN: '/v1/auth/refresh',
  TOKEN_INFO: '/v1/auth/token-info',
  
  // Transactions
  TRANSACTIONS: '/v1/transactions',
  TRANSACTION_DASHBOARD: '/v1/transactions/dashboard',
  
  // Categories
  CATEGORIES: '/v1/categories',
  CATEGORIES_BY_TYPE: '/v1/categories/type',
  ACTIVE_CATEGORIES: '/v1/categories/active',
  ROOT_CATEGORIES: '/v1/categories/root',
  CATEGORY_SEARCH: '/v1/categories/search',
  CATEGORY_STATS: '/v1/categories/with-stats',
  CREATE_DEFAULT_CATEGORIES: '/v1/categories/create-defaults',
  
  // Assets
  ASSETS: '/v1/assets',
  ASSET_TYPES: '/v1/assets/types',
  
  // Statistics
  FINANCIAL_OVERVIEW: '/v1/statistics/financial-overview',
  MONTHLY_ANALYSIS: '/v1/statistics/monthly-analysis',
  CATEGORY_ANALYSIS: '/v1/statistics/category-analysis',
  ASSET_ANALYSIS: '/v1/statistics/asset-analysis',
  PERIOD_COMPARISON: '/v1/statistics/period-comparison',
  
  // Users
  USER_PROFILE: '/v1/users/profile',
  
} as const;

export const getApiUrl = (endpoint: string) => `${API_BASE_URL}${endpoint}`;

export const API_CONFIG = {
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};