const { PrismaClient } = require('../lib/generated/prisma');

const prisma = new PrismaClient();

/**
 * Phase 1: 키워드 시스템 정리 및 음식점 카테고리 세분화
 * 1. 기존 이상한 태그들 정리 (심야구매, 주말구매, 고액결제 등)
 * 2. 외식업 분류 정교화
 * 3. 조건부 로직을 mapping_condition으로 이동
 */

// 1단계: 새로운 음식점 태그 정의 (브랜드 분석 결과 기반)
const PHASE1_FOOD_TAGS = [
  {
    id: 60,
    tag_name: '한식당개선',
    tag_description: '한국 전통 음식 전문점 - 국밥(89% 성공률), 삼겹살, 감자탕(75%), 족발(70%), 곱창(78%), 돼지고기, 돈까스(77%), 칼국수(78%), 덮밥(71%), 닭갈비, 닭고기 포함',
    category: '음식점',
    priority: 1,
    expected_success_rate: 0.75
  },
  {
    id: 61,
    tag_name: '치킨전문점개선',
    tag_description: '치킨 및 닭요리 전문점 - 치킨(80% 성공률), 닭발(42%), 닭갈비(59%), 닭고기(79%) 등 닭 요리 전문',
    category: '음식점', 
    priority: 2,
    expected_success_rate: 0.75
  },
  {
    id: 62,
    tag_name: '피자전문점개선',
    tag_description: '피자 전문점 - 피자(91% 성공률)로 가장 높은 분류 정확도를 보이는 카테고리',
    category: '음식점',
    priority: 3,
    expected_success_rate: 0.91
  },
  {
    id: 63,
    tag_name: '중식당개선',
    tag_description: '중국 음식 전문점 - 마라탕(69% 성공률), 쌀국수(43%), 짜장면, 짬뽕, 탕수육 등 중국식 요리',
    category: '음식점',
    priority: 4,
    expected_success_rate: 0.57
  },
  {
    id: 64,
    tag_name: '일식당개선',
    tag_description: '일본 음식 전편점 - 라멘, 우동, 초밥, 돈까스, 일식 정식 등 (현재 48% 성공률로 개선 필요)',
    category: '음식점',
    priority: 5,
    expected_success_rate: 0.48
  },
  {
    id: 65,
    tag_name: '양식당개선',
    tag_description: '서양 음식 전문점 - 파스타(53% 성공률), 스테이크, 리조또, 피자 이외의 서양식 요리 (현재 48% 성공률)',
    category: '음식점',
    priority: 6,
    expected_success_rate: 0.49
  },
  {
    id: 66,
    tag_name: '분식점개선',
    tag_description: '분식 전문점 - 떡볶이(79% 성공률), 김밥(85%), 순대, 튀김, 오뎅 등 간단한 한국식 음식',
    category: '음식점',
    priority: 7,
    expected_success_rate: 0.82
  },
  {
    id: 67,
    tag_name: '제과점개선',
    tag_description: '제과제빵 전문점 - 빵, 케이크, 디저트, 베이커리 제품 전문 (현재 56% 성공률)',
    category: '음식점',
    priority: 8,
    expected_success_rate: 0.56
  },
  {
    id: 68,
    tag_name: '주점개선',
    tag_description: '주류 제공 음식점 - 술집, 호프집, 포차, 맥주집, 이자카야 등 (현재 52% 성공률)',
    category: '음식점',
    priority: 9,
    expected_success_rate: 0.52
  },
  {
    id: 69,
    tag_name: '음식점기타개선',
    tag_description: '기타 분류되지 않은 음식점 - 퓨전 요리, 특수 요리, 신규 카테고리 등',
    category: '음식점',
    priority: 10,
    expected_success_rate: 0.55
  }
];

