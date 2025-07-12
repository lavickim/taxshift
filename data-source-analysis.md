# MoneyShift 데이터 소스 분석 - 키워드 룰 vs DB 정규식

## 📊 그리드 데이터 소스 현황

### 1. 키워드 룰 탭 (통합 룰 관리)
**데이터 소스**: NextJS 직접 DB 조회
- **위치**: `/Users/lavickim/_Dev/moneyshift/mshift-admin/app/api/rules/combined/route.ts`
- **테이블**: `rule_engine` (PostgreSQL)
- **연결 방식**: Node.js `pg` 라이브러리로 직접 연결
- **엔드포인트**: `GET /api/rules/combined`

#### 특징:
- ✅ **직접 접근**: 미들웨어 없이 DB 직접 조회
- ✅ **페이징 지원**: `page`, `limit` 파라미터 지원
- ✅ **검색 지원**: 키워드, 태그, 계정명으로 검색
- ✅ **필터링**: `is_active` 상태별 필터
- ✅ **통계 계산**: 성공률(`success_rate`) 실시간 계산

#### 조회 필드:
```sql
SELECT *,
  CASE 
    WHEN usage_count > 0 THEN ROUND((positive_count::numeric / usage_count::numeric) * 100, 2)
    ELSE 0
  END as success_rate
FROM rule_engine
WHERE keyword ILIKE '%검색어%' 
ORDER BY confidence DESC, usage_count DESC, created_at DESC
```

### 2. DB 정규식 탭 (통합 룰 관리)
**데이터 소스**: mshift-api (Spring Boot) 경유
- **위치**: `/Users/lavickim/_Dev/moneyshift/mshift-admin/app/api/regex-rules/route.ts`
- **테이블**: `regex_rules` (PostgreSQL)
- **연결 방식**: NextJS → Spring Boot API → MyBatis → PostgreSQL
- **엔드포인트**: `GET /api/regex-rules` → `http://localhost:8080/api/rule-engine/rules`

#### 특징:
- ✅ **Redis 캐싱**: 24시간 캐시로 고성능
- ✅ **카테고리 필터**: `/category/{category}` 지원
- ✅ **엔터프라이즈급**: Spring Boot 기반 안정성
- ❌ **기본 페이징**: 프론트엔드에서 처리 필요
- ❌ **검색 제한**: 백엔드에서 검색 로직 미지원

#### 조회 필드:
```java
// RegexRule 모델
{
  id, pattern, replacement, description, category, 
  enabled, priority, confidence, normalizer_type,
  created_at, updated_at
}
```

## 🔄 현재 API 호출 흐름

### 키워드 룰 데이터 흐름:
```
1. 사용자가 키워드 룰 탭 클릭
2. combined-rules-management.tsx → loadRules() 호출
3. fetch('/api/rules/combined?search=검색어&is_active=true&page=1&limit=20')
4. NextJS API → pg.Pool.query() → PostgreSQL rule_engine 테이블
5. 결과를 그리드에 표시 (페이징, 검색, 필터링 포함)
```

### DB 정규식 데이터 흐름:
```
1. 사용자가 DB 정규식 탭 클릭  
2. combined-rules-management.tsx → loadRegexRules() 호출
3. fetch('/api/regex-rules')
4. NextJS API → fetch('http://localhost:8080/api/rule-engine/rules')
5. Spring Boot → Redis 캐시 확인 → MyBatis → PostgreSQL regex_rules 테이블
6. 결과를 그리드에 표시 (프론트엔드에서 필터링/페이징)
```

## ⚡ 성능 비교

| 항목 | 키워드 룰 (NextJS 직접) | DB 정규식 (mshift-api) |
|------|------------------------|------------------------|
| **응답 속도** | 보통 (DB 직접 조회) | 빠름 (Redis 캐시) |
| **메모리 사용** | 낮음 | 높음 (캐시 유지) |
| **확장성** | 제한적 | 좋음 |
| **일관성** | DB 실시간 반영 | 캐시 지연 (최대 24시간) |
| **개발 복잡도** | 단순 | 복잡 |

## 🗂️ 데이터베이스 스키마 차이점

### rule_engine 테이블 (키워드 룰):
```sql
rule_engine (
  id UUID PRIMARY KEY,
  keyword VARCHAR(255) UNIQUE,
  confidence INTEGER,
  tags TEXT,
  primary_tag VARCHAR(100),
  primary_account VARCHAR(100),
  secondary_tag VARCHAR(100), 
  secondary_account VARCHAR(100),
  usage_count INTEGER DEFAULT 0,
  positive_count INTEGER DEFAULT 0,
  negative_count INTEGER DEFAULT 0,
  last_used TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_by VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

### regex_rules 테이블 (DB 정규식):
```sql
regex_rules (
  id BIGINT PRIMARY KEY,
  pattern VARCHAR(1000),
  replacement VARCHAR(1000),
  description TEXT,
  category VARCHAR(100),
  enabled BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  confidence DECIMAL(3,2),
  normalizer_type VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

## 🎯 주요 차이점

### 기능적 차이:
1. **키워드 룰**: 단순 문자열 포함 매칭
2. **DB 정규식**: 복잡한 패턴 매칭 및 치환

### 관리 방식:
1. **키워드 룰**: 웹 UI에서 직접 CRUD
2. **DB 정규식**: Spring Boot API 경유 (캐시 무효화 필요)

### 통계 정보:
1. **키워드 룰**: 실시간 사용량/성공률 통계
2. **DB 정규식**: 기본 메타데이터만 제공

## ⚠️ 현재 문제점

1. **데이터 분산**: 두 개의 다른 테이블에 비슷한 기능 저장
2. **API 중복**: 같은 룰 검색을 다른 방식으로 처리
3. **UI 혼란**: 사용자가 어떤 데이터를 보고 있는지 불분명
4. **성능 불일치**: 캐시 vs 직접 조회로 인한 성능 차이

## 💡 권장 통합 방안

### Option A: Spring Boot 중심 통합
- `rule_engine` 테이블을 mshift-api로 이관
- Redis 캐싱으로 성능 최적화
- 통일된 API 엔드포인트 제공

### Option B: NextJS 중심 통합  
- `regex_rules` 기능을 NextJS로 이관
- Prisma ORM 활용
- 단순한 아키텍처 유지

**결론**: 성능과 확장성을 고려하면 Option A가 더 적합하며, 두 테이블의 룰을 하나의 통합된 인터페이스로 관리하는 것이 바람직합니다.