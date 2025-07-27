-- MoneyShift 테스트 배치 실행 테이블 생성
-- 파이프라인 테스트 실행 이력과 결과를 추적하는 테이블

CREATE TABLE IF NOT EXISTS test_batch_execution (
    id BIGSERIAL PRIMARY KEY,
    batch_name VARCHAR(255) NOT NULL,
    test_data_count INTEGER NOT NULL DEFAULT 0,
    execution_status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (execution_status IN ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED')),
    start_time TIMESTAMP NOT NULL DEFAULT NOW(),
    end_time TIMESTAMP,
    total_processing_time_ms BIGINT,
    
    -- 테스트 결과 통계
    passed_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0.00, -- 백분율 (0.00 ~ 100.00)
    average_score DECIMAL(5,4) DEFAULT 0.0000, -- 평균 점수 (0.0000 ~ 1.0000)
    
    -- 4레이어 파이프라인 성능 분석
    layer_0_hits INTEGER DEFAULT 0, -- Redis 캐시 히트
    layer_1_hits INTEGER DEFAULT 0, -- Regex 패턴 매칭
    layer_2_hits INTEGER DEFAULT 0, -- ML 추론
    layer_3_hits INTEGER DEFAULT 0, -- LLM 처리
    
    -- JSON 형태 상세 결과
    layer_performance JSONB, -- 레이어별 상세 성능 데이터
    error_patterns JSONB, -- 오류 패턴 분석 결과
    improvement_suggestions TEXT[], -- 개선 제안 사항
    
    -- 메타데이터
    execution_notes TEXT,
    created_by VARCHAR(100) DEFAULT 'system',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_test_batch_execution_status ON test_batch_execution(execution_status);
CREATE INDEX IF NOT EXISTS idx_test_batch_execution_start_time ON test_batch_execution(start_time DESC);
CREATE INDEX IF NOT EXISTS idx_test_batch_execution_created_by ON test_batch_execution(created_by);
CREATE INDEX IF NOT EXISTS idx_test_batch_execution_batch_name ON test_batch_execution(batch_name);

-- 트리거 함수: updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_test_batch_execution_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
DROP TRIGGER IF EXISTS trigger_update_test_batch_execution_updated_at ON test_batch_execution;
CREATE TRIGGER trigger_update_test_batch_execution_updated_at
    BEFORE UPDATE ON test_batch_execution
    FOR EACH ROW EXECUTE FUNCTION update_test_batch_execution_updated_at();

-- 샘플 배치 실행 데이터 삽입 (테스트용)
INSERT INTO test_batch_execution (
    batch_name, test_data_count, execution_status, start_time, end_time,
    total_processing_time_ms, passed_count, failed_count, success_rate, average_score,
    layer_0_hits, layer_1_hits, layer_2_hits, layer_3_hits,
    layer_performance, error_patterns, improvement_suggestions,
    execution_notes, created_by
) VALUES 
(
    'Initial System Test', 100, 'COMPLETED', 
    NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour 45 minutes',
    900000, 85, 15, 85.00, 0.7750,
    45, 30, 15, 10,
    '{"layer_0_avg_time_ms": 5, "layer_1_avg_time_ms": 45, "layer_2_avg_time_ms": 250, "layer_3_avg_time_ms": 1200}',
    '{"common_failures": ["계정코드 매핑 실패", "회사명 추출 오류"], "error_categories": {"regex": 12, "ml": 2, "llm": 1}}',
    ARRAY['정규식 패턴 개선 필요', 'ML 모델 재훈련 고려', '키워드 사전 확장'],
    '초기 시스템 테스트 - 전체적으로 양호한 성능',
    'admin'
),
(
    'Restaurant Category Test', 50, 'COMPLETED',
    NOW() - INTERVAL '1 hour', NOW() - INTERVAL '45 minutes',
    450000, 48, 2, 96.00, 0.8900,
    20, 25, 3, 2,
    '{"layer_0_avg_time_ms": 3, "layer_1_avg_time_ms": 35, "layer_2_avg_time_ms": 200, "layer_3_avg_time_ms": 1000}',
    '{"common_failures": ["신규 브랜드 미인식"], "error_categories": {"regex": 2}}',
    ARRAY['음식점 브랜드 사전 업데이트'],
    '음식점 카테고리 특화 테스트 - 우수한 성능',
    'admin'
),
(
    'High Difficulty Test', 25, 'RUNNING',
    NOW() - INTERVAL '30 minutes', NULL,
    NULL, 0, 0, 0.00, 0.0000,
    0, 0, 0, 0,
    NULL, NULL, NULL,
    '고난이도 테스트 케이스 실행 중',
    'system'
);

-- 테이블 생성 및 초기 데이터 확인
SELECT 
    '🚀 test_batch_execution 테이블 생성 완료!' as message,
    COUNT(*) as sample_records,
    COUNT(*) FILTER (WHERE execution_status = 'COMPLETED') as completed_batches,
    COUNT(*) FILTER (WHERE execution_status = 'RUNNING') as running_batches
FROM test_batch_execution;