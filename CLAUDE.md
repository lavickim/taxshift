# CLAUDE.md — MoneyShift 프로젝트 컨텍스트

## 현행화 일자: 2026-03-18

## 프로젝트 방향

**세무 자동화 B2B 솔루션** — 세무사 사무소와 협력하여 거래 데이터 자동 분류 서비스를 제공한다.

이전 방향 (B2C 가계부 앱, 트로이목마 전략)은 **폐기**. `_deprecated/` 폴더에 보존.

## 현재 상태

- **프로젝트 재개 준비 중** (2025-08 ~ 2026-03 중단 후 재시작)
- **현황 보고서**: `/Users/lavickim/_Dev/moneyshift_repo/CURRENT_STATE_REPORT.md`
- **코드 위치**: `/Users/lavickim/_Dev/moneyshift_repo/`

## 핵심 모듈 (유효)

| 모듈 | 위치 | 역할 | 완성도 |
|------|------|------|--------|
| **규칙 엔진 API** | `moneyshift_be/mshift-api/` | Spring Boot, 거래 자동 분류 | ~70% (실사용 미검증) |
| **관리 패널** | `moneyshift_be/mshift-admin/` | Next.js, 규칙 관리/편집 | ~65% (실사용 미검증) |
| **데이터 수집** | `Moneyshift_data_processing/` | Python, 공공데이터 수집 | ~50% (구조 개편 중) |

## 아카이브 모듈 (현재 방향에서 제외)

| 모듈 | 위치 | 사유 |
|------|------|------|
| 가계부 앱 | `mshift-expense-flutter/` | B2C → B2B 전환 |
| 가계부 백엔드 | `mshift-expense-backend/` | B2C → B2B 전환 |
| 모바일 앱 | `mshift-app/` | 모바일 우선 → 웹 우선 |
| 크롬 확장 | `mshift-chromeext/` | 실험적, 미완성 |

## 기술 스택

- **백엔드**: Java 17, Spring Boot 3.2.7, MyBatis
- **DB**: PostgreSQL 15, Redis 7.2
- **관리 UI**: Next.js 15, Shadcn/ui, Tailwind
- **데이터 처리**: Python 3.9+, Pandas, Streamlit
- **컨테이너**: Docker Compose

## 실행 방법

### 규칙 엔진 API (핵심)
```bash
cd /Users/lavickim/_Dev/moneyshift_repo/moneyshift_be
docker-compose up -d postgres redis
cd mshift-api
mvn spring-boot:run  # http://localhost:8080
```

### 관리 패널
```bash
cd /Users/lavickim/_Dev/moneyshift_repo/moneyshift_be/mshift-admin
npm install && npm run dev  # http://localhost:3000
```

### 데이터 수집
```bash
cd /Users/lavickim/_Dev/moneyshift_repo/Moneyshift_data_processing
pip install -r requirements.txt
streamlit run ui/dashboard.py  # http://localhost:8501
```

## 핵심 기능

1. **4-Layer 거래 분류 엔진**
   - Layer 0: Redis 캐시 (89.3% 적중)
   - Layer 1: 정규식 키워드 매칭
   - Layer 2: ML 추론 (미구현)
   - Layer 3: LLM 분류 (미구현)

2. **109개 한국 표준 계정과목 매핑**
3. **복식부기 분개 자동 생성** (246개 TDD 테스트 통과)
4. **규칙 충돌 감지** (23개 충돌 유형)
5. **공공데이터 수집** (프랜차이즈 12,000+, 국민연금 542,366건)

## 세무사 협력 시 다음 단계

1. **Phase 0** (1주): 방향 재정립, 세무사 요구사항 정리
2. **Phase 1** (4-6주): MVP — 엑셀 업로드 → 자동 분류 → 분개 출력
3. **Phase 2** (2-3개월): 실무 확장 — 부가세, 소득세 자동 계산

## 문서 구조

```
project-design/
├── accounting/          ✅ 유효 — 회계 시스템 설계
├── admin/               ✅ 유효 — 관리 패널 설계
├── db/                  ✅ 유효 — 데이터베이스 설계
├── llm/                 ✅ 유효 — LLM 프롬프트 설계
├── rule-engine/         ✅ 유효 — 규칙 엔진 설계
├── todo/                ⚠️ 현행화 필요
├── _deprecated/         ❌ 폐기 — B2C/모바일 관련
└── v1.0-*.md            ⚠️ 일부 유효, 일부 현행화 필요
```

## 금지 사항

- B2C 가계부 앱을 다시 살리지 말 것
- 트로이목마 전략을 다시 추진하지 말 것
- deprecated 문서를 현행 기준으로 사용하지 말 것
- 카드 데이터 직접 수집을 시도하지 말 것 (정보보호법 이슈)
