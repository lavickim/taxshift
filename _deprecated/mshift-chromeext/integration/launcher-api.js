/**
 * MoneyShift Chrome Extension - Launcher Integration API
 * Handles communication with Electron Launcher app
 */

class LauncherAPI {
  constructor() {
    this.websocketPort = 9999;
    this.websocket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 2000;
    this.isConnected = false;
    
    this.init();
  }

  async init() {
    console.log('🔌 LauncherAPI initializing...');
    await this.connectWebSocket();
    this.setupEventListeners();
  }

  async connectWebSocket() {
    try {
      // Check if launcher is running first
      const isLauncherRunning = await this.checkLauncherStatus();
      if (!isLauncherRunning) {
        console.log('📱 Launcher not running - will retry later');
        this.scheduleReconnect();
        return;
      }

      this.websocket = new WebSocket(`ws://localhost:${this.websocketPort}`);
      
      this.websocket.onopen = () => {
        console.log('✅ Connected to MoneyShift Launcher');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        // Send initial handshake
        this.send({
          type: 'handshake',
          source: 'chrome-extension',
          timestamp: new Date().toISOString()
        });
      };

      this.websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Failed to parse message:', error);
        }
      };

      this.websocket.onclose = () => {
        console.log('🔌 Disconnected from Launcher');
        this.isConnected = false;
        this.scheduleReconnect();
      };

      this.websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnected = false;
      };

    } catch (error) {
      console.error('Failed to connect to Launcher:', error);
      this.scheduleReconnect();
    }
  }

  async checkLauncherStatus() {
    try {
      const response = await fetch(`http://localhost:${this.websocketPort}/status`, {
        method: 'HEAD',
        mode: 'no-cors'
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('❌ Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`🔄 Reconnecting to Launcher in ${this.reconnectDelay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connectWebSocket();
    }, this.reconnectDelay);
  }

  handleMessage(data) {
    console.log('📨 Received from Launcher:', data);
    
    switch (data.type) {
      case 'handshakeAck':
        console.log('🤝 Handshake acknowledged');
        break;
      case 'transactionRequest':
        this.handleTransactionRequest(data);
        break;
      case 'configUpdate':
        this.handleConfigUpdate(data);
        break;
      case 'serviceStatus':
        this.handleServiceStatus(data);
        break;
    }
  }

  handleTransactionRequest(data) {
    // Request recent transactions from content script
    this.broadcastToTabs({
      type: 'getRecentTransactions',
      requestId: data.requestId
    });
  }

  handleConfigUpdate(data) {
    // Update extension configuration
    chrome.storage.local.set({
      moneyShiftConfig: data.config
    });
  }

  handleServiceStatus(data) {
    // Update extension badge based on service status
    const badge = data.allServicesRunning ? '✓' : '!';
    const color = data.allServicesRunning ? '#10b981' : '#f59e0b';
    
    chrome.action.setBadgeText({ text: badge });
    chrome.action.setBadgeBackgroundColor({ color: color });
  }

  setupEventListeners() {
    // Listen for transaction data from content scripts
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'transactionDetected') {
        this.sendTransactionData(message.data);
      } else if (message.type === 'recentTransactions') {
        this.sendRecentTransactions(message.data, message.requestId);
      }
    });
  }

  sendTransactionData(transactionData) {
    const payload = {
      type: 'transactionData',
      data: {
        ...transactionData,
        timestamp: new Date().toISOString(),
        source: 'chrome-extension',
        url: transactionData.pageUrl
      }
    };
    
    this.send(payload);
  }

  sendRecentTransactions(transactions, requestId) {
    const payload = {
      type: 'recentTransactions',
      requestId: requestId,
      data: transactions,
      timestamp: new Date().toISOString()
    };
    
    this.send(payload);
  }

  send(data) {
    if (this.isConnected && this.websocket) {
      try {
        this.websocket.send(JSON.stringify(data));
        console.log('📤 Sent to Launcher:', data);
      } catch (error) {
        console.error('Failed to send message:', error);
        this.isConnected = false;
      }
    } else {
      console.log('📝 Queuing message (not connected):', data);
      // Could implement message queue here
    }
  }

  broadcastToTabs(message) {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, message).catch(() => {
            // Ignore errors for tabs without content script
          });
        }
      });
    });
  }

  // Public API methods
  async getSystemStatus() {
    return new Promise((resolve) => {
      const requestId = Date.now().toString();
      
      const timeout = setTimeout(() => {
        resolve({ connected: false, error: 'Timeout' });
      }, 5000);

      const handleResponse = (data) => {
        if (data.type === 'systemStatus' && data.requestId === requestId) {
          clearTimeout(timeout);
          resolve(data.status);
        }
      };

      // Temporarily add message handler
      const originalHandler = this.handleMessage;
      this.handleMessage = (data) => {
        originalHandler.call(this, data);
        handleResponse(data);
      };

      this.send({
        type: 'getSystemStatus',
        requestId: requestId
      });
    });
  }

  async startService(serviceId) {
    this.send({
      type: 'startService',
      serviceId: serviceId,
      timestamp: new Date().toISOString()
    });
  }

  async stopService(serviceId) {
    this.send({
      type: 'stopService',
      serviceId: serviceId,
      timestamp: new Date().toISOString()
    });
  }

  disconnect() {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
      this.isConnected = false;
    }
  }
}

// Global instance
window.launcherAPI = new LauncherAPI();