-- 국민연금 54만건 데이터 기반 세그먼트 20,000개 확장 스크립트
-- Phase 1: 데이터 확장 전략 실행

-- 1. 업종별 세부 키워드 확장 (기존 5,238개 → 20,000개 목표)
-- 54만건 국민연금 데이터에서 추출한 실제 업종명을 기반으로 세그먼트 확장

-- 1.1 제조업 세부 분류 확장
INSERT INTO keyword_segments (keyword, segment_type, segment_name, confidence_score, total_count, member_count, workplace_count, created_at, updated_at)
SELECT DISTINCT
    regexp_replace(industry_name, '[^가-힣a-zA-Z0-9\s]', '', 'g') as keyword,
    'category' as segment_type,
    '제조업' as segment_name,
    0.95 as confidence_score,
    COUNT(*) as total_count,
    SUM(member_count) as member_count,
    COUNT(*) as workplace_count,
    NOW() as created_at,
    NOW() as updated_at
FROM datacollection_national_pension 
WHERE industry_name ~ '제조업$'
  AND member_count > 0
  AND LENGTH(regexp_replace(industry_name, '[^가-힣a-zA-Z0-9\s]', '', 'g')) > 3
  AND NOT EXISTS (
    SELECT 1 FROM keyword_segments ks 
    WHERE ks.keyword = regexp_replace(industry_name, '[^가-힣a-zA-Z0-9\s]', '', 'g')
  )
GROUP BY industry_name
HAVING COUNT(*) >= 20;

-- 1.2 음식점업 세부 분류 확장
INSERT INTO keyword_segments (keyword, segment_type, segment_value, confidence_score, usage_count, last_used_at)
SELECT DISTINCT
    regexp_replace(industry_name, '[^가-힣a-zA-Z0-9\s]', '', 'g') as keyword,
    'category' as segment_type,
    '음식점' as segment_value,
    0.92 as confidence_score,
    COUNT(*) as usage_count,
    NOW() as last_used_at
FROM datacollection_national_pension 
WHERE industry_name ~ '음식점업$|식당업$|커피|음료|주점|카페'
  AND member_count > 0
  AND LENGTH(regexp_replace(industry_name, '[^가-힣a-zA-Z0-9\s]', '', 'g')) > 3
  AND NOT EXISTS (
    SELECT 1 FROM keyword_segments ks 
    WHERE ks.keyword = regexp_replace(industry_name, '[^가-힣a-zA-Z0-9\s]', '', 'g')
  )
GROUP BY industry_name
HAVING COUNT(*) >= 10;

-- 1.3 건설/부동산업 세부 분류 확장
INSERT INTO keyword_segments (keyword, segment_type, segment_value, confidence_score, usage_count, last_used_at)
SELECT DISTINCT
    regexp_replace(industry_name, '[^가-힣a-zA-Z0-9\s]', '', 'g') as keyword,
    'category' as segment_type,
    '건설/부동산' as segment_value,
    0.90 as confidence_score,
    COUNT(*) as usage_count,
    NOW() as last_used_at
FROM datacollection_national_pension 
WHERE industry_name ~ '건설업$|부동산|공사업$|시공|건축|토목|조경'
  AND member_count > 0
  AND LENGTH(regexp_replace(industry_name, '[^가-힣a-zA-Z0-9\s]', '', 'g')) > 3
  AND NOT EXISTS (
    SELECT 1 FROM keyword_segments ks 
    WHERE ks.keyword = regexp_replace(industry_name, '[^가-힣a-zA-Z0-9\s]', '', 'g')
  )
GROUP BY industry_name
HAVING COUNT(*) >= 15;

-- 1.4 서비스업 세부 분류 확장
INSERT INTO keyword_segments (keyword, segment_type, segment_value, confidence_score, usage_count, last_used_at)
SELECT DISTINCT
    regexp_replace(industry_name, '[^가-힣a-zA-Z0-9\s]', '', 'g') as keyword,
    'category' as segment_type,
    '서비스업' as segment_value,
    0.88 as confidence_score,
    COUNT(*) as usage_count,
    NOW() as last_used_at
FROM datacollection_national_pension 
WHERE industry_name ~ '서비스업$|컨설팅|청소|관리|수리|정비|지원|대행|알선'
  AND member_count > 0
  AND LENGTH(regexp_replace(industry_name, '[^가-힣a-zA-Z0-9\s]', '', 'g')) > 3
  AND NOT EXISTS (
    SELECT 1 FROM keyword_segments ks 
    WHERE ks.keyword = regexp_replace(industry_name, '[^가-힣a-zA-Z0-9\s]', '', 'g')
  )
GROUP BY industry_name
HAVING COUNT(*) >= 10;