// 1단계: 주요상품 기반 키워드 그룹 정의 (실제 브랜드 분석 키워드 반영)
const PHASE1_KEYWORD_GROUPS = [
  // 최고 성공률: 피자 (91.15% 성공률, 113개 브랜드)
  {
    id: 21,
    group_name: '피자전문점_키워드',
    primary_keyword: '피자',
    synonyms: ['PIZZA', 'pizza', 'Pizza', '피자헛', '도미노', '미스터피자', '피자스쿨', '피자마루', '피자에땅', '피자알볼로'],
    category: '피자전문점',
    confidence_base: 0.91,
    brand_count: 113,
    actual_success_rate: 0.9115
  },
  
  // 고성공률: 국밥 (89.29% 성공률, 56개 브랜드)
  {
    id: 22,
    group_name: '국밥전문점_키워드',
    primary_keyword: '국밥',
    synonyms: ['곰탕', '설렁탕', '갈비탕', '뼈해장국', '돼지국밥', '순대국밥', '선지국밥', '콩나물국밥'],
    category: '한식당',
    confidence_base: 0.89,
    brand_count: 56,
    actual_success_rate: 0.8929
  },
  
  // 고성공률: 김밥 (85% 성공률, 40개 브랜드)
  {
    id: 23,
    group_name: '김밥분식_키워드',
    primary_keyword: '김밥',
    synonyms: ['김밥천국', '김밥나라', '마약김밥', '충무김밥', '누드김밥', '김밥제작소'],
    category: '분식점',
    confidence_base: 0.85,
    brand_count: 40,
    actual_success_rate: 0.85
  },
  
  // 치킨 (80% 성공률, 210개 브랜드) - 기존 보완
  {
    id: 24,
    group_name: '치킨전문점_확장키워드',
    primary_keyword: '치킨',
    synonyms: ['chicken', 'CHICKEN', 'Chicken', 'BURGER', 'burger', '닭갈비', '닭발', '닭고기', 'KFC', 'BBQ', '교촌', '네네', '굽네'],
    category: '치킨전문점',
    confidence_base: 0.80,
    brand_count: 210,
    actual_success_rate: 0.80
  },
  
  // 중성공률: 떡볶이 (78.95% 성공률, 95개 브랜드) 
  {
    id: 25,
    group_name: '떡볶이분식_키워드',
    primary_keyword: '떡볶이',
    synonyms: ['떡뽁이', '신당동떡볶이', '엽기떡볶이', '청년다방', '국물떡볶이', '마라떡볶이'],
    category: '분식점',
    confidence_base: 0.79,
    brand_count: 95,
    actual_success_rate: 0.7895
  },
  
  // 곱창 (77.78% 성공률, 36개 브랜드)
  {
    id: 26,
    group_name: '곱창전문점_키워드',
    primary_keyword: '곱창',
    synonyms: ['막창', '대창', '소곱창', '돼지곱창', '김덕후의곱창조', '곱창조'],
    category: '한식당',
    confidence_base: 0.78,
    brand_count: 36,
    actual_success_rate: 0.7778
  },
  
  // 돈까스 (76.6% 성공률, 47개 브랜드)
  {
    id: 27,
    group_name: '돈까스양식_키워드',
    primary_keyword: '돈까스',
    synonyms: ['돈가스', '돈치킨', '경양식', '치킨까스', '생선까스', '등심까스'],
    category: '양식당',
    confidence_base: 0.77,
    brand_count: 47,
    actual_success_rate: 0.766
  },
  
  // 감자탕 (75% 성공률, 40개 브랜드)
  {
    id: 28,
    group_name: '감자탕전문점_키워드',
    primary_keyword: '감자탕',
    synonyms: ['뼈다귀탕', '해장국', '김치찜', '김치찌개', '뼈해장국'],
    category: '한식당',
    confidence_base: 0.75,
    brand_count: 40,
    actual_success_rate: 0.75
  },
  
  // 족발 (69.81% 성공률, 53개 브랜드)
  {
    id: 29,
    group_name: '족발보쌈_키워드',
    primary_keyword: '족발',
    synonyms: ['보쌈', '족발보쌈', '수육', '족보', '쟁반짜장'],
    category: '한식당',
    confidence_base: 0.70,
    brand_count: 53,
    actual_success_rate: 0.6981
  },
  
  // 마라탕 (69.23% 성공률, 39개 브랜드)
  {
    id: 30,
    group_name: '마라탕중식_키워드',
    primary_keyword: '마라탕',
    synonyms: ['마라샹궈', '훠궈', '양꼬치', '마라', '삐싱궈'],
    category: '중식당',
    confidence_base: 0.69,
    brand_count: 39,
    actual_success_rate: 0.6923
  }
];

