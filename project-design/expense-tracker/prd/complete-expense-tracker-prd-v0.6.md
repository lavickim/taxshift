# 편한가계부 완벽 복제 앱 PRD (Product Requirements Document) - V0.6
## Version 0.6 - 2025년 8월

---

## 📱 프로젝트 개요

### 프로젝트 명칭
**편한가계부 클론** - 100% 동일한 UI/UX 가계부 앱

### 프로젝트 목표
실제 "편한가계부" 앱과 **픽셀 단위로 완벽히 동일한** 가계부 앱 개발

### 핵심 가치
- **완벽한 UI 복제**: 스크린샷과 100% 일치하는 다크 테마 디자인
- **직관적인 UX**: 한국 사용자에게 익숙한 가계부 인터페이스
- **빠른 입력**: 숫자 키패드 중심의 빠른 거래 입력
- **실시간 동기화**: 모든 데이터의 즉각적인 반영

---

## 🎨 디자인 시스템

### 색상 팔레트
```css
/* 다크 테마 기본 */
--background-black: #000000;
--surface-dark: #1C1C1C;
--surface-gray: #2E2E2E;

/* 강조 색상 */
--primary-red: #FF5757;      /* 메인 빨간색 (지출, 선택) */
--primary-blue: #4A90E2;     /* 메인 파란색 (수입, 토요일) */
--text-white: #FFFFFF;       /* 주요 텍스트 */
--text-gray: #9E9E9E;        /* 보조 텍스트 */
--text-light-gray: #6E6E6E;  /* 비활성 텍스트 */

/* 기능별 색상 */
--income-blue: #4A90E2;      /* 수입 표시 */
--expense-red: #FF5757;      /* 지출 표시 */
--sunday-red: #FF5757;       /* 일요일 */
--saturday-blue: #4A90E2;    /* 토요일 */
```

### 타이포그래피
```css
/* 폰트 사이즈 */
--font-xxl: 24px;   /* 날짜, 금액 강조 */
--font-xl: 20px;    /* 헤더 타이틀 */
--font-lg: 18px;    /* 금액 표시 */
--font-md: 16px;    /* 일반 텍스트 */
--font-sm: 14px;    /* 라벨, 보조 텍스트 */
--font-xs: 12px;    /* 캡션, 작은 라벨 */

/* 폰트 두께 */
--weight-bold: 700;
--weight-medium: 500;
--weight-regular: 400;
```

---

## 📱 화면 구성 및 기능 명세

### 1. 메인 화면 - 월별 캘린더 뷰

#### 1.1 상단 네비게이션 바
```
┌──────────────────────────────────────┐
│  ← 2025년 8월 →   📧 ⭐ 🔍 ☰        │
└──────────────────────────────────────┘
```

**구성 요소:**
- 월 네비게이션: 좌우 화살표로 월 이동
- 년월 표시: "2025년 8월" 형식
- 우측 아이콘:
  - 📧 메일함 (알림)
  - ⭐ 즐겨찾기
  - 🔍 검색
  - ☰ 메뉴

#### 1.2 상단 탭 메뉴
```
┌──────────────────────────────────────┐
│  일일   달력   월별   결산   메모      │
│         ────                         │
└──────────────────────────────────────┘
```

**탭 구성:**
- **일일**: 일별 상세 거래 내역
- **달력**: 월별 캘린더 뷰 (기본 선택)
- **월별**: 월별 통계 및 분석
- **결산**: 월말 결산 및 리포트
- **메모**: 메모 및 일기

**선택 표시:** 빨간색 하단 바 (height: 2px, width: 30px)

#### 1.3 수입/지출/합계 요약
```
┌──────────────────────────────────────┐
│   수입        지출        합계        │
│     0       36,900     -36,900       │
│   (파랑)     (빨강)      (빨강)       │
└──────────────────────────────────────┘
```

#### 1.4 캘린더 그리드
```
┌──────────────────────────────────────┐
│  일  월  화  수  목  금  토            │
│  27  28  29  30  31   1   2          │
│   3   4   5   6   7   8   9          │
│  10  11  12  13  14  15  16          │
│  17  18  19  20 [21] 22  23          │
│  24  25  26  27  28  29  30          │
│  31   1   2   3   4   5   6          │
└──────────────────────────────────────┘
```

**캘린더 특징:**
- 7×6 그리드 (42칸)
- 일요일: 빨간색
- 토요일: 파란색
- 평일: 흰색/회색
- 오늘 날짜: 빨간색 배경 강조
- 이전/다음 달: 회색 처리

