const { contextBridge, ipcRenderer } = require('electron')

// ElectronAPI를 렌더러 프로세스에 노출
contextBridge.exposeInMainWorld('electronAPI', {
  // 서비스 관리
  getServicesStatus: () => ipcRenderer.invoke('get-services-status'),
  startAllServices: () => ipcRenderer.invoke('start-all-services'),
  stopAllServices: () => ipcRenderer.invoke('stop-all-services'),
  startService: (serviceName) => ipcRenderer.invoke('start-service', serviceName),
  stopService: (serviceName) => ipcRenderer.invoke('stop-service', serviceName),
  
  // 로그 관리
  getLogs: (serviceName) => ipcRenderer.invoke('get-logs', serviceName),
  
  // 프로젝트 관리
  openProjectFolder: () => ipcRenderer.invoke('open-project-folder'),
  setProjectPath: () => ipcRenderer.invoke('set-project-path'),
  
  // 퀵 액세스 관련
  closeQuickAccess: () => ipcRenderer.send('close-quick-access'),
  
  // 윈도우 크기 토글
  toggleWindowSize: () => ipcRenderer.invoke('toggle-window-size'),
  getCompactMode: () => ipcRenderer.invoke('get-compact-mode'),
  
  // 이벤트 리스너
  onServicesStatusUpdate: (callback) => {
    ipcRenderer.on('services-status-update', (event, services) => {
      callback(services)
    })
  },
  
  onLogUpdate: (callback) => {
    ipcRenderer.on('log-update', (event, logData) => {
      callback(logData)
    })
  },
  
  onCompactModeChanged: (callback) => {
    ipcRenderer.on('compact-mode-changed', (event, isCompact) => {
      callback(isCompact)
    })
  },
  
  // 리스너 제거
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
})