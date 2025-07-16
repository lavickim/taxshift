# 키워드 기반 거래 태깅 시스템 - 새로운 데이터베이스 스키마 설계

## 현재 상황 분석

### 기존 `regex_rules` 테이블 장점
✅ **이미 구현된 기능들:**
- 브랜드 패턴(`pattern`)과 키워드 패턴(`keyword`) 동시 지원
- 태그 시스템 (`primary_tag`, `secondary_tag`, `tags`)
- 계정과목 매핑 (`primary_account`, `secondary_account`)
- 신뢰도 관리 (`confidence`, `success_rate`)
- 성능 추적 (`usage_count`, `positive_count`, `negative_count`)
- 우선순위 및 카테고리 분류
- 활성 상태 관리

### 설계 문서와의 GAP 분석
❌ **부족한 기능들:**
1. **키워드 그룹 관리**: 동의어 및 관련 키워드 그룹화
2. **태그 마스터 관리**: 태그 메타데이터 (색상, 아이콘, 설명)
3. **조건부 매핑**: 시간, 금액, 위치 기반 조건부 규칙
4. **사용자 질문 시스템**: 애매한 경우 사용자 질문 및 답변 관리
5. **LLM 생성 규칙**: AI가 제안한 룰 후보 관리
6. **세밀한 신뢰도 이력**: 신뢰도 변경 추적

## 새로운 스키마 설계 방안

### 전략 1: 기존 테이블 확장 + 신규 테이블 추가 (권장)

기존 `regex_rules` 테이블을 유지하면서 부족한 기능을 위한 신규 테이블들을 추가하는 방식

```sql
-- 1. 기존 regex_rules 테이블 개선
ALTER TABLE regex_rules ADD COLUMN IF NOT EXISTS context_rules JSONB;
ALTER TABLE regex_rules ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 100;
ALTER TABLE regex_rules ADD COLUMN IF NOT EXISTS parent_keyword_group_id BIGINT;

-- 2. 키워드 그룹 테이블 (NEW)
CREATE TABLE keyword_groups (
    id BIGSERIAL PRIMARY KEY,
    group_name VARCHAR(100) NOT NULL,
    primary_keyword VARCHAR(100) NOT NULL,
    synonyms TEXT[], -- PostgreSQL 배열
    category VARCHAR(50),
    confidence_base DECIMAL(3,2) DEFAULT 0.70,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. 태그 마스터 테이블 (NEW)
CREATE TABLE tags_master (
    id BIGSERIAL PRIMARY KEY,
    tag_name VARCHAR(100) NOT NULL UNIQUE,
    tag_category VARCHAR(50),
    description TEXT,
    color_hex VARCHAR(7) DEFAULT '#6B7280',
    icon_name VARCHAR(50) DEFAULT 'tag',
    display_order INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. 키워드 그룹-태그 매핑 테이블 (NEW)
CREATE TABLE keyword_tag_mappings (
    id BIGSERIAL PRIMARY KEY,
    keyword_group_id BIGINT REFERENCES keyword_groups(id),
    tag_id BIGINT REFERENCES tags_master(id),
    confidence_score DECIMAL(3,2) DEFAULT 0.70,
    context_rules JSONB, -- {"time": "evening", "amount_min": 50000}
    priority INTEGER DEFAULT 50,
    usage_count BIGINT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(keyword_group_id, tag_id)
);

-- 5. 태그-계정과목 매핑 테이블 (NEW)
CREATE TABLE tag_account_mappings (
    id BIGSERIAL PRIMARY KEY,
    tag_id BIGINT REFERENCES tags_master(id),
    account_code VARCHAR(20) NOT NULL,
    account_name VARCHAR(100) NOT NULL,
    mapping_condition JSONB, -- 조건부 매핑 규칙
    is_default BOOLEAN DEFAULT false,
    priority INTEGER DEFAULT 50,
    confidence_boost DECIMAL(3,2) DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. 사용자 질문 테이블 (NEW)
CREATE TABLE user_questions (
    id BIGSERIAL PRIMARY KEY,
    trigger_conditions JSONB, -- 질문을 발생시키는 조건들
    question_text TEXT NOT NULL,
    question_type VARCHAR(20) DEFAULT 'SINGLE_CHOICE', -- SINGLE_CHOICE, MULTIPLE_CHOICE
    confidence_threshold DECIMAL(3,2) DEFAULT 0.85,
    is_active BOOLEAN DEFAULT true,
    usage_count BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. 질문 답변 옵션 테이블 (NEW)
CREATE TABLE question_options (
    id BIGSERIAL PRIMARY KEY,
    question_id BIGINT REFERENCES user_questions(id),
    option_text VARCHAR(200) NOT NULL,
    option_value JSONB, -- 선택시 적용할 값들
    selection_count BIGINT DEFAULT 0,
    display_order INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT true
);

-- 8. 거래 처리 로그 개선 (기존 transactions 테이블 확장)
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS keyword_extraction_result JSONB;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS tag_matching_result JSONB;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS confidence_scores JSONB;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS processing_path VARCHAR(50);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS user_question_id BIGINT REFERENCES user_questions(id);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS user_answer_option_id BIGINT REFERENCES question_options(id);

-- 9. 신뢰도 변경 이력 테이블 (NEW)
CREATE TABLE confidence_history (
    id BIGSERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL, -- 'REGEX_RULE', 'KEYWORD_GROUP', 'MAPPING'
    entity_id BIGINT NOT NULL,
    old_confidence DECIMAL(3,2),
    new_confidence DECIMAL(3,2),
    adjustment_reason VARCHAR(100),
    adjusted_by VARCHAR(50),
    transaction_id BIGINT REFERENCES transactions(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. LLM 생성 룰 후보 테이블 (NEW)
CREATE TABLE llm_rule_candidates (
    id BIGSERIAL PRIMARY KEY,
    transaction_samples TEXT[],
    suggested_pattern VARCHAR(500),
    suggested_keywords TEXT[],
    suggested_tag VARCHAR(100),
    suggested_account VARCHAR(100),
    occurrence_count INTEGER DEFAULT 1,
    confidence_estimate DECIMAL(3,2),
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    reviewed_by VARCHAR(50),
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 인덱스 최적화

```sql
-- keyword_groups 인덱스
CREATE INDEX idx_keyword_groups_category ON keyword_groups(category);
CREATE INDEX idx_keyword_groups_active ON keyword_groups(is_active);
CREATE INDEX idx_keyword_groups_synonyms ON keyword_groups USING GIN(synonyms);

