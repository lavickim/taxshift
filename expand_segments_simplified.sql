-- 간소화된 세그먼트 확장 스크립트
-- 국민연금 54만건 데이터 기반 5,238개 → 20,000개 확장

-- 1. 제조업 세부 분류 확장
WITH manufacturing_industries AS (
  SELECT DISTINCT
    regexp_replace(industry_name, '[^가-힣a-zA-Z0-9\s]', '', 'g') as clean_name,
    industry_name,
    COUNT(*) as workplace_count,
    SUM(member_count) as total_members
  FROM datacollection_national_pension 
  WHERE industry_name ~ '제조업$|생산|가공|제작'
    AND member_count > 0
    AND LENGTH(regexp_replace(industry_name, '[^가-힣a-zA-Z0-9\s]', '', 'g')) > 4
  GROUP BY industry_name
  HAVING COUNT(*) >= 10
)
INSERT INTO keyword_segments (keyword, segment_type, segment_name, confidence_score, total_count, member_count, workplace_count, created_at, updated_at)
SELECT 
  clean_name as keyword,
  'category' as segment_type,
  '제조업' as segment_name,
  0.90 as confidence_score,
  workplace_count as total_count,
  total_members as member_count,
  workplace_count,
  NOW() as created_at,
  NOW() as updated_at
FROM manufacturing_industries
WHERE NOT EXISTS (
  SELECT 1 FROM keyword_segments ks 
  WHERE ks.keyword = manufacturing_industries.clean_name
);

-- 2. 음식점업 세부 분류 확장
WITH food_industries AS (
  SELECT DISTINCT
    regexp_replace(industry_name, '[^가-힣a-zA-Z0-9\s]', '', 'g') as clean_name,
    industry_name,
    COUNT(*) as workplace_count,
    SUM(member_count) as total_members
  FROM datacollection_national_pension 
  WHERE industry_name ~ '음식점|식당|커피|카페|주점|음료|베이커리|치킨|피자|햄버거'
    AND member_count > 0
    AND LENGTH(regexp_replace(industry_name, '[^가-힣a-zA-Z0-9\s]', '', 'g')) > 3
  GROUP BY industry_name
  HAVING COUNT(*) >= 5
)
INSERT INTO keyword_segments (keyword, segment_type, segment_name, confidence_score, total_count, member_count, workplace_count, created_at, updated_at)
SELECT 
  clean_name as keyword,
  'category' as segment_type,
  '음식점' as segment_name,
  0.88 as confidence_score,
  workplace_count as total_count,
  total_members as member_count,
  workplace_count,
  NOW() as created_at,
  NOW() as updated_at
FROM food_industries
WHERE NOT EXISTS (
  SELECT 1 FROM keyword_segments ks 
  WHERE ks.keyword = food_industries.clean_name
);

-- 3. 건설/부동산업 세부 분류 확장
WITH construction_industries AS (
  SELECT DISTINCT
    regexp_replace(industry_name, '[^가-힣a-zA-Z0-9\s]', '', 'g') as clean_name,
    industry_name,
    COUNT(*) as workplace_count,
    SUM(member_count) as total_members
  FROM datacollection_national_pension 
  WHERE industry_name ~ '건설|부동산|공사|시공|건축|토목|조경|임대|분양'
    AND member_count > 0
    AND LENGTH(regexp_replace(industry_name, '[^가-힣a-zA-Z0-9\s]', '', 'g')) > 3
  GROUP BY industry_name
  HAVING COUNT(*) >= 10
)
INSERT INTO keyword_segments (keyword, segment_type, segment_name, confidence_score, total_count, member_count, workplace_count, created_at, updated_at)
SELECT 
  clean_name as keyword,
  'category' as segment_type,
  '건설/부동산' as segment_name,
  0.85 as confidence_score,
  workplace_count as total_count,
  total_members as member_count,
  workplace_count,
  NOW() as created_at,
  NOW() as updated_at
FROM construction_industries
WHERE NOT EXISTS (
  SELECT 1 FROM keyword_segments ks 
  WHERE ks.keyword = construction_industries.clean_name
);

