/**
 * MoneyShift Manager - Popup Script
 * 크롬 확장 팝업 UI 제어 및 시스템 관리
 */

class MoneyShiftManager {
  constructor() {
    this.services = [
      {
        id: 'database',
        name: 'Database',
        icon: '🗄️',
        port: 5432,
        endpoint: null,
        type: 'database',
        description: 'PostgreSQL + Redis'
      },
      {
        id: 'backend',
        name: 'Backend API',
        icon: '☕',
        port: 8080,
        endpoint: '/mshift-api/actuator/health',
        type: 'spring-boot',
        description: 'Spring Boot API'
      },
      {
        id: 'admin',
        name: 'Admin Panel',
        icon: '🌐',
        port: 3000,
        endpoint: '/',
        type: 'nextjs',
        description: 'Next.js Admin'
      },
      {
        id: 'mobile',
        name: 'Mobile Dev',
        icon: '📱',
        port: 19002,
        endpoint: '/',
        type: 'react-native',
        description: 'Expo Dev Server'
      },
      {
        id: 'data',
        name: 'Data Processing',
        icon: '🐍',
        port: 8501,
        endpoint: '/',
        type: 'streamlit',
        description: 'Streamlit Dashboard'
      }
    ];

    this.init();
  }

  async init() {
    await this.setupEventListeners();
    await this.checkSystemHealth();
    await this.renderServices();
    await this.loadRecentLogs();
    
    // 주기적 상태 체크 (30초마다)
    setInterval(() => this.checkSystemHealth(), 30000);
  }

  async setupEventListeners() {
    // 전체 제어 버튼
    document.getElementById('startAllBtn').addEventListener('click', () => this.startAllServices());
    document.getElementById('stopAllBtn').addEventListener('click', () => this.stopAllServices());
    
    // 새로고침 버튼
    document.getElementById('refreshBtn').addEventListener('click', () => this.checkSystemHealth());
    
    // 설정 버튼
    document.getElementById('settingsBtn').addEventListener('click', () => this.openSettings());
    
    // 로그 관련
    document.getElementById('viewAllLogsBtn').addEventListener('click', () => this.openLogViewer());
    
    // 피드백 및 도움말
    document.getElementById('feedbackBtn').addEventListener('click', () => this.openFeedback());
    document.getElementById('helpBtn').addEventListener('click', () => this.openHelp());

    // 키보드 단축키 처리
    document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
  }

