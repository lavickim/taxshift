#!/usr/bin/env node

/**
 * 브랜드 기반 거래 문자열 생성 및 태그 생성 시스템
 * franchise_brands 테이블의 데이터를 기반으로 실제 거래 문자열 생성
 * 
 * 주요 기능:
 * 1. 브랜드명 + 변형 + 금액으로 거래 문자열 생성
 * 2. 산업분류, 주요상품 정보 기반 태그 우선순위 생성
 * 3. 100개씩 배치 처리
 * 4. 테스트 결과 저장
 */

const { PrismaClient } = require('../lib/generated/prisma');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// 금액 범위 매핑 (산업분류 기반)
const AMOUNT_RANGES = {
  '음식점업': { min: 5000, max: 50000 },
  '카페': { min: 3000, max: 15000 },
  '편의점': { min: 1000, max: 20000 },
  '주유소': { min: 30000, max: 80000 },
  '마트': { min: 10000, max: 200000 },
  '패션': { min: 20000, max: 300000 },
  '뷰티': { min: 10000, max: 100000 },
  '스포츠': { min: 15000, max: 150000 },
  '교통': { min: 1000, max: 50000 },
  '의료': { min: 5000, max: 200000 },
  '교육': { min: 50000, max: 500000 },
  '숙박': { min: 50000, max: 500000 },
  '기타': { min: 5000, max: 50000 }
};

// 산업분류 -> 태그 매핑
const INDUSTRY_TO_TAG_MAPPING = {
  '음식점업': {
    primary: '음식점',
    secondary: '외식',
    tertiary: '식사'
  },
  '카페': {
    primary: '카페',
    secondary: '음료',
    tertiary: '커피'
  },
  '편의점': {
    primary: '편의점',
    secondary: '생활용품',
    tertiary: '소매'
  },
  '주유소': {
    primary: '주유소',
    secondary: '교통',
    tertiary: '연료'
  },
  '마트': {
    primary: '마트',
    secondary: '쇼핑',
    tertiary: '식료품'
  },
  '패션': {
    primary: '패션',
    secondary: '의류',
    tertiary: '쇼핑'
  },
  '뷰티': {
    primary: '뷰티',
    secondary: '화장품',
    tertiary: '미용'
  },
  '스포츠': {
    primary: '스포츠',
    secondary: '운동',
    tertiary: '레저'
  },
  '교통': {
    primary: '교통',
    secondary: '이동',
    tertiary: '운송'
  },
  '의료': {
    primary: '의료',
    secondary: '병원',
    tertiary: '건강'
  },
  '교육': {
    primary: '교육',
    secondary: '학습',
    tertiary: '문화'
  },
  '숙박': {
    primary: '숙박',
    secondary: '여행',
    tertiary: '휴식'
  }
};