-- tags_master 인덱스
CREATE INDEX idx_tags_master_category ON tags_master(tag_category);
CREATE INDEX idx_tags_master_active ON tags_master(is_active);
CREATE INDEX idx_tags_master_display_order ON tags_master(display_order);

-- keyword_tag_mappings 인덱스
CREATE INDEX idx_keyword_tag_mappings_keyword_group ON keyword_tag_mappings(keyword_group_id);
CREATE INDEX idx_keyword_tag_mappings_tag ON keyword_tag_mappings(tag_id);
CREATE INDEX idx_keyword_tag_mappings_active ON keyword_tag_mappings(is_active);
CREATE INDEX idx_keyword_tag_mappings_confidence ON keyword_tag_mappings(confidence_score DESC);

-- tag_account_mappings 인덱스
CREATE INDEX idx_tag_account_mappings_tag ON tag_account_mappings(tag_id);
CREATE INDEX idx_tag_account_mappings_account_code ON tag_account_mappings(account_code);
CREATE INDEX idx_tag_account_mappings_default ON tag_account_mappings(is_default);

-- user_questions 인덱스
CREATE INDEX idx_user_questions_active ON user_questions(is_active);
CREATE INDEX idx_user_questions_type ON user_questions(question_type);

-- confidence_history 인덱스
CREATE INDEX idx_confidence_history_entity ON confidence_history(entity_type, entity_id);
CREATE INDEX idx_confidence_history_created ON confidence_history(created_at DESC);

-- llm_rule_candidates 인덱스
CREATE INDEX idx_llm_rule_candidates_status ON llm_rule_candidates(status);
CREATE INDEX idx_llm_rule_candidates_occurrence ON llm_rule_candidates(occurrence_count DESC);
```

## 데이터 마이그레이션 전략

### Phase 1: 기존 데이터 보존
1. 현재 `regex_rules` 테이블의 모든 데이터 백업
2. 신규 테이블들 생성
3. 기존 `regex_rules`의 태그 데이터를 `tags_master`로 이관
4. 기존 계정과목 데이터를 `tag_account_mappings`로 이관

### Phase 2: 데이터 정규화
1. 중복된 태그들 통합
2. 키워드 그룹 생성 (유사한 키워드들 그룹화)
3. 기존 성능 데이터 (`usage_count`, `success_rate`) 보존

### Phase 3: 점진적 전환
1. 기존 시스템 유지하면서 신규 시스템 병렬 구동
2. A/B 테스트를 통한 성능 비교
3. 데이터 검증 완료 후 완전 전환

## Prisma 스키마 업데이트 계획

```prisma
// 새로운 모델들 추가
model KeywordGroup {
  id              BigInt   @id @default(autoincrement())
  groupName       String   @map("group_name") @db.VarChar(100)
  primaryKeyword  String   @map("primary_keyword") @db.VarChar(100)
  synonyms        String[] @db.VarChar(50)
  category        String?  @db.VarChar(50)
  confidenceBase  Decimal  @default(0.70) @map("confidence_base") @db.Decimal(3,2)
  isActive        Boolean  @default(true) @map("is_active")
  createdAt       DateTime @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt       DateTime @default(now()) @updatedAt @map("updated_at") @db.Timestamptz(6)
  
  keywordTagMappings KeywordTagMapping[]
  
  @@index([category])
  @@index([isActive])
  @@map("keyword_groups")
}

