import DashboardService, { DashboardData, NotificationsResponse, RecentTransactionsResponse } from '../DashboardService';

// Mock fetch for testing
global.fetch = jest.fn();

describe('DashboardService', () => {
  let dashboardService: DashboardService;

  beforeEach(() => {
    dashboardService = DashboardService.getInstance();
    jest.clearAllMocks();
  });

  describe('getDashboardSummary', () => {
    it('should return dashboard data on successful API call', async () => {
      const mockResponse: DashboardData = {
        monthlyData: {
          revenue: 125000000,
          expense: 98000000,
          profit: 27000000,
          estimatedTax: 5940000,
          revenueChange: 15.0,
          expenseChange: 5.0,
          period: '2025년 1월'
        },
        notifications: [
          {
            id: '1',
            type: 'warning',
            title: '검토 필요',
            message: '신규 거래 3건 검토 필요',
            priority: 'high',
            isRead: false,
            timestamp: '2025-07-22T10:00:00Z'
          }
        ],
        recentTransactions: [
          {
            id: 1,
            merchant: '스타벅스 강남점',
            amount: 5400,
            type: 'expense',
            category: '복리후생비',
            transactionDate: '2025-01-18',
            status: 'pending',
            confidence: 0.85
          }
        ],
        statistics: {
          totalTransactions: 156,
          pendingTransactions: 3,
          approvedTransactions: 153,
          classificationAccuracy: 0.92
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await dashboardService.getDashboardSummary();

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://192.168.45.219:8080/api/dashboard/summary',
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json'
          }
        })
      );
    });

    it('should throw error on failed API call', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      await expect(dashboardService.getDashboardSummary()).rejects.toThrow(
        'Dashboard API call failed with status: 500'
      );
    });

    it('should throw error on network failure', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(dashboardService.getDashboardSummary()).rejects.toThrow('Network error');
    });
  });

  describe('getNotifications', () => {
    it('should return notifications data', async () => {
      const mockResponse: NotificationsResponse = {
        notifications: [
          {
            id: '1',
            type: 'warning',
            title: '검토 필요',
            message: '신규 거래 3건 검토 필요',
            priority: 'high',
            isRead: false,
            timestamp: '2025-07-22T10:00:00Z'
          },
          {
            id: '2',
            type: 'info',
            title: '세금 신고',
            message: '부가세 신고 마감 D-5',
            priority: 'medium',
            isRead: false,
            timestamp: '2025-07-22T10:00:00Z'
          }
        ],
        unreadCount: 2
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await dashboardService.getNotifications();

      expect(result).toEqual(mockResponse);
      expect(result.unreadCount).toBe(2);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://192.168.45.219:8080/api/dashboard/notifications',
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json'
          }
        })
      );
    });
  });

  describe('getRecentTransactions', () => {
    it('should return recent transactions with default limit', async () => {
      const mockResponse: RecentTransactionsResponse = {
        transactions: [
          {
            id: 1,
            merchant: '스타벅스 강남점',
            amount: 5400,
            type: 'expense',
            category: '복리후생비',
            transactionDate: '2025-01-18',
            status: 'pending',
            confidence: 0.85
          }
        ],
        totalCount: 10,
        hasMore: true
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await dashboardService.getRecentTransactions();

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://192.168.45.219:8080/api/dashboard/recent-transactions?limit=5',
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json'
          }
        })
      );
    });

    it('should return recent transactions with custom limit', async () => {
      const mockResponse: RecentTransactionsResponse = {
        transactions: [],
        totalCount: 0,
        hasMore: false
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await dashboardService.getRecentTransactions(10);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://192.168.45.219:8080/api/dashboard/recent-transactions?limit=10',
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json'
          }
        })
      );
    });
  });

  describe('refreshDashboardData', () => {
    it('should call all API endpoints in parallel', async () => {
      const mockSummary: DashboardData = {
        monthlyData: {
          revenue: 125000000,
          expense: 98000000,
          profit: 27000000,
          estimatedTax: 5940000,
          revenueChange: 15.0,
          expenseChange: 5.0,
          period: '2025년 1월'
        },
        notifications: [],
        recentTransactions: [],
        statistics: {}
      };

      const mockNotifications: NotificationsResponse = {
        notifications: [],
        unreadCount: 0
      };

      const mockTransactions: RecentTransactionsResponse = {
        transactions: [],
        totalCount: 0,
        hasMore: false
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockSummary
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockNotifications
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTransactions
        });

      const result = await dashboardService.refreshDashboardData();

      expect(result).toEqual({
        summary: mockSummary,
        notifications: mockNotifications,
        recentTransactions: mockTransactions
      });

      // Verify all endpoints were called
      expect(global.fetch).toHaveBeenCalledTimes(3);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://192.168.45.219:8080/api/dashboard/summary',
        expect.any(Object)
      );
      expect(global.fetch).toHaveBeenCalledWith(
        'http://192.168.45.219:8080/api/dashboard/notifications',
        expect.any(Object)
      );
      expect(global.fetch).toHaveBeenCalledWith(
        'http://192.168.45.219:8080/api/dashboard/recent-transactions?limit=10',
        expect.any(Object)
      );
    });
  });

  describe('Singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = DashboardService.getInstance();
      const instance2 = DashboardService.getInstance();

      expect(instance1).toBe(instance2);
    });
  });
});