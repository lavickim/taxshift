# 🎭 트로이 목마 가계부 앱 실행 상태

## ✅ 현재 실행 중인 서비스

### 📊 백엔드 서버
- **포트**: 8081
- **상태**: ✅ 정상 실행
- **API**: http://localhost:8081/api
- **헬스체크**: http://localhost:8081/api/public/health

### 📱 React Native 앱 (웹 버전)
- **포트**: 3003  
- **상태**: ✅ 정상 실행
- **웹 접속**: http://localhost:3003
- **컴파일**: ✅ 성공 (경고 해결됨)

## 🚀 실행 스크립트

### 주요 스크립트
- `./run-app.sh` - 통합 실행 관리자
- `./start-tj-app.sh` - 앱 실행
- `./start-tj-backend.sh` - 백엔드 실행
- `./check-services.sh` - 서비스 상태 확인

## 📱 앱 접속 방법

### 웹 브라우저
```bash
# 웹에서 바로 테스트
open http://localhost:3003
```

### 모바일 (Expo Go)
1. Expo Go 앱 설치
2. 터미널에서 QR 코드 스캔
3. 또는 `exp://` 링크 사용

## 🔧 트러블슈팅

### Android SDK 설정 (옵션)
```bash
# Android 테스트를 원하는 경우
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### 포트 충돌 해결
```bash
# 포트 사용 중인 프로세스 종료
./run-app.sh  # 옵션 4 선택
```

## 🎯 주요 기능

- ✅ 로그인/회원가입 (데모: newuser2025/testpass123)
- ✅ 대시보드 (월별 수입/지출 요약)
- ✅ 거래 추가/수정/삭제
- ✅ 거래내역 조회
- ✅ 설정 관리
- ✅ JWT 인증
- ✅ Redux 상태 관리

## 📊 API 엔드포인트

### 인증
- POST `/api/v1/auth/login`
- POST `/api/v1/auth/register`

### 거래 관리
- GET `/api/v1/transactions/dashboard`
- GET `/api/v1/transactions`
- POST `/api/v1/transactions`
- PUT `/api/v1/transactions/{id}`
- DELETE `/api/v1/transactions/{id}`

### 통계
- GET `/api/v1/statistics/financial-overview`
- GET `/api/v1/statistics/monthly-analysis`

---

**🎉 트로이 목마 가계부 앱이 성공적으로 실행 중입니다!**

마지막 업데이트: $(date)