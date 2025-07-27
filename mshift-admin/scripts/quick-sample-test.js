const { PrismaClient } = require('../lib/generated/prisma');

const prisma = new PrismaClient();

// API 설정
const KEYWORD_CLASSIFY_API = 'http://localhost:8080/v2/keyword-system/classify';

async function quickSampleTest() {
  console.log('🚀 샘플 테스트 시작 (상위 1000개 브랜드)...');

  try {
    // 상위 1000개 브랜드만 테스트
    const sampleBrands = await prisma.franchiseBrands.findMany({
      where: {
        generatedTransactionString: {
          not: null,
        },
      },
      select: {
        id: true,
        brandName: true,
        companyName: true,
        industryLargeCategory: true,
        mainProduct: true,
        generatedTransactionString: true,
        primaryTag: true,
        secondaryTag: true,
        tertiaryTag: true,
      },
      orderBy: {
        id: 'asc',
      },
      take: 1000, // 상위 1000개만
    });

    console.log(`📊 샘플 테스트 대상: ${sampleBrands.length}개 브랜드`);

    let totalTested = 0;
    let totalMatched = 0;
    let categoryStats = {};
    let results = [];

    // 모든 브랜드를 병렬로 테스트 (빠른 결과를 위해)
    console.log('🔄 전체 브랜드 병렬 테스트 중...');

    const promises = sampleBrands.map(async brand => {
      try {
        const response = await fetch(KEYWORD_CLASSIFY_API, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            description: brand.generatedTransactionString,
            amount: 10000,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();

        const testResult = {
          brandId: brand.id,
          brandName: brand.brandName,
          category: brand.industryLargeCategory,
          generatedString: brand.generatedTransactionString,
          matched: result.matched,
          tag: result.tag || '',
          confidence: result.confidence || 0,
          extractedKeywords: result.extractedKeywords || [],
          processingPath: result.processingPath || '',
          primaryTag: brand.primaryTag,
          expectedMatch: brand.primaryTag !== '기타',
        };

        return testResult;
      } catch (error) {
        return {
          brandId: brand.id,
          brandName: brand.brandName,
          category: brand.industryLargeCategory,
          generatedString: brand.generatedTransactionString,
          matched: false,
          tag: '',
          confidence: 0,
          extractedKeywords: [],
          processingPath: 'ERROR',
          error: error.message,
          primaryTag: brand.primaryTag,
          expectedMatch: brand.primaryTag !== '기타',
        };
      }
    });

    // 모든 결과 수집
    results = await Promise.all(promises);

    // 통계 계산
    for (const result of results) {
      totalTested++;

      if (result.matched) {
        totalMatched++;
      }

      // 카테고리별 통계
      const category = result.category || '기타';
      if (!categoryStats[category]) {
        categoryStats[category] = { total: 0, matched: 0 };
      }
      categoryStats[category].total++;
      if (result.matched) {
        categoryStats[category].matched++;
      }
    }

    // 최종 결과 계산
    const finalAccuracy = ((totalMatched / totalTested) * 100).toFixed(2);

    // 카테고리별 성공률 계산
    const categoryAccuracy = {};
    for (const [category, stats] of Object.entries(categoryStats)) {
      categoryAccuracy[category] = {
        total: stats.total,
        matched: stats.matched,
        accuracy:
          stats.total > 0
            ? ((stats.matched / stats.total) * 100).toFixed(2)
            : 0,
      };
    }

    console.log(`\n🎉 샘플 테스트 완료!`);
    console.log(`📊 결과 요약:`);
    console.log(`   총 테스트: ${totalTested}개`);
    console.log(`   성공: ${totalMatched}개`);
    console.log(`   정확도: ${finalAccuracy}%`);

    console.log(`\n📈 카테고리별 성공률 (상위 10개):`);
    const sortedCategories = Object.entries(categoryAccuracy)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 10);

    for (const [category, stats] of sortedCategories) {
      console.log(
        `   ${category}: ${stats.accuracy}% (${stats.matched}/${stats.total})`
      );
    }

    // 성공 예시 몇 개 보여주기
    const successCases = results.filter(r => r.matched).slice(0, 10);
    console.log(`\n✅ 성공 예시 (상위 10개):`);
    for (const result of successCases) {
      console.log(
        `   "${result.generatedString}" → ${result.tag} (키워드: ${result.extractedKeywords.join(', ')})`
      );
    }

    console.log(`\n🎯 목표 달성 여부:`);
    if (parseFloat(finalAccuracy) >= 75) {
      console.log(
        `✅ 목표 달성! 현재 정확도 ${finalAccuracy}%가 목표 75% 이상입니다.`
      );
    } else {
      console.log(`⚠️  목표 근접! 현재 정확도 ${finalAccuracy}%`);
      console.log(
        `   목표 75%까지 ${(75 - parseFloat(finalAccuracy)).toFixed(2)}% 더 필요합니다.`
      );
    }

    return {
      accuracy: parseFloat(finalAccuracy),
      totalTested,
      totalMatched,
      categoryStats: categoryAccuracy,
    };
  } catch (error) {
    console.error('❌ 샘플 테스트 실행 중 오류:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 실행
if (require.main === module) {
  quickSampleTest()
    .then(result => {
      console.log('\n✅ 샘플 테스트 완료');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ 샘플 테스트 실패:', error);
      process.exit(1);
    });
}

module.exports = { quickSampleTest };
