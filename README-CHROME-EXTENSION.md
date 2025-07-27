# 🚀 MoneyShift Chrome 확장 프로그램 설치 가이드

## 📍 확장 프로그램 위치
```bash
/Users/lavickim/_Dev/moneyshift/mshift-chromeext/
```

## 🛠️ 설치 방법

### 1. Chrome 확장 프로그램 개발자 모드 활성화

1. **Chrome 브라우저 실행**
2. **주소창에 입력**: `chrome://extensions/`
3. **우상단 "개발자 모드" 토글 활성화** ✅

### 2. 확장 프로그램 로드

1. **"압축해제된 확장 프로그램을 로드합니다" 클릭**
2. **폴더 선택**: `/Users/lavickim/_Dev/moneyshift/mshift-chromeext/`
3. **"선택" 버튼 클릭**

### 3. 설치 확인

설치가 완료되면 다음과 같이 표시됩니다:
- ✅ **확장 프로그램명**: MoneyShift Manager ✨
- ✅ **버전**: 1.0.0
- ✅ **상태**: 활성화됨
- ✅ **아이콘**: Chrome 툴바에 MoneyShift 아이콘 표시

## 🎮 사용 방법

### 키보드 단축키
- **⚡ 모든 서비스 시작**: `Cmd+Shift+S` (Mac) / `Ctrl+Shift+S` (Windows)
- **🛑 모든 서비스 중지**: `Cmd+Shift+T` (Mac) / `Ctrl+Shift+T` (Windows)
- **🎛️ 제어판 열기**: `Cmd+Shift+M` (Mac) / `Ctrl+Shift+M` (Windows)

### 툴바 아이콘 클릭
Chrome 툴바의 MoneyShift 아이콘을 클릭하면:
- 🎛️ **시스템 제어 팝업** 표시
- 📊 **서비스 상태** 실시간 확인
- ⚡ **원클릭 서비스 제어** 가능

### 지원 URL
확장 프로그램이 다음 URL에서 자동 작동합니다:
- `http://localhost:3000/*` (Admin Panel)
- `http://localhost:8080/*` (API Server) 
- `http://localhost:19002/*` (Mobile App)
- `https://*.moneyshift.com/*` (Production)

## 🔧 개발자 기능

### DevTools 패널
Chrome DevTools에서 "MoneyShift" 탭을 통해:
- 📊 **API 호출 모니터링**
- 🔍 **성능 분석**
- 🐛 **디버깅 도구**

### Options 페이지
확장 프로그램 설정에서:
- ⚙️ **동작 설정** 커스터마이징
- 🔔 **알림 설정**
- 🎨 **테마 설정**

## 🚨 문제 해결

### 설치 안됨
- Chrome 버전 확인 (최신 버전 권장)
- 개발자 모드 활성화 확인
- 폴더 경로 확인: `/Users/lavickim/_Dev/moneyshift/mshift-chromeext/`

### 아이콘 안보임
- 확장 프로그램 목록에서 "고정" 버튼 클릭
- Chrome 재시작

### 단축키 작동 안함
- 다른 확장 프로그램과 단축키 충돌 확인
- Chrome 설정 > 확장 프로그램 > 키보드 단축키에서 재설정

## 📁 파일 구조

```
mshift-chromeext/
├── manifest.json          # 확장 프로그램 설정
├── popup/
│   ├── popup.html         # 팝업 인터페이스
│   ├── popup.js           # 팝업 로직
│   └── popup.css          # 팝업 스타일
├── background/
│   └── service-worker.js  # 백그라운드 서비스
├── content/
│   ├── content.js         # 콘텐츠 스크립트
│   └── content.css        # 콘텐츠 스타일
├── devtools/
│   └── devtools.html      # 개발자 도구
├── options/
│   └── options.html       # 설정 페이지
└── assets/
    └── icons/             # 아이콘 파일들
```

## 🎯 주요 기능

### 🚀 시스템 제어
- MoneyShift 전체 서비스 통합 관리
- 원클릭 시작/중지
- 실시간 상태 모니터링

### 🎨 Beautiful UI
- Material Design 기반 인터페이스
- 다크/라이트 테마 지원
- 애니메이션 효과

### 🔧 개발자 친화적
- 실시간 API 모니터링
- 성능 분석 도구
- 커스터마이징 가능한 설정

---

💡 **도움이 필요하시면** [MoneyShift 팀](mailto:support@moneyshift.com)에 문의하세요!