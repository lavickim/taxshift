# MoneyShift 시스템 인터페이스 및 의존성 관리 문서

**작성일**: 2025-07-24  
**버전**: v1.0  
**목적**: 멀티 서비스 환경에서 시스템 간 인터페이스와 의존성을 관리하여, 변경 시 영향 범위를 파악하고 필요한 테스트를 자동화

---

## 📋 시스템 구성 개요

MoneyShift는 다음 4개 주요 서비스로 구성:

1. **mshift-admin** (NextJS Frontend) - Port 3000
2. **mshift-api** (Spring Boot Backend) - Port 8080  
3. **mshift-app** (React Native Mobile) - Expo Metro 8081
4. **mshift-data_processing** (Python/Streamlit) - Port 8501

**공유 데이터베이스**:
- PostgreSQL (Port 5432) - 프론트엔드(Prisma) + 백엔드(MyBatis) 공유
- Redis (Port 6379) - 캐싱 레이어

---

## 🔗 시스템 간 인터페이스 매핑

### 1. Frontend ↔ Backend API 인터페이스

**경로**: `/Users/lavickim/_Dev/moneyshift/mshift-admin/app/api/`

| Frontend API Route | Backend Endpoint | 데이터 형식 | 영향도 |
|-------------------|------------------|------------|-------|
| `/api/regex/match` | `/mshift-api/rule-engine/match` | JSON: `{text, category}` | **HIGH** |
| `/api/regex-rules` | `/mshift-api/rule-engine/rules` | JSON: Rules Array | **HIGH** |
| `/api/regex-rules/[id]` | `/mshift-api/rule-engine/rules/{id}` | JSON: Rule Object | MEDIUM |
| `/api/v2/accounting/*` | `/mshift-api/accounting/*` | JSON: 회계 데이터 | **HIGH** |
| `/api/v2/tag-mapping/*` | `/mshift-api/tag-mapping/*` | JSON: 태그 매핑 | **HIGH** |

**Critical Configuration**:
```typescript
// mshift-admin/app/api/*/route.ts
const JAVA_API_BASE_URL = process.env.JAVA_API_BASE_URL || 'http://localhost:8080/mshift-api';
```

### 2. Mobile App ↔ Backend API 인터페이스  

**경로**: `/Users/lavickim/_Dev/moneyshift/mshift-app/src/services/`

| Mobile Service | Backend Endpoint | 데이터 형식 | 영향도 |
|---------------|------------------|------------|-------|
| `BookkeepingService.ts` | `/mshift-api/accounting/process-transaction` | JSON: Transaction | **HIGH** |
| `DashboardService.ts` | `/mshift-api/dashboard/*` | JSON: Dashboard Data | MEDIUM |
| `TransactionService.ts` | `/mshift-api/transactions/*` | JSON: Transaction Array | **HIGH** |
| `FinancialStatementService.ts` | `/mshift-api/accounting/balance-sheet` | JSON: 재무제표 | **HIGH** |

**Critical Configuration**:
```typescript
// mshift-app/src/config/api.ts
export const API_BASE_URL = 'http://localhost:8080/mshift-api';
```

### 3. 데이터베이스 스키마 공유

**공유 테이블**: 프론트엔드(Prisma) ↔ 백엔드(MyBatis)

| 테이블명 | Prisma Schema | MyBatis Mapper | 영향도 | 테스트 |
|---------|---------------|----------------|-------|--------|
| `chart_of_accounts` | `prisma/schema.prisma` | `AccountingMapper.xml` | **HIGH** | Phase1 TDD |
| `tag_account_mappings` | `prisma/schema.prisma` | `TagAccountMappingMapper.xml` | **HIGH** | Phase2 TDD |
| `transactions` | `prisma/schema.prisma` | `TransactionMapper.xml` | **HIGH** | Integration Tests |
| `regex_rules` | `prisma/schema.prisma` | - | MEDIUM | Rule Management Tests |
| `tags_master` | `prisma/schema.prisma` | `TagAccountMappingMapper.xml` | MEDIUM | - |

---

## ⚠️ 변경 시 영향 범위 및 필수 테스트

### 1. Backend API 엔드포인트 변경 시

**영향 받는 시스템**: Frontend + Mobile App

**필수 테스트 순서**:
```bash
# 1. 백엔드 TDD 검증
cd mshift-api && ./start-with-tdd.sh --test-only

# 2. 프론트엔드 API 프록시 테스트
cd mshift-admin && yarn test app/api/

# 3. 모바일 앱 서비스 테스트  
cd mshift-app && yarn test src/services/

# 4. 통합 테스트
./scripts/test-integrated.sh
```

### 2. 데이터베이스 스키마 변경 시

**영향 받는 시스템**: Frontend + Backend + Mobile App

**필수 테스트 순서**:
```bash
# 1. Prisma 스키마 업데이트
cd mshift-admin && yarn db:generate && yarn db:push

# 2. 회계 시스템 TDD (Phase별)
yarn test __tests__/accounting/chart-of-accounts-expansion.test.ts
yarn test __tests__/accounting/tag-account-mapping-update.test.ts

# 3. 백엔드 MyBatis 매핑 테스트
cd ../mshift-api && ./start-with-tdd.sh --test-only

# 4. 모바일 앱 데이터 레이어 테스트
cd ../mshift-app && yarn test src/services/

# 5. 전체 통합 테스트
cd .. && ./scripts/test-integrated.sh
```

