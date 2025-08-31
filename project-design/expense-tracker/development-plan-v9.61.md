# MoneyShift Expense Tracker 개발 계획 - V9.61
## 편한가계부 클론 앱 통합 개발 현황 및 로드맵

---

## 📋 프로젝트 현황 요약

### 프로젝트 정보
- **Flutter 앱**: `/Users/lavickim/_Dev/moneyshift/mshift-expense-flutter`
- **백엔드**: `/Users/lavickim/_Dev/moneyshift/mshift-expense-backend`
- **Java 버전**: Java 21
- **Flutter 버전**: 3.35.1
- **백엔드 포트**: 8090
- **데이터베이스**: PostgreSQL (5433) + Redis (6380)
- **버전**: V9.61 (2025년 8월 31일 업데이트)

### 전략적 목표 (트로이목마 전략)
- **1차 목표**: 사용자 친화적 무료 가계부 앱으로 실제 거래 데이터 수집
- **핵심 차별화**: 영수증 OCR 자동화, 95% 이상 정확도
- **성장 목표**: 6개월 내 MAU 50,000명
- **수익화**: 프리미엄 구독 (월 9,900원, 5% 전환율 목표)

---

## 🎯 완료된 개발 항목 (70% 완성)

### ✅ Step 1: 데이터베이스 스키마 구축 [완료]
- PostgreSQL 데이터베이스 초기화 완료
- 8개 핵심 테이블 생성 완료
  - et_users (사용자)
  - et_assets (자산)
  - et_categories (카테고리)
  - et_transactions (거래)
  - et_budgets (예산)
  - et_daily_memos (일일 메모)
  - et_recurring_templates (반복 템플릿)
  - et_notifications (알림)
- 인덱스 및 외래키 설정 완료
- 3개월치 샘플 데이터 삽입 완료 (2025년 7-9월)

### ✅ Step 2: 백엔드 Entity 및 Repository 구현 [완료]
- JPA Entity 클래스 구현 완료
  - User, Asset, Category, Transaction, Budget, DailyMemo
- Repository 인터페이스 생성 완료
- DTO 클래스 정의 완료
- EntityMapper 구현 완료

### ✅ Step 3: 백엔드 Service 레이어 구현 [완료]
- TransactionService: 거래 CRUD, 월별/일별 조회, 통계 계산
- AssetService: 자산 관리, 잔액 계산
- CategoryService: 카테고리 관리
- UserService: 사용자 관리
- DailyMemoService: 일일 메모 관리

### ✅ Step 4: REST API 컨트롤러 구현 [완료]
- TransactionController: 거래 관련 전체 API
- AssetController: 자산 관리 API
- CategoryController: 카테고리 API
- UserController: 사용자 API
- DailyMemoController: 메모 API
- 통계 API: 월별/일별/카테고리별 통계

### ✅ Step 5: Flutter 다크 테마 UI 프레임워크 [완료]
- 색상 테마 정의 (colors.dart)
- 텍스트 스타일 정의 (typography.dart)
- CustomAppBar, BottomNavigation 구현
- DualFloatingButtons 구현

### ✅ Step 6: 메인 캘린더 화면 [90% 완료]
- 상단 네비게이션 바 (월 선택, 아이콘들) ✅
- 5개 탭 메뉴 (일일/달력/월별/결산/메모) ✅
- 수입/지출/합계 표시 영역 ✅
- 7×6 캘린더 그리드 ✅
- 일별 거래 표시 ✅
- 하단 네비게이션 ✅
- 이중 플로팅 액션 버튼 ✅
- 날짜별 메모 기능 ✅

### ✅ Step 7: 거래 입력 화면 [80% 완료]
- 3개 탭 (수입/지출/이체) ✅
- 날짜 선택기 ✅
- 금액 입력 ✅
- 카테고리 선택 ✅
- 자산 선택 ✅
- 내용 입력 ✅
- 메모 필드 ✅
- 숫자 키패드 (기본 키보드 사용) ✅

### ✅ Step 8: API 연동 및 상태 관리 [70% 완료]
- API Service 클래스 구현 ✅
- HTTP 통신 구현 ✅
- 실시간 데이터 반영 ✅
- 로딩 상태 관리 ✅

### ✅ Step 9: 새로운 화면 구현 [완료]
- **일일 뷰 (DailyView)**: 일별 거래 상세 목록
- **월별 뷰 (MonthlyView)**: 월별 통계 및 그래프
- **메모 리스트 뷰 (MemoListView)**: 전체 메모 관리
- **스켈레톤 로더**: 로딩 시 애니메이션
- **메모 다이얼로그**: 메모 입력/수정 모달

---

## 🚧 개발 진행 중 항목 (20%)

### Step 10: 통계 화면 [50% 완료]
- 월별 통계 뷰 ✅
- 카테고리별 분석 ✅
- 일별 지출 그래프 ✅
- [ ] 기간 비교 기능
- [ ] 상세 차트 (fl_chart 활용)

