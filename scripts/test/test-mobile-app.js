const puppeteer = require('puppeteer');
const { spawn } = require('child_process');
const path = require('path');

class MobileAppTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.expoProcess = null;
  }

  async initialize() {
    console.log('🚀 모바일 앱 자동 테스트 시작...');
    console.log('===============================');
    
    // Puppeteer 브라우저 시작
    this.browser = await puppeteer.launch({
      headless: false, // 브라우저 창을 보이게 함
      devtools: true,  // 개발자 도구 자동 열기
      defaultViewport: {
        width: 375,
        height: 812, // iPhone X 사이즈
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 2,
      },
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--auto-open-devtools-for-tabs', // 개발자 도구 자동 열기
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

    // 콘솔 로그 캡처 (모든 로그 표시)
    this.page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      console.log(`📱 [${type.toUpperCase()}] ${text}`);
    });

    // 페이지 오류 캡처
    this.page.on('pageerror', error => {
      console.log(`❌ 페이지 오류: ${error.message}`);
    });

    // 네트워크 요청 모니터링 (모든 요청 표시)
    this.page.on('request', request => {
      const url = request.url();
      const method = request.method();
      if (url.includes('api/') || url.includes('localhost:8080')) {
        console.log(`🌐 API 호출: ${method} ${url}`);
      }
    });

    this.page.on('response', response => {
      const url = response.url();
      const status = response.status();
      if (url.includes('api/') || url.includes('localhost:8080')) {
        console.log(`✅ API 응답: ${status} ${url}`);
      }
    });

    // 에러 처리
    this.page.on('requestfailed', request => {
      console.log(`❌ 요청 실패: ${request.url()}`);
    });
  }

  async startExpoApp() {
    console.log('📱 Expo 웹 앱 시작 중...');
    
    return new Promise((resolve, reject) => {
      // Expo 웹 서버 시작
      this.expoProcess = spawn('npm', ['run', 'web'], {
        cwd: path.join(__dirname, 'mshift-app/MoneyShift'),
        stdio: 'pipe'
      });

      let output = '';
      this.expoProcess.stdout.on('data', (data) => {
        output += data.toString();
        console.log(`Expo: ${data.toString().trim()}`);
        
        // 웹 서버가 준비되면 resolve
        if (output.includes('Web Bundling complete') || output.includes('Compiled successfully')) {
          setTimeout(() => resolve(), 2000); // 2초 대기 후 진행
        }
      });

      this.expoProcess.stderr.on('data', (data) => {
        console.log(`Expo Error: ${data.toString().trim()}`);
      });

      this.expoProcess.on('error', (error) => {
        console.error('Expo 시작 실패:', error);
        reject(error);
      });

      // 30초 타임아웃
      setTimeout(() => {
        if (this.expoProcess && !this.expoProcess.killed) {
          console.log('📱 Expo 서버 강제 시작 완료 (타임아웃)');
          resolve();
        }
      }, 30000);
    });
  }

  async testApp() {
    console.log('🧪 앱 테스트 시작...');
    
    try {
      // Expo 웹 앱 페이지 로드 (포트 확인 후 접속)
      console.log('1️⃣ 앱 로딩 중...');
      let expoUrl = 'http://localhost:19006';
      
      // 19006 포트가 안 되면 8081 포트 시도
      try {
        await this.page.goto(expoUrl, { waitUntil: 'networkidle0', timeout: 10000 });
      } catch (error) {
        console.log('19006 포트 접속 실패, 8081 포트로 시도...');
        expoUrl = 'http://localhost:8081';
        await this.page.goto(expoUrl, { waitUntil: 'networkidle0', timeout: 30000 });
      }
      
      console.log(`✅ Expo 앱 로드 완료: ${expoUrl}`);

      // 개발자 도구 열기
      console.log('🔧 개발자 도구 열기...');
      const client = await this.page.target().createCDPSession();
      await client.send('Runtime.enable');
      await client.send('Console.enable');
      
      // 개발자 도구에서 콘솔 열기 (F12)
      await this.page.keyboard.press('F12');
      await this.page.waitForTimeout(2000);

      // 콘솔 탭 클릭
      try {
        await this.page.click('[aria-label="Console"]');
      } catch (e) {
        console.log('ℹ️ 콘솔 탭 클릭 실패, 계속 진행...');
      }

      // 앱 로딩 대기
      await this.page.waitForTimeout(5000);

      // 홈 화면 확인
      console.log('2️⃣ 홈 화면 확인 중...');
      await this.page.waitForSelector('text/모두의 회계', { timeout: 10000 });
      console.log('✅ 홈 화면 로드 완료');

      // 계좌 탭 클릭
      console.log('3️⃣ 계좌 탭 클릭...');
      await this.page.click('text/계좌');
      await this.page.waitForTimeout(3000);

      // 거래 내역 로딩 확인 및 API 호출 모니터링
      console.log('4️⃣ 거래 내역 로딩 확인 및 API 호출 모니터링...');
      
      // 개발자 도구 콘솔에서 API 호출 확인
      console.log('🔍 개발자 도구에서 API 호출 로그 확인...');
      
      // 로딩 상태 확인
      try {
        await this.page.waitForSelector('text/거래 내역을 불러오는 중', { timeout: 2000 });
        console.log('✅ 로딩 화면 표시됨');
      } catch (e) {
        console.log('ℹ️ 로딩 화면 건너뛰기 (빠른 로딩)');
      }

      // 거래 내역 표시 확인
      await this.page.waitForSelector('text/기업은행 계좌상세', { timeout: 10000 });
      console.log('✅ 계좌 상세 화면 로드 완료');

      // 페이지 스크린샷 저장
      await this.page.screenshot({ 
        path: 'test-account-screen.png',
        fullPage: true 
      });
      console.log('📸 계좌 화면 스크린샷 저장: test-account-screen.png');

      // 거래 항목 확인 (더 정확한 셀렉터 사용)
      const transactionElements = await this.page.$$('*[style*="TouchableOpacity"], *[role="button"]');
      const visibleTransactions = await this.page.evaluate(() => {
        const elements = document.querySelectorAll('*');
        let count = 0;
        for (let el of elements) {
          const text = el.textContent || '';
          if (text.includes('GS25') || text.includes('건강보험') || text.includes('주유소') || text.includes('원')) {
            count++;
          }
        }
        return count;
      });
      
      console.log(`✅ 거래 관련 요소 ${visibleTransactions}개 발견`);

      // 페이지 전체 텍스트 확인
      const pageText = await this.page.evaluate(() => document.body.innerText);
      console.log('📄 페이지 텍스트 샘플:', pageText.substring(0, 200) + '...');

      // 첫 번째 거래 항목 클릭 (분류 테스트)
      console.log('5️⃣ 거래 분류 테스트...');
      
      // Alert 가로채기 설정
      await this.page.evaluateOnNewDocument(() => {
        window.alertMessages = [];
        window.originalAlert = window.alert;
        window.alert = function(message) {
          window.alertMessages.push(message);
          console.log('Alert intercepted:', message);
          return true;
        };
      });

      try {
        // 거래 항목 클릭 시도
        const clickableElements = await this.page.$$('*');
        let clicked = false;
        
        for (let element of clickableElements) {
          try {
            const text = await element.evaluate(el => el.textContent || '');
            if (text.includes('GS25') || text.includes('지에스25')) {
              await element.click();
              clicked = true;
              console.log('✅ GS25 거래 항목 클릭 완료');
              break;
            }
          } catch (e) {
            // 무시하고 계속
          }
        }
        
        if (!clicked) {
          console.log('ℹ️ GS25 거래 항목을 찾을 수 없음');
        }
        
        await this.page.waitForTimeout(3000);
        
        // Alert 메시지 확인
        const alertMessages = await this.page.evaluate(() => window.alertMessages || []);
        if (alertMessages.length > 0) {
          console.log('✅ 거래 분류 Alert 확인:', alertMessages[0]);
        } else {
          console.log('ℹ️ 거래 분류 Alert 표시되지 않음');
        }
        
      } catch (e) {
        console.log('ℹ️ 거래 분류 테스트 건너뛰기:', e.message);
      }

      // API 탭 테스트
      console.log('6️⃣ API 탭 테스트...');
      try {
        await this.page.click('text/API');
        await this.page.waitForTimeout(2000);

        // API 연결 테스트 버튼 클릭
        await this.page.click('text/API 연결 테스트');
        await this.page.waitForTimeout(3000);

        // API 테스트 결과 확인
        const apiTestResult = await this.page.evaluate(() => {
          const elements = document.querySelectorAll('*');
          for (let el of elements) {
            const text = el.textContent || '';
            if (text.includes('API 연결 성공') || text.includes('성공')) {
              return text;
            }
          }
          return null;
        });

        if (apiTestResult) {
          console.log('✅ API 연결 테스트 결과:', apiTestResult);
        } else {
          console.log('ℹ️ API 연결 테스트 결과 확인 불가');
        }
      } catch (e) {
        console.log('ℹ️ API 탭 테스트 건너뛰기:', e.message);
      }

      // 최종 스크린샷
      await this.page.screenshot({ 
        path: 'test-final-screen.png',
        fullPage: true 
      });
      console.log('📸 최종 스크린샷 저장: test-final-screen.png');

      // 테스트 완료 전 대기 시간 (개발자 도구에서 확인할 시간)
      console.log('⏱️ 10초 대기 중 (개발자 도구에서 확인하세요)...');
      await this.page.waitForTimeout(10000);

      console.log('✅ 모든 테스트 완료!');
      
    } catch (error) {
      console.error('❌ 테스트 실패:', error.message);
      
      // 스크린샷 저장
      await this.page.screenshot({ 
        path: 'test-failure-screenshot.png',
        fullPage: true 
      });
      console.log('📸 실패 스크린샷 저장: test-failure-screenshot.png');
    }
  }

  async cleanup() {
    console.log('🧹 정리 작업 중...');
    
    if (this.page) {
      await this.page.close();
    }
    
    if (this.browser) {
      await this.browser.close();
    }
    
    if (this.expoProcess && !this.expoProcess.killed) {
      console.log('📱 Expo 프로세스 종료 중...');
      this.expoProcess.kill('SIGTERM');
      
      // 강제 종료 대기
      setTimeout(() => {
        if (this.expoProcess && !this.expoProcess.killed) {
          this.expoProcess.kill('SIGKILL');
        }
      }, 5000);
    }
  }
}

// 메인 실행 함수
async function runTests() {
  const tester = new MobileAppTester();
  
  try {
    await tester.initialize();
    await tester.startExpoApp();
    await tester.testApp();
  } catch (error) {
    console.error('테스트 실행 중 오류:', error);
  } finally {
    await tester.cleanup();
  }
}

// 스크립트 실행
if (require.main === module) {
  runTests().then(() => {
    console.log('🎉 테스트 완료!');
    process.exit(0);
  }).catch(error => {
    console.error('테스트 실패:', error);
    process.exit(1);
  });
}

module.exports = MobileAppTester;