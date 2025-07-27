/**
 * Keyword System Data Seeding Script
 *
 * 이 스크립트는 새로운 키워드 기반 거래 분류 시스템을 위한 초기 데이터를 설정합니다.
 *
 * 실행 방법:
 * node scripts/seed-keyword-system.js
 */

const fs = require('fs');
const path = require('path');

// 초기 데이터 정의
const INITIAL_DATA = {
  // 1. 키워드 그룹 정의
  keywordGroups: [
    {
      groupName: '세븐일레븐',
      primaryKeyword: '세븐일레븐',
      synonyms: ['7-eleven', '7일레븐', '세븐', '711'],
      category: '편의점',
      confidenceBase: 0.92,
      isActive: true,
    },
    {
      groupName: 'CU편의점',
      primaryKeyword: 'CU',
      synonyms: ['씨유', 'cu편의점', 'cu점'],
      category: '편의점',
      confidenceBase: 0.9,
      isActive: true,
    },
    {
      groupName: '이마트24',
      primaryKeyword: '이마트24',
      synonyms: ['emart24', '이마트이십사'],
      category: '편의점',
      confidenceBase: 0.89,
      isActive: true,
    },
    {
      groupName: 'GS25',
      primaryKeyword: 'GS25',
      synonyms: ['지에스25', 'gs이십오'],
      category: '편의점',
      confidenceBase: 0.88,
      isActive: true,
    },
    {
      groupName: 'GS칼텍스',
      primaryKeyword: 'GS칼텍스',
      synonyms: ['gs칼텍스', '지에스칼텍스', 'gs'],
      category: '주유소',
      confidenceBase: 0.95,
      isActive: true,
    },
    {
      groupName: 'SK에너지',
      primaryKeyword: 'SK에너지',
      synonyms: ['sk', '에스케이', 'sk주유소'],
      category: '주유소',
      confidenceBase: 0.94,
      isActive: true,
    },
    {
      groupName: '현대오일뱅크',
      primaryKeyword: '현대오일뱅크',
      synonyms: ['현대오일', '오일뱅크', 'hyundai'],
      category: '주유소',
      confidenceBase: 0.92,
      isActive: true,
    },
    {
      groupName: 'S-Oil',
      primaryKeyword: 'S-Oil',
      synonyms: ['s오일', '에스오일', 'soil'],
      category: '주유소',
      confidenceBase: 0.91,
      isActive: true,
    },
    {
      groupName: '맥도날드',
      primaryKeyword: '맥도날드',
      synonyms: ['맥도', 'mcdonald', '맥날'],
      category: '패스트푸드',
      confidenceBase: 0.93,
      isActive: true,
    },
    {
      groupName: '롯데리아',
      primaryKeyword: '롯데리아',
      synonyms: ['롯데버거', 'lotteria'],
      category: '패스트푸드',
      confidenceBase: 0.9,
      isActive: true,
    },
    {
      groupName: '버거킹',
      primaryKeyword: '버거킹',
      synonyms: ['burgerking', 'bk'],
      category: '패스트푸드',
      confidenceBase: 0.89,
      isActive: true,
    },
    {
      groupName: 'KFC',
      primaryKeyword: 'KFC',
      synonyms: ['케이에프씨', '켄터키', '치킨'],
      category: '패스트푸드',
      confidenceBase: 0.88,
      isActive: true,
    },
    {
      groupName: '스타벅스',
      primaryKeyword: '스타벅스',
      synonyms: ['스벅', 'starbucks', '별다방'],
      category: '카페',
      confidenceBase: 0.95,
      isActive: true,
    },
    {
      groupName: '커피빈',
      primaryKeyword: '커피빈',
      synonyms: ['coffeebean', 'coffee bean'],
      category: '카페',
      confidenceBase: 0.87,
      isActive: true,
    },
    {
      groupName: '이디야',
      primaryKeyword: '이디야',
      synonyms: ['ediya', '이디야커피'],
      category: '카페',
      confidenceBase: 0.85,
      isActive: true,
    },
    {
      groupName: '투썸플레이스',
      primaryKeyword: '투썸플레이스',
      synonyms: ['투썸', 'twosome', '2some'],
      category: '카페',
      confidenceBase: 0.86,
      isActive: true,
    },
    {
      groupName: '쿠팡',
      primaryKeyword: '쿠팡',
      synonyms: ['coupang', '쿠팡이츠'],
      category: '온라인쇼핑',
      confidenceBase: 0.92,
      isActive: true,
    },
    {
      groupName: '배달의민족',
      primaryKeyword: '배달의민족',
      synonyms: ['배민', 'baemin', '배달민족'],
      category: '배달앱',
      confidenceBase: 0.94,
      isActive: true,
    },
    {
      groupName: '요기요',
      primaryKeyword: '요기요',
      synonyms: ['yogiyo'],
      category: '배달앱',
      confidenceBase: 0.9,
      isActive: true,
    },
    {
      groupName: '카카오택시',
      primaryKeyword: '카카오택시',
      synonyms: ['kakao', '카톡택시'],
      category: '교통',
      confidenceBase: 0.88,
      isActive: true,
    },
  ],

  // 2. 태그 마스터 정의
  tagsMaster: [
    {
      tagName: '편의점',
      tagDescription: '24시간 편의점 및 소규모 매점',
      category: '상업시설',
      isActive: true,
    },
    {
      tagName: '주유소',
      tagDescription: '연료 충전 및 차량 관련 서비스',
      category: '상업시설',
      isActive: true,
    },
    {
      tagName: '패스트푸드',
      tagDescription: '햄버거, 치킨 등 빠른 식사',
      category: '음식점',
      isActive: true,
    },
    {
      tagName: '카페',
      tagDescription: '커피 및 음료 전문점',
      category: '음식점',
      isActive: true,
    },
    {
      tagName: '온라인쇼핑',
      tagDescription: '인터넷 쇼핑몰 구매',
      category: '전자상거래',
      isActive: true,
    },
    {
      tagName: '배달앱',
      tagDescription: '음식 배달 서비스',
      category: '전자상거래',
      isActive: true,
    },
    {
      tagName: '교통',
      tagDescription: '택시, 버스, 지하철 등 교통비',
      category: '교통비',
      isActive: true,
    },
    {
      tagName: '심야구매',
      tagDescription: '자정 이후 새벽 시간대 구매',
      category: '시간대',
      isActive: true,
    },
    {
      tagName: '주말구매',
      tagDescription: '토요일, 일요일 구매',
      category: '시간대',
      isActive: true,
    },
    {
      tagName: '고액결제',
      tagDescription: '10만원 이상 고액 결제',
      category: '금액대',
      isActive: true,
    },
  ],

  // 3. 키워드-태그 매핑 정의
  keywordTagMappings: [
    // 편의점 매핑
    {
      keywordGroupName: '세븐일레븐',
      tagName: '편의점',
      confidenceScore: 0.95,
      priority: 1,
    },
    {
      keywordGroupName: 'CU편의점',
      tagName: '편의점',
      confidenceScore: 0.93,
      priority: 1,
    },
    {
      keywordGroupName: '이마트24',
      tagName: '편의점',
      confidenceScore: 0.92,
      priority: 1,
    },
    {
      keywordGroupName: 'GS25',
      tagName: '편의점',
      confidenceScore: 0.9,
      priority: 1,
    },

    // 주유소 매핑
    {
      keywordGroupName: 'GS칼텍스',
      tagName: '주유소',
      confidenceScore: 0.98,
      priority: 1,
    },
    {
      keywordGroupName: 'SK에너지',
      tagName: '주유소',
      confidenceScore: 0.97,
      priority: 1,
    },
    {
      keywordGroupName: '현대오일뱅크',
      tagName: '주유소',
      confidenceScore: 0.95,
      priority: 1,
    },
    {
      keywordGroupName: 'S-Oil',
      tagName: '주유소',
      confidenceScore: 0.94,
      priority: 1,
    },

    // 패스트푸드 매핑
    {
      keywordGroupName: '맥도날드',
      tagName: '패스트푸드',
      confidenceScore: 0.96,
      priority: 1,
    },
    {
      keywordGroupName: '롯데리아',
      tagName: '패스트푸드',
      confidenceScore: 0.93,
      priority: 1,
    },
    {
      keywordGroupName: '버거킹',
      tagName: '패스트푸드',
      confidenceScore: 0.92,
      priority: 1,
    },
    {
      keywordGroupName: 'KFC',
      tagName: '패스트푸드',
      confidenceScore: 0.91,
      priority: 1,
    },

    // 카페 매핑
    {
      keywordGroupName: '스타벅스',
      tagName: '카페',
      confidenceScore: 0.98,
      priority: 1,
    },
    {
      keywordGroupName: '커피빈',
      tagName: '카페',
      confidenceScore: 0.9,
      priority: 1,
    },
    {
      keywordGroupName: '이디야',
      tagName: '카페',
      confidenceScore: 0.88,
      priority: 1,
    },
    {
      keywordGroupName: '투썸플레이스',
      tagName: '카페',
      confidenceScore: 0.89,
      priority: 1,
    },

    // 온라인 서비스 매핑
    {
      keywordGroupName: '쿠팡',
      tagName: '온라인쇼핑',
      confidenceScore: 0.95,
      priority: 1,
    },
    {
      keywordGroupName: '배달의민족',
      tagName: '배달앱',
      confidenceScore: 0.97,
      priority: 1,
    },
    {
      keywordGroupName: '요기요',
      tagName: '배달앱',
      confidenceScore: 0.93,
      priority: 1,
    },
    {
      keywordGroupName: '카카오택시',
      tagName: '교통',
      confidenceScore: 0.91,
      priority: 1,
    },
  ],

  // 4. 태그-계정과목 매핑 정의
  tagAccountMappings: [
    {
      tagName: '편의점',
      accountCode: '602',
      accountName: '지급수수료',
      isDefault: true,
      priority: 1,
      confidenceBoost: 0.05,
    },
    {
      tagName: '주유소',
      accountCode: '622',
      accountName: '차량유지비',
      isDefault: true,
      priority: 1,
      confidenceBoost: 0.1,
    },
    {
      tagName: '패스트푸드',
      accountCode: '651',
      accountName: '접대비',
      isDefault: true,
      priority: 1,
      confidenceBoost: 0.05,
    },
    {
      tagName: '카페',
      accountCode: '651',
      accountName: '접대비',
      isDefault: true,
      priority: 1,
      confidenceBoost: 0.05,
    },
    {
      tagName: '온라인쇼핑',
      accountCode: '634',
      accountName: '소모품비',
      isDefault: true,
      priority: 1,
      confidenceBoost: 0.03,
    },
    {
      tagName: '배달앱',
      accountCode: '651',
      accountName: '접대비',
      isDefault: true,
      priority: 1,
      confidenceBoost: 0.05,
    },
    {
      tagName: '교통',
      accountCode: '611',
      accountName: '여비교통비',
      isDefault: true,
      priority: 1,
      confidenceBoost: 0.08,
    },
    // 조건부 매핑 예시
    {
      tagName: '편의점',
      accountCode: '655',
      accountName: '야근식대',
      mappingCondition: { time: 'late_night' },
      isDefault: false,
      priority: 2,
      confidenceBoost: 0.1,
    },
    {
      tagName: '카페',
      accountCode: '634',
      accountName: '소모품비',
      mappingCondition: { amount_max: 10000 },
      isDefault: false,
      priority: 2,
      confidenceBoost: 0.03,
    },
  ],

  // 5. 테스트 케이스 정의
  testCases: [
    {
      name: '편의점 테스트',
      cases: [
        {
          input: '세븐일레븐 강남점에서 커피 구매',
          expectedTag: '편의점',
          expectedAccount: '602',
        },
        {
          input: 'CU편의점 야식 구매 02:30',
          expectedTag: '편의점',
          expectedAccount: '655',
        },
        {
          input: '이마트24 생필품 구매',
          expectedTag: '편의점',
          expectedAccount: '602',
        },
        {
          input: 'GS25 음료수 구매',
          expectedTag: '편의점',
          expectedAccount: '602',
        },
      ],
    },
    {
      name: '주유소 테스트',
      cases: [
        {
          input: 'GS칼텍스 주유소 휘발유 충전',
          expectedTag: '주유소',
          expectedAccount: '622',
        },
        {
          input: 'SK에너지 셀프 주유',
          expectedTag: '주유소',
          expectedAccount: '622',
        },
        {
          input: '현대오일뱅크 경유 충전',
          expectedTag: '주유소',
          expectedAccount: '622',
        },
        {
          input: 'S-Oil 주유소 연료비',
          expectedTag: '주유소',
          expectedAccount: '622',
        },
      ],
    },
    {
      name: '패스트푸드 테스트',
      cases: [
        {
          input: '맥도날드 빅맥세트 주문',
          expectedTag: '패스트푸드',
          expectedAccount: '651',
        },
        {
          input: '롯데리아 햄버거 배달',
          expectedTag: '패스트푸드',
          expectedAccount: '651',
        },
        {
          input: '버거킹 와퍼 주문',
          expectedTag: '패스트푸드',
          expectedAccount: '651',
        },
        {
          input: 'KFC 치킨 구매',
          expectedTag: '패스트푸드',
          expectedAccount: '651',
        },
      ],
    },
    {
      name: '카페 테스트',
      cases: [
        {
          input: '스타벅스 아메리카노',
          expectedTag: '카페',
          expectedAccount: '651',
        },
        {
          input: '커피빈 라떼 주문',
          expectedTag: '카페',
          expectedAccount: '651',
        },
        {
          input: '이디야 커피 5000원',
          expectedTag: '카페',
          expectedAccount: '634',
        },
        {
          input: '투썸플레이스 케이크',
          expectedTag: '카페',
          expectedAccount: '651',
        },
      ],
    },
    {
      name: '온라인 서비스 테스트',
      cases: [
        {
          input: '쿠팡 생필품 주문',
          expectedTag: '온라인쇼핑',
          expectedAccount: '634',
        },
        {
          input: '배달의민족 치킨 배달',
          expectedTag: '배달앱',
          expectedAccount: '651',
        },
        {
          input: '요기요 피자 주문',
          expectedTag: '배달앱',
          expectedAccount: '651',
        },
        {
          input: '카카오택시 택시비',
          expectedTag: '교통',
          expectedAccount: '611',
        },
      ],
    },
  ],
};

