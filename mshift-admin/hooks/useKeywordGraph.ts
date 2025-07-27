import { useState, useEffect, useCallback } from 'react';

// 타입 정의
interface GraphNode {
  id: string;
  category: string;
  frequency: number;
  confidence: number;
  size: number;
  color: string;
  memberCount?: number;
  industryCount?: number;
  relatedIndustries?: string[];
}

interface GraphLink {
  source: string;
  target: string;
  strength: number;
  confidence: number;
  type: string;
  thickness: number;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
  config?: {
    width: number;
    height: number;
    forceStrength: number;
    linkDistance: number;
    centerForce: number;
  };
}

interface KeywordGraphResponse {
  keywords: any[];
  relationships: any[];
  graphData: GraphData;
  statistics: Record<string, any>;
  metadata: Record<string, any>;
  performanceMetrics?: Record<string, number>;
}

interface UseKeywordGraphOptions {
  autoLoad?: boolean;
  minMemberCount?: number;
  maxIndustries?: number;
  refreshInterval?: number;
}

interface UseKeywordGraphReturn {
  data: KeywordGraphResponse | null;
  graphData: GraphData | null;
  loading: boolean;
  error: string | null;
  loadGraph: (options?: { minMemberCount?: number; maxIndustries?: number; force?: boolean }) => Promise<void>;
  loadPreview: () => Promise<void>;
  loadCached: () => Promise<void>;
  refreshGraph: () => Promise<void>;
  retryLoad: () => Promise<void>;
}

/**
 * 키워드 그래프 데이터 관리 커스텀 훅
 * - 50만건 국민연금 데이터 처리 최적화
 * - 성능 모니터링 및 에러 처리
 * - 캐싱 및 미리보기 지원
 */
/**
 * Mock 키워드 그래프 데이터 생성
 */
function createMockKeywordGraphData(): KeywordGraphResponse {
  const mockNodes: GraphNode[] = [
    { id: 'restaurant', category: '음식점', frequency: 120, confidence: 0.9, size: 20, color: '#FF6B6B', memberCount: 12500, industryCount: 85 },
    { id: 'cafe', category: '카페', frequency: 95, confidence: 0.85, size: 18, color: '#4ECDC4', memberCount: 9800, industryCount: 62 },
    { id: 'convenience', category: '편의점', frequency: 88, confidence: 0.8, size: 16, color: '#45B7D1', memberCount: 8200, industryCount: 45 },
    { id: 'gas_station', category: '주유소', frequency: 75, confidence: 0.82, size: 15, color: '#FFA07A', memberCount: 7500, industryCount: 38 },
    { id: 'retail', category: '소매업', frequency: 65, confidence: 0.78, size: 14, color: '#98D8C8', memberCount: 6800, industryCount: 52 },
    { id: 'delivery', category: '배달업', frequency: 58, confidence: 0.75, size: 12, color: '#F7DC6F', memberCount: 5200, industryCount: 28 }
  ];

  const mockLinks: GraphLink[] = [
    { source: 'restaurant', target: 'delivery', strength: 0.8, confidence: 0.85, type: 'strong', thickness: 4 },
    { source: 'cafe', target: 'restaurant', strength: 0.6, confidence: 0.7, type: 'medium', thickness: 3 },
    { source: 'convenience', target: 'gas_station', strength: 0.7, confidence: 0.75, type: 'medium', thickness: 3 },
    { source: 'retail', target: 'convenience', strength: 0.5, confidence: 0.65, type: 'weak', thickness: 2 },
    { source: 'delivery', target: 'cafe', strength: 0.4, confidence: 0.6, type: 'weak', thickness: 2 }
  ];

  const mockGraphData: GraphData = {
    nodes: mockNodes,
    links: mockLinks,
    config: {
      width: 1200,
      height: 700,
      forceStrength: -300,
      linkDistance: 80,
      centerForce: 0.1
    }
  };

  return {
    keywords: mockNodes.map(node => ({ id: node.id, keyword: node.id, category: node.category })),
    relationships: mockLinks.map(link => ({ source: link.source, target: link.target, strength: link.strength })),
    graphData: mockGraphData,
    statistics: {
      totalKeywords: mockNodes.length,
      totalRelationships: mockLinks.length,
      totalMembers: mockNodes.reduce((sum, node) => sum + (node.memberCount || 0), 0),
      totalIndustries: mockNodes.reduce((sum, node) => sum + (node.industryCount || 0), 0),
      topKeywords: mockNodes.slice(0, 5).map(node => ({
        keyword: node.id,
        category: node.category,
        memberCount: node.memberCount
      }))
    },
    metadata: {
      cached: true,
      mock: true,
      note: '백엔드 서버 연결 실패로 인한 Mock 데이터',
      optimized: true,
      generatedAt: new Date().toISOString()
    },
    performanceMetrics: {
      total_processing_ms: 150,
      data_fetch_ms: 50,
      graph_generation_ms: 100
    }
  };
}

