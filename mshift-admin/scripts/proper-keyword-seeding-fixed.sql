-- 키워드 시스템 정품 데이터 시딩 스크립트 (실제 스키마 맞춤)
BEGIN;

-- 1. 키워드 그룹 시딩
INSERT INTO keyword_groups (group_name, primary_keyword, synonyms, category, confidence_base, is_active) VALUES
('세븐일레븐', '세븐일레븐', ARRAY['7-eleven', '7일레븐', '세븐', '711'], '편의점', 0.92, true),
('CU편의점', 'CU', ARRAY['씨유', 'cu편의점', 'cu점'], '편의점', 0.90, true),
('이마트24', '이마트24', ARRAY['emart24', '이마트이십사'], '편의점', 0.88, true),
('GS25', 'GS25', ARRAY['지에스25', 'gs이십오'], '편의점', 0.89, true),
('GS칼텍스', 'GS칼텍스', ARRAY['gs칼텍스', '지에스칼텍스', 'gs'], '주유소', 0.95, true),
('SK에너지', 'SK에너지', ARRAY['sk', '에스케이', 'sk주유소'], '주유소', 0.93, true),
('현대오일뱅크', '현대오일뱅크', ARRAY['현대오일', '오일뱅크', 'hyundai'], '주유소', 0.91, true),
('S-Oil', 'S-Oil', ARRAY['s오일', '에스오일', 'soil'], '주유소', 0.92, true),
('맥도날드', '맥도날드', ARRAY['맥도', 'mcdonald', '맥날'], '패스트푸드', 0.89, true),
('롯데리아', '롯데리아', ARRAY['롯데버거', 'lotteria'], '패스트푸드', 0.87, true),
('버거킹', '버거킹', ARRAY['burgerking', 'bk'], '패스트푸드', 0.88, true),
('KFC', 'KFC', ARRAY['케이에프씨', '켄터키', '치킨'], '패스트푸드', 0.85, true),
('스타벅스', '스타벅스', ARRAY['스벅', 'starbucks', '별다방'], '카페', 0.96, true),
('커피빈', '커피빈', ARRAY['coffeebean', 'coffee bean'], '카페', 0.84, true),
('이디야', '이디야', ARRAY['ediya', '이디야커피'], '카페', 0.83, true),
('투썸플레이스', '투썸플레이스', ARRAY['투썸', 'twosome', '2some'], '카페', 0.86, true),
('쿠팡', '쿠팡', ARRAY['coupang', '쿠팡이츠'], '온라인쇼핑', 0.82, true),
('배달의민족', '배달의민족', ARRAY['배민', 'baemin', '배달민족'], '배달앱', 0.88, true),
('요기요', '요기요', ARRAY['yogiyo'], '배달앱', 0.85, true),
('카카오택시', '카카오택시', ARRAY['kakao', '카톡택시'], '택시', 0.90, true);

-- 2. 태그 마스터 시딩 (기존 태그 확인하고 추가)
INSERT INTO tags_master (tag_name, tag_category, description, color_hex, icon_name, display_order, is_active) VALUES
('편의점', '상업시설', '편의점 거래', '#FF6B6B', 'store', 1, true),
('주유소', '교통비', '주유소 거래', '#4ECDC4', 'car', 2, true),
('패스트푸드', '식비', '패스트푸드 거래', '#45B7D1', 'burger', 3, true),
('카페', '식비', '카페 거래', '#96CEB4', 'coffee', 4, true),
('온라인쇼핑', '생활용품', '온라인쇼핑 거래', '#FFEAA7', 'shopping', 5, true),
('배달앱', '식비', '배달앱 거래', '#DDA0DD', 'delivery', 6, true),
('택시', '교통비', '택시 거래', '#98D8C8', 'taxi', 7, true)
ON CONFLICT (tag_name) DO UPDATE SET
    tag_category = EXCLUDED.tag_category,
    description = EXCLUDED.description,
    color_hex = EXCLUDED.color_hex,
    icon_name = EXCLUDED.icon_name,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

