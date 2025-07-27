-- 효율적인 키워드 세그멘테이션 시스템 구축
-- 54만건 데이터를 매번 처리하지 않고 세그먼트별로 효율적 조회

-- 1. 키워드 세그멘트 테이블 생성 (요약 테이블)
CREATE TABLE IF NOT EXISTS keyword_segments (
    id SERIAL PRIMARY KEY,
    segment_name VARCHAR(100) NOT NULL,
    segment_type VARCHAR(50) NOT NULL, -- 'category', 'region', 'size', 'frequency'
    parent_segment_id INTEGER REFERENCES keyword_segments(id),
    keyword TEXT NOT NULL,
    total_count INTEGER DEFAULT 0,
    member_count INTEGER DEFAULT 0,
    workplace_count INTEGER DEFAULT 0,
    confidence_score DECIMAL(3,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(segment_type, segment_name, keyword)
);

-- 2. 키워드 관계 요약 테이블 생성
CREATE TABLE IF NOT EXISTS keyword_relationships_summary (
    id SERIAL PRIMARY KEY,
    keyword1 TEXT NOT NULL,
    keyword2 TEXT NOT NULL,
    relationship_strength DECIMAL(5,3) DEFAULT 0,
    co_occurrence_count INTEGER DEFAULT 0,
    pmi_score DECIMAL(5,3) DEFAULT 0,
    segment_filter TEXT, -- 'all', 'category:제조업', 'region:서울' 등
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(keyword1, keyword2, segment_filter)
);

-- 3. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_keyword_segments_type_name ON keyword_segments(segment_type, segment_name);
CREATE INDEX IF NOT EXISTS idx_keyword_segments_keyword ON keyword_segments(keyword);
CREATE INDEX IF NOT EXISTS idx_keyword_segments_count ON keyword_segments(total_count DESC);
CREATE INDEX IF NOT EXISTS idx_keyword_relationships_keyword1 ON keyword_relationships_summary(keyword1);
CREATE INDEX IF NOT EXISTS idx_keyword_relationships_keyword2 ON keyword_relationships_summary(keyword2);
CREATE INDEX IF NOT EXISTS idx_keyword_relationships_strength ON keyword_relationships_summary(relationship_strength DESC);

-- 4. 키워드 세그멘트 데이터 생성 함수
CREATE OR REPLACE FUNCTION generate_keyword_segments()
RETURNS TEXT AS $$
DECLARE
    start_time TIMESTAMP;
    processed_count INTEGER := 0;
BEGIN
    start_time := CLOCK_TIMESTAMP();
    
    -- 기존 세그멘트 데이터 삭제
    DELETE FROM keyword_segments;
    DELETE FROM keyword_relationships_summary;
    
    RAISE NOTICE '🚀 키워드 세그멘테이션 시작...';
    
    -- 1) 카테고리별 세그멘트 생성
    INSERT INTO keyword_segments (segment_name, segment_type, keyword, total_count, member_count, workplace_count, confidence_score)
    SELECT 
        keyword_category as segment_name,
        'category' as segment_type,
        keyword,
        COUNT(*) as total_count,
        SUM(member_count) as member_count,
        COUNT(DISTINCT workplace_name) as workplace_count,
        AVG(keyword_confidence) as confidence_score
    FROM datacollection_national_pension,
         LATERAL unnest(extracted_keywords) as keyword
    WHERE extracted_keywords IS NOT NULL 
      AND keyword_category IS NOT NULL
    GROUP BY keyword_category, keyword
    HAVING COUNT(*) >= 3; -- 최소 3회 출현하는 키워드만
    
    GET DIAGNOSTICS processed_count = ROW_COUNT;
    RAISE NOTICE '📊 카테고리별 세그멘트 생성: % 개', processed_count;
    
    -- 2) 지역별 세그멘트 생성 (시도 기준)
    INSERT INTO keyword_segments (segment_name, segment_type, keyword, total_count, member_count, workplace_count, confidence_score)
    SELECT 
        sido_code as segment_name,
        'region' as segment_type,
        keyword,
        COUNT(*) as total_count,
        SUM(member_count) as member_count,
        COUNT(DISTINCT workplace_name) as workplace_count,
        AVG(keyword_confidence) as confidence_score
    FROM datacollection_national_pension,
         LATERAL unnest(extracted_keywords) as keyword
    WHERE extracted_keywords IS NOT NULL 
      AND sido_code IS NOT NULL
    GROUP BY sido_code, keyword
    HAVING COUNT(*) >= 5; -- 최소 5회 출현하는 키워드만
    
    GET DIAGNOSTICS processed_count = ROW_COUNT;
    RAISE NOTICE '📊 지역별 세그멘트 생성: % 개', processed_count;
    
    -- 3) 규모별 세그멘트 생성 (회원 수 기준)
    INSERT INTO keyword_segments (segment_name, segment_type, keyword, total_count, member_count, workplace_count, confidence_score)
    SELECT 
        CASE 
            WHEN member_count <= 10 THEN 'small'
            WHEN member_count <= 50 THEN 'medium'
            WHEN member_count <= 200 THEN 'large'
            ELSE 'xlarge'
        END as segment_name,
        'size' as segment_type,
        keyword,
        COUNT(*) as total_count,
        SUM(member_count) as member_count,
        COUNT(DISTINCT workplace_name) as workplace_count,
        AVG(keyword_confidence) as confidence_score
    FROM datacollection_national_pension,
         LATERAL unnest(extracted_keywords) as keyword
    WHERE extracted_keywords IS NOT NULL 
      AND member_count IS NOT NULL
    GROUP BY 
        CASE 
            WHEN member_count <= 10 THEN 'small'
            WHEN member_count <= 50 THEN 'medium'
            WHEN member_count <= 200 THEN 'large'
            ELSE 'xlarge'
        END,
        keyword
    HAVING COUNT(*) >= 2;
    
    GET DIAGNOSTICS processed_count = ROW_COUNT;
    RAISE NOTICE '📊 규모별 세그멘트 생성: % 개', processed_count;
    
    -- 4) 빈도별 세그멘트 생성 (TOP, HIGH, MEDIUM, LOW)
    WITH keyword_frequencies AS (
        SELECT 
            keyword,
            COUNT(*) as freq,
            NTILE(4) OVER (ORDER BY COUNT(*) DESC) as quartile
        FROM datacollection_national_pension,
             LATERAL unnest(extracted_keywords) as keyword
        WHERE extracted_keywords IS NOT NULL
        GROUP BY keyword
    )
    INSERT INTO keyword_segments (segment_name, segment_type, keyword, total_count, confidence_score)
    SELECT 
        CASE 
            WHEN quartile = 1 THEN 'TOP'
            WHEN quartile = 2 THEN 'HIGH'
            WHEN quartile = 3 THEN 'MEDIUM'
            ELSE 'LOW'
        END as segment_name,
        'frequency' as segment_type,
        keyword,
        freq as total_count,
        0.8 as confidence_score
    FROM keyword_frequencies;
    
    GET DIAGNOSTICS processed_count = ROW_COUNT;
    RAISE NOTICE '📊 빈도별 세그멘트 생성: % 개', processed_count;
    
    RAISE NOTICE '🎉 키워드 세그멘테이션 완료! 총 소요시간: %초', 
        EXTRACT(EPOCH FROM (CLOCK_TIMESTAMP() - start_time));
    
    RETURN '세그멘테이션 완료';