#### 1.5 하단 날짜 정보 바
```
┌──────────────────────────────────────┐
│  21 [목요일] 2025.08   0원  0원  [≡] │
└──────────────────────────────────────┘
```

#### 1.6 하단 네비게이션
```
┌──────────────────────────────────────┐
│  📖      📊      💰      ⋯           │
│ 가계부   통계     자산    더보기        │
└──────────────────────────────────────┘
```

#### 1.7 플로팅 액션 버튼
- 위치: 우하단
- 구성: 2개 버튼
  - 회색 + 버튼 (보조 기능)
  - 빨간색 + 버튼 (메인 추가)

---

### 2. 거래 입력 화면

#### 2.1 수입 입력 화면
```
┌──────────────────────────────────────┐
│  ← 수입                    ⭐ 🎤     │
│  [수입] [지출] [이체]                 │
│                                      │
│  날짜   25/8/20 (수) 오후 4:42        │
│  금액   _______________              │
│  분류   _______________              │
│  자산   _______________              │
│  내용   _______________              │
│                                      │
│  메모                         📷      │
│  _______________________            │
│                                      │
│  ┌───┬───┬───┬───┐                  │
│  │ 1 │ 2 │ 3 │ × │                  │
│  ├───┼───┼───┼───┤                  │
│  │ 4 │ 5 │ 6 │ - │                  │
│  ├───┼───┼───┼───┤                  │
│  │ 7 │ 8 │ 9 │ 📅│                  │
│  ├───┴───┼───┴───┤                  │
│  │   0   │  완료  │                  │
│  └───────┴───────┘                  │
└──────────────────────────────────────┘
```

**입력 필드:**
- **날짜**: 자동 입력, 탭하여 변경 가능
- **금액**: 숫자 키패드로 직접 입력
- **분류**: 카테고리 선택 (급여, 용돈, 기타수입 등)
- **자산**: 계좌 선택 (현금, 체크카드, 신용카드 등)
- **내용**: 거래 설명 텍스트
- **메모**: 추가 메모 및 사진 첨부

**숫자 키패드:**
- 4×4 그리드 레이아웃
- 빨간색 "완료" 버튼
- 계산기 기능 포함

#### 2.2 지출 입력 화면
- 수입과 동일한 레이아웃
- 분류에 지출 카테고리 표시
- 빨간색 테마 적용

#### 2.3 이체 입력 화면
- 출금 계좌 선택
- 입금 계좌 선택
- 이체 금액 입력

---

### 3. 자산 관리 화면

#### 3.1 카카오뱅크 통합 뷰
```
┌──────────────────────────────────────┐
│  ← 카카오뱅크        < 2025년 8월 >  │
│                                      │
│  사용기간                             │
│  25.8.1 ~ 25.8.31                   │
│                                      │
│  입금    출금    합계    누적잔액      │
│   0       0       0        0         │
│                                      │
│       [데이터가 없습니다]              │
│           🐱💬                       │
│                                      │
│                              [+]      │
└──────────────────────────────────────┘
```

**기능:**
- 은행별 거래 내역 조회
- 기간별 입출금 통계
- 누적 잔액 추적
- 그래프 시각화 (추후)

#### 3.2 자산 목록
```
┌──────────────────────────────────────┐
│  자산                                 │
│                                      │
│  현금             36,900원            │
│  현금             36,900원            │
│                                      │
│  은행                    0원          │
│  카카오뱅크               0원          │
│                                      │
└──────────────────────────────────────┘
```

---

### 4. 통계 화면

#### 4.1 월별 리스트 뷰
```
┌──────────────────────────────────────┐
│  25/1/1 ~ 25/12/31      기간 ▼       │
│                                      │
│  수입          지출                   │
│   0          36,900원                │
│                                      │
│  [데이터가 없습니다]                   │
└──────────────────────────────────────┘
```

#### 4.2 카테고리별 분석
- 원형 차트
- 막대 그래프
- 카테고리별 지출 순위

---

## 💾 데이터베이스 설계

### 핵심 테이블 구조

