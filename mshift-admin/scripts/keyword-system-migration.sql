-- 키워드 기반 거래 태깅 시스템 마이그레이션 스크립트
-- 실행 전 반드시 데이터베이스 백업을 진행하세요!

-- ===========================================================================
-- STEP 1: 신규 테이블 생성
-- ===========================================================================

-- 키워드 그룹 테이블
CREATE TABLE IF NOT EXISTS keyword_groups (
    id BIGSERIAL PRIMARY KEY,
    group_name VARCHAR(100) NOT NULL,
    primary_keyword VARCHAR(100) NOT NULL,
    synonyms VARCHAR(50)[] DEFAULT '{}',
    category VARCHAR(50),
    confidence_base DECIMAL(3,2) DEFAULT 0.70,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP
);

-- 태그 마스터 테이블
CREATE TABLE IF NOT EXISTS tags_master (
    id BIGSERIAL PRIMARY KEY,
    tag_name VARCHAR(100) NOT NULL UNIQUE,
    tag_category VARCHAR(50),
    description TEXT,
    color_hex VARCHAR(7) DEFAULT '#6B7280',
    icon_name VARCHAR(50) DEFAULT 'tag',
    display_order INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP
);

-- 키워드 그룹-태그 매핑 테이블
CREATE TABLE IF NOT EXISTS keyword_tag_mappings (
    id BIGSERIAL PRIMARY KEY,
    keyword_group_id BIGINT REFERENCES keyword_groups(id) ON DELETE CASCADE,
    tag_id BIGINT REFERENCES tags_master(id) ON DELETE CASCADE,
    confidence_score DECIMAL(3,2) DEFAULT 0.70,
    context_rules JSONB,
    priority INTEGER DEFAULT 50,
    usage_count BIGINT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(keyword_group_id, tag_id)
);

-- 태그-계정과목 매핑 테이블
CREATE TABLE IF NOT EXISTS tag_account_mappings (
    id BIGSERIAL PRIMARY KEY,
    tag_id BIGINT REFERENCES tags_master(id) ON DELETE CASCADE,
    account_code VARCHAR(20) NOT NULL,
    account_name VARCHAR(100) NOT NULL,
    mapping_condition JSONB,
    is_default BOOLEAN DEFAULT false,
    priority INTEGER DEFAULT 50,
    confidence_boost DECIMAL(3,2) DEFAULT 0.0,
    created_at TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP
);

-- 사용자 질문 테이블
CREATE TABLE IF NOT EXISTS user_questions (
    id BIGSERIAL PRIMARY KEY,
    trigger_tag_id BIGINT REFERENCES tags_master(id),
    trigger_conditions JSONB NOT NULL,
    question_text TEXT NOT NULL,
    question_type VARCHAR(20) DEFAULT 'SINGLE_CHOICE',
    confidence_threshold DECIMAL(3,2) DEFAULT 0.85,
    is_active BOOLEAN DEFAULT true,
    usage_count BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP
);

-- 질문 답변 옵션 테이블
CREATE TABLE IF NOT EXISTS question_options (
    id BIGSERIAL PRIMARY KEY,
    question_id BIGINT REFERENCES user_questions(id) ON DELETE CASCADE,
    option_text VARCHAR(200) NOT NULL,
    option_value JSONB NOT NULL,
    selection_count BIGINT DEFAULT 0,
    display_order INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT true
);

-- 신뢰도 변경 이력 테이블
CREATE TABLE IF NOT EXISTS confidence_history (
    id BIGSERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT NOT NULL,
    old_confidence DECIMAL(3,2),
    new_confidence DECIMAL(3,2) NOT NULL,
    adjustment_reason VARCHAR(100),
    adjusted_by VARCHAR(50),
    transaction_id BIGINT REFERENCES transactions(id),
    created_at TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP
);

