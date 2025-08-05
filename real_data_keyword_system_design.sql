-- ======================================================
-- 실제 데이터 기반 키워드 처리 시스템 고도화
-- ======================================================
-- 아키텍처: 프랜차이즈(2,599개) + 국민연금 사업장(542,366개) 완전 통합
-- 목표: 실제 거래 패턴에 맞는 고정밀 키워드 엔진 구축
-- ======================================================

-- 1. 데이터 분석: 국민연금 업종 현황
SELECT 
    '=== 국민연금 업종 분석 (상위 20개) ===' as analysis_header;

SELECT 
    industry_name,
    COUNT(*) as workplace_count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM datacollection_national_pension), 2) as percentage
FROM datacollection_national_pension 
WHERE industry_name IS NOT NULL
GROUP BY industry_name 
ORDER BY workplace_count DESC 
LIMIT 20;

-- 2. 프랜차이즈 카테고리 분석
SELECT 
    '=== 프랜차이즈 카테고리 분석 ===' as franchise_analysis;

SELECT 
    category,
    COUNT(*) as brand_count,
    STRING_AGG(brand_name, ', ' ORDER BY priority DESC) as top_brands
FROM datacollection_franchise_brands 
GROUP BY category 
ORDER BY brand_count DESC;

-- 3. 업종-태그 매핑 전략 수립
WITH industry_tag_mapping AS (
    SELECT 
        industry_name,
        COUNT(*) as workplace_count,
        CASE 
            -- 음식업 관련 → 접대비
            WHEN industry_name ILIKE '%음식%' OR industry_name ILIKE '%식당%' OR industry_name ILIKE '%카페%' 
                OR industry_name ILIKE '%커피%' OR industry_name ILIKE '%주점%' THEN '접대비'
            
            -- 주유소, 자동차 관련 → 주유소
            WHEN industry_name ILIKE '%주유%' OR industry_name ILIKE '%자동차%' OR industry_name ILIKE '%정비%' 
                OR industry_name ILIKE '%타이어%' OR industry_name ILIKE '%세차%' THEN '주유소'
            
            -- 편의점, 소매 관련 → 편의점
            WHEN industry_name ILIKE '%편의점%' OR industry_name ILIKE '%슈퍼%' OR industry_name ILIKE '%마트%' 
                OR industry_name ILIKE '%소매%' OR industry_name ILIKE '%잡화%' THEN '편의점'
            
            -- 사무용품, IT 관련 → 사무용품
            WHEN industry_name ILIKE '%사무%' OR industry_name ILIKE '%문구%' OR industry_name ILIKE '%컴퓨터%' 
                OR industry_name ILIKE '%소프트웨어%' OR industry_name ILIKE '%전자%' THEN '사무용품'
            
            -- 인력, 고용 관련 → 급여
            WHEN industry_name ILIKE '%인력%' OR industry_name ILIKE '%고용%' OR industry_name ILIKE '%파견%' 
                OR industry_name ILIKE '%용역%' OR industry_name ILIKE '%관리%' THEN '급여'
            
            -- 부동산, 임대 관련 → 임차료
            WHEN industry_name ILIKE '%부동산%' OR industry_name ILIKE '%임대%' OR industry_name ILIKE '%건물%' 
                OR industry_name ILIKE '%시설%' OR industry_name ILIKE '%관리%' THEN '임차료'
            
            ELSE 'ETC'
        END as suggested_tag
    FROM datacollection_national_pension 
    WHERE industry_name IS NOT NULL 
    GROUP BY industry_name
)
SELECT 
    '=== 업종별 태그 매핑 전략 ===' as mapping_strategy;

SELECT 
    suggested_tag,
    COUNT(*) as industry_count,
    SUM(workplace_count) as total_workplaces,
    ROUND(SUM(workplace_count) * 100.0 / (SELECT COUNT(*) FROM datacollection_national_pension), 1) as coverage_percentage
FROM industry_tag_mapping 
GROUP BY suggested_tag 
ORDER BY total_workplaces DESC;

-- 4. 프랜차이즈 키워드 추출 전략
SELECT 
    '=== 프랜차이즈 브랜드 → 키워드 매핑 전략 ===' as franchise_keyword_strategy;

WITH franchise_keyword_mapping AS (
    SELECT 
        brand_name,
        category,
        CASE 
            WHEN category IN ('패스트푸드점', '중식당', '한식당', '피자전문점', '치킨전문점') THEN '접대비'
            WHEN category IN ('커피전문점', '프랜차이즈카페', '아이스크림점', '베이커리') THEN '편의점'
            WHEN category = '편의점' THEN '편의점'
            ELSE '접대비'  -- 기본값
        END as target_tag
    FROM datacollection_franchise_brands
)
SELECT 
    target_tag,
    category,
    COUNT(*) as brand_count,
    STRING_AGG(brand_name, ', ' ORDER BY brand_name LIMIT 10) as sample_brands
