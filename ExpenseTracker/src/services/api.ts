// 플랫폼별 스토리지 유틸리티
const getStorage = () => {
  if (typeof window !== 'undefined') {
    // 웹 환경
    return {
      getItem: (key: string) => Promise.resolve(localStorage.getItem(key)),
      setItem: (key: string, value: string) => Promise.resolve(localStorage.setItem(key, value)),
      removeItem: (key: string) => Promise.resolve(localStorage.removeItem(key)),
    };
  } else {
    // React Native 환경 - 동적 임포트 시뮬레이션
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      return AsyncStorage;
    } catch (e) {
      // Fallback
      return {
        getItem: () => Promise.resolve(null),
        setItem: () => Promise.resolve(),
        removeItem: () => Promise.resolve(),
      };
    }
  }
};

const AsyncStorage = getStorage();
import { API_ENDPOINTS, getApiUrl, API_CONFIG } from '../config/api';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  Transaction,
  Category,
  Asset,
  DashboardData,
  FinancialOverview,
  MonthlyAnalysis,
} from '../types';

class ApiService {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseURL = getApiUrl('');
    this.defaultHeaders = API_CONFIG.headers;
  }

  // JWT 토큰 관리
  async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('accessToken');
    } catch (error) {
      console.error('토큰 조회 실패:', error);
      return null;
    }
  }

  async setAuthToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('accessToken', token);
    } catch (error) {
      console.error('토큰 저장 실패:', error);
    }
  }

  async removeAuthToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
    } catch (error) {
      console.error('토큰 삭제 실패:', error);
    }
  }

  // HTTP 요청 헬퍼 메서드
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = await this.getAuthToken();

    const headers = {
      ...this.defaultHeaders,
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const config: RequestInit = {
      ...options,
      headers,
      timeout: API_CONFIG.timeout,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          // 토큰 만료 시 자동 로그아웃
          await this.removeAuthToken();
          throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API 요청 실패 [${endpoint}]:`, error);
      throw error;
    }
  }

  // 인증 API
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.accessToken) {
      await this.setAuthToken(response.accessToken);
      await AsyncStorage.setItem('refreshToken', response.refreshToken);
    }

    return response;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>(API_ENDPOINTS.REGISTER, {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && response.accessToken) {
      await this.setAuthToken(response.accessToken);
      await AsyncStorage.setItem('refreshToken', response.refreshToken);
    }

    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.request(API_ENDPOINTS.LOGOUT, {
        method: 'POST',
      });
    } catch (error) {
      console.warn('로그아웃 API 호출 실패:', error);
    } finally {
      await this.removeAuthToken();
    }
  }

  // 거래내역 API
  async getTransactions(): Promise<Transaction[]> {
    return this.request<Transaction[]>(API_ENDPOINTS.TRANSACTIONS);
  }

  async getTransactionById(id: number): Promise<Transaction> {
    return this.request<Transaction>(`${API_ENDPOINTS.TRANSACTIONS}/${id}`);
  }

  async createTransaction(transaction: Partial<Transaction>): Promise<Transaction> {
    return this.request<Transaction>(API_ENDPOINTS.TRANSACTIONS, {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
  }

  async updateTransaction(id: number, transaction: Partial<Transaction>): Promise<Transaction> {
    return this.request<Transaction>(`${API_ENDPOINTS.TRANSACTIONS}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transaction),
    });
  }

  async deleteTransaction(id: number): Promise<void> {
    return this.request<void>(`${API_ENDPOINTS.TRANSACTIONS}/${id}`, {
      method: 'DELETE',
    });
  }

  async getDashboardData(): Promise<DashboardData> {
    return this.request<DashboardData>(API_ENDPOINTS.TRANSACTION_DASHBOARD);
  }

  // 카테고리 API
  async getCategories(): Promise<Category[]> {
    return this.request<Category[]>(API_ENDPOINTS.CATEGORIES);
  }

  async getCategoriesByType(type: 'INCOME' | 'EXPENSE'): Promise<Category[]> {
    return this.request<Category[]>(`${API_ENDPOINTS.CATEGORIES_BY_TYPE}/${type}`);
  }

  async getActiveCategories(): Promise<Category[]> {
    return this.request<Category[]>(API_ENDPOINTS.ACTIVE_CATEGORIES);
  }

  async createCategory(category: Partial<Category>): Promise<Category> {
    return this.request<Category>(API_ENDPOINTS.CATEGORIES, {
      method: 'POST',
      body: JSON.stringify(category),
    });
  }

  async updateCategory(id: number, category: Partial<Category>): Promise<Category> {
    return this.request<Category>(`${API_ENDPOINTS.CATEGORIES}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(category),
    });
  }

  async deleteCategory(id: number): Promise<void> {
    return this.request<void>(`${API_ENDPOINTS.CATEGORIES}/${id}`, {
      method: 'DELETE',
    });
  }

  // 자산 API
  async getAssets(): Promise<Asset[]> {
    return this.request<Asset[]>(API_ENDPOINTS.ASSETS);
  }

  async createAsset(asset: Partial<Asset>): Promise<Asset> {
    return this.request<Asset>(API_ENDPOINTS.ASSETS, {
      method: 'POST',
      body: JSON.stringify(asset),
    });
  }

  async updateAsset(id: number, asset: Partial<Asset>): Promise<Asset> {
    return this.request<Asset>(`${API_ENDPOINTS.ASSETS}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(asset),
    });
  }

  // 통계 API
  async getFinancialOverview(): Promise<FinancialOverview> {
    return this.request<FinancialOverview>(API_ENDPOINTS.FINANCIAL_OVERVIEW);
  }

  async getMonthlyAnalysis(months: number = 12): Promise<MonthlyAnalysis> {
    return this.request<MonthlyAnalysis>(`${API_ENDPOINTS.MONTHLY_ANALYSIS}?months=${months}`);
  }

  // 사용자 API
  async getUserProfile(): Promise<User> {
    return this.request<User>(API_ENDPOINTS.USER_PROFILE);
  }

  async updateUserProfile(user: Partial<User>): Promise<User> {
    return this.request<User>(API_ENDPOINTS.USER_PROFILE, {
      method: 'PUT',
      body: JSON.stringify(user),
    });
  }
}

export const apiService = new ApiService();
export default apiService;