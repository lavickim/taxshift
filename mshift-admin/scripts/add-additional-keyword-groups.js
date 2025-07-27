const { PrismaClient } = require('../lib/generated/prisma');

const prisma = new PrismaClient();

// 추가 키워드 그룹 데이터 - 실패 분석 결과 기반
const additionalKeywordGroups = [
  // 1. 편의점/마트 (누락된 주요 카테고리)
  {
    groupName: '편의점_마트',
    primaryKeyword: '편의점',
    synonyms: [
      'GS25',
      '세븐일레븐',
      'CU',
      '미니스톱',
      '이마트24',
      '바이더웨이',
      '와우편의점',
      '압구정편의점',
      '마트',
      '슈퍼마켓',
      '슈퍼',
      '마트24',
      '이마트',
      '롯데마트',
      '홈플러스',
    ],
    category: '편의점',
    confidenceBase: 0.96,
    tagName: '편의점',
    accountCode: '603',
    accountName: '지급수수료',
  },

  // 2. 주유소/에너지 (높은 빈도 카테고리)
  {
    groupName: '주유소_에너지',
    primaryKeyword: '주유소',
    synonyms: [
      'SK에너지',
      'GS칼텍스',
      'S-Oil',
      '현대오일뱅크',
      '알뜰주유소',
      '셀프주유소',
      '에너지',
      '석유',
      '가스충전소',
      '주유',
      '기름',
      '연료',
    ],
    category: '주유소',
    confidenceBase: 0.95,
    tagName: '주유소',
    accountCode: '603',
    accountName: '지급수수료',
  },

  // 3. 헬스/체육 (서비스업 세분화)
  {
    groupName: '헬스_체육시설',
    primaryKeyword: '헬스장',
    synonyms: [
      'GYM',
      '체육관',
      '피트니스',
      '헬스클럽',
      '요가',
      '필라테스',
      '복싱',
      '태권도',
      '수영장',
      '골프연습장',
      '스포츠센터',
      '운동',
      'Gym',
      'FITNESS',
    ],
    category: '스포츠',
    confidenceBase: 0.93,
    tagName: '스포츠시설',
    accountCode: '603',
    accountName: '지급수수료',
  },

  // 4. 뷰티/미용 세분화 (기존보다 더 구체적)
  {
    groupName: '뷰티_화장품전문점',
    primaryKeyword: '뷰티샵',
    synonyms: [
      '뷰티',
      '화장품',
      '코스메틱',
      '올리브영',
      '롭스',
      '아리따움',
      '에뛰드하우스',
      '더페이스샵',
      '토니앤가이',
      '뷰티플렉스',
      '스킨푸드',
      '왁싱샵',
      '속눈썹연장',
    ],
    category: '뷰티',
    confidenceBase: 0.92,
    tagName: '뷰티샵',
    accountCode: '603',
    accountName: '지급수수료',
  },

  // 5. 디저트/아이스크림 전문점 (외식 세분화)
  {
    groupName: '디저트_아이스크림전문점',
    primaryKeyword: '디저트',
    synonyms: [
      '아이스크림',
      '디저트39',
      '디저트일구',
      '젤라또',
      '요거트아이스크림',
      '소프트아이스크림',
      '빙수',
      '팥빙수',
      '설빙',
      '술빙',
      '디저트카페',
      '달콤한',
    ],
    category: '디저트전문점',
    confidenceBase: 0.9,
    tagName: '디저트전문점',
    accountCode: '603',
    accountName: '지급수수료',
  },

  // 6. 특별 빵집/베이커리 (베이커리 확장)
  {
    groupName: '특별빵집_베이커리',
    primaryKeyword: '십원빵',
    synonyms: [
      '십원빵',
      '빵명장',
      '식빵언니',
      '육대빵',
      '단팥빵',
      '호빵',
      '붕어빵',
      '찐빵',
      '앙금빵',
      '크림빵',
      '소보로빵',
      '메론빵',
      '카스테라',
    ],
    category: '제과제빵',
    confidenceBase: 0.91,
    tagName: '제과제빵',
    accountCode: '603',
    accountName: '지급수수료',
  },

  // 7. 버거/햄버거 전문점 (패스트푸드 세분화)
  {
    groupName: '버거_햄버거전문점',
    primaryKeyword: '버거',
    synonyms: [
      'burger',
      'BURGER',
      '햄버거',
      '버거킹',
      '맥도널드',
      '롯데리아',
      '맘스터치',
      'GTS BURGER',
      '버거미',
      '수제버거',
      '프리미엄버거',
    ],
    category: '패스트푸드',
    confidenceBase: 0.94,
    tagName: '패스트푸드',
    accountCode: '603',
    accountName: '지급수수료',
  },

  // 8. 자동차 서비스 (서비스업 세분화)
  {
    groupName: '자동차_서비스',
    primaryKeyword: '카센터',
    synonyms: [
      '카센터',
      '정비소',
      '타이어',
      '세차장',
      '오토큐',
      '불스원',
      '자동차정비',
      '차량정비',
      '엔진오일',
      '브레이크',
      '배터리',
      '정비',
      '수리',
    ],
    category: '자동차서비스',
    confidenceBase: 0.9,
    tagName: '자동차서비스',
    accountCode: '603',
    accountName: '지급수수료',
  },

  // 9. 의료/약국 (서비스업 세분화)
  {
    groupName: '의료_약국',
    primaryKeyword: '약국',
    synonyms: [
      '온누리약국',
      '굿모닝약국',
      '참약국',
      '더약국',
      '우리약국',
      '행복한약국',
      '의원',
      '병원',
      '한의원',
      '치과',
      '피부과',
      '안과',
      '의료기관',
    ],
    category: '의료',
    confidenceBase: 0.95,
    tagName: '의료서비스',
    accountCode: '603',
    accountName: '지급수수료',
  },

  // 10. 배달/온라인서비스 (새로운 카테고리)
  {
    groupName: '배달_온라인서비스',
    primaryKeyword: '배달',
    synonyms: [
      '배달의민족',
      '요기요',
      '쿠팡이츠',
      '배달앱',
      '온라인주문',
      '딜리버리',
      '택배',
      '퀵서비스',
      '배송',
      '온라인쇼핑',
    ],
    category: '배달서비스',
    confidenceBase: 0.88,
    tagName: '배달서비스',
    accountCode: '603',
    accountName: '지급수수료',
  },
];

