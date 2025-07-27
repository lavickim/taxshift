const { app, BrowserWindow, Menu, ipcMain, dialog, shell, globalShortcut, Tray, nativeImage } = require('electron')
const path = require('path')
const { spawn, exec } = require('child_process')
const fs = require('fs')
const Store = require('electron-store')

// 설정 스토어
const store = new Store()

// 메인 윈도우
let mainWindow
let tray = null
let quickAccessWindow = null

// MoneyShift 프로젝트 경로
const MONEYSHIFT_PATH = store.get('moneyshift_path', '/Users/lavickim/_Dev/moneyshift')

// 서비스 상태 추적
let services = {
  backend: { pid: null, status: 'stopped', port: 8080 },
  frontend: { pid: null, status: 'stopped', port: 3000 },
  database: { pid: null, status: 'stopped', port: 5432 },
  redis: { pid: null, status: 'stopped', port: 6379 },
  mobile: { pid: null, status: 'stopped', port: 19002 }
}

function createWindow() {
  // 메인 윈도우 생성
  const isCompactMode = store.get('compactMode', true)
  const windowSize = isCompactMode ? { width: 200, height: 400 } : { width: 1200, height: 800 }
  
  mainWindow = new BrowserWindow({
    width: windowSize.width,
    height: windowSize.height,
    minWidth: 200,
    minHeight: 400,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'hiddenInset', // macOS 스타일
    icon: path.join(__dirname, '../assets/icon.png'),
    show: false // 준비될 때까지 숨김
  })

  // HTML 로드
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))

  // 윈도우가 준비되면 표시
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // DevTools (개발 모드에서만)
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools()
  }
}

// 메뉴 설정
function createMenu() {
  const template = [
    {
      label: 'MoneyShift Manager',
      submenu: [
        {
          label: 'About MoneyShift Manager',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About',
              message: 'MoneyShift Manager v1.0.0',
              detail: 'MoneyShift AI Platform System Manager\\n\\n개발자를 위한 시스템 관리 도구'
            })
          }
        },
        { type: 'separator' },
        {
          label: 'Preferences...',
          accelerator: 'Cmd+,',
          click: () => openPreferences()
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'Cmd+Q',
          click: () => app.quit()
        }
      ]
    },
    {
      label: 'Services',
      submenu: [
        {
          label: 'Start All',
          accelerator: 'Cmd+Shift+S',
          click: () => startAllServices()
        },
        {
          label: 'Stop All',
          accelerator: 'Cmd+Shift+T',
          click: () => stopAllServices()
        },
        { type: 'separator' },
        {
          label: 'Start Backend',
          click: () => startService('backend')
        },
        {
          label: 'Start Frontend',
          click: () => startService('frontend')
        },
        {
          label: 'Start Database',
          click: () => startService('database')
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'Cmd+R',
          click: () => mainWindow.reload()
        },
        {
          label: 'Force Reload',
          accelerator: 'Cmd+Shift+R',
          click: () => mainWindow.webContents.reloadIgnoringCache()
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'F12',
          click: () => mainWindow.webContents.toggleDevTools()
        }
      ]
    },
    {
      label: 'Window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'Cmd+M',
          click: () => mainWindow.minimize()
        },
        {
          label: 'Close',
          accelerator: 'Cmd+W',
          click: () => mainWindow.close()
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'MoneyShift Documentation',
          click: () => shell.openExternal('https://github.com/your-org/moneyshift')
        },
        {
          label: 'Report Issue',
          click: () => shell.openExternal('https://github.com/your-org/moneyshift/issues')
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

// 앱 이벤트
app.whenReady().then(() => {
  createWindow()
  createMenu()
  createTray()
  registerGlobalShortcuts()
  
  // 서비스 상태 체크 시작
  setInterval(checkServicesStatus, 5000)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.on('before-quit', () => {
  globalShortcut.unregisterAll()
})

// 트레이 생성
function createTray() {
  const iconPath = path.join(__dirname, '../assets/icon16.png')
  tray = new Tray(nativeImage.createFromPath(iconPath))
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '🚀 빠른 시작',
      submenu: [
        {
          label: '⚡ 모든 서비스 시작',
          accelerator: 'CommandOrControl+Shift+S',
          click: () => startAllServices()
        },
        {
          label: '🛑 모든 서비스 중지',
          accelerator: 'CommandOrControl+Shift+T', 
          click: () => stopAllServices()
        },
        { type: 'separator' },
        {
          label: '🔧 Backend 시작',
          click: () => startService('backend')
        },
        {
          label: '🎨 Frontend 시작',
          click: () => startService('frontend')
        },
        {
          label: '🗄️ Database 시작',
          click: () => startService('database')
        }
      ]
    },
    { type: 'separator' },
    {
      label: '⚡ 퀵 액세스',
      accelerator: 'CommandOrControl+Shift+Q',
      click: () => toggleQuickAccess()
    },
    {
      label: '📊 상태 체크',
      click: () => showServiceStatus()
    },
    { type: 'separator' },
    {
      label: '🏠 메인 윈도우 열기',
      click: () => {
        if (mainWindow) {
          mainWindow.show()
          mainWindow.focus()
        } else {
          createWindow()
        }
      }
    },
    {
      label: '❌ 종료',
      click: () => app.quit()
    }
  ])
  
  tray.setContextMenu(contextMenu)
  tray.setToolTip('MoneyShift Manager - 빠른 제어')
  
  // 트레이 아이콘 클릭시 퀵 액세스 토글
  tray.on('click', () => {
    toggleQuickAccess()
  })
}

