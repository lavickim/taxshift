# AI 세무서비스 개발 TODO List

## 📋 개요

mvp.md에 정의된 **다층 방어 아키텍처**를 TDD 방식으로 구현합니다.

- 목표: 룰엔진 95% + 유추/일반화 ML 4% + LLM 1%
- 방식: 테스트 먼저 작성 → 기능 구현 → 테스트 통과 검증

---

## 🏗️ 1단계: 기반 인프라 구축

### 1.1 데이터베이스 테스트 환경 구축

- [x] **테스트**: transaction_cache 테이블 CRUD 테스트 작성
- [x] **구현**: TransactionCache 서비스 클래스 구현
- [ ] **테스트**: rules 테이블 CRUD 테스트 작성
- [ ] **구현**: Rules 서비스 클래스 구현
- [ ] **테스트**: rule_candidates 테이블 CRUD 테스트 작성
- [ ] **구현**: RuleCandidates 서비스 클래스 구현
- [ ] **테스트**: transactions 테이블 CRUD 테스트 작성
- [ ] **구현**: Transactions 서비스 클래스 구현

### 1.2 핵심 유틸리티 함수 (mvp.md Phase 1.1 참조)

- [x] **테스트**: SHA256 해시 생성 함수 테스트 작성 (`__tests__/utils/hash-utils.test.ts`)
- [x] **구현**: 해시 생성 유틸리티 함수 구현 (`lib/utils/hash-utils.ts`)
- [x] **테스트**: 텍스트 정규화 함수 테스트 작성
- [x] **구현**: 텍스트 정규화 함수 구현

---

## 🔄 2단계: Layer 0 - 캐시 시스템 구축 (mvp.md Phase 1.2 & Phase 2 참조)

### 2.1 TransactionCacheService 클래스 (mvp.md Phase 1.2)

- [ ] **테스트**: 캐시 HIT 케이스 테스트 작성 (`__tests__/services/transaction-cache.test.ts`)
- [ ] **테스트**: 캐시 MISS 케이스 테스트 작성
- [ ] **테스트**: 캐시 저장 로직 테스트 작성
- [ ] **테스트**: 캐시 통계 테스트 작성
- [ ] **구현**: TransactionCacheService 클래스 구현 (`lib/services/transaction-cache.ts`)
  - CacheLookupResult, CacheStoreResult, CacheStats 인터페이스
  - lookup(), store(), getStats(), resetStats() 메소드
  - 10ms 미만 응답 시간 목표

### 2.2 캐시 API 엔드포인트 (mvp.md Phase 2)

- [x] **테스트**: /api/cache/lookup API 테스트 작성 (`__tests__/api/cache/lookup.test.ts`)
- [x] **구현**: 캐시 조회 API 구현 (`app/api/cache/lookup/route.ts`)
- [x] **테스트**: /api/cache/store API 테스트 작성 (`__tests__/api/cache/store.test.ts`) ✅ **12개
      테스트 통과**
- [x] **구현**: 캐시 저장 API 구현 (`app/api/cache/store/route.ts`)
  - POST 요청으로 캐시 저장 기능 구현
  - upsert 옵션 지원 (쿼리 파라미터 `?upsert=true`)
  - 필수 필드 검증 (rawTextHash, rawText, uniqueKey)
  - 성능 최적화: <10ms 응답 시간, 대량/동시 처리 지원
  - 포괄적 에러 핸들링: 400/409/500 상태 코드
- [x] **테스트**: /api/cache/stats API 테스트 작성 (`__tests__/api/cache/stats.test.ts`) ✅ **11개
      테스트 통과**
- [x] **구현**: 캐시 통계 API 구현 (`app/api/cache/stats/route.ts`)
  - GET 요청으로 캐시 통계 조회 기능 구현
  - 날짜 필터링 지원 (`?from=YYYY-MM-DD&to=YYYY-MM-DD`)
  - 통계 분석: 총 엔트리, 날짜 범위, 평균 길이, 패턴 분석, 일별 분포
  - 성능 최적화: <100ms 응답 시간, 동시 요청 처리 안정성
  - 포괄적 에러 핸들링: 400/500 상태 코드

### 2.3 성능 검증 (mvp.md Phase 3)

- [ ] **테스트**: 성능 벤치마크 테스트 작성 (`__tests__/performance/cache-benchmark.test.ts`)
  - 1000건 조회 평균 10ms 미만
  - 캐시 적중률 50% 이상 목표
- [ ] **검증**: Layer 0 성공 기준 달성 확인

---

## 🎯 3단계: Layer 1 - 정규식/휴리스틱 필터