export function useKeywordGraph(options: UseKeywordGraphOptions = {}): UseKeywordGraphReturn {
  const {
    autoLoad = false,
    minMemberCount = 100,
    maxIndustries = 150,
    refreshInterval
  } = options;

  const [data, setData] = useState<KeywordGraphResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastLoadOptions, setLastLoadOptions] = useState<any>(null);

  // 그래프 데이터 추출
  const graphData = data?.graphData || null;

  // API 기본 URL
  const API_BASE = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:8080/mshift-api' 
    : '';

  /**
   * 최적화된 키워드 그래프 로드
   */
  const loadGraph = useCallback(async (loadOptions: { 
    minMemberCount?: number; 
    maxIndustries?: number; 
    force?: boolean 
  } = {}) => {
    setLoading(true);
    setError(null);

    try {
      const requestBody = {
        minMemberCount: loadOptions.minMemberCount || minMemberCount,
        maxIndustries: loadOptions.maxIndustries || maxIndustries
      };

      setLastLoadOptions(requestBody);

      const endpoint = loadOptions.force 
        ? '/v2/optimized-keyword-graph/refresh'
        : '/v2/optimized-keyword-graph/generate';

      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success && result.error) {
        throw new Error(result.error);
      }

      setData(result);
      
      // 성능 메트릭 로깅
      if (result.performanceMetrics) {
        console.log('키워드 그래프 성능 메트릭:', result.performanceMetrics);
      }

    } catch (err) {
      // 백엔드가 시작되지 않은 경우 처리
      if (err instanceof Error && (err.message.includes('Failed to fetch') || err.message.includes('Connection refused'))) {
        console.warn('백엔드 서버에 연결할 수 없습니다. 실제 54만건 데이터 처리를 위해 서버 시작을 기다리는 중...');
        setError('🚀 54만건 국민연금 데이터 처리를 위해 백엔드 서버가 시작 중입니다. 잠시 후 다시 시도해주세요.');
        
        // 15초 후 자동 재시도 (대용량 데이터 처리 고려)
        setTimeout(() => {
          if (!loading) {
            console.log('실제 데이터 처리를 위한 백엔드 서버 재연결 시도...');
            loadGraph(lastLoadOptions || {});
          }
        }, 15000);
      } else {
        const errorMessage = err instanceof Error ? err.message : '키워드 그래프 로드 중 오류가 발생했습니다.';
        setError(`실제 데이터 처리 중 오류: ${errorMessage}`);
        console.error('키워드 그래프 로드 실패:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [minMemberCount, maxIndustries, API_BASE]);

  /**
   * 미리보기 그래프 로드 (빠른 응답)
   */
  const loadPreview = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/v2/optimized-keyword-graph/preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '미리보기 로드 중 오류가 발생했습니다.';
      setError(errorMessage);
      console.error('미리보기 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  /**
   * 캐시된 그래프 로드 (즉시 응답)
   */
  const loadCached = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/v2/optimized-keyword-graph/cached?maxKeywords=100&maxRelationships=200`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);

    } catch (err) {
      // 백엔드가 시작되지 않은 경우 처리
      if (err instanceof Error && (err.message.includes('Failed to fetch') || err.message.includes('Connection refused'))) {
        console.warn('백엔드 서버에 연결할 수 없습니다. 서버 시작을 기다리는 중...');
        setError('백엔드 서버가 시작 중입니다. 잠시 후 다시 시도해주세요.');
        
        // 10초 후 자동 재시도
        setTimeout(() => {
          if (!loading) {
            console.log('백엔드 서버 재연결 시도...');
            loadCached();
          }
        }, 10000);
      } else {
        const errorMessage = err instanceof Error ? err.message : '캐시된 데이터 로드 중 오류가 발생했습니다.';
        setError(`백엔드 서버 연결 실패: ${errorMessage}`);
        console.error('캐시된 데이터 로드 실패:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  /**
   * 그래프 새로고침 (전체 재생성)
   */
  const refreshGraph = useCallback(async () => {
    if (lastLoadOptions) {
      await loadGraph({ ...lastLoadOptions, force: true });
    } else {
      await loadGraph({ force: true });
    }
  }, [loadGraph, lastLoadOptions]);

  /**
   * 재시도
   */
  const retryLoad = useCallback(async () => {
    if (lastLoadOptions) {
      await loadGraph(lastLoadOptions);
    } else {
      await loadGraph();
    }
  }, [loadGraph, lastLoadOptions]);

  // 자동 로드
  useEffect(() => {
    if (autoLoad) {
      loadCached(); // 먼저 캐시된 데이터 로드
    }
  }, [autoLoad, loadCached]);

  // 자동 새로고침
  useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      const interval = setInterval(() => {
        if (!loading) {
          loadGraph();
        }
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [refreshInterval, loading, loadGraph]);

  // 건강 상태 체크
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch(`${API_BASE}/v2/optimized-keyword-graph/health`);
        if (!response.ok) {
          console.warn('키워드 그래프 서비스 건강 상태 확인 실패');
        }
      } catch (err) {
        console.warn('키워드 그래프 서비스 접근 불가:', err);
      }
    };

    checkHealth();
  }, [API_BASE]);

  return {
    data,
    graphData,
    loading,
    error,
    loadGraph,
    loadPreview,
    loadCached,
    refreshGraph,
    retryLoad,
  };
}

/**
 * 성능 통계 조회 훅
 */
export function useKeywordGraphPerformance() {
  const [stats, setStats] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(false);

  const API_BASE = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:8080/mshift-api' 
    : '';

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/v2/optimized-keyword-graph/performance-stats`);
      if (response.ok) {
        const result = await response.json();
        setStats(result);
      }
    } catch (err) {
      // 백엔드가 시작되지 않은 경우 Mock 성능 데이터 제공
      if (err instanceof Error && (err.message.includes('Failed to fetch') || err.message.includes('Connection refused'))) {
        console.warn('백엔드 서버에 연결할 수 없습니다. Mock 성능 데이터를 사용합니다.');
        setStats({
          totalMemory: 1073741824, // 1GB
          freeMemory: 536870912,   // 512MB
          usedMemory: 536870912,   // 512MB
          availableProcessors: 8,
          mock: true,
          note: '백엔드 서버 연결 실패로 인한 Mock 데이터'
        });
      } else {
        console.error('성능 통계 로드 실패:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return { stats, loading, reload: loadStats };
}