  async checkSystemHealth() {
    this.showLoading(true);
    
    try {
      const healthResults = await Promise.allSettled(
        this.services.map(service => this.checkServiceHealth(service))
      );

      let healthyCount = 0;
      healthResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          healthyCount++;
          this.services[index].status = 'healthy';
        } else {
          this.services[index].status = 'error';
        }
      });

      // 전체 시스템 상태 업데이트
      this.updateSystemStatus(healthyCount, this.services.length);
      
      // 연결 상태 업데이트
      this.updateConnectionStatus(healthyCount > 0);
      
      // 서비스 카드 업데이트
      this.renderServices();

    } catch (error) {
      console.error('시스템 상태 확인 실패:', error);
      this.showToast('시스템 상태 확인에 실패했습니다.', 'error');
    } finally {
      this.showLoading(false);
    }
  }

  async checkServiceHealth(service) {
    if (!service.endpoint) {
      // 데이터베이스같은 경우 포트만 체크
      return await this.checkPort(service.port);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`http://localhost:${service.port}${service.endpoint}`, {
        method: 'GET',
        signal: controller.signal,
        mode: 'no-cors' // CORS 에러 방지
      });

      clearTimeout(timeoutId);
      return true;
    } catch (error) {
      console.log(`Service ${service.name} health check failed:`, error.message);
      return false;
    }
  }

  async checkPort(port) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      await fetch(`http://localhost:${port}`, {
        method: 'GET',
        signal: controller.signal,
        mode: 'no-cors'
      });

      clearTimeout(timeoutId);
      return true;
    } catch (error) {
      return false;
    }
  }

  updateSystemStatus(healthyCount, totalCount) {
    const healthElement = document.getElementById('systemHealth');
    const indicator = healthElement.querySelector('.health-indicator');
    const text = healthElement.querySelector('.health-text');

    if (healthyCount === totalCount) {
      indicator.className = 'health-indicator healthy';
      text.textContent = '모든 서비스 정상';
    } else if (healthyCount > 0) {
      indicator.className = 'health-indicator warning';
      text.textContent = `${healthyCount}/${totalCount} 서비스 실행 중`;
    } else {
      indicator.className = 'health-indicator error';
      text.textContent = '모든 서비스 중지됨';
    }
  }

  updateConnectionStatus(isConnected) {
    const statusElement = document.getElementById('connectionStatus');
    const indicator = document.getElementById('statusIndicator');
    const text = document.getElementById('statusText');

    if (isConnected) {
      indicator.className = 'status-indicator connected';
      text.textContent = '연결됨';
    } else {
      indicator.className = 'status-indicator disconnected';
      text.textContent = '연결 끊김';
    }
  }

  renderServices() {
    const servicesGrid = document.getElementById('servicesGrid');
    servicesGrid.innerHTML = '';

    this.services.forEach(service => {
      const serviceCard = this.createServiceCard(service);
      servicesGrid.appendChild(serviceCard);
    });
  }

  createServiceCard(service) {
    const card = document.createElement('div');
    card.className = `service-card ${service.status || 'unknown'}`;
    card.innerHTML = `
      <div class="service-header">
        <div class="service-icon">${service.icon}</div>
        <div class="service-info">
          <h3 class="service-name">${service.name}</h3>
          <p class="service-description">${service.description}</p>
        </div>
        <div class="service-status ${service.status || 'unknown'}">
          <div class="status-dot"></div>
        </div>
      </div>
      <div class="service-details">
        <div class="service-port">포트: ${service.port}</div>
        <div class="service-type">${service.type}</div>
      </div>
      <div class="service-actions">
        <button class="service-btn start" data-service="${service.id}" ${service.status === 'healthy' ? 'disabled' : ''}>
          시작
        </button>
        <button class="service-btn stop" data-service="${service.id}" ${service.status !== 'healthy' ? 'disabled' : ''}>
          중지
        </button>
        <button class="service-btn view" data-service="${service.id}">
          보기
        </button>
      </div>
    `;

    // 버튼 이벤트 리스너 추가
    const startBtn = card.querySelector('.service-btn.start');
    const stopBtn = card.querySelector('.service-btn.stop');
    const viewBtn = card.querySelector('.service-btn.view');

    startBtn.addEventListener('click', () => this.startService(service));
    stopBtn.addEventListener('click', () => this.stopService(service));
    viewBtn.addEventListener('click', () => this.viewService(service));

    return card;
  }

  async startAllServices() {
    this.showLoading(true, '모든 서비스를 시작하는 중...');
    
    try {
      // 백그라운드 스크립트에 메시지 전송
      await chrome.runtime.sendMessage({
        action: 'START_ALL_SERVICES'
      });
      
      this.showToast('모든 서비스 시작 명령을 전송했습니다.', 'success');
      
      // 잠시 후 상태 체크
      setTimeout(() => this.checkSystemHealth(), 5000);
      
    } catch (error) {
      console.error('서비스 시작 실패:', error);
      this.showToast('서비스 시작에 실패했습니다.', 'error');
    } finally {
      this.showLoading(false);
    }
  }

  async stopAllServices() {
    if (!confirm('모든 서비스를 중지하시겠습니까?')) return;
    
    this.showLoading(true, '모든 서비스를 중지하는 중...');
    
    try {
      await chrome.runtime.sendMessage({
        action: 'STOP_ALL_SERVICES'
      });
      
      this.showToast('모든 서비스 중지 명령을 전송했습니다.', 'success');
      
      setTimeout(() => this.checkSystemHealth(), 3000);
      
    } catch (error) {
      console.error('서비스 중지 실패:', error);
      this.showToast('서비스 중지에 실패했습니다.', 'error');
    } finally {
      this.showLoading(false);
    }
  }

  async startService(service) {
    this.showLoading(true, `${service.name} 시작 중...`);
    
    try {
      await chrome.runtime.sendMessage({
        action: 'START_SERVICE',
        serviceId: service.id
      });
      
      this.showToast(`${service.name} 시작 명령을 전송했습니다.`, 'success');
      setTimeout(() => this.checkSystemHealth(), 3000);
      
    } catch (error) {
      console.error(`${service.name} 시작 실패:`, error);
      this.showToast(`${service.name} 시작에 실패했습니다.`, 'error');
    } finally {
      this.showLoading(false);
    }
  }

  async stopService(service) {
    if (!confirm(`${service.name}을(를) 중지하시겠습니까?`)) return;
    
    this.showLoading(true, `${service.name} 중지 중...`);
    
    try {
      await chrome.runtime.sendMessage({
        action: 'STOP_SERVICE',
        serviceId: service.id
      });
      
      this.showToast(`${service.name} 중지 명령을 전송했습니다.`, 'success');
      setTimeout(() => this.checkSystemHealth(), 2000);
      
    } catch (error) {
      console.error(`${service.name} 중지 실패:`, error);
      this.showToast(`${service.name} 중지에 실패했습니다.`, 'error');
    } finally {
      this.showLoading(false);
    }
  }

  viewService(service) {
    const url = service.endpoint ? 
      `http://localhost:${service.port}${service.endpoint}` : 
      `http://localhost:${service.port}`;
    
    chrome.tabs.create({ url });
  }

  async loadRecentLogs() {
    try {
      const logs = await chrome.storage.local.get(['recentLogs']);
      const recentLogs = logs.recentLogs || [];
      
      this.renderLogs(recentLogs);
    } catch (error) {
      console.error('로그 로드 실패:', error);
    }
  }

  renderLogs(logs) {
    const logsContainer = document.getElementById('logsContainer');
    const logsEmpty = document.getElementById('logsEmpty');
    
    if (logs.length === 0) {
      logsEmpty.style.display = 'flex';
      return;
    }
    
    logsEmpty.style.display = 'none';
    logsContainer.innerHTML = '';
    
    logs.slice(-5).reverse().forEach(log => {
      const logElement = document.createElement('div');
      logElement.className = `log-item ${log.level}`;
      logElement.innerHTML = `
        <div class="log-time">${new Date(log.timestamp).toLocaleTimeString()}</div>
        <div class="log-service">${log.service}</div>
        <div class="log-message">${log.message}</div>
      `;
      logsContainer.appendChild(logElement);
    });
  }

  handleKeyboardShortcuts(e) {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 's':
          e.preventDefault();
          this.startAllServices();
          break;
        case 't':
          e.preventDefault();
          this.stopAllServices();
          break;
        case 'r':
          e.preventDefault();
          this.checkSystemHealth();
          break;
      }
    }
  }

  openSettings() {
    chrome.runtime.openOptionsPage();
  }

  openLogViewer() {
    chrome.tabs.create({ 
      url: chrome.runtime.getURL('logs/logs.html') 
    });
  }

  openFeedback() {
    chrome.tabs.create({ 
      url: 'https://github.com/moneyshift/chrome-extension/issues' 
    });
  }

  openHelp() {
    chrome.tabs.create({ 
      url: chrome.runtime.getURL('help/help.html') 
    });
  }

  showLoading(show, message = '처리 중...') {
    const overlay = document.getElementById('loadingOverlay');
    const text = overlay.querySelector('.loading-text');
    
    if (show) {
      text.textContent = message;
      overlay.style.display = 'flex';
    } else {
      overlay.style.display = 'none';
    }
  }

  showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const icon = document.getElementById('toastIcon');
    const messageEl = document.getElementById('toastMessage');
    
    // 아이콘 설정
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    
    icon.textContent = icons[type] || icons.info;
    messageEl.textContent = message;
    
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
      toast.className = `toast ${type}`;
    }, 3000);
  }
}

// 팝업 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
  new MoneyShiftManager();
});