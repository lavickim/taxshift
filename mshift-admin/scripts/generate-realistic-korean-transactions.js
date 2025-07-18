#!/usr/bin/env node

/**
 * 현실적인 한국 거래 문자열 생성기
 * 한국 회사 형태 표기, 실제 결제 패턴을 반영한 거래 문자열 생성
 */

const { PrismaClient } = require('../lib/generated/prisma');

const prisma = new PrismaClient();

// 한국 회사 형태 표기 패턴
const KOREAN_COMPANY_SUFFIXES = [
  "주식회사", "㈜", "(주)", "주/상", "주/하",
  "유한회사", "(유)", "㈲", "유/상", "유/하",
  "합자회사", "(합)", "합/상", "합/하",
  "합명회사", "(합명)", "영업소", "지점", "지사",
  "대리점", "특약점", "판매점", "매장", "직영점"
];

// 결제 방식 패턴
const PAYMENT_PATTERNS = [
  "신용카드", "체크카드", "간편결제", "온라인", "모바일",
  "카드결제", "결제", "승인", "매장", "POS", "앱결제",
  "페이", "간편", "터치", "IC카드", "MS카드"
];

// 거래 시간 패턴
const TIME_PATTERNS = [
  "", " 12:34", " 오후", " 오전", " 점심시간", " 저녁시간",
  " 새벽", " 심야", " 주말", " 평일"
];

// 실제 한국 기업명 샘플
const KOREAN_COMPANIES = [
  "삼성전자", "현대자동차", "LG전자", "SK하이닉스", "네이버", "카카오",
  "신한은행", "국민은행", "우리은행", "하나은행", "농협은행",
  "롯데마트", "이마트", "홈플러스", "코스트코", "하이마트",
  "GS25편의점", "CU편의점", "세븐일레븐", "이디야커피", "스타벅스",
  "맥도날드", "버거킹", "KFC", "롯데리아", "맘스터치",
  "현대백화점", "롯데백화점", "신세계백화점", "갤러리아백화점"
];

// 프랜차이즈 브랜드명 변형
const FRANCHISE_VARIATIONS = [
  "BBQ", "교촌치킨", "호식이두마리치킨", "굽네치킨", "처갓집양념치킨",
  "도미노피자", "피자헛", "미스터피자", "파파존스", "고르곤졸라피자",
  "투썸플레이스", "카페베네", "엔젤리너스", "빽다방", "메가커피",
  "맘스터치", "롯데리아", "버거킹", "맥도날드", "KFC", "파파이스"
];

/**
 * 한국 회사 형태가 포함된 거래 문자열 생성
 */
function generateKoreanCompanyTransaction(baseName) {
  const companyType = KOREAN_COMPANY_SUFFIXES[Math.floor(Math.random() * KOREAN_COMPANY_SUFFIXES.length)];
  const paymentMethod = PAYMENT_PATTERNS[Math.floor(Math.random() * PAYMENT_PATTERNS.length)];
  const timePattern = TIME_PATTERNS[Math.floor(Math.random() * TIME_PATTERNS.length)];
  const amount = Math.floor(Math.random() * 200000) + 1000;
  
  // 회사명 + 형태 조합 패턴들
  const patterns = [
    `${baseName}${companyType} ${paymentMethod} ${amount.toLocaleString()}원`,
    `${baseName}${companyType}${timePattern} ${paymentMethod} ${amount.toLocaleString()}원`,
    `${companyType}${baseName} ${paymentMethod} ${amount.toLocaleString()}원`,
    `[${paymentMethod}] ${baseName}${companyType} ${amount.toLocaleString()}원`,
    `${baseName}${companyType} - ${paymentMethod} ${amount.toLocaleString()}원`,
    `${baseName} ${companyType} ${paymentMethod} ${amount.toLocaleString()}원`,
    `${paymentMethod} ${baseName}${companyType} ${amount.toLocaleString()}원${timePattern}`,
    `★${baseName}${companyType} ${paymentMethod} ${amount.toLocaleString()}원`,
    `${baseName}${companyType}(${paymentMethod}) ${amount.toLocaleString()}원`,
    `${baseName}_${companyType} ${paymentMethod} ${amount.toLocaleString()}원`
  ];
  
  return patterns[Math.floor(Math.random() * patterns.length)];
}

/**
 * 프랜차이즈 + 회사형태 거래 문자열 생성
 */
function generateFranchiseCompanyTransaction(brandName) {
  const companyType = KOREAN_COMPANY_SUFFIXES[Math.floor(Math.random() * KOREAN_COMPANY_SUFFIXES.length)];
  const paymentMethod = PAYMENT_PATTERNS[Math.floor(Math.random() * PAYMENT_PATTERNS.length)];
  const amount = Math.floor(Math.random() * 50000) + 3000;
  
  const patterns = [
    `${brandName}${companyType} ${paymentMethod} ${amount.toLocaleString()}원`,
    `${brandName}(${companyType}) ${paymentMethod} ${amount.toLocaleString()}원`,
    `${brandName} ${companyType} ${paymentMethod} ${amount.toLocaleString()}원`,
    `${companyType}${brandName} ${paymentMethod} ${amount.toLocaleString()}원`,
    `[${brandName}${companyType}] ${paymentMethod} ${amount.toLocaleString()}원`
  ];
  
  return patterns[Math.floor(Math.random() * patterns.length)];
}

/**
 * 다양한 한국 거래 패턴 생성
 */
