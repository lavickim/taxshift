const API_BASE_URL = __DEV__ 
  ? 'http://localhost:8081' 
  : 'https://api.moneyshift.co.kr';

export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  LOGOUT: '/api/auth/logout',
  
  // Receipts
  RECEIPTS: '/api/receipts',
  RECEIPT_UPLOAD: '/api/receipts/upload',
  RECEIPT_OCR: '/api/receipts/ocr',
  
  // Transactions
  TRANSACTIONS: '/api/transactions',
  TRANSACTION_CATEGORIES: '/api/transactions/categories',
  
  // Users
  USER_PROFILE: '/api/users/profile',
  USER_PREFERENCES: '/api/users/preferences',
  
  // Analytics
  SPENDING_ANALYTICS: '/api/analytics/spending',
  CATEGORY_ANALYTICS: '/api/analytics/categories',
  
  // Export
  EXPORT_EXCEL: '/api/export/excel',
  EXPORT_CSV: '/api/export/csv',
} as const;

export const getApiUrl = (endpoint: string) => `${API_BASE_URL}${endpoint}`;

export const API_CONFIG = {
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};