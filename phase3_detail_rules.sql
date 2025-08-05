-- MoneyShift v1.0: Phase 3 세부 40개 규칙 (Priority 124-85)
-- 생성일: 2025-07-27
-- 목적: 특수문자 정리 + 영문/한글 통합 + 예외 처리

-- 필요한 카테고리 추가
INSERT INTO regex_preprocessing_categories (category_name, description, is_active, created_at)
VALUES 
('특수문자', '특수문자/공백/숫자 정리', true, NOW()),
('영문통합', '영문/한글 브랜드명 통합', true, NOW()),
('예외처리', '해외서비스/정부기관 예외처리', true, NOW()),
('문자정리', '불필요한 문자/기호 제거', true, NOW()),
('위치정보', '주소/위치 정보 정규화', true, NOW()),
('시간정보', '시간/날짜 관련 정보', true, NOW())
ON CONFLICT (category_name) DO NOTHING;

-- Phase 3-1: 특수문자 정리 (12개 규칙) - Priority 124-113
INSERT INTO regex_preprocessing_rules (
    rule_name, description, category, input_pattern, output_template, 
    priority, is_active, metadata_tags, test_cases, test_examples, 
    usage_count, success_rate, created_at, updated_at
) VALUES 
-- 1. 괄호 내용 제거
(
    '문자_괄호_제거', 
    '괄호와 내용 제거', 
    '특수문자', 
    '(.+?)\\s*\\([^)]+\\)\\s*(.*)', 
    '$1 $2', 
    124, 
    true, 
    '{"type": "cleanup", "target": "parentheses", "action": "remove"}',
    '[{"input": "스타벅스(강남점)", "expected": "스타벅스 "}]',
    '{"스타벅스(강남점)", "맥도날드(역삼)", "이마트(서초점)"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 2. 대괄호 내용 제거
(
    '문자_대괄호_제거', 
    '대괄호와 내용 제거', 
    '특수문자', 
    '(.+?)\\s*\\[[^\\]]+\\]\\s*(.*)', 
    '$1 $2', 
    123, 
    true, 
    '{"type": "cleanup", "target": "square_brackets", "action": "remove"}',
    '[{"input": "커피빈[강남점]", "expected": "커피빈 "}]',
    '{"커피빈[강남점]", "투썸[역삼]", "할리스[서초]"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 3. 중괄호 내용 제거
(
    '문자_중괄호_제거', 
    '중괄호와 내용 제거', 
    '특수문자', 
    '(.+?)\\s*\\{[^}]+\\}\\s*(.*)', 
    '$1 $2', 
    122, 
    true, 
    '{"type": "cleanup", "target": "curly_brackets", "action": "remove"}',
    '[{"input": "이디야{강남점}", "expected": "이디야 "}]',
    '{"이디야{강남점}", "메가커피{역삼}", "카페베네{서초}"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 4. 연속 공백 정리
(
    '문자_공백_정리', 
    '연속된 공백을 하나로 정리', 
    '특수문자', 
    '\\s{2,}', 
    ' ', 
    121, 
    true, 
    '{"type": "cleanup", "target": "whitespace", "action": "normalize"}',
    '[{"input": "스타벅스    강남점", "expected": "스타벅스 강남점"}]',
    '{"스타벅스    강남점", "이마트     서초", "CU   역삼"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 5. 숫자 연속 제거
(
    '문자_숫자연속_제거', 
    '불필요한 연속 숫자 제거', 
    '특수문자', 
    '(.+?)\\s*\\d{4,}\\s*(.*)', 
    '$1 $2', 
    120, 
    true, 
    '{"type": "cleanup", "target": "numbers", "action": "remove_long"}',
    '[{"input": "스타벅스 1234567 강남", "expected": "스타벅스  강남"}]',
    '{"스타벅스 1234567 강남", "이마트 9876543", "CU 5555"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 6. 특수기호 제거
(
    '문자_특수기호_제거', 
    '불필요한 특수기호 제거', 
    '특수문자', 
    '[#@$%^&*+=~`|\\\\]', 
    '', 
    119, 
    true, 
    '{"type": "cleanup", "target": "symbols", "action": "remove"}',
    '[{"input": "스타벅스#강남", "expected": "스타벅스강남"}]',
    '{"스타벅스#강남", "이마트@서초", "CU$역삼"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 7. 하이픈 정리
(
    '문자_하이픈_정리', 
    '하이픈을 공백으로 변환', 
    '특수문자', 
    '(.+?)-(.+)', 
    '$1 $2', 
    118, 
    true, 
    '{"type": "cleanup", "target": "hyphen", "action": "replace_space"}',
    '[{"input": "스타벅스-강남점", "expected": "스타벅스 강남점"}]',
    '{"스타벅스-강남점", "이마트-서초", "CU-역삼"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 8. 언더스코어 정리
(
    '문자_언더스코어_정리', 
    '언더스코어를 공백으로 변환', 
    '특수문자', 
    '(.+?)_(.+)', 
    '$1 $2', 
    117, 
    true, 
    '{"type": "cleanup", "target": "underscore", "action": "replace_space"}',
    '[{"input": "STARBUCKS_GANGNAM", "expected": "STARBUCKS GANGNAM"}]',
    '{"STARBUCKS_GANGNAM", "EMART_SEOCHO", "CU_YEOKSAM"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 9. 점(마침표) 정리
(
    '문자_점_정리', 
    '점을 공백으로 변환 (소수점 제외)', 
    '특수문자', 
    '([가-힣A-Za-z])\\s*\\.\\s*([가-힣A-Za-z])', 
    '$1 $2', 
    116, 
    true, 
    '{"type": "cleanup", "target": "period", "action": "replace_space"}',
    '[{"input": "스타벅스.강남", "expected": "스타벅스 강남"}]',
    '{"스타벅스.강남", "STARBUCKS.GANGNAM", "이마트.서초"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 10. 쉼표 정리
(
    '문자_쉼표_정리', 
    '쉼표를 공백으로 변환', 
    '특수문자', 
    '(.+?),(.+)', 
    '$1 $2', 
    115, 
    true, 
    '{"type": "cleanup", "target": "comma", "action": "replace_space"}',
    '[{"input": "스타벅스,강남점", "expected": "스타벅스 강남점"}]',
    '{"스타벅스,강남점", "이마트,서초", "CU,역삼"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 11. 세미콜론 정리
(
    '문자_세미콜론_정리', 
    '세미콜론을 공백으로 변환', 
    '특수문자', 
    '(.+?);(.+)', 
    '$1 $2', 
    114, 
    true, 
    '{"type": "cleanup", "target": "semicolon", "action": "replace_space"}',
    '[{"input": "스타벅스;강남점", "expected": "스타벅스 강남점"}]',
    '{"스타벅스;강남점", "이마트;서초", "CU;역삼"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 12. 앞뒤 공백 제거
(
    '문자_앞뒤공백_제거', 
    '앞뒤 불필요한 공백 제거', 
    '특수문자', 
    '^\\s+|\\s+$', 
    '', 
    113, 
    true, 
    '{"type": "cleanup", "target": "trim", "action": "remove_edges"}',
    '[{"input": "  스타벅스  ", "expected": "스타벅스"}]',
    '{"  스타벅스  ", "   이마트   ", "  CU  "}',
    0, 
    null,
    NOW(), 
    NOW()
);

-- Phase 3-2: 영문/한글 통합 (14개 규칙) - Priority 112-99
INSERT INTO regex_preprocessing_rules (
    rule_name, description, category, input_pattern, output_template, 
    priority, is_active, metadata_tags, test_cases, test_examples, 
    usage_count, success_rate, created_at, updated_at
) VALUES 
-- 13. 스타벅스 통합
(
    '영문_스타벅스_통합', 
    '스타벅스 영문/한글 통합', 
    '영문통합', 
    'STARBUCKS|starbucks|Starbucks|스타벅스', 
    '스타벅스', 
    112, 
    true, 
    '{"type": "brand_unify", "brand": "starbucks", "language": "korean"}',
    '[{"input": "STARBUCKS", "expected": "스타벅스"}]',
    '{"STARBUCKS", "starbucks", "Starbucks Coffee"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 14. 맥도날드 통합
(
    '영문_맥도날드_통합', 
    '맥도날드 영문/한글 통합', 
    '영문통합', 
    'MCDONALDS|McDONALDS|McDonalds|맥도날드', 
    '맥도날드', 
    111, 
    true, 
    '{"type": "brand_unify", "brand": "mcdonalds", "language": "korean"}',
    '[{"input": "MCDONALDS", "expected": "맥도날드"}]',
    '{"MCDONALDS", "McDonalds", "McDonald\\'s"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 15. 버거킹 통합
(
    '영문_버거킹_통합', 
    '버거킹 영문/한글 통합', 
    '영문통합', 
    'BURGER\\s*KING|Burger\\s*King|버거킹', 
    '버거킹', 
    110, 
    true, 
    '{"type": "brand_unify", "brand": "burger_king", "language": "korean"}',
    '[{"input": "BURGER KING", "expected": "버거킹"}]',
    '{"BURGER KING", "Burger King", "BURGERKING"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 16. KFC 통합
(
    '영문_KFC_통합', 
    'KFC 영문/한글 통합', 
    '영문통합', 
    'KFC|kfc|Kfc|켄터키|KENTUCKY', 
    'KFC', 
    109, 
    true, 
    '{"type": "brand_unify", "brand": "kfc", "language": "english"}',
    '[{"input": "KENTUCKY", "expected": "KFC"}]',
    '{"kfc", "KENTUCKY FRIED CHICKEN", "켄터키"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 17. 롯데리아 통합
(
    '영문_롯데리아_통합', 
    '롯데리아 영문/한글 통합', 
    '영문통합', 
    'LOTTERIA|Lotteria|lotteria|롯데리아', 
    '롯데리아', 
    108, 
    true, 
    '{"type": "brand_unify", "brand": "lotteria", "language": "korean"}',
    '[{"input": "LOTTERIA", "expected": "롯데리아"}]',
    '{"LOTTERIA", "Lotteria", "lotteria"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 18. 이마트 통합
(
    '영문_이마트_통합', 
    '이마트 영문/한글 통합', 
    '영문통합', 
    'E-?MART|EMART|emart|Emart|이마트', 
    '이마트', 
    107, 
    true, 
    '{"type": "brand_unify", "brand": "emart", "language": "korean"}',
    '[{"input": "E-MART", "expected": "이마트"}]',
    '{"E-MART", "EMART", "emart"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 19. 홈플러스 통합
(
    '영문_홈플러스_통합', 
    '홈플러스 영문/한글 통합', 
    '영문통합', 
    'HOMEPLUS|HOME\\s*PLUS|homeplus|홈플러스', 
    '홈플러스', 
    106, 
    true, 
    '{"type": "brand_unify", "brand": "homeplus", "language": "korean"}',
    '[{"input": "HOMEPLUS", "expected": "홈플러스"}]',
    '{"HOMEPLUS", "HOME PLUS", "homeplus"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 20. 롯데마트 통합
(
    '영문_롯데마트_통합', 
    '롯데마트 영문/한글 통합', 
    '영문통합', 
    'LOTTE\\s*MART|LOTTEMART|lottemart|롯데마트', 
    '롯데마트', 
    105, 
    true, 
    '{"type": "brand_unify", "brand": "lotte_mart", "language": "korean"}',
    '[{"input": "LOTTE MART", "expected": "롯데마트"}]',
    '{"LOTTE MART", "LOTTEMART", "lottemart"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 21. 코스트코 통합
(
    '영문_코스트코_통합', 
    '코스트코 영문/한글 통합', 
    '영문통합', 
    'COSTCO|costco|Costco|코스트코', 
    '코스트코', 
    104, 
    true, 
    '{"type": "brand_unify", "brand": "costco", "language": "korean"}',
    '[{"input": "COSTCO", "expected": "코스트코"}]',
    '{"COSTCO", "costco", "Costco Wholesale"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 22. 현대백화점 통합
(
    '영문_현대백화점_통합', 
    '현대백화점 영문/한글 통합', 
    '영문통합', 
    'HYUNDAI\\s*DEPT|HYUNDAI|현대백화점|현대', 
    '현대백화점', 
    103, 
    true, 
    '{"type": "brand_unify", "brand": "hyundai_dept", "language": "korean"}',
    '[{"input": "HYUNDAI DEPT", "expected": "현대백화점"}]',
    '{"HYUNDAI DEPT", "HYUNDAI", "현대백화점"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 23. 신세계백화점 통합
(
    '영문_신세계_통합', 
    '신세계백화점 영문/한글 통합', 
    '영문통합', 
    'SHINSEGAE|shinsegae|Shinsegae|신세계', 
    '신세계', 
    102, 
    true, 
    '{"type": "brand_unify", "brand": "shinsegae", "language": "korean"}',
    '[{"input": "SHINSEGAE", "expected": "신세계"}]',
    '{"SHINSEGAE", "shinsegae", "Shinsegae"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 24. 올리브영 통합
(
    '영문_올리브영_통합', 
    '올리브영 영문/한글 통합', 
    '영문통합', 
    'OLIVE\\s*YOUNG|OLIVEYOUNG|oliveyoung|올리브영', 
    '올리브영', 
    101, 
    true, 
    '{"type": "brand_unify", "brand": "olive_young", "language": "korean"}',
    '[{"input": "OLIVE YOUNG", "expected": "올리브영"}]',
    '{"OLIVE YOUNG", "OLIVEYOUNG", "oliveyoung"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 25. CGV 통합
(
    '영문_CGV_통합', 
    'CGV 영문/한글 통합', 
    '영문통합', 
    'CGV|cgv|Cgv|씨지브이', 
    'CGV', 
    100, 
    true, 
    '{"type": "brand_unify", "brand": "cgv", "language": "english"}',
    '[{"input": "cgv", "expected": "CGV"}]',
    '{"cgv", "Cgv", "씨지브이"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 26. 메가박스 통합
(
    '영문_메가박스_통합', 
    '메가박스 영문/한글 통합', 
    '영문통합', 
    'MEGABOX|megabox|MegaBox|메가박스', 
    '메가박스', 
    99, 
    true, 
    '{"type": "brand_unify", "brand": "megabox", "language": "korean"}',
    '[{"input": "MEGABOX", "expected": "메가박스"}]',
    '{"MEGABOX", "megabox", "MegaBox"}',
    0, 
    null,
    NOW(), 
    NOW()
);

-- Phase 3-3: 예외 처리 (14개 규칙) - Priority 98-85
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

-- 31. 위치정보 정규화
(
    '위치_동_정규화', 
    '동 단위 위치정보 정규화', 
    '위치정보', 
    '(.+?)\\s*(동|DONG)', 
    '$1동', 
    94, 
    true, 
    '{"type": "location", "level": "dong", "format": "korean"}',
    '[{"input": "역삼 동", "expected": "역삼동"}]',
    '{"역삼 동", "강남DONG", "서초 동"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 32. 로 단위 정규화
(
    '위치_로_정규화', 
    '로 단위 위치정보 정규화', 
    '위치정보', 
    '(.+?)\\s*(로|RO)', 
    '$1로', 
    93, 
    true, 
    '{"type": "location", "level": "ro", "format": "korean"}',
    '[{"input": "테헤란 로", "expected": "테헤란로"}]',
    '{"테헤란 로", "강남대RO", "서초 로"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 33. 길 단위 정규화
(
    '위치_길_정규화', 
    '길 단위 위치정보 정규화', 
    '위치정보', 
    '(.+?)\\s*(길|GIL)', 
    '$1길', 
    92, 
    true, 
    '{"type": "location", "level": "gil", "format": "korean"}',
    '[{"input": "선릉 길", "expected": "선릉길"}]',
    '{"선릉 길", "역삼GIL", "강남 길"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 34. 시간정보 제거
(
    '시간_시간_제거', 
    '시간 정보 제거', 
    '시간정보', 
    '\\d{1,2}:\\d{2}(:\\d{2})?', 
    '', 
    91, 
    true, 
    '{"type": "temporal", "target": "time", "action": "remove"}',
    '[{"input": "스타벅스 15:30", "expected": "스타벅스 "}]',
    '{"스타벅스 15:30", "이마트 09:00", "CU 23:59"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 35. 날짜정보 제거
(
    '시간_날짜_제거', 
    '날짜 정보 제거', 
    '시간정보', 
    '\\d{4}[-/]\\d{1,2}[-/]\\d{1,2}', 
    '', 
    90, 
    true, 
    '{"type": "temporal", "target": "date", "action": "remove"}',
    '[{"input": "스타벅스 2025-01-01", "expected": "스타벅스 "}]',
    '{"스타벅스 2025-01-01", "이마트 2025/01/01", "CU 25-01-01"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 36. 요일정보 제거
(
    '시간_요일_제거', 
    '요일 정보 제거', 
    '시간정보', 
    '\\s*(월|화|수|목|금|토|일)요일\\s*', 
    ' ', 
    89, 
    true, 
    '{"type": "temporal", "target": "weekday", "action": "remove"}',
    '[{"input": "스타벅스 월요일", "expected": "스타벅스 "}]',
    '{"스타벅스 월요일", "이마트 토요일", "CU 일요일"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 37. 층수정보 정규화
(
    '위치_층수_정규화', 
    '층수 정보 정규화', 
    '위치정보', 
    '(.+?)\\s*(\\d+)\\s*층', 
    '$1 $2층', 
    88, 
    true, 
    '{"type": "location", "level": "floor", "format": "normalized"}',
    '[{"input": "스타벅스 3 층", "expected": "스타벅스 3층"}]',
    '{"스타벅스 3 층", "이마트 1층", "CU 지하 1층"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 38. 호수정보 정규화
(
    '위치_호수_정규화', 
    '호수 정보 정규화', 
    '위치정보', 
    '(.+?)\\s*(\\d+)\\s*호', 
    '$1 $2호', 
    87, 
    true, 
    '{"type": "location", "level": "unit", "format": "normalized"}',
    '[{"input": "스타벅스 101 호", "expected": "스타벅스 101호"}]',
    '{"스타벅스 101 호", "이마트 205호", "CU 301 호"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 39. 번지수 정규화
(
    '위치_번지_정규화', 
    '번지수 정보 정규화', 
    '위치정보', 
    '(.+?)\\s*(\\d+)\\s*번지', 
    '$1 $2번지', 
    86, 
    true, 
    '{"type": "location", "level": "address", "format": "normalized"}',
    '[{"input": "역삼동 123 번지", "expected": "역삼동 123번지"}]',
    '{"역삼동 123 번지", "강남구 456번지", "서초 789 번지"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 40. 잘못된 인코딩 수정
(
    '문자_인코딩_수정', 
    '잘못된 문자 인코딩 수정', 
    '문자정리', 
    '[\\x00-\\x1F\\x7F-\\x9F]', 
    '', 
    85, 
    true, 
    '{"type": "encoding", "target": "control_chars", "action": "remove"}',
    '[{"input": "스타벅스\\x00", "expected": "스타벅스"}]',
    '{"스타벅스\\x00", "이마트\\x1F", "CU\\x7F"}',
    0, 
    null,
    NOW(), 
    NOW()
);

-- 생성 완료 확인
SELECT 'Phase 3: 세부 40개 규칙이 성공적으로 생성되었습니다.' as status;