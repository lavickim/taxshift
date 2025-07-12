const puppeteer = require('puppeteer');
const { spawn } = require('child_process');
const path = require('path');

class ImprovedMobileAppTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.expoProcess = null;
    this.apiLogs = [];
    this.consoleLogs = [];
  }

  async initialize() {
    console.log('🚀 개선된 모바일 앱 테스트 시작...');
    console.log('===========================================');
    
    // Puppeteer 브라우저 시작
    this.browser = await puppeteer.launch({
      headless: false,
      devtools: true,
      defaultViewport: {
        width: 375,
        height: 812,
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 2,
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
    
    // 모바일 디바이스 시뮬레이션
    await this.page.emulate({
      name: 'iPhone 12',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
      viewport: {
        width: 375,
        height: 812,
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
        isLandscape: false,
      },
    });

    // 콘솔 로그 상세 캡처
    this.page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      const timestamp = new Date().toLocaleTimeString();
      
      this.consoleLogs.push({ timestamp, type, text });
      
      // API 관련 로그 특별 표시
      if (text.includes('API') || text.includes('api') || text.includes('fetch') || text.includes('Transaction')) {
        console.log(`📱 [${type.toUpperCase()}] ${timestamp} - ${text}`);
      } else {
        console.log(`📱 [${type}] ${text}`);
      }
    });

    // 네트워크 요청 상세 모니터링
    this.page.on('request', request => {
      const url = request.url();
      const method = request.method();
      const timestamp = new Date().toLocaleTimeString();
      
      if (url.includes('api/') || url.includes('localhost:8080')) {
        const logEntry = { timestamp, method, url, type: 'request' };
        this.apiLogs.push(logEntry);
        console.log(`🌐 [요청] ${timestamp} - ${method} ${url}`);
        
        // 요청 헤더도 로깅
        const headers = request.headers();
        if (headers['content-type']) {
          console.log(`   📋 Content-Type: ${headers['content-type']}`);
        }
      }
    });

    this.page.on('response', async response => {
      const url = response.url();
      const status = response.status();
      const timestamp = new Date().toLocaleTimeString();
      
      if (url.includes('api/') || url.includes('localhost:8080')) {
        const logEntry = { timestamp, status, url, type: 'response' };
        this.apiLogs.push(logEntry);
        
        try {
          const responseText = await response.text();
          logEntry.body = responseText.substring(0, 200); // 응답 내용 일부 저장
          
          console.log(`✅ [응답] ${timestamp} - ${status} ${url}`);
          if (responseText) {
            console.log(`   📦 응답: ${responseText.substring(0, 100)}${responseText.length > 100 ? '...' : ''}`);
          }
        } catch (e) {
          console.log(`✅ [응답] ${timestamp} - ${status} ${url} (응답 내용 읽기 실패)`);
        }
      }
    });

    // 요청 실패 모니터링
    this.page.on('requestfailed', request => {
      const url = request.url();
      const timestamp = new Date().toLocaleTimeString();
      console.log(`❌ [실패] ${timestamp} - ${url} (${request.failure().errorText})`);
    });

    // 페이지 오류 캡처
    this.page.on('pageerror', error => {
      console.log(`❌ 페이지 오류: ${error.message}`);
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

      this.expoProcess.on('error', (error) => {
        console.error('Expo 시작 실패:', error);
        reject(error);
      });

      // 45초 타임아웃
      setTimeout(() => {
        console.log('📱 Expo 서버 강제 시작 완료 (타임아웃)');
        resolve();
      }, 45000);
    });
  }

  async testApp() {
    console.log('🧪 상세 앱 테스트 시작...');
    
    try {
      // 1. 앱 로딩
      console.log('\n1️⃣ 앱 로딩 중...');
      let expoUrl = 'http://localhost:19006';
      
      try {
        await this.page.goto(expoUrl, { waitUntil: 'networkidle0', timeout: 15000 });
      } catch (error) {
        console.log('19006 포트 접속 실패, 8081 포트로 시도...');
        expoUrl = 'http://localhost:8081';
        await this.page.goto(expoUrl, { waitUntil: 'networkidle0', timeout: 30000 });
      }
      
      console.log(`✅ 앱 로드 완료: ${expoUrl}`);
      await this.page.waitForTimeout(3000);

      // 2. 초기 화면 확인
      console.log('\n2️⃣ 초기 화면 분석...');
      
      // 페이지 내용 전체 분석
      const pageContent = await this.page.evaluate(() => {
        return {
          title: document.title,
          bodyText: document.body.innerText,
          htmlLength: document.documentElement.innerHTML.length,
          scripts: Array.from(document.scripts).map(s => s.src).filter(s => s),
          links: Array.from(document.links).map(l => l.href).slice(0, 10)
        };
      });
      
      console.log(`   📄 페이지 제목: ${pageContent.title}`);
      console.log(`   📊 HTML 크기: ${pageContent.htmlLength} bytes`);
      console.log(`   📝 페이지 텍스트 (처음 300자): ${pageContent.bodyText.substring(0, 300)}...`);
      
      // React/Expo 로딩 확인
      const reactStatus = await this.page.evaluate(() => {
        return {
          hasReact: typeof window.React !== 'undefined',
          hasExpo: typeof window.expo !== 'undefined',
          reactRootExists: !!document.querySelector('#root, #app, [data-reactroot]'),
          errorElements: document.querySelectorAll('[class*="error"], [class*="Error"]').length
        };
      });
      
      console.log(`   ⚛️ React 상태:`, reactStatus);

      // 3. 홈 화면 대기 및 확인
      console.log('\n3️⃣ 홈 화면 확인...');
      
      // 다양한 방법으로 홈 화면 요소 찾기
      const homeScreenElements = await this.page.evaluate(() => {
        const elements = [];
        const searchTexts = ['모두의 회계', '홈', 'Home', '계좌', 'Account'];
        
        searchTexts.forEach(text => {
          const found = document.evaluate(
            `//*[contains(text(), '${text}')]`,
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
          ).singleNodeValue;
          
          if (found) {
            elements.push({ text, element: found.tagName, content: found.textContent });
          }
        });
        
        return elements;
      });
      
      console.log(`   🎯 홈 화면 요소 발견:`, homeScreenElements);

      // 4. 네비게이션 확인
      console.log('\n4️⃣ 네비게이션 확인...');
      
      const navigationElements = await this.page.evaluate(() => {
        const navTexts = ['홈', '계좌', 'API', '설정', 'Home', 'Account', 'Settings'];
        const found = [];
        
        navTexts.forEach(text => {
          const elements = Array.from(document.querySelectorAll('*')).filter(el => 
            el.textContent && el.textContent.trim() === text
          );
          elements.forEach(el => {
            found.push({ 
              text, 
              tagName: el.tagName, 
              className: el.className,
              clickable: el.onclick !== null || el.getAttribute('role') === 'button' 
            });
          });
        });
        
        return found;
      });
      
      console.log(`   🧭 네비게이션 요소:`, navigationElements);

      // 5. 계좌 탭 테스트
      console.log('\n5️⃣ 계좌 탭 테스트...');
      
      try {
        // 계좌 탭 클릭 시도
        const accountTabClicked = await this.page.evaluate(() => {
          const accountTexts = ['계좌', 'Account'];
          for (let text of accountTexts) {
            const elements = Array.from(document.querySelectorAll('*')).filter(el => 
              el.textContent && el.textContent.trim().includes(text)
            );
            
            for (let element of elements) {
              try {
                element.click();
                return { success: true, text, tagName: element.tagName };
              } catch (e) {
                // 다음 요소 시도
              }
            }
          }
          return { success: false };
        });
        
        if (accountTabClicked.success) {
          console.log(`   ✅ 계좌 탭 클릭 성공: ${accountTabClicked.text}`);
          await this.page.waitForTimeout(5000); // API 호출 대기
        } else {
          console.log(`   ⚠️ 계좌 탭 클릭 실패`);
        }
        
      } catch (e) {
        console.log(`   ❌ 계좌 탭 테스트 오류: ${e.message}`);
      }

      // 6. API 호출 및 응답 분석
      console.log('\n6️⃣ API 호출 분석...');
      
      // 잠시 대기 후 API 로그 분석
      await this.page.waitForTimeout(3000);
      
      console.log(`   📊 총 API 요청: ${this.apiLogs.length}개`);
      this.apiLogs.forEach((log, index) => {
        console.log(`   ${index + 1}. [${log.type}] ${log.timestamp} - ${log.method || 'GET'} ${log.url} ${log.status || ''}`);
        if (log.body) {
          console.log(`      📦 ${log.body.substring(0, 100)}...`);
        }
      });

      // 7. 최종 화면 상태 분석
      console.log('\n7️⃣ 최종 화면 상태 분석...');
      
      const finalState = await this.page.evaluate(() => {
        const transactionElements = Array.from(document.querySelectorAll('*')).filter(el => {
          const text = el.textContent || '';
          return text.includes('GS25') || text.includes('건강보험') || text.includes('원') || text.includes('기업은행');
        });
        
        return {
          transactionCount: transactionElements.length,
          hasTransactionData: transactionElements.length > 0,
          sampleTransactions: transactionElements.slice(0, 3).map(el => el.textContent.trim().substring(0, 50))
        };
      });
      
      console.log(`   💳 거래 관련 요소: ${finalState.transactionCount}개`);
      console.log(`   📝 샘플 거래:`, finalState.sampleTransactions);

      // 스크린샷 저장
      await this.page.screenshot({ 
        path: 'test-improved-screenshot.png',
        fullPage: true 
      });
      console.log('\n📸 상세 스크린샷 저장: test-improved-screenshot.png');

      // 8. 로그 요약
      console.log('\n8️⃣ 테스트 결과 요약...');
      console.log('===========================================');
      console.log(`🔍 콘솔 로그: ${this.consoleLogs.length}개`);
      console.log(`🌐 API 호출: ${this.apiLogs.length}개`);
      console.log(`💳 거래 요소: ${finalState.transactionCount}개`);
      console.log(`✅ API 성공: ${this.apiLogs.filter(log => log.status >= 200 && log.status < 300).length}개`);
      console.log(`❌ API 실패: ${this.apiLogs.filter(log => log.status >= 400).length}개`);
      
      // 개발자 도구에서 추가 확인 시간
      console.log('\n⏱️ 15초 대기 중 (개발자 도구에서 확인하세요)...');
      await this.page.waitForTimeout(15000);

      console.log('\n✅ 상세 테스트 완료!');
      
    } catch (error) {
      console.error('❌ 테스트 실패:', error.message);
      
      await this.page.screenshot({ 
        path: 'test-improved-failure.png',
        fullPage: true 
      });
      console.log('📸 실패 스크린샷 저장: test-improved-failure.png');
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

  // 로그 보고서 생성
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
    
    require('fs').writeFileSync('test-improved-report.json', JSON.stringify(report, null, 2));
    console.log('📊 상세 보고서 저장: test-improved-report.json');
    
    return report;
  }
}

// 메인 실행 함수
async function runImprovedTests() {
  const tester = new ImprovedMobileAppTester();
  
  try {
    await tester.initialize();
    await tester.startExpoApp();
    await tester.testApp();
    tester.generateReport();
  } catch (error) {
    console.error('테스트 실행 중 오류:', error);
  } finally {
    await tester.cleanup();
  }
}

// 스크립트 실행
if (require.main === module) {
  runImprovedTests().then(() => {
    console.log('🎉 개선된 테스트 완료!');
    process.exit(0);
  }).catch(error => {
    console.error('테스트 실패:', error);
    process.exit(1);
  });
}

module.exports = ImprovedMobileAppTester;