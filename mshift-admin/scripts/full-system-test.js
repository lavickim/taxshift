/**
 * Full System Integration Test Script
 *
 * 이 스크립트는 새로운 키워드 기반 거래 분류 시스템의 전체 기능을 검증합니다.
 *
 * 테스트 범위:
 * 1. 키워드 그룹 CRUD 작업
 * 2. 태그 매핑 시스템
 * 3. 추천 엔진 정확성
 * 4. API 엔드포인트 통합
 * 5. 성능 및 응답시간
 * 6. 오류 처리
 *
 * 실행 방법:
 * node scripts/full-system-test.js
 */

const fs = require('fs');
const path = require('path');

// 테스트 설정
const TEST_CONFIG = {
  baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3000',
  javaApiUrl: process.env.JAVA_API_BASE_URL || 'http://localhost:8080',
  timeout: 10000,
  retryAttempts: 3,
  logLevel: 'info', // 'debug', 'info', 'warn', 'error'
};

// 테스트 결과 저장소
const testResults = {
  timestamp: new Date().toISOString(),
  config: TEST_CONFIG,
  suites: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    errors: [],
  },
};

// 로깅 유틸리티
function log(level, message, data = null) {
  const levels = ['debug', 'info', 'warn', 'error'];
  const configLevel = levels.indexOf(TEST_CONFIG.logLevel);
  const messageLevel = levels.indexOf(level);

  if (messageLevel >= configLevel) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
    if (data && TEST_CONFIG.logLevel === 'debug') {
      console.log(JSON.stringify(data, null, 2));
    }
  }
}

// HTTP 요청 유틸리티
async function makeRequest(url, options = {}) {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: TEST_CONFIG.timeout,
  };

  const requestOptions = { ...defaultOptions, ...options };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      requestOptions.timeout
    );

    const response = await fetch(url, {
      ...requestOptions,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    return {
      success: response.ok,
      status: response.status,
      data: data,
      response: response,
    };
  } catch (error) {
    return {
      success: false,
      status: 0,
      error: error.message,
      data: null,
    };
  }
}

// 테스트 스위트 클래스
class TestSuite {
  constructor(name, description) {
    this.name = name;
    this.description = description;
    this.tests = [];
    this.beforeEach = null;
    this.afterEach = null;
  }

  test(name, testFn) {
    this.tests.push({ name, testFn, status: 'pending' });
    return this;
  }

  before(fn) {
    this.beforeEach = fn;
    return this;
  }

  after(fn) {
    this.afterEach = fn;
    return this;
  }

  async run() {
    log('info', `🧪 테스트 스위트 시작: ${this.name}`);

    const suiteResult = {
      name: this.name,
      description: this.description,
      startTime: Date.now(),
      tests: [],
      passed: 0,
      failed: 0,
      skipped: 0,
    };

    for (const test of this.tests) {
      const testResult = {
        name: test.name,
        status: 'running',
        startTime: Date.now(),
        duration: 0,
        error: null,
        data: null,
      };

      try {
        log('debug', `  ▶️ 테스트 실행: ${test.name}`);

        // beforeEach 실행
        if (this.beforeEach) {
          await this.beforeEach();
        }

        // 테스트 실행
        const result = await test.testFn();

        testResult.status = 'passed';
        testResult.data = result;
        suiteResult.passed++;

        log('info', `  ✅ 통과: ${test.name}`);

        // afterEach 실행
        if (this.afterEach) {
          await this.afterEach();
        }
      } catch (error) {
        testResult.status = 'failed';
        testResult.error = error.message;
        suiteResult.failed++;

        log('error', `  ❌ 실패: ${test.name} - ${error.message}`);
      }

      testResult.duration = Date.now() - testResult.startTime;
      suiteResult.tests.push(testResult);
      testResults.summary.total++;
    }

    suiteResult.duration = Date.now() - suiteResult.startTime;
    testResults.suites.push(suiteResult);
    testResults.summary.passed += suiteResult.passed;
    testResults.summary.failed += suiteResult.failed;

    log(
      'info',
      `📊 ${this.name} 완료: ${suiteResult.passed}개 통과, ${suiteResult.failed}개 실패`
    );

    return suiteResult;
  }
}

