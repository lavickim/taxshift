
-- ============================================================================
-- Keyword System Initial Data Seeding Script
-- Generated on: 2025-07-15T09:24:18.779Z
-- ============================================================================

-- 시퀀스 리셋
SELECT setval('keyword_groups_id_seq', 1, false);
SELECT setval('tags_master_id_seq', 1, false);
SELECT setval('keyword_tag_mappings_id_seq', 1, false);
SELECT setval('tag_account_mappings_id_seq', 1, false);

-- 1. 키워드 그룹 데이터 삽입

      INSERT INTO keyword_groups (id, group_name, primary_keyword, synonyms, category, confidence_base, is_active, created_at, updated_at)
      VALUES (1, '세븐일레븐', '세븐일레븐', '["7-eleven","7일레븐","세븐","711"]', '편의점', 0.92, true, NOW(), NOW())
      ON CONFLICT (group_name) DO UPDATE SET
        primary_keyword = EXCLUDED.primary_keyword,
        synonyms = EXCLUDED.synonyms,
        category = EXCLUDED.category,
        confidence_base = EXCLUDED.confidence_base,
        is_active = EXCLUDED.is_active,
        updated_at = NOW();
    \n
      INSERT INTO keyword_groups (id, group_name, primary_keyword, synonyms, category, confidence_base, is_active, created_at, updated_at)
      VALUES (2, 'CU편의점', 'CU', '["씨유","cu편의점","cu점"]', '편의점', 0.9, true, NOW(), NOW())
      ON CONFLICT (group_name) DO UPDATE SET
        primary_keyword = EXCLUDED.primary_keyword,
        synonyms = EXCLUDED.synonyms,
        category = EXCLUDED.category,
        confidence_base = EXCLUDED.confidence_base,
        is_active = EXCLUDED.is_active,
        updated_at = NOW();
    \n
      INSERT INTO keyword_groups (id, group_name, primary_keyword, synonyms, category, confidence_base, is_active, created_at, updated_at)
      VALUES (3, '이마트24', '이마트24', '["emart24","이마트이십사"]', '편의점', 0.89, true, NOW(), NOW())
      ON CONFLICT (group_name) DO UPDATE SET
        primary_keyword = EXCLUDED.primary_keyword,
        synonyms = EXCLUDED.synonyms,
        category = EXCLUDED.category,
        confidence_base = EXCLUDED.confidence_base,
        is_active = EXCLUDED.is_active,
        updated_at = NOW();
    \n
      INSERT INTO keyword_groups (id, group_name, primary_keyword, synonyms, category, confidence_base, is_active, created_at, updated_at)
      VALUES (4, 'GS25', 'GS25', '["지에스25","gs이십오"]', '편의점', 0.88, true, NOW(), NOW())
      ON CONFLICT (group_name) DO UPDATE SET
        primary_keyword = EXCLUDED.primary_keyword,
        synonyms = EXCLUDED.synonyms,
        category = EXCLUDED.category,
        confidence_base = EXCLUDED.confidence_base,
        is_active = EXCLUDED.is_active,
        updated_at = NOW();
    \n
      INSERT INTO keyword_groups (id, group_name, primary_keyword, synonyms, category, confidence_base, is_active, created_at, updated_at)
      VALUES (5, 'GS칼텍스', 'GS칼텍스', '["gs칼텍스","지에스칼텍스","gs"]', '주유소', 0.95, true, NOW(), NOW())
      ON CONFLICT (group_name) DO UPDATE SET
        primary_keyword = EXCLUDED.primary_keyword,
        synonyms = EXCLUDED.synonyms,
        category = EXCLUDED.category,
        confidence_base = EXCLUDED.confidence_base,
        is_active = EXCLUDED.is_active,
        updated_at = NOW();
    \n
      INSERT INTO keyword_groups (id, group_name, primary_keyword, synonyms, category, confidence_base, is_active, created_at, updated_at)
      VALUES (6, 'SK에너지', 'SK에너지', '["sk","에스케이","sk주유소"]', '주유소', 0.94, true, NOW(), NOW())
      ON CONFLICT (group_name) DO UPDATE SET
        primary_keyword = EXCLUDED.primary_keyword,
        synonyms = EXCLUDED.synonyms,
        category = EXCLUDED.category,
        confidence_base = EXCLUDED.confidence_base,
        is_active = EXCLUDED.is_active,
        updated_at = NOW();
    \n
      INSERT INTO keyword_groups (id, group_name, primary_keyword, synonyms, category, confidence_base, is_active, created_at, updated_at)
      VALUES (7, '현대오일뱅크', '현대오일뱅크', '["현대오일","오일뱅크","hyundai"]', '주유소', 0.92, true, NOW(), NOW())
      ON CONFLICT (group_name) DO UPDATE SET
        primary_keyword = EXCLUDED.primary_keyword,
        synonyms = EXCLUDED.synonyms,
        category = EXCLUDED.category,
        confidence_base = EXCLUDED.confidence_base,
        is_active = EXCLUDED.is_active,
        updated_at = NOW();
    \n
      INSERT INTO keyword_groups (id, group_name, primary_keyword, synonyms, category, confidence_base, is_active, created_at, updated_at)
      VALUES (8, 'S-Oil', 'S-Oil', '["s오일","에스오일","soil"]', '주유소', 0.91, true, NOW(), NOW())
      ON CONFLICT (group_name) DO UPDATE SET
        primary_keyword = EXCLUDED.primary_keyword,
        synonyms = EXCLUDED.synonyms,
        category = EXCLUDED.category,
        confidence_base = EXCLUDED.confidence_base,
        is_active = EXCLUDED.is_active,
        updated_at = NOW();
    \n
      INSERT INTO keyword_groups (id, group_name, primary_keyword, synonyms, category, confidence_base, is_active, created_at, updated_at)
      VALUES (9, '맥도날드', '맥도날드', '["맥도","mcdonald","맥날"]', '패스트푸드', 0.93, true, NOW(), NOW())
      ON CONFLICT (group_name) DO UPDATE SET
        primary_keyword = EXCLUDED.primary_keyword,
        synonyms = EXCLUDED.synonyms,
        category = EXCLUDED.category,
        confidence_base = EXCLUDED.confidence_base,
        is_active = EXCLUDED.is_active,
        updated_at = NOW();
    \n
      INSERT INTO keyword_groups (id, group_name, primary_keyword, synonyms, category, confidence_base, is_active, created_at, updated_at)
      VALUES (10, '롯데리아', '롯데리아', '["롯데버거","lotteria"]', '패스트푸드', 0.9, true, NOW(), NOW())
      ON CONFLICT (group_name) DO UPDATE SET
        primary_keyword = EXCLUDED.primary_keyword,
        synonyms = EXCLUDED.synonyms,
        category = EXCLUDED.category,
        confidence_base = EXCLUDED.confidence_base,
        is_active = EXCLUDED.is_active,
        updated_at = NOW();
    \n
      INSERT INTO keyword_groups (id, group_name, primary_keyword, synonyms, category, confidence_base, is_active, created_at, updated_at)
      VALUES (11, '버거킹', '버거킹', '["burgerking","bk"]', '패스트푸드', 0.89, true, NOW(), NOW())
      ON CONFLICT (group_name) DO UPDATE SET
        primary_keyword = EXCLUDED.primary_keyword,
        synonyms = EXCLUDED.synonyms,
        category = EXCLUDED.category,
        confidence_base = EXCLUDED.confidence_base,
        is_active = EXCLUDED.is_active,
        updated_at = NOW();
    \n
      INSERT INTO keyword_groups (id, group_name, primary_keyword, synonyms, category, confidence_base, is_active, created_at, updated_at)
      VALUES (12, 'KFC', 'KFC', '["케이에프씨","켄터키","치킨"]', '패스트푸드', 0.88, true, NOW(), NOW())
      ON CONFLICT (group_name) DO UPDATE SET
        primary_keyword = EXCLUDED.primary_keyword,
        synonyms = EXCLUDED.synonyms,
        category = EXCLUDED.category,
        confidence_base = EXCLUDED.confidence_base,
        is_active = EXCLUDED.is_active,
        updated_at = NOW();
    \n
      INSERT INTO keyword_groups (id, group_name, primary_keyword, synonyms, category, confidence_base, is_active, created_at, updated_at)
      VALUES (13, '스타벅스', '스타벅스', '["스벅","starbucks","별다방"]', '카페', 0.95, true, NOW(), NOW())
      ON CONFLICT (group_name) DO UPDATE SET
        primary_keyword = EXCLUDED.primary_keyword,
        synonyms = EXCLUDED.synonyms,
        category = EXCLUDED.category,
        confidence_base = EXCLUDED.confidence_base,
        is_active = EXCLUDED.is_active,
        updated_at = NOW();
    \n
      INSERT INTO keyword_groups (id, group_name, primary_keyword, synonyms, category, confidence_base, is_active, created_at, updated_at)
      VALUES (14, '커피빈', '커피빈', '["coffeebean","coffee bean"]', '카페', 0.87, true, NOW(), NOW())
      ON CONFLICT (group_name) DO UPDATE SET
        primary_keyword = EXCLUDED.primary_keyword,
        synonyms = EXCLUDED.synonyms,
        category = EXCLUDED.category,
        confidence_base = EXCLUDED.confidence_base,
        is_active = EXCLUDED.is_active,
        updated_at = NOW();
    \n
      INSERT INTO keyword_groups (id, group_name, primary_keyword, synonyms, category, confidence_base, is_active, created_at, updated_at)
      VALUES (15, '이디야', '이디야', '["ediya","이디야커피"]', '카페', 0.85, true, NOW(), NOW())
      ON CONFLICT (group_name) DO UPDATE SET
        primary_keyword = EXCLUDED.primary_keyword,
        synonyms = EXCLUDED.synonyms,
        category = EXCLUDED.category,
        confidence_base = EXCLUDED.confidence_base,
        is_active = EXCLUDED.is_active,
        updated_at = NOW();
    \n
      INSERT INTO keyword_groups (id, group_name, primary_keyword, synonyms, category, confidence_base, is_active, created_at, updated_at)
      VALUES (16, '투썸플레이스', '투썸플레이스', '["투썸","twosome","2some"]', '카페', 0.86, true, NOW(), NOW())
      ON CONFLICT (group_name) DO UPDATE SET
        primary_keyword = EXCLUDED.primary_keyword,
        synonyms = EXCLUDED.synonyms,
        category = EXCLUDED.category,
        confidence_base = EXCLUDED.confidence_base,
        is_active = EXCLUDED.is_active,
        updated_at = NOW();
    \n
      INSERT INTO keyword_groups (id, group_name, primary_keyword, synonyms, category, confidence_base, is_active, created_at, updated_at)
      VALUES (17, '쿠팡', '쿠팡', '["coupang","쿠팡이츠"]', '온라인쇼핑', 0.92, true, NOW(), NOW())
      ON CONFLICT (group_name) DO UPDATE SET
        primary_keyword = EXCLUDED.primary_keyword,
        synonyms = EXCLUDED.synonyms,
        category = EXCLUDED.category,
        confidence_base = EXCLUDED.confidence_base,
        is_active = EXCLUDED.is_active,
        updated_at = NOW();
    \n
      INSERT INTO keyword_groups (id, group_name, primary_keyword, synonyms, category, confidence_base, is_active, created_at, updated_at)
      VALUES (18, '배달의민족', '배달의민족', '["배민","baemin","배달민족"]', '배달앱', 0.94, true, NOW(), NOW())
      ON CONFLICT (group_name) DO UPDATE SET
        primary_keyword = EXCLUDED.primary_keyword,
        synonyms = EXCLUDED.synonyms,
        category = EXCLUDED.category,
        confidence_base = EXCLUDED.confidence_base,
        is_active = EXCLUDED.is_active,
        updated_at = NOW();
    \n
      INSERT INTO keyword_groups (id, group_name, primary_keyword, synonyms, category, confidence_base, is_active, created_at, updated_at)
      VALUES (19, '요기요', '요기요', '["yogiyo"]', '배달앱', 0.9, true, NOW(), NOW())
      ON CONFLICT (group_name) DO UPDATE SET
        primary_keyword = EXCLUDED.primary_keyword,
        synonyms = EXCLUDED.synonyms,
        category = EXCLUDED.category,
        confidence_base = EXCLUDED.confidence_base,
        is_active = EXCLUDED.is_active,
        updated_at = NOW();
    \n
      INSERT INTO keyword_groups (id, group_name, primary_keyword, synonyms, category, confidence_base, is_active, created_at, updated_at)
      VALUES (20, '카카오택시', '카카오택시', '["kakao","카톡택시"]', '교통', 0.88, true, NOW(), NOW())
      ON CONFLICT (group_name) DO UPDATE SET
        primary_keyword = EXCLUDED.primary_keyword,
        synonyms = EXCLUDED.synonyms,
        category = EXCLUDED.category,
        confidence_base = EXCLUDED.confidence_base,
        is_active = EXCLUDED.is_active,
        updated_at = NOW();
    

