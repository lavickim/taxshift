import { NextRequest, NextResponse } from 'next/server';

const JAVA_API_BASE_URL =
  process.env.JAVA_API_BASE_URL || 'http://localhost:8080/mshift-api';

interface EndpointTest {
  name: string;
  method: 'GET' | 'POST';
  path: string;
  expectedStatus?: number;
  testData?: any;
  critical: boolean;
}

// 핵심 엔드포인트들 정의
const CRITICAL_ENDPOINTS: EndpointTest[] = [
  {
    name: 'Health Check',
    method: 'GET',
    path: '/actuator/health',
    expectedStatus: 200,
    critical: true,
  },
  {
    name: 'Keyword System Classify',
    method: 'POST',
    path: '/v2/keyword-system/classify',
    expectedStatus: 200,
    testData: { description: '테스트 거래', amount: 10000 },
    critical: true,
  },
  {
    name: 'Keyword Groups',
    method: 'GET',
    path: '/v2/tag-mapping/keyword-groups',
    expectedStatus: 200,
    critical: true,
  },
  {
    name: 'Tag Mapping Stats',
    method: 'GET',
    path: '/v2/tag-mapping/stats',
    expectedStatus: 200,
    critical: true,
  },
  {
    name: 'Tag Mapping Management Stats',
    method: 'GET',
    path: '/v2/tag-mapping-mgmt/stats',
    expectedStatus: 200,
    critical: false,
  },
  {
    name: 'Tag Mapping Management Groups',
    method: 'GET',
    path: '/v2/tag-mapping-mgmt/keyword-groups',
    expectedStatus: 200,
    critical: false,
  },
];

interface EndpointResult {
  name: string;
  path: string;
  method: string;
  status: number;
  responseTime: number;
  healthy: boolean;
  critical: boolean;
  error?: string;
}

export async function GET(request: NextRequest) {
  const results: EndpointResult[] = [];
  let overallHealth = true;
  let criticalFailures = 0;

  console.log('🔍 Starting endpoint health check...');

  for (const endpoint of CRITICAL_ENDPOINTS) {
    const startTime = Date.now();

    try {
      const url = `${JAVA_API_BASE_URL}${endpoint.path}`;
      const response = await fetch(url, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: endpoint.testData ? JSON.stringify(endpoint.testData) : undefined,
      });

      const responseTime = Date.now() - startTime;
      const healthy = response.status === (endpoint.expectedStatus || 200);

      if (!healthy && endpoint.critical) {
        criticalFailures++;
        overallHealth = false;
      }

      results.push({
        name: endpoint.name,
        path: endpoint.path,
        method: endpoint.method,
        status: response.status,
        responseTime,
        healthy,
        critical: endpoint.critical,
      });

      console.log(
        `${healthy ? '✅' : '❌'} ${endpoint.name}: ${response.status} (${responseTime}ms)`
      );
    } catch (error) {
      const responseTime = Date.now() - startTime;

      if (endpoint.critical) {
        criticalFailures++;
        overallHealth = false;
      }

      results.push({
        name: endpoint.name,
        path: endpoint.path,
        method: endpoint.method,
        status: 0,
        responseTime,
        healthy: false,
        critical: endpoint.critical,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      console.error(`❌ ${endpoint.name}: ${error}`);
    }
  }

  const healthSummary = {
    overallHealth,
    criticalFailures,
    totalEndpoints: CRITICAL_ENDPOINTS.length,
    healthyEndpoints: results.filter(r => r.healthy).length,
    timestamp: new Date().toISOString(),
    results,
  };

  console.log(
    `🏥 Health check complete: ${healthSummary.healthyEndpoints}/${healthSummary.totalEndpoints} healthy`
  );

  return NextResponse.json(healthSummary, {
    status: overallHealth ? 200 : 503,
  });
}
