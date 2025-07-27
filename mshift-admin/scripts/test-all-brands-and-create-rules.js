const { PrismaClient } = require('../lib/generated/prisma');
const axios = require('axios');

const prisma = new PrismaClient();

// NextJS API - 정규식 룰 엔진 사용
const FRONTEND_URL = 'http://localhost:3000';
const CLASSIFICATION_API = `${FRONTEND_URL}/api/regex-rules/match`;

// 실패 케이스 분석을 위한 카테고리
const failureCategories = {
  NO_MATCH: [], // 아예 매칭 안됨
  WRONG_TAG: [], // 잘못된 태그로 매칭됨
  PARTIAL_MATCH: [], // 부분적으로만 매칭됨
  BRAND_SPECIFIC: [], // 브랜드 특화 이슈
};

// 성공/실패 통계
const stats = {
  total: 0,
  success: 0,
  failure: 0,
  byTag: {},
};

async function testSingleBrand(brand) {
  try {
    const response = await axios.post(
      CLASSIFICATION_API,
      {
        input: brand.generatedTransactionString,
      },
      {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const result = response.data;
    const expectedTags = [
      brand.primaryTag,
      brand.secondaryTag,
      brand.tertiaryTag,
    ].filter(Boolean);
    const matched =
      result.matched && result.tag && expectedTags.includes(result.tag);

    // 통계 업데이트
    stats.total++;
    if (matched) {
      stats.success++;
    } else {
      stats.failure++;

      // 실패 케이스 분류
      if (!result.matched) {
        failureCategories.NO_MATCH.push({
          brand: brand.brandName,
          transactionString: brand.generatedTransactionString,
          expectedTags,
          reason: 'No pattern matched',
        });
      } else {
        failureCategories.WRONG_TAG.push({
          brand: brand.brandName,
          transactionString: brand.generatedTransactionString,
          expectedTags,
          actualTag: result.tag,
          reason: `Expected: ${expectedTags.join('/')}, Got: ${result.tag}`,
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

    // 데이터베이스에 결과 저장
    await prisma.franchiseBrands.update({
      where: { id: brand.id },
      data: {
        testPassed: matched,
        lastTestAt: new Date(),
        testResult: result,
      },
    });

    return {
      brandId: brand.id,
      brandName: brand.brandName,
      matched,
      expectedTags,
      actualTag: result.tag,
      confidence: result.confidence,
    };
  } catch (error) {
    console.error(`❌ API 호출 실패 (${brand.brandName}):`, error.message);

    // API 오류도 실패로 기록
    stats.total++;
    stats.failure++;

    failureCategories.NO_MATCH.push({
      brand: brand.brandName,
      transactionString: brand.generatedTransactionString,
      expectedTags: [
        brand.primaryTag,
        brand.secondaryTag,
        brand.tertiaryTag,
      ].filter(Boolean),
      reason: `API Error: ${error.message}`,
    });

    await prisma.franchiseBrands.update({
      where: { id: brand.id },
      data: {
        testPassed: false,
        lastTestAt: new Date(),
        testResult: { error: error.message },
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

async function testAllBrands() {
  console.log('🚀 전체 브랜드 분류 테스트 시작');

  const totalBrands = await prisma.franchiseBrands.count();
  console.log(`📊 총 테스트할 브랜드: ${totalBrands}개`);

  const batchSize = 50; // API 부하를 줄이기 위해 배치 크기 축소
  let processed = 0;

  for (let offset = 0; offset < totalBrands; offset += batchSize) {
    console.log(
      `\n🔄 배치 ${Math.floor(offset / batchSize) + 1} 테스트 중... (${offset + 1}/${totalBrands})`
    );

    const brands = await prisma.franchiseBrands.findMany({
      skip: offset,
      take: batchSize,
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

    // 배치 내에서는 순차 처리 (API 서버 부하 방지)
    for (const brand of brands) {
      const result = await testSingleBrand(brand);
      processed++;

      if (processed % 100 === 0) {
        const currentAccuracy = ((stats.success / stats.total) * 100).toFixed(
          1
        );
        console.log(
          `  ✓ ${processed}/${totalBrands} 테스트 완료 - 현재 정확도: ${currentAccuracy}%`
        );
      }

      // API 호출 간격 (서버 과부하 방지)
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    const currentAccuracy = ((stats.success / stats.total) * 100).toFixed(1);
    console.log(
      `✅ 배치 완료 - 진행률: ${((processed / totalBrands) * 100).toFixed(1)}% - 정확도: ${currentAccuracy}%`
    );
  }

  console.log(`\n🎉 전체 테스트 완료!`);
  console.log(`📊 총 테스트: ${stats.total}개`);
  console.log(`✅ 성공: ${stats.success}개`);
  console.log(`❌ 실패: ${stats.failure}개`);
  console.log(
    `🎯 정확도: ${((stats.success / stats.total) * 100).toFixed(2)}%`
  );
}

function generateRulePatternsFromFailures() {
  console.log('\n🛠️ 실패 케이스 기반 룰 패턴 생성 시작');

  const newRules = [];

  // NO_MATCH 케이스 분석
  console.log(
    `\n📋 매칭 실패 케이스 분석 (${failureCategories.NO_MATCH.length}개)`
  );

  const brandPatterns = new Map();

  for (const failure of failureCategories.NO_MATCH) {
    const brand = failure.brand;
    const primaryTag = failure.expectedTags[0];

    if (!brandPatterns.has(primaryTag)) {
      brandPatterns.set(primaryTag, new Set());
    }

    // 브랜드명 기반 패턴 생성
    const cleanBrand = brand.replace(/[()]/g, '').trim();
    brandPatterns.get(primaryTag).add(cleanBrand);
  }

  // 태그별 패턴 생성
  for (const [tag, brands] of brandPatterns.entries()) {
    if (brands.size >= 3) {
      // 3개 이상의 브랜드가 있는 태그만 룰 생성
      const brandList = Array.from(brands);
      const pattern = `(${brandList.map(b => b.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`;

      newRules.push({
        pattern: pattern,
        tag: tag,
        description: `${tag} 브랜드 패턴 (${brandList.length}개 브랜드)`,
        brands: brandList,
        priority: 'high',
      });

      console.log(`  📝 ${tag} 태그 룰 생성: ${brandList.length}개 브랜드`);
    }
  }

  // WRONG_TAG 케이스 분석
  console.log(
    `\n📋 잘못된 태그 케이스 분석 (${failureCategories.WRONG_TAG.length}개)`
  );

  const conflictPatterns = new Map();

  for (const failure of failureCategories.WRONG_TAG) {
    const key = `${failure.expectedTags[0]}_vs_${failure.actualTag}`;
    if (!conflictPatterns.has(key)) {
      conflictPatterns.set(key, []);
    }
    conflictPatterns.get(key).push(failure);
  }

  for (const [conflict, cases] of conflictPatterns.entries()) {
    if (cases.length >= 2) {
      const [expectedTag, actualTag] = conflict.split('_vs_');
      const brands = cases.map(c =>
        c.brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      );
      const pattern = `(${brands.join('|')})`;

      newRules.push({
        pattern: pattern,
        tag: expectedTag,
        description: `${expectedTag} 브랜드 우선 매칭 (vs ${actualTag})`,
        brands: cases.map(c => c.brand),
        priority: 'medium',
        conflict: actualTag,
      });

      console.log(
        `  🔄 충돌 해결 룰: ${expectedTag} vs ${actualTag} (${cases.length}개)`
      );
    }
  }

  console.log(`\n📊 생성된 룰 패턴: ${newRules.length}개`);
  return newRules;
}

async function saveRulesToDatabase(rules) {
  console.log('\n💾 새로운 룰 패턴을 데이터베이스에 저장 중...');

  for (const rule of rules) {
    try {
      await prisma.regexRules.create({
        data: {
          name: rule.description,
          pattern: rule.pattern,
          tag: rule.tag,
          isActive: true,
          priority:
            rule.priority === 'high' ? 1 : rule.priority === 'medium' ? 2 : 3,
          description: `브랜드 기반 자동 생성 룰: ${rule.brands.join(', ')}`,
          createdBy: 'AUTO_GENERATED',
          testCases: rule.brands.map(brand => ({
            input: brand,
            expectedTag: rule.tag,
            shouldMatch: true,
          })),
        },
      });

      console.log(`  ✅ 룰 저장됨: ${rule.description}`);
    } catch (error) {
      console.error(`  ❌ 룰 저장 실패: ${rule.description}`, error.message);
    }
  }
}

async function generateDetailedReport() {
  console.log('\n📊 상세 분석 리포트 생성 중...');

  // 태그별 성능 분석
  console.log('\n🏷️ 태그별 정확도:');
  const sortedTags = Object.entries(stats.byTag)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 10);

  for (const [tag, data] of sortedTags) {
    const accuracy = ((data.success / data.total) * 100).toFixed(1);
    console.log(`  ${tag}: ${data.success}/${data.total} (${accuracy}%)`);
  }

  // 실패 패턴 요약
  console.log('\n❌ 실패 케이스 요약:');
  console.log(`  매칭 실패: ${failureCategories.NO_MATCH.length}개`);
  console.log(`  잘못된 태그: ${failureCategories.WRONG_TAG.length}개`);

  // 개선 필요 영역 식별
  const lowPerformanceTags = Object.entries(stats.byTag)
    .filter(
      ([tag, data]) => data.success / data.total < 0.8 && data.total >= 10
    )
    .sort((a, b) => a[1].success / a[1].total - b[1].success / b[1].total);

  if (lowPerformanceTags.length > 0) {
    console.log('\n⚠️ 개선 필요 태그 (80% 미만):');
    for (const [tag, data] of lowPerformanceTags.slice(0, 5)) {
      const accuracy = ((data.success / data.total) * 100).toFixed(1);
      console.log(`  ${tag}: ${accuracy}% (${data.success}/${data.total})`);
    }
  }

  return {
    totalAccuracy: (stats.success / stats.total) * 100,
    tagPerformance: stats.byTag,
    failureBreakdown: {
      noMatch: failureCategories.NO_MATCH.length,
      wrongTag: failureCategories.WRONG_TAG.length,
    },
    lowPerformanceTags: lowPerformanceTags.map(([tag, data]) => ({
      tag,
      accuracy: (data.success / data.total) * 100,
      total: data.total,
    })),
  };
}

async function main() {
  try {
    console.log('🎯 브랜드 분류 테스트 및 룰 생성 파이프라인 시작\n');

    // 1단계: 전체 브랜드 테스트
    await testAllBrands();

    // 2단계: 실패 케이스 분석 및 룰 생성
    const newRules = generateRulePatternsFromFailures();

    // 3단계: 룰을 데이터베이스에 저장
    if (newRules.length > 0) {
      await saveRulesToDatabase(newRules);
    }

    // 4단계: 상세 리포트 생성
    const report = await generateDetailedReport();

    console.log('\n🎉 파이프라인 완료!');
    console.log(`📈 최종 정확도: ${report.totalAccuracy.toFixed(2)}%`);
    console.log(`🛠️ 생성된 룰: ${newRules.length}개`);

    if (report.totalAccuracy < 95) {
      console.log(
        `\n⚠️ 목표 정확도 95%에 도달하지 못했습니다. 추가 개선이 필요합니다.`
      );
      console.log(
        `💡 현재 정확도: ${report.totalAccuracy.toFixed(2)}% (목표: 95%)`
      );
      console.log(`📋 추가 룰 생성이나 기존 룰 개선을 검토해주세요.`);
    } else {
      console.log(`\n🎯 목표 정확도 95% 달성! 시스템이 준비되었습니다.`);
    }
  } catch (error) {
    console.error('💥 파이프라인 실행 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
