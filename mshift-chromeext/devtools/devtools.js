/**
 * MoneyShift DevTools Panel
 * Chrome DevTools 확장 기능
 */

// DevTools 패널 생성
chrome.devtools.panels.create(
    'MoneyShift',
    '../assets/icons/icon16.png',
    'devtools/panel.html',
    (panel) => {
        console.log('🔧 MoneyShift DevTools panel created');
        
        // 패널이 표시될 때 실행
        panel.onShown.addListener((window) => {
            console.log('👁️ MoneyShift DevTools panel shown');
            // 패널 초기화 로직
        });
        
        // 패널이 숨겨질 때 실행
        panel.onHidden.addListener(() => {
            console.log('👁️‍🗨️ MoneyShift DevTools panel hidden');
            // 정리 로직
        });
    }
);

// 네트워크 요청 모니터링
chrome.devtools.network.onRequestFinished.addListener((request) => {
    // MoneyShift 관련 요청만 필터링
    if (request.request.url.includes('localhost:8080') || 
        request.request.url.includes('localhost:3000') ||
        request.request.url.includes('moneyshift')) {
        
        console.log('🌐 MoneyShift Network Request:', {
            url: request.request.url,
            method: request.request.method,
            status: request.response.status,
            time: request.time
        });
    }
});

console.log('🚀 MoneyShift DevTools initialized');