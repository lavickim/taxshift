const puppeteer = require('puppeteer');

async function testCurrentApp() {
  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
    defaultViewport: {
      width: 375,
      height: 812,
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 2,
    }
  });

  const page = await browser.newPage();
  
  // 모바일 디바이스 시뮬레이션
  await page.emulate({
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

  // 콘솔 로그 캡처
  page.on('console', msg => {
    console.log(`📱 [${msg.type().toUpperCase()}] ${msg.text()}`);
  });

  try {
    console.log('🚀 현재 앱 상태 테스트 시작...');
    
    // 앱 로드
    await page.goto('http://localhost:8081', { waitUntil: 'networkidle0', timeout: 30000 });
    console.log('✅ 앱 로드 완료');
    
    await page.waitForTimeout(5000);
    
    // 홈 화면 스크린샷
    await page.screenshot({ path: 'current-home-screen.png', fullPage: true });
    console.log('📸 홈 화면 스크린샷: current-home-screen.png');
    
    // 홈 화면 정보 확인
    const homeInfo = await page.evaluate(() => {
      const getText = (selector) => {
        const element = document.querySelector(selector);
        return element ? element.textContent.trim() : 'Not found';
      };
      
      // 다양한 방법으로 요소 찾기
      const allText = document.body.innerText;
      
      // 잔액 찾기
      let balance = 'Not found';
      const balanceMatch = allText.match(/(\d{1,3}(?:,\d{3})*)\s*원/);
      if (balanceMatch) balance = balanceMatch[0];
      
      // 거래 건수 찾기  
      let transactionCount = 'Not found';
      const countMatch = allText.match(/(\d+)\s*건/g);
      if (countMatch) transactionCount = countMatch.join(', ');
      
      return {
        pageText: allText.substring(0, 500) + '...',
        balance,
        transactionCount,
        hasTitle: allText.includes('모두의 회계'),
        hasBank: allText.includes('기업은행')
      };
    });
    
    console.log('🏠 홈 화면 정보:', homeInfo);
    
    // 계좌 탭 클릭
    console.log('\n💳 계좌 탭으로 이동...');
    
    const accountTabClicked = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      for (const el of elements) {
        if (el.textContent && el.textContent.trim() === '계좌') {
          el.click();
          return true;
        }
      }
      return false;
    });
    
    if (accountTabClicked) {
      console.log('✅ 계좌 탭 클릭 성공');
      await page.waitForTimeout(5000);
      
      // 계좌 화면 스크린샷
      await page.screenshot({ path: 'current-account-screen.png', fullPage: true });
      console.log('📸 계좌 화면 스크린샷: current-account-screen.png');
      
      // 계좌 화면 정보 확인
      const accountInfo = await page.evaluate(() => {
        const allText = document.body.innerText;
        
        // 잔액 찾기
        let balance = 'Not found';
        const balanceMatch = allText.match(/잔액[^0-9]*(\d{1,3}(?:,\d{3})*)\s*원/);
        if (balanceMatch) balance = balanceMatch[1] + '원';
        
        // 거래 내역 개수 세기
        const transactionElements = Array.from(document.querySelectorAll('*')).filter(el => {
          const text = el.textContent || '';
          return text.includes('GS') || text.includes('세븐') || text.includes('건강보험') || 
                 text.includes('주유소') || text.includes('롯데리아');
        });
        
        return {
          pageText: allText.substring(0, 500) + '...',
          balance,
          transactionElements: transactionElements.length,
          hasTransactions: allText.includes('GS') || allText.includes('세븐'),
          hasBank: allText.includes('기업은행')
        };
      });
      
      console.log('💳 계좌 화면 정보:', accountInfo);
      
    } else {
      console.log('❌ 계좌 탭 클릭 실패');
    }
    
    console.log('\n⏱️ 10초 대기 중 (화면 확인)...');
    await page.waitForTimeout(10000);
    
    console.log('✅ 테스트 완료');
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
    await page.screenshot({ path: 'current-error-screen.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

testCurrentApp();