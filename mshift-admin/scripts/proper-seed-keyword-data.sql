-- Keyword System Seed Data
-- PostgreSQL array syntax와 스키마에 맞춘 데이터

BEGIN;

-- 1. 키워드 그룹 삽입
INSERT INTO keyword_groups (group_name, primary_keyword, synonyms, category, confidence_base, is_active)
VALUES 
    ('세븐일레븐', '세븐일레븐', ARRAY['7-eleven', '7일레븐', '세븐', '711'], '편의점', 0.92, true),
    ('CU편의점', 'CU', ARRAY['씨유', 'cu편의점', 'cu점'], '편의점', 0.90, true),
    ('이마트24', '이마트24', ARRAY['emart24', '이마트이십사'], '편의점', 0.89, true),
    ('GS25', 'GS25', ARRAY['지에스25', 'gs이십오'], '편의점', 0.88, true),
    ('GS칼텍스', 'GS칼텍스', ARRAY['gs칼텍스', '지에스칼텍스', 'gs'], '주유소', 0.91, true),
    ('SK에너지', 'SK에너지', ARRAY['sk', '에스케이', 'sk주유소'], '주유소', 0.90, true),
    ('현대오일뱅크', '현대오일뱅크', ARRAY['현대오일', '오일뱅크', 'hyundai'], '주유소', 0.89, true),
    ('S-Oil', 'S-Oil', ARRAY['s오일', '에스오일', 'soil'], '주유소', 0.88, true),
    ('맥도날드', '맥도날드', ARRAY['맥도', 'mcdonald', '맥날'], '음식점', 0.93, true),
    ('롯데리아', '롯데리아', ARRAY['롯데버거', 'lotteria'], '음식점', 0.91, true)
ON CONFLICT DO NOTHING;

-- 2. 태그 마스터 삽입 (description 컬럼 제거)
INSERT INTO tags_master (tag_name, tag_category, color_hex, icon_name, display_order, is_active)
VALUES 
    ('편의점', '업종', '#10B981', 'store', 10, true),
    ('주유소', '업종', '#EF4444', 'fuel', 20, true),
    ('음식점', '업종', '#F59E0B', 'utensils', 30, true),
    ('카페', '업종', '#8B5CF6', 'coffee', 40, true),
    ('온라인쇼핑', '업종', '#3B82F6', 'shopping-cart', 50, true),
    ('교통비', '비용', '#6366F1', 'car', 60, true),
    ('의료비', '비용', '#EC4899', 'heart', 70, true)
ON CONFLICT (tag_name) DO NOTHING;

-- 3. 키워드-태그 매핑 삽입 (updated_at 컬럼 제거)
INSERT INTO keyword_tag_mappings (keyword_group_id, tag_id, confidence_score, priority, context_rules, is_active, usage_count)
SELECT 
    kg.id as keyword_group_id,
    tm.id as tag_id,
    0.85 as confidence_score,
    50 as priority,
    null as context_rules,
    true as is_active,
    0 as usage_count
FROM keyword_groups kg
CROSS JOIN tags_master tm
WHERE 
    (kg.category = '편의점' AND tm.tag_name = '편의점') OR
    (kg.category = '주유소' AND tm.tag_name = '주유소') OR
    (kg.category = '음식점' AND tm.tag_name = '음식점')
ON CONFLICT DO NOTHING;

-- 4. 태그-계정과목 매핑 삽입 (updated_at 컬럼 제거)
INSERT INTO tag_account_mappings (tag_id, account_code, account_name, mapping_condition, is_default, priority, confidence_boost)
SELECT
    tm.id as tag_id,
    CASE 
        WHEN tm.tag_name = '편의점' THEN '803'
        WHEN tm.tag_name = '주유소' THEN '812'
        WHEN tm.tag_name = '음식점' THEN '801'
        WHEN tm.tag_name = '카페' THEN '801'
        WHEN tm.tag_name = '온라인쇼핑' THEN '803'
        WHEN tm.tag_name = '교통비' THEN '812'
        WHEN tm.tag_name = '의료비' THEN '805'
    END as account_code,
    CASE 
        WHEN tm.tag_name = '편의점' THEN '복리후생비'
        WHEN tm.tag_name = '주유소' THEN '차량유지비'
        WHEN tm.tag_name = '음식점' THEN '접대비'
        WHEN tm.tag_name = '카페' THEN '접대비'
        WHEN tm.tag_name = '온라인쇼핑' THEN '복리후생비'
        WHEN tm.tag_name = '교통비' THEN '차량유지비'
        WHEN tm.tag_name = '의료비' THEN '지급수수료'
    END as account_name,
    null as mapping_condition,
    true as is_default,
    50 as priority,
    0.05 as confidence_boost
FROM tags_master tm
WHERE tm.tag_name IN ('편의점', '주유소', '음식점', '카페', '온라인쇼핑', '교통비', '의료비')
ON CONFLICT DO NOTHING;

-- 데이터 확인
SELECT 
    'Keyword Groups' as table_name, 
    COUNT(*) as count 
FROM keyword_groups
UNION ALL
SELECT 
    'Tags Master' as table_name, 
    COUNT(*) as count 
FROM tags_master
UNION ALL
SELECT 
    'Keyword-Tag Mappings' as table_name, 
    COUNT(*) as count 
FROM keyword_tag_mappings
UNION ALL
SELECT 
    'Tag-Account Mappings' as table_name, 
    COUNT(*) as count 
FROM tag_account_mappings;

COMMIT;