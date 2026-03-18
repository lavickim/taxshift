/**
 * MoneyShift Manager - Background Service Worker
 * 백그라운드에서 실행되는 서비스 관리 및 통신
 */

class MoneyShiftBackground {
  constructor() {
    this.services = {
      database: {
        name: 'Database',
        script: './start-db.sh',
        stopScript: './stop-all.sh',
        port: 5432
      },
      backend: {
        name: 'Backend API',
        script: './start-backend.sh',
        stopScript: 'pkill -f "spring-boot:run"',
        port: 8080
      },
      admin: {
        name: 'Admin Panel',
        script: './start-admin.sh',
        stopScript: 'pkill -f "next dev"',
        port: 3000
      },
      mobile: {
        name: 'Mobile Dev',
        script: './start-app.sh',
        stopScript: 'pkill -f "expo start"',
        port: 19002
      },
      data: {
        name: 'Data Processing',
        script: 'cd mshift-data_processing && ./docker-run.sh',
        stopScript: 'docker stop mshift-data-processing',
        port: 8501
      }
    };

    this.logs = [];
    this.maxLogs = 1000;
    
    this.init();
  }

  init() {
    this.setupMessageListeners();
    this.setupAlarms();
    this.setupNotifications();
    this.loadSavedLogs();
    
    // 주기적 헬스체크 (5분마다)
    chrome.alarms.create('healthCheck', { periodInMinutes: 5 });
  }

