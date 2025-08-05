-- Phase 3 누락된 규칙들 추가 (Priority 98-85)

INSERT INTO regex_preprocessing_rules (
    rule_name, description, category, input_pattern, output_template, 
    priority, is_active, metadata_tags, test_cases, test_examples, 
    usage_count, success_rate, created_at, updated_at
) VALUES 
-- 27. 정부기관 예외
(
    '예외_정부기관_보존', 
    '정부기관명 원본 보존', 
    '예외처리', 
    '(국세청|세무서|구청|시청|도청|경찰서|소방서|보건소)', 
    '$1', 
    98, 
    true, 
    '{"type": "exception", "category": "government", "action": "preserve"}',
    '[{"input": "강남구청", "expected": "강남구청"}]',
    '{"강남구청", "서초세무서", "역삼경찰서"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 28. 학교기관 예외
(
    '예외_학교기관_보존', 
    '학교기관명 원본 보존', 
    '예외처리', 
    '(서울대학교|연세대학교|고려대학교|KAIST|POSTECH)', 
    '$1', 
    97, 
    true, 
    '{"type": "exception", "category": "university", "action": "preserve"}',
    '[{"input": "서울대학교", "expected": "서울대학교"}]',
    '{"서울대학교", "연세대학교", "KAIST"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 29. 해외서비스 예외
(
    '예외_해외서비스_보존', 
    '해외서비스명 원본 보존', 
    '예외처리', 
    '(GOOGLE|APPLE|AMAZON|NETFLIX|SPOTIFY|UBER)', 
    '$1', 
    96, 
    true, 
    '{"type": "exception", "category": "global_service", "action": "preserve"}',
    '[{"input": "GOOGLE", "expected": "GOOGLE"}]',
    '{"GOOGLE", "APPLE", "AMAZON", "NETFLIX"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 30. 대형병원 예외
(
    '예외_대형병원_보존', 
    '대형병원명 원본 보존', 
    '예외처리', 
    '(서울대병원|삼성서울병원|세브란스병원|서울아산병원)', 
    '$1', 
    95, 
    true, 
    '{"type": "exception", "category": "major_hospital", "action": "preserve"}',
    '[{"input": "서울대병원", "expected": "서울대병원"}]',
    '{"서울대병원", "삼성서울병원", "세브란스병원"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 31. 맥도날드 통합 (수정된 버전)
(
    '영문_맥도날드_통합_v2', 
    '맥도날드 영문/한글 통합 수정', 
    '영문통합', 
    'MCDONALDS|McDONALDS|McDonalds|맥도날드', 
    '맥도날드', 
    94, 
    true, 
    '{"type": "brand_unify", "brand": "mcdonalds", "language": "korean"}',
    '[{"input": "MCDONALDS", "expected": "맥도날드"}]',
    '{"MCDONALDS", "McDonalds", "맥도날드"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 32. 위치정보 정규화
(
    '위치_동_정규화', 
    '동 단위 위치정보 정규화', 
    '위치정보', 
    '(.+?)\\s*(동|DONG)', 
    '$1동', 
    93, 
    true, 
    '{"type": "location", "level": "dong", "format": "korean"}',
    '[{"input": "역삼 동", "expected": "역삼동"}]',
    '{"역삼 동", "강남DONG", "서초 동"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 33. 로 단위 정규화
(
    '위치_로_정규화', 
    '로 단위 위치정보 정규화', 
    '위치정보', 
    '(.+?)\\s*(로|RO)', 
    '$1로', 
    92, 
    true, 
    '{"type": "location", "level": "ro", "format": "korean"}',
    '[{"input": "테헤란 로", "expected": "테헤란로"}]',
    '{"테헤란 로", "강남대RO", "서초 로"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 34. 길 단위 정규화
(
    '위치_길_정규화', 
    '길 단위 위치정보 정규화', 
    '위치정보', 
    '(.+?)\\s*(길|GIL)', 
    '$1길', 
    91, 
    true, 
    '{"type": "location", "level": "gil", "format": "korean"}',
    '[{"input": "선릉 길", "expected": "선릉길"}]',
    '{"선릉 길", "역삼GIL", "강남 길"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 35. 시간정보 제거
(
    '시간_시간_제거', 
    '시간 정보 제거', 
    '시간정보', 
    '\\d{1,2}:\\d{2}(:\\d{2})?', 
    '', 
    90, 
    true, 
    '{"type": "temporal", "target": "time", "action": "remove"}',
    '[{"input": "스타벅스 15:30", "expected": "스타벅스 "}]',
    '{"스타벅스 15:30", "이마트 09:00", "CU 23:59"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 36. 날짜정보 제거
(
    '시간_날짜_제거', 
    '날짜 정보 제거', 
    '시간정보', 
    '\\d{4}[-/]\\d{1,2}[-/]\\d{1,2}', 
    '', 
    89, 
    true, 
    '{"type": "temporal", "target": "date", "action": "remove"}',
    '[{"input": "스타벅스 2025-01-01", "expected": "스타벅스 "}]',
    '{"스타벅스 2025-01-01", "이마트 2025/01/01", "CU 25-01-01"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 37. 요일정보 제거
(
    '시간_요일_제거', 
    '요일 정보 제거', 
    '시간정보', 
    '\\s*(월|화|수|목|금|토|일)요일\\s*', 
    ' ', 
    88, 
    true, 
    '{"type": "temporal", "target": "weekday", "action": "remove"}',
    '[{"input": "스타벅스 월요일", "expected": "스타벅스 "}]',
    '{"스타벅스 월요일", "이마트 토요일", "CU 일요일"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 38. 층수정보 정규화
(
    '위치_층수_정규화', 
    '층수 정보 정규화', 
    '위치정보', 
    '(.+?)\\s*(\\d+)\\s*층', 
    '$1 $2층', 
    87, 
    true, 
    '{"type": "location", "level": "floor", "format": "normalized"}',
    '[{"input": "스타벅스 3 층", "expected": "스타벅스 3층"}]',
    '{"스타벅스 3 층", "이마트 1층", "CU 지하 1층"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 39. 호수정보 정규화
(
    '위치_호수_정규화', 
    '호수 정보 정규화', 
    '위치정보', 
    '(.+?)\\s*(\\d+)\\s*호', 
    '$1 $2호', 
    86, 
    true, 
    '{"type": "location", "level": "unit", "format": "normalized"}',
    '[{"input": "스타벅스 101 호", "expected": "스타벅스 101호"}]',
    '{"스타벅스 101 호", "이마트 205호", "CU 301 호"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 40. 번지수 정규화
(
    '위치_번지_정규화', 
    '번지수 정보 정규화', 
    '위치정보', 
    '(.+?)\\s*(\\d+)\\s*번지', 
    '$1 $2번지', 
    85, 
    true, 
    '{"type": "location", "level": "address", "format": "normalized"}',
    '[{"input": "역삼동 123 번지", "expected": "역삼동 123번지"}]',
    '{"역삼동 123 번지", "강남구 456번지", "서초 789 번지"}',
    0, 
    null,
    NOW(), 
    NOW()
);

SELECT 'Phase 3 누락된 규칙들이 성공적으로 추가되었습니다.' as status;