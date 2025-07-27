const { PrismaClient } = require('../lib/generated/prisma');

const prisma = new PrismaClient();

/**
 * 태그-계정과목 매핑 완성 시스템
 * 새로 생성된 키워드 그룹들에 대한 태그 및 계정과목 매핑 완료
 */

const JAVA_API_BASE_URL =
  process.env.JAVA_API_BASE_URL || 'http://localhost:8080';

// 필요한 태그들 정의
const REQUIRED_TAGS = [
  {
    id: 70,
    tagName: '한식냉면전문점',
    description: '냉면, 물냉면, 비빔냉면 전문점',
    tagCategory: '음식점',
    colorHex: '#8B4513',
    iconName: 'utensils',
  },
  {
    id: 71,
    tagName: '한식갈비전문점',
    description: '갈비, 생갈비, 양념갈비 전문점',
    tagCategory: '음식점',
    colorHex: '#CD853F',
    iconName: 'utensils',
  },
  {
    id: 72,
    tagName: '한식곱창전문점',
    description: '곱창, 막창, 대창 전문점',
    tagCategory: '음식점',
    colorHex: '#A0522D',
    iconName: 'utensils',
  },
  {
    id: 73,
    tagName: '피자전문점개선',
    description: '피자 전문점 (개선된 분류)',
    tagCategory: '음식점',
    colorHex: '#FF6347',
    iconName: 'pizza-slice',
  },
  {
    id: 74,
    tagName: '치킨전문점개선',
    description: '치킨, 닭강정 전문점 (개선된 분류)',
    tagCategory: '음식점',
    colorHex: '#FFA500',
    iconName: 'drumstick-bite',
  },
  {
    id: 75,
    tagName: '커피전문점개선',
    description: '커피, 카페 전문점 (개선된 분류)',
    tagCategory: '음식점',
    colorHex: '#8B4513',
    iconName: 'coffee',
  },
  {
    id: 76,
    tagName: '일식전문점개선',
    description: '일식, 사시미, 우동 전문점 (개선된 분류)',
    tagCategory: '음식점',
    colorHex: '#DC143C',
    iconName: 'fish',
  },
  {
    id: 77,
    tagName: '이미용서비스개선',
    description: '헤어샵, 미용실 (개선된 분류)',
    tagCategory: '생활서비스',
    colorHex: '#FF69B4',
    iconName: 'cut',
  },
];

// 키워드 그룹과 태그 매핑 정의
const KEYWORD_TAG_MAPPINGS = [
  // 냉면 전문점
  { keywordPattern: '냉면', tagId: 70, confidenceScore: 0.9, priority: 1 },
  { keywordPattern: '설악냉면', tagId: 70, confidenceScore: 0.95, priority: 1 },

  // 갈비 전문점
  { keywordPattern: '갈비', tagId: 71, confidenceScore: 0.88, priority: 1 },
  { keywordPattern: '이우갈비', tagId: 71, confidenceScore: 0.95, priority: 1 },

  // 곱창 전문점
  { keywordPattern: '곱창', tagId: 72, confidenceScore: 0.85, priority: 1 },
  {
    keywordPattern: '뿅가야채곱창',
    tagId: 72,
    confidenceScore: 0.95,
    priority: 1,
  },
  {
    keywordPattern: '뿔난황소곱창',
    tagId: 72,
    confidenceScore: 0.95,
    priority: 1,
  },

  // 피자 전문점
  { keywordPattern: '피자', tagId: 73, confidenceScore: 0.92, priority: 1 },
  { keywordPattern: '선녀피자', tagId: 73, confidenceScore: 0.95, priority: 1 },

  // 치킨 전문점
  { keywordPattern: '치킨', tagId: 74, confidenceScore: 0.85, priority: 1 },
  { keywordPattern: '닭강정', tagId: 74, confidenceScore: 0.88, priority: 1 },
  {
    keywordPattern: '허갈닭강정',
    tagId: 74,
    confidenceScore: 0.95,
    priority: 1,
  },
  { keywordPattern: '부자치킨', tagId: 74, confidenceScore: 0.95, priority: 1 },

  // 커피 전문점
  { keywordPattern: '커피', tagId: 75, confidenceScore: 0.9, priority: 1 },
  {
    keywordPattern: '빅피처커피',
    tagId: 75,
    confidenceScore: 0.95,
    priority: 1,
  },

  // 일식 전문점
  { keywordPattern: '일식', tagId: 76, confidenceScore: 0.8, priority: 1 },
  { keywordPattern: '만게츠', tagId: 76, confidenceScore: 0.95, priority: 1 },
  { keywordPattern: '사케', tagId: 76, confidenceScore: 0.85, priority: 2 },

  // 이미용 서비스
  { keywordPattern: '헤어', tagId: 77, confidenceScore: 0.85, priority: 1 },
  {
    keywordPattern: 'After Glow',
    tagId: 77,
    confidenceScore: 0.95,
    priority: 1,
  },
];

