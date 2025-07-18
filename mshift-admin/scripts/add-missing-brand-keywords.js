const { PrismaClient } = require('../lib/generated/prisma');

const prisma = new PrismaClient();

async function addMissingBrandKeywords() {
  console.log('🔧 누락된 브랜드 키워드 추가 시작...');
  
  try {
    // 검증 결과에서 자주 실패하는 브랜드들의 키워드 그룹 생성
    const missingBrandKeywords = [
      // 피자 브랜드들
      {
        groupName: "특정피자브랜드_직접매칭",
        primaryKeyword: "피자브랜드",
        synonyms: [
          "버거리BURGERRY", "피자더블업", "레코드피자", "비스트로피자", 
          "가성빛피자", "피자스쿨", "인앤피자", "반할라피자", "티엠티피자", "TMT피자"
        ],
        category: "피자",
        confidenceBase: 0.98,
        tagName: "피자전문점",
        accountCode: "603",
        accountName: "지급수수료"
      },
      
      // 카페 브랜드들
      {
        groupName: "특정카페브랜드_직접매칭",
        primaryKeyword: "카페브랜드",
        synonyms: [
          "정브라더카페", "비맨션커피", "amp", "토스트", "카페오디디오"
        ],
        category: "카페",
        confidenceBase: 0.98,
        tagName: "카페",
        accountCode: "603",
        accountName: "지급수수료"
      },
      
      // 베이커리 브랜드들
      {
        groupName: "특정베이커리브랜드_직접매칭",
        primaryKeyword: "베이커리브랜드",
        synonyms: [
          "성북당", "십원빵", "빵명장", "블럭제빵소", "베이콜로지", "빵학개론"
        ],
        category: "제과제빵",
        confidenceBase: 0.98,
        tagName: "제과제빵",
        accountCode: "603",
        accountName: "지급수수료"
      },
      
      // 디저트 브랜드들  
      {
        groupName: "특정디저트브랜드_직접매칭",
        primaryKeyword: "디저트브랜드",
        synonyms: [
          "돼지팥빙수", "입술에", "설렌다", "빙수당", "파티파티", "아이스크림"
        ],
        category: "디저트",
        confidenceBase: 0.98,
        tagName: "디저트카페",
        accountCode: "603",
        accountName: "지급수수료"
      },
      
      // 뷰티/서비스 브랜드들
      {
        groupName: "특정뷰티브랜드_직접매칭",
        primaryKeyword: "뷰티브랜드",
        synonyms: [
          "아나덴헤어닥터", "락쉬미핫요가", "휴이엠헤어"
        ],
        category: "뷰티",
        confidenceBase: 0.98,
        tagName: "이미용",
        accountCode: "603",
        accountName: "지급수수료"
      },
      
      // 편의점 브랜드들
      {
        groupName: "특정편의점브랜드_직접매칭",
        primaryKeyword: "편의점브랜드",
        synonyms: [
          "로그인편의점"
        ],
        category: "편의점",
        confidenceBase: 0.98,
        tagName: "편의점",
        accountCode: "603",
        accountName: "지급수수료"
      }
    ];
    
    let addedGroups = 0;
    let addedMappings = 0;
    let addedAccountMappings = 0;

    for (const rule of missingBrandKeywords) {
      try {
        console.log(`\\n📝 처리 중: ${rule.groupName} (${rule.primaryKeyword})`);

        // 1. 태그 찾기
        let tag = await prisma.tagsMaster.findFirst({
          where: { tagName: rule.tagName }
        });

        if (!tag) {
          tag = await prisma.tagsMaster.create({
            data: {
              tagName: rule.tagName,
              tagCategory: "상업시설",
              description: `${rule.tagName} 관련 업종`,
              colorHex: "#EF4444",
              iconName: "target",
              displayOrder: 50,
              isActive: true
            }
          });
          console.log(`  ✅ 새 태그 생성: ${rule.tagName} (ID: ${tag.id})`);
        } else {
          console.log(`  ♻️  기존 태그 사용: ${rule.tagName} (ID: ${tag.id})`);
        }

        // 2. 키워드 그룹 생성
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

        // 3. 키워드-태그 매핑 생성 (최고 우선순위: 200)
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
              priority: 200, // 최고 우선순위
              usageCount: 0,
              isActive: true
            }
          });
          addedMappings++;
          console.log(`  ✅ 키워드-태그 매핑 생성 (ID: ${keywordTagMapping.id}, 우선순위: 200)`);
        } else {
          // 기존 매핑의 우선순위를 200으로 업데이트
          await prisma.keywordTagMapping.update({
            where: { id: existingMapping.id },
            data: { priority: 200 }
          });
          console.log(`  ⬆️ 기존 매핑 우선순위 200으로 상향`);
        }

        // 4. 태그-계정과목 매핑 생성
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
              priority: 200,
              confidenceBoost: 0.15
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

    console.log(`\\n🎉 누락된 브랜드 키워드 추가 완료!`);
    console.log(`📈 새로 추가된 키워드 그룹: ${addedGroups}개`);
    console.log(`📈 새로 추가된 키워드-태그 매핑: ${addedMappings}개`);
    console.log(`📈 새로 추가된 태그-계정과목 매핑: ${addedAccountMappings}개`);
    
    // 현재 시스템 상태 확인
    const totalGroups = await prisma.keywordGroup.count({ where: { isActive: true } });
    const totalMappings = await prisma.keywordTagMapping.count({ where: { isActive: true } });
    
    console.log(`\\n📊 현재 시스템 상태:`);
    console.log(`   총 활성 키워드 그룹: ${totalGroups}개`);
    console.log(`   총 활성 키워드-태그 매핑: ${totalMappings}개`);
    
    // 우선순위 분포 확인
    const priorityDistribution = await prisma.keywordTagMapping.groupBy({
      by: ['priority'],
      where: { isActive: true },
      _count: { id: true },
      orderBy: { priority: 'desc' }
    });
    
    console.log(`\\n📊 우선순위 분포:`);
    priorityDistribution.forEach(dist => {
      console.log(`   우선순위 ${dist.priority || 'NULL'}: ${dist._count.id}개`);
    });

    // 캐시 새로고침
    console.log(`\\n🔄 캐시 새로고침...`);
    try {
      const response = await fetch('http://localhost:8080/v2/tag-mapping/refresh-cache', {
        method: 'POST'
      });
      console.log('   캐시 새로고침 완료');
    } catch (error) {
      console.log('   캐시 새로고침 실패 (서버 확인 필요)');
    }

  } catch (error) {
    console.error('❌ 누락된 브랜드 키워드 추가 중 오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addMissingBrandKeywords();