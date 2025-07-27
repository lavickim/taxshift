const { PrismaClient } = require('../lib/generated/prisma');

const prisma = new PrismaClient();

// 간단한 룰 기반 매칭 시스템
const simpleRules = [
  // 치킨 관련
  {
    keywords: ['치킨', '닭', 'chicken', '통닭', '후라이드', '양념'],
    tag: '치킨',
  },

  // 카페 관련
  {
    keywords: [
      '카페',
      'cafe',
      '커피',
      'coffee',
      '스타벅스',
      '투썸',
      '이디야',
      '빈',
      '로스터리',
    ],
    tag: '카페',
  },

  // 편의점 관련
  {
    keywords: [
      '편의점',
      '세븐일레븐',
      '7-eleven',
      'cu',
      '씨유',
      'gs25',
      '이마트24',
      '위드미',
    ],
    tag: '편의점',
  },

  // 피자 관련
  {
    keywords: ['피자', 'pizza', '도미노', '피자헛', '파파존스', '미스터피자'],
    tag: '피자',
  },

  // 교육 관련
  {
    keywords: [
      '학원',
      '교육',
      '스쿨',
      'school',
      '어학원',
      '태권도',
      '수학',
      '영어',
      '유치원',
    ],
    tag: '교육',
  },

  // 스포츠 관련
  {
    keywords: [
      '헬스',
      'gym',
      '피트니스',
      '요가',
      '필라테스',
      '골프',
      '테니스',
      '수영',
    ],
    tag: '스포츠',
  },

  // 뷰티 관련
  {
    keywords: ['뷰티', '미용', '네일', '헤어', '살롱', '에스테틱', '마사지'],
    tag: '뷰티',
  },

  // 패스트푸드 관련
  {
    keywords: [
      '버거',
      'burger',
      '맥도날드',
      '롯데리아',
      'kfc',
      '서브웨이',
      '햄버거',
    ],
    tag: '패스트푸드',
  },

  // 디저트 관련
  {
    keywords: ['아이스크림', '빙수', '디저트', '케이크', '도넛', '젤라또'],
    tag: '디저트',
  },

  // 베이커리 관련
  {
    keywords: ['베이커리', '빵', '파리바게뜨', '뚜레쥬르', '제과점'],
    tag: '베이커리',
  },
];

// 브랜드명에서 태그 추론
function classifyBrand(brandName, transactionString) {
  const text = (brandName + ' ' + transactionString).toLowerCase();

  for (const rule of simpleRules) {
    for (const keyword of rule.keywords) {
      if (text.includes(keyword.toLowerCase())) {
        return {
          matched: true,
          tag: rule.tag,
          matchedKeyword: keyword,
          confidence: 0.8,
        };
      }
    }
  }

  return {
    matched: false,
    tag: null,
    matchedKeyword: null,
    confidence: 0.0,
  };
}

// 통계 추적
const stats = {
  total: 0,
  success: 0,
  failure: 0,
  byTag: {},
};

const failureAnalysis = {
  noMatch: [],
  wrongTag: [],
};

