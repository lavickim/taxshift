import { NextRequest, NextResponse } from 'next/server';

const JAVA_API_BASE_URL =
  process.env.JAVA_API_BASE_URL || 'http://localhost:8080/mshift-api';

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/v2/tag-mapping-mgmt/stats/tags - 태그 통계 조회');

    // Mock data for tags
    const mockTags = [
      {
        tagName: '마트',
        tagCategory: '식료품',
        keywordMappings: 8,
        accountMappings: 3,
        usageCount: 150,
        averageConfidence: 0.94,
        isActive: true,
      },
      {
        tagName: '주유소',
        tagCategory: '교통비',
        keywordMappings: 5,
        accountMappings: 2,
        usageCount: 89,
        averageConfidence: 0.92,
        isActive: true,
      },
      {
        tagName: '카페',
        tagCategory: '음료',
        keywordMappings: 12,
        accountMappings: 4,
        usageCount: 234,
        averageConfidence: 0.87,
        isActive: true,
      },
      {
        tagName: '병원',
        tagCategory: '의료비',
        keywordMappings: 6,
        accountMappings: 2,
        usageCount: 45,
        averageConfidence: 0.89,
        isActive: true,
      },
      {
        tagName: '온라인쇼핑',
        tagCategory: '쇼핑',
        keywordMappings: 15,
        accountMappings: 5,
        usageCount: 312,
        averageConfidence: 0.81,
        isActive: true,
      },
      {
        tagName: '영화관',
        tagCategory: '엔터테인먼트',
        keywordMappings: 4,
        accountMappings: 2,
        usageCount: 67,
        averageConfidence: 0.85,
        isActive: true,
      },
      {
        tagName: '택시',
        tagCategory: '교통비',
        keywordMappings: 3,
        accountMappings: 1,
        usageCount: 78,
        averageConfidence: 0.91,
        isActive: true,
      },
      {
        tagName: '편의점',
        tagCategory: '식료품',
        keywordMappings: 7,
        accountMappings: 2,
        usageCount: 189,
        averageConfidence: 0.88,
        isActive: true,
      },
    ];

    // Try to get data from Java backend if endpoint exists
    try {
      const response = await fetch(
        `${JAVA_API_BASE_URL}/v2/tag-mapping-mgmt/stats/tags`
      );
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    } catch (error) {
      console.log('Backend tags endpoint not available, using mock data');
    }

    return NextResponse.json(mockTags);
  } catch (error) {
    console.error('태그 통계 조회 실패:', error);
    return NextResponse.json(
      { error: '태그 통계를 조회하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
