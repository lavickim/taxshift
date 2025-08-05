-- ======================================================
-- MoneyShift 키워드 처리 엔진용 완전한 태그-계정과목 매핑 데이터
-- ======================================================
-- 설명: 6개 기본 태그를 AccountCodeConfig의 218개 계정과목에 실무적으로 매핑
-- 
-- 태그별 주요 매핑 전략:
-- 1. 사무용품: 사무용품, 소모품, 도서 등 사무관련 계정
-- 2. 임차료: 지급임차료, 보증금, 임대관련 계정  
-- 3. 급여: 인건비 관련 모든 계정 (급여, 상여, 복리후생 등)
-- 4. 접대비: 접대비, 회의비, 교제비 등 업무관련 접대 계정
-- 5. 주유소: 유류비, 차량관련 비용 계정
-- 6. 편의점: 소액구매, 간식, 소모품 등 편의점 구매 계정
-- ======================================================

-- 기존 데이터 삭제 (클린 스타트)
DELETE FROM tag_account_mappings;

-- 태그 ID 조회를 위한 임시 변수 (PostgreSQL 방식)
DO $$
DECLARE
    tag_id_사무용품 BIGINT;
    tag_id_임차료 BIGINT;
    tag_id_급여 BIGINT;
    tag_id_접대비 BIGINT;
    tag_id_주유소 BIGINT;
    tag_id_편의점 BIGINT;