// SQL 생성 함수들
function generateKeywordGroupsSQL() {
  const insertSQL = [];

  INITIAL_DATA.keywordGroups.forEach((group, index) => {
    const synonymsJson = JSON.stringify(group.synonyms);
    insertSQL.push(`
      INSERT INTO keyword_groups (id, group_name, primary_keyword, synonyms, category, confidence_base, is_active, created_at, updated_at)
      VALUES (${index + 1}, '${group.groupName}', '${group.primaryKeyword}', '${synonymsJson}', '${group.category}', ${group.confidenceBase}, ${group.isActive}, NOW(), NOW())
      ON CONFLICT (group_name) DO UPDATE SET
        primary_keyword = EXCLUDED.primary_keyword,
        synonyms = EXCLUDED.synonyms,
        category = EXCLUDED.category,
        confidence_base = EXCLUDED.confidence_base,
        is_active = EXCLUDED.is_active,
        updated_at = NOW();
    `);
  });

  return insertSQL.join('\\n');
}

function generateTagsMasterSQL() {
  const insertSQL = [];

  INITIAL_DATA.tagsMaster.forEach((tag, index) => {
    insertSQL.push(`
      INSERT INTO tags_master (id, tag_name, tag_description, category, is_active, created_at, updated_at)
      VALUES (${index + 1}, '${tag.tagName}', '${tag.tagDescription || ''}', '${tag.category}', ${tag.isActive}, NOW(), NOW())
      ON CONFLICT (tag_name) DO UPDATE SET
        tag_description = EXCLUDED.tag_description,
        category = EXCLUDED.category,
        is_active = EXCLUDED.is_active,
        updated_at = NOW();
    `);
  });

  return insertSQL.join('\\n');
}