// 글로벌 단축키 등록
function registerGlobalShortcuts() {
  // 퀵 액세스 토글
  globalShortcut.register('CommandOrControl+Shift+Q', () => {
    toggleQuickAccess()
  })
  
  // 모든 서비스 시작
  globalShortcut.register('CommandOrControl+Shift+S', () => {
    startAllServices()
    showNotification('🚀 모든 서비스 시작 중...', 'MoneyShift 서비스들을 시작하고 있습니다.')
  })
  
  // 모든 서비스 중지
  globalShortcut.register('CommandOrControl+Shift+T', () => {
    stopAllServices()
    showNotification('🛑 모든 서비스 중지 중...', 'MoneyShift 서비스들을 중지하고 있습니다.')
  })
  
  // 메인 윈도우 토글
  globalShortcut.register('CommandOrControl+Shift+M', () => {
    if (mainWindow && mainWindow.isVisible()) {
      mainWindow.hide()
    } else if (mainWindow) {
      mainWindow.show()
      mainWindow.focus()
    } else {
      createWindow()
    }
  })
}

// 퀵 액세스 윈도우 토글
function toggleQuickAccess() {
  if (quickAccessWindow && !quickAccessWindow.isDestroyed()) {
    quickAccessWindow.close()
    quickAccessWindow = null
  } else {
    createQuickAccessWindow()
  }
}

// 퀵 액세스 윈도우 생성
function createQuickAccessWindow() {
  quickAccessWindow = new BrowserWindow({
    width: 320,
    height: 480,
    resizable: false,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    backgroundColor: '#1a1a1a',
    vibrancy: 'dark', // macOS 블러 효과
    transparent: true
  })
  
  // 화면 중앙에 위치
  const { screen } = require('electron')
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width, height } = primaryDisplay.workAreaSize
  
  quickAccessWindow.setPosition(
    Math.round(width / 2 - 160),
    Math.round(height / 2 - 240)
  )
  
  quickAccessWindow.loadFile(path.join(__dirname, '../renderer/quick-access.html'))
  
  // 포커스를 잃으면 자동으로 닫기
  quickAccessWindow.on('blur', () => {
    setTimeout(() => {
      if (quickAccessWindow && !quickAccessWindow.isDestroyed()) {
        quickAccessWindow.close()
        quickAccessWindow = null
      }
    }, 200)
  })
}

// 서비스 상태 알림
function showServiceStatus() {
  const statusMessages = []
  for (const [name, service] of Object.entries(services)) {
    const statusIcon = service.status === 'running' ? '🟢' : 
                      service.status === 'starting' ? '🟡' : 
                      service.status === 'error' ? '🔴' : '⚪'
    statusMessages.push(`${statusIcon} ${name.toUpperCase()}: ${service.status}`)
  }
  
  showNotification('📊 서비스 상태', statusMessages.join('\n'))
}

// 알림 표시
function showNotification(title, body) {
  new Notification(title, {
    body: body,
    icon: path.join(__dirname, '../assets/icon.png')
  })
}

// IPC 핸들러들
ipcMain.handle('get-services-status', () => {
  return services
})

ipcMain.handle('start-all-services', async () => {
  return await startAllServices()
})

ipcMain.handle('stop-all-services', async () => {
  return await stopAllServices()
})

ipcMain.handle('start-service', async (event, serviceName) => {
  return await startService(serviceName)
})

ipcMain.handle('stop-service', async (event, serviceName) => {
  return await stopService(serviceName)
})

ipcMain.handle('get-logs', async (event, serviceName) => {
  return await getLogs(serviceName)
})

ipcMain.handle('open-project-folder', () => {
  shell.openPath(MONEYSHIFT_PATH)
})

ipcMain.handle('set-project-path', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'MoneyShift 프로젝트 폴더 선택'
  })
  
  if (!result.canceled && result.filePaths.length > 0) {
    const newPath = result.filePaths[0]
    store.set('moneyshift_path', newPath)
    return newPath
  }
  return null
})

ipcMain.on('close-quick-access', () => {
  if (quickAccessWindow && !quickAccessWindow.isDestroyed()) {
    quickAccessWindow.close()
    quickAccessWindow = null
  }
})

ipcMain.handle('toggle-window-size', () => {
  const currentCompactMode = store.get('compactMode', true)
  const newCompactMode = !currentCompactMode
  
  store.set('compactMode', newCompactMode)
  
  if (newCompactMode) {
    // 컴팩트 모드로 변경
    mainWindow.setSize(200, 400, true)
  } else {
    // 노말 모드로 변경
    mainWindow.setSize(1200, 800, true)
  }
  
  // 렌더러에 모드 변경 알림
  mainWindow.webContents.send('compact-mode-changed', newCompactMode)
  
  return newCompactMode
})

