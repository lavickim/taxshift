-- MoneyShift v1.0: Phase 1 필수 15개 규칙 (Priority 200-150)
-- 생성일: 2025-07-27
-- 목적: 법인구조 확장 8개 + 고빈도 업종 7개 규칙 추가

-- Phase 1-1: 법인구조 확장 (8개 규칙) - Priority 195-188
-- 기존: (주), (유) → 추가: ㈜, 주식회사, 유한회사, 합명회사, 합자회사, 재단법인

INSERT INTO regex_preprocessing_rules (
    rule_name, description, category, input_pattern, output_template, 
    priority, is_active, metadata_tags, test_cases, test_examples, 
    usage_count, success_rate, created_at, updated_at
) VALUES 
-- 1. ㈜ 표시 제거 (한국 특수기호)
(
    '법인구조_주식회사_기호', 
    '㈜ 표시 제거 (한국 특수기호)', 
    '법인구조', 
    '㈜(.+)', 
    '$1', 
    195, 
    true, 
    '{"type": "corporate", "structure": "corporation", "symbol": "korean"}',
    '[{"input": "㈜삼성전자", "expected": "삼성전자"}]',
    '{"㈜삼성전자", "㈜LG전자", "㈜현대자동차"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 2. 주식회사 표시 제거 (전체 단어)
(
    '법인구조_주식회사_전체', 
    '주식회사 표시 제거 (전체 단어)', 
    '법인구조', 
    '(.+)\\s*주식회사|주식회사\\s*(.+)', 
    '$1$2', 
    194, 
    true, 
    '{"type": "corporate", "structure": "corporation", "format": "full"}',
    '[{"input": "삼성전자 주식회사", "expected": "삼성전자"}]',
    '{"삼성전자 주식회사", "주식회사 네이버", "LG전자주식회사"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 3. 유한회사 표시 제거 (전체 단어)
(
    '법인구조_유한회사_전체', 
    '유한회사 표시 제거 (전체 단어)', 
    '법인구조', 
    '(.+)\\s*유한회사|유한회사\\s*(.+)', 
    '$1$2', 
    193, 
    true, 
    '{"type": "corporate", "structure": "limited", "format": "full"}',
    '[{"input": "코리아마트 유한회사", "expected": "코리아마트"}]',
    '{"코리아마트 유한회사", "유한회사 대한물산", "부산상사유한회사"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 4. 합명회사 표시 제거
(
    '법인구조_합명회사', 
    '합명회사 표시 제거', 
    '법인구조', 
    '(.+)\\s*합명회사|합명회사\\s*(.+)', 
    '$1$2', 
    192, 
    true, 
    '{"type": "corporate", "structure": "general_partnership"}',
    '[{"input": "대한상사 합명회사", "expected": "대한상사"}]',
    '{"대한상사 합명회사", "합명회사 코리아무역"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 5. 합자회사 표시 제거
(
    '법인구조_합자회사', 
    '합자회사 표시 제거', 
    '법인구조', 
    '(.+)\\s*합자회사|합자회사\\s*(.+)', 
    '$1$2', 
    191, 
    true, 
    '{"type": "corporate", "structure": "limited_partnership"}',
    '[{"input": "부산물산 합자회사", "expected": "부산물산"}]',
    '{"부산물산 합자회사", "합자회사 한국투자"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 6. 재단법인 표시 제거
(
    '법인구조_재단법인', 
    '재단법인 표시 제거', 
    '법인구조', 
    '(.+)\\s*재단법인|재단법인\\s*(.+)', 
    '$1$2', 
    190, 
    true, 
    '{"type": "corporate", "structure": "foundation"}',
    '[{"input": "한국문화 재단법인", "expected": "한국문화"}]',
    '{"한국문화 재단법인", "재단법인 교육진흥원"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 7. 사단법인 표시 제거
(
    '법인구조_사단법인', 
    '사단법인 표시 제거', 
    '법인구조', 
    '(.+)\\s*사단법인|사단법인\\s*(.+)', 
    '$1$2', 
    189, 
    true, 
    '{"type": "corporate", "structure": "association"}',
    '[{"input": "한국협회 사단법인", "expected": "한국협회"}]',
    '{"한국협회 사단법인", "사단법인 소상공인연합회"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 8. 협동조합 표시 제거
(
    '법인구조_협동조합', 
    '협동조합 표시 제거', 
    '법인구조', 
    '(.+)\\s*협동조합|협동조합\\s*(.+)', 
    '$1$2', 
    188, 
    true, 
    '{"type": "corporate", "structure": "cooperative"}',
    '[{"input": "농협 협동조합", "expected": "농협"}]',
    '{"농협 협동조합", "협동조합 한살림", "소비자협동조합"}',
    0, 
    null,
    NOW(), 
    NOW()
);

-- Phase 1-2: 고빈도 업종 7개 규칙 (Priority 187-181)
-- 54만건 국민연금 데이터에서 상위 출현 업종 기반

INSERT INTO regex_preprocessing_rules (
    rule_name, description, category, input_pattern, output_template, 
    priority, is_active, metadata_tags, test_cases, test_examples, 
    usage_count, success_rate, created_at, updated_at
) VALUES 
-- 9. 카페/커피전문점 정규화
(
    '업종_카페_통합', 
    '카페/커피 관련 업종명 통합', 
    '카페', 
    '스타벅스|STARBUCKS|커피빈|COFFEE\\s*BEAN|이디야|EDIYA|메가커피|투썸플레이스|TWOSOME|카페베네|할리스|HOLLYS', 
    '카페', 
    187, 
    true, 
    '{"type": "cafe", "category": "coffee_shop", "brand_unified": true}',
    '[{"input": "스타벅스 강남점", "expected": "카페"}]',
    '{"스타벅스 강남점", "STARBUCKS GANGNAM", "이디야커피 서초점", "메가MGC커피"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 10. 편의점 정규화
(
    '업종_편의점_통합', 
    '편의점 브랜드명 통합', 
    '편의점', 
    'CU|GS25|세븐일레븐|7-ELEVEN|이마트24|EMART24|미니스톱|MINISTOP', 
    '편의점', 
    186, 
    true, 
    '{"type": "convenience", "category": "convenience_store", "brand_unified": true}',
    '[{"input": "CU 역삼점", "expected": "편의점"}]',
    '{"CU 역삼점", "GS25편의점", "세븐일레븐 강남", "이마트24 서초"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 11. 치킨/프랜차이즈 정규화
(
    '업종_치킨_통합', 
    '치킨 프랜차이즈 브랜드명 통합', 
    '치킨', 
    'BBQ|비비큐|굽네치킨|교촌치킨|KFC|맥도날드|MCDONALDS|버거킹|BURGER\\s*KING|롯데리아', 
    '프랜차이즈', 
    185, 
    true, 
    '{"type": "franchise", "category": "fast_food", "brand_unified": true}',
    '[{"input": "BBQ치킨 역삼점", "expected": "프랜차이즈"}]',
    '{"BBQ치킨 역삼점", "굽네치킨역삼", "KFC강남점", "맥도날드 서초"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 12. 병원/의료기관 정규화
(
    '업종_병원_통합', 
    '병원/의료기관 정규화', 
    '병원', 
    '(.+)\\s*(병원|의원|클리닉|CLINIC|한의원|치과|내과|외과|산부인과|소아과)', 
    '$1 의료기관', 
    184, 
    true, 
    '{"type": "medical", "category": "hospital", "service_type": "healthcare"}',
    '[{"input": "서울대병원", "expected": "서울대 의료기관"}]',
    '{"서울대병원", "강남세브란스병원", "삼성서울병원", "연세대의료원"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 13. 학교/교육기관 정규화
(
    '업종_학교_통합', 
    '학교/교육기관 정규화', 
    '학교', 
    '(.+)\\s*(초등학교|중학교|고등학교|대학교|대학|학원|유치원|어린이집)', 
    '$1 교육기관', 
    183, 
    true, 
    '{"type": "education", "category": "school", "service_type": "education"}',
    '[{"input": "서울대학교", "expected": "서울대 교육기관"}]',
    '{"서울대학교", "강남중학교", "역삼고등학교", "해커스어학원"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 14. 금융기관 정규화 
(
    '업종_금융_통합', 
    '금융기관 정규화', 
    '금융', 
    '(.+)\\s*(은행|BANK|신용금고|새마을금고|농협|신협|증권|보험|카드)', 
    '$1 금융기관', 
    182, 
    true, 
    '{"type": "finance", "category": "financial_institution", "service_type": "banking"}',
    '[{"input": "KB국민은행", "expected": "KB국민 금융기관"}]',
    '{"KB국민은행", "신한은행 강남점", "삼성증권", "현대카드"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 15. 약국/헬스케어 정규화
(
    '업종_약국_통합', 
    '약국/헬스케어 정규화', 
    '약국', 
    '(.+)\\s*(약국|PHARMACY|드럭스토어|올리브영|OLIVE\\s*YOUNG)', 
    '$1 약국', 
    181, 
    true, 
    '{"type": "pharmacy", "category": "healthcare", "service_type": "medicine"}',
    '[{"input": "온누리약국", "expected": "온누리 약국"}]',
    '{"온누리약국", "부민약국", "올리브영 강남점", "세이브존"}',
    0, 
    null,
    NOW(), 
    NOW()
);

-- 생성 완료 확인
SELECT 'Phase 1 필수 15개 규칙이 성공적으로 생성되었습니다.' as status;