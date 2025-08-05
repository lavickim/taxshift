-- 생성된 75개 규칙의 품질 검증 테스트
-- 2025-07-27 생성

-- 1. 전체 규칙 통계
SELECT 
    '전체 규칙 통계' as test_category,
    COUNT(*) as total_rules,
    COUNT(CASE WHEN priority >= 150 THEN 1 END) as high_priority,
    COUNT(CASE WHEN priority BETWEEN 100 AND 149 THEN 1 END) as medium_priority,
    COUNT(CASE WHEN priority < 100 THEN 1 END) as low_priority,
    COUNT(DISTINCT category) as unique_categories
FROM regex_preprocessing_rules 
WHERE is_active = true;

-- 2. 카테고리별 분포
SELECT 
    '카테고리별 분포' as test_category,
    category,
    COUNT(*) as rule_count,
    AVG(priority) as avg_priority,
    MIN(priority) as min_priority,
    MAX(priority) as max_priority
FROM regex_preprocessing_rules 
WHERE is_active = true
GROUP BY category
ORDER BY rule_count DESC;

-- 3. 우선순위별 규칙 품질
SELECT 
    '우선순위별 품질' as test_category,
    CASE 
        WHEN priority >= 150 THEN 'High (150+)'
        WHEN priority >= 100 THEN 'Medium (100-149)'
        ELSE 'Low (<100)'
    END as priority_level,
    COUNT(*) as rule_count,
    AVG(LENGTH(input_pattern)) as avg_pattern_length,
    COUNT(CASE WHEN LENGTH(input_pattern) > 50 THEN 1 END) as complex_patterns
FROM regex_preprocessing_rules 
WHERE is_active = true
GROUP BY CASE 
    WHEN priority >= 150 THEN 'High (150+)'
    WHEN priority >= 100 THEN 'Medium (100-149)'
    ELSE 'Low (<100)'
END
ORDER BY priority_level;

-- 4. 법인구조 패턴 확인 (Phase 1)
SELECT 
    '법인구조 패턴 검증' as test_category,
    rule_name,
    input_pattern,
    output_template,
    priority
FROM regex_preprocessing_rules 
WHERE category = '법인구조' AND is_active = true
ORDER BY priority DESC;

-- 5. 주요 브랜드 패턴 확인 (Phase 2)
SELECT 
    '주요 브랜드 패턴 검증' as test_category,
    rule_name,
    category,
    input_pattern,
    priority
FROM regex_preprocessing_rules 
WHERE category IN ('카페', '편의점', '치킨', '온라인쇼핑', '브랜드통합', '영문통합') 
  AND is_active = true
ORDER BY category, priority DESC
LIMIT 15;

-- 6. 특수문자 처리 패턴 확인 (Phase 3)
SELECT 
    '특수문자 처리 패턴 검증' as test_category,
    rule_name,
    category,
    input_pattern,
    priority
FROM regex_preprocessing_rules 
WHERE category IN ('특수문자', '문자정리', '위치정보') 
  AND is_active = true
ORDER BY category, priority DESC
LIMIT 15;

-- 7. 샘플 텍스트 매칭 테스트
WITH test_samples AS (
    SELECT '(주)삼성전자' as test_text, '법인구조' as expected_category
    UNION ALL SELECT '스타벅스 강남점', '카페'
    UNION ALL SELECT 'MCDONALDS 역삼', '치킨'
    UNION ALL SELECT '㈜LG전자', '법인구조'
    UNION ALL SELECT '쿠팡 배송', '온라인쇼핑'
    UNION ALL SELECT 'GS25편의점', '편의점'
    UNION ALL SELECT '서울대병원', '병원'
    UNION ALL SELECT '강남 지점', '지점관리'
)
SELECT 
    '샘플 텍스트 매칭 검증' as test_category,
    ts.test_text,
    ts.expected_category,
    COUNT(rpr.id) as matching_rules,
    STRING_AGG(rpr.rule_name, ', ' ORDER BY rpr.priority DESC) as matched_rule_names
FROM test_samples ts
LEFT JOIN regex_preprocessing_rules rpr ON 
    rpr.is_active = true 
    AND ts.test_text ~ rpr.input_pattern
    AND rpr.category = ts.expected_category
GROUP BY ts.test_text, ts.expected_category
ORDER BY ts.test_text;

-- 8. 규칙 복잡도 분석
SELECT 
    '규칙 복잡도 분석' as test_category,
    CASE 
        WHEN LENGTH(input_pattern) <= 20 THEN 'Simple (≤20)'
        WHEN LENGTH(input_pattern) <= 50 THEN 'Medium (21-50)'
        ELSE 'Complex (>50)'
    END as complexity_level,
    COUNT(*) as rule_count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM regex_preprocessing_rules 
WHERE is_active = true
GROUP BY CASE 
    WHEN LENGTH(input_pattern) <= 20 THEN 'Simple (≤20)'
    WHEN LENGTH(input_pattern) <= 50 THEN 'Medium (21-50)'
    ELSE 'Complex (>50)'
END
ORDER BY complexity_level;

-- 9. 사용량 통계 (기존 규칙)
SELECT 
    '사용량 통계' as test_category,
    rule_name,
    category,
    usage_count,
    priority
FROM regex_preprocessing_rules 
WHERE is_active = true AND usage_count > 0
ORDER BY usage_count DESC
LIMIT 10;

-- 10. 잠재적 충돌 패턴 검증
SELECT 
    '잠재적 충돌 검증' as test_category,
    r1.rule_name as rule1,
    r2.rule_name as rule2,
    r1.category as category1,
    r2.category as category2,
    r1.priority as priority1,
    r2.priority as priority2,
    r1.input_pattern as pattern1,
    r2.input_pattern as pattern2
FROM regex_preprocessing_rules r1
CROSS JOIN regex_preprocessing_rules r2
WHERE r1.id < r2.id 
  AND r1.is_active = true 
  AND r2.is_active = true
  AND (
    -- 동일한 패턴이지만 다른 카테고리
    (r1.input_pattern = r2.input_pattern AND r1.category != r2.category)
    OR
    -- 비슷한 우선순위에서 겹치는 패턴
    (ABS(r1.priority - r2.priority) <= 5 AND r1.category = r2.category)
  )
LIMIT 10;