ipcMain.handle('get-compact-mode', () => {
  return store.get('compactMode', true)
})

// 서비스 관리 함수들
async function startAllServices() {
  try {
    updateServiceStatus('all', 'starting')
    
    const scriptPath = path.join(MONEYSHIFT_PATH, 'start-all.sh')
    return await executeScript(scriptPath)
  } catch (error) {
    updateServiceStatus('all', 'error')
    throw error
  }
}

async function stopAllServices() {
  try {
    updateServiceStatus('all', 'stopping')
    
    const scriptPath = path.join(MONEYSHIFT_PATH, 'stop-all.sh')
    return await executeScript(scriptPath)
  } catch (error) {
    updateServiceStatus('all', 'error')
    throw error
  }
}

async function startService(serviceName) {
  try {
    updateServiceStatus(serviceName, 'starting')
    
    let scriptPath
    switch (serviceName) {
      case 'backend':
        scriptPath = path.join(MONEYSHIFT_PATH, 'start-backend.sh')
        break
      case 'frontend':
        scriptPath = path.join(MONEYSHIFT_PATH, 'start-admin.sh')
        break
      case 'database':
        scriptPath = path.join(MONEYSHIFT_PATH, 'start-db.sh')
        break
      case 'mobile':
        scriptPath = path.join(MONEYSHIFT_PATH, 'start-app.sh')
        break
      default:
        throw new Error(`Unknown service: ${serviceName}`)
    }
    
    return await executeScript(scriptPath)
  } catch (error) {
    updateServiceStatus(serviceName, 'error')
    throw error
  }
}

async function stopService(serviceName) {
  try {
    updateServiceStatus(serviceName, 'stopping')
    
    // 개별 서비스 중지 로직
    if (services[serviceName].pid) {
      process.kill(services[serviceName].pid, 'SIGTERM')
    }
    
    updateServiceStatus(serviceName, 'stopped')
    return { success: true }
  } catch (error) {
    updateServiceStatus(serviceName, 'error')
    throw error
  }
}

function executeScript(scriptPath) {
  return new Promise((resolve, reject) => {
    const child = spawn('bash', [scriptPath], {
      cwd: MONEYSHIFT_PATH,
      stdio: ['pipe', 'pipe', 'pipe']
    })

    let output = ''
    let errorOutput = ''

    child.stdout.on('data', (data) => {
      output += data.toString()
      // 실시간 로그를 렌더러로 전송
      mainWindow.webContents.send('log-update', {
        service: 'system',
        level: 'info',
        message: data.toString().trim(),
        timestamp: new Date().toISOString()
      })
    })

    child.stderr.on('data', (data) => {
      errorOutput += data.toString()
      mainWindow.webContents.send('log-update', {
        service: 'system',
        level: 'error',
        message: data.toString().trim(),
        timestamp: new Date().toISOString()
      })
    })

    child.on('close', (code) => {
      if (code === 0) {
        resolve({ success: true, output })
      } else {
        reject(new Error(`Script failed with code ${code}: ${errorOutput}`))
      }
    })

    child.on('error', (error) => {
      reject(error)
    })
  })
}

function updateServiceStatus(serviceName, status) {
  if (serviceName === 'all') {
    Object.keys(services).forEach(name => {
      services[name].status = status
    })
  } else if (services[serviceName]) {
    services[serviceName].status = status
  }
  
  // 렌더러에 상태 업데이트 전송
  mainWindow.webContents.send('services-status-update', services)
}

async function checkServicesStatus() {
  // 포트별로 실제 서비스 상태 체크
  for (const [name, service] of Object.entries(services)) {
    try {
      const isRunning = await checkPort(service.port)
      if (isRunning && service.status !== 'running') {
        service.status = 'running'
      } else if (!isRunning && service.status === 'running') {
        service.status = 'stopped'
      }
    } catch (error) {
      if (service.status !== 'error') {
        service.status = 'error'
      }
    }
  }
  
  // 렌더러에 상태 업데이트 전송
  mainWindow.webContents.send('services-status-update', services)
}

function checkPort(port) {
  return new Promise((resolve) => {
    const { exec } = require('child_process')
    exec(`lsof -ti :${port}`, (error, stdout) => {
      resolve(!!stdout.trim())
    })
  })
}

async function getLogs(serviceName) {
  try {
    const logFile = path.join(MONEYSHIFT_PATH, `${serviceName}.log`)
    if (fs.existsSync(logFile)) {
      const content = fs.readFileSync(logFile, 'utf8')
      return content.split('\\n').slice(-100).join('\\n') // 마지막 100줄
    }
    return ''
  } catch (error) {
    return `Error reading logs: ${error.message}`
  }
}

function openPreferences() {
  // 환경설정 윈도우 생성
  const prefWindow = new BrowserWindow({
    width: 600,
    height: 400,
    parent: mainWindow,
    modal: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })
  
  prefWindow.loadFile(path.join(__dirname, '../renderer/preferences.html'))
}