#!/usr/bin/env node

/**
 * 향상된 키워드 패턴 테스트 스크립트
 */

const fs = require('fs');
const path = require('path');
const {
  classifyTransactionEnhanced,
} = require('./enhanced-keyword-patterns.js');

// 1063개 테스트 케이스로 향상된 패턴 테스트
function extractTestCasesFromMarkdown() {
  const mdPath = path.join(
    __dirname,
    '..',
    '..',
    'project-design',
    'test-transaction-strings-1000plus.md'
  );
  if (!fs.existsSync(mdPath)) return [];

  const content = fs.readFileSync(mdPath, 'utf8');
  const testCases = [];
  const codeBlockRegex = /```([^`]+)```/g;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const lines = match[1]
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#') && !line.startsWith('//'));
    testCases.push(...lines);
  }
  return testCases;
}

function runEnhancedTest() {
  const testCases = extractTestCasesFromMarkdown();
  console.log('🚀 향상된 키워드 패턴으로 대규모 테스트 시작');
  console.log(`📋 총 ${testCases.length}개 테스트 케이스\n`);

  let successCount = 0;
  let failureCount = 0;
  const categoryStats = {};
  const unmatchedCases = [];

  // 분류 테스트 실행
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    const result = classifyTransactionEnhanced(testCase);

    if (result.matched) {
      successCount++;
      categoryStats[result.category] =
        (categoryStats[result.category] || 0) + 1;
    } else {
      failureCount++;
      unmatchedCases.push(testCase);
    }

    if ((i + 1) % 200 === 0) {
      console.log(
        `📊 진행상황: ${i + 1}/${testCases.length} (${Math.round(((i + 1) / testCases.length) * 100)}%)`
      );
    }
  }

  const successRate = Math.round((successCount / testCases.length) * 100);

  console.log('\n' + '='.repeat(80));
  console.log('📊 향상된 키워드 패턴 테스트 결과');
  console.log('='.repeat(80));
  console.log(`총 테스트: ${testCases.length}개`);
  console.log(`성공: ${successCount}개 (${successRate}%)`);
  console.log(
    `실패: ${failureCount}개 (${Math.round((failureCount / testCases.length) * 100)}%)`
  );

  // 이전 결과와 비교
  try {
    const previousResults = JSON.parse(
      fs.readFileSync('./test-results/massive-test-results.json', 'utf8')
    );
    const previousRate = previousResults.testInfo.successRate;
    const improvement = successRate - previousRate;
    console.log(
      `\n📈 개선 효과: ${previousRate}% → ${successRate}% (+${improvement}%p)`
    );
  } catch (e) {
    console.log('\n📈 이전 결과 파일을 찾을 수 없어 비교가 불가능합니다.');
  }

  // 카테고리별 통계
  console.log('\n📈 카테고리별 매칭 통계');
  console.log('-'.repeat(50));
  Object.entries(categoryStats)
    .sort((a, b) => b[1] - a[1])
    .forEach(([category, count]) => {
      console.log(
        `${category.padEnd(15)}: ${count.toString().padStart(4)}개 (${Math.round((count / successCount) * 100)}%)`
      );
    });

  // 여전히 매칭되지 않는 케이스 분석
  console.log(
    `\n❌ 여전히 매칭되지 않는 케이스 (${unmatchedCases.length}개 중 상위 15개)`
  );
  console.log('-'.repeat(50));
  unmatchedCases.slice(0, 15).forEach((case_, index) => {
    console.log(`${(index + 1).toString().padStart(2)}. ${case_}`);
  });

  // 결과 저장
  const enhancedResults = {
    timestamp: new Date().toISOString(),
    testInfo: {
      totalTests: testCases.length,
      successCount,
      failureCount,
      successRate,
    },
    categoryStats,
    unmatchedCases: unmatchedCases.slice(0, 50),
    recommendations: [],
  };

  if (successRate < 85) {
    enhancedResults.recommendations.push(
      '매칭률이 85% 미만입니다. 추가 키워드 패턴 확장이 필요합니다.'
    );
  }

  if (unmatchedCases.length > 100) {
    // 자주 나타나는 미매칭 패턴 분석
    const words = {};
    unmatchedCases.forEach(case_ => {
      const tokens = case_.toLowerCase().split(/[\s\*\-\_\(\)\[\]\{\}]+/);
      tokens.forEach(token => {
        if (token.length >= 2 && !/^\d+$/.test(token)) {
          words[token] = (words[token] || 0) + 1;
        }
      });
    });

    const commonWords = Object.entries(words)
      .filter(([word, count]) => count >= 3)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);

    if (commonWords.length > 0) {
      enhancedResults.recommendations.push(
        `자주 나타나는 미매칭 패턴: ${commonWords.join(', ')}`
      );
    }
  }

  const outputDir = path.join(__dirname, 'test-results');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(outputDir, 'enhanced-test-results.json'),
    JSON.stringify(enhancedResults, null, 2)
  );
  console.log(`\n💾 결과 저장: ./test-results/enhanced-test-results.json`);

  return enhancedResults;
}

if (require.main === module) {
  runEnhancedTest();
}

module.exports = { runEnhancedTest };