model TagsMaster {
  id           BigInt   @id @default(autoincrement())
  tagName      String   @unique @map("tag_name") @db.VarChar(100)
  tagCategory  String?  @map("tag_category") @db.VarChar(50)
  description  String?
  colorHex     String   @default("#6B7280") @map("color_hex") @db.VarChar(7)
  iconName     String   @default("tag") @map("icon_name") @db.VarChar(50)
  displayOrder Int      @default(100) @map("display_order")
  isActive     Boolean  @default(true) @map("is_active")
  createdAt    DateTime @default(now()) @map("created_at") @db.Timestamptz(6)
  
  keywordTagMappings KeywordTagMapping[]
  tagAccountMappings TagAccountMapping[]
  
  @@index([tagCategory])
  @@index([isActive])
  @@index([displayOrder])
  @@map("tags_master")
}

model KeywordTagMapping {
  id               BigInt       @id @default(autoincrement())
  keywordGroupId   BigInt       @map("keyword_group_id")
  tagId            BigInt       @map("tag_id")
  confidenceScore  Decimal      @default(0.70) @map("confidence_score") @db.Decimal(3,2)
  contextRules     Json?        @map("context_rules")
  priority         Int          @default(50)
  usageCount       BigInt       @default(0) @map("usage_count")
  isActive         Boolean      @default(true) @map("is_active")
  createdAt        DateTime     @default(now()) @map("created_at") @db.Timestamptz(6)
  
  keywordGroup     KeywordGroup @relation(fields: [keywordGroupId], references: [id])
  tag              TagsMaster   @relation(fields: [tagId], references: [id])
  
  @@unique([keywordGroupId, tagId])
  @@index([keywordGroupId])
  @@index([tagId])
  @@index([isActive])
  @@map("keyword_tag_mappings")
}

// 기존 regex_rules 모델 확장
model regex_rules {
  // ... 기존 필드들 유지 ...
  
  // 신규 필드들 추가
  contextRules        Json?    @map("context_rules")
  displayOrder        Int?     @default(100) @map("display_order")
  parentKeywordGroupId BigInt? @map("parent_keyword_group_id")
  
  // ... 기존 인덱스들 유지 ...
  @@index([parentKeywordGroupId])
}
```

## 마이그레이션 스크립트 예시

```sql
-- 1. 기존 태그들을 tags_master로 이관
INSERT INTO tags_master (tag_name, tag_category, created_at)
SELECT DISTINCT 
  primary_tag as tag_name,
  category as tag_category,
  NOW() as created_at
FROM regex_rules 
WHERE primary_tag IS NOT NULL AND primary_tag != ''
ON CONFLICT (tag_name) DO NOTHING;

-- 2. 기존 키워드들을 keyword_groups로 이관
INSERT INTO keyword_groups (group_name, primary_keyword, category, created_at)
SELECT DISTINCT
  keyword as group_name,
  keyword as primary_keyword,
  category,
  NOW() as created_at
FROM regex_rules 
WHERE pattern_type = 'KEYWORD' AND keyword IS NOT NULL
ON CONFLICT DO NOTHING;

-- 3. 키워드-태그 매핑 생성
INSERT INTO keyword_tag_mappings (keyword_group_id, tag_id, confidence_score, usage_count)
SELECT 
  kg.id as keyword_group_id,
  tm.id as tag_id,
  rr.confidence,
  rr.usage_count
FROM regex_rules rr
JOIN keyword_groups kg ON kg.primary_keyword = rr.keyword
JOIN tags_master tm ON tm.tag_name = rr.primary_tag
WHERE rr.pattern_type = 'KEYWORD'
  AND rr.primary_tag IS NOT NULL;
```

## 성능 최적화 고려사항

### 1. 캐싱 전략
- **Redis 캐시 키 구조**:
  - `keyword_groups:all` - 모든 키워드 그룹
  - `tags:category:{category}` - 카테고리별 태그
  - `mappings:keyword:{keyword_id}` - 키워드별 태그 매핑

### 2. 쿼리 최적화
- 조인 쿼리 최소화를 위한 비정규화 고려
- 자주 사용되는 매핑의 별도 캐시 테이블
- 통계 정보의 정기적 업데이트

### 3. 확장성 대비
- 파티셔닝 전략 (월별, 카테고리별)
- 읽기 전용 복제본 활용
- 배치 작업의 비동기 처리

## 리스크 및 대응 방안

### 1. 데이터 무결성 리스크
- **대응**: 마이그레이션 전 완전한 백업 + 롤백 계획
- **검증**: 마이그레이션 후 데이터 건수 및 샘플 비교

### 2. 성능 저하 리스크  
- **대응**: 충분한 로드 테스트 + 단계적 배포
- **모니터링**: 쿼리 실행 시간 및 캐시 히트율 추적

### 3. 호환성 리스크
- **대응**: 기존 API 엔드포인트 유지 + 점진적 전환
- **버전 관리**: API 버전별 분리 운영

---

이 설계안은 기존 시스템의 안정성을 유지하면서 새로운 키워드 기반 시스템의 모든 요구사항을 만족하도록 구성되었습니다.