// 주요상품 키워드 -> 태그 매핑
const PRODUCT_TO_TAG_MAPPING = {
  '치킨': { primary: '치킨', secondary: '음식점', tertiary: '외식' },
  '피자': { primary: '피자', secondary: '음식점', tertiary: '외식' },
  '버거': { primary: '패스트푸드', secondary: '음식점', tertiary: '외식' },
  '햄버거': { primary: '패스트푸드', secondary: '음식점', tertiary: '외식' },
  '커피': { primary: '카페', secondary: '음료', tertiary: '커피' },
  '베이커리': { primary: '베이커리', secondary: '카페', tertiary: '빵' },
  '빵': { primary: '베이커리', secondary: '카페', tertiary: '빵' },
  '도넛': { primary: '디저트', secondary: '카페', tertiary: '빵' },
  '아이스크림': { primary: '디저트', secondary: '아이스크림', tertiary: '간식' },
  '편의점': { primary: '편의점', secondary: '생활용품', tertiary: '소매' },
  '주유': { primary: '주유소', secondary: '교통', tertiary: '연료' },
  '연료': { primary: '주유소', secondary: '교통', tertiary: '연료' },
  '마트': { primary: '마트', secondary: '쇼핑', tertiary: '식료품' },
  '슈퍼마켓': { primary: '마트', secondary: '쇼핑', tertiary: '식료품' },
  '의류': { primary: '패션', secondary: '의류', tertiary: '쇼핑' },
  '옷': { primary: '패션', secondary: '의류', tertiary: '쇼핑' },
  '신발': { primary: '신발', secondary: '패션', tertiary: '쇼핑' },
  '화장품': { primary: '뷰티', secondary: '화장품', tertiary: '미용' },
  '미용': { primary: '뷰티', secondary: '미용', tertiary: '화장품' },
  '스포츠': { primary: '스포츠', secondary: '운동', tertiary: '레저' },
  '운동': { primary: '스포츠', secondary: '운동', tertiary: '레저' },
  '헬스': { primary: '헬스', secondary: '스포츠', tertiary: '운동' },
  '병원': { primary: '의료', secondary: '병원', tertiary: '건강' },
  '의료': { primary: '의료', secondary: '병원', tertiary: '건강' },
  '약국': { primary: '약국', secondary: '의료', tertiary: '건강' },
  '교육': { primary: '교육', secondary: '학습', tertiary: '문화' },
  '학원': { primary: '교육', secondary: '학원', tertiary: '학습' },
  '숙박': { primary: '숙박', secondary: '여행', tertiary: '휴식' },
  '호텔': { primary: '숙박', secondary: '호텔', tertiary: '여행' },
  '모텔': { primary: '숙박', secondary: '모텔', tertiary: '휴식' }
};

/**
 * 산업분류 기반 카테고리 추론
 */
function inferCategoryFromIndustry(industryLarge, industryMedium, mainProduct) {
  // 1. 주요상품 우선 확인
  if (mainProduct) {
    const product = mainProduct.toLowerCase();
    for (const [keyword, mapping] of Object.entries(PRODUCT_TO_TAG_MAPPING)) {
      if (product.includes(keyword)) {
        return keyword;
      }
    }
  }

  // 2. 산업분류 중분류 확인
  if (industryMedium) {
    const medium = industryMedium.toLowerCase();
    if (medium.includes('치킨')) return '치킨';
    if (medium.includes('피자')) return '피자';
    if (medium.includes('커피')) return '카페';
    if (medium.includes('편의점')) return '편의점';
    if (medium.includes('주유')) return '주유소';
    if (medium.includes('마트') || medium.includes('슈퍼마켓')) return '마트';
    if (medium.includes('의류') || medium.includes('패션')) return '패션';
    if (medium.includes('화장품') || medium.includes('뷰티')) return '뷰티';
    if (medium.includes('스포츠') || medium.includes('운동')) return '스포츠';
    if (medium.includes('의료') || medium.includes('병원')) return '의료';
    if (medium.includes('교육') || medium.includes('학원')) return '교육';
    if (medium.includes('숙박') || medium.includes('호텔')) return '숙박';
  }

  // 3. 산업분류 대분류 확인
  if (industryLarge) {
    const large = industryLarge.toLowerCase();
    if (large.includes('음식점')) return '음식점업';
    if (large.includes('도매') || large.includes('소매')) return '편의점';
    if (large.includes('운수')) return '교통';
    if (large.includes('보건') || large.includes('의료')) return '의료';
    if (large.includes('교육')) return '교육';
    if (large.includes('숙박')) return '숙박';
  }

  return '기타';
}

/**
 * 태그 생성 로직
 */