END;
$$ LANGUAGE plpgsql;

-- 5. 키워드 관계 요약 데이터 생성 함수
CREATE OR REPLACE FUNCTION generate_keyword_relationships_summary()
RETURNS TEXT AS $$
DECLARE
    start_time TIMESTAMP;
BEGIN
    start_time := CLOCK_TIMESTAMP();
    
    RAISE NOTICE '🔗 키워드 관계 요약 생성 시작...';
    
    -- 전체 데이터에 대한 키워드 관계 (상위 1000개만)
    INSERT INTO keyword_relationships_summary (keyword1, keyword2, relationship_strength, co_occurrence_count, segment_filter)
    WITH keyword_pairs AS (
        SELECT 
            k1.keyword as keyword1,
            k2.keyword as keyword2,
            COUNT(*) as co_occurrence
        FROM (
            SELECT id, unnest(extracted_keywords) as keyword
            FROM datacollection_national_pension 
            WHERE extracted_keywords IS NOT NULL
        ) k1
        JOIN (
            SELECT id, unnest(extracted_keywords) as keyword
            FROM datacollection_national_pension 
            WHERE extracted_keywords IS NOT NULL
        ) k2 ON k1.id = k2.id AND k1.keyword < k2.keyword
        GROUP BY k1.keyword, k2.keyword
        HAVING COUNT(*) >= 5 -- 최소 5회 동시 출현
    ),
    keyword_totals AS (
        SELECT 
            keyword,
            COUNT(*) as total_count
        FROM datacollection_national_pension,
             LATERAL unnest(extracted_keywords) as keyword
        WHERE extracted_keywords IS NOT NULL
        GROUP BY keyword
    )
    SELECT 
        kp.keyword1,
        kp.keyword2,
        ROUND(
            LOG(2, (kp.co_occurrence::decimal * 436346) / (kt1.total_count * kt2.total_count))::numeric, 
            3
        ) as relationship_strength,
        kp.co_occurrence,
        'all' as segment_filter
    FROM keyword_pairs kp
    JOIN keyword_totals kt1 ON kp.keyword1 = kt1.keyword
    JOIN keyword_totals kt2 ON kp.keyword2 = kt2.keyword
    WHERE LOG(2, (kp.co_occurrence::decimal * 436346) / (kt1.total_count * kt2.total_count)) > 0.5
    ORDER BY relationship_strength DESC
    LIMIT 1000;
    
    RAISE NOTICE '🎉 키워드 관계 요약 완료! 총 소요시간: %초', 
        EXTRACT(EPOCH FROM (CLOCK_TIMESTAMP() - start_time));
    
    RETURN '관계 요약 완료';