async function addAdditionalKeywordGroups() {
  console.log('🚀 추가 키워드 그룹 생성 시작...');
  console.log(`📊 총 ${additionalKeywordGroups.length}개 그룹 추가 예정`);

  let addedGroups = 0;
  let addedMappings = 0;
  let addedAccountMappings = 0;

  for (const rule of additionalKeywordGroups) {
    try {
      console.log(`\n📝 처리 중: ${rule.groupName} (${rule.primaryKeyword})`);

      // 1. 태그 찾기 또는 생성
      let tag = await prisma.tagsMaster.findFirst({
        where: { tagName: rule.tagName },
      });

      if (!tag) {
        tag = await prisma.tagsMaster.create({
          data: {
            tagName: rule.tagName,
            tagCategory: '상업시설',
            description: `${rule.tagName} 관련 업종`,
            colorHex: '#10B981',
            iconName: 'store',
            displayOrder: 100,
            isActive: true,
          },
        });
        console.log(`  ✅ 새 태그 생성: ${rule.tagName} (ID: ${tag.id})`);
      } else {
        console.log(`  ♻️  기존 태그 사용: ${rule.tagName} (ID: ${tag.id})`);
      }

      // 2. 키워드 그룹 생성 (중복 확인)
      const existingGroup = await prisma.keywordGroup.findFirst({
        where: { groupName: rule.groupName },
      });

      let keywordGroup;
      if (existingGroup) {
        console.log(
          `  ♻️  기존 키워드 그룹 사용: ${rule.groupName} (ID: ${existingGroup.id})`
        );
        keywordGroup = existingGroup;
      } else {
        keywordGroup = await prisma.keywordGroup.create({
          data: {
            groupName: rule.groupName,
            primaryKeyword: rule.primaryKeyword,
            synonyms: rule.synonyms,
            category: rule.category,
            confidenceBase: rule.confidenceBase,
            isActive: true,
          },
        });
        addedGroups++;
        console.log(
          `  ✅ 키워드 그룹 생성: ${rule.groupName} (ID: ${keywordGroup.id})`
        );
      }

      // 3. 키워드-태그 매핑 생성 (중복 확인)
      const existingMapping = await prisma.keywordTagMapping.findFirst({
        where: {
          keywordGroupId: keywordGroup.id,
          tagId: tag.id,
        },
      });

      if (!existingMapping) {
        const keywordTagMapping = await prisma.keywordTagMapping.create({
          data: {
            keywordGroupId: keywordGroup.id,
            tagId: tag.id,
            confidenceScore: rule.confidenceBase,
            priority: 100,
            usageCount: 0,
            isActive: true,
          },
        });
        addedMappings++;
        console.log(`  ✅ 키워드-태그 매핑 생성 (ID: ${keywordTagMapping.id})`);
      } else {
        console.log(`  ♻️  기존 키워드-태그 매핑 사용`);
      }

      // 4. 태그-계정과목 매핑 생성 (중복 확인)
      const existingAccountMapping = await prisma.tagAccountMapping.findFirst({
        where: {
          tagId: tag.id,
          accountCode: rule.accountCode,
        },
      });

      if (!existingAccountMapping) {
        const tagAccountMapping = await prisma.tagAccountMapping.create({
          data: {
            tagId: tag.id,
            accountCode: rule.accountCode,
            accountName: rule.accountName,
            isDefault: true,
            priority: 100,
            confidenceBoost: 0.05,
          },
        });
        addedAccountMappings++;
        console.log(
          `  ✅ 태그-계정과목 매핑 생성 (ID: ${tagAccountMapping.id})`
        );
      } else {
        console.log(`  ♻️  기존 계정과목 매핑 사용`);
      }

      console.log(`  📊 동의어 ${rule.synonyms.length}개 포함`);
    } catch (error) {
      console.error(`❌ ${rule.groupName} 처리 중 오류:`, error);
    }
  }

  console.log(`\n🎉 추가 키워드 그룹 생성 완료!`);
  console.log(`📈 새로 추가된 키워드 그룹: ${addedGroups}개`);
  console.log(`📈 새로 추가된 키워드-태그 매핑: ${addedMappings}개`);
  console.log(`📈 새로 추가된 태그-계정과목 매핑: ${addedAccountMappings}개`);

  // 현재 시스템 상태 확인
  const totalGroups = await prisma.keywordGroup.count({
    where: { isActive: true },
  });
  const totalMappings = await prisma.keywordTagMapping.count({
    where: { isActive: true },
  });

  console.log(`\n📊 현재 시스템 상태:`);
  console.log(`   총 활성 키워드 그룹: ${totalGroups}개`);
  console.log(`   총 활성 키워드-태그 매핑: ${totalMappings}개`);

  // 테스트 권장사항
  console.log(`\n🎯 다음 단계:`);
  console.log(`1. 백엔드 서버 재시작 (키워드 그룹 캐시 갱신)`);
  console.log(`2. 샘플 테스트 실행하여 개선 확인`);
  console.log(`3. 75% 목표 달성 시 전체 테스트 실행`);
}

async function main() {
  try {
    await addAdditionalKeywordGroups();
  } catch (error) {
    console.error('전체 프로세스 오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