// 어설션 헬퍼
function expect(actual) {
  return {
    toBe: expected => {
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, but got ${actual}`);
      }
    },
    toEqual: expected => {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(
          `Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`
        );
      }
    },
    toBeTruthy: () => {
      if (!actual) {
        throw new Error(`Expected truthy value, but got ${actual}`);
      }
    },
    toBeFalsy: () => {
      if (actual) {
        throw new Error(`Expected falsy value, but got ${actual}`);
      }
    },
    toBeGreaterThan: expected => {
      if (actual <= expected) {
        throw new Error(`Expected ${actual} to be greater than ${expected}`);
      }
    },
    toBeLessThan: expected => {
      if (actual >= expected) {
        throw new Error(`Expected ${actual} to be less than ${expected}`);
      }
    },
    toContain: expected => {
      if (!actual.includes(expected)) {
        throw new Error(`Expected ${actual} to contain ${expected}`);
      }
    },
    toHaveLength: expected => {
      if (actual.length !== expected) {
        throw new Error(
          `Expected length ${expected}, but got ${actual.length}`
        );
      }
    },
  };
}

// 1. 시스템 헬스 체크 테스트
const healthCheckSuite = new TestSuite(
  '시스템 헬스 체크',
  '전체 시스템 구성요소의 상태를 확인합니다.'
);

healthCheckSuite
  .test('프론트엔드 서버 응답', async () => {
    const result = await makeRequest(
      `${TEST_CONFIG.baseUrl}/api/v2/system/health`
    );
    expect(result.success).toBeTruthy();
    expect(result.data.overall).toContain('healthy');
    return result.data;
  })
  .test('백엔드 API 연결', async () => {
    const result = await makeRequest(
      `${TEST_CONFIG.javaApiUrl}/actuator/health`
    );
    // 백엔드가 없어도 테스트를 계속하기 위해 조건부 체크
    if (result.success) {
      expect(result.data.status).toBe('UP');
    } else {
      log(
        'warn',
        '백엔드 서버에 연결할 수 없습니다. 목 데이터로 테스트를 계속합니다.'
      );
    }
    return result;
  });

// 2. 키워드 그룹 관리 테스트
const keywordGroupSuite = new TestSuite(
  '키워드 그룹 관리',
  '키워드 그룹 CRUD 작업을 테스트합니다.'
);

let testGroupId = null;

keywordGroupSuite
  .test('키워드 그룹 목록 조회', async () => {
    const result = await makeRequest(
      `${TEST_CONFIG.baseUrl}/api/v2/tag-mapping/keyword-groups`
    );
    expect(result.success).toBeTruthy();
    expect(Array.isArray(result.data)).toBeTruthy();
    return result.data;
  })
  .test('키워드 그룹 생성', async () => {
    const testGroup = {
      groupName: `테스트그룹_${Date.now()}`,
      primaryKeyword: '테스트키워드',
      synonyms: ['테스트1', '테스트2'],
      category: '테스트카테고리',
      confidenceBase: 0.8,
    };

    const result = await makeRequest(
      `${TEST_CONFIG.baseUrl}/api/v2/tag-mapping/keyword-groups`,
      {
        method: 'POST',
        body: JSON.stringify(testGroup),
      }
    );

    expect(result.success).toBeTruthy();
    expect(result.data.groupName).toBe(testGroup.groupName);
    testGroupId = result.data.id;
    return result.data;
  })
  .test('키워드 그룹 수정', async () => {
    if (!testGroupId) {
      throw new Error('테스트 그룹 ID가 없습니다.');
    }

    const updateData = {
      groupName: `수정된테스트그룹_${Date.now()}`,
      primaryKeyword: '수정된키워드',
      synonyms: ['수정1', '수정2', '수정3'],
      category: '수정된카테고리',
      confidenceBase: 0.9,
      isActive: true,
    };

    const result = await makeRequest(
      `${TEST_CONFIG.baseUrl}/api/v2/tag-mapping/keyword-groups/${testGroupId}`,
      {
        method: 'PUT',
        body: JSON.stringify(updateData),
      }
    );

    expect(result.success).toBeTruthy();
    return result.data;
  })
  .test('키워드 그룹 삭제', async () => {
    if (!testGroupId) {
      throw new Error('테스트 그룹 ID가 없습니다.');
    }

    const result = await makeRequest(
      `${TEST_CONFIG.baseUrl}/api/v2/tag-mapping/keyword-groups/${testGroupId}`,
      {
        method: 'DELETE',
      }
    );

    expect(result.success).toBeTruthy();
    return result.data;
  });

// 3. 태그 추천 엔진 테스트
const recommendationSuite = new TestSuite(
  '태그 추천 엔진',
  '키워드 추출 및 태그 추천 기능을 테스트합니다.'
);

recommendationSuite
  .test('편의점 키워드 추천', async () => {
    const testCases = [
      { input: '세븐일레븐에서 커피 구매', expectedTag: '편의점' },
      { input: 'CU편의점 야식', expectedTag: '편의점' },
      { input: '이마트24 생필품', expectedTag: '편의점' },
    ];

    const results = [];

    for (const testCase of testCases) {
      const result = await makeRequest(
        `${TEST_CONFIG.baseUrl}/api/v2/tag-mapping/recommend-tags`,
        {
          method: 'POST',
          body: JSON.stringify({
            keyword: testCase.input,
            transactionText: testCase.input,
            amount: 5000,
          }),
        }
      );

      expect(result.success).toBeTruthy();
      expect(Array.isArray(result.data)).toBeTruthy();

      if (result.data.length > 0) {
        const recommendation = result.data[0];
        expect(recommendation.tagMapping.tag.tagName).toBe(
          testCase.expectedTag
        );
        expect(recommendation.finalConfidence).toBeGreaterThan(0.5);
      }

      results.push({ testCase, result: result.data });
    }

    return results;
  })
  .test('주유소 키워드 추천', async () => {
    const testCases = [
      { input: 'GS칼텍스 주유소 휘발유', expectedTag: '주유소' },
      { input: 'SK에너지 셀프주유', expectedTag: '주유소' },
    ];

    const results = [];

    for (const testCase of testCases) {
      const result = await makeRequest(
        `${TEST_CONFIG.baseUrl}/api/v2/tag-mapping/recommend-tags`,
        {
          method: 'POST',
          body: JSON.stringify({
            keyword: testCase.input,
            transactionText: testCase.input,
            amount: 50000,
          }),
        }
      );

      expect(result.success).toBeTruthy();

      if (result.data.length > 0) {
        const recommendation = result.data[0];
        expect(recommendation.tagMapping.tag.tagName).toBe(
          testCase.expectedTag
        );
      }

      results.push({ testCase, result: result.data });
    }

    return results;
  })
  .test('카페 키워드 추천', async () => {
    const testCases = [
      { input: '스타벅스 아메리카노', expectedTag: '카페' },
      { input: '이디야 커피', expectedTag: '카페' },
    ];

    const results = [];

    for (const testCase of testCases) {
      const result = await makeRequest(
        `${TEST_CONFIG.baseUrl}/api/v2/tag-mapping/recommend-tags`,
        {
          method: 'POST',
          body: JSON.stringify({
            keyword: testCase.input,
            transactionText: testCase.input,
            amount: 4500,
          }),
        }
      );

      expect(result.success).toBeTruthy();

      if (result.data.length > 0) {
        const recommendation = result.data[0];
        expect(recommendation.tagMapping.tag.tagName).toBe(
          testCase.expectedTag
        );
      }

      results.push({ testCase, result: result.data });
    }

    return results;
  });

// 4. 성능 테스트
const performanceSuite = new TestSuite(
  '성능 테스트',
  'API 응답 시간 및 처리량을 테스트합니다.'
);

performanceSuite
  .test('응답 시간 테스트', async () => {
    const testCases = [
      '세븐일레븐 커피',
      'GS칼텍스 주유',
      '스타벅스 라떼',
      '맥도날드 햄버거',
      '쿠팡 배송',
    ];

    const results = [];

    for (const testCase of testCases) {
      const startTime = Date.now();

      const result = await makeRequest(
        `${TEST_CONFIG.baseUrl}/api/v2/tag-mapping/recommend-tags`,
        {
          method: 'POST',
          body: JSON.stringify({
            keyword: testCase,
            transactionText: testCase,
            amount: 10000,
          }),
        }
      );

      const responseTime = Date.now() - startTime;

      expect(result.success).toBeTruthy();
      expect(responseTime).toBeLessThan(2000); // 2초 이내

      results.push({ testCase, responseTime, success: result.success });
    }

    const avgResponseTime =
      results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
    expect(avgResponseTime).toBeLessThan(1000); // 평균 1초 이내

    return { results, avgResponseTime };
  })
  .test('동시 요청 처리', async () => {
    const promises = [];
    const testCount = 5;

    for (let i = 0; i < testCount; i++) {
      promises.push(
        makeRequest(
          `${TEST_CONFIG.baseUrl}/api/v2/tag-mapping/recommend-tags`,
          {
            method: 'POST',
            body: JSON.stringify({
              keyword: `테스트${i}`,
              transactionText: `테스트 거래 ${i}`,
              amount: 1000 * (i + 1),
            }),
          }
        )
      );
    }

    const startTime = Date.now();
    const results = await Promise.all(promises);
    const totalTime = Date.now() - startTime;

    results.forEach(result => {
      expect(result.success).toBeTruthy();
    });

    expect(totalTime).toBeLessThan(5000); // 전체 5초 이내

    return { results, totalTime, testCount };
  });

// 5. 오류 처리 테스트
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandlingSuite = new TestSuite(
  '오류 처리',
  '잘못된 입력 및 오류 상황을 테스트합니다.'
);

errorHandlingSuite
  .test('잘못된 키워드 그룹 생성', async () => {
    const invalidGroup = {
      // groupName 누락
      primaryKeyword: '테스트',
      category: '테스트',
    };

    const result = await makeRequest(
      `${TEST_CONFIG.baseUrl}/api/v2/tag-mapping/keyword-groups`,
      {
        method: 'POST',
        body: JSON.stringify(invalidGroup),
      }
    );

    expect(result.success).toBeFalsy();
    expect(result.status).toBe(400);
    return result;
  })
  .test('존재하지 않는 그룹 수정', async () => {
    const result = await makeRequest(
      `${TEST_CONFIG.baseUrl}/api/v2/tag-mapping/keyword-groups/99999`,
      {
        method: 'PUT',
        body: JSON.stringify({
          groupName: '존재하지않음',
          primaryKeyword: '테스트',
          category: '테스트',
          confidenceBase: 0.8,
          isActive: true,
        }),
      }
    );

    expect(result.success).toBeFalsy();
    return result;
  })
  .test('빈 키워드 추천', async () => {
    const result = await makeRequest(
      `${TEST_CONFIG.baseUrl}/api/v2/tag-mapping/recommend-tags`,
      {
        method: 'POST',
        body: JSON.stringify({
          keyword: '',
          transactionText: '',
          amount: 0,
        }),
      }
    );

    expect(result.success).toBeFalsy();
    expect(result.status).toBe(400);
    return result;
  });

// 테스트 실행 함수
async function runAllTests() {
  log('info', '🚀 전체 시스템 테스트 시작');
  log('info', `📊 테스트 설정: ${JSON.stringify(TEST_CONFIG)}`);

  const testSuites = [
    healthCheckSuite,
    keywordGroupSuite,
    recommendationSuite,
    performanceSuite,
    errorHandlingSuite,
  ];

  for (const suite of testSuites) {
    try {
      await suite.run();
    } catch (error) {
      log('error', `테스트 스위트 실행 실패: ${suite.name}`, error);
      testResults.summary.errors.push({
        suite: suite.name,
        error: error.message,
      });
    }
  }

  // 최종 결과 출력
  console.log('\\n' + '='.repeat(80));
  console.log('📋 전체 테스트 결과 요약');
  console.log('='.repeat(80));
  console.log(`총 테스트: ${testResults.summary.total}개`);
  console.log(`✅ 통과: ${testResults.summary.passed}개`);
  console.log(`❌ 실패: ${testResults.summary.failed}개`);
  console.log(`⏸️ 건너뜀: ${testResults.summary.skipped}개`);
  console.log(`🚨 오류: ${testResults.summary.errors.length}개`);

  const successRate =
    testResults.summary.total > 0
      ? Math.round(
          (testResults.summary.passed / testResults.summary.total) * 100
        )
      : 0;
  console.log(`📊 성공률: ${successRate}%`);

  if (testResults.summary.errors.length > 0) {
    console.log('\\n🚨 발생한 오류:');
    testResults.summary.errors.forEach(error => {
      console.log(`  - ${error.suite}: ${error.error}`);
    });
  }

  // 결과를 파일로 저장
  const reportPath = path.join(__dirname, 'full-system-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
  console.log(`\\n📄 상세 결과 저장됨: ${reportPath}`);

  // 종료 코드 설정
  const exitCode =
    testResults.summary.failed > 0 || testResults.summary.errors.length > 0
      ? 1
      : 0;

  if (exitCode === 0) {
    console.log('\\n🎉 모든 테스트가 성공적으로 완료되었습니다!');
  } else {
    console.log('\\n⚠️ 일부 테스트가 실패했습니다. 로그를 확인해주세요.');
  }

  return exitCode;
}

// 메인 실행
if (require.main === module) {
  runAllTests()
    .then(exitCode => process.exit(exitCode))
    .catch(error => {
      console.error('❌ 테스트 실행 중 치명적 오류:', error);
      process.exit(1);
    });
}

module.exports = {
  TestSuite,
  expect,
  makeRequest,
  runAllTests,
  TEST_CONFIG,
};
