#!/usr/bin/env node

/**
 * 테스트 거래 문자열 데이터 시딩
 * 기존 1063개 테스트 케이스를 금액 정보와 함께 확장
 */

const { PrismaClient } = require('../lib/generated/prisma');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// 금액 범위별 설정
const AMOUNT_RANGES = {
  편의점: { min: 1000, max: 15000 },
  주유소: { min: 30000, max: 80000 },
  카페: { min: 3000, max: 12000 },
  패스트푸드: { min: 5000, max: 20000 },
  치킨: { min: 15000, max: 35000 },
  피자: { min: 20000, max: 45000 },
  한식음식점: { min: 8000, max: 25000 },
  마트: { min: 10000, max: 100000 },
  온라인쇼핑: { min: 15000, max: 200000 },
  교통: { min: 1500, max: 50000 },
  의료: { min: 5000, max: 150000 },
  금융: { min: 1000, max: 10000 },
  통신: { min: 30000, max: 100000 },
  여행숙박: { min: 50000, max: 300000 },
  생활용품: { min: 5000, max: 50000 },
  뷰티: { min: 10000, max: 80000 },
  스포츠: { min: 20000, max: 150000 },
  배송택배: { min: 3000, max: 10000 },
  서점문화: { min: 10000, max: 50000 },
  기타: { min: 5000, max: 30000 },
};

// 계정과목 매핑
const ACCOUNT_MAPPING = {
  편의점: { code: '622', name: '차량유지비' },
  주유소: { code: '622', name: '차량유지비' },
  카페: { code: '651', name: '접대비' },
  패스트푸드: { code: '651', name: '접대비' },
  치킨: { code: '651', name: '접대비' },
  피자: { code: '651', name: '접대비' },
  한식음식점: { code: '651', name: '접대비' },
  마트: { code: '111', name: '식료품비' },
  온라인쇼핑: { code: '634', name: '소모품비' },
  교통: { code: '611', name: '여비교통비' },
  의료: { code: '999', name: '의료비' },
  금융: { code: '999', name: '금융수수료' },
  통신: { code: '634', name: '통신비' },
  여행숙박: { code: '611', name: '여비교통비' },
  생활용품: { code: '634', name: '소모품비' },
  뷰티: { code: '634', name: '소모품비' },
  스포츠: { code: '634', name: '소모품비' },
  배송택배: { code: '634', name: '소모품비' },
  서점문화: { code: '651', name: '접대비' },
  기타: { code: '634', name: '소모품비' },
};

/**
 * 원본 1063개 테스트 케이스를 project-design 파일에서 직접 로드
 */
function loadFullTestCasesFromFile() {
  const fs = require('fs');
  const path = require('path');

  try {
    const testFilePath = path.join(
      __dirname,
      '../../project-design/test-transaction-strings-1000plus.md'
    );
    const content = fs.readFileSync(testFilePath, 'utf8');

    // 마크다운에서 테스트 케이스 추출
    const sections = content.split('## ');
    const testCases = {};

    sections.forEach(section => {
      const lines = section.split('\n');
      const title = lines[0];

      if (title.includes('편의점 거래')) {
        testCases['편의점'] = extractTestCases(section, 100);
      } else if (title.includes('주유소 거래')) {
        testCases['주유소'] = extractTestCases(section, 80);
      } else if (title.includes('음식점/카페 거래')) {
        testCases['카페'] = extractTestCases(section, 60);
        testCases['한식음식점'] = extractTestCases(section, 50, 60);
        testCases['패스트푸드'] = extractTestCases(section, 40, 110);
      } else if (title.includes('마트/쇼핑 거래')) {
        testCases['마트'] = extractTestCases(section, 60);
        testCases['온라인쇼핑'] = extractTestCases(section, 60, 60);
      } else if (title.includes('교통 거래')) {
        testCases['교통'] = extractTestCases(section, 100);
      } else if (title.includes('의료/병원 거래')) {
        testCases['의료'] = extractTestCases(section, 80);
      } else if (title.includes('은행/금융 거래')) {
        testCases['금융'] = extractTestCases(section, 100);
      } else if (title.includes('온라인서비스/구독 거래')) {
        testCases['온라인서비스'] = extractTestCases(section, 90);
      } else if (title.includes('기타 생활서비스')) {
        testCases['기타'] = extractTestCases(section, 100);
      }
    });

    return testCases;
  } catch (error) {
    console.error('Error loading test cases from file:', error);
    return getSimplifiedTestCases();
  }
}

function extractTestCases(section, count, startIndex = 0) {
  const lines = section.split('\n');
  const cases = [];

  for (let i = 0; i < lines.length && cases.length < count; i++) {
    const line = lines[i].trim();
    if (
      line &&
      !line.startsWith('#') &&
      !line.startsWith('```') &&
      !line.startsWith('*') &&
      line.length > 3
    ) {
      if (cases.length >= startIndex) {
        cases.push(line);
      }
    }
  }

  return cases.slice(0, count);
}

