-- 54만건 국민연금 데이터에서 키워드 배치 추출 SQL
-- 배치 처리로 업종명에서 키워드를 추출하여 기존 테이블에 저장

-- 1. 업종명에서 키워드 추출 함수 생성
CREATE OR REPLACE FUNCTION extract_keywords_from_industry(industry_text TEXT)
RETURNS TEXT[] AS $$
DECLARE
    keywords TEXT[];
    keyword TEXT;
    cleaned_text TEXT;
BEGIN
    -- NULL 체크
    IF industry_text IS NULL OR LENGTH(TRIM(industry_text)) = 0 THEN
        RETURN ARRAY[]::TEXT[];
    END IF;
    
    -- 텍스트 정규화
    cleaned_text := TRIM(industry_text);
    
    -- 키워드 추출 패턴들
    keywords := ARRAY[]::TEXT[];
    
    -- 1. ~업 패턴 (제조업, 서비스업 등)
    IF cleaned_text ~ '(.+)업$' THEN
        keyword := SUBSTRING(cleaned_text FROM '(.+)업$');
        IF LENGTH(keyword) >= 2 AND LENGTH(keyword) <= 10 THEN
            keywords := array_append(keywords, keyword || '업');
        END IF;
    END IF;
    
    -- 2. ~점 패턴 (편의점, 주유점 등)
    IF cleaned_text ~ '(.+)점$' THEN
        keyword := SUBSTRING(cleaned_text FROM '(.+)점$');
        IF LENGTH(keyword) >= 2 AND LENGTH(keyword) <= 10 THEN
            keywords := array_append(keywords, keyword || '점');
        END IF;
    END IF;
    
    -- 3. ~소 패턴 (사업소, 연구소 등)
    IF cleaned_text ~ '(.+)소$' THEN
        keyword := SUBSTRING(cleaned_text FROM '(.+)소$');
        IF LENGTH(keyword) >= 2 AND LENGTH(keyword) <= 10 THEN
            keywords := array_append(keywords, keyword || '소');
        END IF;
    END IF;
    
    -- 4. ~원 패턴 (병원, 의원 등)
    IF cleaned_text ~ '(.+)원$' THEN
        keyword := SUBSTRING(cleaned_text FROM '(.+)원$');
        IF LENGTH(keyword) >= 2 AND LENGTH(keyword) <= 10 THEN
            keywords := array_append(keywords, keyword || '원');
        END IF;
    END IF;
    
    -- 5. ~센터 패턴
    IF cleaned_text LIKE '%센터%' THEN
        keywords := array_append(keywords, '센터');
    END IF;
    
    -- 6. ~마트 패턴
    IF cleaned_text LIKE '%마트%' THEN
        keywords := array_append(keywords, '마트');
    END IF;
    
    -- 7. 전체 업종명도 키워드로 추가 (10글자 이하)
    IF LENGTH(cleaned_text) <= 10 AND LENGTH(cleaned_text) >= 2 THEN
        keywords := array_append(keywords, cleaned_text);
    END IF;
    
    -- 중복 제거
    SELECT ARRAY(SELECT DISTINCT unnest(keywords)) INTO keywords;
    
    RETURN keywords;
END;
$$ LANGUAGE plpgsql;

-- 2. 카테고리 분류 함수
CREATE OR REPLACE FUNCTION categorize_industry(industry_text TEXT)
RETURNS TEXT AS $$
BEGIN
    IF industry_text IS NULL THEN
        RETURN '기타';
    END IF;
    
    -- 음식점 관련
    IF industry_text ~ '.*(음식|식당|카페|커피|치킨|피자|레스토랑).*' THEN
        RETURN '음식점';
    END IF;
    
    -- 의료 관련
    IF industry_text ~ '.*(병원|의원|치과|약국|클리닉|한의원).*' THEN
        RETURN '의료';
    END IF;
    
    -- 교육 관련
    IF industry_text ~ '.*(학교|학원|교육|대학|유치원).*' THEN
        RETURN '교육';
    END IF;
    
    -- 소매 관련
    IF industry_text ~ '.*(마트|편의점|슈퍼|상점|백화점).*' THEN
        RETURN '소매';
    END IF;
    
    -- 제조업 관련
    IF industry_text ~ '.*(제조|공장|생산|가공|기계).*' THEN
        RETURN '제조업';
    END IF;
    
    -- 건설/부동산 관련
    IF industry_text ~ '.*(부동산|건설|시공|건축|인테리어).*' THEN
        RETURN '건설/부동산';
    END IF;
    
    -- 운송 관련
    IF industry_text ~ '.*(운송|배송|택배|물류|운수).*' THEN
        RETURN '운송';
    END IF;
    
    -- 미용 관련
    IF industry_text ~ '.*(미용|헤어|네일|에스테틱|화장품).*' THEN
        RETURN '미용';
    END IF;
    
    -- 서비스업
    IF industry_text ~ '.*(서비스|상담|컨설팅|관리).*' THEN
        RETURN '서비스업';
    END IF;
    
    RETURN '기타';
