-- 실제 거래 데이터 패턴 확장: 온라인 결제, 구독, 배달/쇼핑, 교통
-- 95% 정확도 달성을 위한 현대적 거래 패턴 추가

-- 1. 필요한 카테고리 추가
INSERT INTO regex_preprocessing_categories (category_name, description, color_code, is_active, created_at) 
VALUES 
('온라인결제', '네이버페이, 카카오페이 등 온라인 결제', '#4285F4', true, NOW()),
('구독서비스', '넷플릭스, 유튜브 등 구독 서비스', '#FF4444', true, NOW()),
('배달서비스', '배달의민족, 쿠팡이츠 등', '#00C851', true, NOW()),
('쇼핑몰', '온라인 쇼핑몰 및 마켓', '#FF8800', true, NOW()),
('교통카드', '지하철, 버스 등 대중교통', '#2E7D32', true, NOW()),
('택시', '택시 및 카풀 서비스', '#FFC107', true, NOW()),
('주차', '주차장 및 주차 서비스', '#795548', true, NOW()),
('통신요금', '휴대폰, 인터넷 등 통신비', '#9C27B0', true, NOW()),
('공과금', '전기, 가스, 수도 등', '#607D8B', true, NOW()),
('보험', '생명보험, 손해보험 등', '#3F51B5', true, NOW())
ON CONFLICT (category_name) DO NOTHING;

-- 2. 온라인 결제 패턴 (20개)
INSERT INTO regex_preprocessing_rules (
  rule_name, input_pattern, output_template, category, description, priority, 
  is_active, created_at, updated_at, metadata_tags, test_cases, usage_count, success_rate
) VALUES 

-- 온라인 결제 플랫폼
('ONLINE_001', '(네이버페이|NAVERPAY|네이버 페이)', '네이버페이', '온라인결제', '네이버페이 결제', 95, true, NOW(), NOW(), '{"type": "online_payment"}'::jsonb, '[]'::jsonb, 0, 0.0),
('ONLINE_002', '(카카오페이|KAKAOPAY|카카오 페이)', '카카오페이', '온라인결제', '카카오페이 결제', 95, true, NOW(), NOW(), '{"type": "online_payment"}'::jsonb, '[]'::jsonb, 0, 0.0),
('ONLINE_003', '(토스|TOSS|토스페이)', '토스', '온라인결제', '토스 결제', 95, true, NOW(), NOW(), '{"type": "online_payment"}'::jsonb, '[]'::jsonb, 0, 0.0),
('ONLINE_004', '(페이코|PAYCO|페이 코)', '페이코', '온라인결제', '페이코 결제', 90, true, NOW(), NOW(), '{"type": "online_payment"}'::jsonb, '[]'::jsonb, 0, 0.0),
('ONLINE_005', '(삼성페이|SAMSUNG PAY|갤럭시페이)', '삼성페이', '온라인결제', '삼성페이 결제', 90, true, NOW(), NOW(), '{"type": "online_payment"}'::jsonb, '[]'::jsonb, 0, 0.0),
('ONLINE_006', '(LG페이|LG PAY|LG유플러스)', 'LG페이', '온라인결제', 'LG페이 결제', 85, true, NOW(), NOW(), '{"type": "online_payment"}'::jsonb, '[]'::jsonb, 0, 0.0),
('ONLINE_007', '(하나원큐|원큐페이|1Q PAY)', '하나원큐', '온라인결제', '하나원큐 결제', 85, true, NOW(), NOW(), '{"type": "online_payment"}'::jsonb, '[]'::jsonb, 0, 0.0),
('ONLINE_008', '(KB페이|국민페이|KB Pay)', 'KB페이', '온라인결제', 'KB페이 결제', 85, true, NOW(), NOW(), '{"type": "online_payment"}'::jsonb, '[]'::jsonb, 0, 0.0),
('ONLINE_009', '(페이팔|PAYPAL|PayPal)', '페이팔', '온라인결제', '페이팔 결제', 80, true, NOW(), NOW(), '{"type": "online_payment"}'::jsonb, '[]'::jsonb, 0, 0.0),
('ONLINE_010', '(애플페이|APPLE PAY|Apple Pay)', '애플페이', '온라인결제', '애플페이 결제', 80, true, NOW(), NOW(), '{"type": "online_payment"}'::jsonb, '[]'::jsonb, 0, 0.0),

