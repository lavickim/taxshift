/**
 * MoneyShift Manager - Content Script
 * 웹 페이지에서 거래 데이터 감지 및 처리
 */

class MoneyShiftDetector {
  constructor() {
    this.transactionPatterns = [
      // 카드 사용 알림
      /(\d{1,3}(?:,\d{3})*원)\s*(?:결제|사용|승인)/i,
      // 계좌 이체
      /(\d{1,3}(?:,\d{3})*원)\s*(?:이체|송금|입금|출금)/i,
      // 온라인 결제
      /(\d{1,3}(?:,\d{3})*원)\s*(?:결제완료|주문완료|구매완료)/i,
      // 은행 거래
      /잔액\s*(\d{1,3}(?:,\d{3})*원)/i,
    ];

    this.merchantPatterns = [
      // 일반적인 상호명 패턴
      /(\w+(?:\s+\w+)*)\s*(?:에서|에|가게|마트|카페|식당|점)/i,
      // 카드 사용처
      /사용처\s*[:：]\s*([^\n\r]+)/i,
      // 온라인 쇼핑몰
      /(쿠팡|11번가|네이버|이마트|GS25|CU|세븐일레븐)/i,
    ];

    this.init();
  }

  init() {
    // 페이지 타입 감지
    this.detectPageType();
    
    // DOM 변경 감지
    this.setupMutationObserver();
    
    // 기존 거래 데이터 스캔
    this.scanForTransactions();
    
    // 메시지 리스너 설정
    this.setupMessageListeners();
    
    console.log('MoneyShift Detector initialized on:', window.location.href);
  }

  detectPageType() {
    const hostname = window.location.hostname;
    const path = window.location.pathname;

    // MoneyShift 개발 환경 감지
    if (hostname === 'localhost') {
      if (window.location.port === '3000') {
        this.pageType = 'moneyshift-admin';
        this.initAdminPageFeatures();
      } else if (window.location.port === '8080') {
        this.pageType = 'moneyshift-api';
        this.initApiPageFeatures();
      } else if (window.location.port === '19002') {
        this.pageType = 'moneyshift-mobile';
        this.initMobilePageFeatures();
      }
    }
    
    // 은행/카드사 사이트 감지
    else if (this.isBankingSite(hostname)) {
      this.pageType = 'banking';
      this.initBankingFeatures();
    }
    
    // 쇼핑몰 사이트 감지
    else if (this.isEcommerceSite(hostname)) {
      this.pageType = 'ecommerce';
      this.initEcommerceFeatures();
    }
  }

  isBankingSite(hostname) {
    const bankingSites = [
      'kbstar.com', 'shinhan.com', 'wooribank.com', 'ibk.co.kr',
      'nh.co.kr', 'citibank.co.kr', 'standardchartered.co.kr',
      'samsung.com', 'lotte.com', 'hyundaicard.com', 'bccard.com'
    ];
    
    return bankingSites.some(site => hostname.includes(site));
  }

  isEcommerceSite(hostname) {
    const ecommerceSites = [
      'coupang.com', '11st.co.kr', 'gmarket.co.kr', 'auction.co.kr',
      'ssg.com', 'homeplus.co.kr', 'emart.co.kr', 'yes24.com'
    ];
    
    return ecommerceSites.some(site => hostname.includes(site));
  }

  setupMutationObserver() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this.scanElement(node);
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  scanForTransactions() {
    // 페이지의 모든 텍스트 노드 스캔
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let node;
    while (node = walker.nextNode()) {
      this.analyzeTextNode(node);
    }
  }

  scanElement(element) {
    // 새로 추가된 요소의 텍스트 분석
    const textContent = element.textContent || '';
    this.analyzeText(textContent, element);
  }

  analyzeTextNode(textNode) {
    const text = textNode.textContent.trim();
    if (text.length > 5) {
      this.analyzeText(text, textNode.parentElement);
    }
  }

  analyzeText(text, element) {
    // 거래 패턴 매칭
    this.transactionPatterns.forEach((pattern, index) => {
      const match = text.match(pattern);
      if (match) {
        this.handleTransactionDetected(text, match, element, 'transaction');
      }
    });

    // 상호명 패턴 매칭  
    this.merchantPatterns.forEach((pattern, index) => {
      const match = text.match(pattern);
      if (match) {
        this.handleTransactionDetected(text, match, element, 'merchant');
      }
    });
  }