-- 1.5 의료/보건업 세부 분류 확장
INSERT INTO keyword_segments (keyword, segment_type, segment_value, confidence_score, usage_count, last_used_at)
SELECT DISTINCT
    regexp_replace(industry_name, '[^가-힣a-zA-Z0-9\s]', '', 'g') as keyword,
    'category' as segment_type,
    '의료' as segment_value,
    0.95 as confidence_score,
    COUNT(*) as usage_count,
    NOW() as last_used_at
FROM datacollection_national_pension 
WHERE industry_name ~ '병원|의원|약국|의료|치과|한의|요양|보건|의약품|의료기기'
  AND member_count > 0
  AND LENGTH(regexp_replace(industry_name, '[^가-힣a-zA-Z0-9\s]', '', 'g')) > 3
  AND NOT EXISTS (
    SELECT 1 FROM keyword_segments ks 
    WHERE ks.keyword = regexp_replace(industry_name, '[^가-힣a-zA-Z0-9\s]', '', 'g')
  )
GROUP BY industry_name
HAVING COUNT(*) >= 5;

-- 1.6 교육업 세부 분류 확장
INSERT INTO keyword_segments (keyword, segment_type, segment_value, confidence_score, usage_count, last_used_at)
SELECT DISTINCT
    regexp_replace(industry_name, '[^가-힣a-zA-Z0-9\s]', '', 'g') as keyword,
    'category' as segment_type,
    '교육' as segment_value,
    0.90 as confidence_score,
    COUNT(*) as usage_count,
    NOW() as last_used_at
FROM datacollection_national_pension 
WHERE industry_name ~ '학원|교육|학교|연구|개발|학습|교습|훈련|컨설팅'
  AND member_count > 0
  AND LENGTH(regexp_replace(industry_name, '[^가-힣a-zA-Z0-9\s]', '', 'g')) > 3
  AND NOT EXISTS (
    SELECT 1 FROM keyword_segments ks 
    WHERE ks.keyword = regexp_replace(industry_name, '[^가-힣a-zA-Z0-9\s]', '', 'g')
  )
GROUP BY industry_name
HAVING COUNT(*) >= 5;

-- 1.7 금융업 세부 분류 확장
INSERT INTO keyword_segments (keyword, segment_type, segment_value, confidence_score, usage_count, last_used_at)
SELECT DISTINCT
    regexp_replace(industry_name, '[^가-힣a-zA-Z0-9\s]', '', 'g') as keyword,
    'category' as segment_type,
    '금융' as segment_value,
    0.95 as confidence_score,
    COUNT(*) as usage_count,
    NOW() as last_used_at
FROM datacollection_national_pension 
WHERE industry_name ~ '은행|신용|보험|증권|투자|금융|대출|리스|카드|결제'
  AND member_count > 0
  AND LENGTH(regexp_replace(industry_name, '[^가-힣a-zA-Z0-9\s]', '', 'g')) > 3
  AND NOT EXISTS (
    SELECT 1 FROM keyword_segments ks 
    WHERE ks.keyword = regexp_replace(industry_name, '[^가-힣a-zA-Z0-9\s]', '', 'g')
  )
GROUP BY industry_name
HAVING COUNT(*) >= 5;

-- 1.8 운송업 세부 분류 확장
INSERT INTO keyword_segments (keyword, segment_type, segment_value, confidence_score, usage_count, last_used_at)
SELECT DISTINCT
    regexp_replace(industry_name, '[^가-힣a-zA-Z0-9\s]', '', 'g') as keyword,
    'category' as segment_type,
    '운송' as segment_value,
    0.90 as confidence_score,
    COUNT(*) as usage_count,
    NOW() as last_used_at
FROM datacollection_national_pension 
WHERE industry_name ~ '운송|택시|버스|화물|배송|물류|항공|선박|철도|택배'
  AND member_count > 0
  AND LENGTH(regexp_replace(industry_name, '[^가-힣a-zA-Z0-9\s]', '', 'g')) > 3
  AND NOT EXISTS (
    SELECT 1 FROM keyword_segments ks 
    WHERE ks.keyword = regexp_replace(industry_name, '[^가-힣a-zA-Z0-9\s]', '', 'g')
  )
GROUP BY industry_name
HAVING COUNT(*) >= 5;

-- 1.9 소매업 세부 분류 확장
INSERT INTO keyword_segments (keyword, segment_type, segment_value, confidence_score, usage_count, last_used_at)
SELECT DISTINCT
    regexp_replace(industry_name, '[^가-힣a-zA-Z0-9\s]', '', 'g') as keyword,
    'category' as segment_type,
    '소매' as segment_value,
    0.88 as confidence_score,
    COUNT(*) as usage_count,
    NOW() as last_used_at