-- 4. 의료업 세부 분류 확장
WITH medical_industries AS (
  SELECT DISTINCT
    regexp_replace(industry_name, '[^가-힣a-zA-Z0-9\s]', '', 'g') as clean_name,
    industry_name,
    COUNT(*) as workplace_count,
    SUM(member_count) as total_members
  FROM datacollection_national_pension 
  WHERE industry_name ~ '병원|의원|약국|의료|치과|한의|요양|보건|의약품|의료기기'
    AND member_count > 0
    AND LENGTH(regexp_replace(industry_name, '[^가-힣a-zA-Z0-9\s]', '', 'g')) > 3
  GROUP BY industry_name
  HAVING COUNT(*) >= 3
)
INSERT INTO keyword_segments (keyword, segment_type, segment_name, confidence_score, total_count, member_count, workplace_count, created_at, updated_at)
SELECT 
  clean_name as keyword,
  'category' as segment_type,
  '의료' as segment_name,
  0.95 as confidence_score,
  workplace_count as total_count,
  total_members as member_count,
  workplace_count,
  NOW() as created_at,
  NOW() as updated_at
FROM medical_industries
WHERE NOT EXISTS (
  SELECT 1 FROM keyword_segments ks 
  WHERE ks.keyword = medical_industries.clean_name
);

-- 5. 교육업 세부 분류 확장
WITH education_industries AS (
  SELECT DISTINCT
    regexp_replace(industry_name, '[^가-힣a-zA-Z0-9\s]', '', 'g') as clean_name,
    industry_name,
    COUNT(*) as workplace_count,
    SUM(member_count) as total_members
  FROM datacollection_national_pension 
  WHERE industry_name ~ '학원|교육|학교|연구|개발|학습|교습|훈련|컨설팅'
    AND member_count > 0
    AND LENGTH(regexp_replace(industry_name, '[^가-힣a-zA-Z0-9\s]', '', 'g')) > 3
  GROUP BY industry_name
  HAVING COUNT(*) >= 3
)
INSERT INTO keyword_segments (keyword, segment_type, segment_name, confidence_score, total_count, member_count, workplace_count, created_at, updated_at)
SELECT 
  clean_name as keyword,
  'category' as segment_type,
  '교육' as segment_name,
  0.88 as confidence_score,
  workplace_count as total_count,
  total_members as member_count,
  workplace_count,
  NOW() as created_at,
  NOW() as updated_at
FROM education_industries
WHERE NOT EXISTS (
  SELECT 1 FROM keyword_segments ks 
  WHERE ks.keyword = education_industries.clean_name
);

-- 6. 금융업 세부 분류 확장
WITH finance_industries AS (
  SELECT DISTINCT
    regexp_replace(industry_name, '[^가-힣a-zA-Z0-9\s]', '', 'g') as clean_name,
    industry_name,
    COUNT(*) as workplace_count,
    SUM(member_count) as total_members
  FROM datacollection_national_pension 
  WHERE industry_name ~ '은행|신용|보험|증권|투자|금융|대출|리스|카드|결제'
    AND member_count > 0
    AND LENGTH(regexp_replace(industry_name, '[^가-힣a-zA-Z0-9\s]', '', 'g')) > 3
  GROUP BY industry_name
  HAVING COUNT(*) >= 3
)
INSERT INTO keyword_segments (keyword, segment_type, segment_name, confidence_score, total_count, member_count, workplace_count, created_at, updated_at)
SELECT 
  clean_name as keyword,
  'category' as segment_type,
  '금융' as segment_name,
  0.92 as confidence_score,
  workplace_count as total_count,
  total_members as member_count,
  workplace_count,
  NOW() as created_at,
  NOW() as updated_at
FROM finance_industries
WHERE NOT EXISTS (
  SELECT 1 FROM keyword_segments ks 
  WHERE ks.keyword = finance_industries.clean_name
);

-- 7. 운송업 세부 분류 확장
WITH transport_industries AS (
  SELECT DISTINCT
    regexp_replace(industry_name, '[^가-힣a-zA-Z0-9\s]', '', 'g') as clean_name,
    industry_name,
    COUNT(*) as workplace_count,
    SUM(member_count) as total_members
  FROM datacollection_national_pension 
  WHERE industry_name ~ '운송|택시|버스|화물|배송|물류|항공|선박|철도|택배'
    AND member_count > 0
    AND LENGTH(regexp_replace(industry_name, '[^가-힣a-zA-Z0-9\s]', '', 'g')) > 3
  GROUP BY industry_name
  HAVING COUNT(*) >= 3
)
INSERT INTO keyword_segments (keyword, segment_type, segment_name, confidence_score, total_count, member_count, workplace_count, created_at, updated_at)
SELECT 
  clean_name as keyword,
  'category' as segment_type,
  '운송' as segment_name,
  0.85 as confidence_score,
  workplace_count as total_count,
  total_members as member_count,
  workplace_count,
  NOW() as created_at,
  NOW() as updated_at