// 1단계: 키워드-태그 매핑 (실제 성공률 기반 신뢰도 점수)
const PHASE1_KEYWORD_TAG_MAPPINGS = [
  // 최고 성공률 그룹 (90% 이상)
  { keyword_group_id: 21, tag_id: 13, confidence_score: 0.95, priority: 1, 
    description: '피자 키워드 → 피자전문점 (91.15% 실제 성공률)' },
    
  // 고성공률 그룹 (80% 이상)  
  { keyword_group_id: 22, tag_id: 11, confidence_score: 0.92, priority: 1, 
    description: '국밥 키워드 → 한식당 (89.29% 실제 성공률)' },
  { keyword_group_id: 23, tag_id: 17, confidence_score: 0.90, priority: 1, 
    description: '김밥 키워드 → 분식점 (85% 실제 성공률)' },
  { keyword_group_id: 24, tag_id: 12, confidence_score: 0.88, priority: 1, 
    description: '치킨 키워드 → 치킨전문점 (80% 실제 성공률)' },
    
  // 중성공률 그룹 (75% 이상)
  { keyword_group_id: 25, tag_id: 17, confidence_score: 0.85, priority: 2, 
    description: '떡볶이 키워드 → 분식점 (78.95% 실제 성공률)' },
  { keyword_group_id: 26, tag_id: 11, confidence_score: 0.83, priority: 2, 
    description: '곱창 키워드 → 한식당 (77.78% 실제 성공률)' },
  { keyword_group_id: 27, tag_id: 16, confidence_score: 0.82, priority: 1, 
    description: '돈까스 키워드 → 양식당 (76.6% 실제 성공률)' },
  { keyword_group_id: 28, tag_id: 11, confidence_score: 0.80, priority: 3, 
    description: '감자탕 키워드 → 한식당 (75% 실제 성공률)' },
    
  // 일반 성공률 그룹 (70% 이상)  
  { keyword_group_id: 29, tag_id: 11, confidence_score: 0.78, priority: 4, 
    description: '족발 키워드 → 한식당 (69.81% 실제 성공률)' },
  { keyword_group_id: 30, tag_id: 14, confidence_score: 0.76, priority: 1, 
    description: '마라탕 키워드 → 중식당 (69.23% 실제 성공률)' }
];

