import { NextRequest, NextResponse } from 'next/server';

const JAVA_API_BASE_URL = process.env.JAVA_API_BASE_URL || 'http://localhost:8080';
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = process.env.REDIS_PORT || '6379';

export async function GET(request: NextRequest) {
  try {
    console.log('시스템 헬스 체크 시작');
    
    const healthCheck = {
      timestamp: new Date().toISOString(),
      overall: 'unknown',
      services: {
        frontend: { status: 'healthy', details: 'NextJS 프론트엔드 정상 동작' },
        backend: { status: 'unknown', details: '' },
        database: { status: 'unknown', details: '' },
        redis: { status: 'unknown', details: '' },
        keywordEngine: { status: 'unknown', details: '' }
      },
      endpoints: {},
      performance: {}
    };

    // 1. Backend API 체크
    const backendHealth = await checkBackendHealth();
    healthCheck.services.backend = backendHealth;

    // 2. 주요 API 엔드포인트 체크
    const endpointChecks = await checkCriticalEndpoints();
    healthCheck.endpoints = endpointChecks;

    // 3. 키워드 엔진 체크
    const keywordEngineCheck = await checkKeywordEngine();
    healthCheck.services.keywordEngine = keywordEngineCheck;

    // 4. 성능 지표 수집
    const performanceMetrics = await collectPerformanceMetrics();
    healthCheck.performance = performanceMetrics;

    // 5. 전체 상태 평가
    healthCheck.overall = evaluateOverallHealth(healthCheck.services);

    console.log('시스템 헬스 체크 완료:', healthCheck.overall);
    return NextResponse.json(healthCheck);
    
  } catch (error) {
    console.error('시스템 헬스 체크 실패:', error);
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      overall: 'unhealthy',
      error: '헬스 체크 실행 중 오류가 발생했습니다.',
      details: error.message
    }, { status: 500 });
  }
}

async function checkBackendHealth() {
  try {
    const startTime = Date.now();
    const response = await fetch(`${JAVA_API_BASE_URL}/actuator/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000) // 5초 타임아웃
    });
    
    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      const data = await response.json();
      return {
        status: 'healthy',
        details: 'Spring Boot 백엔드 API 정상 동작',
        responseTime,
        version: data.version || 'unknown'
      };
    } else {
      return {
        status: 'unhealthy',
        details: `백엔드 API 응답 오류: ${response.status}`,
        responseTime
      };
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      details: `백엔드 API 연결 실패: ${error.message}`,
      responseTime: 0
    };
  }
}

async function checkCriticalEndpoints() {
  const endpoints = [
    { name: 'keyword-groups', url: '/api/v2/tag-mapping/keyword-groups' },
    { name: 'tag-stats', url: '/api/v2/tag-mapping/stats' },
    { name: 'recommend-tags', url: '/api/v2/tag-mapping/recommend-tags', method: 'POST' }
  ];

  const results = {};

  for (const endpoint of endpoints) {
    try {
      const startTime = Date.now();
      
      let response;
      if (endpoint.method === 'POST') {
        response = await fetch(`${process.env.NEXTAUTH_URL}${endpoint.url}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            keyword: '테스트',
            transactionText: '테스트 거래',
            amount: 1000
          }),
          signal: AbortSignal.timeout(3000)
        });
      } else {
        response = await fetch(`${process.env.NEXTAUTH_URL}${endpoint.url}`, {
          method: 'GET',
          signal: AbortSignal.timeout(3000)
        });
      }
      
      const responseTime = Date.now() - startTime;
      
      results[endpoint.name] = {
        status: response.ok ? 'healthy' : 'unhealthy',
        responseTime,
        statusCode: response.status
      };
    } catch (error) {
      results[endpoint.name] = {
        status: 'unhealthy',
        error: error.message,
        responseTime: 0
      };
    }
  }

  return results;
}

async function checkKeywordEngine() {
  try {
    const testCases = [
      { input: '세븐일레븐에서 커피 구매', expected: '편의점' },
      { input: 'GS칼텍스 주유소 휘발유', expected: '주유소' }
    ];

    const startTime = Date.now();
    let successCount = 0;

    for (const testCase of testCases) {
      try {
        const response = await fetch(`${process.env.NEXTAUTH_URL}/api/v2/tag-mapping/recommend-tags`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            keyword: testCase.input,
            transactionText: testCase.input,
            amount: 5000
          }),
          signal: AbortSignal.timeout(2000)
        });

        if (response.ok) {
          const recommendations = await response.json();
          if (recommendations.length > 0) {
            successCount++;
          }
        }
      } catch (error) {
        console.warn(`키워드 엔진 테스트 케이스 실패: ${testCase.input}`, error.message);
      }
    }

    const processingTime = Date.now() - startTime;
    const successRate = successCount / testCases.length;

    return {
      status: successRate >= 0.5 ? 'healthy' : 'degraded',
      details: `키워드 추출 엔진 성공률: ${Math.round(successRate * 100)}%`,
      successRate,
      processingTime,
      testCases: testCases.length
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      details: `키워드 엔진 체크 실패: ${error.message}`,
      successRate: 0
    };
  }
}

async function collectPerformanceMetrics() {
  const metrics = {
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime(),
    nodeVersion: process.version,
    platform: process.platform
  };

  // 추가 성능 지표 (가능한 경우)
  try {
    metrics.cpuUsage = process.cpuUsage();
  } catch (error) {
    console.warn('CPU 사용량 수집 실패:', error.message);
  }

  return metrics;
}

function evaluateOverallHealth(services) {
  const statuses = Object.values(services).map(service => service.status);
  
  if (statuses.every(status => status === 'healthy')) {
    return 'healthy';
  } else if (statuses.some(status => status === 'healthy')) {
    return 'degraded';
  } else {
    return 'unhealthy';
  }
}