-- 2. 태그 마스터 데이터 삽입

      INSERT INTO tags_master (id, tag_name, tag_description, category, is_active, created_at, updated_at)
      VALUES (1, '편의점', '24시간 편의점 및 소규모 매점', '상업시설', true, NOW(), NOW())
      ON CONFLICT (tag_name) DO UPDATE SET
        tag_description = EXCLUDED.tag_description,
        category = EXCLUDED.category,
        is_active = EXCLUDED.is_active,
        updated_at = NOW();
    \n
      INSERT INTO tags_master (id, tag_name, tag_description, category, is_active, created_at, updated_at)
      VALUES (2, '주유소', '연료 충전 및 차량 관련 서비스', '상업시설', true, NOW(), NOW())
      ON CONFLICT (tag_name) DO UPDATE SET
        tag_description = EXCLUDED.tag_description,
        category = EXCLUDED.category,
        is_active = EXCLUDED.is_active,
        updated_at = NOW();
    \n
      INSERT INTO tags_master (id, tag_name, tag_description, category, is_active, created_at, updated_at)
      VALUES (3, '패스트푸드', '햄버거, 치킨 등 빠른 식사', '음식점', true, NOW(), NOW())
      ON CONFLICT (tag_name) DO UPDATE SET
        tag_description = EXCLUDED.tag_description,
        category = EXCLUDED.category,
        is_active = EXCLUDED.is_active,
        updated_at = NOW();
    \n
      INSERT INTO tags_master (id, tag_name, tag_description, category, is_active, created_at, updated_at)
      VALUES (4, '카페', '커피 및 음료 전문점', '음식점', true, NOW(), NOW())
      ON CONFLICT (tag_name) DO UPDATE SET
        tag_description = EXCLUDED.tag_description,
        category = EXCLUDED.category,
        is_active = EXCLUDED.is_active,
        updated_at = NOW();
    \n
      INSERT INTO tags_master (id, tag_name, tag_description, category, is_active, created_at, updated_at)
      VALUES (5, '온라인쇼핑', '인터넷 쇼핑몰 구매', '전자상거래', true, NOW(), NOW())
      ON CONFLICT (tag_name) DO UPDATE SET
        tag_description = EXCLUDED.tag_description,
        category = EXCLUDED.category,
        is_active = EXCLUDED.is_active,
        updated_at = NOW();
    \n
      INSERT INTO tags_master (id, tag_name, tag_description, category, is_active, created_at, updated_at)
      VALUES (6, '배달앱', '음식 배달 서비스', '전자상거래', true, NOW(), NOW())
      ON CONFLICT (tag_name) DO UPDATE SET
        tag_description = EXCLUDED.tag_description,
        category = EXCLUDED.category,
        is_active = EXCLUDED.is_active,
        updated_at = NOW();
    \n
      INSERT INTO tags_master (id, tag_name, tag_description, category, is_active, created_at, updated_at)
      VALUES (7, '교통', '택시, 버스, 지하철 등 교통비', '교통비', true, NOW(), NOW())
      ON CONFLICT (tag_name) DO UPDATE SET
        tag_description = EXCLUDED.tag_description,
        category = EXCLUDED.category,
        is_active = EXCLUDED.is_active,
        updated_at = NOW();
    \n
      INSERT INTO tags_master (id, tag_name, tag_description, category, is_active, created_at, updated_at)
      VALUES (8, '심야구매', '자정 이후 새벽 시간대 구매', '시간대', true, NOW(), NOW())
      ON CONFLICT (tag_name) DO UPDATE SET
        tag_description = EXCLUDED.tag_description,
        category = EXCLUDED.category,
        is_active = EXCLUDED.is_active,
        updated_at = NOW();
    \n
      INSERT INTO tags_master (id, tag_name, tag_description, category, is_active, created_at, updated_at)
      VALUES (9, '주말구매', '토요일, 일요일 구매', '시간대', true, NOW(), NOW())
      ON CONFLICT (tag_name) DO UPDATE SET
        tag_description = EXCLUDED.tag_description,
        category = EXCLUDED.category,
        is_active = EXCLUDED.is_active,
        updated_at = NOW();
    \n
      INSERT INTO tags_master (id, tag_name, tag_description, category, is_active, created_at, updated_at)
      VALUES (10, '고액결제', '10만원 이상 고액 결제', '금액대', true, NOW(), NOW())
      ON CONFLICT (tag_name) DO UPDATE SET
        tag_description = EXCLUDED.tag_description,
        category = EXCLUDED.category,
        is_active = EXCLUDED.is_active,
        updated_at = NOW();
    