```sql
-- 1. 사용자 테이블
CREATE TABLE users (
    user_id BIGSERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nickname VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    is_premium BOOLEAN DEFAULT FALSE
);

-- 2. 자산(계좌) 테이블
CREATE TABLE assets (
    asset_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(user_id) ON DELETE CASCADE,
    asset_name VARCHAR(100) NOT NULL,
    asset_type VARCHAR(20) NOT NULL, -- CASH, BANK, CARD, INVESTMENT
    bank_name VARCHAR(50),
    account_number VARCHAR(50),
    initial_balance DECIMAL(15,2) DEFAULT 0,
    current_balance DECIMAL(15,2) DEFAULT 0,
    color_code VARCHAR(7) DEFAULT '#FF5757',
    icon_name VARCHAR(50),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. 카테고리 테이블
CREATE TABLE categories (
    category_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(user_id) ON DELETE CASCADE,
    category_name VARCHAR(50) NOT NULL,
    category_type VARCHAR(10) NOT NULL, -- INCOME, EXPENSE, TRANSFER
    icon_name VARCHAR(50) DEFAULT 'default',
    color_code VARCHAR(7) DEFAULT '#FF5757',
    parent_category_id BIGINT REFERENCES categories(category_id),
    display_order INTEGER DEFAULT 0,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. 거래 테이블
CREATE TABLE transactions (
    transaction_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(user_id) ON DELETE CASCADE,
    transaction_type VARCHAR(10) NOT NULL, -- INCOME, EXPENSE, TRANSFER
    amount DECIMAL(15,2) NOT NULL,
    
    -- 기본 정보
    asset_id BIGINT REFERENCES assets(asset_id),
    category_id BIGINT REFERENCES categories(category_id),
    description VARCHAR(200),
    memo TEXT,
    
    -- 날짜/시간
    transaction_date DATE NOT NULL,
    transaction_time TIME DEFAULT CURRENT_TIME,
    
    -- 이체 관련 (TRANSFER일 때만 사용)
    target_asset_id BIGINT REFERENCES assets(asset_id),
    
    -- 첨부파일
    receipt_photo_url VARCHAR(500),
    
    -- 반복 거래
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_type VARCHAR(20), -- DAILY, WEEKLY, MONTHLY, YEARLY
    recurring_end_date DATE,
    parent_transaction_id BIGINT REFERENCES transactions(transaction_id),
    
    -- 메타데이터
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- 인덱스
    INDEX idx_user_date (user_id, transaction_date),
    INDEX idx_asset (asset_id),
    INDEX idx_category (category_id)
);

-- 5. 예산 테이블
CREATE TABLE budgets (
    budget_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(user_id) ON DELETE CASCADE,
    category_id BIGINT REFERENCES categories(category_id),
    budget_amount DECIMAL(15,2) NOT NULL,
    budget_year INTEGER NOT NULL,
    budget_month INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_user_category_period (user_id, category_id, budget_year, budget_month)
);

-- 6. 반복 거래 템플릿
CREATE TABLE recurring_templates (
    template_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(user_id) ON DELETE CASCADE,
    template_name VARCHAR(100),
    transaction_type VARCHAR(10) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    asset_id BIGINT REFERENCES assets(asset_id),
    category_id BIGINT REFERENCES categories(category_id),
    description VARCHAR(200),
    recurring_type VARCHAR(20) NOT NULL,
    recurring_day INTEGER, -- 매월 몇일
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. 알림 설정
CREATE TABLE notifications (
    notification_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(user_id) ON DELETE CASCADE,
    notification_type VARCHAR(30), -- DAILY_SUMMARY, BUDGET_ALERT, RECURRING_REMINDER
    is_enabled BOOLEAN DEFAULT TRUE,
    notification_time TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. 사용자 설정
CREATE TABLE user_settings (
    setting_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(user_id) ON DELETE CASCADE,
    setting_key VARCHAR(50) NOT NULL,
    setting_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_user_setting (user_id, setting_key)
);
```

---

## 🔌 API 엔드포인트 설계

### 인증 API
```
POST   /api/v1/auth/register        # 회원가입
POST   /api/v1/auth/login          # 로그인
POST   /api/v1/auth/logout         # 로그아웃
POST   /api/v1/auth/refresh        # 토큰 갱신
POST   /api/v1/auth/password/reset # 비밀번호 재설정
```

### 거래 API
```
# 거래 CRUD
GET    /api/v1/transactions                      # 거래 목록 조회
POST   /api/v1/transactions                      # 거래 생성
GET    /api/v1/transactions/{id}                 # 거래 상세 조회
PUT    /api/v1/transactions/{id}                 # 거래 수정
DELETE /api/v1/transactions/{id}                 # 거래 삭제

# 기간별 조회
GET    /api/v1/transactions/daily/{date}         # 일별 거래
GET    /api/v1/transactions/monthly/{year}/{month} # 월별 거래
GET    /api/v1/transactions/yearly/{year}        # 연별 거래

# 통계
GET    /api/v1/transactions/summary/monthly/{year}/{month}  # 월별 요약
GET    /api/v1/transactions/summary/category/{year}/{month} # 카테고리별 통계
```

