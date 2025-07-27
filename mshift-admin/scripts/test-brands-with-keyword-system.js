const { PrismaClient } = require('../lib/generated/prisma');

const prisma = new PrismaClient();

// API 설정
const FRONTEND_URL = 'http://localhost:3000';
const KEYWORD_CLASSIFY_API = `${FRONTEND_URL}/api/v2/keyword-test/classify`;

// 통계 추적
const stats = {
  total: 0,
  success: 0,
  failure: 0,
  cacheHits: 0,
  dbHits: 0,
  apiHits: 0,
  byTag: {},
  byProcessingPath: {},
};

// 실패 케이스 분석
const failureAnalysis = {
  noMatch: [],
  wrongTag: [],
  apiErrors: [],
};

// 성능 추적
const performanceMetrics = {
  totalProcessingTime: 0,
  avgProcessingTime: 0,
  maxProcessingTime: 0,
  minProcessingTime: Infinity,
};

async function testSingleBrand(brand) {
  try {
    const startTime = Date.now();

    // 키워드 분류 시스템 호출
    const response = await fetch(KEYWORD_CLASSIFY_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: brand.generatedTransactionString,
        amount: 35500,
      }),
    });

    const processingTime = Date.now() - startTime;

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    // 성능 메트릭 업데이트
    performanceMetrics.totalProcessingTime += processingTime;
    performanceMetrics.maxProcessingTime = Math.max(
      performanceMetrics.maxProcessingTime,
      processingTime
    );
    performanceMetrics.minProcessingTime = Math.min(
      performanceMetrics.minProcessingTime,
      processingTime
    );

    // 처리 경로별 통계
    const processingPath = result.processingPath || 'unknown';
    if (!stats.byProcessingPath[processingPath]) {
      stats.byProcessingPath[processingPath] = 0;
    }
    stats.byProcessingPath[processingPath]++;

    // 예상 태그와 실제 태그 비교 (브랜드 테스트와 동일한 로직)
    const expectedTags = [
      brand.primaryTag,
      brand.secondaryTag,
      brand.tertiaryTag,
    ].filter(Boolean);
    const actualTag = result.tag;
    const matched = result.matched && expectedTags.includes(actualTag);

    // 통계 업데이트
    stats.total++;
    if (matched) {
      stats.success++;
    } else {
      stats.failure++;

      // 실패 케이스 분류
      if (!result.matched || !actualTag) {
        failureAnalysis.noMatch.push({
          brandId: brand.id,
          brand: brand.brandName,
          transactionString: brand.generatedTransactionString,
          expectedTags,
          extractedKeywords: result.extractedKeywords || [],
          confidence: result.confidence || 0,
          processingPath: result.processingPath,
        });
      } else {
        failureAnalysis.wrongTag.push({
          brandId: brand.id,
          brand: brand.brandName,
          transactionString: brand.generatedTransactionString,
          expectedTags,
          actualTag,
          confidence: result.confidence || 0,
          extractedKeywords: result.extractedKeywords || [],
          processingPath: result.processingPath,
        });
      }
    }

    // 태그별 통계
    const primaryTag = brand.primaryTag;
    if (!stats.byTag[primaryTag]) {
      stats.byTag[primaryTag] = { total: 0, success: 0, avgConfidence: 0 };
    }
    stats.byTag[primaryTag].total++;
    if (matched) {
      stats.byTag[primaryTag].success++;
    }

    // 데이터베이스에 결과 저장 (브랜드 테스트와 동일한 형식)
    await prisma.franchiseBrands.update({
      where: { id: brand.id },
      data: {
        testPassed: matched,
        lastTestAt: new Date(),
        testResult: {
          matched,
          inputText: brand.generatedTransactionString,
          expectedTags,
          actualTag,
          keywordGroup: result.keywordGroup,
          confidence: result.confidence || 0,
          processingPath: result.processingPath,
          processingTime: processingTime,
          rawResult: result,
        },
      },
    });

    return {
      brandId: brand.id,
      brandName: brand.brandName,
      matched,
      expectedTags,
      actualTag,
      confidence: result.confidence || 0,
      processingTime,
      processingPath: result.processingPath,
    };
  } catch (error) {
    console.error(`❌ API 호출 실패 (${brand.brandName}):`, error.message);

    // API 오류 기록
    stats.total++;
    stats.failure++;

    failureAnalysis.apiErrors.push({
      brandId: brand.id,
      brand: brand.brandName,
      transactionString: brand.generatedTransactionString,
      expectedTags: [
        brand.primaryTag,
        brand.secondaryTag,
        brand.tertiaryTag,
      ].filter(Boolean),
      error: error.message,
    });

    await prisma.franchiseBrands.update({
      where: { id: brand.id },
      data: {
        testPassed: false,
        lastTestAt: new Date(),
        testResult: {
          matched: false,
          error: error.message,
          inputText: brand.generatedTransactionString,
          expectedTags: [
            brand.primaryTag,
            brand.secondaryTag,
            brand.tertiaryTag,
          ].filter(Boolean),
        },
      },
    });

    return {
      brandId: brand.id,
      brandName: brand.brandName,
      matched: false,
      error: error.message,
    };
  }
}