-- 3. 키워드-태그 매핑 데이터 삽입

      INSERT INTO keyword_tag_mappings (id, keyword_group_id, tag_id, confidence_score, priority, context_rules, is_active, usage_count, created_at, updated_at)
      SELECT 1, kg.id, tm.id, 0.95, 1, NULL, TRUE, 0, NOW(), NOW()
      FROM keyword_groups kg, tags_master tm
      WHERE kg.group_name = '세븐일레븐' AND tm.tag_name = '편의점'
      ON CONFLICT DO NOTHING;
    \n
      INSERT INTO keyword_tag_mappings (id, keyword_group_id, tag_id, confidence_score, priority, context_rules, is_active, usage_count, created_at, updated_at)
      SELECT 2, kg.id, tm.id, 0.93, 1, NULL, TRUE, 0, NOW(), NOW()
      FROM keyword_groups kg, tags_master tm
      WHERE kg.group_name = 'CU편의점' AND tm.tag_name = '편의점'
      ON CONFLICT DO NOTHING;
    \n
      INSERT INTO keyword_tag_mappings (id, keyword_group_id, tag_id, confidence_score, priority, context_rules, is_active, usage_count, created_at, updated_at)
      SELECT 3, kg.id, tm.id, 0.92, 1, NULL, TRUE, 0, NOW(), NOW()
      FROM keyword_groups kg, tags_master tm
      WHERE kg.group_name = '이마트24' AND tm.tag_name = '편의점'
      ON CONFLICT DO NOTHING;
    \n
      INSERT INTO keyword_tag_mappings (id, keyword_group_id, tag_id, confidence_score, priority, context_rules, is_active, usage_count, created_at, updated_at)
      SELECT 4, kg.id, tm.id, 0.9, 1, NULL, TRUE, 0, NOW(), NOW()
      FROM keyword_groups kg, tags_master tm
      WHERE kg.group_name = 'GS25' AND tm.tag_name = '편의점'
      ON CONFLICT DO NOTHING;
    \n
      INSERT INTO keyword_tag_mappings (id, keyword_group_id, tag_id, confidence_score, priority, context_rules, is_active, usage_count, created_at, updated_at)
      SELECT 5, kg.id, tm.id, 0.98, 1, NULL, TRUE, 0, NOW(), NOW()
      FROM keyword_groups kg, tags_master tm
      WHERE kg.group_name = 'GS칼텍스' AND tm.tag_name = '주유소'
      ON CONFLICT DO NOTHING;
    \n
      INSERT INTO keyword_tag_mappings (id, keyword_group_id, tag_id, confidence_score, priority, context_rules, is_active, usage_count, created_at, updated_at)
      SELECT 6, kg.id, tm.id, 0.97, 1, NULL, TRUE, 0, NOW(), NOW()
      FROM keyword_groups kg, tags_master tm
      WHERE kg.group_name = 'SK에너지' AND tm.tag_name = '주유소'
      ON CONFLICT DO NOTHING;
    \n
      INSERT INTO keyword_tag_mappings (id, keyword_group_id, tag_id, confidence_score, priority, context_rules, is_active, usage_count, created_at, updated_at)
      SELECT 7, kg.id, tm.id, 0.95, 1, NULL, TRUE, 0, NOW(), NOW()
      FROM keyword_groups kg, tags_master tm
      WHERE kg.group_name = '현대오일뱅크' AND tm.tag_name = '주유소'
      ON CONFLICT DO NOTHING;
    \n
      INSERT INTO keyword_tag_mappings (id, keyword_group_id, tag_id, confidence_score, priority, context_rules, is_active, usage_count, created_at, updated_at)
      SELECT 8, kg.id, tm.id, 0.94, 1, NULL, TRUE, 0, NOW(), NOW()
      FROM keyword_groups kg, tags_master tm
      WHERE kg.group_name = 'S-Oil' AND tm.tag_name = '주유소'
      ON CONFLICT DO NOTHING;
    \n
      INSERT INTO keyword_tag_mappings (id, keyword_group_id, tag_id, confidence_score, priority, context_rules, is_active, usage_count, created_at, updated_at)
      SELECT 9, kg.id, tm.id, 0.96, 1, NULL, TRUE, 0, NOW(), NOW()
      FROM keyword_groups kg, tags_master tm
      WHERE kg.group_name = '맥도날드' AND tm.tag_name = '패스트푸드'
      ON CONFLICT DO NOTHING;
    \n
      INSERT INTO keyword_tag_mappings (id, keyword_group_id, tag_id, confidence_score, priority, context_rules, is_active, usage_count, created_at, updated_at)
      SELECT 10, kg.id, tm.id, 0.93, 1, NULL, TRUE, 0, NOW(), NOW()
      FROM keyword_groups kg, tags_master tm
      WHERE kg.group_name = '롯데리아' AND tm.tag_name = '패스트푸드'
      ON CONFLICT DO NOTHING;
    \n
      INSERT INTO keyword_tag_mappings (id, keyword_group_id, tag_id, confidence_score, priority, context_rules, is_active, usage_count, created_at, updated_at)
      SELECT 11, kg.id, tm.id, 0.92, 1, NULL, TRUE, 0, NOW(), NOW()
      FROM keyword_groups kg, tags_master tm
      WHERE kg.group_name = '버거킹' AND tm.tag_name = '패스트푸드'
      ON CONFLICT DO NOTHING;
    \n
      INSERT INTO keyword_tag_mappings (id, keyword_group_id, tag_id, confidence_score, priority, context_rules, is_active, usage_count, created_at, updated_at)
      SELECT 12, kg.id, tm.id, 0.91, 1, NULL, TRUE, 0, NOW(), NOW()
      FROM keyword_groups kg, tags_master tm
      WHERE kg.group_name = 'KFC' AND tm.tag_name = '패스트푸드'
      ON CONFLICT DO NOTHING;
    \n
      INSERT INTO keyword_tag_mappings (id, keyword_group_id, tag_id, confidence_score, priority, context_rules, is_active, usage_count, created_at, updated_at)
      SELECT 13, kg.id, tm.id, 0.98, 1, NULL, TRUE, 0, NOW(), NOW()
      FROM keyword_groups kg, tags_master tm
      WHERE kg.group_name = '스타벅스' AND tm.tag_name = '카페'
      ON CONFLICT DO NOTHING;
    \n
      INSERT INTO keyword_tag_mappings (id, keyword_group_id, tag_id, confidence_score, priority, context_rules, is_active, usage_count, created_at, updated_at)
      SELECT 14, kg.id, tm.id, 0.9, 1, NULL, TRUE, 0, NOW(), NOW()
      FROM keyword_groups kg, tags_master tm
      WHERE kg.group_name = '커피빈' AND tm.tag_name = '카페'
      ON CONFLICT DO NOTHING;
    \n
      INSERT INTO keyword_tag_mappings (id, keyword_group_id, tag_id, confidence_score, priority, context_rules, is_active, usage_count, created_at, updated_at)
      SELECT 15, kg.id, tm.id, 0.88, 1, NULL, TRUE, 0, NOW(), NOW()
      FROM keyword_groups kg, tags_master tm
      WHERE kg.group_name = '이디야' AND tm.tag_name = '카페'
      ON CONFLICT DO NOTHING;
    \n
      INSERT INTO keyword_tag_mappings (id, keyword_group_id, tag_id, confidence_score, priority, context_rules, is_active, usage_count, created_at, updated_at)
      SELECT 16, kg.id, tm.id, 0.89, 1, NULL, TRUE, 0, NOW(), NOW()
      FROM keyword_groups kg, tags_master tm
      WHERE kg.group_name = '투썸플레이스' AND tm.tag_name = '카페'
      ON CONFLICT DO NOTHING;
    \n
      INSERT INTO keyword_tag_mappings (id, keyword_group_id, tag_id, confidence_score, priority, context_rules, is_active, usage_count, created_at, updated_at)
      SELECT 17, kg.id, tm.id, 0.95, 1, NULL, TRUE, 0, NOW(), NOW()
      FROM keyword_groups kg, tags_master tm
      WHERE kg.group_name = '쿠팡' AND tm.tag_name = '온라인쇼핑'
      ON CONFLICT DO NOTHING;
    \n
      INSERT INTO keyword_tag_mappings (id, keyword_group_id, tag_id, confidence_score, priority, context_rules, is_active, usage_count, created_at, updated_at)
      SELECT 18, kg.id, tm.id, 0.97, 1, NULL, TRUE, 0, NOW(), NOW()
      FROM keyword_groups kg, tags_master tm
      WHERE kg.group_name = '배달의민족' AND tm.tag_name = '배달앱'
      ON CONFLICT DO NOTHING;
    \n
      INSERT INTO keyword_tag_mappings (id, keyword_group_id, tag_id, confidence_score, priority, context_rules, is_active, usage_count, created_at, updated_at)
      SELECT 19, kg.id, tm.id, 0.93, 1, NULL, TRUE, 0, NOW(), NOW()
      FROM keyword_groups kg, tags_master tm
      WHERE kg.group_name = '요기요' AND tm.tag_name = '배달앱'
      ON CONFLICT DO NOTHING;
    \n
      INSERT INTO keyword_tag_mappings (id, keyword_group_id, tag_id, confidence_score, priority, context_rules, is_active, usage_count, created_at, updated_at)
      SELECT 20, kg.id, tm.id, 0.91, 1, NULL, TRUE, 0, NOW(), NOW()
      FROM keyword_groups kg, tags_master tm
      WHERE kg.group_name = '카카오택시' AND tm.tag_name = '교통'
      ON CONFLICT DO NOTHING;
    