// 태그-계정과목 매핑 정의
const TAG_ACCOUNT_MAPPINGS = [
  // 음식점 태그들 - 기본 접대비
  {
    tagId: 70,
    accountCode: '651',
    accountName: '접대비',
    isDefault: true,
    priority: 1,
  },
  {
    tagId: 71,
    accountCode: '651',
    accountName: '접대비',
    isDefault: true,
    priority: 1,
  },
  {
    tagId: 72,
    accountCode: '651',
    accountName: '접대비',
    isDefault: true,
    priority: 1,
  },
  {
    tagId: 73,
    accountCode: '651',
    accountName: '접대비',
    isDefault: true,
    priority: 1,
  },
  {
    tagId: 74,
    accountCode: '651',
    accountName: '접대비',
    isDefault: true,
    priority: 1,
  },
  {
    tagId: 75,
    accountCode: '651',
    accountName: '접대비',
    isDefault: true,
    priority: 1,
  },
  {
    tagId: 76,
    accountCode: '651',
    accountName: '접대비',
    isDefault: true,
    priority: 1,
  },

  // 이미용 서비스 - 사무용품비
  {
    tagId: 77,
    accountCode: '634',
    accountName: '사무용품비',
    isDefault: true,
    priority: 1,
  },

  // 조건부 매핑들 - 야근식대 (심야시간대)
  {
    tagId: 70,
    accountCode: '655',
    accountName: '야근식대',
    isDefault: false,
    priority: 2,
    mappingCondition: JSON.stringify({
      timeRange: '22:00-06:00',
      amountMax: 30000,
    }),
  },
  {
    tagId: 71,
    accountCode: '655',
    accountName: '야근식대',
    isDefault: false,
    priority: 2,
    mappingCondition: JSON.stringify({
      timeRange: '22:00-06:00',
      amountMax: 50000,
    }),
  },
  {
    tagId: 74,
    accountCode: '655',
    accountName: '야근식대',
    isDefault: false,
    priority: 2,
    mappingCondition: JSON.stringify({
      timeRange: '22:00-06:00',
      amountMax: 40000,
    }),
  },
  {
    tagId: 75,
    accountCode: '655',
    accountName: '야근식대',
    isDefault: false,
    priority: 3,
    mappingCondition: JSON.stringify({
      timeRange: '22:00-06:00',
      amountMax: 15000,
    }),
  },

  // 조건부 매핑들 - 복리후생비 (주말 고액)
  {
    tagId: 71,
    accountCode: '653',
    accountName: '복리후생비',
    isDefault: false,
    priority: 3,
    mappingCondition: JSON.stringify({
      dayOfWeek: 'weekend',
      amountMin: 80000,
    }),
  },
  {
    tagId: 73,
    accountCode: '653',
    accountName: '복리후생비',
    isDefault: false,
    priority: 3,
    mappingCondition: JSON.stringify({
      dayOfWeek: 'weekend',
      amountMin: 60000,
    }),
  },
];

// 태그 생성
async function createTags() {
  console.log('\n📋 필요한 태그들 생성 중...');

  let successCount = 0;
  let skipCount = 0;

  for (const tag of REQUIRED_TAGS) {
    try {
      await prisma.tagsMaster.upsert({
        where: { tagName: tag.tagName },
        update: {
          description: tag.description,
          tagCategory: tag.tagCategory,
          colorHex: tag.colorHex,
          iconName: tag.iconName,
          isActive: true,
        },
        create: {
          id: tag.id,
          tagName: tag.tagName,
          description: tag.description,
          tagCategory: tag.tagCategory,
          colorHex: tag.colorHex,
          iconName: tag.iconName,
          isActive: true,
          createdAt: new Date(),
        },
      });

      console.log(`   ✓ ${tag.tagName} 생성/업데이트 완료`);
      successCount++;
    } catch (error) {
      console.log(`   ⚠️ ${tag.tagName} 스킵 (기존 존재): ${error.message}`);
      skipCount++;
    }
  }

  console.log(
    `\n📊 태그 생성 결과: 성공 ${successCount}개, 스킵 ${skipCount}개`
  );
  return successCount;
}