function generateKeywordTagMappingsSQL() {
  const insertSQL = [];

  INITIAL_DATA.keywordTagMappings.forEach((mapping, index) => {
    insertSQL.push(`
      INSERT INTO keyword_tag_mappings (id, keyword_group_id, tag_id, confidence_score, priority, context_rules, is_active, usage_count, created_at, updated_at)
      SELECT ${index + 1}, kg.id, tm.id, ${mapping.confidenceScore}, ${mapping.priority}, NULL, TRUE, 0, NOW(), NOW()
      FROM keyword_groups kg, tags_master tm
      WHERE kg.group_name = '${mapping.keywordGroupName}' AND tm.tag_name = '${mapping.tagName}'
      ON CONFLICT DO NOTHING;
    `);
  });

  return insertSQL.join('\\n');
}

function generateTagAccountMappingsSQL() {
  const insertSQL = [];

  INITIAL_DATA.tagAccountMappings.forEach((mapping, index) => {
    const conditionJson = mapping.mappingCondition
      ? JSON.stringify(mapping.mappingCondition)
      : 'NULL';
    insertSQL.push(`
      INSERT INTO tag_account_mappings (id, tag_id, account_code, account_name, mapping_condition, is_default, priority, confidence_boost, created_at, updated_at)
      SELECT ${index + 1}, tm.id, '${mapping.accountCode}', '${mapping.accountName}', ${conditionJson === 'NULL' ? 'NULL' : "'" + conditionJson + "'"}, ${mapping.isDefault}, ${mapping.priority}, ${mapping.confidenceBoost}, NOW(), NOW()
      FROM tags_master tm
      WHERE tm.tag_name = '${mapping.tagName}'
      ON CONFLICT DO NOTHING;
    `);
  });

  return insertSQL.join('\\n');
}

