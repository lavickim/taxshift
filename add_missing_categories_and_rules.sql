-- 누락된 카테고리 추가 및 JSON 규칙 삽입

-- 1. 필요한 카테고리 추가
INSERT INTO regex_preprocessing_categories (category_name, description, color_code, is_active, created_at) 
VALUES 
('음식점', '일반 음식점 및 레스토랑', '#FF6B6B', true, NOW()),
('피자전문점', '피자 전문 체인점', '#FF8E8E', true, NOW()),
('중식당', '중국 음식 전문점', '#FFB347', true, NOW()),
('일식당', '일본 음식 전문점', '#98FB98', true, NOW()),
('양식당', '서양 음식 전문점', '#87CEEB', true, NOW()),
('한식당', '한국 음식 전문점', '#F0E68C', true, NOW()),
('베이커리', '베이커리 및 제과점', '#DDA0DD', true, NOW()),
('아이스크림', '아이스크림 전문점', '#F5DEB3', true, NOW()),
('주점', '술집 및 바', '#CD853F', true, NOW()),
('패스트푸드', '패스트푸드 체인점', '#FFA500', true, NOW())
ON CONFLICT (category_name) DO NOTHING;

-- 2. 고품질 JSON 패턴을 정규식 규칙으로 변환 (상위 50개)
-- 음식점 관련 핵심 패턴들

INSERT INTO regex_preprocessing_rules (
  rule_name,
  input_pattern, 
  output_template, 
  category, 
  description, 
  priority, 
  is_active, 
  created_at, 
  updated_at,
  metadata_tags,
  test_cases,
  usage_count,
  success_rate
) VALUES 

-- 일식당 패턴 (10개)
('JSON_001', '(스시|초밥|회전초밥|SUSHI|すし|寿司)', '일식당', '일식당', '스시/초밥 일반 패턴', 85, true, NOW(), NOW(), '{"source": "json_conversion"}'::jsonb, '[]'::jsonb, 0, 0.0),
('JSON_002', '(스시로|스시잔마이|스시노미도리|스시효|스시쿠이네)', '일식당', '일식당', '스시 전문 브랜드 패턴', 90, true, NOW(), NOW(), '{"source": "json_conversion"}'::jsonb, '[]'::jsonb, 0, 0.0),
('JSON_003', '(갓덴스시|상무초밥|초밥천국|스시웨이|스시박스)', '일식당', '일식당', '국내 스시 프랜차이즈 패턴', 85, true, NOW(), NOW(), '{"source": "json_conversion"}'::jsonb, '[]'::jsonb, 0, 0.0),
('JSON_004', '(라멘|라면|ラーメン|拉麺|RAMEN)', '일식당', '일식당', '라멘 일반 패턴', 85, true, NOW(), NOW(), '{"source": "json_conversion"}'::jsonb, '[]'::jsonb, 0, 0.0),
('JSON_005', '(이치란|라멘야마다|멘야사나다|라멘료|미소야)', '일식당', '일식당', '라멘 전문 브랜드', 90, true, NOW(), NOW(), '{"source": "json_conversion"}'::jsonb, '[]'::jsonb, 0, 0.0),
('JSON_006', '(우동|うどん|UDON|소바|そば|SOBA)', '일식당', '일식당', '우동/소바 패턴', 80, true, NOW(), NOW(), '{"source": "json_conversion"}'::jsonb, '[]'::jsonb, 0, 0.0),
('JSON_007', '(마루가메제면|우동스시|혼가츠|덴푸라)', '일식당', '일식당', '일식 브랜드 패턴', 85, true, NOW(), NOW(), '{"source": "json_conversion"}'::jsonb, '[]'::jsonb, 0, 0.0),
('JSON_008', '(규카츠|돈카츠|가츠동|가라아게|야키토리)', '일식당', '일식당', '일식 튀김요리 패턴', 80, true, NOW(), NOW(), '{"source": "json_conversion"}'::jsonb, '[]'::jsonb, 0, 0.0),
('JSON_009', '(사시미|さしみ|刺身|생선회|활어회)', '일식당', '일식당', '회/사시미 패턴', 80, true, NOW(), NOW(), '{"source": "json_conversion"}'::jsonb, '[]'::jsonb, 0, 0.0),
('JSON_010', '(야키니쿠|야끼니꾸|불고기|갈비|삼겹살)', '일식당', '일식당', '고기구이 패턴', 75, true, NOW(), NOW(), '{"source": "json_conversion"}'::jsonb, '[]'::jsonb, 0, 0.0),