### 3.1 정규식 규칙 엔진

- [x] **테스트**: 주유소 패턴 매칭 테스트 작성 (`(상)주`, `(하)주` 등) ✅ **10개 테스트 통과**
- [x] **테스트**: 편의점 패턴 매칭 테스트 작성 (`GS25`, `CU`, `세븐일레븐` 등) ✅ **5개 테스트
      통과**
- [x] **테스트**: 카센터 패턴 매칭 테스트 작성 ✅ **3개 테스트 통과**
- [x] **테스트**: 온라인 서비스 패턴 매칭 테스트 작성 (`GODADDY`, `구글` 등) ✅ **4개 테스트 통과**
- [x] **구현**: RegexRuleEngine 클래스 구현 (`lib/services/regex-rule-engine.ts`)
  - 다층 패턴 매칭 시스템: 주유소, 편의점, 카센터, 온라인서비스
  - 신뢰도 기반 우선순위 처리 (0.8~0.95)
  - 정규화 기능: 브랜드명 통일, 공백/특수문자 처리
  - 성능 최적화: 1000건 < 100ms, 평균 < 0.2ms
  - 대소문자/띄어쓰기 변형 처리, 동시 요청 안정성

### 3.2 정규식 API 엔드포인트

- [x] **테스트**: /api/regex/match API 테스트 작성 ✅ **13개 테스트 통과**
- [x] **구현**: 정규식 매칭 API 구현 (`app/api/regex/match/route.ts`)
  - POST 요청으로 텍스트 정규식 매칭 분류
  - 종합 입력 유효성 검사: JSON 파싱, 필드 검증, 공백 처리
  - CSV 규칙 엔진 통합: 동적 싱글톤 패턴, 자동 규칙 로딩
  - 성능 최적화: 패턴 매칭 <100ms, 규칙 캐싱
  - 포괄적 에러 핸들링: 400/500/405 상태 코드

---

## 🧠 4단계: Layer 2 - 유추/일반화 ML 시스템

### 4.1 ML 모델 인터페이스 (더미 구현)

- [x] **구현**: MLInferenceService 클래스 더미 구현 (`lib/services/ml-inference.ts`)
  - 더미 응답: 항상 매치되지 않음으로 반환하여 LLM으로 넘어가도록 함
  - 인터페이스 정의: MLInferenceRequest, MLInferenceResponse
  - 모델 상태 관리: isModelLoaded(), getModelStats()
  - 향후 실제 ML 모델로 교체 예정

### 4.2 ML API 엔드포인트 (더미 구현)

- [x] **구현**: ML 추론 API 더미 구현 (`app/api/ml/infer/route.ts`)
  - POST 요청으로 ML 추론 시뮬레이션
  - 입력 유효성 검사 및 에러 처리
  - 향후 실제 ML 모델로 교체 예정

---

## 🤖 5단계: Layer 3 - LLM 분류 시스템

### 5.1 LLM 추론 서비스

- [x] **구현**: LLMInferenceService 클래스 구현 (`lib/services/llm-inference.ts`)
  - Google Gemini AI 연동: gemini-1.5-flash 모델 사용
  - 한국어 거래 텍스트 분류: 11개 카테고리 지원
  - 컨텍스트 인식: 거래금액, 날짜, 위치 정보 활용
  - JSON 응답 파싱 및 유효성 검증
  - 에러 처리 및 타임아웃 관리

### 5.2 LLM API 엔드포인트

- [x] **구현**: LLM 분류 API 구현 (`app/api/llm/infer/route.ts`)
  - POST 요청으로 LLM 기반 텍스트 분류
  - 완전한 입력 유효성 검사: JSON 파싱, 필드 검증
  - 환경 변수 검증 및 인증 관리
  - Health check 기능: OPTIONS 요청 지원
  - 종합 에러 처리: 400/500/405 상태 코드

---

## 🔗 6단계: 통합 거래 처리 파이프라인

### 6.1 메인 처리 엔진

- [x] **구현**: TransactionClassifier 클래스 구현 (`lib/services/transaction-classifier.ts`)
  - 4층 파이프라인 관리: Cache → Regex → ML → LLM
  - 레이어별 통계 추적: 성공률, 처리 시간, 에러율
  - 캐시 전략: Regex 60분, ML 30분, LLM 15분
  - 성능 모니터링: 각 레이어별 응답 시간 측정
  - 상태 관리: 헬스 체크 및 서비스 상태 확인

### 6.2 통합 API 엔드포인트

