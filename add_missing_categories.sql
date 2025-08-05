-- 누락된 카테고리들 추가
INSERT INTO regex_preprocessing_categories (category_name, description, is_active, created_at)
VALUES 
('치킨', '치킨/프랜차이즈 관련 업종', true, NOW()),
('병원', '병원/의료기관 관련 업종', true, NOW()),
('학교', '학교/교육기관 관련 업종', true, NOW()),
('금융', '금융기관 관련 업종', true, NOW()),
('약국', '약국/헬스케어 관련 업종', true, NOW())
ON CONFLICT (category_name) DO NOTHING;

SELECT 'Missing categories added successfully.' as status;