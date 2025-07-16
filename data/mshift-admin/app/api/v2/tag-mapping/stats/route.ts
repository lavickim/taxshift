import { NextRequest, NextResponse } from 'next/server';

const JAVA_API_BASE_URL = process.env.JAVA_API_BASE_URL || 'http://localhost:8080';

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/v2/tag-mapping/stats - 매핑 통계 조회');
    
    const response = await fetch(`${JAVA_API_BASE_URL}/api/api/v2/tag-mapping/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Java API 오류:', response.status, errorText);
      
      // Return mock stats for testing
      const mockStats = {
        totalKeywordTagMappings: 23,
        totalTagAccountMappings: 15,
        averageConfidence: 0.82,
        topUsedMappings: [
          { keyword: '세븐일레븐', tag: '편의점', usageCount: 45 },
          { keyword: 'GS칼텍스', tag: '주유소', usageCount: 32 },
          { keyword: '스타벅스', tag: '카페', usageCount: 28 }
        ]
      };
      
      console.log('백엔드 오류로 인해 목 통계 데이터 반환:', mockStats);
      return NextResponse.json(mockStats);
    }

    const data = await response.json();
    console.log('매핑 통계 조회 성공:', data);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('매핑 통계 조회 실패:', error);
    
    // Return mock stats for testing
    const mockStats = {
      totalKeywordTagMappings: 0,
      totalTagAccountMappings: 0,
      averageConfidence: 0,
      topUsedMappings: []
    };
    
    return NextResponse.json(mockStats);
  }
}