- [x] **구현**: 통합 분류 API 구현 (`app/api/classify/route.ts`)
  - POST 요청으로 완전한 4층 파이프라인 실행
  - GET 요청으로 레이어별 통계 조회
  - OPTIONS 요청으로 헬스 체크 수행
  - 종합 에러 처리 및 상태 코드 관리

---

## 📚 7단계: 학습 루프 시스템

### 7.1 사용자 피드백 수집

- [ ] **테스트**: 사용자 피드백 저장 테스트 작성
- [ ] **구현**: FeedbackService 클래스 구현
- [ ] **테스트**: rule_candidates 투표 시스템 테스트 작성
- [ ] **구현**: 투표 집계 로직 구현

### 7.2 자동 규칙 승격

- [ ] **테스트**: 승격 조건 검증 테스트 작성 (최소 빈도 + 지배도)
- [ ] **테스트**: rule_candidates → rules 승격 테스트 작성
- [ ] **구현**: AutoRulePromotion 서비스 구현

### 7.3 학습 루프 API

- [ ] **테스트**: /api/feedback/submit API 테스트 작성
- [ ] **구현**: 피드백 제출 API 구현
- [ ] **테스트**: /api/rules/promote API 테스트 작성
- [ ] **구현**: 규칙 승격 API 구현

---

## 🔍 8단계: 데이터 품질 감시 ML

### 8.1 이상 거래 탐지

- [ ] **테스트**: 정상 패턴 학습 테스트 작성
- [ ] **테스트**: 이상 거래 탐지 테스트 작성
- [ ] **구현**: AnomalyDetectionService 클래스 구현 (임시로 통계적 이상치 탐지)

### 8.2 품질 감시 API

- [ ] **테스트**: /api/quality/check API 테스트 작성
- [ ] **구현**: 품질 검사 API 구현

---

## 🎨 9단계: UI/UX 개선

### 9.1 거래 처리 대시보드

- [ ] **테스트**: 거래 처리 컴포넌트 테스트 작성
- [ ] **구현**: TransactionProcessingDashboard 컴포넌트 구현
- [ ] **테스트**: 실시간 처리 현황 표시 테스트 작성
- [ ] **구현**: 실시간 상태 업데이트 기능 구현

### 9.2 학습 루프 UI

- [ ] **테스트**: 사용자 피드백 컴포넌트 테스트 작성
- [ ] **구현**: FeedbackInterface 컴포넌트 구현
- [ ] **테스트**: 규칙 관리 UI 테스트 작성
- [ ] **구현**: RulesManagement 컴포넌트 구현

### 9.3 품질 모니터링 UI

- [ ] **테스트**: 이상 거래 대시보드 테스트 작성
- [ ] **구현**: QualityMonitoringDashboard 컴포넌트 구현

---

## 🧪 10단계: 통합 테스트 및 성능 최적화

### 10.1 E2E 테스트

- [ ] **테스트**: 전체 시스템 End-to-End 테스트 작성
- [ ] **테스트**: 성능 벤치마크 테스트 작성 (Layer별 처리 비중 검증)
- [ ] **구현**: 성능 모니터링 시스템 구현

### 10.2 최적화

- [ ] **테스트**: 캐시 적중률 측정 테스트 작성
- [ ] **구현**: 캐시 전략 최적화
- [ ] **테스트**: API 응답 시간 측정 테스트 작성
- [ ] **구현**: API 성능 최적화

---

## 📦 11단계: 배포 및 모니터링

### 11.1 배포 준비

- [ ] **구현**: 환경별 설정 파일 구성
- [ ] **구현**: Docker 컨테이너화
- [ ] **구현**: Vercel 배포 설정

### 11.2 모니터링 시스템

- [ ] **구현**: 로그 시스템 구축
- [ ] **구현**: 메트릭 수집 시스템 구축
- [ ] **구현**: 알람 시스템 구축

---

## 🎯 현재 진행 상황

### ✅ 완료된 작업

- [x] 기본 데이터베이스 스키마 구축 (Prisma)
- [x] Companies 관리 시스템 구현
- [x] Codeshift Inc. 회사 데이터 생성
- [x] **Layer 0 캐시 시스템**: 86% 완료 (6/7 작업)
  - TransactionCache 서비스 클래스 (25개 테스트 통과)
  - /api/cache/lookup API (9개 테스트 통과)
  - /api/cache/store API (12개 테스트 통과)
  - /api/cache/stats API (11개 테스트 통과)
- [x] **Layer 1 정규식 시스템**: 100% 완료 (35개 테스트 통과)
  - CSV-RegexRuleEngine 클래스 (22개 테스트 통과)
  - /api/regex/match API (13개 테스트 통과)
  - 95% 룰엔진의 핵심 구성 요소 완성
