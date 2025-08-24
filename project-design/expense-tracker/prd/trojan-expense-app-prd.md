# 트로이 목마 가계부 앱 PRD (Product Requirements Document)

## 📋 프로젝트 개요

### 🎯 프로젝트 목표
편한가계부 앱과 **100% 동일한 UI/UX**를 제공하는 트로이 목마 앱 개발

### 🔧 기술 스택
- **프론트엔드**: React Native + Expo (~49.0.15), TypeScript, Redux Toolkit
- **백엔드**: Spring Boot 3.2.7, Java 17, MyBatis, PostgreSQL
- **인프라**: Docker (PostgreSQL), Redis, JWT 인증
- **추가**: Swagger/OpenAPI, Spring Security

## 📱 화면별 기능 명세

### 🏠 메인 대시보드 (main-dashboard/)

#### 01_monthly_calendar.jpeg - 메인 월별 캘린더 화면 ⭐️ **핵심 화면**
```
┌─────────────────────────────────┐
│ ← 2025년 8월                 > │
│ 일 월 화 수 목 금 토              │
│                               │
│ 수입  지출      합계  데이터 없음    │
│  0   36,900   -36,900        │
│                               │
│   21 [목요일] 2025.08         │
│     0원    0원    [📊]        │
│                               │
│        [데이터가 없습니다]        │
│           🤖💬               │
│                               │
│         [📊] [💬] [+]         │ ← 플로팅 버튼
└─────────────────────────────────┘
```

**기능 요구사항:**
- 월별 캘린더 뷰 (기본)
- 상단: 수입/지출/합계 요약
- 일별 거래내역 미리보기 
- 플로팅 액션: 통계(📊), 메모(💬), 추가(+)
- 하단 네비게이션: 가계부/통계/자산/더보기

#### 02-05 기타 대시보드 화면들
- 계좌별 잔액 요약
- 전체 잔액 현황 
- 빠른 입력 액션
- 네비게이션 탭

### 💰 거래 입력 (transaction-entry/)

#### 01_budget_entry.jpeg - 예산 입력 화면
```
┌─────────────────────────────────┐
│ ← 예산추가                      │
│                               │
│ 분류    🍚 식비                │
│ 금액    5,000원               │
│                               │
│        [저장하기]              │
│                               │
│ 금액                          │
│ [1][2][3][×]                  │
│ [4][5][6][-]                  │  
│ [7][8][9][📱]                 │
│ [0]   [완료]                  │
└─────────────────────────────────┘
```

#### 02_income_entry.jpeg - 수입 입력 화면
```
┌─────────────────────────────────┐
│ ← 수입                    ⭐️🎤│
│ [수입][지출][이체]              │
│                               │
│ 날짜   25/8/20(수) 오후 4:42    │
│ 금액   _______________        │
│ 분류   _______________        │
│ 자산   _______________        │
│ 내용   _______________        │
│                               │
│ 메모                    📷     │
│ ___________________          │
│                               │
│ 금액                          │
│ [1][2][3][×]                  │
│ [4][5][6][-]                  │
│ [7][8][9][📱]                 │
│ [0]   [완료]                  │
└─────────────────────────────────┘
```

**기능 요구사항:**
- 수입/지출/이체 탭 전환
- 날짜/시간 자동 입력
- 카테고리 선택 (아이콘 포함)
- 자산(계좌) 선택
- 메모 및 사진 첨부
- 숫자 키패드

### 📊 통계 (statistics/)

#### 01_kakao_bank_integration.jpeg - 은행 연동 통계
```
┌─────────────────────────────────┐
│ ← 카카오뱅크        < 2025년 8월 > │
│                               │
│ 사용기간                        │
│ 25.8.1 ~ 25.8.31              │
│                               │
│ 입금  출금  합계  누적잔액        │
│  0    0    0     0           │
│                               │
│        [데이터가 없습니다]        │
│           🤖💬               │
│                               │
│                         [+]   │
└─────────────────────────────────┘
```

**기능 요구사항:**
- 은행별 연동 상태
- 기간별 입출금 통계
- 누적잔액 추적
- 그래프 시각화

### 📅 캘린더 (calendar/)

#### 01_date_picker.jpeg - 날짜 선택기
```
┌─────────────────────────────────┐
│    2025년                      │
│  12월 31일 (수)                │
│                               │
│    < 2025년 12월 >             │
│ 일 월 화 수 목 금 토              │
│  1  2  3  4  5  6  7          │
│  8  9 10 11 12 13 14          │
│ 15 16 17 18 19 20 21          │
│ 22 23 24 25 26 27 28          │
│ 29 30 (31)                    │
│                               │
│      [취소]  [확인]            │
└─────────────────────────────────┘
```

### ⚙️ 설정 (settings/)