function getSimplifiedTestCases() {
  // 파일 로드 실패시 간소화된 테스트 케이스 반환
  return {
    편의점: [
      '세븐일레븐 강남점',
      '7-ELEVEN 신촌점',
      'CU 홍대점',
      'GS25 종로점',
      '이마트24 서초점',
    ],
    주유소: [
      'GS칼텍스 강남주유소',
      'SK에너지 서초주유소',
      '현대오일뱅크 여의도주유소',
      'S-Oil 송파주유소',
    ],
    카페: [
      '스타벅스 강남역점',
      '투썸플레이스 신촌점',
      '이디야커피 압구정점',
      '커피빈 강남점',
    ],
    패스트푸드: [
      '맥도날드 강남점',
      '롯데리아 명동점',
      '버거킹 압구정점',
      'KFC 종로점',
    ],
    치킨: [
      'BBQ 노원점',
      '굽네치킨 강북점',
      '네네치킨 구로점',
      '교촌치킨 서대문점',
    ],
    마트: [
      '이마트 강남점',
      '롯데마트 명동점',
      '홈플러스 잠실점',
      '코스트코 강남점',
    ],
    교통: ['지하철', '버스', '택시', '톨게이트', '교통카드'],
    의료: ['삼성서울병원', '서울대학교병원', '세브란스병원', '온누리약국'],
    온라인쇼핑: ['쿠팡', '11번가', '지마켓', '옥션'],
    기타: ['다이소', '교보문고', 'CGV', 'CJ택배'],
  };
}

const TEST_CASES_BY_CATEGORY = loadFullTestCasesFromFile();

/**
 * 랜덤 금액 생성
 */
function generateRandomAmount(category) {
  const range = AMOUNT_RANGES[category] || AMOUNT_RANGES['기타'];
  const amount =
    Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
  // 100원 단위로 반올림
  return Math.round(amount / 100) * 100;
}

/**
 * 금액을 한국어 형식으로 포맷
 */
function formatAmount(amount) {
  return `${amount.toLocaleString()}원`;
}

/**
 * 확장된 거래 문자열 생성
 */
function generateExtendedTransactionText(originalText, amount) {
  const formattedAmount = formatAmount(amount);

  // 여러 패턴으로 확장
  const patterns = [
    `${originalText} ${formattedAmount}`,
    `${originalText} 결제 ${formattedAmount}`,
    `${originalText} 승인 ${formattedAmount}`,
    `[카드] ${originalText} ${formattedAmount}`,
    `${originalText} 체크카드 ${formattedAmount}`,
    `${originalText} 신용카드 ${formattedAmount}`,
    `모바일 ${originalText} ${formattedAmount}`,
    `${originalText} 간편결제 ${formattedAmount}`,
  ];

  return patterns[Math.floor(Math.random() * patterns.length)];
}

/**
 * 테스트 데이터 시딩 메인 함수
 */
async function seedTestTransactions() {
  console.log('🌱 테스트 거래 문자열 데이터 시딩 시작\n');

  try {
    // 기존 테스트 데이터 삭제
    console.log('🗑️  기존 테스트 데이터 정리...');
    await prisma.testTransactionString.deleteMany({});

    const testData = [];
    let totalCount = 0;

    // 카테고리별로 테스트 데이터 생성
    for (const [category, texts] of Object.entries(TEST_CASES_BY_CATEGORY)) {
      console.log(`📝 처리 중: ${category} (${texts.length}개)`);

      const account = ACCOUNT_MAPPING[category] || ACCOUNT_MAPPING['기타'];

      for (const originalText of texts) {
        const amount = generateRandomAmount(category);
        const extendedText = generateExtendedTransactionText(
          originalText,
          amount
        );

        testData.push({
          transactionText: extendedText,
          amount: amount,
          formattedAmount: formatAmount(amount),
          category: category,
          expectedTag: category,
          expectedAccountCode: account.code,
          expectedAccountName: account.name,
          description: `${category} 카테고리의 테스트 케이스`,
          isActive: true,
        });

        totalCount++;
      }
    }

    // 배치로 데이터 삽입
    console.log(`\n💾 ${totalCount}개 테스트 케이스 데이터베이스 삽입 중...`);
    const chunkSize = 100;
    for (let i = 0; i < testData.length; i += chunkSize) {
      const chunk = testData.slice(i, i + chunkSize);
      await prisma.testTransactionString.createMany({
        data: chunk,
      });
      console.log(
        `   진행: ${Math.min(i + chunkSize, testData.length)}/${testData.length}`
      );
    }

    // 결과 검증
    const insertedCount = await prisma.testTransactionString.count();

    console.log('\n' + '='.repeat(70));
    console.log('🎉 테스트 거래 문자열 시딩 완료!');
    console.log('='.repeat(70));
    console.log(`📊 생성된 테스트 케이스: ${insertedCount}개`);
    console.log(
      `📋 카테고리 수: ${Object.keys(TEST_CASES_BY_CATEGORY).length}개`
    );

    // 카테고리별 통계
    console.log('\n📈 카테고리별 테스트 케이스 수:');
    for (const [category, texts] of Object.entries(TEST_CASES_BY_CATEGORY)) {
      console.log(`  ${category}: ${texts.length}개`);
    }

    // 샘플 데이터 출력
    console.log('\n📋 생성된 테스트 케이스 샘플 (5개):');
    const samples = await prisma.testTransactionString.findMany({
      take: 5,
      orderBy: { id: 'asc' },
    });

    samples.forEach((sample, index) => {
      console.log(`${index + 1}. ${sample.transactionText}`);
      console.log(
        `   카테고리: ${sample.category} | 금액: ${sample.formattedAmount}`
      );
      console.log(
        `   예상 태그: ${sample.expectedTag} | 계정: ${sample.expectedAccountCode}-${sample.expectedAccountName}\n`
      );
    });

    console.log('🚀 테스트 환경 준비 완료!');
  } catch (error) {
    console.error('❌ 시딩 중 오류 발생:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 직접 실행시 시딩 수행
if (require.main === module) {
  seedTestTransactions()
    .then(() => {
      console.log('\n✅ 시딩 완료!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ 시딩 실패:', error);
      process.exit(1);
    });
}

module.exports = { seedTestTransactions };
