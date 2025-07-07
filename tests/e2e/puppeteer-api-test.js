const puppeteer = require('puppeteer');

// 테스트 설정
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  apiUrl: 'http://localhost:8080/api',
  timeout: 30000,
  headless: false,
  slowMo: 100,
  viewport: {
    width: 1920,
    height: 1080
  }
};

// 테스트 케이스들
const TEST_CASES = [
  {
    name: '주유소 테스트',
    input: 'GS25 주유소에서 기름 넣음',
    category: '주유소',
    expectedMatches: true
  },
  {
    name: '편의점 테스트',
    input: '세븐일레븐에서 음료수 구매',
    category: '편의점',
    expectedMatches: true
  },
  {
    name: '카센터 테스트',
    input: '현대자동차서비스센터에서 수리',
    category: '카센터',
    expectedMatches: true
  },
  {
    name: '온라인서비스 테스트',
    input: '네이버페이로 결제',
    category: '온라인서비스',
    expectedMatches: true
  },
  {
    name: '매칭 없음 테스트',
    input: '알 수 없는 상점에서 결제',
    category: '',
    expectedMatches: false
  }
];

class PuppeteerAPITest {
  constructor() {
    this.browser = null;
    this.page = null;
    this.testResults = [];
  }

  async initialize() {
    console.log('🚀 API 테스트 시작...');
    
    this.browser = await puppeteer.launch({
      headless: TEST_CONFIG.headless,
      slowMo: TEST_CONFIG.slowMo,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    this.page = await this.browser.newPage();
    await this.page.setViewport(TEST_CONFIG.viewport);
    
    // 네트워크 응답 모니터링
    this.page.on('response', response => {
      if (response.url().includes('/api/') && response.status() >= 400) {
        console.error(`❌ API Error: ${response.status()} ${response.url()}`);
      }
    });

    // 콘솔 에러 캐치
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('🔴 Page Error:', msg.text());
      }
    });
  }

  async navigateToAPITest() {
    console.log('📍 API 테스트 페이지로 이동 중...');
    
    await this.page.goto(TEST_CONFIG.baseUrl, { 
      waitUntil: 'networkidle2',
      timeout: TEST_CONFIG.timeout 
    });

    // 규칙 관리 버튼 클릭
    await this.page.waitForSelector('button:has-text("규칙 관리")', { timeout: 10000 });
    await this.page.click('button:has-text("규칙 관리")');

    // DB 정규식 탭 클릭
    await this.page.waitForSelector('[data-value="db-regex"]', { timeout: 10000 });
    await this.page.click('[data-value="db-regex"]');

    // API 테스트 탭 클릭
    await this.page.waitForSelector('button[data-value="test"]', { timeout: 10000 });
    await this.page.click('button[data-value="test"]');

    // 페이지 로딩 대기
    await this.page.waitForSelector('textarea[id="testInput"]', { timeout: 10000 });
    
    console.log('✅ API 테스트 페이지 로딩 완료');
    this.addTestResult('페이지 네비게이션', true, 'API 테스트 페이지 접근 성공');
  }

  async runSingleTest(testCase) {
    console.log(`🧪 테스트 실행: ${testCase.name}`);
    
    try {
      // 기존 입력 클리어
      await this.page.evaluate(() => {
        const textarea = document.querySelector('textarea[id="testInput"]');
        if (textarea) textarea.value = '';
      });

      // 테스트 입력 텍스트 입력
      await this.page.fill('textarea[id="testInput"]', testCase.input);

      // 카테고리 선택 (카테고리가 있는 경우)
      if (testCase.category) {
        await this.page.click('button[role="combobox"]:has-text("전체 카테고리")');
        await this.page.waitForSelector(`[data-value="${testCase.category}"]`, { timeout: 5000 });
        await this.page.click(`[data-value="${testCase.category}"]`);
      }

      // API 테스트 버튼 클릭
      await this.page.click('button:has-text("API 테스트")');

      // 로딩 상태 확인
      await this.page.waitForSelector('button:has-text("테스트 중...")', { timeout: 2000 });

      // 테스트 결과 대기
      await this.page.waitForSelector('div:has-text("테스트 결과")', { timeout: 15000 });

      // 결과 분석
      const result = await this.page.evaluate(() => {
        const resultSection = document.querySelector('div:has-text("테스트 결과")');
        if (!resultSection) return null;

        const successIcon = resultSection.querySelector('svg.text-green-600');
        const errorIcon = resultSection.querySelector('svg.text-red-600');
        const isSuccess = !!successIcon;
        const isError = !!errorIcon;

        let matchedRulesCount = 0;
        let processedText = '';
        let originalText = '';

        if (isSuccess) {
          // 매칭된 규칙 수 확인
          const matchedRulesText = resultSection.querySelector('div:has-text("매칭된 규칙들")');
          if (matchedRulesText) {
            const countMatch = matchedRulesText.textContent.match(/\((\d+)개\)/);
            if (countMatch) {
              matchedRulesCount = parseInt(countMatch[1]);
            }
          }

          // 처리된 텍스트 확인
          const processedTextElement = resultSection.querySelector('div:has-text("처리된 텍스트")');
          if (processedTextElement) {
            const textDiv = processedTextElement.parentElement.querySelector('div.p-3');
            if (textDiv) processedText = textDiv.textContent;
          }

          // 원본 텍스트 확인
          const originalTextElement = resultSection.querySelector('div:has-text("원본 텍스트")');
          if (originalTextElement) {
            const textDiv = originalTextElement.parentElement.querySelector('div.p-3');
            if (textDiv) originalText = textDiv.textContent;
          }
        }

        return {
          success: isSuccess,
          error: isError,
          matchedRulesCount,
          processedText,
          originalText
        };
      });

      // 결과 검증
      if (result) {
        const testPassed = this.validateTestResult(testCase, result);
        const message = this.formatTestMessage(testCase, result);
        
        if (testPassed) {
          console.log(`✅ ${testCase.name} 성공: ${message}`);
          this.addTestResult(testCase.name, true, message);
        } else {
          console.log(`❌ ${testCase.name} 실패: ${message}`);
          this.addTestResult(testCase.name, false, message);
        }
      } else {
        console.log(`❌ ${testCase.name} 실패: 결과를 읽을 수 없음`);
        this.addTestResult(testCase.name, false, '결과를 읽을 수 없음');
      }

      // 다음 테스트를 위한 대기
      await this.page.waitForTimeout(1000);
      
    } catch (error) {
      console.error(`❌ ${testCase.name} 실패:`, error.message);
      this.addTestResult(testCase.name, false, error.message);
    }
  }

  validateTestResult(testCase, result) {
    if (testCase.expectedMatches) {
      return result.success && result.matchedRulesCount > 0;
    } else {
      return result.success && result.matchedRulesCount === 0;
    }
  }

  formatTestMessage(testCase, result) {
    return `입력: "${testCase.input}", 매칭된 규칙: ${result.matchedRulesCount}개, 처리된 텍스트: "${result.processedText}"`;
  }

  async testDirectAPICall() {
    console.log('🔗 직접 API 호출 테스트 시작...');
    
    try {
      const testCase = TEST_CASES[0]; // 첫 번째 테스트 케이스 사용
      
      const response = await this.page.evaluate(async (apiUrl, testInput) => {
        const response = await fetch(`${apiUrl}/rule-engine/match`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputText: testInput,
            returnAllMatches: true
          }),
        });
        
        const data = await response.json();
        return {
          status: response.status,
          ok: response.ok,
          data: data
        };
      }, TEST_CONFIG.apiUrl, testCase.input);

      if (response.ok && response.data) {
        console.log(`✅ 직접 API 호출 성공: ${response.data.matchedRules?.length || 0}개 규칙 매칭`);
        this.addTestResult('직접 API 호출', true, `${response.data.matchedRules?.length || 0}개 규칙 매칭`);
      } else {
        console.log(`❌ 직접 API 호출 실패: ${response.status}`);
        this.addTestResult('직접 API 호출', false, `HTTP ${response.status}`);
      }
      
    } catch (error) {
      console.error('❌ 직접 API 호출 실패:', error.message);
      this.addTestResult('직접 API 호출', false, error.message);
    }
  }

  async testPerformance() {
    console.log('⚡ 성능 테스트 시작...');
    
    try {
      const testCase = TEST_CASES[0];
      const iterations = 5;
      const times = [];

      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();
        
        // 테스트 입력
        await this.page.fill('textarea[id="testInput"]', testCase.input);
        
        // API 테스트 실행
        await this.page.click('button:has-text("API 테스트")');
        
        // 결과 대기
        await this.page.waitForSelector('div:has-text("테스트 결과")', { timeout: 15000 });
        
        const endTime = Date.now();
        times.push(endTime - startTime);
        
        await this.page.waitForTimeout(500);
      }

      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const minTime = Math.min(...times);
      const maxTime = Math.max(...times);

      console.log(`✅ 성능 테스트 완료: 평균 ${avgTime.toFixed(0)}ms, 최소 ${minTime}ms, 최대 ${maxTime}ms`);
      this.addTestResult('성능 테스트', true, `평균 ${avgTime.toFixed(0)}ms (${iterations}회 반복)`);
      
    } catch (error) {
      console.error('❌ 성능 테스트 실패:', error.message);
      this.addTestResult('성능 테스트', false, error.message);
    }
  }

  addTestResult(testName, passed, message) {
    this.testResults.push({
      name: testName,
      passed,
      message,
      timestamp: new Date().toISOString()
    });
  }

  async generateReport() {
    console.log('\n📊 API 테스트 결과 보고서');
    console.log('='.repeat(60));
    
    const passedTests = this.testResults.filter(t => t.passed).length;
    const totalTests = this.testResults.length;
    const passRate = ((passedTests / totalTests) * 100).toFixed(1);

    console.log(`총 테스트: ${totalTests}`);
    console.log(`성공: ${passedTests}`);
    console.log(`실패: ${totalTests - passedTests}`);
    console.log(`성공률: ${passRate}%`);
    console.log('='.repeat(60));

    // 카테고리별 결과
    const categoryResults = {};
    this.testResults.forEach(result => {
      const category = result.name.includes('테스트') ? '기능 테스트' : '기타';
      if (!categoryResults[category]) {
        categoryResults[category] = { passed: 0, total: 0 };
      }
      categoryResults[category].total++;
      if (result.passed) categoryResults[category].passed++;
    });

    console.log('\n📈 카테고리별 결과:');
    Object.entries(categoryResults).forEach(([category, stats]) => {
      const rate = ((stats.passed / stats.total) * 100).toFixed(1);
      console.log(`  ${category}: ${stats.passed}/${stats.total} (${rate}%)`);
    });

    console.log('\n📝 상세 결과:');
    this.testResults.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      console.log(`${status} ${result.name}: ${result.message}`);
    });

    console.log('='.repeat(60));
    console.log(`테스트 완료 시간: ${new Date().toLocaleString()}`);
  }

  async run() {
    try {
      await this.initialize();
      await this.navigateToAPITest();
      
      // 각 테스트 케이스 실행
      for (const testCase of TEST_CASES) {
        await this.runSingleTest(testCase);
      }
      
      await this.testDirectAPICall();
      await this.testPerformance();
      await this.generateReport();
      
    } catch (error) {
      console.error('🚨 테스트 실행 중 오류 발생:', error);
      this.addTestResult('전체 테스트', false, error.message);
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }
}

// 테스트 실행
(async () => {
  const test = new PuppeteerAPITest();
  await test.run();
})();