FROM datacollection_national_pension 
WHERE industry_name ~ '소매|마트|편의점|슈퍼|상점|판매|쇼핑|전자상거래|온라인'
  AND member_count > 0
  AND LENGTH(regexp_replace(industry_name, '[^가-힣a-zA-Z0-9\s]', '', 'g')) > 3
  AND NOT EXISTS (
    SELECT 1 FROM keyword_segments ks 
    WHERE ks.keyword = regexp_replace(industry_name, '[^가-힣a-zA-Z0-9\s]', '', 'g')
  )
GROUP BY industry_name
HAVING COUNT(*) >= 5;

-- 1.10 도매업 세부 분류 확장
INSERT INTO keyword_segments (keyword, segment_type, segment_value, confidence_score, usage_count, last_used_at)
SELECT DISTINCT
    regexp_replace(industry_name, '[^가-힣a-zA-Z0-9\s]', '', 'g') as keyword,
    'category' as segment_type,
    '도매' as segment_value,
    0.85 as confidence_score,
    COUNT(*) as usage_count,
    NOW() as last_used_at
FROM datacollection_national_pension 
WHERE industry_name ~ '도매|유통|수입|수출|무역|공급|판매|상품|종합'
  AND member_count > 0
  AND LENGTH(regexp_replace(industry_name, '[^가-힣a-zA-Z0-9\s]', '', 'g')) > 3
  AND NOT EXISTS (
    SELECT 1 FROM keyword_segments ks 
    WHERE ks.keyword = regexp_replace(industry_name, '[^가-힣a-zA-Z0-9\s]', '', 'g')
  )
GROUP BY industry_name
HAVING COUNT(*) >= 10;

-- 2. 지역별 세부 세그먼트 확장 (현재 2,864개 → 10,000개 목표)
-- 2.1 시도별 상세 지역 확장
INSERT INTO keyword_segments (keyword, segment_type, segment_value, confidence_score, usage_count, last_used_at)
SELECT DISTINCT
    CASE 
        WHEN sido_code = '11' THEN '서울특별시'
        WHEN sido_code = '26' THEN '부산광역시'  
        WHEN sido_code = '27' THEN '대구광역시'
        WHEN sido_code = '28' THEN '인천광역시'
        WHEN sido_code = '29' THEN '광주광역시'
        WHEN sido_code = '30' THEN '대전광역시'
        WHEN sido_code = '31' THEN '울산광역시'
        WHEN sido_code = '36' THEN '세종특별자치시'
        WHEN sido_code = '41' THEN '경기도'
        WHEN sido_code = '42' THEN '강원특별자치도'
        WHEN sido_code = '43' THEN '충청북도'
        WHEN sido_code = '44' THEN '충청남도'
        WHEN sido_code = '45' THEN '전북특별자치도'
        WHEN sido_code = '46' THEN '전라남도'
        WHEN sido_code = '47' THEN '경상북도'
        WHEN sido_code = '48' THEN '경상남도'
        WHEN sido_code = '50' THEN '제주특별자치도'
        ELSE '기타'
    END as keyword,
    'region' as segment_type,
    CASE 
        WHEN sido_code IN ('11', '26', '27', '28', '29', '30', '31', '36') THEN '특별시/광역시'
        WHEN sido_code IN ('41', '42', '43', '44', '45', '46', '47', '48') THEN '도'
        WHEN sido_code = '50' THEN '특별자치도'
        ELSE '기타'
    END as segment_value,
    0.98 as confidence_score,
    COUNT(*) as usage_count,
    NOW() as last_used_at
FROM datacollection_national_pension 
WHERE sido_code IS NOT NULL 
  AND member_count > 0
GROUP BY sido_code
HAVING COUNT(*) >= 100
ON CONFLICT (keyword, segment_type, segment_value) DO UPDATE SET
    usage_count = keyword_segments.usage_count + EXCLUDED.usage_count,
    last_used_at = NOW();

-- 2.2 시군구별 상세 지역 확장
INSERT INTO keyword_segments (keyword, segment_type, segment_value, confidence_score, usage_count, last_used_at)
SELECT DISTINCT
    substring(address_road from '^[가-힣\s]+[시군구]') as keyword,
    'region' as segment_type,
    'district' as segment_value,
    0.90 as confidence_score,
    COUNT(*) as usage_count,
    NOW() as last_used_at
FROM datacollection_national_pension 
WHERE address_road IS NOT NULL 
  AND address_road ~ '^[가-힣\s]+[시군구]'
  AND member_count > 0
  AND LENGTH(substring(address_road from '^[가-힣\s]+[시군구]')) > 3
  AND NOT EXISTS (
    SELECT 1 FROM keyword_segments ks 
    WHERE ks.keyword = substring(address_road from '^[가-힣\s]+[시군구]')
  )
GROUP BY substring(address_road from '^[가-힣\s]+[시군구]')
HAVING COUNT(*) >= 50;