// 메인 실행 함수
function generateSeedingSQL() {
  const sqlContent = `
-- ============================================================================
-- Keyword System Initial Data Seeding Script
-- Generated on: ${new Date().toISOString()}
-- ============================================================================

-- 시퀀스 리셋
SELECT setval('keyword_groups_id_seq', 1, false);
SELECT setval('tags_master_id_seq', 1, false);
SELECT setval('keyword_tag_mappings_id_seq', 1, false);
SELECT setval('tag_account_mappings_id_seq', 1, false);

-- 1. 키워드 그룹 데이터 삽입
${generateKeywordGroupsSQL()}

-- 2. 태그 마스터 데이터 삽입
${generateTagsMasterSQL()}

-- 3. 키워드-태그 매핑 데이터 삽입
${generateKeywordTagMappingsSQL()}

-- 4. 태그-계정과목 매핑 데이터 삽입
${generateTagAccountMappingsSQL()}

-- 5. 통계 업데이트
UPDATE keyword_groups SET updated_at = NOW();
UPDATE tags_master SET updated_at = NOW();

-- 6. 확인 쿼리
SELECT 'Keyword Groups' as table_name, COUNT(*) as count FROM keyword_groups WHERE is_active = TRUE
UNION ALL
SELECT 'Tags Master' as table_name, COUNT(*) as count FROM tags_master WHERE is_active = TRUE  
UNION ALL
SELECT 'Keyword-Tag Mappings' as table_name, COUNT(*) as count FROM keyword_tag_mappings WHERE is_active = TRUE
UNION ALL
SELECT 'Tag-Account Mappings' as table_name, COUNT(*) as count FROM tag_account_mappings;

COMMIT;
`;

  return sqlContent;
}