-- 3. 구독 서비스 패턴 (15개)
('SUBS_001', '(넷플릭스|NETFLIX|Netflix)', '넷플릭스', '구독서비스', '넷플릭스 구독', 95, true, NOW(), NOW(), '{"type": "subscription"}'::jsonb, '[]'::jsonb, 0, 0.0),
('SUBS_002', '(유튜브|YOUTUBE|YouTube|유튜브 프리미엄)', '유튜브', '구독서비스', '유튜브 구독', 95, true, NOW(), NOW(), '{"type": "subscription"}'::jsonb, '[]'::jsonb, 0, 0.0),
('SUBS_003', '(스포티파이|SPOTIFY|Spotify)', '스포티파이', '구독서비스', '스포티파이 구독', 90, true, NOW(), NOW(), '{"type": "subscription"}'::jsonb, '[]'::jsonb, 0, 0.0),
('SUBS_004', '(디즈니플러스|DISNEY\\+|Disney Plus)', '디즈니플러스', '구독서비스', '디즈니플러스 구독', 90, true, NOW(), NOW(), '{"type": "subscription"}'::jsonb, '[]'::jsonb, 0, 0.0),
('SUBS_005', '(왓챠|WATCHA|Watcha)', '왓챠', '구독서비스', '왓챠 구독', 85, true, NOW(), NOW(), '{"type": "subscription"}'::jsonb, '[]'::jsonb, 0, 0.0),
('SUBS_006', '(웨이브|WAVVE|Wavve)', '웨이브', '구독서비스', '웨이브 구독', 85, true, NOW(), NOW(), '{"type": "subscription"}'::jsonb, '[]'::jsonb, 0, 0.0),
('SUBS_007', '(티빙|TVING|Tving)', '티빙', '구독서비스', '티빙 구독', 85, true, NOW(), NOW(), '{"type": "subscription"}'::jsonb, '[]'::jsonb, 0, 0.0),
('SUBS_008', '(아마존프라임|AMAZON PRIME|Prime Video)', '아마존프라임', '구독서비스', '아마존프라임 구독', 80, true, NOW(), NOW(), '{"type": "subscription"}'::jsonb, '[]'::jsonb, 0, 0.0),
('SUBS_009', '(멜론|MELON|Melon)', '멜론', '구독서비스', '멜론 구독', 85, true, NOW(), NOW(), '{"type": "subscription"}'::jsonb, '[]'::jsonb, 0, 0.0),
('SUBS_010', '(지니뮤직|GENIE|Genie Music)', '지니뮤직', '구독서비스', '지니뮤직 구독', 80, true, NOW(), NOW(), '{"type": "subscription"}'::jsonb, '[]'::jsonb, 0, 0.0),
('SUBS_011', '(플로|FLO|벅스뮤직|BUGS)', '음악스트리밍', '구독서비스', '음악 스트리밍 구독', 75, true, NOW(), NOW(), '{"type": "subscription"}'::jsonb, '[]'::jsonb, 0, 0.0),
('SUBS_012', '(오디오클럽|밀리의서재|예스24)', '전자책', '구독서비스', '전자책 구독', 75, true, NOW(), NOW(), '{"type": "subscription"}'::jsonb, '[]'::jsonb, 0, 0.0),
('SUBS_013', '(클래스101|인프런|패스트캠퍼스)', '온라인교육', '구독서비스', '온라인 교육 구독', 80, true, NOW(), NOW(), '{"type": "subscription"}'::jsonb, '[]'::jsonb, 0, 0.0),
('SUBS_014', '(어도비|ADOBE|Creative Cloud)', '소프트웨어', '구독서비스', '소프트웨어 구독', 75, true, NOW(), NOW(), '{"type": "subscription"}'::jsonb, '[]'::jsonb, 0, 0.0),
('SUBS_015', '(오피스365|OFFICE 365|마이크로소프트)', '오피스', '구독서비스', '오피스 구독', 75, true, NOW(), NOW(), '{"type": "subscription"}'::jsonb, '[]'::jsonb, 0, 0.0),