async function testAllBrands() {
  console.log('🚀 전체 브랜드 분류 테스트 시작 (간단한 룰 기반)');

  const totalBrands = await prisma.franchiseBrands.count({
    where: {
      generatedTransactionString: { not: null },
      primaryTag: { not: null },
    },
  });

  console.log(`📊 총 테스트할 브랜드: ${totalBrands}개`);

  const batchSize = 1000;
  let processed = 0;

  for (let offset = 0; offset < totalBrands; offset += batchSize) {
    console.log(
      `\n🔄 배치 ${Math.floor(offset / batchSize) + 1} 테스트 중... (${offset + 1}/${totalBrands})`
    );

    const brands = await prisma.franchiseBrands.findMany({
      skip: offset,
      take: batchSize,
      where: {
        generatedTransactionString: { not: null },
        primaryTag: { not: null },
      },
      orderBy: { id: 'asc' },
      select: {
        id: true,
        brandName: true,
        generatedTransactionString: true,
        primaryTag: true,
        secondaryTag: true,
        tertiaryTag: true,
      },
    });

    for (const brand of brands) {
      const result = classifyBrand(
        brand.brandName,
        brand.generatedTransactionString
      );
      const expectedTags = [
        brand.primaryTag,
        brand.secondaryTag,
        brand.tertiaryTag,
      ].filter(Boolean);
      const matched = result.matched && expectedTags.includes(result.tag);

      // 통계 업데이트
      stats.total++;
      processed++;

      if (matched) {
        stats.success++;
      } else {
        stats.failure++;

        // 실패 케이스 분류
        if (!result.matched) {
          failureAnalysis.noMatch.push({
            brand: brand.brandName,
            transactionString: brand.generatedTransactionString,
            expectedTags,
          });
        } else {
          failureAnalysis.wrongTag.push({
            brand: brand.brandName,
            transactionString: brand.generatedTransactionString,
            expectedTags,
            actualTag: result.tag,
          });
        }
      }

      // 태그별 통계
      const primaryTag = brand.primaryTag;
      if (!stats.byTag[primaryTag]) {
        stats.byTag[primaryTag] = { total: 0, success: 0 };
      }
      stats.byTag[primaryTag].total++;
      if (matched) {
        stats.byTag[primaryTag].success++;
      }

      // 결과를 데이터베이스에 저장
      await prisma.franchiseBrands.update({
        where: { id: brand.id },
        data: {
          testPassed: matched,
          lastTestAt: new Date(),
          testResult: {
            matched,
            actualTag: result.tag,
            expectedTags,
            confidence: result.confidence,
            matchedKeyword: result.matchedKeyword,
          },
        },
      });
    }

    const currentAccuracy = ((stats.success / stats.total) * 100).toFixed(1);
    console.log(
      `✅ 배치 완료 - 진행률: ${((processed / totalBrands) * 100).toFixed(1)}% - 정확도: ${currentAccuracy}%`
    );

    if (processed % 1000 === 0) {
      console.log(
        `📈 현재까지 정확도: ${currentAccuracy}% (${stats.success}/${stats.total})`
      );
    }
  }

  console.log(`\n🎉 전체 테스트 완료!`);
  console.log(`📊 총 테스트: ${stats.total}개`);
  console.log(`✅ 성공: ${stats.success}개`);
  console.log(`❌ 실패: ${stats.failure}개`);
  console.log(
    `🎯 정확도: ${((stats.success / stats.total) * 100).toFixed(2)}%`
  );

  return {
    totalAccuracy: (stats.success / stats.total) * 100,
    stats,
    failureAnalysis,
  };
}

// 실패 케이스 기반 룰 생성
function generateNewRules(failureAnalysis) {
  console.log('\n🛠️ 실패 케이스 기반 룰 패턴 생성');

  const newRules = [];
  const brandsByTag = new Map();

  // NO_MATCH 케이스에서 패턴 추출
  for (const failure of failureAnalysis.noMatch) {
    const tag = failure.expectedTags[0];
    if (!brandsByTag.has(tag)) {
      brandsByTag.set(tag, []);
    }
    brandsByTag.get(tag).push(failure.brand);
  }

  // 태그별로 3개 이상의 브랜드가 있는 경우 룰 생성
  for (const [tag, brands] of brandsByTag.entries()) {
    if (brands.length >= 3) {
      const uniqueBrands = [...new Set(brands)];
      const keywords = extractKeywordsFromBrands(uniqueBrands);

      if (keywords.length > 0) {
        newRules.push({
          tag,
          keywords,
          brands: uniqueBrands,
          reason: 'Generated from failed NO_MATCH cases',
        });

        console.log(
          `  📝 ${tag} 태그 룰 생성: ${keywords.join(', ')} (${uniqueBrands.length}개 브랜드)`
        );
      }
    }
  }

  console.log(`\n📊 생성된 새 룰: ${newRules.length}개`);
  return newRules;
}