  async handleTransactionDetected(fullText, match, element, type) {
    const transactionData = this.extractTransactionData(fullText, match, type);
    
    if (transactionData.confidence > 0.6) {
      // 시각적 표시 추가
      this.highlightTransaction(element, transactionData);
      
      // 백그라운드 스크립트에 전송
      try {
        const response = await chrome.runtime.sendMessage({
          action: 'DETECT_TRANSACTION',
          data: transactionData
        });
        
        if (response && response.success) {
          console.log('거래 분류 성공:', response.result);
          this.showTransactionPopup(transactionData, response.result);
        }
      } catch (error) {
        console.error('거래 전송 실패:', error);
      }
    }
  }

  extractTransactionData(text, match, type) {
    const data = {
      originalText: text,
      matchedText: match[0],
      type: type,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      pageType: this.pageType,
      confidence: 0.5
    };

    // 금액 추출
    const amountMatch = text.match(/(\d{1,3}(?:,\d{3})*)\s*원/);
    if (amountMatch) {
      data.amount = parseInt(amountMatch[1].replace(/,/g, ''));
      data.confidence += 0.3;
    }

    // 상호명 추출
    const merchantMatch = text.match(/(?:사용처|가맹점|업체)\s*[:：]\s*([^\n\r\s]+)/);
    if (merchantMatch) {
      data.merchant = merchantMatch[1];
      data.confidence += 0.2;
    }

    // 거래 시간 추출
    const timeMatch = text.match(/(\d{2}):(\d{2})/);
    if (timeMatch) {
      data.transactionTime = `${timeMatch[1]}:${timeMatch[2]}`;
      data.confidence += 0.1;
    }

    // 카드 정보 추출
    const cardMatch = text.match(/([^\s]+카드|[^\s]+체크)/);
    if (cardMatch) {
      data.cardType = cardMatch[1];
      data.confidence += 0.1;
    }

    return data;
  }

  highlightTransaction(element, transactionData) {
    if (!element || element.classList.contains('moneyshift-detected')) {
      return;
    }

    // 요소에 하이라이트 클래스 추가
    element.classList.add('moneyshift-detected');
    element.style.position = 'relative';
    
    // MoneyShift 배지 추가
    const badge = document.createElement('div');
    badge.className = 'moneyshift-badge';
    badge.innerHTML = '💰 MoneyShift';
    badge.style.cssText = `
      position: absolute;
      top: -8px;
      right: -8px;
      background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2px 6px;
      border-radius: 10px;
      font-size: 10px;
      font-weight: bold;
      z-index: 10000;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    `;
    
    badge.addEventListener('click', () => {
      this.showTransactionDetails(transactionData);
    });
    
    element.appendChild(badge);

    // 호버 효과
    element.addEventListener('mouseenter', () => {
      element.style.backgroundColor = 'rgba(102, 126, 234, 0.1)';
    });
    
    element.addEventListener('mouseleave', () => {
      element.style.backgroundColor = '';
    });
  }