function generateTags(brand, industryLarge, industryMedium, mainProduct, companyName) {
  const category = inferCategoryFromIndustry(industryLarge, industryMedium, mainProduct);
  let tags = { primary: '', secondary: '', tertiary: '' };
  let reason = '';

  // 1. 주요상품 기반 태그 생성
  if (mainProduct) {
    const product = mainProduct.toLowerCase();
    for (const [keyword, mapping] of Object.entries(PRODUCT_TO_TAG_MAPPING)) {
      if (product.includes(keyword)) {
        tags = mapping;
        reason = `주요상품 "${mainProduct}"에서 "${keyword}" 키워드 매칭`;
        break;
      }
    }
  }

  // 2. 산업분류 기반 태그 생성 (주요상품에서 찾지 못한 경우)
  if (!tags.primary && INDUSTRY_TO_TAG_MAPPING[category]) {
    tags = INDUSTRY_TO_TAG_MAPPING[category];
    reason = `산업분류 "${category}"에서 태그 매핑`;
  }

  // 3. 브랜드명 키워드 기반 태그 생성
  if (!tags.primary && brand) {
    const brandLower = brand.toLowerCase();
    if (brandLower.includes('스타벅스') || brandLower.includes('커피')) {
      tags = { primary: '카페', secondary: '커피', tertiary: '음료' };
      reason = `브랜드명 "${brand}"에서 카페 키워드 매칭`;
    } else if (brandLower.includes('맥도날드') || brandLower.includes('버거')) {
      tags = { primary: '패스트푸드', secondary: '음식점', tertiary: '외식' };
      reason = `브랜드명 "${brand}"에서 패스트푸드 키워드 매칭`;
    } else if (brandLower.includes('마트') || brandLower.includes('이마트')) {
      tags = { primary: '마트', secondary: '쇼핑', tertiary: '식료품' };
      reason = `브랜드명 "${brand}"에서 마트 키워드 매칭`;
    }
  }

  // 4. 기본 태그 (매칭되지 않은 경우)
  if (!tags.primary) {
    tags = { primary: category || '기타', secondary: '서비스', tertiary: '기타' };
    reason = `기본 태그 할당 (카테고리: ${category})`;
  }

  return { tags, reason };
}

/**
 * 거래 문자열 생성
 */
function generateTransactionString(brand, category, amount) {
  const patterns = [
    `${brand} ${amount.toLocaleString()}원`,
    `${brand} 결제 ${amount.toLocaleString()}원`,
    `${brand} 승인 ${amount.toLocaleString()}원`,
    `[카드] ${brand} ${amount.toLocaleString()}원`,
    `${brand} 체크카드 ${amount.toLocaleString()}원`,
    `${brand} 신용카드 ${amount.toLocaleString()}원`,
    `모바일 ${brand} ${amount.toLocaleString()}원`,
    `${brand} 간편결제 ${amount.toLocaleString()}원`,
    `${brand} 온라인 ${amount.toLocaleString()}원`,
    `${brand} 매장 ${amount.toLocaleString()}원`
  ];

  // 브랜드 변형 추가
  const brandVariations = [
    brand,
    brand.replace(/\s+/g, ''),  // 공백 제거
    brand.toUpperCase(),        // 대문자
    brand.toLowerCase(),        // 소문자
    brand.replace(/[()]/, ''),  // 괄호 제거
  ];

  const selectedBrand = brandVariations[Math.floor(Math.random() * brandVariations.length)];
  const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)];
  
  return selectedPattern.replace(brand, selectedBrand);
}

/**
 * 랜덤 금액 생성
 */
function generateRandomAmount(category) {
  const range = AMOUNT_RANGES[category] || AMOUNT_RANGES['기타'];
  const amount = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
  return Math.round(amount / 100) * 100; // 100원 단위로 반올림
}

/**
 * 브랜드 데이터 처리 (100개씩 배치)
 */
