#!/usr/bin/env node

/**
 * 한국 회사 형태 표기 패턴 키워드 그룹 추가
 * 주식회사, (주), 주/하, 주/상, 유한회사, (유), 합자회사 등의 패턴 처리
 */

const { PrismaClient } = require('../lib/generated/prisma');

const prisma = new PrismaClient();

// 한국 회사 형태 표기 패턴들
const KOREAN_COMPANY_PATTERNS = [
  {
    groupName: "한국회사형태_주식회사",
    primaryKeyword: "주식회사",
    synonyms: [
      "주식회사", "㈜", "(주)", "株式會社", "주/상", "주/하", 
      "주식", "주.식", "주_식", "JS회사", "주식법인"
    ],
    category: "회사형태",
    confidenceBase: 0.80,
    tagName: "기업거래",
    accountCode: "603",
    accountName: "지급수수료"
  },
  {
    groupName: "한국회사형태_유한회사",
    primaryKeyword: "유한회사",
    synonyms: [
      "유한회사", "(유)", "㈲", "유한", "유/상", "유/하",
      "유.한", "유_한", "YH회사", "유한법인"
    ],
    category: "회사형태",
    confidenceBase: 0.80,
    tagName: "기업거래",
    accountCode: "603",
    accountName: "지급수수료"
  },
  {
    groupName: "한국회사형태_합자회사",
    primaryKeyword: "합자회사",
    synonyms: [
      "합자회사", "(합)", "합자", "합/상", "합/하",
      "합.자", "합_자", "HJ회사", "합자법인"
    ],
    category: "회사형태",
    confidenceBase: 0.75,
    tagName: "기업거래",
    accountCode: "603",
    accountName: "지급수수료"
  },
  {
    groupName: "한국회사형태_합명회사",
    primaryKeyword: "합명회사",
    synonyms: [
      "합명회사", "(합명)", "합명", "합명/상", "합명/하",
      "합.명", "합_명", "HM회사", "합명법인"
    ],
    category: "회사형태",
    confidenceBase: 0.75,
    tagName: "기업거래",
    accountCode: "603",
    accountName: "지급수수료"
  },
  {
    groupName: "한국회사형태_영업소점포",
    primaryKeyword: "영업소",
    synonyms: [
      "영업소", "지점", "지사", "출장소", "사업소", "사무소",
      "대리점", "특약점", "판매점", "서비스센터", "점포",
      "매장", "직영점", "가맹점", "체인점"
    ],
    category: "회사형태",
    confidenceBase: 0.70,
    tagName: "기업거래",
    accountCode: "603",
    accountName: "지급수수료"
  },
  {
    groupName: "한국회사형태_단체법인",
    primaryKeyword: "재단법인",
    synonyms: [
      "재단법인", "사단법인", "의료법인", "학교법인", "종교법인",
      "사회복지법인", "의료재단", "교육재단", "문화재단",
      "복지재단", "공익법인", "비영리법인"
    ],
    category: "회사형태",
    confidenceBase: 0.75,
    tagName: "기업거래",
    accountCode: "603",
    accountName: "지급수수료"
  },
  {
    groupName: "한국회사형태_기관단체",
    primaryKeyword: "조합",
    synonyms: [
      "조합", "협회", "연합회", "협동조합", "신용협동조합",
      "농업협동조합", "새마을금고", "상호저축은행",
      "기업은행", "지역농협", "단위농협", "조합은행"
    ],
    category: "회사형태",
    confidenceBase: 0.75,
    tagName: "기업거래",
    accountCode: "603",
    accountName: "지급수수료"
  }
];

