const puppeteer = require('puppeteer');
const path = require('path');

// 테스트 설정
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  timeout: 30000,
  headless: true,  // 자동 테스트를 위해 headless 모드
  slowMo: 100,     
  devtools: false, 
  viewport: {
    width: 1920,
    height: 1080
  }
};

// 테스트 데이터
const TEST_RULE = {
  pattern: '(GS칼텍스|SK엔크린|현대오일뱅크)\\s*(주유소|가스스테이션)',
  category: '주유소',
  description: 'E2E 테스트용 주유소 규칙',
  priority: 75,
  confidence: 0.9,
  normalizer_type: 'gas_station',
  replacement: '주유소',
  enabled: true
};

const TEST_INPUT = 'GS칼텍스 주유소에서 기름 넣음';

class PuppeteerRuleManagementTest {
  constructor() {
    this.browser = null;
    this.page = null;
    this.testResults = [];
  }

  async initialize() {
    console.log('🚀 Puppeteer E2E 테스트 시작...');
    
    this.browser = await puppeteer.launch({
      headless: TEST_CONFIG.headless,
      slowMo: TEST_CONFIG.slowMo,
      devtools: TEST_CONFIG.devtools,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    this.page = await this.browser.newPage();
    await this.page.setViewport(TEST_CONFIG.viewport);
    
    // 콘솔 에러 캐치 (더 상세하게)
    this.page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      
      if (type === 'error') {
        console.error('🔴 Console Error:', text);
        this.addTestResult('콘솔 에러 감지', false, `Console Error: ${text}`);
      } else if (type === 'warning' && text.includes('Error')) {
        console.warn('⚠️ Console Warning:', text);
      }
    });

    // 페이지 에러 캐치
    this.page.on('pageerror', error => {
      console.error('🚨 Page Error:', error.message);
      this.addTestResult('페이지 에러 감지', false, `Page Error: ${error.message}`);
    });

    // 요청 실패 모니터링
    this.page.on('response', response => {
      if (response.status() >= 400) {
        console.error(`❌ HTTP Error: ${response.status()} ${response.url()}`);
        this.addTestResult('HTTP 에러 감지', false, `HTTP ${response.status()}: ${response.url()}`);
      }
    });

    // 리소스 로딩 실패 모니터링
    this.page.on('requestfailed', request => {
      console.error('💥 Request Failed:', request.url(), request.failure().errorText);
      this.addTestResult('리소스 로딩 실패', false, `Failed to load: ${request.url()}`);
    });
  }

  async navigateToRuleManagement() {
    console.log('📍 규칙 관리 페이지로 이동 중...');
    
    await this.page.goto(TEST_CONFIG.baseUrl, { 
      waitUntil: 'networkidle2',
      timeout: TEST_CONFIG.timeout 
    });

    // 규칙 관리 버튼 클릭 (텍스트로 찾기)
    await this.page.waitForFunction(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(btn => btn.textContent.includes('규칙 관리'));
    }, { timeout: 10000 });
    