### Step 11: 자산 관리 화면 [30% 완료]
- 자산 목록 화면 ✅
- [ ] 자산 추가/수정/삭제 UI
- [ ] 은행별 그룹핑
- [ ] 자산 이체 기능

---

## 📅 남은 개발 항목 (10%)

### Step 12: 카테고리 관리 [미시작]
- [ ] 사용자 정의 카테고리 추가/삭제
- [ ] 아이콘 선택 기능
- [ ] 색상 선택 기능
- [ ] 카테고리 순서 변경

### Step 13: 설정 및 부가 기능 [미시작]
- [ ] 설정 화면 구현
- [ ] 알림 설정
- [ ] 백업/복원 기능
- [ ] 앱 정보 페이지
- [ ] 프리미엄 구독 관리

### Step 14: OCR 및 영수증 처리 [미시작]
- [ ] 카메라 연동
- [ ] 영수증 OCR 처리
- [ ] 자동 거래 입력
- [ ] OCR 결과 수정 UI

### Step 15: 성능 최적화 [미시작]
- [ ] 이미지 최적화
- [ ] 레이지 로딩
- [ ] 캐싱 전략 개선
- [ ] 오프라인 모드 지원

### Step 16: 테스트 및 버그 수정 [미시작]
- [ ] 단위 테스트 작성
- [ ] 통합 테스트
- [ ] E2E 테스트
- [ ] 버그 수정 및 안정화

---

## 🚀 다음 우선순위 작업

### 1. 핵심 기능 완성 (1주)
- [ ] 자산 관리 UI 완성
- [ ] 카테고리 관리 기능
- [ ] 거래 편집/삭제 기능
- [ ] 검색 기능 구현

### 2. 사용성 개선 (1주)
- [ ] 반복 거래 템플릿
- [ ] 빠른 입력 기능
- [ ] 제스처 기반 네비게이션
- [ ] 다크/라이트 테마 토글

### 3. 데이터 분석 강화 (1주)
- [ ] 예산 관리 기능
- [ ] 지출 예측
- [ ] 카테고리별 트렌드
- [ ] 월별 비교 분석

### 4. 프리미엄 기능 (2주)
- [ ] OCR 영수증 스캔
- [ ] 은행 계좌 연동
- [ ] 엑셀 내보내기
- [ ] 클라우드 백업

---

## 💻 실행 방법

### 백엔드 실행
```bash
# Docker 컨테이너 실행 (DB)
cd /Users/lavickim/_Dev/moneyshift
docker-compose up -d trojan-postgres trojan-redis

# Spring Boot 실행
cd /Users/lavickim/_Dev/moneyshift/mshift-expense-backend
mvn spring-boot:run
```

### Flutter 앱 실행
```bash
cd /Users/lavickim/_Dev/moneyshift/mshift-expense-flutter

# 에뮬레이터 실행
flutter emulators --launch ExpenseTracker_ARM64

# 앱 실행
flutter run
```

### 데이터베이스 접속
```bash
PGPASSWORD=trojan_password psql -h localhost -p 5433 -U trojan_user -d trojan_expense_db
```

---

## 📊 기술 부채 및 개선 사항

### 백엔드
- [ ] Spring Security 완전 구현
- [ ] JWT 토큰 기반 인증
- [ ] API 버전 관리
- [ ] Swagger 문서화
- [ ] 로깅 시스템 구축

### 프론트엔드
- [ ] State Management 개선 (Provider/Riverpod)
- [ ] 로컬 캐싱 (SQLite/Hive)
- [ ] 애니메이션 최적화
- [ ] 접근성 개선
- [ ] 국제화 (i18n)

### 인프라
- [ ] CI/CD 파이프라인
- [ ] 모니터링 시스템
- [ ] 에러 트래킹
- [ ] 성능 모니터링
- [ ] A/B 테스팅 프레임워크

---

## 📈 성과 지표

### 현재 상태
- **완성도**: 70%
- **핵심 기능**: 90% 구현
- **UI/UX**: 80% 완성
- **API 연동**: 70% 완료
- **테스트 커버리지**: 10%

### 목표 지표
- **앱 시작 시간**: < 2초
- **화면 전환**: < 200ms
- **API 응답**: < 500ms
- **OCR 정확도**: > 95%
- **사용자 만족도**: > 4.5/5.0

---

## 🔄 버전 히스토리

- **V0.6** (2025.08.26): 초기 개발 계획 수립
- **V9.61** (2025.08.31): 70% 구현 완료, 일일/월별 뷰 추가, 메모 기능 구현

---

## 📝 참고 문서

- `/project-design/expense-tracker/trojan-horse-strategy.md` - 전략 문서
- `/project-design/expense-tracker/trojan-plan1.md` - 1차 계획
- `/project-design/expense-tracker/trojan-plan2.md` - 2차 계획
- `/CLAUDE.md` - 프로젝트 실행 가이드

---

**문서 버전**: V9.61  
**작성일**: 2025년 8월 31일  
**작성자**: Claude Assistant  
**승인**: 개발팀