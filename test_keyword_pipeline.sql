-- ======================================================
-- 키워드 처리 파이프라인 통합 테스트
-- ======================================================
-- 테스트 시나리오: 거래 문자열 → 키워드 매칭 → 태그 분류 → 계정과목 매핑
-- ======================================================

-- 1. 파이프라인 테스트 함수 생성
CREATE OR REPLACE FUNCTION test_keyword_pipeline(
    p_transaction_text TEXT
) RETURNS TABLE (
    input_text TEXT,
    matched_keywords TEXT[],
    suggested_tag VARCHAR(50),
    suggested_account_code VARCHAR(10),
    suggested_account_name VARCHAR(100),
    confidence DECIMAL(5,2),
    pipeline_stage TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH keyword_matches AS (
        -- 1단계: 키워드 매칭
        SELECT 
            p_transaction_text as transaction_text,
            ktm.keyword,
            ktm.tag_id,
            ktm.confidence,
            ktm.priority,
            t.tag_name
        FROM keyword_tag_mappings ktm
        JOIN tags_master t ON ktm.tag_id = t.id
        WHERE p_transaction_text ILIKE '%' || ktm.keyword || '%'
          AND ktm.is_active = true
    ),
    tag_scoring AS (
        -- 2단계: 태그별 점수 계산
        SELECT 
            transaction_text,
            tag_id,
            tag_name,
            COUNT(*) as keyword_count,
            AVG(confidence) as avg_confidence,
            MAX(priority) as max_priority,
            ARRAY_AGG(keyword ORDER BY priority DESC) as matched_keywords
        FROM keyword_matches
        GROUP BY transaction_text, tag_id, tag_name
    ),
    best_tag AS (
        -- 3단계: 최적 태그 선택
        SELECT 
            transaction_text,
            tag_id,
            tag_name,
            matched_keywords,
            (avg_confidence * 0.4 + (keyword_count::decimal / 10) * 0.3 + (max_priority::decimal / 10) * 0.3) as final_score
        FROM tag_scoring
        ORDER BY final_score DESC
        LIMIT 1
    ),
    account_mapping AS (
        -- 4단계: 계정과목 매핑
        SELECT 
            bt.transaction_text,
            bt.matched_keywords,
            bt.tag_name,
            tam.account_code,
            tam.account_name,
            (bt.final_score * 0.7 + tam.confidence_boost * 0.3) as total_confidence
        FROM best_tag bt
        JOIN tag_account_mappings tam ON bt.tag_id = tam.tag_id
        WHERE tam.is_default = true
        ORDER BY tam.priority DESC
        LIMIT 1
    )
    SELECT 
        COALESCE(am.transaction_text, p_transaction_text),
        COALESCE(am.matched_keywords, ARRAY[]::TEXT[]),
        COALESCE(am.tag_name, 'UNMATCHED'),
        COALESCE(am.account_code, 'NONE'),
        COALESCE(am.account_name, 'NONE'),
        COALESCE(am.total_confidence, 0.0),
        CASE 
            WHEN am.account_code IS NOT NULL THEN 'COMPLETE'
            WHEN EXISTS(SELECT 1 FROM keyword_matches WHERE transaction_text = p_transaction_text) THEN 'TAG_MATCHED'
            ELSE 'NO_KEYWORDS'
        END as pipeline_stage
    FROM account_mapping am;
    
    -- 키워드 매칭이 없는 경우 기본 응답
    IF NOT FOUND THEN
        RETURN QUERY
        SELECT 
            p_transaction_text,
            ARRAY[]::TEXT[],
            'UNMATCHED'::VARCHAR(50),
            'NONE'::VARCHAR(10), 
            'NONE'::VARCHAR(100),
            0.0::DECIMAL(5,2),
            'NO_KEYWORDS'::TEXT;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 2. 샘플 거래들에 대한 파이프라인 테스트 실행
SELECT 
    '=== 키워드 처리 파이프라인 통합 테스트 결과 ===' as test_header;

-- 높은 신뢰도 테스트 케이스들
SELECT * FROM test_keyword_pipeline('직원급여 12월분');
SELECT * FROM test_keyword_pipeline('주유소 휘발유 충전');
SELECT * FROM test_keyword_pipeline('사무실 월세');
SELECT * FROM test_keyword_pipeline('고객 접대비');
SELECT * FROM test_keyword_pipeline('편의점 도시락');
SELECT * FROM test_keyword_pipeline('사무용품 구매');

-- 복합 키워드 테스트
SELECT * FROM test_keyword_pipeline('GS칼텍스 주유소에서 휘발유와 커피');
SELECT * FROM test_keyword_pipeline('출장 중 호텔 숙박 및 식사비');
SELECT * FROM test_keyword_pipeline('프린터 토너 교체 및 A4용지');

-- 경계 케이스 테스트
SELECT * FROM test_keyword_pipeline('알 수 없는 거래');
SELECT * FROM test_keyword_pipeline('현금 인출');

-- 3. 테스트 결과 통계
SELECT 
    '=== 파이프라인 단계별 성공률 ===' as statistics_header;

WITH test_cases AS (
    SELECT unnest(ARRAY[
        '직원급여 12월분',
        '주유소 휘발유 충전', 
        '사무실 월세',
        '고객 접대비',
        '편의점 도시락',
        '사무용품 구매',
        'GS칼텍스 주유소에서 휘발유와 커피',
        '출장 중 호텔 숙박 및 식사비',
        '프린터 토너 교체 및 A4용지',
        '알 수 없는 거래',
        '현금 인출'
    ]) as test_text
),
test_results AS (
    SELECT 
        tc.test_text,
        t.*
    FROM test_cases tc
    CROSS JOIN LATERAL test_keyword_pipeline(tc.test_text) t
)
SELECT 
    pipeline_stage,
    COUNT(*) as case_count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM test_results), 1) as percentage,
    ROUND(AVG(confidence), 2) as avg_confidence