async function testAllBrandsWithKeywordSystem() {
  console.log('🚀 키워드 기반 분류 시스템으로 전체 브랜드 테스트 시작');
  console.log('📊 문서 기준 목표 정확도: 77% (814/1063)');

  const totalBrands = await prisma.franchiseBrands.count({
    where: {
      generatedTransactionString: { not: null },
      primaryTag: { not: null },
    },
  });

  console.log(`📊 총 테스트할 브랜드: ${totalBrands}개`);

  const batchSize = 25; // API 서버 안정성을 위한 작은 배치
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

    // 순차 처리 (API 서버 부하 방지)
    for (const brand of brands) {
      const result = await testSingleBrand(brand);
      processed++;

      if (processed % 50 === 0) {
        const currentAccuracy = ((stats.success / stats.total) * 100).toFixed(
          1
        );
        const avgTime = Math.round(
          performanceMetrics.totalProcessingTime / stats.total
        );
        console.log(
          `  ✓ ${processed}/${totalBrands} 완료 - 정확도: ${currentAccuracy}% - 평균 응답: ${avgTime}ms`
        );
      }

      // API 호출 간격 (서버 보호)
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const currentAccuracy = ((stats.success / stats.total) * 100).toFixed(1);
    const progress = ((processed / totalBrands) * 100).toFixed(1);
    console.log(
      `✅ 배치 완료 - 진행률: ${progress}% - 정확도: ${currentAccuracy}%`
    );
  }

  // 평균 처리 시간 계산
  performanceMetrics.avgProcessingTime = Math.round(
    performanceMetrics.totalProcessingTime / stats.total
  );

  console.log(`\n🎉 전체 테스트 완료!`);
  console.log(`📊 총 테스트: ${stats.total}개`);
  console.log(`✅ 성공: ${stats.success}개`);
  console.log(`❌ 실패: ${stats.failure}개`);
  console.log(
    `🎯 정확도: ${((stats.success / stats.total) * 100).toFixed(2)}%`
  );
  console.log(`⚡ 평균 응답시간: ${performanceMetrics.avgProcessingTime}ms`);
}

