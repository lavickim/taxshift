#!/usr/bin/env node

/**
 * 1000+ 거래 문자열 대규모 분류 테스트
 * project-design/test-transaction-strings-1000plus.md의 데이터를 사용한 테스트
 */

const fs = require('fs');
const path = require('path');
const {
  classifyTransaction,
  KEYWORD_PATTERNS,
} = require('./test-transaction-classification.js');

// 확장된 키워드 패턴들
const EXTENDED_KEYWORD_PATTERNS = {
  ...KEYWORD_PATTERNS,

  // 편의점 확장
  편의점: {
    keywords: [
      ...KEYWORD_PATTERNS['편의점'].keywords,
      '7ELV',
      '7일레븐',
      '시유',
      'BGF리테일',
      'CU편의점',
      'CU점',
      'GS이십오',
      'GS25편의점',
      'GS25점',
      'GS-25',
      'EMART24',
      'E마트24',
      '이마트이십사',
      '이마트편의점',
      'MINISTOP',
      '미니스톱편의점',
    ],
    tag: '편의점',
    accountCode: '622',
    accountName: '차량유지비',
    confidence: 0.95,
  },

  // 주유소 확장
  주유소: {
    keywords: [
      ...KEYWORD_PATTERNS['주유소'].keywords,
      'GS주유소',
      'GS석유',
      '지에스칼텍스',
      'SK주유소',
      'SK석유',
      '에스케이에너지',
      '현대주유소',
      '현대석유',
      '오일뱅크',
      '에스오일',
      'S오일',
      '쌍용석유',
      '주유',
    ],
    tag: '주유소',
    accountCode: '622',
    accountName: '차량유지비',
    confidence: 0.95,
  },

  // 음식점 확장
  음식점: {
    keywords: [
      ...KEYWORD_PATTERNS['음식점'].keywords,
      '맥날',
      'MCD',
      'LOTTERIA',
      '롯데버거',
      'BURGERKING',
      'BK',
      '켄터키',
      '케이에프씨',
      'SUBWAY',
      '피자헛',
      'PIZZAHUT',
      '피자',
      '도미노피자',
      'DOMINOS',
      '도미노',
      '파파존스',
      '미스터피자',
      '중국집',
      '홍콩반점',
      '차이나타운',
      '김밥천국',
      '한솥도시락',
    ],
    tag: '음식점',
    accountCode: '651',
    accountName: '접대비',
    confidence: 0.9,
  },

  // 카페 확장
  카페: {
    keywords: [
      ...KEYWORD_PATTERNS['카페'].keywords,
      '스벅',
      'A-TWOSOME',
      '투썸',
      'EDIYA',
      '커피빈',
      'COFFEEBEAN',
      '할리스커피',
      'HOLLYS',
      '파스쿠찌',
      'PASCUCCI',
      '엔젤리너스',
      'ANGELINUS',
      '빽다방',
      'PAIK',
      '공차',
      'GONG CHA',
      '카페',
    ],
    tag: '카페',
    accountCode: '651',
    accountName: '접대비',
    confidence: 0.9,
  },

  // 마트 추가
  마트: {
    keywords: [
      '이마트',
      'EMART',
      'E마트',
      '신세계마트',
      '롯데마트',
      'LOTTEMART',
      '롯데',
      '홈플러스',
      'HOMEPLUS',
      '코스트코',
      'COSTCO',
      '현대백화점',
      '신세계백화점',
      '롯데백화점',
      '갤러리아백화점',
    ],
    tag: '마트',
    accountCode: '111',
    accountName: '식료품비',
    confidence: 0.95,
  },

  // 온라인쇼핑 확장
  온라인쇼핑: {
    keywords: [
      ...KEYWORD_PATTERNS['온라인쇼핑'].keywords,
      '일일번가',
      'GMARKET',
      'AUCTION',
      '티몬',
      'TMON',
      'TICKET MONSTER',
      '위메프',
      'WEMAKEPRICE',
      'WMP',
      '네이버쇼핑',
      '카카오쇼핑',
    ],
    tag: '온라인쇼핑',
    accountCode: '634',
    accountName: '소모품비',
    confidence: 0.85,
  },

  // 교통 확장
  교통: {
    keywords: [
      ...KEYWORD_PATTERNS['교통'].keywords,
      '전철',
      '도시철도',
      '시내버스',
      '시외버스',
      '카카오택시',
      '우버',
      '고속도로',
      '통행료',
      '교통카드',
      'T머니',
      '캐시비',
    ],
    tag: '교통',
    accountCode: '611',
    accountName: '여비교통비',
    confidence: 0.9,
  },

  // 의료 추가
  의료: {
    keywords: [
      '병원',
      'HOSPITAL',
      '의원',
      '클리닉',
      '약국',
      'PHARMACY',
      '치과',
      'DENTAL',
      '치과의원',
      '삼성서울병원',
      '서울대학교병원',
      '세브란스병원',
    ],
    tag: '의료',
    accountCode: '999',
    accountName: '의료비',
    confidence: 0.9,
  },

  // 금융 추가
  금융: {
    keywords: [
      'ATM',
      '현금인출기',
      'CD기',
      '계좌이체',
      '이체',
      '송금',
      '신용카드',
      '체크카드',
      '국민은행',
      '신한은행',
      '우리은행',
      '하나은행',
    ],
    tag: '금융',
    accountCode: '999',
    accountName: '금융수수료',
    confidence: 0.95,
  },
};

