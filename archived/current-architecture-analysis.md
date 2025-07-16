# MoneyShift 룰 엔진 아키텍처 현황 분석

## 📊 현재 상황 개요

현재 MoneyShift 시스템에는 **두 개의 분리된 룰 엔진**이 혼재되어 있어 혼란스러운 상황입니다.

## 🏗️ 현재 아키텍처

### 1. mshift-api (Spring Boot) - 정규식 룰 엔진
- **위치**: `/Users/lavickim/_Dev/moneyshift/mshift-api`
- **역할**: DB 기반 정규식 패턴 매칭
- **데이터베이스**: PostgreSQL `regex_rules` 테이블
- **캐싱**: Redis 기반 성능 최적화
- **엔드포인트**: `http://localhost:8080/api/rule-engine/match`

#### 특징:
- ✅ **고성능**: Redis 캐싱으로 빠른 응답
- ✅ **확장성**: DB 기반으로 동적 패턴 관리
- ✅ **안정성**: Spring Boot 기반 엔터프라이즈급 구조
- ✅ **정규식 지원**: 복잡한 패턴 매칭 가능

#### 데이터 구조:
```sql
regex_rules (
  id,
  pattern VARCHAR(1000),
  replacement VARCHAR(1000),
  description,
  category VARCHAR(100),
  enabled BOOLEAN,
  priority INT,
  confidence DECIMAL(3,2),
  normalizer_type VARCHAR(100)
)
```

### 2. mshift-admin (NextJS) - 키워드 룰 엔진  
- **위치**: `/Users/lavickim/_Dev/moneyshift/mshift-admin`
- **역할**: 키워드 기반 단순 매칭
- **데이터베이스**: PostgreSQL `rule_engine` 테이블
- **엔드포인트**: `http://localhost:3001/api/rule-engine/search`

#### 특징:
- ✅ **단순성**: 키워드 포함 여부만 확인
- ✅ **관리 편의성**: 웹 UI를 통한 직접 관리
- ❌ **성능 한계**: 캐싱 없음
- ❌ **기능 제한**: 단순 문자열 매칭만 가능

#### 데이터 구조:
```sql
rule_engine (
  id UUID,
  keyword VARCHAR,
  confidence INT,
  primary_tag VARCHAR,
  primary_account VARCHAR,
  secondary_tag VARCHAR,
  secondary_account VARCHAR,
  usage_count INT,
  is_active BOOLEAN
)
```

## 🔄 현재 호출 흐름

### 규칙 테스트 메뉴에서:
```
1. 사용자가 "스포티파이" 입력
2. combined-rules-management.tsx → /api/rule-engine/search 호출
3. NextJS API가 Prisma로 직접 DB 조회 (PostgreSQL)
4. regex_rules + rule_engine 테이블 모두 검색
5. 결과 반환
```

### 룰 테스트 메뉴에서:
```
1. 사용자가 "스포티파이" 입력  
2. rule-test-management.tsx → /api/rule-test/classify 호출
3. NextJS API가 mshift-api로 프록시 → /rule-engine/match
4. Spring Boot가 Redis 캐시 → PostgreSQL regex_rules 검색
5. 결과 반환
```

## ⚠️ 문제점

### 1. **중복된 룰 엔진**
- 같은 기능을 두 곳에서 다르게 구현
- 데이터 소스와 처리 로직이 분산

### 2. **일관성 부족**  
- 같은 "스포티파이" 입력에 대해 다른 결과 가능
- 관리자가 어느 엔진을 사용하는지 혼란

### 3. **성능 차이**
- mshift-api: Redis 캐싱으로 빠름
- NextJS API: 직접 DB 조회로 느림

### 4. **기능 격차**
- 정규식 vs 키워드 매칭의 정확도 차이
- mshift-api가 더 정교한 패턴 매칭 지원

## 🎯 권장 해결책

### Option A: mshift-api 통합 (권장)
```
모든 룰 매칭을 mshift-api로 통합
NextJS는 UI만 담당하고 백엔드는 프록시 역할
```

**장점:**
- ✅ 고성능 Redis 캐싱 활용
- ✅ 정규식 + 키워드 모두 지원
- ✅ 일관된 처리 로직
- ✅ 확장성 좋음

**작업 내용:**
1. mshift-api에 키워드 룰 처리 추가
2. NextJS의 `/api/rule-engine/search` 제거
3. 모든 프론트엔드를 `/api/rule-test/classify`로 통일

### Option B: NextJS 통합
```
mshift-api 제거하고 NextJS에서 모든 룰 처리
```

**장점:**
- ✅ 단순한 아키텍처
- ✅ 관리 편의성

**단점:**
- ❌ 성능 저하 (Redis 캐싱 없음)
- ❌ 확장성 제한

## 📋 현재 해결해야 할 즉시 문제

1. **"스포티파이" 매칭 실패**
   - 원인: `/api/rule-engine/search`에서 `regex_rules` 테이블 접근 오류
   - 해결: Prisma 클라이언트 재생성 후 테스트

2. **API 엔드포인트 혼재**
   - `/api/rule-engine/search` (NextJS)
   - `/api/rule-test/classify` (NextJS → mshift-api 프록시)
   - 둘 다 같은 기능을 다르게 구현

3. **UI 일관성**
   - "룰 엔진 테스트"와 "규칙 테스트" 메뉴가 다른 API 사용
   - 사용자에게 혼란 제공

## 🚀 다음 단계

1. **즉시 수정**: Prisma 스키마 동기화 및 클라이언트 재생성
2. **단기 통합**: Option A 방식으로 mshift-api 중심 통합
3. **장기 최적화**: Redis 캐싱 활용한 성능 최적화

---

**💡 결론**: 현재는 기능이 중복되고 혼재되어 있어 통합이 필요한 상황입니다. mshift-api 중심으로 통합하는 것이 성능과 확장성 면에서 최선의 선택입니다.