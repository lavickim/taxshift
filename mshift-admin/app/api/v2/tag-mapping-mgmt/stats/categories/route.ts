import { NextRequest, NextResponse } from 'next/server';

const JAVA_API_BASE_URL =
  process.env.JAVA_API_BASE_URL || 'http://localhost:8080/mshift-api';

export async function GET(request: NextRequest) {
  try {
    console.log(
      'GET /api/v2/tag-mapping-mgmt/stats/categories - 카테고리 통계 조회'
    );

    // Mock data for categories
    const mockCategories = [
      {
        category: '식료품',
        keywordGroups: 15,
        tagMappings: 45,
        accountMappings: 12,
        averageConfidence: 0.92,
        color: '#10b981',
      },
      {
        category: '교통비',
        keywordGroups: 8,
        tagMappings: 24,
        accountMappings: 6,
        averageConfidence: 0.88,
        color: '#3b82f6',
      },
      {
        category: '의료비',
        keywordGroups: 5,
        tagMappings: 15,
        accountMappings: 4,
        averageConfidence: 0.85,
        color: '#ef4444',
      },
      {
        category: '엔터테인먼트',
        keywordGroups: 12,
        tagMappings: 36,
        accountMappings: 8,
        averageConfidence: 0.78,
        color: '#8b5cf6',
      },
      {
        category: '쇼핑',
        keywordGroups: 20,
        tagMappings: 60,
        accountMappings: 15,
        averageConfidence: 0.81,
        color: '#f59e0b',
      },
    ];

    // Try to get data from Java backend if endpoint exists
    try {
      const response = await fetch(
        `${JAVA_API_BASE_URL}/v2/tag-mapping-mgmt/stats/categories`
      );
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    } catch (error) {
      console.log('Backend categories endpoint not available, using mock data');
    }

    return NextResponse.json(mockCategories);
  } catch (error) {
    console.error('카테고리 통계 조회 실패:', error);
    return NextResponse.json(
      { error: '카테고리 통계를 조회하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
