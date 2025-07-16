import { NextRequest, NextResponse } from 'next/server';

const JAVA_API_BASE_URL = process.env.JAVA_API_BASE_URL || 'http://localhost:8080';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('POST /api/v2/tag-mapping-mgmt/recommend-tags - 태그 추천 요청:', body);

    // 요청 데이터 검증
    const { keyword, transactionText, amount, timestamp } = body;
    
    if (!keyword && !transactionText) {
      return NextResponse.json(
        { error: '키워드 또는 거래 텍스트는 필수입니다.' },
        { status: 400 }
      );
    }

    const response = await fetch(`${JAVA_API_BASE_URL}/api/v2/tag-mapping-mgmt/recommend-tags`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        keyword: keyword || '',
        transactionText: transactionText || keyword,
        amount: amount || 0,
        timestamp: timestamp || new Date().toISOString()
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Java API 오류:', response.status, errorText);
      
      // If backend is not available, return mock data for testing
      if (response.status >= 500) {
        const mockRecommendations = generateMockRecommendations(keyword || transactionText);
        console.log('백엔드 서버 오류로 인해 목 데이터 반환:', mockRecommendations);
        return NextResponse.json(mockRecommendations);
      }
      
      return NextResponse.json(
        { error: `백엔드 API 오류: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('태그 추천 성공:', data);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('태그 추천 실패:', error);
    
    // Return mock data for testing purposes
    const mockRecommendations = generateMockRecommendations(
      (await request.json()).keyword || (await request.json()).transactionText
    );
    console.log('오류로 인해 목 데이터 반환:', mockRecommendations);
    
    return NextResponse.json(mockRecommendations);
  }
}

function generateMockRecommendations(text: string) {
  const normalizedText = text.toLowerCase();
  const recommendations = [];

  // Mock keyword patterns
  const mockPatterns = [
    {
      keywords: ['세븐일레븐', '7-eleven', '세븐'],
      group: { id: 1, groupName: '세븐일레븐', primaryKeyword: '세븐일레븐' },
      tag: { tagName: '편의점' },
      confidence: 0.92
    },
    {
      keywords: ['cu', '씨유'],
      group: { id: 2, groupName: 'CU편의점', primaryKeyword: 'CU' },
      tag: { tagName: '편의점' },
      confidence: 0.90
    },
    {
      keywords: ['gs칼텍스', 'gs'],
      group: { id: 3, groupName: 'GS칼텍스', primaryKeyword: 'GS칼텍스' },
      tag: { tagName: '주유소' },
      confidence: 0.88
    },
    {
      keywords: ['맥도날드', '맥도'],
      group: { id: 4, groupName: '맥도날드', primaryKeyword: '맥도날드' },
      tag: { tagName: '패스트푸드' },
      confidence: 0.85
    },
    {
      keywords: ['스타벅스', '스벅'],
      group: { id: 5, groupName: '스타벅스', primaryKeyword: '스타벅스' },
      tag: { tagName: '카페' },
      confidence: 0.87
    }
  ];

  // Find matching patterns
  for (const pattern of mockPatterns) {
    for (const keyword of pattern.keywords) {
      if (normalizedText.includes(keyword)) {
        recommendations.push({
          keywordGroup: pattern.group,
          tagMapping: {
            tag: pattern.tag,
            confidenceScore: pattern.confidence
          },
          finalConfidence: pattern.confidence,
          recommendedAccount: '602 지급수수료',
          contextScore: 0.1,
          reason: `키워드 "${keyword}" 매칭 (${Math.round(pattern.confidence * 100)}%)`
        });
        break; // Only add one match per pattern
      }
    }
  }

  return recommendations;
}