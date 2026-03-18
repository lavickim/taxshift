/**
 * MoneyShift DevTools Panel JavaScript
 * DevTools 패널의 기능을 구현합니다
 */

class MoneyShiftDevTools {
    constructor() {
        this.requests = [];
        this.currentTab = 'overview';
        
        this.init();
    }

    init() {
        this.setupTabSwitching();
        this.setupFilters();
        this.checkServicesStatus();
        this.startMonitoring();
        
        console.log('🔧 MoneyShift DevTools Panel initialized');
    }

    setupTabSwitching() {
        const tabs = document.querySelectorAll('.tab');
        const tabContents = document.querySelectorAll('.tab-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs
                tabs.forEach(t => t.classList.remove('active'));
                tabContents.forEach(tc => tc.style.display = 'none');

                // Add active class to clicked tab
                tab.classList.add('active');
                const targetTab = tab.getAttribute('data-tab');
                document.getElementById(targetTab).style.display = 'block';
                
                this.currentTab = targetTab;
            });
        });
    }

    setupFilters() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        const urlFilter = document.getElementById('urlFilter');

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filterRequests();
            });
        });

        if (urlFilter) {
            urlFilter.addEventListener('input', () => {
                this.filterRequests();
            });
        }
    }

    async checkServicesStatus() {
        const services = [
            { id: 'frontend', name: 'Frontend', url: 'http://localhost:3000', element: 'frontendStatus' },
            { id: 'backend', name: 'Backend', url: 'http://localhost:8080', element: 'backendStatus' },
            { id: 'database', name: 'Database', url: 'http://localhost:5432', element: 'databaseStatus' },
            { id: 'mobile', name: 'Mobile', url: 'http://localhost:19002', element: 'mobileStatus' }
        ];

        for (const service of services) {
            try {
                const response = await fetch(service.url, { 
                    method: 'HEAD',
                    mode: 'no-cors'
                });
                this.updateServiceStatus(service.element, '🟢 실행 중');
            } catch (error) {
                this.updateServiceStatus(service.element, '🔴 중지됨');
            }
        }
    }

    updateServiceStatus(elementId, status) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = status;
        }
    }

    startMonitoring() {
        // Background script와 통신하여 네트워크 요청 모니터링
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.type === 'NETWORK_REQUEST') {
                this.addNetworkRequest(message.data);
            }
        });

        // 주기적으로 성능 메트릭 업데이트
        setInterval(() => {
            this.updatePerformanceMetrics();
        }, 5000);
    }

    addNetworkRequest(requestData) {
        this.requests.push({
            ...requestData,
            timestamp: new Date()
        });

        // 최근 100개 요청만 유지
        if (this.requests.length > 100) {
            this.requests = this.requests.slice(-100);
        }

        this.updateNetworkTab();
        this.updatePerformanceMetrics();
    }

    updateNetworkTab() {
        const requestsList = document.getElementById('requestsList');
        if (!requestsList || this.currentTab !== 'network') return;

        const filteredRequests = this.getFilteredRequests();

        if (filteredRequests.length === 0) {
            requestsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🌐</div>
                    <div>네트워크 요청이 없습니다</div>
                </div>
            `;
            return;
        }

        requestsList.innerHTML = filteredRequests.map(request => `
            <div class="request-item">
                <span class="request-method">${request.method}</span>
                <span class="request-url">${this.truncateUrl(request.url)}</span>
                <span class="request-status ${this.getStatusClass(request.status)}">${request.status}</span>
                <span class="request-time">${request.time}ms</span>
            </div>
        `).join('');
    }

    getFilteredRequests() {
        const activeFilter = document.querySelector('.filter-btn.active');
        const urlFilter = document.getElementById('urlFilter');
        
        let filtered = this.requests;

        // 카테고리 필터
        if (activeFilter) {
            const filterType = activeFilter.getAttribute('data-filter');
            if (filterType === 'api') {
                filtered = filtered.filter(r => r.url.includes('/api/') || r.url.includes(':8080'));
            } else if (filterType === 'static') {
                filtered = filtered.filter(r => /\.(js|css|png|jpg|svg)$/.test(r.url));
            }
        }

        // URL 필터
        if (urlFilter && urlFilter.value) {
            const filterValue = urlFilter.value.toLowerCase();
            filtered = filtered.filter(r => r.url.toLowerCase().includes(filterValue));
        }

        return filtered.slice(-20); // 최근 20개만 표시
    }

    updatePerformanceMetrics() {
        const totalRequests = this.requests.length;
        const avgTime = totalRequests > 0 ? 
            Math.round(this.requests.reduce((sum, r) => sum + r.time, 0) / totalRequests) : 0;
        const errorCount = this.requests.filter(r => r.status >= 400).length;
        const errorRate = totalRequests > 0 ? Math.round((errorCount / totalRequests) * 100) : 0;

        this.updateElement('totalRequests', totalRequests.toString());
        this.updateElement('avgResponseTime', `${avgTime}ms`);
        this.updateElement('errorRate', `${errorRate}%`);
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    truncateUrl(url) {
        if (url.length > 50) {
            return '...' + url.slice(-47);
        }
        return url;
    }

    getStatusClass(status) {
        if (status >= 200 && status < 300) return 'success';
        if (status >= 400) return 'error';
        return 'info';
    }

    filterRequests() {
        this.updateNetworkTab();
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    new MoneyShiftDevTools();
});