  showTransactionPopup(transactionData, classificationResult) {
    // 거래 분류 결과를 보여주는 작은 팝업
    const popup = document.createElement('div');
    popup.className = 'moneyshift-popup';
    popup.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10001;
      max-width: 300px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
    `;
    
    popup.innerHTML = `
      <div style="display: flex; align-items: center; margin-bottom: 8px;">
        <img src="${chrome.runtime.getURL('assets/icons/icon16.png')}" 
             style="width: 16px; height: 16px; margin-right: 8px;">
        <strong>MoneyShift 거래 감지</strong>
        <button onclick="this.parentElement.parentElement.remove()" 
                style="margin-left: auto; border: none; background: none; cursor: pointer;">×</button>
      </div>
      <div style="margin-bottom: 4px;"><strong>분류:</strong> ${classificationResult.category || '미분류'}</div>
      <div style="margin-bottom: 4px;"><strong>금액:</strong> ${transactionData.amount?.toLocaleString() || '미상'}원</div>
      <div style="margin-bottom: 8px;"><strong>신뢰도:</strong> ${Math.round((classificationResult.confidence || 0) * 100)}%</div>
      <button onclick="window.open('http://localhost:3000', '_blank')" 
              style="width: 100%; padding: 6px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer;">
        Admin Panel에서 확인
      </button>
    `;
    
    document.body.appendChild(popup);
    
    // 5초 후 자동 제거
    setTimeout(() => {
      if (popup.parentElement) {
        popup.remove();
      }
    }, 5000);
  }

  showTransactionDetails(transactionData) {
    const details = `
거래 정보:
- 원문: ${transactionData.originalText}
- 금액: ${transactionData.amount?.toLocaleString() || '미상'}원
- 상호: ${transactionData.merchant || '미상'}
- 시간: ${transactionData.transactionTime || '미상'}
- 신뢰도: ${Math.round(transactionData.confidence * 100)}%
- 페이지: ${this.pageType}
    `;
    
    alert(details);
  }

  initAdminPageFeatures() {
    // Admin Panel 페이지 전용 기능
    console.log('MoneyShift Admin Panel 기능 활성화');
    
    // 개발자 도구 버튼 추가
    this.addDeveloperTools();
  }

  initApiPageFeatures() {
    // API 서버 페이지 전용 기능
    console.log('MoneyShift API 서버 기능 활성화');
    
    // API 문서 네비게이션 개선
    this.enhanceApiDocs();
  }

  initMobilePageFeatures() {
    // 모바일 개발 서버 페이지 전용 기능
    console.log('MoneyShift Mobile 개발 기능 활성화');
  }

  initBankingFeatures() {
    // 은행 사이트 전용 기능
    console.log('은행 사이트 거래 감지 활성화');
    
    // 더 정확한 거래 패턴 사용
    this.transactionPatterns.push(
      /승인\s*(\d{1,3}(?:,\d{3})*원)/i,
      /출금\s*(\d{1,3}(?:,\d{3})*원)/i,
      /입금\s*(\d{1,3}(?:,\d{3})*원)/i
    );
  }

  initEcommerceFeatures() {
    // 쇼핑몰 사이트 전용 기능
    console.log('쇼핑몰 사이트 거래 감지 활성화');
    
    // 주문/결제 패턴 추가
    this.transactionPatterns.push(
      /총\s*결제\s*금액\s*(\d{1,3}(?:,\d{3})*원)/i,
      /주문\s*금액\s*(\d{1,3}(?:,\d{3})*원)/i
    );
  }

  addDeveloperTools() {
    // Admin Panel에 개발자 도구 추가
    const toolsButton = document.createElement('div');
    toolsButton.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #667eea;
      color: white;
      padding: 10px;
      border-radius: 50%;
      cursor: pointer;
      z-index: 10000;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    `;
    toolsButton.innerHTML = '🛠️';
    toolsButton.title = 'MoneyShift 개발자 도구';
    
    toolsButton.addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'OPEN_DEVELOPER_TOOLS' });
    });
    
    document.body.appendChild(toolsButton);
  }

  enhanceApiDocs() {
    // API 문서 페이지 개선
    const title = document.querySelector('title');
    if (title && title.textContent.includes('Swagger')) {
      console.log('Swagger UI 개선 적용');
      
      // Swagger UI 스타일 개선
      const style = document.createElement('style');
      style.textContent = `
        .swagger-ui .topbar { 
          background-color: #667eea !important; 
        }
        .swagger-ui .btn.authorize { 
          background-color: #764ba2 !important; 
        }
      `;
      document.head.appendChild(style);
    }
  }

  setupMessageListeners() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      switch (message.action) {
        case 'SCAN_PAGE':
          this.scanForTransactions();
          sendResponse({ success: true });
          break;
          
        case 'GET_PAGE_INFO':
          sendResponse({
            success: true,
            pageType: this.pageType,
            url: window.location.href,
            title: document.title
          });
          break;
      }
    });
  }
}

// DOM이 로드되면 감지기 초기화
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new MoneyShiftDetector();
  });
} else {
  new MoneyShiftDetector();
}