  setupMessageListeners() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender).then(sendResponse);
      return true; // 비동기 응답을 위해 true 반환
    });

    // 팝업과의 통신
    chrome.runtime.onConnect.addListener((port) => {
      if (port.name === 'popup') {
        port.onMessage.addListener((message) => {
          this.handlePopupMessage(message, port);
        });
      }
    });
  }

  setupAlarms() {
    chrome.alarms.onAlarm.addListener((alarm) => {
      switch (alarm.name) {
        case 'healthCheck':
          this.performHealthCheck();
          break;
        case 'logCleanup':
          this.cleanupLogs();
          break;
      }
    });

    // 로그 정리 (매일 자정)
    chrome.alarms.create('logCleanup', { periodInMinutes: 1440 });
  }

  setupNotifications() {
    chrome.notifications.onClicked.addListener((notificationId) => {
      if (notificationId.startsWith('service_')) {
        const serviceId = notificationId.replace('service_', '');
        chrome.action.openPopup();
      }
    });
  }

  async handleMessage(message, sender) {
    try {
      switch (message.action) {
        case 'START_ALL_SERVICES':
          return await this.startAllServices();
        
        case 'STOP_ALL_SERVICES':
          return await this.stopAllServices();
        
        case 'START_SERVICE':
          return await this.startService(message.serviceId);
        
        case 'STOP_SERVICE':
          return await this.stopService(message.serviceId);
        
        case 'GET_SERVICE_STATUS':
          return await this.getServiceStatus(message.serviceId);
        
        case 'GET_ALL_STATUS':
          return await this.getAllStatus();
        
        case 'GET_LOGS':
          return await this.getLogs(message.filter);
        
        case 'CLEAR_LOGS':
          return await this.clearLogs();

        case 'DETECT_TRANSACTION':
          return await this.detectTransaction(message.data);
        
        default:
          throw new Error(`Unknown action: ${message.action}`);
      }
    } catch (error) {
      this.addLog('error', 'Background', `메시지 처리 실패: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async startAllServices() {
    this.addLog('info', 'System', '모든 서비스 시작 시도');
    
    try {
      // Native Messaging을 통해 스크립트 실행
      const result = await this.executeScript('./start-all.sh');
      
      this.addLog('success', 'System', '모든 서비스 시작 명령 실행');
      
      // 성공 알림
      chrome.notifications.create('start_all_success', {
        type: 'basic',
        iconUrl: 'assets/icons/icon48.png',
        title: 'MoneyShift Manager',
        message: '모든 서비스 시작을 시도했습니다.'
      });

      return { success: true };
    } catch (error) {
      this.addLog('error', 'System', `서비스 시작 실패: ${error.message}`);
      
      chrome.notifications.create('start_all_error', {
        type: 'basic',
        iconUrl: 'assets/icons/icon48.png',
        title: 'MoneyShift Manager - 오류',
        message: '서비스 시작에 실패했습니다.'
      });

      return { success: false, error: error.message };
    }
  }

  async stopAllServices() {
    this.addLog('info', 'System', '모든 서비스 중지 시도');
    
    try {
      const result = await this.executeScript('./stop-all.sh');
      
      this.addLog('success', 'System', '모든 서비스 중지 명령 실행');
      
      chrome.notifications.create('stop_all_success', {
        type: 'basic',
        iconUrl: 'assets/icons/icon48.png',
        title: 'MoneyShift Manager',
        message: '모든 서비스가 안전하게 중지되었습니다.'
      });

      return { success: true };
    } catch (error) {
      this.addLog('error', 'System', `서비스 중지 실패: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async startService(serviceId) {
    const service = this.services[serviceId];
    if (!service) {
      throw new Error(`알 수 없는 서비스: ${serviceId}`);
    }

    this.addLog('info', service.name, '서비스 시작 시도');
    
    try {
      const result = await this.executeScript(service.script);
      
      this.addLog('success', service.name, '서비스 시작 완료');
      
      chrome.notifications.create(`service_${serviceId}_start`, {
        type: 'basic',
        iconUrl: 'assets/icons/icon48.png',
        title: 'MoneyShift Manager',
        message: `${service.name} 서비스가 시작되었습니다.`
      });

      return { success: true };
    } catch (error) {
      this.addLog('error', service.name, `시작 실패: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async stopService(serviceId) {
    const service = this.services[serviceId];
    if (!service) {
      throw new Error(`알 수 없는 서비스: ${serviceId}`);
    }

    this.addLog('info', service.name, '서비스 중지 시도');
    
    try {
      const result = await this.executeScript(service.stopScript);
      
      this.addLog('success', service.name, '서비스 중지 완료');
      
      chrome.notifications.create(`service_${serviceId}_stop`, {
        type: 'basic',
        iconUrl: 'assets/icons/icon48.png',
        title: 'MoneyShift Manager',
        message: `${service.name} 서비스가 중지되었습니다.`
      });

      return { success: true };
    } catch (error) {
      this.addLog('error', service.name, `중지 실패: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async executeScript(script) {
    // 실제 환경에서는 Native Messaging을 사용하여 시스템 명령어 실행
    // 현재는 시뮬레이션
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // 스크립트 실행 시뮬레이션
        if (Math.random() > 0.1) { // 90% 성공률
          resolve({ success: true, output: 'Script executed successfully' });
        } else {
          reject(new Error('Script execution failed'));
        }
      }, 1000);
    });
  }

  async getServiceStatus(serviceId) {
    const service = this.services[serviceId];
    if (!service) {
      return { success: false, error: 'Service not found' };
    }

    try {
      const isRunning = await this.checkPort(service.port);
      return { 
        success: true, 
        status: isRunning ? 'running' : 'stopped',
        port: service.port 
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getAllStatus() {
    const statuses = {};
    
    for (const [serviceId, service] of Object.entries(this.services)) {
      try {
        const isRunning = await this.checkPort(service.port);
        statuses[serviceId] = {
          name: service.name,
          status: isRunning ? 'running' : 'stopped',
          port: service.port
        };
      } catch (error) {
        statuses[serviceId] = {
          name: service.name,
          status: 'error',
          port: service.port,
          error: error.message
        };
      }
    }

    return { success: true, statuses };
  }

  async checkPort(port) {
    try {
      const response = await fetch(`http://localhost:${port}`, {
        method: 'HEAD',
        mode: 'no-cors'
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async performHealthCheck() {
    this.addLog('info', 'System', '정기 헬스체크 시작');
    
    const statuses = await this.getAllStatus();
    const runningServices = Object.values(statuses.statuses).filter(s => s.status === 'running');
    
    if (runningServices.length === 0) {
      this.addLog('warning', 'System', '실행 중인 서비스가 없습니다');
    } else {
      this.addLog('info', 'System', `${runningServices.length}개 서비스가 실행 중입니다`);
    }
  }

  async detectTransaction(data) {
    // 거래 감지 로직
    this.addLog('info', 'Transaction', `거래 감지 시도: ${data.text}`);
    
    try {
      // MoneyShift API를 통한 거래 분류
      const response = await fetch('http://localhost:8080/mshift-api/v2/transactions/classify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          transactionText: data.text,
          amount: data.amount,
          timestamp: data.timestamp || new Date().toISOString()
        })
      });

      if (response.ok) {
        const result = await response.json();
        this.addLog('success', 'Transaction', `거래 분류 완료: ${result.category}`);
        
        // 거래 감지 알림
        chrome.notifications.create('transaction_detected', {
          type: 'basic',
          iconUrl: 'assets/icons/icon48.png',
          title: 'MoneyShift - 거래 감지',
          message: `${result.category}: ${data.text}`
        });

        return { success: true, result };
      } else {
        throw new Error('API 응답 오류');
      }
    } catch (error) {
      this.addLog('error', 'Transaction', `거래 분류 실패: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  addLog(level, service, message) {
    const log = {
      timestamp: new Date().toISOString(),
      level,
      service,
      message
    };

    this.logs.push(log);
    
    // 로그 개수 제한
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // 로그 저장
    this.saveLogs();
  }

  async getLogs(filter = {}) {
    let filteredLogs = this.logs;

    if (filter.service) {
      filteredLogs = filteredLogs.filter(log => log.service === filter.service);
    }

    if (filter.level) {
      filteredLogs = filteredLogs.filter(log => log.level === filter.level);
    }

    if (filter.since) {
      const since = new Date(filter.since);
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) > since);
    }

    return { success: true, logs: filteredLogs };
  }

  async clearLogs() {
    this.logs = [];
    await this.saveLogs();
    this.addLog('info', 'System', '로그가 지워졌습니다');
    return { success: true };
  }

  async saveLogs() {
    try {
      await chrome.storage.local.set({
        recentLogs: this.logs.slice(-100) // 최근 100개만 저장
      });
    } catch (error) {
      console.error('로그 저장 실패:', error);
    }
  }

  async loadSavedLogs() {
    try {
      const result = await chrome.storage.local.get(['recentLogs']);
      if (result.recentLogs) {
        this.logs = result.recentLogs;
      }
    } catch (error) {
      console.error('로그 로드 실패:', error);
    }
  }

  cleanupLogs() {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    this.logs = this.logs.filter(log => new Date(log.timestamp) > oneWeekAgo);
    this.saveLogs();
    
    this.addLog('info', 'System', '일주일 이전 로그를 정리했습니다');
  }
}

// 서비스 워커 초기화
const moneyShiftBackground = new MoneyShiftBackground();