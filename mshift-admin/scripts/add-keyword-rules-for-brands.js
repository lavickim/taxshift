const { PrismaClient } = require('../lib/generated/prisma');

const prisma = new PrismaClient();

// 새로운 키워드 그룹과 태그 매핑 데이터
const keywordRulesData = [
  // Phase 1: High-Impact Quick Wins (커피/치킨/패스트푸드/피자)

  // 1. 커피 전문점 브랜드 확장
  {
    groupName: '커피전문점_브랜드',
    primaryKeyword: '커피',
    synonyms: [
      '빽다방',
      '이디야',
      '투썸플레이스',
      '탐앤탐스',
      '커피빈앤티리프',
      '할리스',
      '엔젤리너스',
      '그라찌에',
      '요거프레소',
      '더카페',
      '요거베리',
      '매머드커피',
      '더리터',
      '카페베네',
      '커피숍',
      '커피전문점',
      '커피하우스',
      '드롭탑',
    ],
    category: '커피전문점',
    confidenceBase: 0.95,
    tagName: '커피전문점',
    accountCode: '603',
    accountName: '지급수수료',
  },

  // 2. 치킨 프랜차이즈 확장
  {
    groupName: '치킨전문점_브랜드',
    primaryKeyword: '치킨',
    synonyms: [
      '굽네치킨',
      '교촌치킨',
      '네네치킨',
      '처갓집양념치킨',
      'BBQ',
      '치킨마니아',
      '노랑통닭',
      '호식이두마리치킨',
      '반반무마니',
      '허니콤보',
      '치킨플러스',
      '멕시카나',
      '페리카나',
      '통닭',
      '닭강정',
      '양념치킨',
      '후라이드치킨',
      '찜닭',
      '닭볶음탕',
      '치킨집',
      '통닭집',
    ],
    category: '치킨전문점',
    confidenceBase: 0.93,
    tagName: '치킨전문점',
    accountCode: '603',
    accountName: '지급수수료',
  },

  // 3. 패스트푸드 확장
  {
    groupName: '패스트푸드_브랜드',
    primaryKeyword: '햄버거',
    synonyms: [
      '맘스터치',
      '이삭토스트',
      '파파이스',
      '크리스피크림',
      '던킨도너츠',
      '배스킨라빈스',
      '버거킹',
      '롯데리아',
      'KFC',
      '서브웨이',
      '버거',
      '핫도그',
      '샌드위치',
      '토스트',
      '와플',
    ],
    category: '패스트푸드',
    confidenceBase: 0.92,
    tagName: '패스트푸드',
    accountCode: '603',
    accountName: '지급수수료',
  },

  // 4. 피자 브랜드 확장
  {
    groupName: '피자전문점_브랜드',
    primaryKeyword: '피자',
    synonyms: [
      '피자헛',
      '도미노피자',
      '파파존스',
      '미스터피자',
      '청년피자',
      '피자스쿨',
      '피자에땅',
      '7번가피자',
      '반올림피자',
      '알볼로피자',
      '고고피자',
      '피자마루',
    ],
    category: '피자전문점',
    confidenceBase: 0.94,
    tagName: '피자전문점',
    accountCode: '603',
    accountName: '지급수수료',
  },

  // Phase 2: Volume Categories (분식/한식/제과제빵)

  // 5. 분식 전문점 (527개 브랜드, 현재 1.5% 태깅률)
  {
    groupName: '분식전문점',
    primaryKeyword: '떡볶이',
    synonyms: [
      '신전떡볶이',
      '엽기떡볶이',
      '청년다방',
      '김밥천국',
      '충무김밥',
      '마약김밥',
      '김밥',
      '분식집',
      '어묵',
      '순대',
      '만두',
      '라면',
      '냉면',
      '칼국수',
      '국수',
      '잔치국수',
      '비빔국수',
      '멸치국수',
      '분식',
      '떡볶이집',
    ],
    category: '분식전문점',
    confidenceBase: 0.9,
    tagName: '분식전문점',
    accountCode: '603',
    accountName: '지급수수료',
  },

  // 6. 한식 전문점 (3,435개 브랜드, 현재 0.38% 태깅률)
  {
    groupName: '한식전문점_갈비고기',
    primaryKeyword: '갈비',
    synonyms: [
      '갈비집',
      '삼겹살',
      '고기집',
      '불고기',
      '생갈비',
      '양념갈비',
      '소갈비',
      '돼지갈비',
      '구이',
      '고깃집',
      '숯불갈비',
      '왕갈비',
      'LA갈비',
    ],
    category: '한식전문점',
    confidenceBase: 0.88,
    tagName: '한식전문점',
    accountCode: '603',
    accountName: '지급수수료',
  },

  {
    groupName: '한식전문점_국탕찌개',
    primaryKeyword: '국밥',
    synonyms: [
      '해장국',
      '김치찌개',
      '된장찌개',
      '부대찌개',
      '순두부찌개',
      '갈비탕',
      '설렁탕',
      '육개장',
      '콩나물국밥',
      '순대국밥',
      '돼지국밥',
      '뼈해장국',
      '감자탕',
      '추어탕',
    ],
    category: '한식전문점',
    confidenceBase: 0.87,
    tagName: '한식전문점',
    accountCode: '603',
    accountName: '지급수수료',
  },

  {
    groupName: '한식전문점_정식도시락',
    primaryKeyword: '한정식',
    synonyms: [
      '백반',
      '정식',
      '본죽',
      '죽집',
      '한솥도시락',
      '도시락',
      '컵밥',
      '밥버거',
      '덮밥',
      '비빔밥',
      '돌솥비빔밥',
      '한식뷔페',
      '한식집',
    ],
    category: '한식전문점',
    confidenceBase: 0.86,
    tagName: '한식전문점',
    accountCode: '603',
    accountName: '지급수수료',
  },

  {
    groupName: '한식전문점_족발보쌈',
    primaryKeyword: '족발',
    synonyms: [
      '보쌈',
      '순대',
      '곱창',
      '막창',
      '황소곱창',
      '원조할머니보쌈',
      '족발보쌈',
      '족발집',
      '보쌈집',
      '곱창집',
      '막창집',
      '대창',
      '양곱창',
    ],
    category: '한식전문점',
    confidenceBase: 0.89,
    tagName: '한식전문점',
    accountCode: '603',
    accountName: '지급수수료',
  },

  // 7. 제과제빵 (269개 브랜드, 현재 16% 태깅률)
  {
    groupName: '제과제빵_베이커리',
    primaryKeyword: '베이커리',
    synonyms: [
      '파리바게뜨',
      '뚜레쥬르',
      '파리크라상',
      '성심당',
      '삼립호빵',
      '크리스피크림',
      '제과점',
      '빵집',
      '케이크',
      '도넛',
      '크로와상',
      '마카롱',
      '파이',
      '베이킹',
      '크로플',
      '와플',
      '타르트',
      '쿠키',
      '머핀',
      '스콘',
      '브레드',
    ],
    category: '제과제빵',
    confidenceBase: 0.91,
    tagName: '제과제빵',
    accountCode: '603',
    accountName: '지급수수료',
  },

  // Phase 3: Service Categories (이미용/편의점/헬스)

  // 8. 이미용 서비스 (274개 브랜드, 현재 32% 태깅률)
  {
    groupName: '이미용_헤어샵',
    primaryKeyword: '헤어샵',
    synonyms: [
      '준오헤어',
      '이가자헤어비스',
      '차홍헤어',
      '박승철헤어스튜디오',
      '영구헤어',
      '미용실',
      '이발소',
      '헤어살롱',
      '헤어',
      '미용',
      '이발',
    ],
    category: '이미용',
    confidenceBase: 0.85,
    tagName: '이미용',
    accountCode: '603',
    accountName: '지급수수료',
  },

  {
    groupName: '이미용_네일피부',
    primaryKeyword: '네일샵',
    synonyms: [
      '피부관리실',
      '마사지',
      '네일',
      '왁싱',
      '피부',
      '에스테틱',
      '태닝',
      '속눈썹연장',
      '피부관리',
      '네일아트',
      '젤네일',
      '페디큐어',
      '매니큐어',
    ],
    category: '이미용',
    confidenceBase: 0.84,
    tagName: '이미용',
    accountCode: '603',
    accountName: '지급수수료',
  },

  // 9. 국수/면 전문점
  {
    groupName: '국수면전문점',
    primaryKeyword: '국수',
    synonyms: [
      '냉면',
      '우동',
      '라멘',
      '소바',
      '쌀국수',
      '짜장면',
      '짬뽕',
      '탕수육',
      '중국집',
      '중식당',
      '면요리',
      '국수집',
      '냉면집',
      '우동집',
    ],
    category: '국수면전문점',
    confidenceBase: 0.87,
    tagName: '국수면전문점',
    accountCode: '603',
    accountName: '지급수수료',
  },

  // 10. 디저트카페
  {
    groupName: '디저트카페',
    primaryKeyword: '빙수',
    synonyms: [
      '아이스크림',
      '케이크',
      '마카롱',
      '타르트',
      '디저트카페',
      '빙수전문점',
      '아이스크림전문점',
      '젤라또',
      '요거트아이스크림',
      '소프트아이스크림',
    ],
    category: '디저트카페',
    confidenceBase: 0.88,
    tagName: '디저트카페',
    accountCode: '603',
    accountName: '지급수수료',
  },
];

