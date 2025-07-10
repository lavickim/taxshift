-- 샘플 룰 데이터 삽입 스크립트
-- 2025-12-09 생성

-- 기본 회사 ID 가져오기 (이미 생성된 테스트 회사 사용)
DO $$
DECLARE
    company_uuid UUID;
BEGIN
    SELECT id INTO company_uuid FROM companies LIMIT 1;
    
    -- 커피/음료 관련 룰들
    INSERT INTO combined_rules (company_id, rule_name, rule_description, rule_pattern, target_debit_account, target_credit_account, target_suggested_tag, vat_applicable, confidence_score, priority, is_active, created_by) VALUES
    (company_uuid, '스타벅스 결제', '스타벅스 커피 구매 비용', '스타벅스|STARBUCKS|스벅', '접대비', '보통예금', '커피비용', true, 0.95, 10, true, 'ADMIN'),
    (company_uuid, '투썸플레이스 결제', '투썸플레이스 카페 비용', '투썸플레이스|TWOSOME|투썸', '접대비', '보통예금', '커피비용', true, 0.9, 8, true, 'ADMIN'),
    (company_uuid, '이디야 커피', '이디야 커피 구매', '이디야|EDIYA', '접대비', '보통예금', '커피비용', true, 0.85, 7, true, 'ADMIN');

    -- 편의점 관련 룰들
    INSERT INTO combined_rules (company_id, rule_name, rule_description, rule_pattern, target_debit_account, target_credit_account, target_suggested_tag, vat_applicable, confidence_score, priority, is_active, created_by) VALUES
    (company_uuid, 'GS25 구매', 'GS25 편의점 구매', 'GS25|지에스25', '소모품비', '보통예금', '편의점구매', true, 0.9, 5, true, 'ADMIN'),
    (company_uuid, '세븐일레븐 구매', '세븐일레븐 편의점 구매', '세븐일레븐|7-ELEVEN|711', '소모품비', '보통예금', '편의점구매', true, 0.9, 5, true, 'ADMIN'),
    (company_uuid, 'CU 편의점', 'CU 편의점 구매', 'CU편의점|씨유|CU ', '소모품비', '보통예금', '편의점구매', true, 0.9, 5, true, 'ADMIN');

    -- 교통 관련 룰들
    INSERT INTO combined_rules (company_id, rule_name, rule_description, rule_pattern, target_debit_account, target_credit_account, target_suggested_tag, vat_applicable, confidence_score, priority, is_active, created_by) VALUES
    (company_uuid, '택시 이용료', '택시 교통비', '택시|카카오택시|우버|UBER', '여비교통비', '보통예금', '택시비', false, 0.95, 15, true, 'ADMIN'),
    (company_uuid, '지하철 교통카드', '지하철 교통카드 충전/사용', '지하철|교통카드|티머니|원카드', '여비교통비', '보통예금', '대중교통', false, 0.9, 12, true, 'ADMIN'),
    (company_uuid, '버스 교통비', '버스 이용료', '버스|시내버스|광역버스', '여비교통비', '보통예금', '대중교통', false, 0.9, 12, true, 'ADMIN');

    -- 온라인 서비스 관련 룰들
    INSERT INTO combined_rules (company_id, rule_name, rule_description, rule_pattern, target_debit_account, target_credit_account, target_suggested_tag, vat_applicable, confidence_score, priority, is_active, created_by) VALUES
    (company_uuid, '구글 서비스', '구글 클라우드, 광고 등', '구글|GOOGLE|GOOG', '광고선전비', '보통예금', '온라인광고', true, 0.85, 8, true, 'ADMIN'),
    (company_uuid, '네이버 서비스', '네이버 클라우드, 광고 등', '네이버|NAVER', '광고선전비', '보통예금', '온라인광고', true, 0.85, 8, true, 'ADMIN'),
    (company_uuid, '아마존 AWS', '아마존 웹서비스', '아마존|AMAZON|AWS', '통신비', '보통예금', '클라우드서비스', true, 0.95, 20, true, 'ADMIN');

    -- 음식점 관련 룰들
    INSERT INTO combined_rules (company_id, rule_name, rule_description, rule_pattern, target_debit_account, target_credit_account, target_suggested_tag, vat_applicable, confidence_score, priority, is_active, created_by) VALUES
    (company_uuid, '맥도날드', '맥도날드 식사비용', '맥도날드|MCDONALDS|맥날', '접대비', '보통예금', '패스트푸드', true, 0.9, 6, true, 'ADMIN'),
    (company_uuid, 'KFC 치킨', 'KFC 치킨 구매', 'KFC|케이에프씨', '접대비', '보통예금', '패스트푸드', true, 0.9, 6, true, 'ADMIN'),
    (company_uuid, '치킨 전문점', '치킨 전문점 주문', '치킨|BBQ|굽네|교촌|BHC', '접대비', '보통예금', '치킨배달', true, 0.8, 5, true, 'ADMIN');

    -- 통신비 관련 룰들
    INSERT INTO combined_rules (company_id, rule_name, rule_description, rule_pattern, target_debit_account, target_credit_account, target_suggested_tag, vat_applicable, confidence_score, priority, is_active, created_by) VALUES
    (company_uuid, 'SKT 통신비', 'SK텔레콤 휴대폰 요금', 'SKT|SK텔레콤|SK TELECOM', '통신비', '보통예금', '휴대폰요금', true, 0.95, 25, true, 'ADMIN'),
    (company_uuid, 'KT 통신비', 'KT 통신 서비스', 'KT|케이티', '통신비', '보통예금', '통신서비스', true, 0.95, 25, true, 'ADMIN'),
    (company_uuid, 'LG유플러스', 'LG유플러스 통신비', 'LG유플러스|LGU+|유플러스', '통신비', '보통예금', '통신서비스', true, 0.95, 25, true, 'ADMIN');

    -- 사무용품/도서 관련 룰들
    INSERT INTO combined_rules (company_id, rule_name, rule_description, rule_pattern, target_debit_account, target_credit_account, target_suggested_tag, vat_applicable, confidence_score, priority, is_active, created_by) VALUES
    (company_uuid, '교보문고', '교보문고 도서 구매', '교보문고|KYOBO', '도서인쇄비', '보통예금', '도서구매', true, 0.9, 8, true, 'ADMIN'),
    (company_uuid, '예스24', '예스24 온라인 도서', '예스24|YES24', '도서인쇄비', '보통예금', '온라인도서', true, 0.9, 8, true, 'ADMIN'),
    (company_uuid, '다이소', '다이소 사무용품', '다이소|DAISO', '소모품비', '보통예금', '사무용품', true, 0.85, 5, true, 'ADMIN');

    -- 은행/금융 관련 룰들
    INSERT INTO combined_rules (company_id, rule_name, rule_description, rule_pattern, target_debit_account, target_credit_account, target_suggested_tag, vat_applicable, confidence_score, priority, is_active, created_by) VALUES
    (company_uuid, '신한은행 수수료', '신한은행 각종 수수료', '신한은행|신한카드|SHINHAN', '수수료', '보통예금', '은행수수료', false, 0.95, 30, true, 'ADMIN'),
    (company_uuid, '국민은행 수수료', '국민은행 각종 수수료', '국민은행|KB|국민카드', '수수료', '보통예금', '은행수수료', false, 0.95, 30, true, 'ADMIN'),
    (company_uuid, '하나은행 수수료', '하나은행 각종 수수료', '하나은행|하나카드|HANA', '수수료', '보통예금', '은행수수료', false, 0.95, 30, true, 'ADMIN');

    -- 주유소 관련 룰들
    INSERT INTO combined_rules (company_id, rule_name, rule_description, rule_pattern, target_debit_account, target_credit_account, target_suggested_tag, vat_applicable, confidence_score, priority, is_active, created_by) VALUES
    (company_uuid, 'SK주유소', 'SK 주유소 주유비', 'SK주유소|SK에너지|SKENERGY', '차량유지비', '보통예금', '주유비', true, 0.95, 20, true, 'ADMIN'),
    (company_uuid, 'GS칼텍스', 'GS칼텍스 주유소', 'GS칼텍스|GSCALTEX', '차량유지비', '보통예금', '주유비', true, 0.95, 20, true, 'ADMIN'),
    (company_uuid, 'S-OIL 주유소', 'S-OIL 주유소', 'S-OIL|에스오일|SOIL', '차량유지비', '보통예금', '주유비', true, 0.95, 20, true, 'ADMIN');

    RAISE NOTICE '총 24개의 샘플 룰이 성공적으로 삽입되었습니다.';
END $$; 