/**
 * 확장된 키워드 기반 거래 분류
 */
function classifyTransactionExtended(description) {
  const normalizedDescription = description.toLowerCase();

  for (const [category, pattern] of Object.entries(EXTENDED_KEYWORD_PATTERNS)) {
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
          processingPath: 'keyword',
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
    processingPath: 'unmatched',
  };
}

/**
 * test-transaction-strings-1000plus.md에서 테스트 케이스 추출
 */
function extractTestCasesFromMarkdown() {
  const mdPath = path.join(
    __dirname,
    '..',
    '..',
    'project-design',
    'test-transaction-strings-1000plus.md'
  );

  if (!fs.existsSync(mdPath)) {
    console.log('❌ 테스트 데이터 파일을 찾을 수 없습니다:', mdPath);
    return [];
  }

  const content = fs.readFileSync(mdPath, 'utf8');
  const testCases = [];

  // 코드 블록에서 거래 문자열 추출
  const codeBlockRegex = /```([^`]+)```/g;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const lines = match[1]
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#') && !line.startsWith('//'));

    testCases.push(...lines);
  }

  return testCases;
}

/**
 * 대규모 테스트 실행
 */
function runMassiveTest() {
  console.log('🚀 1000+ 거래 문자열 대규모 분류 테스트 시작\n');

  const testCases = extractTestCasesFromMarkdown();
  console.log(`📋 총 ${testCases.length}개 테스트 케이스 로드됨\n`);

  if (testCases.length === 0) {
    console.log('❌ 테스트 케이스가 없습니다.');
    return;
  }

  const results = [];
  let successCount = 0;
  let failureCount = 0;
  const categoryStats = {};
  const unmatchedCases = [];

  console.log('⚡ 분류 테스트 진행 중...\n');

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    const result = classifyTransactionExtended(testCase);

    results.push({
      index: i + 1,
      input: testCase,
      result,
    });

    if (result.matched) {
      successCount++;
      categoryStats[result.category] =
        (categoryStats[result.category] || 0) + 1;

      // 처음 몇 개 성공 케이스만 출력
      if (i < 10) {
        console.log(`✅ [${i + 1}] ${testCase}`);
        console.log(
          `   → ${result.tag} | ${result.accountCode}-${result.accountName} | 신뢰도: ${Math.round(result.confidence * 100)}%`
        );
        console.log(`   → 매칭키워드: ${result.matchedKeyword}\n`);
      }
    } else {
      failureCount++;
      unmatchedCases.push(testCase);

      // 처음 몇 개 실패 케이스만 출력
      if (unmatchedCases.length <= 10) {
        console.log(`❌ [${i + 1}] ${testCase}`);
        console.log(`   → 매칭되지 않음\n`);
      }
    }

    // 100개마다 진행상황 출력
    if ((i + 1) % 100 === 0) {
      console.log(
        `📊 진행상황: ${i + 1}/${testCases.length} (${Math.round(((i + 1) / testCases.length) * 100)}%)`
      );
    }
  }

  // 최종 통계 출력
  console.log('\n' + '='.repeat(80));
  console.log('📊 대규모 테스트 결과 통계');
  console.log('='.repeat(80));
  console.log(`총 테스트: ${testCases.length}개`);
  console.log(
    `성공: ${successCount}개 (${Math.round((successCount / testCases.length) * 100)}%)`
  );
  console.log(
    `실패: ${failureCount}개 (${Math.round((failureCount / testCases.length) * 100)}%)`
  );

  // 카테고리별 통계
  console.log('\n📈 카테고리별 매칭 통계');
  console.log('-'.repeat(50));
  Object.entries(categoryStats)
    .sort((a, b) => b[1] - a[1])
    .forEach(([category, count]) => {
      console.log(
        `${category.padEnd(15)}: ${count.toString().padStart(4)}개 (${Math.round((count / successCount) * 100)}%)`
      );
    });

  // 매칭되지 않은 케이스 분석
  console.log('\n❌ 매칭되지 않은 케이스 (상위 20개)');
  console.log('-'.repeat(50));
  unmatchedCases.slice(0, 20).forEach((case_, index) => {
    console.log(`${(index + 1).toString().padStart(2)}. ${case_}`);
  });

  // 결과 저장
  const timestamp = new Date().toISOString();
  const outputPath = path.join(
    __dirname,
    'test-results',
    'massive-test-results.json'
  );
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const summaryData = {
    timestamp,
    testInfo: {
      totalTests: testCases.length,
      successCount,
      failureCount,
      successRate: Math.round((successCount / testCases.length) * 100),
    },
    categoryStats,
    unmatchedCases: unmatchedCases.slice(0, 100), // 처음 100개만 저장
    keywordPatterns: Object.keys(EXTENDED_KEYWORD_PATTERNS),
    recommendations: generateRecommendations(unmatchedCases, categoryStats),
  };

  fs.writeFileSync(outputPath, JSON.stringify(summaryData, null, 2));

  console.log(`\n💾 결과 저장: ${outputPath}`);
  console.log(`📝 상세 결과는 ${results.length}개 항목으로 구성됩니다.`);

  // 추천사항 출력
  console.log('\n💡 시스템 개선 추천사항');
  console.log('-'.repeat(50));
  summaryData.recommendations.forEach((rec, index) => {
    console.log(`${index + 1}. ${rec}`);
  });

  return summaryData;
}

/**
 * 시스템 개선 추천사항 생성
 */
function generateRecommendations(unmatchedCases, categoryStats) {
  const recommendations = [];

  // 매칭률이 낮으면 키워드 확장 추천
  const totalMatched = Object.values(categoryStats).reduce(
    (sum, count) => sum + count,
    0
  );
  const successRate =
    (totalMatched / (totalMatched + unmatchedCases.length)) * 100;

  if (successRate < 85) {
    recommendations.push(
      '전체 매칭률이 85% 미만입니다. 키워드 패턴 확장이 필요합니다.'
    );
  }

  // 자주 나타나는 미매칭 패턴 분석
  const commonUnmatched = findCommonPatterns(unmatchedCases);
  if (commonUnmatched.length > 0) {
    recommendations.push(
      `미매칭 케이스에서 자주 나타나는 패턴: ${commonUnmatched.slice(0, 5).join(', ')}`
    );
  }

  // 카테고리별 추천
  const categoryEntries = Object.entries(categoryStats).sort(
    (a, b) => b[1] - a[1]
  );
  if (categoryEntries.length > 0) {
    const topCategory = categoryEntries[0];
    recommendations.push(
      `가장 많이 매칭된 카테고리는 '${topCategory[0]}' (${topCategory[1]}건)입니다.`
    );
  }

  if (categoryEntries.length > 1) {
    const bottomCategory = categoryEntries[categoryEntries.length - 1];
    if (bottomCategory[1] < 10) {
      recommendations.push(
        `'${bottomCategory[0]}' 카테고리의 매칭이 적습니다 (${bottomCategory[1]}건). 키워드 보강을 고려하세요.`
      );
    }
  }

  return recommendations;
}

/**
 * 공통 패턴 찾기
 */
function findCommonPatterns(cases) {
  const words = {};

  cases.forEach(case_ => {
    const tokens = case_.toLowerCase().split(/[\s\*\-\_\(\)\[\]\{\}]+/);
    tokens.forEach(token => {
      if (token.length >= 2 && !/^\d+$/.test(token)) {
        words[token] = (words[token] || 0) + 1;
      }
    });
  });

  return Object.entries(words)
    .filter(([word, count]) => count >= 3)
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word);
}

// 스크립트가 직접 실행될 때만 테스트 실행
if (require.main === module) {
  runMassiveTest();
}

module.exports = {
  classifyTransactionExtended,
  runMassiveTest,
  EXTENDED_KEYWORD_PATTERNS,
};