- [x] **Layer 2 ML 시스템**: 더미 구현 완료
  - MLInferenceService 더미 클래스 (향후 교체 예정)
  - /api/ml/infer API 더미 구현
- [x] **Layer 3 LLM 시스템**: 100% 완료
  - LLMInferenceService 클래스 (Gemini AI 연동)
  - /api/llm/infer API (11개 카테고리 분류)
  - 한국어 거래 텍스트 분류 완료
- [x] **통합 분류 시스템**: 100% 완료
  - TransactionClassifier 4층 파이프라인
  - /api/classify API 통합 엔드포인트
  - 레이어별 통계 및 헬스 체크
- [x] Jest 테스트 환경 구축 (설정 완료)
- [x] transaction_cache 테이블 CRUD 테스트 작성 (14개 테스트 케이스 통과)
- [x] **SHA256 해시 유틸리티 함수 구현** (23개 테스트 케이스 통과)
  - generateHash(): 문자열 → 64자리 SHA256 해시 변환
  - normalizeText(): 텍스트 정규화 (공백, 대소문자, 특수문자 처리)
  - 성능 테스트: 1000건 < 50ms, 정규화 1000건 < 30ms
- [x] **TransactionCache 서비스 클래스 구현** (25개 테스트 케이스 통과)
  - CRUD 연산: create(), findByHash(), findAll(), count(), update(), delete(), deleteAll()
  - 고급 기능: upsert() (생성 또는 업데이트)
  - 유효성 검증: 해시 형식, 입력 데이터 검증
  - 성능 테스트: 100건 생성 < 3초, 100번 조회 < 500ms
- [x] **캐시 조회 API 구현** (9개 테스트 케이스 통과)
  - GET /api/cache/lookup: 해시로 캐시 조회 (HIT/MISS)
  - 에러 처리: 파라미터 검증, 유효성 검증, 서버 에러
  - 성능 테스트: 응답 시간 < 10ms, 100건 병렬 처리 < 100ms
  - 안정성: 동시 요청 50건 처리
- [x] 기본 인증 시스템 구현

### 🎯 다음 우선순위 작업

1. **Layer 0 캐시 시스템 완료** - 성능 벤치마크 테스트 및 검증
2. **Layer 2 ML 시스템 실제 구현** - 현재 더미에서 실제 ML 모델로 교체
3. **테스트 커버리지 확대** - 통합 테스트 및 E2E 테스트 작성
4. **성능 최적화** - 각 레이어별 성능 목표 달성 확인

---

## 📝 작업 규칙

1. **TDD 원칙 준수**: 반드시 테스트를 먼저 작성한 후 구현
2. **단계별 승인**: 각 체크박스 완료 후 다음 작업 전에 승인 요청
3. **테스트 커버리지**: 모든 핵심 로직은 테스트로 검증
4. **문서화**: 주요 기능은 주석과 README 업데이트
5. **성능 측정**: 각 Layer별 처리 비중 및 응답 시간 측정

현재 **"Codeshift Inc." 회사 계정으로 작업 준비 완료** ✅

Runtime Error

Error: A <Select.Item /> must have a value prop that is not an empty string. This is because the
Select value can be set to an empty string to clear the selection and show the placeholder.

components/ui/select.tsx (118:3) @ \_c8

116 | React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> 117 | >(({ className, children,
...props }, ref) => (

> 118 | <SelectPrimitive.Item

      |   ^

119 | ref={ref} 120 | className={cn( 121 | "relative flex w-full cursor-default select-none
items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent
focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", Call
Stack 6

Show 1 ignore-listed frame(s) \_c8 components/ui/select.tsx (118:3) NationalPensionAnalysis
components/national-pension-analysis.tsx (391:23) DataAnalysisContent
components/data-analysis-content.tsx (119:46) AdminDashboardLayout
components/admin-dashboard-layout.tsx (209:45) Home

{ "id": 542366, "data_year_month": "2025-05", "workplace_name": "주식회사 에프엠지/일용/인천발전본부
HRSG#1 산화철 집진장치 개선공사", "business_registration_number": "422870", "workplace_status_code":
1, "postal_code": "22852", "address_jibun": "인천광역시 서구 원창동", "address_road": "인천광역시
서구 중봉대로405번길", "legal_dong_code": "2826011100", "admin_dong_code": "2826057500",
"sido_code": "28", "sigungu_code": "260", "eubmyeondong_code": "111", "workplace_type_code": 1,
"industry_code": "452124", "industry_name": "건물용 기계ㆍ장비 설치 공사업", "application_date":
"2025-04-28", "re_registration_date": null }