END;
$$ LANGUAGE plpgsql;

-- 3. 배치로 키워드 추출 및 업데이트 (1000개씩 처리)
DO $$
DECLARE
    batch_size INTEGER := 1000;
    total_count INTEGER;
    processed_count INTEGER := 0;
    current_batch INTEGER := 0;
    start_time TIMESTAMP;
    batch_start_time TIMESTAMP;
BEGIN
    start_time := CLOCK_TIMESTAMP();
    
    -- 전체 처리 대상 수 조회
    SELECT COUNT(*) INTO total_count 
    FROM datacollection_national_pension 
    WHERE workplace_status_code = '1' 
      AND industry_name IS NOT NULL 
      AND industry_name != 'BIZ_NO미존재사업장'
      AND industry_name != '해당없음'
      AND extracted_keywords IS NULL;
    
    RAISE NOTICE '🚀 54만건 키워드 추출 시작 - 처리 대상: % 건', total_count;
    
    -- 배치 처리 루프
    WHILE processed_count < total_count LOOP
        current_batch := current_batch + 1;
        batch_start_time := CLOCK_TIMESTAMP();
        
        -- 배치 단위로 키워드 추출 및 업데이트
        UPDATE datacollection_national_pension 
        SET 
            extracted_keywords = extract_keywords_from_industry(industry_name),
            keyword_category = categorize_industry(industry_name),
            keyword_confidence = 0.85,
            keyword_extraction_date = CURRENT_TIMESTAMP
        WHERE id IN (
            SELECT id 
            FROM datacollection_national_pension 
            WHERE workplace_status_code = '1' 
              AND industry_name IS NOT NULL 
              AND industry_name != 'BIZ_NO미존재사업장'
              AND industry_name != '해당없음'
              AND extracted_keywords IS NULL
            ORDER BY id
            LIMIT batch_size
        );
        
        processed_count := processed_count + batch_size;
        
        RAISE NOTICE '📊 배치 % 완료 - 처리됨: %/% (%.1f%%) - 소요시간: %ms', 
            current_batch, 
            LEAST(processed_count, total_count), 
            total_count, 
            (LEAST(processed_count, total_count) * 100.0 / total_count),
            EXTRACT(EPOCH FROM (CLOCK_TIMESTAMP() - batch_start_time)) * 1000;
        
        -- 10배치마다 커밋
        IF current_batch % 10 = 0 THEN
            COMMIT;
        END IF;
    END LOOP;
    
    RAISE NOTICE '🎉 키워드 추출 완료! 총 처리시간: %초', 
        EXTRACT(EPOCH FROM (CLOCK_TIMESTAMP() - start_time));
END $$;

-- 4. 결과 통계 조회
SELECT 
    '키워드 추출 통계' as 구분,
    COUNT(*) as 총_처리건수,
    COUNT(CASE WHEN array_length(extracted_keywords, 1) > 0 THEN 1 END) as 키워드_추출_성공,
    COUNT(CASE WHEN keyword_category != '기타' THEN 1 END) as 카테고리_분류_성공,
    ROUND(AVG(keyword_confidence), 3) as 평균_신뢰도
FROM datacollection_national_pension 
WHERE extracted_keywords IS NOT NULL;

-- 5. 카테고리별 통계
SELECT 
    keyword_category as 카테고리,
    COUNT(*) as 건수,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as 비율_퍼센트
FROM datacollection_national_pension 
WHERE extracted_keywords IS NOT NULL
GROUP BY keyword_category
ORDER BY COUNT(*) DESC;

-- 6. 추출된 키워드 빈도 TOP 20
SELECT 
    keyword as 키워드,
    COUNT(*) as 빈도,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 3) as 비율_퍼센트
FROM (
    SELECT unnest(extracted_keywords) as keyword
    FROM datacollection_national_pension 
    WHERE extracted_keywords IS NOT NULL
) as keyword_list
GROUP BY keyword
ORDER BY COUNT(*) DESC
LIMIT 20;