    await this.page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const ruleManagementBtn = buttons.find(btn => btn.textContent.includes('규칙 관리'));
      if (ruleManagementBtn) ruleManagementBtn.click();
    });

    // 규칙 관리 페이지가 로드될 때까지 대기
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 현재 페이지의 탭들을 확인
    const availableTabs = await this.page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('[role="tab"], [data-value]'));
      return tabs.map(tab => ({
        text: tab.textContent,
        dataValue: tab.getAttribute('data-value'),
        tagName: tab.tagName
      }));
    });
    console.log('🔍 사용 가능한 탭들:', availableTabs);

    // DB 정규식 탭 클릭 (텍스트로 찾기)
    await this.page.waitForFunction(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(btn => btn.textContent.includes('DB 정규식'));
    }, { timeout: 10000 });
    
    await this.page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const dbRegexTab = buttons.find(btn => btn.textContent.includes('DB 정규식'));
      if (dbRegexTab) dbRegexTab.click();
    });

    // 페이지 로딩 대기
    await this.page.waitForFunction(() => {
      const headings = Array.from(document.querySelectorAll('h2'));
      return headings.find(h => h.textContent.includes('정규식 규칙 관리'));
    }, { timeout: 10000 });
    
    // 페이지 에러 체크
    await this.checkPageErrors();
    
    console.log('✅ 규칙 관리 페이지 로딩 완료');
    this.addTestResult('페이지 네비게이션', true, '규칙 관리 페이지 접근 성공');
  }

  async testRuleCreation() {
    console.log('🔧 새 규칙 생성 테스트 시작...');
    
    try {
      // 새 규칙 추가 버튼 클릭
      await this.page.waitForFunction(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.find(btn => btn.textContent.includes('새 규칙 추가'));
      }, { timeout: 10000 });
      
      await this.page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const addBtn = buttons.find(btn => btn.textContent.includes('새 규칙 추가'));
        if (addBtn) addBtn.click();
      });

      // 대화상자 대기
      await this.page.waitForSelector('[role="dialog"]', { timeout: 10000 });

      // 폼 필드 입력
      await this.page.fill('input[id="pattern"]', TEST_RULE.pattern);
      await this.page.fill('input[id="description"]', TEST_RULE.description);
      await this.page.fill('input[id="priority"]', TEST_RULE.priority.toString());
      await this.page.fill('input[id="confidence"]', TEST_RULE.confidence.toString());
      await this.page.fill('input[id="replacement"]', TEST_RULE.replacement);

      // 카테고리 선택
      await this.page.click('button[role="combobox"]:has-text("카테고리 선택")');
      await this.page.waitForSelector(`[data-value="${TEST_RULE.category}"]`, { timeout: 5000 });
      await this.page.click(`[data-value="${TEST_RULE.category}"]`);

      // 정규화 타입 선택
      await this.page.click('button[role="combobox"]:has-text("정규화 타입 선택")');
      await this.page.waitForSelector(`[data-value="${TEST_RULE.normalizer_type}"]`, { timeout: 5000 });
      await this.page.click(`[data-value="${TEST_RULE.normalizer_type}"]`);

      // 활성화 스위치 확인 (기본값이 true이므로 변경하지 않음)
      const switchElement = await this.page.$('input[id="enabled"]');
      const isChecked = await switchElement.evaluate(el => el.checked);
      if (!isChecked) {
        await this.page.click('label[for="enabled"]');
      }

      // 생성 버튼 클릭
      await this.page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const createBtn = buttons.find(btn => btn.textContent.includes('생성'));
        if (createBtn) createBtn.click();
      });

      // 성공 토스트 메시지 대기
      await this.page.waitForFunction(() => {
        const divs = Array.from(document.querySelectorAll('div'));
        return divs.find(div => div.textContent.includes('새 규칙이 생성되었습니다'));
      }, { timeout: 10000 });
      
      // 대화상자 닫힘 대기
      await this.page.waitForSelector('[role="dialog"]', { hidden: true, timeout: 10000 });

      // 페이지 에러 체크
      await this.checkPageErrors();

      console.log('✅ 규칙 생성 완료');
      this.addTestResult('규칙 생성', true, '새 규칙이 성공적으로 생성됨');
      
    } catch (error) {
      console.error('❌ 규칙 생성 실패:', error.message);
      this.addTestResult('규칙 생성', false, error.message);
    }
  }

  async testRuleList() {
    console.log('📋 규칙 목록 확인 테스트 시작...');
    
    try {
      // 규칙 테이블 대기
      await this.page.waitForSelector('table', { timeout: 10000 });

      // 테이블 행 개수 확인
      const rows = await this.page.$$('table tbody tr');
      console.log(`📊 총 ${rows.length}개의 규칙 발견`);

      // 생성한 규칙 찾기
      const ruleFound = await this.page.evaluate((pattern) => {
        const rows = document.querySelectorAll('table tbody tr');
        for (let row of rows) {
          const patternCell = row.querySelector('td:first-child');
          if (patternCell && patternCell.textContent.includes(pattern)) {
            return true;
          }
        }
        return false;
      }, TEST_RULE.pattern);

      if (ruleFound) {
        console.log('✅ 생성한 규칙이 목록에서 확인됨');
        this.addTestResult('규칙 목록 확인', true, '생성한 규칙이 목록에 표시됨');
      } else {
        console.log('❌ 생성한 규칙이 목록에서 발견되지 않음');
        this.addTestResult('규칙 목록 확인', false, '생성한 규칙이 목록에 없음');
      }
      
    } catch (error) {
      console.error('❌ 규칙 목록 확인 실패:', error.message);
      this.addTestResult('규칙 목록 확인', false, error.message);
    }
  }

  async testAPITesting() {
    console.log('🧪 API 테스트 기능 테스트 시작...');
    
    try {
      // API 테스트 탭 클릭
      await this.page.waitForSelector('button[data-value="test"]', { timeout: 10000 });
      await this.page.click('button[data-value="test"]');

      // 테스트 입력 필드 대기
      await this.page.waitForSelector('textarea[id="testInput"]', { timeout: 10000 });

      // 테스트 입력 텍스트 입력
      await this.page.fill('textarea[id="testInput"]', TEST_INPUT);

      // API 테스트 버튼 클릭
      await this.page.click('button:has-text("API 테스트")');

      // 테스트 결과 대기
      await this.page.waitForSelector('div:has-text("테스트 결과")', { timeout: 15000 });

      // 결과 확인
      const resultFound = await this.page.evaluate(() => {
        const resultSection = document.querySelector('div:has-text("테스트 결과")');
        if (resultSection) {
          const processedText = resultSection.querySelector('div:has-text("처리된 텍스트")');
          const matchedRules = resultSection.querySelector('div:has-text("매칭된 규칙들")');
          return processedText && matchedRules;
        }
        return false;
      });

      if (resultFound) {
        console.log('✅ API 테스트 결과 확인 완료');
        this.addTestResult('API 테스트', true, 'API 테스트가 성공적으로 실행됨');
      } else {
        console.log('❌ API 테스트 결과를 찾을 수 없음');
        this.addTestResult('API 테스트', false, 'API 테스트 결과 없음');
      }
      
    } catch (error) {
      console.error('❌ API 테스트 실패:', error.message);
      this.addTestResult('API 테스트', false, error.message);
    }
  }

  async testRuleEdit() {
    console.log('✏️ 규칙 편집 테스트 시작...');
    
    try {
      // 규칙 관리 탭으로 돌아가기
      await this.page.click('button[data-value="rules"]');
      await this.page.waitForSelector('table', { timeout: 10000 });

      // 첫 번째 규칙의 편집 버튼 클릭
      await this.page.waitForSelector('button:has(svg)', { timeout: 10000 });
      const editButtons = await this.page.$$('button:has(svg)');
      
      if (editButtons.length > 0) {
        // 편집 버튼 클릭 (첫 번째 버튼이 편집 버튼)
        await editButtons[0].click();

        // 편집 대화상자 대기
        await this.page.waitForSelector('[role="dialog"]', { timeout: 10000 });

        // 설명 필드 수정
        const updatedDescription = TEST_RULE.description + ' (수정됨)';
        await this.page.fill('input[id="description"]', updatedDescription);

        // 수정 버튼 클릭
        await this.page.click('button:has-text("수정")');

        // 성공 토스트 대기
        await this.page.waitForSelector('div:has-text("규칙이 수정되었습니다")', { timeout: 10000 });

        console.log('✅ 규칙 편집 완료');
        this.addTestResult('규칙 편집', true, '규칙이 성공적으로 수정됨');
      } else {
        console.log('❌ 편집 버튼을 찾을 수 없음');
        this.addTestResult('규칙 편집', false, '편집 버튼 없음');
      }
      
    } catch (error) {
      console.error('❌ 규칙 편집 실패:', error.message);
      this.addTestResult('규칙 편집', false, error.message);
    }
  }

  async testCacheRefresh() {
    console.log('🔄 캐시 새로고침 테스트 시작...');
    
    try {
      // 캐시 새로고침 버튼 클릭
      await this.page.waitForSelector('button:has-text("캐시 새로고침")', { timeout: 10000 });
      await this.page.click('button:has-text("캐시 새로고침")');

      // 잠시 대기 (캐시 새로고침 완료)
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('✅ 캐시 새로고침 완료');
      this.addTestResult('캐시 새로고침', true, '캐시가 성공적으로 새로고침됨');
      
    } catch (error) {
      console.error('❌ 캐시 새로고침 실패:', error.message);
      this.addTestResult('캐시 새로고침', false, error.message);
    }
  }

  async cleanup() {
    console.log('🧹 테스트 정리 중...');
    
    try {
      // 생성한 테스트 규칙 삭제
      await this.page.goto(`${TEST_CONFIG.baseUrl}`, { waitUntil: 'networkidle2' });
      await this.page.click('button:has-text("규칙 관리")');
      await this.page.click('[data-value="db-regex"]');
      await this.page.waitForSelector('table', { timeout: 10000 });

      // 테스트 규칙 찾아서 삭제
      const deleted = await this.page.evaluate((pattern) => {
        const rows = document.querySelectorAll('table tbody tr');
        for (let row of rows) {
          const patternCell = row.querySelector('td:first-child');
          if (patternCell && patternCell.textContent.includes(pattern)) {
            const deleteButton = row.querySelector('button:last-child');
            if (deleteButton) {
              deleteButton.click();
              return true;
            }
          }
        }
        return false;
      }, TEST_RULE.pattern);

      if (deleted) {
        // 삭제 확인 대화상자에서 확인 클릭
        await new Promise(resolve => setTimeout(resolve, 500));
        await this.page.evaluate(() => {
          const confirmButton = document.querySelector('button:has-text("확인")');
          if (confirmButton) confirmButton.click();
        });
        
        console.log('✅ 테스트 데이터 정리 완료');
      }
      
    } catch (error) {
      console.error('❌ 테스트 정리 실패:', error.message);
    }
  }

  async checkPageErrors() {
    console.log('🔍 페이지 에러 체크 중...');
    
    // JavaScript 에러 체크
    const errors = await this.page.evaluate(() => {
      const errors = [];
      
      // 전역 에러 리스너 확인
      if (window.pageErrors && window.pageErrors.length > 0) {
        errors.push(...window.pageErrors);
      }
      
      // React Error Boundary 확인
      const errorBoundaries = document.querySelectorAll('[data-error-boundary]');
      errorBoundaries.forEach(boundary => {
        if (boundary.textContent.includes('Error') || boundary.textContent.includes('error')) {
          errors.push(`Error Boundary: ${boundary.textContent.substring(0, 100)}`);
        }
      });
      
      // 404나 기타 에러 메시지 확인
      const body = document.body.textContent;
      if (body.includes('404') || body.includes('Internal Server Error') || body.includes('Application error')) {
        errors.push('Page content contains error indicators');
      }
      
      return errors;
    });
    
    if (errors.length > 0) {
      console.error('❌ 페이지 에러 발견:', errors);
      this.addTestResult('페이지 에러 체크', false, `페이지 에러: ${errors.join(', ')}`);
    } else {
      console.log('✅ 페이지 에러 없음');
      this.addTestResult('페이지 에러 체크', true, '페이지가 에러 없이 로드됨');
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
    console.log('\n📊 테스트 결과 보고서');
    console.log('='.repeat(50));
    
    const passedTests = this.testResults.filter(t => t.passed).length;
    const totalTests = this.testResults.length;
    const passRate = ((passedTests / totalTests) * 100).toFixed(1);

    console.log(`총 테스트: ${totalTests}`);
    console.log(`성공: ${passedTests}`);
    console.log(`실패: ${totalTests - passedTests}`);
    console.log(`성공률: ${passRate}%`);
    console.log('='.repeat(50));

    this.testResults.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      console.log(`${status} ${result.name}: ${result.message}`);
    });

    console.log('='.repeat(50));
    console.log(`테스트 완료 시간: ${new Date().toLocaleString()}`);
  }

  async run() {
    try {
      await this.initialize();
      await this.navigateToRuleManagement();
      await this.testRuleCreation();
      await this.testRuleList();
      await this.testAPITesting();
      await this.testRuleEdit();
      await this.testCacheRefresh();
      await this.cleanup();
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
  const test = new PuppeteerRuleManagementTest();
  await test.run();
})();