const puppeteer = require('puppeteer');
const { spawn } = require('child_process');
const path = require('path');

class NetworkTabTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.expoProcess = null;
    this.apiLogs = [];
    this.consoleLogs = [];
  }

  async initialize() {
    console.log('🚀 네트워크 탭 확인 테스트 시작...');
    console.log('===========================================');
    
    // Puppeteer 브라우저 시작
    this.browser = await puppeteer.launch({
      headless: false,
      devtools: true,
      defaultViewport: {
        width: 1200,
        height: 800,
      },
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--auto-open-devtools-for-tabs',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });

    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1200, height: 800 });

    // 콘솔 로그 캡처
    this.page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      const timestamp = new Date().toLocaleTimeString();
      
      this.consoleLogs.push({ timestamp, type, text });
      
      if (text.includes('API') || text.includes('api') || text.includes('fetch') || text.includes('Transaction')) {
        console.log(`📱 [${type.toUpperCase()}] ${timestamp} - ${text}`);
      }
    });

    // 네트워크 요청 모니터링
    this.page.on('request', request => {
      const url = request.url();
      const method = request.method();
      const timestamp = new Date().toLocaleTimeString();
      
      if (url.includes('api/') || url.includes('localhost:8080')) {
        const logEntry = { timestamp, method, url, type: 'request' };
        this.apiLogs.push(logEntry);
        console.log(`🌐 [요청] ${timestamp} - ${method} ${url}`);
      }
    });

    this.page.on('response', async response => {
      const url = response.url();
      const status = response.status();
      const timestamp = new Date().toLocaleTimeString();
      
      if (url.includes('api/') || url.includes('localhost:8080')) {
        try {
          const responseText = await response.text();
          const logEntry = { timestamp, status, url, type: 'response', body: responseText };
          this.apiLogs.push(logEntry);
          
          console.log(`✅ [응답] ${timestamp} - ${status} ${url}`);
          console.log(`   📦 응답: ${responseText.substring(0, 100)}${responseText.length > 100 ? '...' : ''}`);
        } catch (e) {
          console.log(`✅ [응답] ${timestamp} - ${status} ${url} (응답 내용 읽기 실패)`);
        }
      }
    });
  }

  async startExpoApp() {
    console.log('📱 Expo 웹 앱 시작 중...');
    
    return new Promise((resolve, reject) => {
      this.expoProcess = spawn('npm', ['run', 'web'], {
        cwd: path.join(__dirname, 'mshift-app/MoneyShift'),
        stdio: 'pipe'
      });

      let output = '';
      this.expoProcess.stdout.on('data', (data) => {
        output += data.toString();
        const line = data.toString().trim();
        if (line) {
          console.log(`📱 Expo: ${line}`);
        }
        
        if (output.includes('Web Bundling complete') || output.includes('Compiled successfully')) {
          setTimeout(() => resolve(), 3000);
        }
      });

      this.expoProcess.stderr.on('data', (data) => {
        const line = data.toString().trim();
        if (line) {
          console.log(`📱 Expo Error: ${line}`);
        }
      });

      // 45초 타임아웃
      setTimeout(() => {
        console.log('📱 Expo 서버 강제 시작 완료 (타임아웃)');
        resolve();
      }, 45000);
    });
  }

  async testNetworkTab() {
    console.log('🧪 네트워크 탭 상세 테스트 시작...');
    
    try {
      // 1. 앱 로딩
      console.log('\n1️⃣ 앱 로딩 중...');
      let expoUrl = 'http://localhost:8081';
      
      await this.page.goto(expoUrl, { waitUntil: 'networkidle0', timeout: 30000 });
      console.log(`✅ 앱 로드 완료: ${expoUrl}`);
      
      // 2. 개발자 도구 활성화 대기
      console.log('\n2️⃣ 개발자 도구 활성화...');
      await this.page.waitForTimeout(3000);
      
      // F12 키를 눌러서 개발자 도구 확실히 열기
      await this.page.keyboard.press('F12');
      await this.page.waitForTimeout(2000);

      // 3. 네트워크 탭 클릭
      console.log('\n3️⃣ 네트워크 탭 활성화...');
      
      // 다양한 네트워크 탭 셀렉터 시도
      const networkSelectors = [
        '[aria-label="Network"]',
        'div[aria-label="Network"]',
        '.tabbed-pane-header-tab[aria-label="Network"]',
        '[title="Network"]',
        'span:contains("Network")',
        // 한국어 개발자 도구인 경우
        '[aria-label="네트워크"]',
        '[title="네트워크"]'
      ];

      let networkTabFound = false;
      for (const selector of networkSelectors) {
        try {
          await this.page.waitForSelector(selector, { timeout: 2000 });
          await this.page.click(selector);
          console.log(`✅ 네트워크 탭 클릭 성공: ${selector}`);
          networkTabFound = true;
          break;
        } catch (e) {
          console.log(`❌ 네트워크 탭 시도 실패: ${selector}`);
        }
      }

      if (!networkTabFound) {
        // 키보드 단축키로 네트워크 탭 열기 시도
        console.log('🔄 키보드 단축키로 네트워크 탭 시도...');
        await this.page.keyboard.down('Meta'); // Command (Mac) 또는 Ctrl (Windows)
        await this.page.keyboard.down('Shift');
        await this.page.keyboard.press('KeyC'); // Network 탭 단축키
        await this.page.keyboard.up('Shift');
        await this.page.keyboard.up('Meta');
      }

      await this.page.waitForTimeout(3000);

      // 4. 앱에서 API 호출 유발
      console.log('\n4️⃣ API 호출 유발...');
      
      // 모바일 앱 프레임으로 포커스 이동
      const frames = await this.page.frames();
      let appFrame = this.page;
      
      // iframe이 있는지 확인
      for (const frame of frames) {
        const url = frame.url();
        if (url.includes('localhost:8081') && url !== this.page.url()) {
          appFrame = frame;
          console.log(`📱 앱 프레임 발견: ${url}`);
          break;
        }
      }

      // 계좌 탭 클릭하여 API 호출 유발
      try {
        await appFrame.evaluate(() => {
          // 계좌 탭 찾아서 클릭
          const accountElements = Array.from(document.querySelectorAll('*')).filter(el => 
            el.textContent && (el.textContent.trim() === '계좌' || el.textContent.trim() === 'Account')
          );
          
          if (accountElements.length > 0) {
            accountElements[0].click();
            console.log('계좌 탭 클릭됨');
            return true;
          }
          return false;
        });
        
        console.log('✅ 계좌 탭 클릭하여 API 호출 유발');
      } catch (e) {
        console.log('⚠️ 계좌 탭 클릭 실패, 페이지 새로고침으로 API 호출 유발');
        await appFrame.reload();
      }

      // API 호출 대기
      await this.page.waitForTimeout(5000);

      // 5. 네트워크 탭에서 API 요청 확인 및 클릭
      console.log('\n5️⃣ 네트워크 탭에서 API 요청 확인...');
      
      // 네트워크 요청 목록에서 API 요청 찾기
      const apiRequestFound = await this.page.evaluate(() => {
        // 네트워크 패널에서 API 요청 찾기
        const networkRequests = Array.from(document.querySelectorAll('.network-log-grid .data-grid-data-grid-node'));
        
        for (const request of networkRequests) {
          const nameCell = request.querySelector('.name-column');
          if (nameCell && nameCell.textContent.includes('bank-a')) {
            nameCell.click();
            return { found: true, text: nameCell.textContent };
          }
        }
        
        // 다른 방법으로 API 요청 찾기
        const allElements = Array.from(document.querySelectorAll('*'));
        for (const el of allElements) {
          if (el.textContent && el.textContent.includes('transactions/bank-a')) {
            el.click();
            return { found: true, text: el.textContent };
          }
        }
        
        return { found: false };
      });

      if (apiRequestFound.found) {
        console.log(`✅ API 요청 클릭 성공: ${apiRequestFound.text}`);
      } else {
        console.log('⚠️ 네트워크 탭에서 API 요청을 찾지 못함');
      }

      await this.page.waitForTimeout(2000);

      // 6. 스크린샷들 저장
      console.log('\n6️⃣ 스크린샷 저장...');
      
      // 전체 개발자 도구 화면
      await this.page.screenshot({ 
        path: 'test-network-devtools-full.png',
        fullPage: true 
      });
      console.log('📸 개발자 도구 전체 스크린샷: test-network-devtools-full.png');

      // 네트워크 탭만 클로즈업
      try {
        const networkPanel = await this.page.$('.network-log-grid, .network-panel, [aria-label="Network panel"]');
        if (networkPanel) {
          await networkPanel.screenshot({ path: 'test-network-tab-detail.png' });
          console.log('📸 네트워크 탭 상세 스크린샷: test-network-tab-detail.png');
        }
      } catch (e) {
        console.log('⚠️ 네트워크 탭 상세 스크린샷 실패');
      }

      // 7. API 응답 상세 정보 확인
      console.log('\n7️⃣ API 응답 상세 정보 확인...');
      
      const responseDetails = await this.page.evaluate(() => {
        // 응답 헤더나 프리뷰 탭 확인
        const previewTab = document.querySelector('[aria-label="Preview"], [title="Preview"]');
        const responseTab = document.querySelector('[aria-label="Response"], [title="Response"]');
        
        if (previewTab) {
          previewTab.click();
          return { tab: 'Preview clicked' };
        } else if (responseTab) {
          responseTab.click();
          return { tab: 'Response clicked' };
        }
        
        return { tab: 'No response tab found' };
      });
      
      console.log(`   📋 응답 탭: ${responseDetails.tab}`);
      await this.page.waitForTimeout(2000);

      // 최종 스크린샷
      await this.page.screenshot({ 
        path: 'test-network-final-response.png',
        fullPage: true 
      });
      console.log('📸 최종 응답 스크린샷: test-network-final-response.png');

      // 8. 상세 정보 수집
      console.log('\n8️⃣ 테스트 결과 요약...');
      console.log('===========================================');
      console.log(`🔍 콘솔 로그: ${this.consoleLogs.length}개`);
      console.log(`🌐 API 호출: ${this.apiLogs.length}개`);
      
      this.apiLogs.forEach((log, index) => {
        console.log(`   ${index + 1}. [${log.type}] ${log.timestamp} - ${log.method || 'GET'} ${log.url}`);
        if (log.status) console.log(`      상태: ${log.status}`);
        if (log.body) console.log(`      응답: ${log.body.substring(0, 100)}...`);
      });

      console.log('\n⏱️ 10초 대기 중 (개발자 도구에서 최종 확인하세요)...');
      await this.page.waitForTimeout(10000);

      console.log('\n✅ 네트워크 탭 테스트 완료!');
      
    } catch (error) {
      console.error('❌ 테스트 실패:', error.message);
      
      await this.page.screenshot({ 
        path: 'test-network-error.png',
        fullPage: true 
      });
      console.log('📸 에러 스크린샷: test-network-error.png');
    }
  }

  async cleanup() {
    console.log('\n🧹 정리 작업 중...');
    
    if (this.page) {
      await this.page.close();
    }
    
    if (this.browser) {
      await this.browser.close();
    }
    
    if (this.expoProcess && !this.expoProcess.killed) {
      console.log('📱 Expo 프로세스 종료 중...');
      this.expoProcess.kill('SIGTERM');
      
      setTimeout(() => {
        if (this.expoProcess && !this.expoProcess.killed) {
          this.expoProcess.kill('SIGKILL');
        }
      }, 5000);
    }
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      consoleLogs: this.consoleLogs,
      apiLogs: this.apiLogs,
      summary: {
        totalConsoleEntries: this.consoleLogs.length,
        totalApiCalls: this.apiLogs.length,
        successfulApiCalls: this.apiLogs.filter(log => log.status >= 200 && log.status < 300).length,
        failedApiCalls: this.apiLogs.filter(log => log.status >= 400).length
      }
    };
    
    require('fs').writeFileSync('test-network-report.json', JSON.stringify(report, null, 2));
    console.log('📊 네트워크 테스트 보고서 저장: test-network-report.json');
    
    return report;
  }
}

// 메인 실행 함수
async function runNetworkTests() {
  const tester = new NetworkTabTester();
  
  try {
    await tester.initialize();
    await tester.startExpoApp();
    await tester.testNetworkTab();
    tester.generateReport();
  } catch (error) {
    console.error('테스트 실행 중 오류:', error);
  } finally {
    await tester.cleanup();
  }
}

// 스크립트 실행
if (require.main === module) {
  runNetworkTests().then(() => {
    console.log('🎉 네트워크 탭 테스트 완료!');
    process.exit(0);
  }).catch(error => {
    console.error('테스트 실패:', error);
    process.exit(1);
  });
}

module.exports = NetworkTabTester;