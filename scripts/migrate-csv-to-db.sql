-- Add missing columns to regex_rules table for CSV migration
ALTER TABLE regex_rules 
ADD COLUMN IF NOT EXISTS confidence DECIMAL(3,2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS normalizer_type VARCHAR(100);

-- Create index for normalizer_type
CREATE INDEX IF NOT EXISTS idx_regex_rules_normalizer_type ON regex_rules(normalizer_type);

-- Clear existing sample data (keep only the basic privacy/normalization rules)
DELETE FROM regex_rules WHERE id > 9;

-- Insert CSV-based regex rules for transaction categorization
INSERT INTO regex_rules (pattern, replacement, description, category, enabled, priority, confidence, normalizer_type, created_at, updated_at) VALUES
-- 주유소 패턴들
('(지에스칼텍스|에스케이엔크린|지에스25)\(상\)주', NULL, '한글 표기 상행선 주유소 패턴', '주유소', true, 98, 0.98, 'gas_station', NOW(), NOW()),
('(지에스칼텍스|에스케이엔크린|지에스25)\(하\)주', NULL, '한글 표기 하행선 주유소 패턴', '주유소', true, 98, 0.98, 'gas_station', NOW(), NOW()),
('(.+?)\(상\)주', NULL, '상행선 주유소 패턴 (예: GS칼텍스(상)주)', '주유소', true, 95, 0.95, 'gas_station', NOW(), NOW()),
('(.+?)\(하\)주', NULL, '하행선 주유소 패턴 (예: SK엔크린(하)주)', '주유소', true, 95, 0.95, 'gas_station', NOW(), NOW()),
('(지에스칼텍스|에스케이엔크린|지에스25)', NULL, '한글 표기 브랜드명 패턴', '주유소', true, 90, 0.9, 'gas_station', NOW(), NOW()),
('(GS칼텍스|SK엔크린|에쓰오일|현대오일뱅크|S-?OIL)셀프', NULL, '셀프 주유소 패턴', '주유소', true, 90, 0.9, 'gas_station_self', NOW(), NOW()),
('(GS칼텍스|SK엔크린|에쓰오일|현대오일뱅크|S-?OIL)(?!셀프)', NULL, '주유소 브랜드명 패턴', '주유소', true, 85, 0.85, 'gas_station', NOW(), NOW()),
('(.+?)주유소', NULL, '일반 주유소 키워드 패턴', '주유소', true, 80, 0.8, 'gas_station_generic', NOW(), NOW()),

-- 편의점 패턴들
('GS25', NULL, 'GS25 편의점 패턴', '편의점', true, 95, 0.95, 'convenience_store', NOW(), NOW()),
('\bCU\b', NULL, 'CU 편의점 패턴', '편의점', true, 95, 0.95, 'convenience_store', NOW(), NOW()),
('(세븐일레븐|7-?ELEVEN|7일레븐|세븐이레븐|SEVEN\s*ELEVEN)', NULL, '세븐일레븐 편의점 패턴 (다양한 표기법)', '편의점', true, 95, 0.95, 'convenience_store', NOW(), NOW()),
('(이마트24|EMART24)', NULL, '이마트24 편의점 패턴', '편의점', true, 95, 0.95, 'convenience_store', NOW(), NOW()),
('(미니스톱|MINISTOP)', NULL, '미니스톱 편의점 패턴', '편의점', true, 95, 0.95, 'convenience_store', NOW(), NOW()),

-- 카센터 패턴들
('(.+?)카센터', NULL, '카센터 키워드 패턴', '카센터', true, 90, 0.9, 'car_center', NOW(), NOW()),
('(현대|기아|벤츠|BMW|아우디|볼보)(?:자동차)?(?:서비스센터|서비스|정비)', NULL, '자동차 브랜드 서비스센터 패턴', '카센터', true, 88, 0.88, 'car_center_service', NOW(), NOW()),
('(.+?)정비소', NULL, '정비소 키워드 패턴', '카센터', true, 85, 0.85, 'car_center_garage', NOW(), NOW()),

-- 온라인서비스 패턴들
('(GODADDY|고대디)', NULL, 'GoDaddy 온라인서비스 패턴', '온라인서비스', true, 95, 0.95, 'online_service', NOW(), NOW()),
('(GOOGLE|구글)', NULL, 'Google 온라인서비스 패턴', '온라인서비스', true, 95, 0.95, 'online_service', NOW(), NOW()),
('(AMAZON|아마존|AWS)', NULL, 'Amazon 온라인서비스 패턴', '온라인서비스', true, 95, 0.95, 'online_service', NOW(), NOW()),
('(NETFLIX|넷플릭스)', NULL, 'Netflix 온라인서비스 패턴', '온라인서비스', true, 95, 0.95, 'online_service', NOW(), NOW()),
('(SPOTIFY|스포티파이)', NULL, 'Spotify 온라인서비스 패턴', '온라인서비스', true, 95, 0.95, 'online_service', NOW(), NOW()),
('(YOUTUBE|유튜브)', NULL, 'YouTube 온라인서비스 패턴', '온라인서비스', true, 95, 0.95, 'online_service', NOW(), NOW())
ON CONFLICT DO NOTHING;