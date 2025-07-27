#!/usr/bin/env node

/**
 * 최종 키워드 패턴 테스트 스크립트
 * 75%+ 목표 달성 검증
 */

const fs = require('fs');
const path = require('path');
const { classifyTransactionFinal } = require('./final-keyword-patterns.js');

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

function runFinalTest() {
  const testCases = extractTestCasesFromMarkdown();
  console.log('🚀 최종 키워드 패턴으로 대규모 테스트 시작');
  console.log(`📋 총 ${testCases.length}개 테스트 케이스\n`);

  let successCount = 0;
  let failureCount = 0;
  const categoryStats = {};
  const unmatchedCases = [];

  // 분류 테스트 실행
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    const result = classifyTransactionFinal(testCase);

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
  console.log('📊 최종 키워드 패턴 테스트 결과');
  console.log('='.repeat(80));
  console.log(`총 테스트: ${testCases.length}개`);
  console.log(`성공: ${successCount}개 (${successRate}%)`);
  console.log(
    `실패: ${failureCount}개 (${Math.round((failureCount / testCases.length) * 100)}%)`
  );

  // 진화 과정 비교
  console.log(`\n📈 패턴 진화 과정:`);
  console.log(`46% (기본) → 55% (향상) → ${successRate}% (최종)`);

  // 목표 달성 여부
  if (successRate >= 75) {
    console.log(`🎉 목표 달성! ${successRate}%는 75% 목표를 초과했습니다.`);
  } else {
    console.log(
      `⚠️  목표 미달성. ${successRate}%는 75% 목표에 ${75 - successRate}%p 부족합니다.`
    );
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
    `\n❌ 여전히 매칭되지 않는 케이스 (${unmatchedCases.length}개 중 상위 20개)`
  );
  console.log('-'.repeat(50));
  unmatchedCases.slice(0, 20).forEach((case_, index) => {
    console.log(`${(index + 1).toString().padStart(2)}. ${case_}`);
  });

  // MVP 준비도 평가
  console.log('\n🏆 MVP 준비도 평가');
  console.log('-'.repeat(50));
  if (successRate >= 80) {
    console.log('✅ 우수: MVP 런칭 준비 완료');
  } else if (successRate >= 70) {
    console.log('✅ 양호: MVP 런칭 가능, 추가 개선 권장');
  } else if (successRate >= 60) {
    console.log('⚠️  보통: MVP 런칭 전 패턴 보강 필요');
  } else {
    console.log('❌ 부족: 추가 패턴 개발 필수');
  }

  // 결과 저장
  const finalResults = {
    timestamp: new Date().toISOString(),
    testInfo: {
      totalTests: testCases.length,
      successCount,
      failureCount,
      successRate,
    },
    evolution: {
      basic: 46,
      enhanced: 55,
      final: successRate,
    },
    categoryStats,
    unmatchedCases: unmatchedCases.slice(0, 100),
    mvpReadiness: {
      targetRate: 75,
      achieved: successRate >= 75,
      rating:
        successRate >= 80
          ? '우수'
          : successRate >= 70
            ? '양호'
            : successRate >= 60
              ? '보통'
              : '부족',
    },
    recommendations: [],
  };

  if (successRate < 75) {
    finalResults.recommendations.push(
      '75% 목표 달성을 위해 추가 키워드 패턴이 필요합니다.'
    );
  }

  if (unmatchedCases.length > 50) {
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
      .slice(0, 15)
      .map(([word]) => word);

    if (commonWords.length > 0) {
      finalResults.recommendations.push(
        `자주 나타나는 미매칭 패턴: ${commonWords.join(', ')}`
      );
    }
  }

  const outputDir = path.join(__dirname, 'test-results');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(outputDir, 'final-test-results.json'),
    JSON.stringify(finalResults, null, 2)
  );
  console.log(`\n💾 결과 저장: ./test-results/final-test-results.json`);

  return finalResults;
}

if (require.main === module) {
  runFinalTest();
}

module.exports = { runFinalTest };
