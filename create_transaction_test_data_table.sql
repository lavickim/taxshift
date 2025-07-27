-- 거래 테스트 데이터 테이블 생성
-- MoneyShift 시스템의 파이프라인 테스트를 위한 완전한 테스트 데이터 관리 시스템

-- 1. 거래 테스트 데이터 메인 테이블
CREATE TABLE IF NOT EXISTS transaction_test_data (
    id BIGSERIAL PRIMARY KEY,
    
    -- 기본 거래 정보
    transaction_text TEXT NOT NULL,                     -- 원본 거래 문자열
    amount DECIMAL(15,2) NOT NULL,                      -- 거래 금액
    transaction_date DATE NOT NULL,                     -- 거래 일자
    source_type VARCHAR(20) NOT NULL CHECK (source_type IN ('BANK', 'CARD', 'CASH', 'TRANSFER', 'OTHER')),
    
    -- 예상 결과 (기대값)
    expected_category VARCHAR(100),                     -- 예상 카테고리
    expected_account_code VARCHAR(10),                  -- 예상 계정코드
    expected_description TEXT,                          -- 예상 거래 설명
    expected_company_name VARCHAR(200),                 -- 예상 업체명
    expected_keywords TEXT[],                           -- 예상 키워드 배열
    
    -- 실제 처리 결과
    actual_result JSONB,                               -- 실제 파이프라인 처리 결과 (JSON)
    processing_layers JSONB,                           -- 각 레이어별 처리 결과
    
    -- 테스트 메타데이터
    test_status VARCHAR(20) DEFAULT 'PENDING' CHECK (test_status IN ('PENDING', 'PASSED', 'FAILED', 'PARTIAL', 'SKIPPED')),
    test_confidence DECIMAL(5,2),                      -- 테스트 신뢰도 (0-100%)
    success_rate DECIMAL(5,2),                         -- 성공률
    
    -- 분류 및 태그
    test_category VARCHAR(50),                         -- 테스트 카테고리 (음식점, 쇼핑, 교통 등)
    test_tags TEXT[],                                  -- 테스트 태그
    business_type VARCHAR(50),                         -- 업종 분류
    region VARCHAR(50),                                -- 지역
    
    -- 메모 및 설명
    notes TEXT,                                        -- 테스트 노트
    failure_reason TEXT,                               -- 실패 사유
    improvement_suggestions TEXT,                      -- 개선 제안
    
    -- 시스템 메타데이터
    is_active BOOLEAN DEFAULT true,                    -- 활성 상태
    difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5), -- 난이도 (1=쉬움, 5=어려움)
    is_real_data BOOLEAN DEFAULT false,                -- 실제 데이터 여부
    
    -- 타임스탬프
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_tested_at TIMESTAMP,
    
    -- 버전 관리
    data_version VARCHAR(20) DEFAULT 'v1.0',          -- 데이터 버전
    schema_version VARCHAR(20) DEFAULT 'v1.0'         -- 스키마 버전
);