#### 01_notification_settings.jpeg - 알림 설정
```
┌─────────────────────────────────┐
│ ← 금융 어플 알림 설정              │
│                               │
│ 수신된 알림을 문자함에 저장할 수 있습니다.│
│ 이 기능을 사용하려면 어플 알림 권한이  │
│ 필요합니다.                      │
│                               │
│ 어플 알림 접근 설정         0    │
│                               │
│                        [앱열기] │
└─────────────────────────────────┘
```

### 🚀 온보딩 (onboarding/)

#### 04_features_overview.jpeg - 전체 기능 소개
```
┌─────────────────────────────────┐
│ ← 상품 안내                     │
│                               │
│     편한가계부의                 │
│   모든 기능을 이용해보세요!        │
│                               │
│ 저희 가 더 좋은 서비스를 이용하실 수  │
│ 있습니다. 저희가 더 좋은 기능을...   │
│                               │
│ 무료        구독                │
│ 모든 가계부 기능  ✅  ✅          │
│ 자산 색상 개수 제한 15개  무제한    │
│ 광고 제거      🔒   ✅          │
│ PC 가계부      기본   고급        │
│ 내역 동기화     수동   자동        │
│ 사진 동기화     🔒   ✅          │
│ 가격          무료   월/연간      │
│                               │
│         [구독 하기]             │
└─────────────────────────────────┘
```

## 🗄️ 데이터베이스 스키마 설계

### 핵심 테이블 구조

```sql
-- 사용자 테이블
CREATE TABLE users (
    user_id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 자산(계좌) 테이블  
CREATE TABLE assets (
    asset_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(user_id),
    asset_name VARCHAR(100) NOT NULL,
    asset_type VARCHAR(20) NOT NULL, -- 'CASH', 'BANK', 'CARD', 'INVESTMENT'
    bank_name VARCHAR(50),
    account_number VARCHAR(50),
    balance DECIMAL(15,2) DEFAULT 0,
    color_code VARCHAR(7) DEFAULT '#FF5722',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 카테고리 테이블
CREATE TABLE categories (
    category_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(user_id),
    category_name VARCHAR(50) NOT NULL,
    category_type VARCHAR(10) NOT NULL, -- 'INCOME', 'EXPENSE'
    icon_name VARCHAR(50) DEFAULT 'default',
    color_code VARCHAR(7) DEFAULT '#FF5722',
    parent_category_id BIGINT REFERENCES categories(category_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 거래내역 테이블
CREATE TABLE transactions (
    transaction_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(user_id),
    asset_id BIGINT REFERENCES assets(asset_id),
    category_id BIGINT REFERENCES categories(category_id),
    transaction_type VARCHAR(10) NOT NULL, -- 'INCOME', 'EXPENSE', 'TRANSFER'
    amount DECIMAL(15,2) NOT NULL,
    description VARCHAR(200),
    memo TEXT,
    transaction_date DATE NOT NULL,
    transaction_time TIME DEFAULT CURRENT_TIME,
    receipt_photo_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 예산 테이블
CREATE TABLE budgets (
    budget_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(user_id),
    category_id BIGINT REFERENCES categories(category_id),
    budget_amount DECIMAL(15,2) NOT NULL,
    budget_period VARCHAR(10) DEFAULT 'MONTHLY', -- 'MONTHLY', 'YEARLY'
    budget_year INTEGER NOT NULL,
    budget_month INTEGER, -- NULL for yearly budgets
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 은행 연동 테이블 (향후 확장)
CREATE TABLE bank_integrations (
    integration_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(user_id),
    bank_name VARCHAR(50) NOT NULL,
    account_number VARCHAR(50),
    integration_status VARCHAR(20) DEFAULT 'ACTIVE',
    last_sync_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🚀 API 설계

### REST API 엔드포인트

```yaml
# 인증 API
POST /api/v1/auth/login
POST /api/v1/auth/register  
POST /api/v1/auth/refresh

# 사용자 API
GET /api/v1/users/profile
PUT /api/v1/users/profile

# 자산 관리 API
GET /api/v1/assets
POST /api/v1/assets
PUT /api/v1/assets/{id}
DELETE /api/v1/assets/{id}

# 카테고리 API
GET /api/v1/categories
POST /api/v1/categories
PUT /api/v1/categories/{id}
DELETE /api/v1/categories/{id}

# 거래내역 API
GET /api/v1/transactions
POST /api/v1/transactions
PUT /api/v1/transactions/{id}
DELETE /api/v1/transactions/{id}
GET /api/v1/transactions/monthly/{year}/{month}
GET /api/v1/transactions/daily/{date}

# 예산 API  
GET /api/v1/budgets
POST /api/v1/budgets
PUT /api/v1/budgets/{id}
DELETE /api/v1/budgets/{id}

# 통계 API
GET /api/v1/statistics/monthly/{year}/{month}
GET /api/v1/statistics/category/{year}/{month}
GET /api/v1/statistics/assets