function analyzeSystemPerformance() {
  console.log('\n📊 시스템 성능 분석');

  // 처리 경로별 통계
  console.log('\n🛣️ 처리 경로별 분석:');
  for (const [path, count] of Object.entries(stats.byProcessingPath)) {
    const percentage = ((count / stats.total) * 100).toFixed(1);
    console.log(`  ${path}: ${count}개 (${percentage}%)`);
  }

  // 태그별 성능 (상위 15개)
  console.log('\n🏷️ 태그별 정확도 (상위 15개):');
  const sortedTags = Object.entries(stats.byTag)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 15);

  for (const [tag, data] of sortedTags) {
    const accuracy = ((data.success / data.total) * 100).toFixed(1);
    console.log(`  ${tag}: ${data.success}/${data.total} (${accuracy}%)`);
  }

  // 성능 문제 영역 식별
  const lowPerformanceTags = Object.entries(stats.byTag)
    .filter(
      ([tag, data]) => data.success / data.total < 0.6 && data.total >= 10
    )
    .sort((a, b) => a[1].success / a[1].total - b[1].success / b[1].total);

  if (lowPerformanceTags.length > 0) {
    console.log('\n⚠️ 개선 필요 태그 (60% 미만):');
    for (const [tag, data] of lowPerformanceTags.slice(0, 10)) {
      const accuracy = ((data.success / data.total) * 100).toFixed(1);
      console.log(`  ${tag}: ${accuracy}% (${data.success}/${data.total})`);
    }
  }

  // 성능 메트릭
  console.log('\n⚡ 성능 메트릭:');
  console.log(`  평균 응답시간: ${performanceMetrics.avgProcessingTime}ms`);
  console.log(`  최대 응답시간: ${performanceMetrics.maxProcessingTime}ms`);
  console.log(`  최소 응답시간: ${performanceMetrics.minProcessingTime}ms`);

  return {
    totalAccuracy: (stats.success / stats.total) * 100,
    processingPaths: stats.byProcessingPath,
    tagPerformance: stats.byTag,
    lowPerformanceTags: lowPerformanceTags.map(([tag, data]) => ({
      tag,
      accuracy: (data.success / data.total) * 100,
      total: data.total,
    })),
    performance: performanceMetrics,
  };
}

function generateKeywordPatterns() {
  console.log('\n🛠️ 실패 케이스 기반 키워드 패턴 분석');

  const newKeywordSuggestions = [];

  // NO_MATCH 케이스 분석
  console.log(
    `\n📋 매칭 실패 케이스 분석 (${failureAnalysis.noMatch.length}개)`
  );

  const brandsByTag = new Map();

  for (const failure of failureAnalysis.noMatch) {
    const primaryTag = failure.expectedTags[0];
    if (!brandsByTag.has(primaryTag)) {
      brandsByTag.set(primaryTag, []);
    }
    brandsByTag.get(primaryTag).push({
      brand: failure.brand,
      extractedKeywords: failure.extractedKeywords,
    });
  }

  // 태그별로 공통 키워드 패턴 찾기
  for (const [tag, items] of brandsByTag.entries()) {
    if (items.length >= 5) {
      // 5개 이상의 실패 케이스가 있는 태그만
      const keywordCounts = new Map();
      const brandNames = items.map(item => item.brand);

      // 브랜드명에서 공통 키워드 추출
      for (const item of items) {
        const words = item.brand.toLowerCase().split(/\s+|[^\w가-힣]+/);
        for (const word of words) {
          if (word.length >= 2) {
            keywordCounts.set(word, (keywordCounts.get(word) || 0) + 1);
          }
        }
      }

      // 빈도 높은 키워드 찾기
      const commonKeywords = Array.from(keywordCounts.entries())
        .filter(([keyword, count]) => count >= Math.min(3, items.length * 0.3))
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([keyword]) => keyword);

      if (commonKeywords.length > 0) {
        newKeywordSuggestions.push({
          tag,
          keywords: commonKeywords,
          brands: brandNames.slice(0, 10), // 예시로 최대 10개만
          failureCount: items.length,
          reason: 'Common patterns from NO_MATCH failures',
        });

        console.log(
          `  📝 ${tag} 태그 새 키워드 제안: [${commonKeywords.join(', ')}] (${items.length}개 실패 케이스)`
        );
      }
    }
  }

  console.log(`\n📊 새 키워드 패턴 제안: ${newKeywordSuggestions.length}개`);
  return newKeywordSuggestions;
}

