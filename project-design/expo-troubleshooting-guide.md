# Expo 앱 개발 및 문제 해결 가이드

## 개요
MoneyShift Trojan 프로젝트에서 발생한 Expo 관련 문제들과 해결 방법을 정리한 문서입니다.

## 주요 문제점 및 해결 방법

### 1. Metro Bundler "Waiting on" 문제

**문제 상황:**
- `npx expo start` 실행 시 "Waiting on http://localhost:PORT" 메시지에서 멈춤
- QR 코드나 개발 메뉴가 표시되지 않음
- Metro bundler가 HTTP 서버를 완전히 시작하지 못함

**원인 분석:**
- Expo CLI 버전 호환성 문제 (legacy expo-cli vs @expo/cli)
- Node.js 20+ 버전에서 legacy expo-cli 호환성 문제
- Metro bundler의 초기 빌드 과정이 완료되지 않음
- react-native-vector-icons vs @expo/vector-icons 충돌 가능성

**해결 방법:**
1. **올바른 Expo CLI 사용:**
   ```bash
   npm uninstall -g expo-cli
   npm install -g @expo/cli@latest
   ```

2. **대화형 모드로 실행:**
   ```bash
   # 백그라운드 실행 대신 대화형 모드 사용
   exec npx expo start --port 3001
   ```

3. **환경 변수 설정:**
   ```bash
   export EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
   export REACT_NATIVE_PACKAGER_HOSTNAME=localhost
   ```

### 2. Vector Icons 호환성 문제

**문제 상황:**
- `react-native-vector-icons/Ionicons` 임포트 오류
- Expo 환경에서 네이티브 모듈 충돌

**해결 방법:**
- Expo 프로젝트에서는 `@expo/vector-icons` 사용 권장:
  ```typescript
  // ❌ 잘못된 방법
  import Icon from 'react-native-vector-icons/Ionicons';
  
  // ✅ 올바른 방법
  import { Ionicons } from '@expo/vector-icons';
  ```

### 3. Expo SDK 버전 호환성

**현재 설정:**
- Trojan 프로젝트: Expo SDK 49
- 최신 Expo 프로젝트: Expo SDK 53+

**권장사항:**
- 프로젝트 중반에 SDK 업그레이드는 위험
- 현재 SDK 49 유지하되, 의존성 버전 정확히 맞춤
- 새 프로젝트는 최신 SDK 사용

### 4. 개발 환경 설정

**권장 시작 스크립트 구조:**
```bash
#!/bin/bash

# 포트 정리
pkill -f "expo start" || true
pkill -f "metro" || true
sleep 3

# 환경 변수 설정
export EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
export REACT_NATIVE_PACKAGER_HOSTNAME=localhost

# 대화형 모드로 실행 (QR 코드 표시를 위해)
exec npx expo start --port 3001
```

## 트러블슈팅 체크리스트

### QR 코드가 표시되지 않을 때:
1. [ ] `@expo/cli` 최신 버전 설치 확인
2. [ ] 포트 충돌 확인 (`lsof -ti:PORT`)
3. [ ] 대화형 모드로 실행 (`exec npx expo start`)
4. [ ] Metro bundler 완전 시작 대기 (1-2분)
5. [ ] 네트워크 환경 변수 설정 확인

### 컴파일 오류 발생 시:
1. [ ] vector icons 임포트 방식 확인
2. [ ] Expo SDK 호환 의존성 확인 (`npx expo install --fix`)
3. [ ] 캐시 정리 (`rm -rf .expo node_modules/.cache`)
4. [ ] TypeScript 설정 확인

### Metro bundler 문제 시:
1. [ ] 백그라운드 프로세스 정리
2. [ ] Node.js 버전 확인 (권장: 18-20)
3. [ ] 포트 변경 시도
4. [ ] Debug 모드로 실행 (`DEBUG=* npx expo start`)

## 베스트 프랙티스

1. **스크립트 관리:**
   - 각 서비스별 독립적인 시작/중지 스크립트
   - 포트 충돌 방지를 위한 프로세스 정리
   - 대화형/백그라운드 모드 선택 가능

2. **개발 워크플로우:**
   - 백엔드 먼저 시작 후 프론트엔드 시작
   - Expo Go 앱을 통한 실시간 테스트
   - 로그 파일 분리 관리

3. **의존성 관리:**
   - Expo SDK 호환 패키지만 사용
   - 정기적인 의존성 업데이트 점검
   - 버전 고정을 통한 안정성 확보

## 관련 명령어 참조

```bash
# Expo CLI 관리
npm uninstall -g expo-cli
npm install -g @expo/cli@latest
npx expo --version

# 프로젝트 시작
npx expo start --port 3001
npx expo start --clear  # 캐시 정리 후 시작
npx expo start --localhost  # localhost만 사용

# 디버깅
DEBUG=* npx expo start
lsof -ti:3001  # 포트 사용 확인
pkill -f "expo"  # 프로세스 정리

# 의존성 관리
npx expo install --fix
npx expo install @expo/vector-icons
npm audit fix
```

## 마지막 업데이트
- 날짜: 2025-08-13
- 버전: v1.0
- 작성자: Claude Code Assistant