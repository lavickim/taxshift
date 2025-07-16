-- 실제 거래 문자열 패턴을 위한 대량 키워드 그룹 시딩 (수정버전)
-- MVP 론칭을 위한 핵심 거래 분류 패턴들

-- 기존 데이터와 중복되지 않도록 먼저 삭제
DELETE FROM keyword_groups WHERE group_name LIKE '%확장%';

-- 편의점 키워드 그룹 대폭 확장
INSERT INTO keyword_groups (group_name, primary_keyword, synonyms, category, confidence_base, is_active) VALUES
('세븐일레븐확장', '세븐일레븐', ARRAY['7ELV', '7-ELV', '7ELEVEN', '세븐', '711', '7-11', '7일레븐'], '편의점', 0.95, true),
('CU편의점확장', 'CU', ARRAY['CU편의점', 'BGF리테일', 'CU점', '시유'], '편의점', 0.95, true),
('GS25확장', 'GS25', ARRAY['GS이십오', 'GS25편의점', 'GS25점', 'GS-25'], '편의점', 0.95, true),
('이마트24확장', '이마트24', ARRAY['EMART24', 'E마트24', '이마트이십사', '이마트편의점'], '편의점', 0.95, true),
('미니스톱', '미니스톱', ARRAY['MINISTOP', '미니스톱편의점'], '편의점', 0.90, true);

-- 주유소 키워드 그룹 확장
INSERT INTO keyword_groups (group_name, primary_keyword, synonyms, category, confidence_base, is_active) VALUES
('GS칼텍스확장', 'GS칼텍스', ARRAY['GS주유소', 'GS석유', 'GSCALTEX', '지에스칼텍스'], '주유소', 0.95, true),
('SK에너지확장', 'SK에너지', ARRAY['SK주유소', 'SK석유', 'SKENERGY', '에스케이에너지'], '주유소', 0.95, true),
('현대오일뱅크확장', '현대오일뱅크', ARRAY['현대주유소', '현대석유', 'HYUNDAIOILBANK', '오일뱅크'], '주유소', 0.95, true),
('S-Oil확장', 'S-Oil', ARRAY['에스오일', 'S오일', 'SOIL', '쌍용석유'], '주유소', 0.95, true);

-- 음식점 키워드 그룹 대폭 확장
INSERT INTO keyword_groups (group_name, primary_keyword, synonyms, category, confidence_base, is_active) VALUES
('맥도날드확장', '맥도날드', ARRAY['맥도날드', 'McDonalds', '맥날', 'MCD'], '음식점', 0.95, true),
('롯데리아확장', '롯데리아', ARRAY['LOTTERIA', '롯데버거'], '음식점', 0.90, true),
('버거킹', '버거킹', ARRAY['BURGERKING', 'BK'], '음식점', 0.90, true),
('KFC', 'KFC', ARRAY['켄터키', '케이에프씨', '치킨'], '음식점', 0.90, true),
('서브웨이', '서브웨이', ARRAY['SUBWAY', '샌드위치'], '음식점', 0.85, true),
('피자헛', '피자헛', ARRAY['PIZZAHUT', '피자'], '음식점', 0.85, true),
('도미노피자', '도미노피자', ARRAY['DOMINOS', '도미노'], '음식점', 0.85, true),
('스타벅스', '스타벅스', ARRAY['STARBUCKS', '스벅', '커피'], '카페', 0.95, true),
('투썸플레이스', '투썸플레이스', ARRAY['A-TWOSOME', '투썸', '카페'], '카페', 0.90, true),
('이디야커피', '이디야커피', ARRAY['EDIYA', '이디야'], '카페', 0.90, true);

-- 대형마트 키워드 그룹
INSERT INTO keyword_groups (group_name, primary_keyword, synonyms, category, confidence_base, is_active) VALUES
('이마트', '이마트', ARRAY['EMART', 'E마트', '신세계마트'], '마트', 0.95, true),
('롯데마트', '롯데마트', ARRAY['LOTTEMART', '롯데'], '마트', 0.95, true),
('홈플러스', '홈플러스', ARRAY['HOMEPLUS'], '마트', 0.95, true),
('코스트코', '코스트코', ARRAY['COSTCO'], '마트', 0.95, true);

