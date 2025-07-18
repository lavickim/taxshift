#!/usr/bin/env node

/**
 * 거래 문자열 분류 테스트 스크립트
 * MVP를 위한 키워드 기반 분류 엔진 테스트
 */

const fs = require('fs');
const path = require('path');

// 키워드 룰 패턴들
const KEYWORD_PATTERNS = {
  // 편의점
  '편의점': {
    keywords: ['세븐일레븐', '7ELEVEN', '7-ELEVEN', '711', '7-11', 'CU', 'GS25', '이마트24', 'EMART24', '미니스톱', 'MINISTOP'],
    tag: '편의점',
    accountCode: '622',
    accountName: '차량유지비',
    confidence: 0.95
  },
  
  // 주유소
  '주유소': {
    keywords: ['GS칼텍스', 'GSCALTEX', 'SK에너지', 'SKENERGY', '현대오일뱅크', 'HYUNDAIOILBANK', 'S-Oil', 'SOIL', '주유소'],
    tag: '주유소',
    accountCode: '622',
    accountName: '차량유지비',
    confidence: 0.95
  },
  
  // 음식점
  '음식점': {
    keywords: ['맥도날드', 'McDonalds', '롯데리아', 'LOTTERIA', '버거킹', 'BURGERKING', 'KFC', '켄터키', '서브웨이', 'SUBWAY'],
    tag: '음식점',
    accountCode: '651',
    accountName: '접대비',
    confidence: 0.90
  },
  
  // 카페
  '카페': {
    keywords: ['스타벅스', 'STARBUCKS', '투썸플레이스', 'A-TWOSOME', '이디야커피', 'EDIYA', '커피빈', 'COFFEEBEAN'],
    tag: '카페',
    accountCode: '651',
    accountName: '접대비',
    confidence: 0.90
  },
  
  // 온라인쇼핑
  '온라인쇼핑': {
    keywords: ['쿠팡', 'COUPANG', '11번가', '11ST', '지마켓', 'GMARKET', '옥션', 'AUCTION'],
    tag: '온라인쇼핑',
    accountCode: '634',
    accountName: '소모품비',
    confidence: 0.85
  },
  
  // 교통
  '교통': {
    keywords: ['지하철', 'SUBWAY', '버스', 'BUS', '택시', 'TAXI', '톨게이트', 'TOLLGATE'],
    tag: '교통',
    accountCode: '611',
    accountName: '여비교통비',
    confidence: 0.90
  }
};

/**
 * 키워드 기반 거래 분류
 */
function classifyTransaction(description) {
  const normalizedDescription = description.toLowerCase();
  
  for (const [category, pattern] of Object.entries(KEYWORD_PATTERNS)) {
    for (const keyword of pattern.keywords) {
      if (normalizedDescription.includes(keyword.toLowerCase())) {
        return {
          matched: true,
          category,
          tag: pattern.tag,
          accountCode: pattern.accountCode,
          accountName: pattern.accountName,
          confidence: pattern.confidence,
          matchedKeyword: keyword,
          processingPath: 'keyword'
        };
      }
    }
  }
  
  return {
    matched: false,
    category: null,
    tag: null,
    accountCode: null,
    accountName: null,
    confidence: 0,
    matchedKeyword: null,
    processingPath: 'unmatched'
  };
}

/**
 * 테스트 케이스들
 */
const TEST_CASES = [
  // 편의점 테스트
  '세븐일레븐 강남점',
  '7-ELEVEN 신촌점',
  'CU 홍대점',
  'GS25 종로점',
  '이마트24 서초점',
  '미니스톱 을지로점',
  
  // 주유소 테스트
  'GS칼텍스 강남주유소',
  'SK에너지 서초주유소',
  '현대오일뱅크 여의도주유소',
  'S-Oil 송파주유소',
  
  // 음식점 테스트
  '맥도날드 강남점',
  'McDonald\'s 신촌점',
  '롯데리아 명동점',
  '버거킹 압구정점',
  'KFC 종로점',
  '서브웨이 역삼점',
  
  // 카페 테스트
  '스타벅스 강남역점',
  'STARBUCKS 홍대점',
  '투썸플레이스 신촌점',
  '이디야커피 압구정점',
  
  // 온라인쇼핑 테스트
  '쿠팡',
  'COUPANG',
  '11번가',
  '지마켓',
  
  // 교통 테스트
  '지하철',
  '버스',
  '택시',
  '톨게이트',
  
  // 매칭되지 않는 케이스
  '알 수 없는 상점',
  '기타 결제',
  '현금 인출'
];

/**
 * 테스트 실행
 */
function runTests() {
  console.log('🚀 거래 문자열 분류 테스트 시작\n');
  console.log(`총 ${TEST_CASES.length}개 테스트 케이스\n`);
  
  const results = [];
  let successCount = 0;
  let failureCount = 0;
  
  for (let i = 0; i < TEST_CASES.length; i++) {
    const testCase = TEST_CASES[i];
    const result = classifyTransaction(testCase);
    
    results.push({
      index: i + 1,
      input: testCase,
      result
    });
    
    if (result.matched) {
      successCount++;
      console.log(`✅ [${i + 1}] ${testCase}`);
      console.log(`   → ${result.tag} | ${result.accountCode}-${result.accountName} | 신뢰도: ${Math.round(result.confidence * 100)}%`);
      console.log(`   → 매칭키워드: ${result.matchedKeyword}\n`);
    } else {
      failureCount++;
      console.log(`❌ [${i + 1}] ${testCase}`);
      console.log(`   → 매칭되지 않음\n`);
    }
  }
  
  // 통계 출력
  console.log('📊 테스트 결과 통계');
  console.log('='.repeat(50));
  console.log(`총 테스트: ${TEST_CASES.length}개`);
  console.log(`성공: ${successCount}개 (${Math.round(successCount / TEST_CASES.length * 100)}%)`);
  console.log(`실패: ${failureCount}개 (${Math.round(failureCount / TEST_CASES.length * 100)}%)`);
  
  // 카테고리별 통계
  const categoryStats = {};
  results.forEach(({ result }) => {
    if (result.matched) {
      categoryStats[result.category] = (categoryStats[result.category] || 0) + 1;
    }
  });
  
  console.log('\n📈 카테고리별 매칭 통계');
  console.log('-'.repeat(30));
  Object.entries(categoryStats).forEach(([category, count]) => {
    console.log(`${category}: ${count}개`);
  });
  
  // 결과를 JSON 파일로 저장
  const outputPath = path.join(__dirname, 'test-results', 'classification-test-results.json');
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    totalTests: TEST_CASES.length,
    successCount,
    failureCount,
    successRate: Math.round(successCount / TEST_CASES.length * 100),
    categoryStats,
    detailedResults: results
  }, null, 2));
  
  console.log(`\n💾 결과 저장: ${outputPath}`);
}

// 스크립트가 직접 실행될 때만 테스트 실행
if (require.main === module) {
  runTests();
}

module.exports = {
  classifyTransaction,
  runTests,
  KEYWORD_PATTERNS
};