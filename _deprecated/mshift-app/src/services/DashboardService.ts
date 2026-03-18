import { apiCall, API_CONFIG, checkSystemHealth, checkCacheStatus } from '../config/api';

// Dashboard 데이터 타입 정의
export interface DashboardData {
  monthlyData: MonthlyData;
  notifications: NotificationItem[];
  recentTransactions: TransactionSummary[];
  statistics: Record<string, any>;
}

export interface MonthlyData {
  revenue: number;
  expense: number;
  profit: number;
  estimatedTax: number;
  revenueChange: number;
  expenseChange: number;
  period: string;
}

export interface NotificationItem {
  id: string;
  type: 'warning' | 'info' | 'success' | 'error';
  title: string;
  message: string;
  dueDate?: string;
  priority: 'high' | 'medium' | 'low';
  isRead: boolean;
  timestamp: string;
}

export interface TransactionSummary {
  id: number;
  merchant: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  transactionDate: string;
  status: 'approved' | 'pending' | 'rejected';
  confidence: number;
}

export interface NotificationsResponse {
  notifications: NotificationItem[];
  unreadCount: number;
}

export interface RecentTransactionsResponse {
  transactions: TransactionSummary[];
  totalCount: number;
  hasMore: boolean;
}

class DashboardService {
  private static instance: DashboardService;

  private constructor() {}

  public static getInstance(): DashboardService {
    if (!DashboardService.instance) {
      DashboardService.instance = new DashboardService();
    }
    return DashboardService.instance;
  }

  /**
   * 대시보드 요약 정보 조회
   */
  public async getDashboardSummary(): Promise<DashboardData> {
    try {
      console.log('Loading dashboard summary from API...');
      
      const response = await apiCall(API_CONFIG.ENDPOINTS.DASHBOARD_SUMMARY);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Dashboard summary loaded successfully:', data);
        return data;
      } else {
        console.error('Failed to load dashboard summary:', response.status, response.statusText);
        throw new Error(`Dashboard API call failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to load dashboard summary:', error);
      throw error;
    }
  }

  /**
   * 알림 목록 조회
   */
  public async getNotifications(): Promise<NotificationsResponse> {
    try {
      console.log('Loading notifications from API...');
      
      const response = await apiCall(API_CONFIG.ENDPOINTS.DASHBOARD_NOTIFICATIONS);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Notifications loaded successfully:', data);
        return data;
      } else {
        console.error('Failed to load notifications:', response.status, response.statusText);
        throw new Error(`Notifications API call failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
      throw error;
    }
  }

  /**
   * 최근 거래 목록 조회
   */
  public async getRecentTransactions(limit: number = 5): Promise<RecentTransactionsResponse> {
    try {
      console.log(`Loading recent transactions from API (limit: ${limit})...`);
      
      const endpoint = `${API_CONFIG.ENDPOINTS.DASHBOARD_RECENT_TRANSACTIONS}?limit=${limit}`;
      const response = await apiCall(endpoint);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Recent transactions loaded successfully:', data);
        return data;
      } else {
        console.error('Failed to load recent transactions:', response.status, response.statusText);
        throw new Error(`Recent transactions API call failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to load recent transactions:', error);
      throw error;
    }
  }

  /**
   * 대시보드 전체 데이터 새로고침
   */
  public async refreshDashboardData(): Promise<{
    summary: DashboardData;
    notifications: NotificationsResponse;
    recentTransactions: RecentTransactionsResponse;
  }> {
    try {
      console.log('Refreshing all dashboard data...');
      
      // 병렬로 모든 데이터 로드
      const [summary, notifications, recentTransactions] = await Promise.all([
        this.getDashboardSummary(),
        this.getNotifications(),
        this.getRecentTransactions(10)
      ]);

      console.log('All dashboard data refreshed successfully');
      
      return {
        summary,
        notifications,
        recentTransactions
      };
    } catch (error) {
      console.error('Failed to refresh dashboard data:', error);
      throw error;
    }
  }

  /**
   * 시스템 상태 체크 (대시보드 대신 사용 가능)
   */
  public async checkSystemStatus(): Promise<any> {
    try {
      console.log('Checking system status...');
      
      const response = await checkSystemHealth();
      
      if (response.ok) {
        const data = await response.json();
        console.log('System status check successful:', data);
        return data;
      } else {
        throw new Error(`System status check failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to check system status:', error);
      throw error;
    }
  }

  /**
   * 캐시 상태 체크
   */
  public async getCacheStatus(): Promise<any> {
    try {
      console.log('Checking cache status...');
      
      const response = await checkCacheStatus();
      
      if (response.ok) {
        const data = await response.json();
        console.log('Cache status check successful:', data);
        return data;
      } else {
        throw new Error(`Cache status check failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to check cache status:', error);
      throw error;
    }
  }
}

export default DashboardService;