-- 4. 태그-계정과목 매핑 데이터 삽입

      INSERT INTO tag_account_mappings (id, tag_id, account_code, account_name, mapping_condition, is_default, priority, confidence_boost, created_at, updated_at)
      SELECT 1, tm.id, '602', '지급수수료', NULL, true, 1, 0.05, NOW(), NOW()
      FROM tags_master tm
      WHERE tm.tag_name = '편의점'
      ON CONFLICT DO NOTHING;
    \n
      INSERT INTO tag_account_mappings (id, tag_id, account_code, account_name, mapping_condition, is_default, priority, confidence_boost, created_at, updated_at)
      SELECT 2, tm.id, '622', '차량유지비', NULL, true, 1, 0.1, NOW(), NOW()
      FROM tags_master tm
      WHERE tm.tag_name = '주유소'
      ON CONFLICT DO NOTHING;
    \n
      INSERT INTO tag_account_mappings (id, tag_id, account_code, account_name, mapping_condition, is_default, priority, confidence_boost, created_at, updated_at)
      SELECT 3, tm.id, '651', '접대비', NULL, true, 1, 0.05, NOW(), NOW()
      FROM tags_master tm
      WHERE tm.tag_name = '패스트푸드'
      ON CONFLICT DO NOTHING;
    \n
      INSERT INTO tag_account_mappings (id, tag_id, account_code, account_name, mapping_condition, is_default, priority, confidence_boost, created_at, updated_at)
      SELECT 4, tm.id, '651', '접대비', NULL, true, 1, 0.05, NOW(), NOW()
      FROM tags_master tm
      WHERE tm.tag_name = '카페'
      ON CONFLICT DO NOTHING;
    \n
      INSERT INTO tag_account_mappings (id, tag_id, account_code, account_name, mapping_condition, is_default, priority, confidence_boost, created_at, updated_at)
      SELECT 5, tm.id, '634', '소모품비', NULL, true, 1, 0.03, NOW(), NOW()
      FROM tags_master tm
      WHERE tm.tag_name = '온라인쇼핑'
      ON CONFLICT DO NOTHING;
    \n
      INSERT INTO tag_account_mappings (id, tag_id, account_code, account_name, mapping_condition, is_default, priority, confidence_boost, created_at, updated_at)
      SELECT 6, tm.id, '651', '접대비', NULL, true, 1, 0.05, NOW(), NOW()
      FROM tags_master tm
      WHERE tm.tag_name = '배달앱'
      ON CONFLICT DO NOTHING;
    \n
      INSERT INTO tag_account_mappings (id, tag_id, account_code, account_name, mapping_condition, is_default, priority, confidence_boost, created_at, updated_at)
      SELECT 7, tm.id, '611', '여비교통비', NULL, true, 1, 0.08, NOW(), NOW()
      FROM tags_master tm
      WHERE tm.tag_name = '교통'
      ON CONFLICT DO NOTHING;
    \n
      INSERT INTO tag_account_mappings (id, tag_id, account_code, account_name, mapping_condition, is_default, priority, confidence_boost, created_at, updated_at)
      SELECT 8, tm.id, '655', '야근식대', '{"time":"late_night"}', false, 2, 0.1, NOW(), NOW()
      FROM tags_master tm
      WHERE tm.tag_name = '편의점'
      ON CONFLICT DO NOTHING;
    \n
      INSERT INTO tag_account_mappings (id, tag_id, account_code, account_name, mapping_condition, is_default, priority, confidence_boost, created_at, updated_at)
      SELECT 9, tm.id, '634', '소모품비', '{"amount_max":10000}', false, 2, 0.03, NOW(), NOW()
      FROM tags_master tm
      WHERE tm.tag_name = '카페'
      ON CONFLICT DO NOTHING;
    

-- 5. 통계 업데이트
UPDATE keyword_groups SET updated_at = NOW();
UPDATE tags_master SET updated_at = NOW();

-- 6. 확인 쿼리
SELECT 'Keyword Groups' as table_name, COUNT(*) as count FROM keyword_groups WHERE is_active = TRUE
UNION ALL
SELECT 'Tags Master' as table_name, COUNT(*) as count FROM tags_master WHERE is_active = TRUE  
UNION ALL
SELECT 'Keyword-Tag Mappings' as table_name, COUNT(*) as count FROM keyword_tag_mappings WHERE is_active = TRUE
UNION ALL
SELECT 'Tag-Account Mappings' as table_name, COUNT(*) as count FROM tag_account_mappings;

COMMIT;