async function addKeywordRules() {
  console.log('🚀 키워드 룰 추가 시작...');

  let addedGroups = 0;
  let addedMappings = 0;
  let addedAccountMappings = 0;

  for (const rule of keywordRulesData) {
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
            colorHex: '#3B82F6',
            iconName: 'store',
            displayOrder: 100,
            isActive: true,
          },
        });
        console.log(`  ✅ 새 태그 생성: ${rule.tagName} (ID: ${tag.id})`);
      } else {
        console.log(`  ♻️  기존 태그 사용: ${rule.tagName} (ID: ${tag.id})`);
      }

      // 2. 키워드 그룹 생성
      const keywordGroup = await prisma.keywordGroup.create({
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

      // 3. 키워드-태그 매핑 생성
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

      // 4. 태그-계정과목 매핑 생성
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

  console.log(`\n🎉 키워드 룰 추가 완료!`);
  console.log(`📈 추가된 키워드 그룹: ${addedGroups}개`);
  console.log(`📈 추가된 키워드-태그 매핑: ${addedMappings}개`);
  console.log(`📈 추가된 태그-계정과목 매핑: ${addedAccountMappings}개`);

  // 현재 상태 확인
  const totalGroups = await prisma.keywordGroup.count({
    where: { isActive: true },
  });
  const totalMappings = await prisma.keywordTagMapping.count({
    where: { isActive: true },
  });

  console.log(`\n📊 현재 시스템 상태:`);
  console.log(`   총 활성 키워드 그룹: ${totalGroups}개`);
  console.log(`   총 활성 키워드-태그 매핑: ${totalMappings}개`);
}

async function main() {
  try {
    await addKeywordRules();
  } catch (error) {
    console.error('전체 프로세스 오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