-- 피자 패턴 (5개)
('JSON_011', '(도미노|피자헛|미스터피자|파파존스|피자스쿨)', '피자전문점', '피자전문점', '피자 대형 브랜드', 95, true, NOW(), NOW(), '{"source": "json_conversion"}'::jsonb, '[]'::jsonb, 0, 0.0),
('JSON_012', '(피자에땅|피자마루|피자나라치킨공주|고르곤졸라|페퍼로니)', '피자전문점', '피자전문점', '국내 피자 브랜드', 85, true, NOW(), NOW(), '{"source": "json_conversion"}'::jsonb, '[]'::jsonb, 0, 0.0),
('JSON_013', '(마르게리타|하와이안|불고기피자|슈프림|치즈피자)', '피자전문점', '피자전문점', '피자 메뉴 패턴', 80, true, NOW(), NOW(), '{"source": "json_conversion"}'::jsonb, '[]'::jsonb, 0, 0.0),
('JSON_014', '(피자|PIZZA|pizza|Pizza)', '피자전문점', '피자전문점', '피자 일반 패턴', 70, true, NOW(), NOW(), '{"source": "json_conversion"}'::jsonb, '[]'::jsonb, 0, 0.0),
('JSON_015', '(피자오븐|피자스쿨|피자가든|피자팩토리)', '피자전문점', '피자전문점', '피자 전문점 패턴', 80, true, NOW(), NOW(), '{"source": "json_conversion"}'::jsonb, '[]'::jsonb, 0, 0.0),

-- 중식당 패턴 (5개)
('JSON_016', '(중국집|중식당|차이니즈|CHINESE|中华)', '중식당', '중식당', '중식당 일반 패턴', 85, true, NOW(), NOW(), '{"source": "json_conversion"}'::jsonb, '[]'::jsonb, 0, 0.0),
('JSON_017', '(짜장면|짬뽕|탕수육|마파두부|동파육)', '중식당', '중식당', '중식 대표 메뉴', 90, true, NOW(), NOW(), '{"source": "json_conversion"}'::jsonb, '[]'::jsonb, 0, 0.0),
('JSON_018', '(홍콩반점|옌안|황룡각|금룡|은룡)', '중식당', '중식당', '중식당 브랜드명', 85, true, NOW(), NOW(), '{"source": "json_conversion"}'::jsonb, '[]'::jsonb, 0, 0.0),
('JSON_019', '(딤섬|완탕|춘권|만두|군만두)', '중식당', '중식당', '중식 간식 메뉴', 80, true, NOW(), NOW(), '{"source": "json_conversion"}'::jsonb, '[]'::jsonb, 0, 0.0),
('JSON_020', '(마라탕|마라샹궈|훠궈|샤브샤브)', '중식당', '중식당', '중식 신메뉴 패턴', 85, true, NOW(), NOW(), '{"source": "json_conversion"}'::jsonb, '[]'::jsonb, 0, 0.0),

-- 양식당 패턴 (5개)
('JSON_021', '(스테이크|파스타|리조또|샐러드|STEAK)', '양식당', '양식당', '양식 대표 메뉴', 85, true, NOW(), NOW(), '{"source": "json_conversion"}'::jsonb, '[]'::jsonb, 0, 0.0),
('JSON_022', '(이탈리안|이태리|ITALIAN|프렌치|FRENCH)', '양식당', '양식당', '양식 국가별 패턴', 80, true, NOW(), NOW(), '{"source": "json_conversion"}'::jsonb, '[]'::jsonb, 0, 0.0),
('JSON_023', '(아웃백|빕스|애슐리|올리브가든)', '양식당', '양식당', '양식 체인 브랜드', 90, true, NOW(), NOW(), '{"source": "json_conversion"}'::jsonb, '[]'::jsonb, 0, 0.0),
('JSON_024', '(카르보나라|알리오올리오|봉골레|아라비아따)', '양식당', '양식당', '파스타 메뉴 패턴', 80, true, NOW(), NOW(), '{"source": "json_conversion"}'::jsonb, '[]'::jsonb, 0, 0.0),
('JSON_025', '(스파게티|SPAGHETTI|라자냐|펜네|뇨끼)', '양식당', '양식당', '파스타 종류 패턴', 75, true, NOW(), NOW(), '{"source": "json_conversion"}'::jsonb, '[]'::jsonb, 0, 0.0),