async function addKoreanCompanyPatterns() {
  console.log('🏢 한국 회사 형태 표기 패턴 추가 시작...');
  
  try {
    // 기업거래 태그가 있는지 확인하고 없으면 생성
    let enterpriseTag = await prisma.tagsMaster.findFirst({
      where: { tagName: '기업거래' }
    });

    if (!enterpriseTag) {
      console.log('📝 기업거래 태그 생성 중...');
      enterpriseTag = await prisma.tagsMaster.create({
        data: {
          tagName: '기업거래',
          tagCategory: '거래유형',
          description: '기업 간 거래 및 사업자 결제',
          colorHex: '#6366f1',
          iconName: 'building-2',
          displayOrder: 100,
          isActive: true
        }
      });
      console.log(`✅ 기업거래 태그 생성 완료: ID ${enterpriseTag.id}`);
    }

    // 계정과목 매핑 확인 및 생성
    const existingAccountMapping = await prisma.tagAccountMappings.findFirst({
      where: { 
        tagId: enterpriseTag.id,
        accountCode: '603'
      }
    });

    if (!existingAccountMapping) {
      await prisma.tagAccountMappings.create({
        data: {
          tagId: enterpriseTag.id,
          accountCode: '603',
          accountName: '지급수수료',
          isDefault: true,
          priority: 100,
          confidenceBoost: 0.1
        }
      });
      console.log('✅ 기업거래 계정과목 매핑 생성 완료');
    }

    let addedGroups = 0;
    let addedMappings = 0;

    for (const pattern of KOREAN_COMPANY_PATTERNS) {
      console.log(`\n🔧 ${pattern.groupName} 처리 중...`);

      // 1. 키워드 그룹 생성
      const existingGroup = await prisma.keywordGroups.findFirst({
        where: { groupName: pattern.groupName }
      });

      let keywordGroup;
      if (existingGroup) {
        console.log(`   ⚠️  기존 그룹 발견: ${pattern.groupName}`);
        keywordGroup = existingGroup;
      } else {
        keywordGroup = await prisma.keywordGroups.create({
          data: {
            groupName: pattern.groupName,
            primaryKeyword: pattern.primaryKeyword,
            synonyms: pattern.synonyms,
            category: pattern.category,
            confidenceBase: pattern.confidenceBase,
            isActive: true
          }
        });
        addedGroups++;
        console.log(`   ✅ 키워드 그룹 생성: ${pattern.groupName} (ID: ${keywordGroup.id})`);
      }

      // 2. 태그 매핑 생성
      const existingMapping = await prisma.keywordTagMappings.findFirst({
        where: {
          keywordGroupId: keywordGroup.id,
          tagId: enterpriseTag.id
        }
      });

      if (existingMapping) {
        console.log(`   ⚠️  기존 매핑 발견: ${pattern.groupName} → 기업거래`);
      } else {
        await prisma.keywordTagMappings.create({
          data: {
            keywordGroupId: keywordGroup.id,
            tagId: enterpriseTag.id,
            confidenceScore: pattern.confidenceBase,
            priority: 80, // 회사 형태는 브랜드보다 낮은 우선순위
            usageCount: 0,
            isActive: true
          }
        });
        addedMappings++;
        console.log(`   ✅ 태그 매핑 생성: ${pattern.groupName} → 기업거래`);
      }

      // 진행 상황 출력
      console.log(`   📊 동의어 ${pattern.synonyms.length}개 포함`);
    }

    console.log(`\n🎉 한국 회사 형태 패턴 추가 완료!`);
    console.log(`📈 통계:`);
    console.log(`   새로 추가된 키워드 그룹: ${addedGroups}개`);
    console.log(`   새로 추가된 태그 매핑: ${addedMappings}개`);
    console.log(`   총 처리된 패턴: ${KOREAN_COMPANY_PATTERNS.length}개`);

    // 추가된 패턴 요약
    console.log(`\n📋 추가된 회사 형태 패턴:`);
    KOREAN_COMPANY_PATTERNS.forEach((pattern, index) => {
      console.log(`${index + 1}. ${pattern.primaryKeyword} (${pattern.synonyms.length}개 동의어)`);
    });

    console.log(`\n💡 이제 다음과 같은 거래 문자열들이 인식됩니다:`);
    console.log(`   - "삼성전자주식회사 결제 50,000원"`);
    console.log(`   - "(주)네이버 간편결제 25,000원"`);
    console.log(`   - "현대자동차㈜ 신용카드 100,000원"`);
    console.log(`   - "㈜카카오 온라인 15,000원"`);
    console.log(`   - "LG전자(유) 체크카드 75,000원"`);

  } catch (error) {
    console.error('❌ 한국 회사 형태 패턴 추가 중 오류:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 실행
if (require.main === module) {
  addKoreanCompanyPatterns()
    .then(() => {
      console.log('\n✅ 한국 회사 형태 패턴 추가 완료');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 실행 실패:', error);
      process.exit(1);
    });
}

module.exports = { addKoreanCompanyPatterns };