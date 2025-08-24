# 📱 Expo SDK 49 - Android 호환성 가이드

## 🎯 현재 설정
- **Expo SDK**: 49.0.15
- **Target**: Android 및 iOS

## 📋 Android SDK 호환성

### ✅ 권장 Android 버전

#### **Expo Go 앱 (Play Store)**
- **최소**: Android 5.0 (API 21)
- **권장**: Android 8.0 (API 26) 이상
- **최신**: Android 14 (API 34) 완전 지원

#### **개발용 Android SDK 설정**
```bash
# 필수 SDK 버전들
Android SDK Platform 34 (Android 14)    # 최신
Android SDK Platform 33 (Android 13)    # 권장
Android SDK Platform 31 (Android 12)    # 호환
Android SDK Platform 30 (Android 11)    # 최소
```

### 🛠️ Android Studio 설정

1. **Android Studio 설치**
   - 최신 버전 (2023.3.1 이상)
   - https://developer.android.com/studio

2. **SDK Manager 설정**
   ```
   Tools → SDK Manager → SDK Platforms
   ✅ Android 14.0 (API 34) - 권장
   ✅ Android 13.0 (API 33) - 안정
   ✅ Android 12.0 (API 31) - 호환
   ```

3. **SDK Tools 설치**
   ```
   SDK Tools 탭에서:
   ✅ Android SDK Build-Tools 34.0.0
   ✅ Android Emulator
   ✅ Android SDK Platform-Tools
   ✅ Google Play services
   ```

### 📱 Expo Go 앱 버전 확인

현재 Play Store의 **Expo Go** 앱이 최신인지 확인하세요:
- **최신 버전**: 2.29.x 이상
- **업데이트 필요시**: Play Store에서 업데이트

### 🔧 개발 환경 변수

```bash
# ~/.zshrc 또는 ~/.bashrc에 추가
export ANDROID_HOME=$HOME/Library/Android/sdk
export ANDROID_SDK_ROOT=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Java 버전 (중요!)
export JAVA_HOME=$(/usr/libexec/java_home -v 17)  # Java 17 권장
```

### 🚀 빠른 해결 방법

#### 1️⃣ **Expo Go 앱 업데이트** (가장 간단)
```bash
# Play Store에서 Expo Go 앱 업데이트
```

#### 2️⃣ **네트워크 모드 사용** (추천)
```bash
# 현재 설정된 방법
cd mshift-trojan-app
npx expo start --tunnel

# 또는 LAN 모드
npx expo start --lan
```

#### 3️⃣ **호환 모드 실행**
```bash
# SDK 49 호환 모드
npx expo start --legacy-peer-deps
```

### ⚠️ 호환성 문제 해결

#### **Expo Go에서 "Incompatible" 오류시:**

1. **Expo CLI 업데이트**
   ```bash
   npm install -g @expo/cli@latest
   ```

2. **프로젝트 의존성 재설치**
   ```bash
   cd mshift-trojan-app
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Expo Go 앱 재설치**
   - Android에서 Expo Go 앱 삭제 후 재설치

### 📊 현재 프로젝트 호환성

```json
{
  "expo": "~49.0.15",           // ✅ 최신 안정 버전
  "react-native": "0.72.6",    // ✅ 호환
  "android": {
    "targetSdkVersion": 34,     // ✅ Android 14
    "minSdkVersion": 21         // ✅ Android 5.0+
  }
}
```

### 🎯 권장 테스트 환경

#### **최적 조합:**
- **Android**: 8.0+ (API 26+)
- **Expo Go**: 최신 버전 (2.29+)
- **Network**: WiFi (같은 네트워크)
- **Mode**: Tunnel 모드 (네트워크 제한 시)

---

## 🚀 즉시 실행 가능한 명령어

```bash
# 1. Expo 최신 CLI 설치
npm install -g @expo/cli@latest

# 2. 앱 실행 (터널 모드)
./start-mobile-app.sh

# 3. 또는 직접 실행
cd mshift-trojan-app
npx expo start --tunnel --clear
```

**💡 팁**: Android 8.0 (API 26) 이상 기기에서 최상의 호환성을 제공합니다!