// API 설정 - 백엔드 현재 상태에 맞춤
export const API_CONFIG = {
  // 개발 환경 - 모든 IP에서 접근 가능
  BASE_URL: 'http://192.168.45.219:8080/mshift-api',
  
  // 대체 URL들 (필요시 수동 변경)
  // BASE_URL: 'http://localhost:8080/mshift-api',  // 로컬 개발
  // BASE_URL: 'http://10.0.0.1:8080/mshift-api',   // 다른 네트워크
  
  ENDPOINTS: {
    // 기존 룰 엔진 (현재 문제 있음)
    HEALTH: '/rule-engine/health',
    MATCH: '/rule-engine/match',
    RULES: '/rule-engine/rules',
    REFRESH_CACHE: '/rule-engine/refresh-cache',
    
    // 실제 동작하는 키워드 시스템 API
    KEYWORD_CLASSIFY: '/v2/keyword-system/classify',
    KEYWORD_REFRESH_CACHE: '/v2/tag-mapping/refresh-cache',
    KEYWORD_CACHE_STATUS: '/v2/tag-mapping/cache-status',
    KEYWORD_STATS: '/v2/tag-mapping/stats',
    
    // 거래 관련 API
    TRANSACTIONS_BANK_A: '/transactions/bank-a',
    TRANSACTIONS_HEALTH: '/transactions/health',
    TRANSACTIONS_CLASSIFY: '/transactions/classify',
    
    // 대시보드 API
    DASHBOARD_SUMMARY: '/dashboard/summary',
    DASHBOARD_NOTIFICATIONS: '/dashboard/notifications',
    DASHBOARD_RECENT_TRANSACTIONS: '/dashboard/recent-transactions',
    
    // 태그 관리 API
    TAG_MAPPINGS: '/v2/tag-mapping/mappings',
    TAG_ACCOUNT_MAPPINGS: '/v2/tag-mapping/tag-account-mappings',
    TAG_RECOMMEND: '/v2/tag-mapping/recommend-tags',
    
    // 키워드 그룹 관리
    KEYWORD_GROUPS: '/v2/tag-mapping/keyword-groups',
    
    // 테스트 및 검증 API
    TEST_VALIDATION: '/api/v2/test',
    INTEGRATED_TEST: '/v2/test',
    
    // 시스템 상태 체크
    ACTUATOR_HEALTH: '/actuator/health',
    ACTUATOR_MAPPINGS: '/actuator/mappings',
  }
};

// API 호출 헬퍼 함수
export const apiCall = async (endpoint: string, options?: RequestInit) => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    
    return response;
  } catch (error) {
    console.error(`API call failed: ${url}`, error);
    throw error;
  }
};

// 키워드 시스템 API 호출 (메인 분류 시스템)
export const classifyWithKeywordSystem = async (text: string, amount?: number) => {
  const payload = {
    text,
    amount: amount || 0,
    context: 'mobile-app'
  };
  
  return await apiCall(API_CONFIG.ENDPOINTS.KEYWORD_CLASSIFY, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
};

// 대시보드 데이터 조회
export const fetchDashboardData = async () => {
  return await apiCall(API_CONFIG.ENDPOINTS.DASHBOARD_SUMMARY);
};

// 캐시 상태 체크
export const checkCacheStatus = async () => {
  return await apiCall(API_CONFIG.ENDPOINTS.KEYWORD_CACHE_STATUS);
};

// 시스템 상태 체크
export const checkSystemHealth = async () => {
  try {
    // 먼저 actuator health 체크
    const health = await apiCall(API_CONFIG.ENDPOINTS.ACTUATOR_HEALTH);
    if (health.ok) {
      return health;
    }
    
    // 실패시 키워드 시스템 캐시 상태로 대체
    return await checkCacheStatus();
  } catch (error) {
    console.error('System health check failed:', error);
    throw error;
  }
};