-- 온라인 쇼핑 키워드 그룹
INSERT INTO keyword_groups (group_name, primary_keyword, synonyms, category, confidence_base, is_active) VALUES
('쿠팡', '쿠팡', ARRAY['COUPANG'], '온라인쇼핑', 0.95, true),
('11번가', '11번가', ARRAY['11ST', '일일번가'], '온라인쇼핑', 0.90, true),
('지마켓', '지마켓', ARRAY['GMARKET'], '온라인쇼핑', 0.90, true),
('옥션', '옥션', ARRAY['AUCTION'], '온라인쇼핑', 0.90, true),
('티몬', '티몬', ARRAY['TMON', 'TICKET MONSTER'], '온라인쇼핑', 0.85, true),
('위메프', '위메프', ARRAY['WEMAKEPRICE', 'WMP'], '온라인쇼핑', 0.85, true);

-- 교통 키워드 그룹
INSERT INTO keyword_groups (group_name, primary_keyword, synonyms, category, confidence_base, is_active) VALUES
('지하철', '지하철', ARRAY['SUBWAY', '전철', '도시철도'], '교통', 0.95, true),
('버스', '버스', ARRAY['BUS', '시내버스', '시외버스'], '교통', 0.90, true),
('택시', '택시', ARRAY['TAXI', '카카오택시', '우버'], '교통', 0.90, true),
('톨게이트', '톨게이트', ARRAY['TOLLGATE', '고속도로', '통행료'], '교통', 0.90, true);

-- 병원/의료 키워드 그룹
INSERT INTO keyword_groups (group_name, primary_keyword, synonyms, category, confidence_base, is_active) VALUES
('병원', '병원', ARRAY['HOSPITAL', '의원', '클리닉'], '의료', 0.90, true),
('약국', '약국', ARRAY['PHARMACY', '약국'], '의료', 0.90, true),
('치과', '치과', ARRAY['DENTAL', '치과의원'], '의료', 0.90, true);

-- 은행/금융 키워드 그룹  
INSERT INTO keyword_groups (group_name, primary_keyword, synonyms, category, confidence_base, is_active) VALUES
('ATM', 'ATM', ARRAY['현금인출기', 'CD기'], '금융', 0.95, true),
('계좌이체', '계좌이체', ARRAY['이체', '송금'], '금융', 0.95, true),
('카드결제', '카드결제', ARRAY['신용카드', '체크카드'], '금융', 0.90, true);

-- 새 카테고리에 대한 태그 생성 (올바른 컬럼명 사용)
INSERT INTO tags_master (tag_name, tag_category, description, is_active) VALUES
('마트', '업종', '대형마트 및 할인점', true),
('금융', '업종', '은행 및 금융거래', true)
ON CONFLICT (tag_name) DO NOTHING;

-- 키워드 그룹을 태그에 매핑
INSERT INTO keyword_tag_mappings (keyword_group_id, tag_id, confidence_score, priority, context_rules, is_active, usage_count) 
SELECT kg.id, t.id, 0.90, 1, '{}'::jsonb, true, 0
FROM keyword_groups kg 
JOIN tags_master t ON kg.category = t.tag_name 
WHERE kg.group_name IN (
    '세븐일레븐확장', 'CU편의점확장', 'GS25확장', '이마트24확장', '미니스톱',
    'GS칼텍스확장', 'SK에너지확장', '현대오일뱅크확장', 'S-Oil확장',
    '맥도날드확장', '롯데리아확장', '버거킹', 'KFC', '서브웨이', '피자헛', '도미노피자',
    '스타벅스', '투썸플레이스', '이디야커피',
    '이마트', '롯데마트', '홈플러스', '코스트코',
    '쿠팡', '11번가', '지마켓', '옥션', '티몬', '위메프',
    '지하철', '버스', '택시', '톨게이트',
    '병원', '약국', '치과',
    'ATM', '계좌이체', '카드결제'
);

-- 새 태그들을 계정과목에 매핑
INSERT INTO tag_account_mappings (tag_id, account_code, account_name, mapping_condition, is_default, priority, confidence_boost) 
VALUES 
((SELECT id FROM tags_master WHERE tag_name = '마트'), '111', '식료품비', '{}'::jsonb, true, 1, 0.1),
((SELECT id FROM tags_master WHERE tag_name = '금융'), '999', '금융수수료', '{}'::jsonb, true, 1, 0.1);