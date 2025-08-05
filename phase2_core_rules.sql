-- MoneyShift v1.0: Phase 2 핵심 25개 규칙 (Priority 149-100)
-- 생성일: 2025-07-27
-- 목적: 결제 시스템 패턴 + 지점/점포 패턴 + 주요 브랜드 패턴

-- 먼저 필요한 카테고리 추가
INSERT INTO regex_preprocessing_categories (category_name, description, is_active, created_at)
VALUES 
('결제시스템', '결제/카드/페이 관련 시스템', true, NOW()),
('지점관리', '지점/점포/본점 관리', true, NOW()),
('브랜드통합', '주요 브랜드명 통합', true, NOW()),
('배송물류', '배송/택배/물류 관련', true, NOW()),
('온라인쇼핑', '온라인 쇼핑몰/이커머스', true, NOW()),
('교통운송', '교통/운송/주차 관련', true, NOW()),
('숙박관광', '숙박/호텔/관광 관련', true, NOW())
ON CONFLICT (category_name) DO NOTHING;

-- Phase 2-1: 결제 시스템 패턴 (8개 규칙) - Priority 149-142
INSERT INTO regex_preprocessing_rules (
    rule_name, description, category, input_pattern, output_template, 
    priority, is_active, metadata_tags, test_cases, test_examples, 
    usage_count, success_rate, created_at, updated_at
) VALUES 
-- 1. 카드결제 통합
(
    '결제_카드_통합', 
    '각종 카드 결제 시스템 통합', 
    '결제시스템', 
    '(.+)\\s*(카드|CARD)\\s*(결제|승인|취소)?', 
    '$1 카드결제', 
    149, 
    true, 
    '{"type": "payment", "method": "card", "system": "unified"}',
    '[{"input": "신한카드 결제", "expected": "신한 카드결제"}]',
    '{"신한카드 결제", "BC카드승인", "삼성카드"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 2. 페이 시스템 통합
(
    '결제_페이_통합', 
    '각종 페이 시스템 통합', 
    '결제시스템', 
    '(.*)\\s*(페이|PAY)\\s*(결제|승인)?', 
    '$1 페이', 
    148, 
    true, 
    '{"type": "payment", "method": "digital_pay", "system": "mobile"}',
    '[{"input": "삼성페이 결제", "expected": "삼성 페이"}]',
    '{"삼성페이 결제", "카카오PAY", "네이버페이", "토스페이"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 3. 온라인 결제 통합
(
    '결제_온라인_통합', 
    '온라인 결제 시스템 통합', 
    '결제시스템', 
    '(.+)\\s*(온라인|ONLINE)\\s*(결제|쇼핑|몰)', 
    '$1 온라인쇼핑', 
    147, 
    true, 
    '{"type": "payment", "method": "online", "platform": "ecommerce"}',
    '[{"input": "쿠팡 온라인 결제", "expected": "쿠팡 온라인쇼핑"}]',
    '{"쿠팡 온라인 결제", "11번가 온라인몰", "G마켓 온라인쇼핑"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 4. 간편결제 통합
(
    '결제_간편결제_통합', 
    '간편결제 시스템 통합', 
    '결제시스템', 
    '(.+)\\s*(간편결제|간편|SIMPLE\\s*PAY)', 
    '$1 간편결제', 
    146, 
    true, 
    '{"type": "payment", "method": "simple_pay", "convenience": true}',
    '[{"input": "토스 간편결제", "expected": "토스 간편결제"}]',
    '{"토스 간편결제", "페이코 간편", "SIMPLE PAY"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 5. QR코드 결제 통합
(
    '결제_QR코드_통합', 
    'QR코드 결제 시스템 통합', 
    '결제시스템', 
    '(.+)\\s*(QR|큐알)\\s*(코드|결제)', 
    '$1 QR결제', 
    145, 
    true, 
    '{"type": "payment", "method": "qr_code", "technology": "barcode"}',
    '[{"input": "제로페이 QR코드", "expected": "제로페이 QR결제"}]',
    '{"제로페이 QR코드", "네이버 큐알결제", "카카오 QR"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 6. 모바일 결제 통합
(
    '결제_모바일_통합', 
    '모바일 결제 시스템 통합', 
    '결제시스템', 
    '(.+)\\s*(모바일|MOBILE)\\s*(결제|페이)', 
    '$1 모바일결제', 
    144, 
    true, 
    '{"type": "payment", "method": "mobile", "device": "smartphone"}',
    '[{"input": "SKT 모바일 결제", "expected": "SKT 모바일결제"}]',
    '{"SKT 모바일 결제", "KT 모바일페이", "LG 모바일"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 7. 계좌이체 통합
(
    '결제_계좌이체_통합', 
    '계좌이체 시스템 통합', 
    '결제시스템', 
    '(.+)\\s*(계좌이체|이체|TRANSFER)', 
    '$1 계좌이체', 
    143, 
    true, 
    '{"type": "payment", "method": "bank_transfer", "system": "banking"}',
    '[{"input": "KB 계좌이체", "expected": "KB 계좌이체"}]',
    '{"KB 계좌이체", "신한 이체", "우리TRANSFER"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 8. 상품권/포인트 통합
(
    '결제_상품권_통합', 
    '상품권/포인트 결제 통합', 
    '결제시스템', 
    '(.+)\\s*(상품권|포인트|POINT|적립)', 
    '$1 포인트', 
    142, 
    true, 
    '{"type": "payment", "method": "points", "reward": true}',
    '[{"input": "롯데 상품권", "expected": "롯데 포인트"}]',
    '{"롯데 상품권", "신세계 포인트", "OK캐쉬백 적립"}',
    0, 
    null,
    NOW(), 
    NOW()
);

-- Phase 2-2: 지점/점포 패턴 (9개 규칙) - Priority 141-133
INSERT INTO regex_preprocessing_rules (
    rule_name, description, category, input_pattern, output_template, 
    priority, is_active, metadata_tags, test_cases, test_examples, 
    usage_count, success_rate, created_at, updated_at
) VALUES 
-- 9. 지점 표시 정규화
(
    '지점_지점_통합', 
    '지점 표시 정규화', 
    '지점관리', 
    '(.+)\\s*(지점|BRANCH)', 
    '$1 지점', 
    141, 
    true, 
    '{"type": "branch", "location_type": "branch", "management": "regional"}',
    '[{"input": "강남지점", "expected": "강남 지점"}]',
    '{"강남지점", "서초BRANCH", "역삼 지점"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 10. 본점 표시 정규화
(
    '지점_본점_통합', 
    '본점 표시 정규화', 
    '지점관리', 
    '(.+)\\s*(본점|본사|HEAD\\s*OFFICE)', 
    '$1 본점', 
    140, 
    true, 
    '{"type": "branch", "location_type": "headquarters", "management": "central"}',
    '[{"input": "서울본점", "expected": "서울 본점"}]',
    '{"서울본점", "강남본사", "HEAD OFFICE"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 11. 지사 표시 정규화
(
    '지점_지사_통합', 
    '지사 표시 정규화', 
    '지점관리', 
    '(.+)\\s*(지사|OFFICE)', 
    '$1 지사', 
    139, 
    true, 
    '{"type": "branch", "location_type": "office", "management": "subsidiary"}',
    '[{"input": "부산지사", "expected": "부산 지사"}]',
    '{"부산지사", "대구 OFFICE", "인천지사"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 12. 점포 표시 정규화
(
    '지점_점포_통합', 
    '점/점포 표시 정규화', 
    '지점관리', 
    '(.+)\\s*(점|점포|STORE)(?!심|주)', 
    '$1 점포', 
    138, 
    true, 
    '{"type": "branch", "location_type": "store", "retail": true}',
    '[{"input": "강남점", "expected": "강남 점포"}]',
    '{"강남점", "서초점포", "역삼STORE"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 13. 센터 표시 정규화
(
    '지점_센터_통합', 
    '센터 표시 정규화', 
    '지점관리', 
    '(.+)\\s*(센터|CENTER)', 
    '$1 센터', 
    137, 
    true, 
    '{"type": "branch", "location_type": "center", "service": true}',
    '[{"input": "고객센터", "expected": "고객 센터"}]',
    '{"고객센터", "서비스CENTER", "물류센터"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 14. 영업소 표시 정규화
(
    '지점_영업소_통합', 
    '영업소 표시 정규화', 
    '지점관리', 
    '(.+)\\s*(영업소|SALES\\s*OFFICE)', 
    '$1 영업소', 
    136, 
    true, 
    '{"type": "branch", "location_type": "sales_office", "business": true}',
    '[{"input": "강남영업소", "expected": "강남 영업소"}]',
    '{"강남영업소", "서초 SALES OFFICE", "부산영업소"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 15. 대리점 표시 정규화
(
    '지점_대리점_통합', 
    '대리점 표시 정규화', 
    '지점관리', 
    '(.+)\\s*(대리점|AGENCY)', 
    '$1 대리점', 
    135, 
    true, 
    '{"type": "branch", "location_type": "agency", "franchise": true}',
    '[{"input": "삼성대리점", "expected": "삼성 대리점"}]',
    '{"삼성대리점", "LG AGENCY", "현대대리점"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 16. 매장 표시 정규화
(
    '지점_매장_통합', 
    '매장 표시 정규화', 
    '지점관리', 
    '(.+)\\s*(매장|SHOP)', 
    '$1 매장', 
    134, 
    true, 
    '{"type": "branch", "location_type": "shop", "retail": true}',
    '[{"input": "패션매장", "expected": "패션 매장"}]',
    '{"패션매장", "전자SHOP", "의류매장"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 17. 아울렛 표시 정규화
(
    '지점_아울렛_통합', 
    '아울렛 표시 정규화', 
    '지점관리', 
    '(.+)\\s*(아울렛|OUTLET)', 
    '$1 아울렛', 
    133, 
    true, 
    '{"type": "branch", "location_type": "outlet", "discount": true}',
    '[{"input": "프리미엄아울렛", "expected": "프리미엄 아울렛"}]',
    '{"프리미엄아울렛", "신세계 OUTLET", "롯데아울렛"}',
    0, 
    null,
    NOW(), 
    NOW()
);

-- Phase 2-3: 주요 브랜드 패턴 (8개 규칙) - Priority 132-125
INSERT INTO regex_preprocessing_rules (
    rule_name, description, category, input_pattern, output_template, 
    priority, is_active, metadata_tags, test_cases, test_examples, 
    usage_count, success_rate, created_at, updated_at
) VALUES 
-- 18. 쿠팡 통합
(
    '브랜드_쿠팡_통합', 
    '쿠팡 관련 브랜드 통합', 
    '온라인쇼핑', 
    'COUPANG|쿠팡|쿠팡플레이|COUPANG\\s*PLAY', 
    '쿠팡', 
    132, 
    true, 
    '{"type": "ecommerce", "brand": "coupang", "platform": "online"}',
    '[{"input": "COUPANG 배송", "expected": "쿠팡"}]',
    '{"COUPANG 배송", "쿠팡플레이", "쿠팡이츠"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 19. 네이버 통합
(
    '브랜드_네이버_통합', 
    '네이버 관련 브랜드 통합', 
    '온라인쇼핑', 
    'NAVER|네이버|N\\s*PAY|네이버페이', 
    '네이버', 
    131, 
    true, 
    '{"type": "platform", "brand": "naver", "service": "integrated"}',
    '[{"input": "NAVER 쇼핑", "expected": "네이버"}]',
    '{"NAVER 쇼핑", "네이버페이", "N PAY"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 20. 카카오 통합
(
    '브랜드_카카오_통합', 
    '카카오 관련 브랜드 통합', 
    '온라인쇼핑', 
    'KAKAO|카카오|카카오톡|KAKAOTALK', 
    '카카오', 
    130, 
    true, 
    '{"type": "platform", "brand": "kakao", "service": "integrated"}',
    '[{"input": "KAKAO 페이", "expected": "카카오"}]',
    '{"KAKAO 페이", "카카오톡", "카카오뱅크"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 21. 배달앱 통합
(
    '브랜드_배달앱_통합', 
    '배달 앱 브랜드 통합', 
    '배송물류', 
    '배달의민족|BAEDAL|요기요|YOGIYO|배달통|딜리버리', 
    '배달앱', 
    129, 
    true, 
    '{"type": "delivery", "brand": "delivery_app", "service": "food"}',
    '[{"input": "배달의민족", "expected": "배달앱"}]',
    '{"배달의민족", "요기요 YOGIYO", "배달통"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 22. 택배/물류 통합
(
    '브랜드_택배_통합', 
    '택배/물류 브랜드 통합', 
    '배송물류', 
    'CJ대한통운|한진택배|롯데택배|우체국택배|로젠택배|LOGEN', 
    '택배', 
    128, 
    true, 
    '{"type": "logistics", "brand": "delivery", "service": "parcel"}',
    '[{"input": "CJ대한통운", "expected": "택배"}]',
    '{"CJ대한통운", "한진택배", "LOGEN"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 23. 교통/주차 통합
(
    '브랜드_교통_통합', 
    '교통/주차 관련 통합', 
    '교통운송', 
    '(.+)\\s*(주차장|주차|PARKING|버스|지하철|택시|TAXI)', 
    '$1 교통', 
    127, 
    true, 
    '{"type": "transport", "category": "traffic", "service": "parking"}',
    '[{"input": "강남 주차장", "expected": "강남 교통"}]',
    '{"강남 주차장", "서초PARKING", "역삼택시"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 24. 숙박/호텔 통합
(
    '브랜드_숙박_통합', 
    '숙박/호텔 브랜드 통합', 
    '숙박관광', 
    '(.+)\\s*(호텔|HOTEL|모텔|MOTEL|펜션|리조트|RESORT)', 
    '$1 숙박', 
    126, 
    true, 
    '{"type": "accommodation", "category": "lodging", "service": "hotel"}',
    '[{"input": "롯데호텔", "expected": "롯데 숙박"}]',
    '{"롯데호텔", "신라HOTEL", "제주리조트"}',
    0, 
    null,
    NOW(), 
    NOW()
),

-- 25. 항공/여행 통합
(
    '브랜드_항공_통합', 
    '항공/여행 브랜드 통합', 
    '숙박관광', 
    '(.+)\\s*(항공|AIRLINE|AIR|여행|TRAVEL|투어)', 
    '$1 여행', 
    125, 
    true, 
    '{"type": "travel", "category": "airline", "service": "tourism"}',
    '[{"input": "대한항공", "expected": "대한 여행"}]',
    '{"대한항공", "아시아나AIR", "하나투어"}',
    0, 
    null,
    NOW(), 
    NOW()
);

-- 생성 완료 확인
SELECT 'Phase 2: 핵심 25개 규칙이 성공적으로 생성되었습니다.' as status;