// 1단계: 태그-계정과목 매핑 (비즈니스 로직 기반)
const PHASE1_TAG_ACCOUNT_MAPPINGS = [
  // 기본 매핑: 모든 음식점은 기본적으로 접대비로 분류
  { tag_id: 11, account_code: '651', account_name: '접대비', is_default: true, priority: 1, 
    description: '한식당 기본 분류' },
  { tag_id: 12, account_code: '651', account_name: '접대비', is_default: true, priority: 1, 
    description: '치킨전문점 기본 분류' },
  { tag_id: 13, account_code: '651', account_name: '접대비', is_default: true, priority: 1, 
    description: '피자전문점 기본 분류' },
  { tag_id: 14, account_code: '651', account_name: '접대비', is_default: true, priority: 1, 
    description: '중식당 기본 분류' },
  { tag_id: 15, account_code: '651', account_name: '접대비', is_default: true, priority: 1, 
    description: '일식당 기본 분류' },
  { tag_id: 16, account_code: '651', account_name: '접대비', is_default: true, priority: 1, 
    description: '양식당 기본 분류' },
  { tag_id: 17, account_code: '651', account_name: '접대비', is_default: true, priority: 1, 
    description: '분식점 기본 분류' },
  { tag_id: 18, account_code: '651', account_name: '접대비', is_default: true, priority: 1, 
    description: '제과점 기본 분류' },
  { tag_id: 19, account_code: '651', account_name: '접대비', is_default: true, priority: 1, 
    description: '주점 기본 분류' },
  { tag_id: 20, account_code: '651', account_name: '접대비', is_default: true, priority: 1, 
    description: '음식점기타 기본 분류' },
  
  // 조건부 매핑 1: 심야시간대 음식점 → 야근식대 (22시-06시)
  { tag_id: 11, account_code: '655', account_name: '야근식대', is_default: false, priority: 2,
    mapping_condition: JSON.stringify({ 
      time_range: '22:00-06:00', 
      amount_max: 30000, 
      description: '심야 시간대 한식당 이용 (야근 식사)' 
    }) },
  { tag_id: 17, account_code: '655', account_name: '야근식대', is_default: false, priority: 2,
    mapping_condition: JSON.stringify({ 
      time_range: '22:00-06:00', 
      amount_max: 20000, 
      description: '심야 시간대 분식점 이용 (야근 간식)' 
    }) },
  { tag_id: 12, account_code: '655', account_name: '야근식대', is_default: false, priority: 2,
    mapping_condition: JSON.stringify({ 
      time_range: '22:00-06:00', 
      amount_max: 40000, 
      description: '심야 시간대 치킨 이용 (야근 회식)' 
    }) },
    
  // 조건부 매핑 2: 주말 고액 음식점 → 복리후생비 (직원 회식, 워크샵 등)
  { tag_id: 11, account_code: '653', account_name: '복리후생비', is_default: false, priority: 3,
    mapping_condition: JSON.stringify({ 
      day_of_week: 'weekend', 
      amount_min: 50000, 
      description: '주말 한식당 회식 (직원 복리후생)' 
    }) },
  { tag_id: 19, account_code: '653', account_name: '복리후생비', is_default: false, priority: 2,
    mapping_condition: JSON.stringify({ 
      day_of_week: 'weekend', 
      amount_min: 30000, 
      description: '주말 주점 회식 (직원 복리후생)' 
    }) },
  { tag_id: 16, account_code: '653', account_name: '복리후생비', is_default: false, priority: 3,
    mapping_condition: JSON.stringify({ 
      day_of_week: 'weekend', 
      amount_min: 60000, 
      description: '주말 양식당 회식 (직원 복리후생)' 
    }) },
    
  // 조건부 매핑 3: 고액 음식점 → 접대비 강화 (중요 거래처 접대)
  { tag_id: 11, account_code: '651', account_name: '접대비', is_default: false, priority: 1,
    mapping_condition: JSON.stringify({ 
      amount_min: 100000, 
      description: '고액 한식당 이용 (중요 거래처 접대)' 
    }) },
  { tag_id: 16, account_code: '651', account_name: '접대비', is_default: false, priority: 1,
    mapping_condition: JSON.stringify({ 
      amount_min: 80000, 
      description: '고액 양식당 이용 (중요 거래처 접대)' 
    }) },
  { tag_id: 19, account_code: '651', account_name: '접대비', is_default: false, priority: 1,
    mapping_condition: JSON.stringify({ 
      amount_min: 70000, 
      description: '고액 주점 이용 (중요 거래처 접대)' 
    }) },
    
  // 조건부 매핑 4: 소액 분식점 → 사무용품비 (개인 식사)
  { tag_id: 17, account_code: '634', account_name: '사무용품비', is_default: false, priority: 4,
    mapping_condition: JSON.stringify({ 
      amount_max: 10000, 
      time_range: '12:00-14:00', 
      description: '점심시간 소액 분식점 이용 (개인 식사)' 
    }) },
    
  // 기존 편의점 조건부 매핑 개선
  { tag_id: 1, account_code: '655', account_name: '야근식대', is_default: false, priority: 2,
    mapping_condition: JSON.stringify({ 
      time_range: '22:00-06:00', 
      amount_max: 20000, 
      description: '심야 편의점 이용 (야근 간식/음료)' 
    }) },
  { tag_id: 1, account_code: '634', account_name: '사무용품비', is_default: false, priority: 3,
    mapping_condition: JSON.stringify({ 
      amount_min: 20000, 
      description: '편의점 사무용품/생필품 구매' 
    }) }
];