// JSON 파일로 테스트 케이스 저장
function saveTestCases() {
  const testCasesPath = path.join(__dirname, 'keyword-system-test-cases.json');
  fs.writeFileSync(
    testCasesPath,
    JSON.stringify(INITIAL_DATA.testCases, null, 2)
  );
  console.log(`✅ 테스트 케이스 저장됨: ${testCasesPath}`);
}

// 메인 실행
function main() {
  try {
    console.log('🚀 키워드 시스템 데이터 시딩 시작...');

    // SQL 파일 생성
    const sqlContent = generateSeedingSQL();
    const sqlPath = path.join(__dirname, 'keyword-system-seed-data.sql');
    fs.writeFileSync(sqlPath, sqlContent);
    console.log(`✅ SQL 시딩 파일 생성됨: ${sqlPath}`);

    // 테스트 케이스 저장
    saveTestCases();

    // 요약 출력
    console.log('\\n📊 생성된 데이터 요약:');
    console.log(`- 키워드 그룹: ${INITIAL_DATA.keywordGroups.length}개`);
    console.log(`- 태그 마스터: ${INITIAL_DATA.tagsMaster.length}개`);
    console.log(
      `- 키워드-태그 매핑: ${INITIAL_DATA.keywordTagMappings.length}개`
    );
    console.log(
      `- 태그-계정 매핑: ${INITIAL_DATA.tagAccountMappings.length}개`
    );
    console.log(
      `- 테스트 케이스: ${INITIAL_DATA.testCases.reduce((sum, suite) => sum + suite.cases.length, 0)}개`
    );

    console.log('\\n🎯 다음 단계:');
    console.log('1. PostgreSQL에서 생성된 SQL 파일 실행');
    console.log('2. 백엔드 서버 재시작');
    console.log('3. 프론트엔드에서 키워드 패턴 관리 페이지 테스트');
    console.log('4. API 엔드포인트 테스트');
  } catch (error) {
    console.error('❌ 데이터 시딩 실패:', error);
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  main();
}

module.exports = {
  INITIAL_DATA,
  generateSeedingSQL,
  generateKeywordGroupsSQL,
  generateTagsMasterSQL,
  generateKeywordTagMappingsSQL,
  generateTagAccountMappingsSQL,
};