# 파일 업로드 API
POST /api/v1/files/receipt
```

## 📱 프론트엔드 컴포넌트 구조

### 화면 계층 구조

```
src/
├── screens/
│   ├── MainDashboard/
│   │   ├── MonthlyCalendarScreen.tsx ⭐️
│   │   ├── AccountSummaryScreen.tsx
│   │   └── BalanceOverviewScreen.tsx
│   ├── TransactionEntry/
│   │   ├── BudgetEntryScreen.tsx
│   │   ├── IncomeEntryScreen.tsx
│   │   ├── ExpenseEntryScreen.tsx
│   │   └── CategorySelectionScreen.tsx
│   ├── Statistics/
│   │   ├── BankIntegrationScreen.tsx
│   │   ├── MonthlyReportScreen.tsx
│   │   └── ExpenseAnalysisScreen.tsx
│   ├── Calendar/
│   │   ├── DatePickerScreen.tsx
│   │   └── WeeklyViewScreen.tsx
│   └── Settings/
│       ├── NotificationSettingsScreen.tsx
│       ├── AppSettingsScreen.tsx
│       └── AccountManagementScreen.tsx
├── components/
│   ├── common/
│   │   ├── FloatingActionButton.tsx
│   │   ├── NumberKeypad.tsx
│   │   ├── CategoryIcon.tsx
│   │   └── CustomCalendar.tsx
│   └── navigation/
│       └── BottomTabNavigator.tsx
├── store/
│   ├── slices/
│   │   ├── authSlice.ts
│   │   ├── transactionSlice.ts
│   │   ├── assetSlice.ts
│   │   └── categorySlice.ts
│   └── store.ts
└── services/
    ├── authService.ts
    ├── transactionService.ts
    └── statisticsService.ts
```

## 🎨 디자인 시스템

### 색상 팔레트
```css
:root {
  --primary-red: #FF5722;      /* 메인 빨간색 */
  --primary-red-dark: #D32F2F;  /* 진한 빨간색 */
  --primary-red-light: #FFCDD2; /* 연한 빨간색 */
  --gray-dark: #2E2E2E;        /* 다크 배경 */
  --gray-medium: #757575;      /* 중간 회색 */
  --gray-light: #F5F5F5;       /* 연한 회색 */
  --white: #FFFFFF;
  --black: #000000;
  --success: #4CAF50;          /* 수입 */
  --error: #F44336;            /* 지출 */
}
```

### 타이포그래피
- **Header**: 18px, Bold
- **Subtitle**: 16px, Medium  
- **Body**: 14px, Regular
- **Caption**: 12px, Regular

### 아이콘 설계
- 카테고리: 🍚(식비), 🚗(교통), 🏠(주거), 💊(의료) 등
- 액션: ➕(추가), 📊(통계), 💬(메모), ⚙️(설정)

## 🏗️ 개발 단계별 계획

### Phase 1: 핵심 기능 (1주) ⭐️ **최우선**
1. **메인 캘린더 화면** - 01_monthly_calendar.jpeg
2. **거래 입력 화면** - 수입/지출 기본 입력
3. **기본 네비게이션** - 하단 탭 구조
4. **PostgreSQL 연동** - 기본 CRUD

### Phase 2: 고급 기능 (1주)
1. **통계 화면** - 월별/카테고리별 분석
2. **예산 관리** - 예산 설정/추적
3. **카테고리 관리** - 사용자 정의 카테고리
4. **사진 첨부** - 영수증 사진 업로드

### Phase 3: 부가 기능 (1주)
1. **설정 화면** - 알림, 백업 등
2. **온보딩** - 초기 사용자 가이드
3. **은행 연동 준비** - UI만 구현
4. **성능 최적화** - 캐싱, 최적화

### Phase 4: 완성 및 테스트 (1주)
1. **전체 테스트** - E2E 테스트
2. **UI/UX 완성도** - 편한가계부와 100% 일치
3. **성능 최적화**
4. **배포 준비**

## 📝 개발 우선순위

### 🎯 1순위 (즉시 개발)
- **MonthlyCalendarScreen.tsx** - 메인 화면
- **TransactionEntry** - 기본 입력 기능
- **PostgreSQL 스키마** - 데이터베이스 구축
- **기본 API** - CRUD 구현

### ⏳ 2순위 (1주 후)
- **Statistics** - 통계 화면
- **Budget Management** - 예산 관리
- **Settings** - 설정 화면

### 🔄 3순위 (확장 기능)
- **Bank Integration** - 실제 은행 연동
- **Advanced Analytics** - 고급 분석
- **Export/Import** - 데이터 내보내기

## 🔍 핵심 구현 포인트

1. **100% UI 복사**: 스크린샷과 픽셀 단위로 일치
2. **Redis 캐싱**: 자주 조회하는 통계 데이터
3. **JWT 인증**: 보안 강화
4. **TypeScript**: 타입 안정성
5. **반응형 디자인**: 다양한 화면 크기 지원
6. **오프라인 지원**: 로컬 저장 후 동기화

이 PRD를 기반으로 **편한가계부와 동일한 사용자 경험**을 제공하는 트로이 목마 앱을 구축하겠습니다!