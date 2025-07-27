# 🚀 MoneyShift Manager - Dock 등록 가이드

## ✅ 빌드 완료!

MoneyShift Manager 앱이 성공적으로 빌드되었습니다!

### 📍 생성된 파일 위치
```
/Users/lavickim/_Dev/moneyshift/moneyshift-manager/dist/mac-arm64/MoneyShift Manager.app
```

## 🎯 Dock에 등록하는 방법

### 방법 1: Finder를 통한 설치 (추천)
1. **Finder 열기**
2. **Applications 폴더**로 이동 (`Cmd + Shift + A`)
3. **새 Finder 창** 열기 (`Cmd + N`)
4. 아래 경로로 이동:
   ```
   /Users/lavickim/_Dev/moneyshift/moneyshift-manager/dist/mac-arm64/
   ```
5. **MoneyShift Manager.app**을 **Applications 폴더**로 **드래그 앤 드롭**
6. Applications 폴더에서 **MoneyShift Manager** 더블클릭으로 실행
7. **Dock에서 우클릭** → **"Dock에 유지"** 선택

### 방법 2: 터미널을 통한 복사
```bash
# Applications 폴더로 복사
cp -R "/Users/lavickim/_Dev/moneyshift/moneyshift-manager/dist/mac-arm64/MoneyShift Manager.app" /Applications/

# 실행
open "/Applications/MoneyShift Manager.app"
```

## 🎛️ 사용 방법

### ⚡ 빠른 접근 기능
- **트레이 아이콘**: 상단 메뉴바에서 MoneyShift 아이콘 클릭
- **글로벌 단축키**:
  - `⌘ + Shift + Q`: 퀵 액세스 윈도우 토글
  - `⌘ + Shift + S`: 모든 서비스 시작
  - `⌘ + Shift + T`: 모든 서비스 중지
  - `⌘ + Shift + M`: 메인 윈도우 토글

### 📐 크기 토글 기능
- **컴팩트 모드**: 400x600 (작은 크기, 빠른 제어)
- **풀 모드**: 1200x800 (큰 화면, 상세 모니터링)
- **토글 버튼**: 헤더 우측 상단의 "🔄 크기" 버튼 클릭
- **기본 모드**: 컴팩트 모드로 시작

### 🎨 UI 기능
- **다크 테마**: 시스템과 조화로운 다크 모드
- **실시간 서비스 상태**: 🟢🟡🔴 상태 표시
- **시스템 로그**: 실시간 로그 스트림
- **트레이 메뉴**: 우클릭으로 서비스 제어

## 🔧 주요 기능

### 서비스 관리
- ⚡ 모든 서비스 시작/중지
- 🔧 Backend API (Port 8080)
- 🎨 Frontend Admin (Port 3000)  
- 🗄️ Database (Port 5432)
- 🔄 Redis Cache (Port 6379)
- 📱 Mobile Dev (Port 19002)

### 퀵 액세스 윈도우
- 화면 중앙에 나타나는 반투명 플로팅 윈도우
- 개별 서비스 시작/중지 버튼
- 실시간 서비스 상태 표시
- 포커스 잃으면 자동 닫힘

### 모니터링
- 실시간 서비스 상태 체크 (5초마다)
- 포트별 연결 상태 확인
- 시스템 로그 스트리밍
- 서비스 시작/중지 알림

## 🎊 축하합니다!

이제 Mac Dock에서 MoneyShift Manager를 쉽게 실행할 수 있습니다!

**Chrome 확장 프로그램**과 **Electron 앱** 모두 완성되어, 
두 가지 방법으로 MoneyShift 시스템을 빠르고 편리하게 관리할 수 있습니다.

### 🆚 Chrome 확장 vs Electron 앱
- **Chrome 확장**: 브라우저에서 빠른 접근, 웹페이지 거래 감지
- **Electron 앱**: 독립 실행, 시스템 트레이, 크기 토글, 상세 모니터링

---
**MoneyShift Team** ✨