### 자산 API
```
GET    /api/v1/assets                # 자산 목록
POST   /api/v1/assets                # 자산 생성
PUT    /api/v1/assets/{id}           # 자산 수정
DELETE /api/v1/assets/{id}           # 자산 삭제
GET    /api/v1/assets/{id}/balance   # 잔액 조회
POST   /api/v1/assets/{id}/adjust    # 잔액 조정
```

### 카테고리 API
```
GET    /api/v1/categories            # 카테고리 목록
POST   /api/v1/categories            # 카테고리 생성
PUT    /api/v1/categories/{id}       # 카테고리 수정
DELETE /api/v1/categories/{id}       # 카테고리 삭제
GET    /api/v1/categories/default    # 기본 카테고리 조회
```

### 예산 API
```
GET    /api/v1/budgets/{year}/{month}  # 월별 예산 조회
POST   /api/v1/budgets                 # 예산 설정
PUT    /api/v1/budgets/{id}            # 예산 수정
DELETE /api/v1/budgets/{id}            # 예산 삭제
GET    /api/v1/budgets/status/{year}/{month} # 예산 사용 현황
```

### 반복 거래 API
```
GET    /api/v1/recurring              # 반복 거래 목록
POST   /api/v1/recurring              # 반복 거래 생성
PUT    /api/v1/recurring/{id}         # 반복 거래 수정
DELETE /api/v1/recurring/{id}         # 반복 거래 삭제
POST   /api/v1/recurring/{id}/execute # 반복 거래 실행
```

### 통계 API
```
GET    /api/v1/statistics/overview/{year}/{month}    # 월별 개요
GET    /api/v1/statistics/trends/{period}            # 추세 분석
GET    /api/v1/statistics/categories/{year}/{month}  # 카테고리 분석
GET    /api/v1/statistics/assets/balance            # 자산 현황
GET    /api/v1/statistics/comparison/{period}        # 기간 비교
```

### 파일 업로드 API
```
POST   /api/v1/files/upload/receipt   # 영수증 업로드
GET    /api/v1/files/{id}            # 파일 조회
DELETE /api/v1/files/{id}            # 파일 삭제
```

### 설정 API
```
GET    /api/v1/settings               # 설정 조회
PUT    /api/v1/settings               # 설정 업데이트
GET    /api/v1/settings/notifications # 알림 설정 조회
PUT    /api/v1/settings/notifications # 알림 설정 업데이트
```

---

## 🛠️ 기술 스택

### Frontend (Flutter)
```yaml
Framework: Flutter 3.35.1
Language: Dart 3.9.0
State Management: Provider / Riverpod
HTTP Client: http ^1.1.0
Localization: intl ^0.19.0
Database: sqflite (로컬 캐싱)
```

### Backend (Spring Boot)
```yaml
Framework: Spring Boot 3.2.7
Language: Java 21
Database: PostgreSQL 15
Cache: Redis
ORM: JPA / MyBatis
Security: Spring Security + JWT
Documentation: Swagger/OpenAPI
```

### Infrastructure
```yaml
Container: Docker
Database: PostgreSQL + Redis
File Storage: Local / S3
Monitoring: Spring Actuator
```

---

## 📱 주요 기능 구현 상세

### 1. 빠른 거래 입력
- **원터치 입력**: 자주 사용하는 거래 템플릿
- **스와이프 제스처**: 좌우 스와이프로 날짜 변경
- **음성 입력**: 음성으로 거래 입력
- **OCR 영수증**: 카메라로 영수증 스캔

### 2. 스마트 분류
- **자동 카테고리**: 거래 내용 기반 자동 분류
- **학습 기능**: 사용 패턴 학습
- **커스텀 규칙**: 사용자 정의 분류 규칙

### 3. 다양한 뷰 모드
- **캘린더 뷰**: 월별 캘린더에 거래 표시
- **리스트 뷰**: 시간순 거래 목록
- **카테고리 뷰**: 카테고리별 그룹핑
- **자산별 뷰**: 계좌별 거래 내역