async function executePhase1Enhancement() {
  console.log('🚀 Phase 1: 키워드 시스템 정리 및 음식점 카테고리 세분화 시작');
  console.log('📋 목표 1: 기존 이상한 태그들 정리 (심야구매, 주말구매, 고액결제)');
  console.log('📋 목표 2: 외식업 분류 정교화로 성공률 60% → 75% 향상\n');
  
  try {
    await prisma.$transaction(async (tx) => {
      
      // 0. 기존 이상한 태그들 비활성화
      console.log('0️⃣ 기존 문제 태그들 정리 중...');
      const problematicTags = ['심야구매', '주말구매', '고액결제'];
      for (const tagName of problematicTags) {
        await tx.$executeRaw`
          UPDATE tags_master 
          SET is_active = false
          WHERE tag_name = ${tagName}
        `;
        console.log(`   ✓ ${tagName} 태그 비활성화 (조건부 로직으로 대체)`);
      }
      
      // 1. 새로운 음식점 태그 추가
      console.log('1️⃣ 음식점 태그 추가 중...');
      for (const tag of PHASE1_FOOD_TAGS) {
        await tx.$executeRaw`
          INSERT INTO tags_master (id, tag_name, description, tag_category, is_active, created_at)
          VALUES (${tag.id}, ${tag.tag_name}, ${tag.tag_description}, ${tag.category}, true, NOW())
          ON CONFLICT (tag_name) DO UPDATE SET
            description = EXCLUDED.description,
            tag_category = EXCLUDED.tag_category,
            is_active = EXCLUDED.is_active
        `;
        console.log(`   ✓ ${tag.tag_name} 태그 추가`);
      }
      
      // 2. 키워드 그룹 추가
      console.log('\n2️⃣ 키워드 그룹 추가 중...');
      for (const group of PHASE1_KEYWORD_GROUPS) {
        await tx.$executeRaw`
          INSERT INTO keyword_groups (id, group_name, primary_keyword, synonyms, category, confidence_base, is_active, created_at, updated_at)
          VALUES (${group.id}, ${group.group_name}, ${group.primary_keyword}, ${JSON.stringify(group.synonyms)}, ${group.category}, ${group.confidence_base}, true, NOW(), NOW())
          ON CONFLICT (group_name) DO UPDATE SET
            primary_keyword = EXCLUDED.primary_keyword,
            synonyms = EXCLUDED.synonyms,
            category = EXCLUDED.category,
            confidence_base = EXCLUDED.confidence_base,
            is_active = EXCLUDED.is_active,
            updated_at = NOW()
        `;
        console.log(`   ✓ ${group.group_name} 키워드 그룹 추가`);
      }
      
      // 3. 키워드-태그 매핑 추가
      console.log('\n3️⃣ 키워드-태그 매핑 추가 중...');
      for (const mapping of PHASE1_KEYWORD_TAG_MAPPINGS) {
        await tx.$executeRaw`
          INSERT INTO keyword_tag_mappings (keyword_group_id, tag_id, confidence_score, priority, is_active, created_at)
          VALUES (${mapping.keyword_group_id}, ${mapping.tag_id}, ${mapping.confidence_score}, ${mapping.priority}, true, NOW())
          ON CONFLICT (keyword_group_id, tag_id) DO UPDATE SET
            confidence_score = EXCLUDED.confidence_score,
            priority = EXCLUDED.priority,
            is_active = EXCLUDED.is_active
        `;
        console.log(`   ✓ 그룹 ${mapping.keyword_group_id} → 태그 ${mapping.tag_id} 매핑 추가`);
      }
      
      // 4. 태그-계정과목 매핑 추가
      console.log('\n4️⃣ 태그-계정과목 매핑 추가 중...');
      for (const mapping of PHASE1_TAG_ACCOUNT_MAPPINGS) {
        await tx.$executeRaw`
          INSERT INTO tag_account_mappings (tag_id, account_code, account_name, is_default, priority, mapping_condition, created_at)
          VALUES (${mapping.tag_id}, ${mapping.account_code}, ${mapping.account_name}, ${mapping.is_default}, ${mapping.priority}, ${mapping.mapping_condition || null}, NOW())
          ON CONFLICT (tag_id, account_code) DO UPDATE SET
            account_name = EXCLUDED.account_name,
            is_default = EXCLUDED.is_default,
            priority = EXCLUDED.priority,
            mapping_condition = EXCLUDED.mapping_condition
        `;
        console.log(`   ✓ 태그 ${mapping.tag_id} → ${mapping.account_code} ${mapping.account_name} 매핑 추가`);
      }
      
    });
    
    console.log('\n✅ Phase 1 완료!');
    console.log('📊 추가된 데이터:');
    console.log(`   - 음식점 태그: ${PHASE1_FOOD_TAGS.length}개`);
    console.log(`   - 키워드 그룹: ${PHASE1_KEYWORD_GROUPS.length}개`);
    console.log(`   - 키워드-태그 매핑: ${PHASE1_KEYWORD_TAG_MAPPINGS.length}개`);
    console.log(`   - 태그-계정과목 매핑: ${PHASE1_TAG_ACCOUNT_MAPPINGS.length}개`);
    
  } catch (error) {
    console.error('❌ Phase 1 실행 중 오류 발생:', error);
    throw error;
  }
}

