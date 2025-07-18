#!/usr/bin/env node

/**
 * MVP 런칭 준비 테스트 - 75%+ 목표 달성 검증
 */

const fs = require('fs');
const path = require('path');
const { classifyTransactionMVP } = require('./mvp-ready-patterns.js');

function extractTestCasesFromMarkdown() {
  const mdPath = path.join(__dirname, '..', '..', 'project-design', 'test-transaction-strings-1000plus.md');
  if (!fs.existsSync(mdPath)) return [];
  
  const content = fs.readFileSync(mdPath, 'utf8');
  const testCases = [];
  const codeBlockRegex = /```([^`]+)```/g;
  let match;
  
  while ((match = codeBlockRegex.exec(content)) !== null) {
    const lines = match[1].split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#') && !line.startsWith('//'));
    testCases.push(...lines);
  }
  return testCases;
}

function runMVPTest() {
  const testCases = extractTestCasesFromMarkdown();
  console.log('🎯 MVP 런칭 준비 최종 테스트 시작');
  console.log(`📋 총 ${testCases.length}개 테스트 케이스\n`);

  let successCount = 0;
  let failureCount = 0;
  const categoryStats = {};
  const unmatchedCases = [];
  const sampleResults = [];

  // 분류 테스트 실행
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    const result = classifyTransactionMVP(testCase);
    
    // 처음 10개 성공 케이스는 샘플로 저장
    if (result.matched && sampleResults.length < 10) {
      sampleResults.push({
        input: testCase,
        tag: result.tag,
        accountCode: result.accountCode,
        accountName: result.accountName,
        matchedKeyword: result.matchedKeyword,
        confidence: result.confidence
      });
    }
    
    if (result.matched) {
      successCount++;
      categoryStats[result.category] = (categoryStats[result.category] || 0) + 1;
    } else {
      failureCount++;
      unmatchedCases.push(testCase);
    }
    
    if ((i + 1) % 200 === 0) {
      console.log(`📊 진행상황: ${i + 1}/${testCases.length} (${Math.round((i + 1) / testCases.length * 100)}%)`);
    }
  }

  const successRate = Math.round(successCount / testCases.length * 100);

  console.log('\n' + '='.repeat(90));
  console.log('🎯 MVP 런칭 준비 최종 테스트 결과');
  console.log('='.repeat(90));
  console.log(`총 테스트: ${testCases.length}개`);
  console.log(`성공: ${successCount}개 (${successRate}%)`);
  console.log(`실패: ${failureCount}개 (${Math.round(failureCount / testCases.length * 100)}%)`);

  // 전체 진화 과정
  console.log(`\n📈 키워드 패턴 진화 과정:`);
  console.log(`46% (기본) → 55% (향상) → 62% (최종) → ${successRate}% (MVP준비)`);

  // MVP 준비도 최종 평가
  console.log(`\n🏆 MVP 런칭 준비도 최종 평가`);
  console.log('='.repeat(50));
  if (successRate >= 80) {
    console.log('🎉 우수: MVP 런칭 준비 완료! 즉시 런칭 가능');
  } else if (successRate >= 75) {
    console.log('✅ 목표 달성: MVP 런칭 준비 완료! 75% 목표 달성');
  } else if (successRate >= 70) {
    console.log('✅ 양호: MVP 런칭 가능, 추가 개선 권장');
  } else if (successRate >= 65) {
    console.log('⚠️  보통: MVP 런칭 전 패턴 보강 필요');
  } else {
    console.log('❌ 부족: 추가 패턴 개발 필수');
  }

  // 성공 케이스 샘플 출력
  console.log(`\n✅ 성공 케이스 샘플 (${sampleResults.length}개)`);
  console.log('-'.repeat(70));
  sampleResults.forEach((sample, index) => {
    console.log(`${index + 1}. ${sample.input}`);
    console.log(`   → ${sample.tag} | ${sample.accountCode}-${sample.accountName}`);
    console.log(`   → 키워드: "${sample.matchedKeyword}" | 신뢰도: ${Math.round(sample.confidence * 100)}%\n`);
  });

  // 카테고리별 통계
  console.log('📈 카테고리별 매칭 통계');
  console.log('-'.repeat(50));
  Object.entries(categoryStats)
    .sort((a, b) => b[1] - a[1])
    .forEach(([category, count]) => {
      console.log(`${category.padEnd(15)}: ${count.toString().padStart(4)}개 (${Math.round(count / successCount * 100)}%)`);
    });

  // 여전히 매칭되지 않는 케이스 분석
  console.log(`\n❌ 매칭되지 않는 케이스 (${unmatchedCases.length}개 중 상위 25개)`);
  console.log('-'.repeat(50));
  unmatchedCases.slice(0, 25).forEach((case_, index) => {
    console.log(`${(index + 1).toString().padStart(2)}. ${case_}`);
  });

  // 비즈니스 임팩트 분석
  console.log(`\n💼 비즈니스 임팩트 분석`);
  console.log('-'.repeat(50));
  const dailyTransactions = 1000; // 가정: 일일 거래 1000건
  const automatedCount = Math.round(dailyTransactions * successRate / 100);
  const manualCount = dailyTransactions - automatedCount;
  
  console.log(`예상 일일 처리량 (1000건 기준):`);
  console.log(`  • 자동 분류: ${automatedCount}건 (${successRate}%)`);
  console.log(`  • 수동 분류: ${manualCount}건 (${100 - successRate}%)`);
  console.log(`  • 작업 시간 절약: ${Math.round(automatedCount * 30 / 3600)}시간/일 (거래당 30초 가정)`);

  // 결과 저장
  const mvpResults = {
    timestamp: new Date().toISOString(),
    testInfo: {
      totalTests: testCases.length,
      successCount,
      failureCount,
      successRate
    },
    evolution: {
      basic: 46,
      enhanced: 55,
      final: 62,
      mvpReady: successRate
    },
    categoryStats,
    sampleResults,
    unmatchedCases: unmatchedCases.slice(0, 100),
    mvpReadiness: {
      targetRate: 75,
      achieved: successRate >= 75,
      rating: successRate >= 80 ? '우수' : 
              successRate >= 75 ? '목표달성' :
              successRate >= 70 ? '양호' : 
              successRate >= 65 ? '보통' : '부족',
      launchReady: successRate >= 75
    },
    businessImpact: {
      dailyTransactions,
      automatedCount,
      manualCount,
      timeSavingHours: Math.round(automatedCount * 30 / 3600)
    },
    recommendations: []
  };

  if (successRate < 75) {
    mvpResults.recommendations.push('75% 목표 달성을 위해 추가 키워드 패턴이 필요합니다.');
    mvpResults.recommendations.push('특히 미매칭 케이스에서 자주 나타나는 브랜드들의 패턴 추가를 권장합니다.');
  } else {
    mvpResults.recommendations.push('MVP 런칭 준비가 완료되었습니다!');
    mvpResults.recommendations.push('지속적인 모니터링을 통해 새로운 브랜드 패턴을 추가하세요.');
  }

  const outputDir = path.join(__dirname, 'test-results');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(path.join(outputDir, 'mvp-ready-results.json'), JSON.stringify(mvpResults, null, 2));
  console.log(`\n💾 최종 결과 저장: ./test-results/mvp-ready-results.json`);
  
  // MVP 런칭 준비 완료 메시지
  if (successRate >= 75) {
    console.log('\n🚀 MVP 런칭 준비 완료!');
    console.log('💰 "우리 돈 벌어야지. 나 하고 싶은게 많다고" - 목표 달성!');
  }
  
  return mvpResults;
}

if (require.main === module) {
  runMVPTest();
}

module.exports = { runMVPTest };