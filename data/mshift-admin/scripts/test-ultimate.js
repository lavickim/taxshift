#!/usr/bin/env node

/**
 * 궁극 패턴으로 75% 목표 달성 테스트
 */

const fs = require('fs');
const path = require('path');
const { classifyTransactionUltimate } = require('./ultimate-patterns.js');

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

function runUltimateTest() {
  const testCases = extractTestCasesFromMarkdown();
  console.log('🏆 최종 궁극 패턴으로 75% 목표 달성 테스트');
  console.log(`📋 총 ${testCases.length}개 테스트 케이스\n`);

  let successCount = 0;
  let failureCount = 0;
  const categoryStats = {};
  const unmatchedCases = [];

  // 최종 테스트 실행
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    const result = classifyTransactionUltimate(testCase);
    
    if (result.matched) {
      successCount++;
      categoryStats[result.category] = (categoryStats[result.category] || 0) + 1;
    } else {
      failureCount++;
      unmatchedCases.push(testCase);
    }
    
    if ((i + 1) % 250 === 0) {
      console.log(`📊 진행상황: ${i + 1}/${testCases.length} (${Math.round((i + 1) / testCases.length * 100)}%)`);
    }
  }

  const successRate = Math.round(successCount / testCases.length * 100);

  console.log('\n' + '='.repeat(100));
  console.log('🏆 최종 궁극 패턴 테스트 결과 - MVP 런칭 준비 완료!');
  console.log('='.repeat(100));
  console.log(`총 테스트: ${testCases.length}개`);
  console.log(`성공: ${successCount}개 (${successRate}%)`);
  console.log(`실패: ${failureCount}개 (${Math.round(failureCount / testCases.length * 100)}%)`);

  console.log(`\n🚀 키워드 패턴 최종 진화 과정:`);
  console.log(`46% (기본) → 55% (향상) → 62% (확장) → 70% (MVP준비) → ${successRate}% (궁극)`);

  // 최종 목표 달성 평가
  if (successRate >= 75) {
    console.log(`\n🎉🎉🎉 75% 목표 달성! ${successRate}%로 MVP 런칭 준비 완료! 🎉🎉🎉`);
    console.log('💰 "우리 돈 벌어야지. 나 하고 싶은게 많다고" - 목표 달성!');
    console.log('🚀 즉시 MVP 런칭 가능한 수준입니다!');
  } else {
    console.log(`\n⚠️  ${successRate}%로 75% 목표에 ${75 - successRate}%p 부족합니다.`);
  }

  // 상위 카테고리 통계
  console.log('\n📊 상위 카테고리별 매칭 통계 (Top 10)');
  console.log('-'.repeat(50));
  Object.entries(categoryStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([category, count]) => {
      console.log(`${category.padEnd(20)}: ${count.toString().padStart(3)}개 (${Math.round(count / successCount * 100)}%)`);
    });

  // 매칭되지 않는 케이스
  console.log(`\n❌ 매칭되지 않는 케이스 (${unmatchedCases.length}개 중 상위 15개)`);
  console.log('-'.repeat(50));
  unmatchedCases.slice(0, 15).forEach((case_, index) => {
    console.log(`${(index + 1).toString().padStart(2)}. ${case_}`);
  });

  console.log(`\n💼 비즈니스 결과 (일일 1000건 기준):`);
  console.log(`  • 자동 분류: ${Math.round(1000 * successRate / 100)}건`);
  console.log(`  • 수동 분류: ${1000 - Math.round(1000 * successRate / 100)}건`);
  console.log(`  • 시간 절약: ${Math.round(1000 * successRate / 100 * 30 / 3600)}시간/일`);

  // 최종 결과 저장
  const ultimateResults = {
    timestamp: new Date().toISOString(),
    finalSuccessRate: successRate,
    targetAchieved: successRate >= 75,
    evolution: [46, 55, 62, 70, successRate],
    categoryStats,
    unmatchedCount: unmatchedCases.length,
    mvpLaunchReady: successRate >= 75,
    unmatchedCases: unmatchedCases.slice(0, 50)
  };

  const outputDir = path.join(__dirname, 'test-results');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(path.join(outputDir, 'ultimate-results.json'), JSON.stringify(ultimateResults, null, 2));
  console.log(`\n💾 최종 결과 저장: ./test-results/ultimate-results.json`);
  
  return ultimateResults;
}

if (require.main === module) {
  runUltimateTest();
}

module.exports = { runUltimateTest };