// 검증 함수
async function validatePhase1() {
  console.log('\n🔍 Phase 1 데이터 검증 중...');
  
  const tagCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM tags_master WHERE id >= 11 AND id <= 20`;
  const groupCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM keyword_groups WHERE id >= 21 AND id <= 30`;
  const mappingCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM keyword_tag_mappings WHERE keyword_group_id >= 21`;
  const accountCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM tag_account_mappings WHERE tag_id >= 11`;
  
  console.log('📋 검증 결과:');
  console.log(`   - 음식점 태그: ${tagCount[0].count}개`);
  console.log(`   - 키워드 그룹: ${groupCount[0].count}개`);
  console.log(`   - 키워드-태그 매핑: ${mappingCount[0].count}개`);
  console.log(`   - 태그-계정과목 매핑: ${accountCount[0].count}개`);
  
  return {
    tags: parseInt(tagCount[0].count),
    groups: parseInt(groupCount[0].count),
    mappings: parseInt(mappingCount[0].count),
    accounts: parseInt(accountCount[0].count)
  };
}

async function main() {
  try {
    console.log('🎯 MoneyShift 키워드 시스템 확장 - Phase 1');
    console.log('==================================================\n');
    
    await executePhase1Enhancement();
    const validation = await validatePhase1();
    
    if (validation.tags === 10 && validation.groups === 10 && validation.mappings === 10) {
      console.log('\n🎉 Phase 1 성공적으로 완료!');
      console.log('📈 예상 효과: 음식점 카테고리 성공률 15% 향상');
      console.log('🔄 다음 단계: Phase 2 (서비스업 태그 확장) 진행 가능');
    } else {
      console.log('⚠️ 일부 데이터가 누락되었습니다. 검토가 필요합니다.');
    }
    
  } catch (error) {
    console.error('💥 실행 중 치명적 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();