-- 3. 키워드-태그 매핑 시딩 (실제 스키마 맞춤)
INSERT INTO keyword_tag_mappings (keyword_group_id, tag_id, confidence_score, priority, context_rules, is_active, usage_count, created_at) 
SELECT 
    kg.id, 
    tm.id, 
    CASE 
        WHEN kg.group_name IN ('세븐일레븐', 'CU편의점', '이마트24', 'GS25') THEN 0.92
        WHEN kg.group_name IN ('GS칼텍스', 'SK에너지', '현대오일뱅크', 'S-Oil') THEN 0.95
        WHEN kg.group_name IN ('맥도날드', '롯데리아', '버거킹', 'KFC') THEN 0.88
        WHEN kg.group_name IN ('스타벅스', '커피빈', '이디야', '투썸플레이스') THEN 0.90
        WHEN kg.group_name = '쿠팡' THEN 0.82
        WHEN kg.group_name IN ('배달의민족', '요기요') THEN 0.88
        WHEN kg.group_name = '카카오택시' THEN 0.90
        ELSE 0.80
    END,
    1,
    jsonb_build_object(
        'amount_range', jsonb_build_object(
            'min', CASE 
                WHEN tm.tag_name = '편의점' THEN 1000
                WHEN tm.tag_name = '주유소' THEN 30000
                WHEN tm.tag_name = '패스트푸드' THEN 5000
                WHEN tm.tag_name = '카페' THEN 2000
                WHEN tm.tag_name = '온라인쇼핑' THEN 10000
                WHEN tm.tag_name = '배달앱' THEN 8000
                WHEN tm.tag_name = '택시' THEN 15000
                ELSE 0
            END,
            'max', CASE 
                WHEN tm.tag_name = '편의점' THEN 50000
                WHEN tm.tag_name = '주유소' THEN 200000
                WHEN tm.tag_name = '패스트푸드' THEN 30000
                WHEN tm.tag_name = '카페' THEN 15000
                WHEN tm.tag_name = '온라인쇼핑' THEN 500000
                WHEN tm.tag_name = '배달앱' THEN 50000
                WHEN tm.tag_name = '택시' THEN 100000
                ELSE 1000000
            END
        )
    ),
    true,
    0,
    NOW()
FROM keyword_groups kg
JOIN tags_master tm ON (
    (kg.category = '편의점' AND tm.tag_name = '편의점') OR
    (kg.category = '주유소' AND tm.tag_name = '주유소') OR
    (kg.category = '패스트푸드' AND tm.tag_name = '패스트푸드') OR
    (kg.category = '카페' AND tm.tag_name = '카페') OR
    (kg.category = '온라인쇼핑' AND tm.tag_name = '온라인쇼핑') OR
    (kg.category = '배달앱' AND tm.tag_name = '배달앱') OR
    (kg.category = '택시' AND tm.tag_name = '택시')
);

-- 4. 태그-계정 매핑 시딩 (실제 스키마 맞춤)
INSERT INTO tag_account_mappings (tag_id, account_code, account_name, mapping_condition, is_default, priority, confidence_boost, created_at)
SELECT 
    tm.id,
    CASE 
        WHEN tm.tag_name = '편의점' THEN '602'
        WHEN tm.tag_name = '주유소' THEN '622'
        WHEN tm.tag_name = '패스트푸드' THEN '651'
        WHEN tm.tag_name = '카페' THEN '651'
        WHEN tm.tag_name = '온라인쇼핑' THEN '634'
        WHEN tm.tag_name = '배달앱' THEN '651'
        WHEN tm.tag_name = '택시' THEN '612'
        ELSE '602'
    END,
    CASE 
        WHEN tm.tag_name = '편의점' THEN '지급수수료'
        WHEN tm.tag_name = '주유소' THEN '차량유지비'
        WHEN tm.tag_name = '패스트푸드' THEN '접대비'
        WHEN tm.tag_name = '카페' THEN '접대비'
        WHEN tm.tag_name = '온라인쇼핑' THEN '소모품비'
        WHEN tm.tag_name = '배달앱' THEN '접대비'
        WHEN tm.tag_name = '택시' THEN '여비교통비'
        ELSE '지급수수료'
    END,
    jsonb_build_object(
        'amount_range', jsonb_build_object('min', 0, 'max', 999999999),
        'time_context', jsonb_build_object('enabled', false)
    ),
    true,
    1,
    0.05,
    NOW()
FROM tags_master tm
WHERE tm.tag_name IN ('편의점', '주유소', '패스트푸드', '카페', '온라인쇼핑', '배달앱', '택시');

-- 5. 현재 상태 확인
SELECT 
    'keyword_groups' as table_name, 
    count(*) as count 
FROM keyword_groups 
WHERE is_active = true

UNION ALL

SELECT 
    'tags_master' as table_name, 
    count(*) as count 
FROM tags_master 
WHERE is_active = true

UNION ALL

SELECT 
    'keyword_tag_mappings' as table_name, 
    count(*) as count 
FROM keyword_tag_mappings 
WHERE is_active = true

UNION ALL

SELECT 
    'tag_account_mappings' as table_name, 
    count(*) as count 
FROM tag_account_mappings;

COMMIT;