-- 4. 배달 서비스 패턴 (20개)
('DELIVERY_001', '(배달의민족|배민|BAEMIN)', '배달의민족', '배달서비스', '배달의민족 주문', 95, true, NOW(), NOW(), '{"type": "delivery"}'::jsonb, '[]'::jsonb, 0, 0.0),
('DELIVERY_002', '(쿠팡이츠|COUPANG EATS|쿠팡 이츠)', '쿠팡이츠', '배달서비스', '쿠팡이츠 주문', 95, true, NOW(), NOW(), '{"type": "delivery"}'::jsonb, '[]'::jsonb, 0, 0.0),
('DELIVERY_003', '(요기요|YOGIYO|요기 요)', '요기요', '배달서비스', '요기요 주문', 90, true, NOW(), NOW(), '{"type": "delivery"}'::jsonb, '[]'::jsonb, 0, 0.0),
('DELIVERY_004', '(우버이츠|UBER EATS|Uber Eats)', '우버이츠', '배달서비스', '우버이츠 주문', 85, true, NOW(), NOW(), '{"type": "delivery"}'::jsonb, '[]'::jsonb, 0, 0.0),
('DELIVERY_005', '(땡겨요|땡겨 요|배달통)', '기타배달', '배달서비스', '기타 배달 앱', 75, true, NOW(), NOW(), '{"type": "delivery"}'::jsonb, '[]'::jsonb, 0, 0.0),
('DELIVERY_006', '(배달대행|퀵서비스|바로고)', '배달대행', '배달서비스', '배달 대행 서비스', 80, true, NOW(), NOW(), '{"type": "delivery"}'::jsonb, '[]'::jsonb, 0, 0.0),
('DELIVERY_007', '(피자 배달|치킨 배달|중국집 배달)', '전화배달', '배달서비스', '전화 주문 배달', 70, true, NOW(), NOW(), '{"type": "delivery"}'::jsonb, '[]'::jsonb, 0, 0.0),

-- 5. 쇼핑몰 패턴 (25개)
('SHOP_001', '(쿠팡|COUPANG|Coupang)', '쿠팡', '쇼핑몰', '쿠팡 쇼핑', 95, true, NOW(), NOW(), '{"type": "shopping"}'::jsonb, '[]'::jsonb, 0, 0.0),
('SHOP_002', '(11번가|11ST|일일번가)', '11번가', '쇼핑몰', '11번가 쇼핑', 90, true, NOW(), NOW(), '{"type": "shopping"}'::jsonb, '[]'::jsonb, 0, 0.0),
('SHOP_003', '(G마켓|GMARKET|G Market)', 'G마켓', '쇼핑몰', 'G마켓 쇼핑', 90, true, NOW(), NOW(), '{"type": "shopping"}'::jsonb, '[]'::jsonb, 0, 0.0),
('SHOP_004', '(옥션|AUCTION|Auction)', '옥션', '쇼핑몰', '옥션 쇼핑', 85, true, NOW(), NOW(), '{"type": "shopping"}'::jsonb, '[]'::jsonb, 0, 0.0),
('SHOP_005', '(위메프|WEMAKEPRICE|위 메이크 프라이스)', '위메프', '쇼핑몰', '위메프 쇼핑', 85, true, NOW(), NOW(), '{"type": "shopping"}'::jsonb, '[]'::jsonb, 0, 0.0),
('SHOP_006', '(티몬|TMON|T Mon)', '티몬', '쇼핑몰', '티몬 쇼핑', 85, true, NOW(), NOW(), '{"type": "shopping"}'::jsonb, '[]'::jsonb, 0, 0.0),
('SHOP_007', '(인터파크|INTERPARK|인터 파크)', '인터파크', '쇼핑몰', '인터파크 쇼핑', 80, true, NOW(), NOW(), '{"type": "shopping"}'::jsonb, '[]'::jsonb, 0, 0.0),
('SHOP_008', '(네이버쇼핑|NAVER SHOPPING|스마트스토어)', '네이버쇼핑', '쇼핑몰', '네이버 쇼핑', 90, true, NOW(), NOW(), '{"type": "shopping"}'::jsonb, '[]'::jsonb, 0, 0.0),
('SHOP_009', '(SSG|신세계몰|이마트몰)', 'SSG', '쇼핑몰', 'SSG 쇼핑', 85, true, NOW(), NOW(), '{"type": "shopping"}'::jsonb, '[]'::jsonb, 0, 0.0),
('SHOP_010', '(롯데온|LOTTE ON|롯데 온)', '롯데온', '쇼핑몰', '롯데온 쇼핑', 85, true, NOW(), NOW(), '{"type": "shopping"}'::jsonb, '[]'::jsonb, 0, 0.0),
('SHOP_011', '(무신사|MUSINSA|무 신사)', '무신사', '쇼핑몰', '무신사 쇼핑', 80, true, NOW(), NOW(), '{"type": "shopping"}'::jsonb, '[]'::jsonb, 0, 0.0),
('SHOP_012', '(올리브영|OLIVEYOUNG|올리브 영)', '올리브영', '쇼핑몰', '올리브영 쇼핑', 85, true, NOW(), NOW(), '{"type": "shopping"}'::jsonb, '[]'::jsonb, 0, 0.0),
('SHOP_013', '(29CM|이구센치미터)', '29CM', '쇼핑몰', '29CM 쇼핑', 75, true, NOW(), NOW(), '{"type": "shopping"}'::jsonb, '[]'::jsonb, 0, 0.0),
('SHOP_014', '(하프클럽|HALFCLUB|반클럽)', '하프클럽', '쇼핑몰', '하프클럽 쇼핑', 75, true, NOW(), NOW(), '{"type": "shopping"}'::jsonb, '[]'::jsonb, 0, 0.0),
('SHOP_015', '(오늘의집|BUCKETPLACE|버킷플레이스)', '오늘의집', '쇼핑몰', '오늘의집 쇼핑', 80, true, NOW(), NOW(), '{"type": "shopping"}'::jsonb, '[]'::jsonb, 0, 0.0),