### 4. 상세 통계
- **지출 패턴 분석**: 요일별, 시간대별 분석
- **예산 관리**: 카테고리별 예산 설정 및 추적
- **목표 설정**: 저축 목표 설정 및 달성률
- **비교 분석**: 전월/전년 대비 분석

### 5. 데이터 동기화
- **실시간 동기화**: 모든 기기 간 실시간 동기화
- **오프라인 지원**: 오프라인 사용 후 자동 동기화
- **백업/복원**: 자동 백업 및 복원

### 6. 보안 기능
- **생체 인증**: 지문/Face ID 로그인
- **PIN 코드**: 4-6자리 PIN 설정
- **데이터 암호화**: 민감 데이터 암호화

---

## 🚀 개발 로드맵

### Phase 1: MVP (2주)
**목표**: 핵심 기능 구현

- [ ] Flutter 프로젝트 셋업
- [ ] 다크 테마 UI 구현
- [ ] 메인 캘린더 화면
- [ ] 거래 입력 화면 (수입/지출)
- [ ] 숫자 키패드 컴포넌트
- [ ] 하단 네비게이션
- [ ] 기본 데이터베이스 연동
- [ ] 로컬 데이터 저장

### Phase 2: 핵심 기능 (2주)
**목표**: 주요 기능 완성

- [ ] 월별 통계 화면
- [ ] 자산 관리 화면
- [ ] 카테고리 관리
- [ ] 검색 기능
- [ ] 반복 거래
- [ ] 이체 기능
- [ ] 백엔드 API 연동
- [ ] JWT 인증

### Phase 3: 고급 기능 (2주)
**목표**: 차별화 기능 추가

- [ ] 예산 관리
- [ ] 상세 통계 분석
- [ ] 그래프 시각화
- [ ] 영수증 OCR
- [ ] 음성 입력
- [ ] 데이터 동기화
- [ ] 알림 기능
- [ ] 위젯 지원

### Phase 4: 완성 (1주)
**목표**: 마무리 및 최적화

- [ ] UI/UX 세부 조정
- [ ] 성능 최적화
- [ ] 버그 수정
- [ ] 테스트 (단위/통합/E2E)
- [ ] 문서화
- [ ] 배포 준비

---

## 📊 성공 지표

### 기술적 지표
- **응답 속도**: 모든 화면 전환 < 200ms
- **API 응답**: 95% 요청 < 100ms
- **오프라인 지원**: 100% 기능 오프라인 사용 가능
- **데이터 동기화**: 5초 이내 동기화

### 사용성 지표
- **거래 입력 시간**: 평균 10초 이내
- **일일 활성 사용자**: 70% 이상
- **월간 지속 사용률**: 60% 이상

### 품질 지표
- **크래시율**: < 0.1%
- **버그 리포트**: < 10건/월
- **앱스토어 평점**: 4.5 이상

---

## ⚠️ 리스크 및 대응 방안

### 기술적 리스크
1. **Flutter 성능 이슈**
   - 대응: 네이티브 모듈 활용, 최적화

2. **데이터 동기화 충돌**
   - 대응: 충돌 해결 알고리즘, 버전 관리

3. **보안 취약점**
   - 대응: 정기 보안 감사, 암호화 강화

### 비즈니스 리스크
1. **사용자 이탈**
   - 대응: 온보딩 개선, 튜토리얼 강화

2. **경쟁 앱 대응**
   - 대응: 차별화 기능, 빠른 업데이트

---

## 📝 참고사항

### 디자인 원칙
1. **일관성**: 모든 화면에서 동일한 디자인 언어
2. **직관성**: 학습 없이 사용 가능한 UI
3. **효율성**: 최소한의 탭으로 목적 달성
4. **피드백**: 모든 액션에 즉각적 피드백

### 개발 원칙
1. **모듈화**: 재사용 가능한 컴포넌트
2. **테스트**: TDD 기반 개발
3. **문서화**: 코드 및 API 문서화
4. **버전관리**: Git Flow 전략

---

## 🎯 최종 목표

**"편한가계부와 구별할 수 없을 정도로 완벽한 클론 앱"**

- 픽셀 단위로 동일한 UI
- 동일한 사용자 경험
- 더 나은 성능과 안정성
- 확장 가능한 아키텍처

---

*이 PRD는 실제 스크린샷 분석과 사용자 경험을 바탕으로 작성되었으며, 
지속적으로 업데이트될 예정입니다.*

**문서 버전**: V0.6
**작성일**: 2025년 8월 26일
**최종 수정일**: 2025년 8월 26일