function generateVariousKoreanTransactions(count = 100) {
  const transactions = [];
  
  for (let i = 0; i < count; i++) {
    let transaction;
    const randomType = Math.random();
    
    if (randomType < 0.4) {
      // 40% 대기업 + 회사형태
      const company = KOREAN_COMPANIES[Math.floor(Math.random() * KOREAN_COMPANIES.length)];
      transaction = generateKoreanCompanyTransaction(company);
    } else if (randomType < 0.7) {
      // 30% 프랜차이즈 + 회사형태
      const franchise = FRANCHISE_VARIATIONS[Math.floor(Math.random() * FRANCHISE_VARIATIONS.length)];
      transaction = generateFranchiseCompanyTransaction(franchise);
    } else {
      // 30% 일반 브랜드명만
      const brand = FRANCHISE_VARIATIONS[Math.floor(Math.random() * FRANCHISE_VARIATIONS.length)];
      const paymentMethod = PAYMENT_PATTERNS[Math.floor(Math.random() * PAYMENT_PATTERNS.length)];
      const amount = Math.floor(Math.random() * 30000) + 2000;
      transaction = `${brand} ${paymentMethod} ${amount.toLocaleString()}원`;
    }
    
    transactions.push({
      transactionString: transaction,
      expectedHasCompanyPattern: transaction.match(/(주식회사|㈜|\(주\)|주\/상|주\/하|유한회사|\(유\)|㈲|유\/상|유\/하|합자회사|\(합\)|영업소|지점|지사|대리점|매장|직영점)/),
      category: randomType < 0.4 ? 'large_company' : randomType < 0.7 ? 'franchise_company' : 'simple_brand'
    });
  }
  
  return transactions;
}

/**
 * 브랜드 테이블에 회사형태 패턴이 포함된 거래문자열 업데이트
 */
async function updateBrandsWithCompanyPatterns() {
  console.log('🏢 브랜드 테이블에 한국 회사형태 패턴 거래문자열 추가...');
  
  try {
    // 기존 브랜드 데이터 조회
    const brands = await prisma.franchiseBrands.findMany({
      where: {
        generatedTransactionString: { not: null }
      },
      take: 1000 // 샘플로 1000개만
    });
    
    console.log(`📊 ${brands.length}개 브랜드 발견`);
    
    let updatedCount = 0;
    
    for (const brand of brands) {
      // 30% 확률로 회사형태 패턴 적용
      if (Math.random() < 0.3) {
        const newTransactionString = generateFranchiseCompanyTransaction(brand.brandName);
        
        await prisma.franchiseBrands.update({
          where: { id: brand.id },
          data: { 
            generatedTransactionString: newTransactionString,
            updatedAt: new Date()
          }
        });
        
        updatedCount++;
        
        if (updatedCount % 10 === 0) {
          console.log(`📝 ${updatedCount}개 브랜드 업데이트 완료...`);
        }
      }
    }
    
    console.log(`✅ 총 ${updatedCount}개 브랜드에 회사형태 패턴 적용 완료`);
    
  } catch (error) {
    console.error('❌ 브랜드 업데이트 실패:', error);
    throw error;
  }
}

/**
 * 테스트용 한국 거래 문자열 생성 및 저장
 */
async function generateTestTransactions() {
  console.log('🧪 한국 거래 패턴 테스트 케이스 생성...');
  
  const testTransactions = generateVariousKoreanTransactions(200);
  
  console.log(`\n📋 생성된 거래 문자열 샘플 (처음 10개):`);
  testTransactions.slice(0, 10).forEach((t, index) => {
    const hasPattern = t.expectedHasCompanyPattern ? '✅' : '❌';
    console.log(`${index + 1}. ${hasPattern} [${t.category}] ${t.transactionString}`);
  });
  
  // 통계
  const companyPatternCount = testTransactions.filter(t => t.expectedHasCompanyPattern).length;
  const categoryStats = testTransactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1;
    return acc;
  }, {});
  
  console.log(`\n📊 통계:`);
  console.log(`   총 거래 문자열: ${testTransactions.length}개`);
  console.log(`   회사형태 패턴 포함: ${companyPatternCount}개 (${(companyPatternCount/testTransactions.length*100).toFixed(1)}%)`);
  console.log(`   카테고리별 분포:`);
  Object.entries(categoryStats).forEach(([category, count]) => {
    console.log(`     ${category}: ${count}개`);
  });
  
  return testTransactions;
}

async function main() {
  console.log('🚀 한국 거래 문자열 생성 시작...');
  
  try {
    // 1. 테스트 거래 문자열 생성
    await generateTestTransactions();
    
    // 2. 브랜드 테이블 업데이트
    await updateBrandsWithCompanyPatterns();
    
    console.log(`\n🎉 한국 거래 문자열 생성 완료!`);
    console.log(`💡 이제 다음과 같은 패턴들이 테스트됩니다:`);
    console.log(`   - "삼성전자주식회사 신용카드 50,000원"`);
    console.log(`   - "BBQ(주) 간편결제 25,000원"`);
    console.log(`   - "스타벅스㈜ 모바일 15,000원"`);
    console.log(`   - "이마트 영업소 체크카드 100,000원"`);
    console.log(`   - "(유)카페베네 온라인 8,500원"`);
    
  } catch (error) {
    console.error('❌ 실행 실패:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 실행
if (require.main === module) {
  main()
    .then(() => {
      console.log('\n✅ 완료');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 실행 실패:', error);
      process.exit(1);
    });
}

module.exports = { 
  generateKoreanCompanyTransaction,
  generateFranchiseCompanyTransaction,
  generateVariousKoreanTransactions,
  updateBrandsWithCompanyPatterns
};