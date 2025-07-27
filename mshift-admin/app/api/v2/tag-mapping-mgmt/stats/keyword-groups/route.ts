import { NextRequest, NextResponse } from 'next/server';

const JAVA_API_BASE_URL =
  process.env.JAVA_API_BASE_URL || 'http://localhost:8080/mshift-api';

export async function GET(request: NextRequest) {
  try {
    console.log(
      'GET /api/v2/tag-mapping-mgmt/stats/keyword-groups - 키워드 그룹 통계 조회'
    );

    // Mock data for keyword groups
    const mockKeywordGroups = [
      {
        groupName: '대형마트',
        primaryKeyword: '마트',
        synonymCount: 5,
        tagMappings: 3,
        averageConfidence: 0.95,
        usageCount: 145,
        category: '식료품',
        isActive: true,
        lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        synonyms: ['이마트', '롯데마트', '홈플러스', '코스트코', '트레이더스'],
      },
      {
        groupName: '주유소',
        primaryKeyword: '주유소',
        synonymCount: 4,
        tagMappings: 2,
        averageConfidence: 0.93,
        usageCount: 89,
        category: '교통비',
        isActive: true,
        lastUsed: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
        synonyms: ['GS칼텍스', '에쏘', 'SK에너지', '현대오일뱅크'],
      },
      {
        groupName: '커피전문점',
        primaryKeyword: '카페',
        synonymCount: 8,
        tagMappings: 4,
        averageConfidence: 0.88,
        usageCount: 234,
        category: '음료',
        isActive: true,
        lastUsed: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        synonyms: [
          '스타벅스',
          '이디야',
          '카페베네',
          '투썸플레이스',
          '엔젤리너스',
          '할리스',
          '탐앤탐스',
          '빽다방',
        ],
      },
      {
        groupName: '온라인쇼핑몰',
        primaryKeyword: '온라인쇼핑',
        synonymCount: 6,
        tagMappings: 5,
        averageConfidence: 0.82,
        usageCount: 312,
        category: '쇼핑',
        isActive: true,
        lastUsed: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
        synonyms: ['쿠팡', '11번가', 'G마켓', '옥션', '네이버쇼핑', '티몬'],
      },
      {
        groupName: '편의점',
        primaryKeyword: '편의점',
        synonymCount: 4,
        tagMappings: 2,
        averageConfidence: 0.91,
        usageCount: 189,
        category: '식료품',
        isActive: true,
        lastUsed: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
        synonyms: ['GS25', 'CU', '세븐일레븐', '이마트24'],
      },
      {
        groupName: '대중교통',
        primaryKeyword: '교통카드',
        synonymCount: 3,
        tagMappings: 2,
        averageConfidence: 0.96,
        usageCount: 156,
        category: '교통비',
        isActive: true,
        lastUsed: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        synonyms: ['지하철', '버스', '택시'],
      },
      {
        groupName: '의료기관',
        primaryKeyword: '병원',
        synonymCount: 5,
        tagMappings: 3,
        averageConfidence: 0.89,
        usageCount: 67,
        category: '의료비',
        isActive: true,
        lastUsed: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        synonyms: ['병원', '의원', '클리닉', '약국', '한의원'],
      },
      {
        groupName: '외식업체',
        primaryKeyword: '음식점',
        synonymCount: 7,
        tagMappings: 4,
        averageConfidence: 0.85,
        usageCount: 198,
        category: '식료품',
        isActive: true,
        lastUsed: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
        synonyms: [
          '맥도날드',
          'KFC',
          '롯데리아',
          '버거킹',
          '피자헛',
          '도미노피자',
          '치킨집',
        ],
      },
    ];

    // Try to get data from Java backend if endpoint exists
    try {
      const response = await fetch(
        `${JAVA_API_BASE_URL}/v2/tag-mapping-mgmt/stats/keyword-groups`
      );
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    } catch (error) {
      console.log(
        'Backend keyword-groups endpoint not available, using mock data'
      );
    }

    return NextResponse.json(mockKeywordGroups);
  } catch (error) {
    console.error('키워드 그룹 통계 조회 실패:', error);
    return NextResponse.json(
      { error: '키워드 그룹 통계를 조회하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