async function generateComprehensiveReport() {
  const accuracy = (stats.success / stats.total) * 100;

  console.log('\n📝 종합 테스트 리포트 생성 중...');

  const report = `# 키워드 기반 브랜드 분류 시스템 테스트 리포트
날짜: ${new Date().toISOString().split('T')[0]}

## 📊 전체 결과 요약
- **총 테스트**: ${stats.total}개 브랜드
- **성공**: ${stats.success}개
- **실패**: ${stats.failure}개
- **정확도**: ${accuracy.toFixed(2)}%
- **목표 정확도**: 77% (문서 기준)
- **목표 달성**: ${accuracy >= 77 ? '✅ 달성' : '❌ 미달성'}

## ⚡ 성능 메트릭
- **평균 응답시간**: ${performanceMetrics.avgProcessingTime}ms
- **최대 응답시간**: ${performanceMetrics.maxProcessingTime}ms
- **최소 응답시간**: ${performanceMetrics.minProcessingTime}ms

## 🛣️ 처리 경로별 분석
${Object.entries(stats.byProcessingPath)
  .map(
    ([path, count]) =>
      `- **${path}**: ${count}개 (${((count / stats.total) * 100).toFixed(1)}%)`
  )
  .join('\n')}

## 🏷️ 태그별 성능 (상위 20개)
${Object.entries(stats.byTag)
  .sort((a, b) => b[1].total - a[1].total)
  .slice(0, 20)
  .map(([tag, data]) => {
    const tagAccuracy = ((data.success / data.total) * 100).toFixed(1);
    return `- **${tag}**: ${data.success}/${data.total} (${tagAccuracy}%)`;
  })
  .join('\n')}

## ❌ 실패 케이스 분석
- **매칭 실패**: ${failureAnalysis.noMatch.length}개
- **잘못된 태그**: ${failureAnalysis.wrongTag.length}개
- **API 오류**: ${failureAnalysis.apiErrors.length}개

## 🔧 개선 제안
${
  accuracy < 77
    ? `
현재 정확도 ${accuracy.toFixed(2)}%는 목표 정확도 77%에 미달합니다.

### 개선 방향:
1. **키워드 패턴 추가**: 실패한 브랜드들의 공통 키워드 패턴 분석
2. **동의어 확장**: 기존 키워드 그룹에 동의어 추가
3. **브랜드별 특화 패턴**: 특정 브랜드에 특화된 키워드 패턴
4. **신뢰도 조정**: 각 키워드 그룹의 신뢰도 점수 재조정
`
    : `
🎯 목표 정확도 77% 달성! 시스템이 성공적으로 작동하고 있습니다.
`
}

## 📈 비즈니스 임팩트
- **자동 분류 건수**: ${stats.success}개 (${accuracy.toFixed(1)}%)
- **수동 검토 필요**: ${stats.failure}개 (${(100 - accuracy).toFixed(1)}%)
- **예상 작업시간 절약**: 일일 1000건 기준 ${((accuracy / 100) * 6.4).toFixed(1)}시간
`;

  // 리포트 파일 저장
  const fs = require('fs');
  const path = require('path');

  const reportPath = path.join(
    __dirname,
    '../test-results/keyword-system-test-report.md'
  );
  fs.writeFileSync(reportPath, report, 'utf8');

  console.log(`📄 상세 리포트 저장: ${reportPath}`);

  return {
    accuracy,
    report,
    reportPath,
  };
}

async function main() {
  try {
    console.log('🎯 키워드 기반 분류 시스템 테스트 시작\n');
    console.log(
      '📚 시스템 설계 기준: 77% 정확도 (1,051개 키워드, 32개 태그)\n'
    );

    // 1단계: 전체 브랜드 테스트
    await testAllBrandsWithKeywordSystem();

    // 2단계: 시스템 성능 분석
    const performanceReport = analyzeSystemPerformance();

    // 3단계: 실패 케이스 기반 키워드 패턴 제안
    const keywordSuggestions = generateKeywordPatterns();

    // 4단계: 종합 리포트 생성
    const finalReport = await generateComprehensiveReport();

    console.log('\n🎉 테스트 완료!');
    console.log(`📈 최종 정확도: ${finalReport.accuracy.toFixed(2)}%`);
    console.log(`🎯 목표 정확도: 77%`);
    console.log(`📊 목표 달성: ${finalReport.accuracy >= 77 ? '✅' : '❌'}`);

    if (finalReport.accuracy < 77) {
      console.log(
        `\n💡 개선 필요: ${(77 - finalReport.accuracy).toFixed(2)}% 추가 정확도 개선`
      );
      console.log(`🛠️ 제안된 키워드 패턴: ${keywordSuggestions.length}개`);
      console.log(
        `📋 이 패턴들을 keyword_groups 테이블에 추가하여 정확도를 개선할 수 있습니다.`
      );
    } else {
      console.log(`\n🚀 목표 달성! 시스템이 MVP 런칭 준비 완료되었습니다.`);
    }
  } catch (error) {
    console.error('💥 테스트 실행 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