-- 2. 테스트 실행 이력 테이블
CREATE TABLE IF NOT EXISTS transaction_test_execution_history (
    id BIGSERIAL PRIMARY KEY,
    test_data_id BIGINT NOT NULL REFERENCES transaction_test_data(id) ON DELETE CASCADE,
    
    -- 실행 정보
    execution_id VARCHAR(50) NOT NULL,                 -- 실행 배치 ID
    execution_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    execution_type VARCHAR(30) DEFAULT 'MANUAL' CHECK (execution_type IN ('MANUAL', 'AUTOMATED', 'BATCH', 'SCHEDULED')),
    
    -- 결과 데이터
    test_result VARCHAR(20) NOT NULL CHECK (test_result IN ('PASSED', 'FAILED', 'PARTIAL', 'ERROR')),
    processing_time_ms INTEGER,                        -- 처리 시간 (밀리초)
    layer_results JSONB,                              -- 각 레이어별 결과
    final_output JSONB,                               -- 최종 출력 결과
    
    -- 성능 메트릭
    regex_match_time_ms INTEGER,                       -- 정규식 매칭 시간
    keyword_extraction_time_ms INTEGER,                -- 키워드 추출 시간
    classification_time_ms INTEGER,                    -- 분류 처리 시간
    cache_hit BOOLEAN DEFAULT false,                   -- 캐시 히트 여부
    
    -- 오류 정보
    error_message TEXT,                                -- 오류 메시지
    error_stack_trace TEXT,                           -- 오류 스택 트레이스
    error_layer VARCHAR(50),                          -- 오류 발생 레이어
    
    -- 비교 결과
    accuracy_score DECIMAL(5,2),                      -- 정확도 점수
    similarity_score DECIMAL(5,2),                    -- 유사도 점수
    category_match BOOLEAN,                           -- 카테고리 일치 여부
    account_code_match BOOLEAN,                       -- 계정코드 일치 여부
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. 테스트 배치 관리 테이블
CREATE TABLE IF NOT EXISTS transaction_test_batches (
    id BIGSERIAL PRIMARY KEY,
    batch_name VARCHAR(100) NOT NULL,
    batch_description TEXT,
    
    -- 배치 설정
    total_test_count INTEGER NOT NULL,
    passed_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    
    -- 성능 통계
    total_execution_time_ms BIGINT,
    avg_processing_time_ms DECIMAL(10,2),
    min_processing_time_ms INTEGER,
    max_processing_time_ms INTEGER,
    
    -- 정확도 통계
    overall_accuracy DECIMAL(5,2),
    category_accuracy DECIMAL(5,2),
    account_code_accuracy DECIMAL(5,2),
    keyword_accuracy DECIMAL(5,2),
    
    -- 레이어별 성능
    layer0_cache_hit_rate DECIMAL(5,2),               -- Redis 캐시 히트율
    layer1_regex_success_rate DECIMAL(5,2),           -- 정규식 성공률
    layer2_ml_usage_rate DECIMAL(5,2),                -- ML 사용률
    layer3_llm_usage_rate DECIMAL(5,2),               -- LLM 사용률
    
    -- 배치 상태
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED')),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    
    -- 메타데이터
    config_snapshot JSONB,                            -- 실행 당시 설정 스냅샷
    environment VARCHAR(20) DEFAULT 'DEV',            -- 실행 환경
    executed_by VARCHAR(100),                         -- 실행자
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_transaction_test_data_source_type ON transaction_test_data(source_type);
CREATE INDEX IF NOT EXISTS idx_transaction_test_data_test_status ON transaction_test_data(test_status);
CREATE INDEX IF NOT EXISTS idx_transaction_test_data_test_category ON transaction_test_data(test_category);
CREATE INDEX IF NOT EXISTS idx_transaction_test_data_business_type ON transaction_test_data(business_type);
CREATE INDEX IF NOT EXISTS idx_transaction_test_data_is_active ON transaction_test_data(is_active);
CREATE INDEX IF NOT EXISTS idx_transaction_test_data_difficulty ON transaction_test_data(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_transaction_test_data_amount ON transaction_test_data(amount);
CREATE INDEX IF NOT EXISTS idx_transaction_test_data_date ON transaction_test_data(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transaction_test_data_created ON transaction_test_data(created_at);

-- 실행 이력 인덱스
CREATE INDEX IF NOT EXISTS idx_test_execution_history_test_id ON transaction_test_execution_history(test_data_id);
CREATE INDEX IF NOT EXISTS idx_test_execution_history_execution_id ON transaction_test_execution_history(execution_id);
CREATE INDEX IF NOT EXISTS idx_test_execution_history_result ON transaction_test_execution_history(test_result);
CREATE INDEX IF NOT EXISTS idx_test_execution_history_timestamp ON transaction_test_execution_history(execution_timestamp);

-- 배치 인덱스
CREATE INDEX IF NOT EXISTS idx_test_batches_status ON transaction_test_batches(status);
CREATE INDEX IF NOT EXISTS idx_test_batches_created ON transaction_test_batches(created_at);

-- 5. 복합 인덱스 (자주 사용되는 쿼리 최적화)
CREATE INDEX IF NOT EXISTS idx_transaction_test_data_active_category ON transaction_test_data(is_active, test_category) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_transaction_test_data_status_difficulty ON transaction_test_data(test_status, difficulty_level);
CREATE INDEX IF NOT EXISTS idx_test_execution_history_result_time ON transaction_test_execution_history(test_result, execution_timestamp);

-- 6. 함수: 테스트 실행 통계 조회
CREATE OR REPLACE FUNCTION get_test_statistics(
    start_date DATE DEFAULT NULL,
    end_date DATE DEFAULT NULL,
    test_category VARCHAR DEFAULT NULL
)
RETURNS TABLE (
    total_tests BIGINT,
    passed_tests BIGINT,
    failed_tests BIGINT,
    avg_accuracy DECIMAL,
    avg_processing_time DECIMAL,
    cache_hit_rate DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_tests,
        SUM(CASE WHEN teh.test_result = 'PASSED' THEN 1 ELSE 0 END) as passed_tests,
        SUM(CASE WHEN teh.test_result = 'FAILED' THEN 1 ELSE 0 END) as failed_tests,
        AVG(teh.accuracy_score) as avg_accuracy,
        AVG(teh.processing_time_ms::DECIMAL) as avg_processing_time,
        AVG(CASE WHEN teh.cache_hit THEN 100 ELSE 0 END) as cache_hit_rate
    FROM transaction_test_execution_history teh
    JOIN transaction_test_data ttd ON teh.test_data_id = ttd.id
    WHERE 
        (start_date IS NULL OR teh.execution_timestamp::DATE >= start_date)
        AND (end_date IS NULL OR teh.execution_timestamp::DATE <= end_date)
        AND (test_category IS NULL OR ttd.test_category = test_category)
        AND ttd.is_active = true;
END;
$$ LANGUAGE plpgsql;

-- 7. 함수: 실패 케이스 분석
CREATE OR REPLACE FUNCTION analyze_failure_patterns()
RETURNS TABLE (
    failure_category VARCHAR,
    failure_count BIGINT,
    common_patterns TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ttd.test_category as failure_category,
        COUNT(*) as failure_count,
        array_agg(DISTINCT ttd.failure_reason) as common_patterns
    FROM transaction_test_data ttd
    WHERE ttd.test_status = 'FAILED' 
      AND ttd.is_active = true
    GROUP BY ttd.test_category
    ORDER BY failure_count DESC;
END;
$$ LANGUAGE plpgsql;

-- 8. 트리거: 자동 업데이트 타임스탬프
CREATE OR REPLACE FUNCTION update_transaction_test_data_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_transaction_test_data_timestamp
    BEFORE UPDATE ON transaction_test_data
    FOR EACH ROW
    EXECUTE FUNCTION update_transaction_test_data_timestamp();

-- 완료 메시지
SELECT 'Transaction Test Data System 테이블 생성 완료!' as message,
       'Tables: transaction_test_data, transaction_test_execution_history, transaction_test_batches' as created_tables,
       'Functions: get_test_statistics(), analyze_failure_patterns()' as created_functions;