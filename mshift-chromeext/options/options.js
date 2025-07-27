/**
 * MoneyShift Manager Options Page
 * 설정 페이지 JavaScript
 */

// DOM 요소들
const autoStartToggle = document.getElementById('autoStart');
const notificationsToggle = document.getElementById('notifications');
const monitoringToggle = document.getElementById('monitoring');
const projectPathInput = document.getElementById('projectPath');
const wsPortInput = document.getElementById('wsPort');
const statusDiv = document.getElementById('status');

// 설정 기본값
const defaultSettings = {
    autoStart: false,
    notifications: true,
    monitoring: true,
    projectPath: '/Users/lavickim/_Dev/moneyshift',
    wsPort: 9999
};

// 페이지 로드 시 설정 불러오기
document.addEventListener('DOMContentLoaded', loadSettings);

// 토글 버튼 이벤트 리스너
autoStartToggle.addEventListener('click', () => toggleSetting('autoStart'));
notificationsToggle.addEventListener('click', () => toggleSetting('notifications'));
monitoringToggle.addEventListener('click', () => toggleSetting('monitoring'));

/**
 * 설정 불러오기
 */
async function loadSettings() {
    try {
        const result = await chrome.storage.sync.get(defaultSettings);
        
        // UI 업데이트
        updateToggle(autoStartToggle, result.autoStart);
        updateToggle(notificationsToggle, result.notifications);
        updateToggle(monitoringToggle, result.monitoring);
        projectPathInput.value = result.projectPath;
        wsPortInput.value = result.wsPort;
        
        console.log('🔧 Settings loaded:', result);
    } catch (error) {
        console.error('❌ Failed to load settings:', error);
        showStatus('설정을 불러오는데 실패했습니다.', 'error');
    }
}

/**
 * 설정 저장하기
 */
async function saveSettings() {
    try {
        const settings = {
            autoStart: autoStartToggle.classList.contains('active'),
            notifications: notificationsToggle.classList.contains('active'),
            monitoring: monitoringToggle.classList.contains('active'),
            projectPath: projectPathInput.value,
            wsPort: parseInt(wsPortInput.value) || 9999
        };
        
        await chrome.storage.sync.set(settings);
        
        console.log('💾 Settings saved:', settings);
        showStatus('설정이 저장되었습니다!', 'success');
        
        // 백그라운드 스크립트에 설정 변경 알림
        try {
            await chrome.runtime.sendMessage({
                type: 'SETTINGS_UPDATED',
                settings: settings
            });
        } catch (error) {
            console.log('백그라운드 스크립트 미실행 (정상)');
        }
        
    } catch (error) {
        console.error('❌ Failed to save settings:', error);
        showStatus('설정 저장에 실패했습니다.', 'error');
    }
}

/**
 * 토글 상태 변경
 */
function toggleSetting(settingName) {
    const toggle = document.getElementById(settingName);
    toggle.classList.toggle('active');
    
    // 즉시 저장하지 않고 사용자가 저장 버튼을 클릭하도록 함
}

/**
 * 토글 UI 업데이트
 */
function updateToggle(toggleElement, isActive) {
    if (isActive) {
        toggleElement.classList.add('active');
    } else {
        toggleElement.classList.remove('active');
    }
}

/**
 * 상태 메시지 표시
 */
function showStatus(message, type = 'success') {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.style.display = 'block';
    
    // 3초 후 자동 숨김
    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 3000);
}

/**
 * 설정 초기화
 */
async function resetSettings() {
    if (confirm('모든 설정을 초기화하시겠습니까?')) {
        try {
            await chrome.storage.sync.set(defaultSettings);
            await loadSettings();
            showStatus('설정이 초기화되었습니다.', 'success');
        } catch (error) {
            console.error('❌ Failed to reset settings:', error);
            showStatus('설정 초기화에 실패했습니다.', 'error');
        }
    }
}

// 전역 함수로 노출 (HTML에서 사용)
window.saveSettings = saveSettings;
window.resetSettings = resetSettings;