END;
$$ LANGUAGE plpgsql;

-- 6. 효율적인 키워드 조회 함수들 생성

-- 6-1) 세그멘트별 상위 키워드 조회
CREATE OR REPLACE FUNCTION get_top_keywords_by_segment(
    p_segment_type TEXT,
    p_segment_name TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 20
)
RETURNS TABLE(keyword TEXT, count INTEGER, confidence DECIMAL, segment TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ks.keyword,
        ks.total_count as count,
        ks.confidence_score as confidence,
        ks.segment_name as segment
    FROM keyword_segments ks
    WHERE ks.segment_type = p_segment_type
      AND (p_segment_name IS NULL OR ks.segment_name = p_segment_name)
    ORDER BY ks.total_count DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- 6-2) 키워드 관련어 조회 (관계 기반)
CREATE OR REPLACE FUNCTION get_related_keywords(
    p_keyword TEXT,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE(related_keyword TEXT, strength DECIMAL, co_occurrence INTEGER) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN krs.keyword1 = p_keyword THEN krs.keyword2
            ELSE krs.keyword1
        END as related_keyword,
        krs.relationship_strength as strength,
        krs.co_occurrence_count as co_occurrence
    FROM keyword_relationships_summary krs
    WHERE (krs.keyword1 = p_keyword OR krs.keyword2 = p_keyword)
      AND krs.segment_filter = 'all'
    ORDER BY krs.relationship_strength DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- 6-3) 세그멘트 통계 조회
CREATE OR REPLACE FUNCTION get_segment_statistics()
RETURNS TABLE(segment_type TEXT, segment_count BIGINT, keyword_count BIGINT, avg_confidence DECIMAL) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ks.segment_type,
        COUNT(DISTINCT ks.segment_name) as segment_count,
        COUNT(*) as keyword_count,
        ROUND(AVG(ks.confidence_score), 3) as avg_confidence
    FROM keyword_segments ks
    GROUP BY ks.segment_type
    ORDER BY keyword_count DESC;
END;
$$ LANGUAGE plpgsql;

-- 7. 세그멘테이션 실행
SELECT generate_keyword_segments();

-- 8. 관계 요약 실행
SELECT generate_keyword_relationships_summary();

-- 9. 결과 확인
-- 세그멘트 통계
SELECT '=== 세그멘트 통계 ===' as 구분;
SELECT * FROM get_segment_statistics();

-- 카테고리별 상위 키워드 (제조업)
SELECT '=== 제조업 상위 키워드 ===' as 구분;
SELECT * FROM get_top_keywords_by_segment('category', '제조업', 10);

-- 특정 키워드의 관련어
SELECT '=== "제조업" 관련 키워드 ===' as 구분;
SELECT * FROM get_related_keywords('제조업', 10);

-- 전체 상위 키워드 (빈도 기준)
SELECT '=== 전체 상위 키워드 (TOP 빈도) ===' as 구분;
SELECT * FROM get_top_keywords_by_segment('frequency', 'TOP', 15);