-- 한식당 패턴 (5개)
('JSON_026', '(한식당|한정식|한식|KOREAN|韓国)', '한식당', '한식당', '한식당 일반 패턴', 85, true, NOW(), NOW(), '{"source": "json_conversion"}'::jsonb, '[]'::jsonb, 0, 0.0),
('JSON_027', '(김치찌개|된장찌개|부대찌개|김치|김밥)', '한식당', '한식당', '한식 대표 메뉴', 90, true, NOW(), NOW(), '{"source": "json_conversion"}'::jsonb, '[]'::jsonb, 0, 0.0),
('JSON_028', '(갈비탕|설렁탕|곰탕|삼계탕|매운탕)', '한식당', '한식당', '한식 탕류 메뉴', 85, true, NOW(), NOW(), '{"source": "json_conversion"}'::jsonb, '[]'::jsonb, 0, 0.0),
('JSON_029', '(한우|갈비|삼겹살|목살|등심)', '한식당', '한식당', '한식 고기 메뉴', 80, true, NOW(), NOW(), '{"source": "json_conversion"}'::jsonb, '[]'::jsonb, 0, 0.0),
('JSON_030', '(비빔밥|불고기|잡채|전|파전)', '한식당', '한식당', '한식 일반 메뉴', 75, true, NOW(), NOW(), '{"source": "json_conversion"}'::jsonb, '[]'::jsonb, 0, 0.0),

-- 카페 패턴 (10개)
('JSON_031', '(스타벅스|이디야|카페베네|할리스|탐앤탐스)', '카페', '카페', '대형 카페 브랜드', 95, true, NOW(), NOW(), '{"source": "json_conversion"}'::jsonb, '[]'::jsonb, 0, 0.0),
('JSON_032', '(커피빈|폴바셋|엔젤리너스|커피베이|드롭탑)', '카페', '카페', '프리미엄 카페 브랜드', 90, true, NOW(), NOW(), '{"source": "json_conversion"}'::jsonb, '[]'::jsonb, 0, 0.0),
('JSON_033', '(아메리카노|라떼|카푸치노|마키아또|에스프레소)', '카페', '카페', '커피 메뉴 패턴', 85, true, NOW(), NOW(), '{"source": "json_conversion"}'::jsonb, '[]'::jsonb, 0, 0.0),
('JSON_034', '(프라푸치노|스무디|쉐이크|아포가토|콜드브루)', '카페', '카페', '차가운 음료 패턴', 80, true, NOW(), NOW(), '{"source": "json_conversion"}'::jsonb, '[]'::jsonb, 0, 0.0),
('JSON_035', '(베이글|크루아상|마카롱|케이크|쿠키)', '카페', '카페', '카페 디저트 패턴', 75, true, NOW(), NOW(), '{"source": "json_conversion"}'::jsonb, '[]'::jsonb, 0, 0.0),
('JSON_036', '(카페|CAFE|coffee|COFFEE|Coffee)', '카페', '카페', '카페 일반 패턴', 70, true, NOW(), NOW(), '{"source": "json_conversion"}'::jsonb, '[]'::jsonb, 0, 0.0),
('JSON_037', '(티|TEA|차|밀크티|버블티)', '카페', '카페', '차 종류 패턴', 75, true, NOW(), NOW(), '{"source": "json_conversion"}'::jsonb, '[]'::jsonb, 0, 0.0),
('JSON_038', '(베이커리|빵집|브레드|BREAD|도넛)', '베이커리', '베이커리', '베이커리 패턴', 80, true, NOW(), NOW(), '{"source": "json_conversion"}'::jsonb, '[]'::jsonb, 0, 0.0),
('JSON_039', '(파리바게뜨|뚜레쥬르|크라운|코코볼)', '베이커리', '베이커리', '베이커리 브랜드', 85, true, NOW(), NOW(), '{"source": "json_conversion"}'::jsonb, '[]'::jsonb, 0, 0.0),
('JSON_040', '(아이스크림|ICE|젤라또|소프트콘|선데)', '아이스크림', '아이스크림', '아이스크림 패턴', 80, true, NOW(), NOW(), '{"source": "json_conversion"}'::jsonb, '[]'::jsonb, 0, 0.0),