### 3. 계정과목 시스템 변경 시 (HIGH RISK)

**영향 받는 시스템**: 모든 시스템

**Critical Dependencies**:
- 4자리 계정코드 체계 (`1XXX`, `2XXX`, `3XXX`, `4XXX`, `5XXX`)
- 태그-계정 매핑 시스템
- 복식부기 분개 로직

**필수 테스트 시퀀스**:
```bash
# Phase 1: 계정과목 확장 테스트
yarn test __tests__/accounting/chart-of-accounts-expansion.test.ts

# Phase 2: 태그 매핑 업데이트 테스트  
yarn test __tests__/accounting/tag-account-mapping-update.test.ts

# Phase 3: GL 시스템 테스트 (개발 예정)
# yarn test __tests__/accounting/general-ledger-system.test.ts

# 백엔드 회계 엔진 테스트
cd mshift-api && mvn test -Dtest=AccountingEngineTest

# 모바일 앱 부기 기능 테스트
cd mshift-app && yarn test src/components/bookkeeping/
```

---

## 🚀 자동화된 TDD 체크포인트

### Start Scripts Integration

모든 시작 스크립트에 TDD 검증이 내장되어 있음:

```bash
./start-all.sh      # 전체 시스템 TDD 검증 후 시작
./start-admin.sh    # 프론트엔드 TDD 검증 (회계 시스템 포함)
./start-backend.sh  # 백엔드 TDD 검증 (DB 연결 포함)
./start-app.sh      # 모바일 앱 TDD 검증
```

### TDD 실패 시 중단 정책

**CLAUDE.md에 정의된 규칙**:
- Phase별 테스트가 실패하면 다음 Phase로 진행 금지
- 서버 시작 전 모든 TDD 테스트 통과 필수
- 통합 테스트 실패 시 배포 중단

---

## 📊 인터페이스 변경 추적

### Version Control Strategy

**브랜치 전략**:
- `main`: 안정 버전 (모든 TDD 통과)
- `feature/*`: 기능 개발 (Phase별 TDD 통과 필수)
- `hotfix/*`: 긴급 수정 (최소 영향 범위 테스트)

### Change Impact Matrix

| 변경 유형 | Frontend | Backend | Mobile | DB | 필수 테스트 |
|----------|----------|---------|--------|----|-----------| 
| API Endpoint | 🔴 HIGH | 🔴 HIGH | 🔴 HIGH | - | Full Integration |
| DB Schema | 🔴 HIGH | 🔴 HIGH | 🔴 HIGH | 🔴 HIGH | All TDD + Migration |
| 계정과목 구조 | 🔴 HIGH | 🔴 HIGH | 🔴 HIGH | 🔴 HIGH | All Accounting TDD |
| UI/UX Only | 🟡 MEDIUM | - | - | - | Frontend Tests |
| 캐시 로직 | 🟡 MEDIUM | 🔴 HIGH | 🟡 MEDIUM | - | Cache Integration |

---

## 🔧 개발 워크플로우

### 변경 사항 적용 시 체크리스트

1. **변경 영향 범위 확인**
   - 위 인터페이스 매핑 테이블 참조
   - 영향 받는 시스템 식별

2. **TDD 기반 개발**
   - 실패하는 테스트 작성 (Red)
   - 최소 구현으로 테스트 통과 (Green)  
   - 리팩토링 (Refactor)

3. **단계별 검증**
   - 해당 시스템 TDD 테스트 통과
   - 영향 받는 다른 시스템 테스트 실행
   - 통합 테스트 실행

4. **배포 전 최종 검증**
   ```bash
   ./start-all.sh  # 모든 시스템 TDD 통과 확인
   ./scripts/test-integrated.sh  # 통합 테스트 80% 이상 성공
   ```

---

## 📝 문서 유지보수

### 업데이트 시점
- 새로운 API 엔드포인트 추가 시
- 데이터베이스 스키마 변경 시  
- 새로운 서비스 추가 시
- TDD 테스트 케이스 추가 시

### 책임자
- **시스템 아키텍처**: Claude Code (claude.ai/code)
- **TDD 규칙 관리**: CLAUDE.md 기반 자동화
- **문서 동기화**: 매 Phase 완료 시 업데이트

---

## 🎯 다음 Phase 개발 시 주의사항

### Phase 3: General Ledger 시스템

**예상 변경 사항**:
- 새로운 GL 테이블 추가 (`journal_entries`, `gl_accounts`)
- 분개 처리 API 엔드포인트 추가
- 복식부기 엔진 고도화

**미리 준비할 테스트**:
```bash
# 예정된 테스트 파일
__tests__/accounting/general-ledger-system.test.ts
mshift-api/src/test/java/.../GeneralLedgerTest.java
mshift-app/src/components/bookkeeping/__tests__/JournalEntry.test.tsx
```

**영향 받을 시스템**: 전체 (HIGH RISK)

---

*본 문서는 MoneyShift 시스템의 안정성과 개발 효율성을 위해 지속적으로 업데이트됩니다.*