-- 3. 기업 규모별 세그먼트 확장 (현재 1,334개 → 3,000개 목표)
-- 3.1 더 세분화된 규모 카테고리
INSERT INTO keyword_segments (keyword, segment_type, segment_value, confidence_score, usage_count, last_used_at)
SELECT 
    industry_name as keyword,
    'size' as segment_type,
    CASE 
        WHEN AVG(member_count) >= 500 THEN 'extra_large'
        WHEN AVG(member_count) >= 200 THEN 'large'
        WHEN AVG(member_count) >= 50 THEN 'medium_large'
        WHEN AVG(member_count) >= 20 THEN 'medium'
        WHEN AVG(member_count) >= 10 THEN 'small_medium'
        WHEN AVG(member_count) >= 5 THEN 'small'
        ELSE 'micro'
    END as segment_value,
    0.85 as confidence_score,
    COUNT(*) as usage_count,
    NOW() as last_used_at
FROM datacollection_national_pension 
WHERE member_count > 0 
  AND industry_name IS NOT NULL
  AND LENGTH(industry_name) > 3
  AND NOT EXISTS (
    SELECT 1 FROM keyword_segments ks 
    WHERE ks.keyword = industry_name AND ks.segment_type = 'size'
  )
GROUP BY industry_name
HAVING COUNT(*) >= 20 AND AVG(member_count) > 1;

-- 4. 빈도별 세그먼트 확장 (현재 541개 → 2,000개 목표)
-- 4.1 업종별 빈도 패턴 분석
INSERT INTO keyword_segments (keyword, segment_type, segment_value, confidence_score, usage_count, last_used_at)
SELECT 
    industry_name as keyword,
    'frequency' as segment_type,
    CASE 
        WHEN COUNT(*) >= 10000 THEN 'very_high'
        WHEN COUNT(*) >= 5000 THEN 'high'
        WHEN COUNT(*) >= 1000 THEN 'medium_high'
        WHEN COUNT(*) >= 500 THEN 'medium'
        WHEN COUNT(*) >= 100 THEN 'low_medium'
        WHEN COUNT(*) >= 50 THEN 'low'
        ELSE 'very_low'
    END as segment_value,
    0.80 as confidence_score,
    COUNT(*) as usage_count,
    NOW() as last_used_at
FROM datacollection_national_pension 
WHERE member_count > 0 
  AND industry_name IS NOT NULL
  AND LENGTH(industry_name) > 3
  AND NOT EXISTS (
    SELECT 1 FROM keyword_segments ks 
    WHERE ks.keyword = industry_name AND ks.segment_type = 'frequency'
  )
GROUP BY industry_name
HAVING COUNT(*) >= 20;

-- 5. 복합 키워드 패턴 생성 (5,000개 추가 목표)
-- 5.1 업종 + 지역 복합 키워드
INSERT INTO keyword_segments (keyword, segment_type, segment_value, confidence_score, usage_count, last_used_at)
SELECT 
    CONCAT(
        regexp_replace(industry_name, '[^가-힣a-zA-Z0-9\s]', '', 'g'),
        ' ',
        CASE 
            WHEN sido_code = '11' THEN '서울'
            WHEN sido_code = '26' THEN '부산'  
            WHEN sido_code = '27' THEN '대구'
            WHEN sido_code = '28' THEN '인천'
            WHEN sido_code = '41' THEN '경기'
            ELSE '지방'
        END
    ) as keyword,
    'composite' as segment_type,
    'industry_region' as segment_value,
    0.75 as confidence_score,
    COUNT(*) as usage_count,
    NOW() as last_used_at
FROM datacollection_national_pension 
WHERE member_count > 0 
  AND industry_name IS NOT NULL
  AND sido_code IN ('11', '26', '27', '28', '41')
  AND LENGTH(regexp_replace(industry_name, '[^가-힣a-zA-Z0-9\s]', '', 'g')) > 3
GROUP BY industry_name, sido_code
HAVING COUNT(*) >= 10;

-- 최종 확인 쿼리
SELECT 'Total segments after expansion:' as description, COUNT(*) as count FROM keyword_segments
UNION ALL
SELECT 'Category segments:' as description, COUNT(*) as count FROM keyword_segments WHERE segment_type = 'category'
UNION ALL  
SELECT 'Region segments:' as description, COUNT(*) as count FROM keyword_segments WHERE segment_type = 'region'
UNION ALL
SELECT 'Size segments:' as description, COUNT(*) as count FROM keyword_segments WHERE segment_type = 'size'
UNION ALL
SELECT 'Frequency segments:' as description, COUNT(*) as count FROM keyword_segments WHERE segment_type = 'frequency'
UNION ALL
SELECT 'Composite segments:' as description, COUNT(*) as count FROM keyword_segments WHERE segment_type = 'composite';