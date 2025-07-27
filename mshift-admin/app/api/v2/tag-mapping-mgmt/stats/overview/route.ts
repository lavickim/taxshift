import { NextRequest, NextResponse } from 'next/server';

const JAVA_API_BASE_URL =
  process.env.JAVA_API_BASE_URL || 'http://localhost:8080/mshift-api';

export async function GET(request: NextRequest) {
  try {
    console.log(
      'GET /api/v2/tag-mapping-mgmt/stats/overview - 시스템 개요 통계 조회'
    );

    // Mock data for now since backend might not have this specific endpoint
    const mockOverview = {
      totalKeywordGroups: 0,
      totalTags: 0,
      totalAccountMappings: 0,
      systemHealth: 'healthy',
      lastUpdateTime: new Date().toISOString(),
      activeServices: ['tag-mapping', 'keyword-analysis'],
      performanceMetrics: {
        averageResponseTime: 150,
        successRate: 98.5,
        totalRequests: 1250,
      },
    };

    // Try to get data from Java backend if endpoint exists
    try {
      const response = await fetch(
        `${JAVA_API_BASE_URL}/v2/tag-mapping-mgmt/stats/overview`
      );
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    } catch (error) {
      console.log('Backend overview endpoint not available, using mock data');
    }

    return NextResponse.json(mockOverview);
  } catch (error) {
    console.error('시스템 개요 통계 조회 실패:', error);
    return NextResponse.json(
      { error: '시스템 개요 통계를 조회하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
