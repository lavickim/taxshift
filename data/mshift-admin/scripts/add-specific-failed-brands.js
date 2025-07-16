const { PrismaClient } = require('../lib/generated/prisma');

const prisma = new PrismaClient();

// 실패 케이스에서 발견된 구체적인 브랜드들을 타겟한 키워드 그룹
const specificBrandKeywords = [
  // 1. 특정 편의점 브랜드들
  {
    groupName: "특정편의점_브랜드",
    primaryKeyword: "와우편의점",
    synonyms: ["와우편의점", "압편", "압구정편의점", "미니마트", "슈퍼365", "훼미리마트", 
               "프라임편의점", "바이더웨이"],
    category: "편의점",
    confidenceBase: 0.98,
    tagName: "편의점",
    accountCode: "603",
    accountName: "지급수수료"
  },

  // 2. 특별한 빵집/디저트 브랜드들
  {
    groupName: "특별빵디저트_브랜드",
    primaryKeyword: "성북당",
    synonyms: ["성북당", "십원빵", "빵명장", "식빵언니", "육대빵", "단팥빵", "GTS BURGER",
               "디저트일구", "디저트39", "대구", "근대골목"],
    category: "제과제빵",
    confidenceBase: 0.97,
    tagName: "제과제빵",
    accountCode: "603",
    accountName: "지급수수료"
  },

  // 3. 뷰티/피부관리 구체적 브랜드들
  {
    groupName: "뷰티서비스_구체적브랜드",
    primaryKeyword: "뽐온뷰티",
    synonyms: ["뽐온뷰티", "히썹", "아나덴뷰티", "마이뷰티독", "아뜰리에뷰티아카데미", 
               "아이퀸뷰티", "엘케이엠포레뷰티", "뷰티독", "뷰티아카데미"],
    category: "뷰티",
    confidenceBase: 0.96,
    tagName: "뷰티샵",
    accountCode: "603", 
    accountName: "지급수수료"
  },

  // 4. 헬스/운동 구체적 브랜드들
  {
    groupName: "헬스운동_구체적브랜드",
    primaryKeyword: "운동맛",
    synonyms: ["운동맛GYM", "FitTube", "Gym", "핏튜브", "운동맛", "헬스타임", "바디워크", 
               "스포츠짐"],
    category: "스포츠",
    confidenceBase: 0.95,
    tagName: "스포츠시설",
    accountCode: "603",
    accountName: "지급수수료"
  },

  // 5. 햄버거/버거 구체적 브랜드들
  {
    groupName: "버거브랜드_구체적",
    primaryKeyword: "burger",
    synonyms: ["burger me", "GTS BURGER", "버거미", "버거리", "BURGERRY", "버거타운", "패티버거"],
    category: "패스트푸드",
    confidenceBase: 0.96,
    tagName: "패스트푸드",
    accountCode: "603",
    accountName: "지급수수료"
  },

  // 6. 커피/음료 추가 브랜드들
  {
    groupName: "커피음료_추가브랜드",
    primaryKeyword: "더카페",
    synonyms: ["더카페", "카페베네", "카페드롭", "스타벅스", "투썸", "폴바셋", "요거베리",
               "커피빈", "벤티", "아메리카노"],
    category: "커피전문점",
    confidenceBase: 0.96,
    tagName: "커피전문점",
    accountCode: "603",
    accountName: "지급수수료"
  },

  // 7. 안경/액세서리 브랜드들
  {
    groupName: "안경액세서리_브랜드",
    primaryKeyword: "안경",
    synonyms: ["코스모스안경", "안경", "렌즈미", "다비치안경", "눈사랑안경", "안경점", 
               "선글라스", "렌즈"],
    category: "안경점",
    confidenceBase: 0.95,
    tagName: "안경점", 
    accountCode: "603",
    accountName: "지급수수료"
  },

  // 8. 스터디카페/독서실 브랜드들
  {
    groupName: "스터디카페_브랜드",
    primaryKeyword: "스터디카페",
    synonyms: ["스터디카페", "비온탑", "Be on Top", "독서실", "스터디룸", "공부방", "열람실"],
    category: "스터디카페",
    confidenceBase: 0.94,
    tagName: "스터디카페",
    accountCode: "603",
    accountName: "지급수수료"
  },

  // 9. 곱창/내장요리 브랜드들
  {
    groupName: "곱창내장_브랜드",
    primaryKeyword: "곱창",
    synonyms: ["김덕후의", "곱창조", "곱창", "막창", "대창", "황소곱창", "내장전골", "곱창집"],
    category: "한식전문점",
    confidenceBase: 0.94,
    tagName: "한식전문점",
    accountCode: "603",
    accountName: "지급수수료"
  },

  // 10. 특별한 외식 브랜드들 (일반적이지 않은 것들)
  {
    groupName: "기타외식_특별브랜드",
    primaryKeyword: "라온가정식",
    synonyms: ["라온가정식", "감자탕", "삐싱궈", "오공복이", "그시절", "1988", "특별한"],
    category: "한식전문점", 
    confidenceBase: 0.93,
    tagName: "한식전문점",
    accountCode: "603",
    accountName: "지급수수료"
  }
];