-- LLM 생성 룰 후보 테이블
CREATE TABLE IF NOT EXISTS llm_rule_candidates (
    id BIGSERIAL PRIMARY KEY,
    transaction_samples TEXT[] DEFAULT '{}',
    suggested_pattern VARCHAR(500),
    suggested_keywords TEXT[] DEFAULT '{}',
    suggested_tag VARCHAR(100),
    suggested_account VARCHAR(100),
    occurrence_count INTEGER DEFAULT 1,
    confidence_estimate DECIMAL(3,2),
    status VARCHAR(20) DEFAULT 'PENDING',
    reviewed_by VARCHAR(50),
    reviewed_at TIMESTAMPTZ(6),
    created_at TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================================================
-- STEP 2: 기존 regex_rules 테이블에 신규 컬럼 추가
-- ===========================================================================

-- regex_rules 테이블에 신규 필드 추가
ALTER TABLE regex_rules 
ADD COLUMN IF NOT EXISTS context_rules JSONB,
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS parent_keyword_group_id BIGINT;

-- transactions 테이블에 신규 필드 추가
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS keyword_extraction_result JSONB,
ADD COLUMN IF NOT EXISTS tag_matching_result JSONB,
ADD COLUMN IF NOT EXISTS confidence_scores JSONB,
ADD COLUMN IF NOT EXISTS processing_path VARCHAR(50),
ADD COLUMN IF NOT EXISTS user_question_id BIGINT REFERENCES user_questions(id),
ADD COLUMN IF NOT EXISTS user_answer_option_id BIGINT REFERENCES question_options(id);

-- ===========================================================================
-- STEP 3: 인덱스 생성
-- ===========================================================================

-- keyword_groups 인덱스
CREATE INDEX IF NOT EXISTS idx_keyword_groups_category ON keyword_groups(category);
CREATE INDEX IF NOT EXISTS idx_keyword_groups_active ON keyword_groups(is_active);
CREATE INDEX IF NOT EXISTS idx_keyword_groups_primary_keyword ON keyword_groups(primary_keyword);

-- tags_master 인덱스
CREATE INDEX IF NOT EXISTS idx_tags_master_category ON tags_master(tag_category);
CREATE INDEX IF NOT EXISTS idx_tags_master_active ON tags_master(is_active);
CREATE INDEX IF NOT EXISTS idx_tags_master_display_order ON tags_master(display_order);

-- keyword_tag_mappings 인덱스
CREATE INDEX IF NOT EXISTS idx_keyword_tag_mappings_keyword_group ON keyword_tag_mappings(keyword_group_id);
CREATE INDEX IF NOT EXISTS idx_keyword_tag_mappings_tag ON keyword_tag_mappings(tag_id);
CREATE INDEX IF NOT EXISTS idx_keyword_tag_mappings_active ON keyword_tag_mappings(is_active);
CREATE INDEX IF NOT EXISTS idx_keyword_tag_mappings_confidence ON keyword_tag_mappings(confidence_score DESC);

-- tag_account_mappings 인덱스
CREATE INDEX IF NOT EXISTS idx_tag_account_mappings_tag ON tag_account_mappings(tag_id);
CREATE INDEX IF NOT EXISTS idx_tag_account_mappings_account_code ON tag_account_mappings(account_code);
CREATE INDEX IF NOT EXISTS idx_tag_account_mappings_default ON tag_account_mappings(is_default);

-- user_questions 인덱스
CREATE INDEX IF NOT EXISTS idx_user_questions_trigger_tag ON user_questions(trigger_tag_id);
CREATE INDEX IF NOT EXISTS idx_user_questions_active ON user_questions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_questions_type ON user_questions(question_type);

-- question_options 인덱스
CREATE INDEX IF NOT EXISTS idx_question_options_question ON question_options(question_id);
CREATE INDEX IF NOT EXISTS idx_question_options_display_order ON question_options(display_order);

-- confidence_history 인덱스
CREATE INDEX IF NOT EXISTS idx_confidence_history_entity ON confidence_history(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_confidence_history_created ON confidence_history(created_at DESC);

-- llm_rule_candidates 인덱스
CREATE INDEX IF NOT EXISTS idx_llm_rule_candidates_status ON llm_rule_candidates(status);
CREATE INDEX IF NOT EXISTS idx_llm_rule_candidates_occurrence ON llm_rule_candidates(occurrence_count DESC);
CREATE INDEX IF NOT EXISTS idx_llm_rule_candidates_created ON llm_rule_candidates(created_at DESC);

-- regex_rules 신규 인덱스
CREATE INDEX IF NOT EXISTS idx_regex_rules_parent_keyword_group ON regex_rules(parent_keyword_group_id);
CREATE INDEX IF NOT EXISTS idx_regex_rules_display_order ON regex_rules(display_order);

-- transactions 신규 인덱스
CREATE INDEX IF NOT EXISTS idx_transactions_user_question ON transactions(user_question_id);
CREATE INDEX IF NOT EXISTS idx_transactions_processing_path ON transactions(processing_path);

-- ===========================================================================
-- STEP 4: 기존 데이터 마이그레이션
-- ===========================================================================

-- 4.1 기존 태그들을 tags_master로 이관 (중복 처리 개선)
WITH unique_tags AS (
    SELECT DISTINCT 
        TRIM(primary_tag) as tag_name,
        category as tag_category,
        MIN(created_at) as created_at
    FROM regex_rules 
    WHERE primary_tag IS NOT NULL 
      AND TRIM(primary_tag) != ''
    GROUP BY TRIM(primary_tag), category
    
    UNION
    
    SELECT DISTINCT 
        TRIM(secondary_tag) as tag_name,
        category as tag_category,
        MIN(created_at) as created_at
    FROM regex_rules 
    WHERE secondary_tag IS NOT NULL 
      AND TRIM(secondary_tag) != ''
    GROUP BY TRIM(secondary_tag), category
)
INSERT INTO tags_master (tag_name, tag_category, created_at)
SELECT 
    tag_name,
    tag_category,
    COALESCE(created_at, CURRENT_TIMESTAMP) as created_at
FROM unique_tags
WHERE tag_name NOT IN (SELECT tag_name FROM tags_master)
ON CONFLICT (tag_name) DO NOTHING;

-- 4.2 키워드 패턴들을 keyword_groups로 이관
INSERT INTO keyword_groups (group_name, primary_keyword, category, confidence_base, created_at)
SELECT DISTINCT
    keyword as group_name,
    keyword as primary_keyword,
    category,
    COALESCE(confidence, 0.70) as confidence_base,
    COALESCE(created_at, CURRENT_TIMESTAMP) as created_at
FROM regex_rules 
WHERE pattern_type = 'KEYWORD' 
  AND keyword IS NOT NULL 
  AND keyword != ''
  AND keyword NOT IN (SELECT primary_keyword FROM keyword_groups)
ORDER BY keyword;

-- 4.3 키워드-태그 매핑 생성 (primary_tag)
INSERT INTO keyword_tag_mappings (keyword_group_id, tag_id, confidence_score, usage_count, created_at)
SELECT 
    kg.id as keyword_group_id,
    tm.id as tag_id,
    COALESCE(rr.confidence, 0.70) as confidence_score,
    COALESCE(rr.usage_count, 0) as usage_count,
    COALESCE(rr.created_at, CURRENT_TIMESTAMP) as created_at
FROM regex_rules rr
JOIN keyword_groups kg ON kg.primary_keyword = rr.keyword
JOIN tags_master tm ON tm.tag_name = rr.primary_tag
WHERE rr.pattern_type = 'KEYWORD'
  AND rr.primary_tag IS NOT NULL
  AND rr.primary_tag != ''
ON CONFLICT (keyword_group_id, tag_id) DO NOTHING;

-- 4.4 키워드-태그 매핑 생성 (secondary_tag)
INSERT INTO keyword_tag_mappings (keyword_group_id, tag_id, confidence_score, usage_count, priority, created_at)
SELECT 
    kg.id as keyword_group_id,
    tm.id as tag_id,
    COALESCE(rr.confidence, 0.70) * 0.8 as confidence_score, -- secondary는 20% 낮은 신뢰도
    COALESCE(rr.usage_count, 0) as usage_count,
    40 as priority, -- secondary는 낮은 우선순위
    COALESCE(rr.created_at, CURRENT_TIMESTAMP) as created_at
FROM regex_rules rr
JOIN keyword_groups kg ON kg.primary_keyword = rr.keyword
JOIN tags_master tm ON tm.tag_name = rr.secondary_tag
WHERE rr.pattern_type = 'KEYWORD'
  AND rr.secondary_tag IS NOT NULL
  AND rr.secondary_tag != ''
ON CONFLICT (keyword_group_id, tag_id) DO NOTHING;

-- 4.5 태그-계정과목 매핑 생성 (primary)
INSERT INTO tag_account_mappings (tag_id, account_code, account_name, is_default, priority, created_at)
SELECT DISTINCT
    tm.id as tag_id,
    COALESCE(rr.primary_account, '미분류') as account_code,
    COALESCE(rr.primary_account, '미분류') as account_name,
    true as is_default,
    60 as priority,
    COALESCE(MIN(rr.created_at), CURRENT_TIMESTAMP) as created_at
FROM regex_rules rr
JOIN tags_master tm ON tm.tag_name = rr.primary_tag
WHERE rr.primary_account IS NOT NULL 
  AND rr.primary_account != ''
GROUP BY tm.id, rr.primary_account
ON CONFLICT DO NOTHING;

-- 4.6 태그-계정과목 매핑 생성 (secondary)
INSERT INTO tag_account_mappings (tag_id, account_code, account_name, is_default, priority, created_at)
SELECT DISTINCT
    tm.id as tag_id,
    COALESCE(rr.secondary_account, '미분류') as account_code,
    COALESCE(rr.secondary_account, '미분류') as account_name,
    false as is_default,
    40 as priority,
    COALESCE(MIN(rr.created_at), CURRENT_TIMESTAMP) as created_at
FROM regex_rules rr
JOIN tags_master tm ON tm.tag_name = rr.secondary_tag
WHERE rr.secondary_account IS NOT NULL 
  AND rr.secondary_account != ''
  AND NOT EXISTS (
    SELECT 1 FROM tag_account_mappings tam 
    WHERE tam.tag_id = tm.id AND tam.account_code = rr.secondary_account
  )
GROUP BY tm.id, rr.secondary_account;

-- ===========================================================================
-- STEP 5: 기본 사용자 질문 데이터 생성
-- ===========================================================================

-- 회식 관련 질문 생성
DO $$
DECLARE
    tag_id_var BIGINT;
    question_id_var BIGINT;
BEGIN
    -- #회식 태그 찾기 (없으면 생성)
    SELECT id INTO tag_id_var FROM tags_master WHERE tag_name = '#회식';
    
    IF tag_id_var IS NULL THEN
        INSERT INTO tags_master (tag_name, tag_category, description)
        VALUES ('#회식', '식사', '회사 회식 관련 지출')
        RETURNING id INTO tag_id_var;
    END IF;
    
    -- 질문 생성
    INSERT INTO user_questions (
        trigger_tag_id, 
        trigger_conditions, 
        question_text, 
        confidence_threshold
    ) VALUES (
        tag_id_var,
        '{"keywords": ["회식", "회사저녁", "팀저녁"], "confidence_max": 0.85}',
        '이 거래는 어떤 목적의 식사였나요?',
        0.85
    ) RETURNING id INTO question_id_var;
    
    -- 답변 옵션들 생성
    INSERT INTO question_options (question_id, option_text, option_value, display_order) VALUES
    (question_id_var, '직원 회식', '{"account_code": "5201", "account_name": "복리후생비", "confidence_boost": 0.15}', 1),
    (question_id_var, '거래처 접대', '{"account_code": "5101", "account_name": "접대비", "confidence_boost": 0.15}', 2),
    (question_id_var, '부서 회의', '{"account_code": "5401", "account_name": "회의비", "confidence_boost": 0.15}', 3),
    (question_id_var, '기타', '{"account_code": "5901", "account_name": "기타비용", "confidence_boost": 0.05}', 4);
END $$;

-- 카페 관련 질문 생성
DO $$
DECLARE
    tag_id_var BIGINT;
    question_id_var BIGINT;
BEGIN
    -- #카페 태그 찾기 (없으면 생성)
    SELECT id INTO tag_id_var FROM tags_master WHERE tag_name = '#카페';
    
    IF tag_id_var IS NULL THEN
        INSERT INTO tags_master (tag_name, tag_category, description)
        VALUES ('#카페', '음료', '커피전문점 및 카페 이용')
        RETURNING id INTO tag_id_var;
    END IF;
    
    -- 질문 생성
    INSERT INTO user_questions (
        trigger_tag_id, 
        trigger_conditions, 
        question_text, 
        confidence_threshold
    ) VALUES (
        tag_id_var,
        '{"amount_min": 20000, "confidence_max": 0.80}',
        '이 커피 구매는 어떤 목적이었나요?',
        0.80
    ) RETURNING id INTO question_id_var;
    
    -- 답변 옵션들 생성
    INSERT INTO question_options (question_id, option_text, option_value, display_order) VALUES
    (question_id_var, '회의용', '{"account_code": "5401", "account_name": "회의비", "confidence_boost": 0.10}', 1),
    (question_id_var, '개인용', '{"account_code": "5201", "account_name": "복리후생비", "confidence_boost": 0.10}', 2),
    (question_id_var, '접대용', '{"account_code": "5101", "account_name": "접대비", "confidence_boost": 0.10}', 3);
END $$;

-- ===========================================================================
-- STEP 6: 데이터 검증
-- ===========================================================================

-- 마이그레이션 결과 요약
SELECT 
    'regex_rules' as table_name,
    COUNT(*) as total_count,
    COUNT(CASE WHEN pattern_type = 'KEYWORD' THEN 1 END) as keyword_rules,
    COUNT(CASE WHEN pattern_type = 'BRAND' THEN 1 END) as brand_rules
FROM regex_rules
UNION ALL
SELECT 'keyword_groups', COUNT(*), NULL, NULL FROM keyword_groups
UNION ALL
SELECT 'tags_master', COUNT(*), NULL, NULL FROM tags_master
UNION ALL
SELECT 'keyword_tag_mappings', COUNT(*), NULL, NULL FROM keyword_tag_mappings
UNION ALL
SELECT 'tag_account_mappings', COUNT(*), NULL, NULL FROM tag_account_mappings
UNION ALL
SELECT 'user_questions', COUNT(*), NULL, NULL FROM user_questions
UNION ALL
SELECT 'question_options', COUNT(*), NULL, NULL FROM question_options;

-- 마이그레이션 검증 쿼리
SELECT 
    '=== 마이그레이션 검증 결과 ===' as status,
    NOW() as completed_at;

-- 마이그레이션 완료 로그
INSERT INTO confidence_history (
    entity_type, 
    entity_id, 
    new_confidence, 
    adjustment_reason, 
    adjusted_by
) VALUES (
    'SYSTEM',
    0,
    1.0,
    'Keyword system migration completed successfully',
    'MIGRATION_SCRIPT'
);