FROM test_results
GROUP BY pipeline_stage
ORDER BY case_count DESC;

-- 4. 태그별 분류 성능
SELECT 
    '=== 태그별 분류 성능 ===' as tag_performance_header;

WITH test_cases AS (
    SELECT unnest(ARRAY[
        '직원급여 12월분',
        '주유소 휘발유 충전', 
        '사무실 월세',
        '고객 접대비',
        '편의점 도시락',
        '사무용품 구매',
        'GS칼텍스 주유소에서 휘발유와 커피',
        '출장 중 호텔 숙박 및 식사비',
        '프린터 토너 교체 및 A4용지'
    ]) as test_text
),
test_results AS (
    SELECT 
        tc.test_text,
        t.*
    FROM test_cases tc
    CROSS JOIN LATERAL test_keyword_pipeline(tc.test_text) t
    WHERE t.suggested_tag != 'UNMATCHED'
)
SELECT 
    suggested_tag,
    COUNT(*) as classified_count,
    ROUND(AVG(confidence), 2) as avg_confidence,
    STRING_AGG(DISTINCT suggested_account_code || ':' || suggested_account_name, ', ') as mapped_accounts
FROM test_results
GROUP BY suggested_tag
ORDER BY classified_count DESC;

-- 5. 실제 샘플 거래와 비교 검증
SELECT 
    '=== 샘플 거래 데이터 vs 파이프라인 결과 비교 ===' as validation_header;

WITH pipeline_results AS (
    SELECT 
        st.transaction_text,
        st.expected_tag,
        st.expected_account_code,
        st.confidence_expected,
        t.suggested_tag,
        t.suggested_account_code,
        t.confidence as pipeline_confidence,
        CASE 
            WHEN st.expected_tag = t.suggested_tag THEN 'TAG_MATCH'
            WHEN st.expected_account_code = t.suggested_account_code THEN 'ACCOUNT_MATCH'
            ELSE 'MISMATCH'
        END as match_result
    FROM sample_transactions st
    CROSS JOIN LATERAL test_keyword_pipeline(st.transaction_text) t
    LIMIT 10  -- 처음 10개만 테스트
)
SELECT 
    match_result,
    COUNT(*) as count,
    ROUND(AVG(pipeline_confidence), 2) as avg_pipeline_confidence,
    ROUND(AVG(confidence_expected), 2) as avg_expected_confidence
FROM pipeline_results
GROUP BY match_result
ORDER BY count DESC;