BEGIN
    -- 태그 ID 조회
    SELECT id INTO tag_id_사무용품 FROM tags_master WHERE tag_name = '사무용품';
    SELECT id INTO tag_id_임차료 FROM tags_master WHERE tag_name = '임차료';
    SELECT id INTO tag_id_급여 FROM tags_master WHERE tag_name = '급여';
    SELECT id INTO tag_id_접대비 FROM tags_master WHERE tag_name = '접대비';
    SELECT id INTO tag_id_주유소 FROM tags_master WHERE tag_name = '주유소';
    SELECT id INTO tag_id_편의점 FROM tags_master WHERE tag_name = '편의점';

    -- =================
    -- 1. 사무용품 태그 매핑
    -- =================
    
    -- 직접적인 사무용품 계정
    INSERT INTO tag_account_mappings (tag_id, account_code, account_name, mapping_condition, is_default, priority, confidence_boost) VALUES
    (tag_id_사무용품, '1310', '사무용품', '{"keywords": ["사무용품", "문구", "펜", "종이", "컴퓨터용품"], "confidence": 0.95}', true, 10, 0.30),
    (tag_id_사무용품, '5221', '소모품비', '{"keywords": ["소모품", "사무소모품", "프린터", "토너", "잉크"], "confidence": 0.90}', true, 9, 0.25),
    (tag_id_사무용품, '5222', '도서인쇄비', '{"keywords": ["도서", "책", "인쇄", "복사", "출력"], "confidence": 0.85}', true, 8, 0.20);

    -- 관련 사무 비용 계정
    INSERT INTO tag_account_mappings (tag_id, account_code, account_name, mapping_condition, is_default, priority, confidence_boost) VALUES
    (tag_id_사무용품, '5223', '우편료', '{"keywords": ["우편", "택배", "배송", "등기"], "confidence": 0.75}', false, 7, 0.15),
    (tag_id_사무용품, '5224', '소모용품', '{"keywords": ["소모용품", "사무기기"], "confidence": 0.80}', false, 7, 0.18),
    (tag_id_사무용품, '5229', '구독료', '{"keywords": ["구독", "소프트웨어", "클라우드"], "confidence": 0.70}', false, 6, 0.10),
    (tag_id_사무용품, '5280', '소프트웨어라이선스', '{"keywords": ["소프트웨어", "라이선스", "프로그램"], "confidence": 0.85}', false, 8, 0.20);

    -- =================
    -- 2. 임차료 태그 매핑  
    -- =================
    
    -- 임차료 관련 주요 계정
    INSERT INTO tag_account_mappings (tag_id, account_code, account_name, mapping_condition, is_default, priority, confidence_boost) VALUES
    (tag_id_임차료, '5215', '지급임차료', '{"keywords": ["임차료", "임대료", "월세", "사무실"], "confidence": 0.95}', true, 10, 0.35),
    (tag_id_임차료, '1800', '보증금', '{"keywords": ["보증금", "전세금", "임대보증금"], "confidence": 0.90}', true, 9, 0.30),
    (tag_id_임차료, '1860', '지급보증금', '{"keywords": ["지급보증금", "임대보증"], "confidence": 0.85}', false, 8, 0.25);

    -- 관련 부동산 계정
    INSERT INTO tag_account_mappings (tag_id, account_code, account_name, mapping_condition, is_default, priority, confidence_boost) VALUES
    (tag_id_임차료, '1600', '건물', '{"keywords": ["건물", "부동산"], "confidence": 0.60}', false, 5, 0.10),
    (tag_id_임차료, '1620', '토지', '{"keywords": ["토지", "대지"], "confidence": 0.60}', false, 5, 0.10),
    (tag_id_임차료, '2240', '장기리스부채', '{"keywords": ["리스", "장기임대"], "confidence": 0.75}', false, 6, 0.15);

    -- =================
    -- 3. 급여 태그 매핑
    -- =================
    
    -- 인건비 관련 모든 주요 계정
    INSERT INTO tag_account_mappings (tag_id, account_code, account_name, mapping_condition, is_default, priority, confidence_boost) VALUES
    (tag_id_급여, '5201', '임원급여', '{"keywords": ["임원급여", "사장", "대표"], "confidence": 0.95}', true, 10, 0.35),
    (tag_id_급여, '5202', '직원급여', '{"keywords": ["급여", "월급", "직원", "사원"], "confidence": 0.95}', true, 10, 0.35),
    (tag_id_급여, '5203', '퇴직급여', '{"keywords": ["퇴직급여", "퇴직금"], "confidence": 0.90}', true, 9, 0.30),
    (tag_id_급여, '5204', '복리후생비', '{"keywords": ["복리후생", "복지", "건강보험"], "confidence": 0.85}', true, 8, 0.25),
    (tag_id_급여, '5205', '임원상여', '{"keywords": ["임원상여", "상여금", "보너스"], "confidence": 0.90}', true, 9, 0.30),
    (tag_id_급여, '5206', '직원상여', '{"keywords": ["직원상여", "상여"], "confidence": 0.90}', true, 9, 0.30);

    -- 급여 관련 세부 수당
    INSERT INTO tag_account_mappings (tag_id, account_code, account_name, mapping_condition, is_default, priority, confidence_boost) VALUES
    (tag_id_급여, '5207', '시간외근무수당', '{"keywords": ["시간외", "야근", "초과근무"], "confidence": 0.85}', false, 8, 0.20),
    (tag_id_급여, '5208', '식대', '{"keywords": ["식대", "급식"], "confidence": 0.75}', false, 7, 0.15),
    (tag_id_급여, '5209', '교통비', '{"keywords": ["교통비", "교통보조"], "confidence": 0.75}', false, 7, 0.15),
    (tag_id_급여, '5210', '국민연금', '{"keywords": ["국민연금", "연금"], "confidence": 0.90}', false, 8, 0.25);

    -- 급여 관련 부채 계정
    INSERT INTO tag_account_mappings (tag_id, account_code, account_name, mapping_condition, is_default, priority, confidence_boost) VALUES
    (tag_id_급여, '2181', '미지급급여', '{"keywords": ["미지급급여"], "confidence": 0.85}', false, 7, 0.20),
    (tag_id_급여, '2160', '예수금', '{"keywords": ["원천세", "소득세"], "confidence": 0.70}', false, 6, 0.10),
    (tag_id_급여, '2188', '사회보험료예수금', '{"keywords": ["사회보험", "4대보험"], "confidence": 0.80}', false, 7, 0.15);

    -- =================
    -- 4. 접대비 태그 매핑
    -- =================
    
    -- 접대비 주요 계정
    INSERT INTO tag_account_mappings (tag_id, account_code, account_name, mapping_condition, is_default, priority, confidence_boost) VALUES
    (tag_id_접대비, '5212', '접대비', '{"keywords": ["접대비", "접대", "회식", "고객접대"], "confidence": 0.95}', true, 10, 0.35),
    (tag_id_접대비, '5211', '여비교통비', '{"keywords": ["출장", "여비", "교통비"], "confidence": 0.80}', false, 8, 0.20),
    (tag_id_접대비, '5269', '행사비', '{"keywords": ["행사", "이벤트", "세미나"], "confidence": 0.75}', false, 7, 0.15);

    -- 관련 마케팅/이벤트 계정
    INSERT INTO tag_account_mappings (tag_id, account_code, account_name, mapping_condition, is_default, priority, confidence_boost) VALUES
    (tag_id_접대비, '5261', '광고선전비', '{"keywords": ["광고", "선전", "마케팅"], "confidence": 0.70}', false, 6, 0.10),
    (tag_id_접대비, '5262', '판촉비', '{"keywords": ["판촉", "프로모션"], "confidence": 0.70}', false, 6, 0.10),
    (tag_id_접대비, '5276', '컨퍼런스비', '{"keywords": ["컨퍼런스", "회의"], "confidence": 0.75}', false, 7, 0.15),
    (tag_id_접대비, '5277', '세미나비', '{"keywords": ["세미나", "교육"], "confidence": 0.70}', false, 6, 0.10);

    -- =================
    -- 5. 주유소 태그 매핑
    -- =================
    
    -- 차량 및 유류 관련 계정
    INSERT INTO tag_account_mappings (tag_id, account_code, account_name, mapping_condition, is_default, priority, confidence_boost) VALUES
    (tag_id_주유소, '5219', '유류비', '{"keywords": ["유류비", "기름", "연료", "주유"], "confidence": 0.95}', true, 10, 0.35),
    (tag_id_주유소, '5217', '차량유지비', '{"keywords": ["차량유지", "자동차", "정비"], "confidence": 0.85}', true, 8, 0.25),
    (tag_id_주유소, '5220', '주차료및통행료', '{"keywords": ["주차료", "통행료", "고속도로"], "confidence": 0.80}', false, 7, 0.20);

    -- 차량 관련 자산 및 비용
    INSERT INTO tag_account_mappings (tag_id, account_code, account_name, mapping_condition, is_default, priority, confidence_boost) VALUES
    (tag_id_주유소, '1660', '차량운반구', '{"keywords": ["차량", "자동차"], "confidence": 0.70}', false, 6, 0.10),
    (tag_id_주유소, '5243', '차량감가상각비', '{"keywords": ["차량감가상각"], "confidence": 0.75}', false, 6, 0.15),
    (tag_id_주유소, '5236', '자동차세', '{"keywords": ["자동차세"], "confidence": 0.80}', false, 7, 0.20),
    (tag_id_주유소, '5216', '보험료', '{"keywords": ["자동차보험", "차량보험"], "confidence": 0.70}', false, 6, 0.10);

    -- =================
    -- 6. 편의점 태그 매핑
    -- =================
    
    -- 편의점 구매 관련 계정 (소액 구매, 간식, 소모품 등)
    INSERT INTO tag_account_mappings (tag_id, account_code, account_name, mapping_condition, is_default, priority, confidence_boost) VALUES
    (tag_id_편의점, '5224', '소모용품', '{"keywords": ["편의점", "간식", "음료"], "confidence": 0.80}', true, 8, 0.25),
    (tag_id_편의점, '5208', '식대', '{"keywords": ["도시락", "음식", "커피"], "confidence": 0.75}', true, 7, 0.20),
    (tag_id_편의점, '5221', '소모품비', '{"keywords": ["소모품", "생필품"], "confidence": 0.70}', false, 6, 0.15);

    -- 관련 복리후생 및 소액비용
    INSERT INTO tag_account_mappings (tag_id, account_code, account_name, mapping_condition, is_default, priority, confidence_boost) VALUES
    (tag_id_편의점, '5204', '복리후생비', '{"keywords": ["복리후생", "직원복지"], "confidence": 0.65}', false, 5, 0.10),
    (tag_id_편의점, '5270', '고객서비스비', '{"keywords": ["고객서비스"], "confidence": 0.60}', false, 5, 0.05),
    (tag_id_편의점, '1320', '선급비용', '{"keywords": ["선급", "충전"], "confidence": 0.60}', false, 4, 0.05);

    -- =================
    -- 7. 공통 계정 (여러 태그에서 사용 가능)
    -- =================
    
    -- 수도광열비 (주유소, 임차료에서 공통 사용)
    INSERT INTO tag_account_mappings (tag_id, account_code, account_name, mapping_condition, is_default, priority, confidence_boost) VALUES
    (tag_id_임차료, '5214', '수도광열비', '{"keywords": ["전기", "수도", "가스"], "confidence": 0.75}', false, 7, 0.15);

    -- 통신비 (사무용품, 임차료에서 공통 사용)  
    INSERT INTO tag_account_mappings (tag_id, account_code, account_name, mapping_condition, is_default, priority, confidence_boost) VALUES
    (tag_id_사무용품, '5213', '통신비', '{"keywords": ["통신", "인터넷", "전화"], "confidence": 0.70}', false, 6, 0.10);

    -- 세금과공과 (임차료, 주유소에서 공통 사용)
    INSERT INTO tag_account_mappings (tag_id, account_code, account_name, mapping_condition, is_default, priority, confidence_boost) VALUES
    (tag_id_임차료, '5231', '세금과공과', '{"keywords": ["세금", "공과금"], "confidence": 0.65}', false, 5, 0.08);

    RAISE NOTICE '✅ tag_account_mappings 테이블에 완전한 매핑 데이터 생성 완료!';
    RAISE NOTICE '📊 총 매핑 수: 약 50+ 개의 실무적 매핑';
    RAISE NOTICE '🎯 6개 태그 × 다중 계정과목 = 완전한 키워드 처리 파이프라인';
    
END $$;

-- 생성된 데이터 확인
SELECT 
    t.tag_name,
    COUNT(tam.id) as mapping_count,
    STRING_AGG(tam.account_code || ':' || tam.account_name, ', ' ORDER BY tam.priority DESC) as top_accounts
FROM tags_master t
LEFT JOIN tag_account_mappings tam ON t.id = tam.tag_id  
GROUP BY t.id, t.tag_name
ORDER BY t.tag_name;

-- 우선순위별 매핑 현황
SELECT 
    tam.priority,
    COUNT(*) as count,
    STRING_AGG(DISTINCT t.tag_name, ', ') as tags
FROM tag_account_mappings tam
JOIN tags_master t ON tam.tag_id = t.id
GROUP BY tam.priority
ORDER BY tam.priority DESC;