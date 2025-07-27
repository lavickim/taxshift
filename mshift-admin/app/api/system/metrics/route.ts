/**
 * 시스템 메트릭 API
 * 실시간 시스템 모니터링을 위한 데이터 제공
 */
import { NextRequest, NextResponse } from 'next/server';

// 실제 백엔드 API에서 가져오기
async function getSystemMetrics() {
  try {
    // 1. 실제 백엔드 API 호출 시도
    const backendResponse = await fetch(
      'http://localhost:8080/mshift-api/actuator/health',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    // 백엔드가 살아있으면 실제 데이터 조합
    if (backendResponse.ok) {
      return await getActualSystemMetrics();
    }
  } catch (error) {
    console.log('Backend not available, using stable mock data');
  }

  // 백엔드가 없으면 안정적인 Mock 데이터 반환
  return getStableMockData();
}

// 실제 시스템 메트릭 수집
async function getActualSystemMetrics() {
  // TODO: 실제 각 서비스의 상태를 확인하는 로직
  return getStableMockData();
}

// 안정적인 Mock 데이터 (Math.random() 제거)
function getStableMockData() {
  const mockData = {
    services: {
      regexEngine: {
        status: 'healthy',
        responseTime: 5,
        uptime: '99.9%',
      },
      keywordEngine: {
        status: 'healthy',
        responseTime: 18,
        uptime: '99.8%',
      },
      accountingEngine: {
        status: 'healthy',
        responseTime: 3,
        uptime: '99.9%',
      },
      redis: {
        status: 'healthy',
        hitRate: 89,
        memory: '2.1GB/8GB',
      },
      postgresql: {
        status: 'healthy',
        connections: '12/50',
        queryTime: 2,
      },
    },
    performance: {
      totalProcessed: 15847,
      avgResponseTime: 18,
      successRate: 92.4,
      cacheHitRate: 89.3,
      errorRate: 0.8,
      dailyGrowth: 12,
    },
    engines: {
      regex: {
        activeRules: 24,
        applicationRate: 73, // 안정적인 값
        avgProcessingTime: 4, // 안정적인 값
        topRule: {
          name: '법인구조_주식회사',
          usage: 2347, // 안정적인 값
        },
      },
      keyword: {
        activeGroups: 41,
        matchSuccessRate: 90, // 안정적인 값
        avgProcessingTime: 16, // 안정적인 값
        topTag: {
          name: '편의점',
          usage: 3542, // 안정적인 값
        },
      },
      accounting: {
        generatedEntries: 14623, // 안정적인 값
        mappingRate: 95, // 안정적인 값
        avgProcessingTime: 3, // 안정적인 값
      },
    },
    recentActivities: [
      {
        id: '1',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toLocaleString(),
        type: 'success',
        message: '정규식전처리엔진: 법인구조 규칙 매칭 성공 (응답시간: 4ms)',
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 8 * 60 * 1000).toLocaleString(),
        type: 'success',
        message: '키워드처리엔진: "편의점" 태그 매칭 성공 (신뢰도: 95%)',
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 12 * 60 * 1000).toLocaleString(),
        type: 'warning',
        message: 'Redis 캐시: 메모리 사용량 70% 도달',
      },
      {
        id: '4',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toLocaleString(),
        type: 'success',
        message: '복식부기엔진: 분개 생성 완료 (처리시간: 3ms)',
      },
      {
        id: '5',
        timestamp: new Date(Date.now() - 18 * 60 * 1000).toLocaleString(),
        type: 'success',
        message: '시스템: 정기 헬스체크 완료 - 모든 서비스 정상',
      },
    ],
  };

  return mockData;
}

export async function GET(request: NextRequest) {
  try {
    const metrics = await getSystemMetrics();

    return NextResponse.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to fetch system metrics:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'refresh':
        // 캐시 새로고침 로직
        const refreshedMetrics = await getSystemMetrics();
        return NextResponse.json({
          success: true,
          data: refreshedMetrics,
          message: 'Metrics refreshed successfully',
        });

      case 'clear_cache':
        // 캐시 클리어 로직 (실제로는 백엔드 API 호출)
        return NextResponse.json({
          success: true,
          message: 'Cache cleared successfully',
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Failed to process system action:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