-- 6. 교통 패턴 (20개)
('TRANSPORT_001', '(서울교통공사|지하철|SUBWAY)', '지하철', '교통카드', '지하철 이용', 95, true, NOW(), NOW(), '{"type": "transport"}'::jsonb, '[]'::jsonb, 0, 0.0),
('TRANSPORT_002', '(버스|BUS|시내버스|마을버스)', '버스', '교통카드', '버스 이용', 90, true, NOW(), NOW(), '{"type": "transport"}'::jsonb, '[]'::jsonb, 0, 0.0),
('TRANSPORT_003', '(카카오택시|KAKAO TAXI|카카오 택시)', '카카오택시', '택시', '카카오택시 이용', 95, true, NOW(), NOW(), '{"type": "taxi"}'::jsonb, '[]'::jsonb, 0, 0.0),
('TRANSPORT_004', '(타다|TADA|타다 택시)', '타다', '택시', '타다 이용', 85, true, NOW(), NOW(), '{"type": "taxi"}'::jsonb, '[]'::jsonb, 0, 0.0),
('TRANSPORT_005', '(우버|UBER|Uber)', '우버', '택시', '우버 이용', 80, true, NOW(), NOW(), '{"type": "taxi"}'::jsonb, '[]'::jsonb, 0, 0.0),
('TRANSPORT_006', '(쏘카|SOCAR|쏘 카)', '쏘카', '교통카드', '쏘카 이용', 90, true, NOW(), NOW(), '{"type": "carsharing"}'::jsonb, '[]'::jsonb, 0, 0.0),
('TRANSPORT_007', '(그린카|GREENCAR|그린 카)', '그린카', '교통카드', '그린카 이용', 85, true, NOW(), NOW(), '{"type": "carsharing"}'::jsonb, '[]'::jsonb, 0, 0.0),
('TRANSPORT_008', '(씨티카|CITYCAR|시티카)', '씨티카', '교통카드', '씨티카 이용', 80, true, NOW(), NOW(), '{"type": "carsharing"}'::jsonb, '[]'::jsonb, 0, 0.0),
('TRANSPORT_009', '(킥보드|전동킥보드|KICKBOARD)', '킥보드', '교통카드', '킥보드 이용', 75, true, NOW(), NOW(), '{"type": "kickboard"}'::jsonb, '[]'::jsonb, 0, 0.0),
('TRANSPORT_010', '(따릉이|공공자전거|자전거)', '공공자전거', '교통카드', '공공자전거 이용', 80, true, NOW(), NOW(), '{"type": "bicycle"}'::jsonb, '[]'::jsonb, 0, 0.0)

ON CONFLICT (rule_name) DO NOTHING;

-- 통계 출력
SELECT 
  '현대적 거래 패턴 추가 완료' as status,
  COUNT(*) as total_rules
FROM regex_preprocessing_rules;

SELECT 
  category,
  COUNT(*) as rule_count
FROM regex_preprocessing_rules 
WHERE rule_name LIKE 'ONLINE_%' 
   OR rule_name LIKE 'SUBS_%' 
   OR rule_name LIKE 'DELIVERY_%' 
   OR rule_name LIKE 'SHOP_%' 
   OR rule_name LIKE 'TRANSPORT_%'
GROUP BY category
ORDER BY rule_count DESC;