// 브랜드명에서 키워드 추출
function extractKeywordsFromBrands(brands) {
  const keywords = [];
  const commonPatterns = [
    /치킨|닭|chicken/i,
    /카페|cafe|커피|coffee/i,
    /피자|pizza/i,
    /버거|burger|햄버거/i,
    /학원|교육|스쿨/i,
    /헬스|gym|피트니스/i,
    /뷰티|미용|헤어/i,
    /베이커리|빵|제과/i,
  ];

  for (const brand of brands) {
    for (const pattern of commonPatterns) {
      const match = brand.match(pattern);
      if (match && !keywords.includes(match[0].toLowerCase())) {
        keywords.push(match[0].toLowerCase());
      }
    }
  }

  return keywords;
}

// 상세 리포트 생성
function generateDetailedReport(results) {
  console.log('\n📊 상세 분석 리포트');

  // 태그별 성능 분석
  console.log('\n🏷️ 태그별 정확도 (상위 10개):');
  const sortedTags = Object.entries(results.stats.byTag)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 10);

  for (const [tag, data] of sortedTags) {
    const accuracy = ((data.success / data.total) * 100).toFixed(1);
    console.log(`  ${tag}: ${data.success}/${data.total} (${accuracy}%)`);
  }

  // 개선 필요 영역
  const lowPerformanceTags = Object.entries(results.stats.byTag)
    .filter(
      ([tag, data]) => data.success / data.total < 0.7 && data.total >= 10
    )
    .sort((a, b) => a[1].success / a[1].total - b[1].success / b[1].total);

  if (lowPerformanceTags.length > 0) {
    console.log('\n⚠️ 개선 필요 태그 (70% 미만):');
    for (const [tag, data] of lowPerformanceTags.slice(0, 5)) {
      const accuracy = ((data.success / data.total) * 100).toFixed(1);
      console.log(`  ${tag}: ${accuracy}% (${data.success}/${data.total})`);
    }
  }

  // 실패 케이스 요약
  console.log('\n❌ 실패 케이스 요약:');
  console.log(`  매칭 실패: ${results.failureAnalysis.noMatch.length}개`);
  console.log(`  잘못된 태그: ${results.failureAnalysis.wrongTag.length}개`);

  return {
    accuracy: results.totalAccuracy,
    topTags: sortedTags.slice(0, 10),
    lowPerformanceTags,
    improvements: {
      noMatchCases: results.failureAnalysis.noMatch.length,
      wrongTagCases: results.failureAnalysis.wrongTag.length,
    },
  };
}

async function main() {
  try {
    console.log('🎯 간단한 룰 기반 브랜드 분류 테스트 시작\n');

    // 1단계: 전체 브랜드 테스트
    const results = await testAllBrands();

    // 2단계: 실패 케이스 분석 및 룰 생성
    const newRules = generateNewRules(results.failureAnalysis);

    // 3단계: 상세 리포트 생성
    const report = generateDetailedReport(results);

    console.log('\n🎉 테스트 완료!');
    console.log(`📈 최종 정확도: ${results.totalAccuracy.toFixed(2)}%`);
    console.log(`🛠️ 제안된 새 룰: ${newRules.length}개`);

    if (results.totalAccuracy < 95) {
      console.log(
        `\n💡 현재 정확도: ${results.totalAccuracy.toFixed(2)}% (목표: 95%)`
      );
      console.log(`📋 ${newRules.length}개의 새로운 룰 패턴이 생성되었습니다.`);
      console.log(
        `🔧 이 룰들을 시스템에 추가하면 정확도를 개선할 수 있습니다.`
      );

      // 새 룰 출력
      if (newRules.length > 0) {
        console.log('\n📝 생성된 룰 패턴:');
        newRules.forEach((rule, index) => {
          console.log(
            `  ${index + 1}. ${rule.tag}: [${rule.keywords.join(', ')}] (${rule.brands.length}개 브랜드)`
          );
        });
      }
    } else {
      console.log(`\n🎯 목표 정확도 95% 달성! 시스템이 준비되었습니다.`);
    }
  } catch (error) {
    console.error('💥 테스트 실행 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