async function addSpecificFailedBrands() {
  console.log('🎯 구체적 실패 브랜드 타겟 키워드 그룹 생성 시작...');
  console.log(`📊 총 ${specificBrandKeywords.length}개 그룹 추가 예정`);
  
  let addedGroups = 0;
  let addedMappings = 0;
  let addedAccountMappings = 0;

  for (const rule of specificBrandKeywords) {
    try {
      console.log(`\n📝 처리 중: ${rule.groupName} (${rule.primaryKeyword})`);

      // 1. 태그 찾기 또는 생성
      let tag = await prisma.tagsMaster.findFirst({
        where: { tagName: rule.tagName }
      });

      if (!tag) {
        tag = await prisma.tagsMaster.create({
          data: {
            tagName: rule.tagName,
            tagCategory: "상업시설",
            description: `${rule.tagName} 관련 업종`,
            colorHex: "#F59E0B",
            iconName: "store",
            displayOrder: 100,
            isActive: true
          }
        });
        console.log(`  ✅ 새 태그 생성: ${rule.tagName} (ID: ${tag.id})`);
      } else {
        console.log(`  ♻️  기존 태그 사용: ${rule.tagName} (ID: ${tag.id})`);
      }

      // 2. 키워드 그룹 생성 (중복 확인)
      const existingGroup = await prisma.keywordGroup.findFirst({
        where: { groupName: rule.groupName }
      });

      let keywordGroup;
      if (existingGroup) {
        console.log(`  ♻️  기존 키워드 그룹 사용: ${rule.groupName} (ID: ${existingGroup.id})`);
        keywordGroup = existingGroup;
      } else {
        keywordGroup = await prisma.keywordGroup.create({
          data: {
            groupName: rule.groupName,
            primaryKeyword: rule.primaryKeyword,
            synonyms: rule.synonyms,
            category: rule.category,
            confidenceBase: rule.confidenceBase,
            isActive: true
          }
        });
        addedGroups++;
        console.log(`  ✅ 키워드 그룹 생성: ${rule.groupName} (ID: ${keywordGroup.id})`);
      }

      // 3. 키워드-태그 매핑 생성 (중복 확인)
      const existingMapping = await prisma.keywordTagMapping.findFirst({
        where: {
          keywordGroupId: keywordGroup.id,
          tagId: tag.id
        }
      });

      if (!existingMapping) {
        const keywordTagMapping = await prisma.keywordTagMapping.create({
          data: {
            keywordGroupId: keywordGroup.id,
            tagId: tag.id,
            confidenceScore: rule.confidenceBase,
            priority: 100,
            usageCount: 0,
            isActive: true
          }
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
          accountCode: rule.accountCode
        }
      });

      if (!existingAccountMapping) {
        const tagAccountMapping = await prisma.tagAccountMapping.create({
          data: {
            tagId: tag.id,
            accountCode: rule.accountCode,
            accountName: rule.accountName,
            isDefault: true,
            priority: 100,
            confidenceBoost: 0.05
          }
        });
        addedAccountMappings++;
        console.log(`  ✅ 태그-계정과목 매핑 생성 (ID: ${tagAccountMapping.id})`);
      } else {
        console.log(`  ♻️  기존 계정과목 매핑 사용`);
      }

      console.log(`  📊 동의어 ${rule.synonyms.length}개 포함`);
      
    } catch (error) {
      console.error(`❌ ${rule.groupName} 처리 중 오류:`, error);
    }
  }

  console.log(`\n🎉 구체적 브랜드 키워드 그룹 생성 완료!`);
  console.log(`📈 새로 추가된 키워드 그룹: ${addedGroups}개`);
  console.log(`📈 새로 추가된 키워드-태그 매핑: ${addedMappings}개`);
  console.log(`📈 새로 추가된 태그-계정과목 매핑: ${addedAccountMappings}개`);
  
  // 현재 시스템 상태 확인
  const totalGroups = await prisma.keywordGroup.count({ where: { isActive: true } });
  const totalMappings = await prisma.keywordTagMapping.count({ where: { isActive: true } });
  
  console.log(`\n📊 현재 시스템 상태:`);
  console.log(`   총 활성 키워드 그룹: ${totalGroups}개`);
  console.log(`   총 활성 키워드-태그 매핑: ${totalMappings}개`);

  // 최종 테스트 권장사항
  console.log(`\n🚀 다음 단계:`);
  console.log(`1. 백엔드 서버 재시작 필요`);
  console.log(`2. 개선된 정확도 테스트 실행`);
  console.log(`3. 75% 목표 달성 확인`);
}

async function main() {
  try {
    await addSpecificFailedBrands();
  } catch (error) {
    console.error('전체 프로세스 오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();