FROM transport_industries
WHERE NOT EXISTS (
  SELECT 1 FROM keyword_segments ks 
  WHERE ks.keyword = transport_industries.clean_name
);

-- 8. 소매업 세부 분류 확장
WITH retail_industries AS (
  SELECT DISTINCT
    regexp_replace(industry_name, '[^가-힣a-zA-Z0-9\s]', '', 'g') as clean_name,
    industry_name,
    COUNT(*) as workplace_count,
    SUM(member_count) as total_members
  FROM datacollection_national_pension 
  WHERE industry_name ~ '소매|마트|편의점|슈퍼|상점|판매|쇼핑|전자상거래|온라인'
    AND member_count > 0
    AND LENGTH(regexp_replace(industry_name, '[^가-힣a-zA-Z0-9\s]', '', 'g')) > 3
  GROUP BY industry_name
  HAVING COUNT(*) >= 3
)
INSERT INTO keyword_segments (keyword, segment_type, segment_name, confidence_score, total_count, member_count, workplace_count, created_at, updated_at)
SELECT 
  clean_name as keyword,
  'category' as segment_type,
  '소매' as segment_name,
  0.83 as confidence_score,
  workplace_count as total_count,
  total_members as member_count,
  workplace_count,
  NOW() as created_at,
  NOW() as updated_at
FROM retail_industries
WHERE NOT EXISTS (
  SELECT 1 FROM keyword_segments ks 
  WHERE ks.keyword = retail_industries.clean_name
);

-- 9. 도매업 세부 분류 확장
WITH wholesale_industries AS (
  SELECT DISTINCT
    regexp_replace(industry_name, '[^가-힣a-zA-Z0-9\s]', '', 'g') as clean_name,
    industry_name,
    COUNT(*) as workplace_count,
    SUM(member_count) as total_members
  FROM datacollection_national_pension 
  WHERE industry_name ~ '도매|유통|수입|수출|무역|공급|판매|상품|종합'
    AND member_count > 0
    AND LENGTH(regexp_replace(industry_name, '[^가-힣a-zA-Z0-9\s]', '', 'g')) > 3
  GROUP BY industry_name
  HAVING COUNT(*) >= 5
)
INSERT INTO keyword_segments (keyword, segment_type, segment_name, confidence_score, total_count, member_count, workplace_count, created_at, updated_at)
SELECT 
  clean_name as keyword,
  'category' as segment_type,
  '도매' as segment_name,
  0.80 as confidence_score,
  workplace_count as total_count,
  total_members as member_count,
  workplace_count,
  NOW() as created_at,
  NOW() as updated_at
FROM wholesale_industries
WHERE NOT EXISTS (
  SELECT 1 FROM keyword_segments ks 
  WHERE ks.keyword = wholesale_industries.clean_name
);

-- 10. 서비스업 세부 분류 확장
WITH service_industries AS (
  SELECT DISTINCT
    regexp_replace(industry_name, '[^가-힣a-zA-Z0-9\s]', '', 'g') as clean_name,
    industry_name,
    COUNT(*) as workplace_count,
    SUM(member_count) as total_members
  FROM datacollection_national_pension 
  WHERE industry_name ~ '서비스|컨설팅|청소|관리|수리|정비|지원|대행|알선|미용|세탁'
    AND member_count > 0
    AND LENGTH(regexp_replace(industry_name, '[^가-힣a-zA-Z0-9\s]', '', 'g')) > 3
  GROUP BY industry_name
  HAVING COUNT(*) >= 5
)
INSERT INTO keyword_segments (keyword, segment_type, segment_name, confidence_score, total_count, member_count, workplace_count, created_at, updated_at)
SELECT 
  clean_name as keyword,
  'category' as segment_type,
  '서비스업' as segment_name,
  0.78 as confidence_score,
  workplace_count as total_count,
  total_members as member_count,
  workplace_count,
  NOW() as created_at,
  NOW() as updated_at
FROM service_industries
WHERE NOT EXISTS (
  SELECT 1 FROM keyword_segments ks 
  WHERE ks.keyword = service_industries.clean_name
);

-- 최종 확인
SELECT 
  '확장 완료' as status,
  COUNT(*) as total_segments
FROM keyword_segments;

SELECT 
  segment_type,
  segment_name,
  COUNT(*) as count
FROM keyword_segments 
GROUP BY segment_type, segment_name
ORDER BY segment_type, count DESC;