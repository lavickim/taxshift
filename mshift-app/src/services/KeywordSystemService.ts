import { apiCall, API_CONFIG, classifyWithKeywordSystem } from '../config/api';

// 키워드 시스템 데이터 타입 정의
export interface ClassificationResult {
  success: boolean;
  text: string;
  amount: number;
  category: string;
  confidence: number;
  tags: string[];
  keywordGroups: KeywordGroup[];
  processingTime: number;
  source: string;
}

export interface KeywordGroup {
  id: number;
  name: string;
  patterns: string[];
  confidence: number;
  isActive: boolean;
}

export interface CacheStatus {
  isHealthy: boolean;
  totalEntries: number;
  hitRate: number;
  missRate: number;
  lastRefresh: string;
  uptime: number;
}

export interface SystemStats {
  totalTransactions: number;
  totalKeywordGroups: number;
  totalTagMappings: number;
  averageConfidence: number;
  classificationAccuracy: number;
  systemUptime: number;
}

class KeywordSystemService {
  private static instance: KeywordSystemService;

  private constructor() {}

  public static getInstance(): KeywordSystemService {
    if (!KeywordSystemService.instance) {
      KeywordSystemService.instance = new KeywordSystemService();
    }
    return KeywordSystemService.instance;
  }

  /**
   * 거래 텍스트 분류 (메인 기능)
   */
  public async classifyTransaction(text: string, amount?: number): Promise<ClassificationResult> {
    try {
      console.log(`Classifying transaction: "${text}" with amount: ${amount || 0}`);
      
      const response = await classifyWithKeywordSystem(text, amount);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Transaction classification successful:', data);
        return data;
      } else {
        console.error('Failed to classify transaction:', response.status, response.statusText);
        throw new Error(`Classification failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to classify transaction:', error);
      throw error;
    }
  }

  /**
   * 캐시 상태 조회
   */
  public async getCacheStatus(): Promise<CacheStatus> {
    try {
      console.log('Loading cache status...');
      
      const response = await apiCall(API_CONFIG.ENDPOINTS.KEYWORD_CACHE_STATUS);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Cache status loaded successfully:', data);
        return data;
      } else {
        console.error('Failed to load cache status:', response.status, response.statusText);
        throw new Error(`Cache status API call failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to load cache status:', error);
      throw error;
    }
  }

  /**
   * 시스템 통계 조회
   */
  public async getSystemStats(): Promise<SystemStats> {
    try {
      console.log('Loading system statistics...');
      
      const response = await apiCall(API_CONFIG.ENDPOINTS.KEYWORD_STATS);
      
      if (response.ok) {
        const data = await response.json();
        console.log('System statistics loaded successfully:', data);
        return data;
      } else {
        console.error('Failed to load system statistics:', response.status, response.statusText);
        throw new Error(`System stats API call failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to load system statistics:', error);
      throw error;
    }
  }

  /**
   * 키워드 그룹 목록 조회
   */
  public async getKeywordGroups(): Promise<KeywordGroup[]> {
    try {
      console.log('Loading keyword groups...');
      
      const response = await apiCall(API_CONFIG.ENDPOINTS.KEYWORD_GROUPS);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Keyword groups loaded successfully:', data);
        return data.keywordGroups || data;
      } else {
        console.error('Failed to load keyword groups:', response.status, response.statusText);
        throw new Error(`Keyword groups API call failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to load keyword groups:', error);
      throw error;
    }
  }

  /**
   * 캐시 새로고침
   */
  public async refreshCache(): Promise<any> {
    try {
      console.log('Refreshing keyword system cache...');
      
      const response = await apiCall(API_CONFIG.ENDPOINTS.KEYWORD_REFRESH_CACHE, {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Cache refreshed successfully:', data);
        return data;
      } else {
        console.error('Failed to refresh cache:', response.status, response.statusText);
        throw new Error(`Cache refresh failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to refresh cache:', error);
      throw error;
    }
  }

  /**
   * 태그 추천 (거래 텍스트 기반)
   */
  public async recommendTags(text: string, amount?: number): Promise<string[]> {
    try {
      console.log(`Getting tag recommendations for: "${text}"`);
      
      const payload = {
        text,
        amount: amount || 0,
        maxRecommendations: 5
      };
      
      const response = await apiCall(API_CONFIG.ENDPOINTS.TAG_RECOMMEND, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Tag recommendations loaded successfully:', data);
        return data.recommendedTags || data.tags || [];
      } else {
        console.error('Failed to get tag recommendations:', response.status, response.statusText);
        throw new Error(`Tag recommendation failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to get tag recommendations:', error);
      throw error;
    }
  }

  /**
   * 종합 시스템 상태 체크
   */
  public async checkSystemHealth(): Promise<{
    isHealthy: boolean;
    cacheStatus: CacheStatus;
    systemStats: SystemStats;
    keywordGroupsCount: number;
  }> {
    try {
      console.log('Performing comprehensive system health check...');
      
      // 병렬로 모든 상태 정보 조회
      const [cacheStatus, systemStats, keywordGroups] = await Promise.all([
        this.getCacheStatus().catch(() => null),
        this.getSystemStats().catch(() => null),
        this.getKeywordGroups().catch(() => [])
      ]);

      const isHealthy = cacheStatus?.isHealthy !== false && 
                       systemStats?.totalKeywordGroups > 0 && 
                       keywordGroups.length > 0;

      console.log('System health check completed:', {
        isHealthy,
        cacheHealthy: cacheStatus?.isHealthy,
        statsAvailable: !!systemStats,
        keywordGroupsCount: keywordGroups.length
      });
      
      return {
        isHealthy,
        cacheStatus: cacheStatus || {
          isHealthy: false,
          totalEntries: 0,
          hitRate: 0,
          missRate: 1,
          lastRefresh: 'unknown',
          uptime: 0
        },
        systemStats: systemStats || {
          totalTransactions: 0,
          totalKeywordGroups: 0,
          totalTagMappings: 0,
          averageConfidence: 0,
          classificationAccuracy: 0,
          systemUptime: 0
        },
        keywordGroupsCount: keywordGroups.length
      };
    } catch (error) {
      console.error('Failed to perform system health check:', error);
      throw error;
    }
  }
}

export default KeywordSystemService;