FROM franchise_keyword_mapping 
GROUP BY target_tag, category 
ORDER BY target_tag, brand_count DESC;

-- 5. 키워드 확장 우선순위 분석
SELECT 
    '=== 키워드 확장 우선순위 ===' as expansion_priority;

WITH priority_analysis AS (
    -- 국민연금 사업장명에서 자주 나오는 키워드 패턴
    SELECT 
        '국민연금_사업장명' as source,
        TRIM(regexp_split_to_table(workplace_name, '\s+')) as keyword_candidate,
        COUNT(*) as frequency
    FROM datacollection_national_pension 
    WHERE workplace_name IS NOT NULL 
        AND LENGTH(TRIM(regexp_split_to_table(workplace_name, '\s+'))) >= 2
    GROUP BY TRIM(regexp_split_to_table(workplace_name, '\s+'))
    HAVING COUNT(*) >= 10
    
    UNION ALL
    
    -- 프랜차이즈 브랜드명
    SELECT 
        '프랜차이즈_브랜드' as source,
        brand_name as keyword_candidate,
        franchise_count::int as frequency
    FROM datacollection_franchise_brands 
    WHERE franchise_count IS NOT NULL
)
SELECT 
    source,
    keyword_candidate,
    frequency,
    ROW_NUMBER() OVER (PARTITION BY source ORDER BY frequency DESC) as rank
FROM priority_analysis 
WHERE keyword_candidate NOT IN ('(주)', '(유)', '주식회사', '유한회사', '㈜', '㈜)', '(', ')', '-', '&')
    AND frequency >= 5
ORDER BY source, frequency DESC 
LIMIT 50;

-- 6. 실제 구현 계획
SELECT 
    '=== 구현 단계별 계획 ===' as implementation_plan;

SELECT 
    'Phase 1: 프랜차이즈 정규식 규칙 생성' as phase,
    '2,599개 브랜드 → regex_preprocessing_rules 테이블' as description,
    '브랜드명 정규화 (맥도날드, 맥날 → McDonald)' as example
UNION ALL
SELECT 
    'Phase 2: 국민연금 업종별 키워드 그룹 생성',
    '542K 사업장 → 업종별 keyword_groups',
    '일반음식점업 → [음식점, 식당, 레스토랑] 키워드'
UNION ALL
SELECT 
    'Phase 3: 사업장명 키워드 매핑',
    '고빈도 사업장명 → keyword_tag_mappings',
    '스타벅스, 이디야 → 접대비 태그'
UNION ALL
SELECT 
    'Phase 4: 태그-계정과목 매핑 보강',
    '실제 업종 → tag_account_mappings 확장',
    '음식점업 → 5212:접대비, 5208:식대 매핑'
UNION ALL
SELECT 
    'Phase 5: 통합 테스트 및 최적화',
    '실제 거래 패턴 테스트',
    '스타벅스 영수증 → 접대비 5212 자동 분류';

-- 7. 예상 성능 향상
SELECT 
    '=== 예상 성능 향상 ===' as performance_improvement;

SELECT 
    '현재 키워드 매핑' as metric,
    119 as current_count,
    'keyword_tag_mappings 테이블' as source
UNION ALL
SELECT 
    '추가 프랜차이즈 키워드',
    2599,
    'datacollection_franchise_brands'
UNION ALL  
SELECT 
    '추가 사업장명 키워드 (예상)',
    50000,
    'datacollection_national_pension (고빈도 사업장명)'
UNION ALL
SELECT 
    '총 키워드 매핑 (예상)',
    52718,
    '통합 후 전체 키워드'
UNION ALL
SELECT 
    '커버리지 향상 (배수)',
    443,
    '52,718 / 119 = 443배 향상';

-- 8. 다음 단계 Action Items
SELECT 
    '=== Action Items ===' as action_items;

SELECT 
    1 as priority,
    'franchise_to_regex_rules.sql 생성' as task,
    '프랜차이즈 브랜드 → 정규식 규칙 변환' as description
UNION ALL
SELECT 
    2,
    'national_pension_to_keywords.sql 생성', 
    '국민연금 업종 → 키워드 그룹 생성'
UNION ALL
SELECT 
    3,
    'workplace_name_keyword_extraction.sql',
    '사업장명 → 키워드 매핑 자동 생성'
UNION ALL
SELECT 
    4,
    'integrated_tag_account_mapping.sql',
    '실제 업종 기반 태그-계정과목 매핑 확장'
UNION ALL
SELECT 
    5,
    'real_transaction_pipeline_test.sql',
    '실제 거래 패턴 통합 테스트'
ORDER BY priority;