async function processBrandsBatch(offset = 0, limit = 100) {
  console.log(`\n📦 배치 처리 시작 (${offset + 1}~${offset + limit})`);
  
  const brands = await prisma.franchiseBrands.findMany({
    skip: offset,
    take: limit,
    orderBy: { id: 'asc' }
  });

  if (brands.length === 0) {
    console.log('✅ 모든 브랜드 처리 완료');
    return false;
  }

  const updates = [];
  
  for (const brand of brands) {
    try {
      // 1. 카테고리 추론
      const category = inferCategoryFromIndustry(
        brand.industryLargeCategory,
        brand.industryMediumCategory,
        brand.mainProduct
      );

      // 2. 태그 생성
      const { tags, reason } = generateTags(
        brand.brandName,
        brand.industryLargeCategory,
        brand.industryMediumCategory,
        brand.mainProduct,
        brand.companyName
      );

      // 3. 거래 문자열 생성
      const amount = generateRandomAmount(category);
      const transactionString = generateTransactionString(brand.brandName, category, amount);

      // 4. 업데이트 데이터 준비
      updates.push({
        id: brand.id,
        data: {
          generatedTransactionString: transactionString,
          primaryTag: tags.primary,
          secondaryTag: tags.secondary,
          tertiaryTag: tags.tertiary,
          tagGenerationReason: reason,
          updatedAt: new Date()
        }
      });

      console.log(`  ✓ ${brand.brandName} -> ${transactionString} (${tags.primary})`);
      
    } catch (error) {
      console.error(`  ❌ ${brand.brandName} 처리 실패:`, error.message);
    }
  }

  // 5. 배치 업데이트 실행
  console.log(`💾 ${updates.length}개 브랜드 업데이트 중...`);
  
  for (const update of updates) {
    await prisma.franchiseBrands.update({
      where: { id: update.id },
      data: update.data
    });
  }

  console.log(`✅ 배치 처리 완료 (${updates.length}개)`);
  return true;
}

/**
 * 전체 브랜드 처리
 */
async function processAllBrands() {
  console.log('🚀 브랜드 거래 문자열 생성 시작\n');
  
  try {
    // 총 개수 확인
    const totalCount = await prisma.franchiseBrands.count();
    console.log(`📊 총 처리할 브랜드: ${totalCount}개`);
    
    let offset = 0;
    const batchSize = 100;
    let batchCount = 0;
    
    while (offset < totalCount) {
      batchCount++;
      console.log(`\n🔄 배치 ${batchCount} 처리 중... (${offset + 1}/${totalCount})`);
      
      const hasMore = await processBrandsBatch(offset, batchSize);
      
      if (!hasMore) break;
      
      offset += batchSize;
      
      // 진행률 표시
      const progress = Math.min((offset / totalCount) * 100, 100);
      console.log(`📈 진행률: ${progress.toFixed(1)}%`);
      
      // 잠시 대기 (DB 부하 방지)
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n🎉 모든 브랜드 처리 완료!');
    
    // 통계 생성
    await generateStatistics();
    
  } catch (error) {
    console.error('❌ 처리 중 오류 발생:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * 통계 생성
 */
async function generateStatistics() {
  console.log('\n📊 통계 생성 중...');
  
  const stats = await prisma.franchiseBrands.groupBy({
    by: ['primaryTag'],
    _count: {
      primaryTag: true
    },
    orderBy: {
      _count: {
        primaryTag: 'desc'
      }
    }
  });

  console.log('\n📈 태그별 분포:');
  stats.forEach(stat => {
    console.log(`  ${stat.primaryTag || '미분류'}: ${stat._count.primaryTag}개`);
  });

  const totalProcessed = await prisma.franchiseBrands.count({
    where: {
      generatedTransactionString: {
        not: null
      }
    }
  });

  console.log(`\n✅ 총 처리된 브랜드: ${totalProcessed}개`);
}

// 직접 실행시 처리 시작
if (require.main === module) {
  processAllBrands()
    .then(() => {
      console.log('\n🎯 브랜드 거래 문자열 생성 완료!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 브랜드 처리 실패:', error);
      process.exit(1);
    });
}

module.exports = { processAllBrands, processBrandsBatch };