-- 패스트푸드 패턴 (10개)
('JSON_041', '(맥도날드|버거킹|롯데리아|KFC|맘스터치)', '패스트푸드', '패스트푸드', '패스트푸드 대형 브랜드', 95, true, NOW(), NOW(), '{"source": "json_conversion"}'::jsonb, '[]'::jsonb, 0, 0.0),
('JSON_042', '(빅맥|와퍼|치킨버거|새우버거|불고기버거)', '패스트푸드', '패스트푸드', '햄버거 메뉴 패턴', 85, true, NOW(), NOW(), '{"source": "json_conversion"}'::jsonb, '[]'::jsonb, 0, 0.0),
('JSON_043', '(후라이드|양념치킨|간장치킨|핫윙|너겟)', '치킨', '치킨', '치킨 메뉴 패턴', 90, true, NOW(), NOW(), '{"source": "json_conversion"}'::jsonb, '[]'::jsonb, 0, 0.0),
('JSON_044', '(BBQ|교촌|네네|굽네|처갓집)', '치킨', '치킨', '치킨 브랜드 패턴', 95, true, NOW(), NOW(), '{"source": "json_conversion"}'::jsonb, '[]'::jsonb, 0, 0.0),
('JSON_045', '(서브웨이|퀴즈노스|미스터브룩스)', '패스트푸드', '패스트푸드', '샌드위치 브랜드', 85, true, NOW(), NOW(), '{"source": "json_conversion"}'::jsonb, '[]'::jsonb, 0, 0.0),
('JSON_046', '(샌드위치|SANDWICH|토스트|핫도그)', '패스트푸드', '패스트푸드', '샌드위치 메뉴', 75, true, NOW(), NOW(), '{"source": "json_conversion"}'::jsonb, '[]'::jsonb, 0, 0.0),
('JSON_047', '(감자튀김|프렌치프라이|FRIES|콜라|사이다)', '패스트푸드', '패스트푸드', '패스트푸드 사이드', 70, true, NOW(), NOW(), '{"source": "json_conversion"}'::jsonb, '[]'::jsonb, 0, 0.0),
('JSON_048', '(햄버거|BURGER|burger|Burger)', '패스트푸드', '패스트푸드', '햄버거 일반 패턴', 75, true, NOW(), NOW(), '{"source": "json_conversion"}'::jsonb, '[]'::jsonb, 0, 0.0),
('JSON_049', '(치킨|CHICKEN|chicken|Chicken)', '치킨', '치킨', '치킨 일반 패턴', 80, true, NOW(), NOW(), '{"source": "json_conversion"}'::jsonb, '[]'::jsonb, 0, 0.0),
('JSON_050', '(바리스타|매니저|점장|직원|카운터)', '음식점', '음식점', '음식점 직원 관련', 60, true, NOW(), NOW(), '{"source": "json_conversion"}'::jsonb, '[]'::jsonb, 0, 0.0)

ON CONFLICT (rule_name) DO NOTHING;

-- 통계 출력
SELECT 
  'JSON 패턴 변환 완료' as status,
  COUNT(*) as total_rules
FROM regex_preprocessing_rules;

SELECT 
  category,
  COUNT(*) as rule_count
FROM regex_preprocessing_rules 
WHERE metadata_tags->>'source' = 'json_conversion'
GROUP BY category
ORDER BY rule_count DESC;