// 키워드-태그 매핑 생성
async function createKeywordTagMappings() {
  console.log('\n🔗 키워드-태그 매핑 생성 중...');

  let successCount = 0;

  // 먼저 생성된 키워드 그룹들을 조회
  const keywordGroups = await prisma.keywordGroup.findMany({
    where: {
      groupName: {
        contains: '그룹',
      },
    },
  });

  console.log(`   📋 발견된 키워드 그룹: ${keywordGroups.length}개`);

  for (const mapping of KEYWORD_TAG_MAPPINGS) {
    // 매핑에 해당하는 키워드 그룹 찾기
    const matchingGroups = keywordGroups.filter(
      group =>
        group.primaryKeyword.includes(mapping.keywordPattern) ||
        group.synonyms.some(synonym =>
          synonym.includes(mapping.keywordPattern)
        ) ||
        group.groupName.includes(mapping.keywordPattern)
    );

    for (const group of matchingGroups) {
      try {
        await prisma.keywordTagMapping.create({
          data: {
            keywordGroupId: group.id,
            tagId: mapping.tagId,
            confidenceScore: mapping.confidenceScore,
            priority: mapping.priority,
            isActive: true,
            createdAt: new Date(),
          },
        });

        console.log(
          `   ✓ ${group.groupName} → 태그 ${mapping.tagId} 매핑 완료`
        );
        successCount++;
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(
            `   ⚠️ ${group.groupName} → 태그 ${mapping.tagId} 이미 존재`
          );
        } else {
          console.log(
            `   ❌ ${group.groupName} → 태그 ${mapping.tagId} 실패: ${error.message}`
          );
        }
      }
    }
  }

  console.log(`\n📊 키워드-태그 매핑 결과: 성공 ${successCount}개`);
  return successCount;
}

// 태그-계정과목 매핑 생성
async function createTagAccountMappings() {
  console.log('\n💰 태그-계정과목 매핑 생성 중...');

  let successCount = 0;

  for (const mapping of TAG_ACCOUNT_MAPPINGS) {
    try {
      await prisma.tagAccountMapping.create({
        data: {
          tagId: mapping.tagId,
          accountCode: mapping.accountCode,
          accountName: mapping.accountName,
          isDefault: mapping.isDefault,
          priority: mapping.priority,
          mappingCondition: mapping.mappingCondition || null,
          createdAt: new Date(),
        },
      });

      const conditionText = mapping.mappingCondition ? ' (조건부)' : ' (기본)';
      console.log(
        `   ✓ 태그 ${mapping.tagId} → ${mapping.accountCode} ${mapping.accountName}${conditionText}`
      );
      successCount++;
    } catch (error) {
      if (error.code === 'P2002') {
        console.log(
          `   ⚠️ 태그 ${mapping.tagId} → ${mapping.accountCode} 이미 존재`
        );
      } else {
        console.log(
          `   ❌ 태그 ${mapping.tagId} → ${mapping.accountCode} 실패: ${error.message}`
        );
      }
    }
  }

  console.log(`\n📊 태그-계정과목 매핑 결과: 성공 ${successCount}개`);
  return successCount;
}

// 백엔드 캐시 새로고침
async function refreshBackendCache() {
  console.log('\n🔄 백엔드 캐시 새로고침...');

  try {
    const response = await fetch(
      `${JAVA_API_BASE_URL}/v2/tag-mapping-mgmt/refresh-cache`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (response.ok) {
      const result = await response.text();
      console.log(`   ✅ 캐시 새로고침 성공: ${result}`);
      return true;
    } else {
      console.log(`   ❌ 캐시 새로고침 실패: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ 캐시 새로고침 오류: ${error.message}`);
    return false;
  }
}

// 메인 실행 함수
async function executeCompleteTagAccountMappings() {
  console.log('🎯 태그-계정과목 매핑 완성 시작');
  console.log('=====================================\n');

  try {
    // 1. 필요한 태그들 생성
    const tagCount = await createTags();

    // 2. 키워드-태그 매핑 생성
    const mappingCount = await createKeywordTagMappings();

    // 3. 태그-계정과목 매핑 생성
    const accountMappingCount = await createTagAccountMappings();

    // 4. 백엔드 캐시 새로고침
    const cacheRefreshed = await refreshBackendCache();

    // 5. 결과 요약
    console.log('\n🎉 태그-계정과목 매핑 완성!');
    console.log(`📊 완성 결과:`);
    console.log(`   - 생성된 태그: ${tagCount}개`);
    console.log(`   - 키워드-태그 매핑: ${mappingCount}개`);
    console.log(`   - 태그-계정과목 매핑: ${accountMappingCount}개`);
    console.log(`   - 캐시 새로고침: ${cacheRefreshed ? '성공' : '실패'}`);

    if (cacheRefreshed) {
      console.log('\n✨ 백엔드 키워드 시스템이 완전히 업데이트되었습니다!');
      console.log(
        '🧪 이제 브랜드 테스트에서 태그와 계정과목이 정상적으로 나올 것입니다.'
      );
    }

    return {
      tagCount,
      mappingCount,
      accountMappingCount,
      cacheRefreshed,
    };
  } catch (error) {
    console.error('❌ 실행 중 오류 발생:', error);
    throw error;
  }
}

async function main() {
  try {
    const result = await executeCompleteTagAccountMappings();
    console.log('\n📋 최종 결과:', result);
  } catch (error) {
    console.error('💥 실행 실패:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
