-- 정규식 전처리 카테고리 테이블 (먼저 생성)
CREATE TABLE IF NOT EXISTS regex_preprocessing_categories (
    id BIGSERIAL PRIMARY KEY,
    category_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    color_code VARCHAR(7) DEFAULT '#6B7280',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 정규식 전처리 규칙 테이블 (카테고리 참조)
CREATE TABLE IF NOT EXISTS regex_preprocessing_rules (
    id BIGSERIAL PRIMARY KEY,
    rule_name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL REFERENCES regex_preprocessing_categories(category_name),
    input_pattern TEXT NOT NULL,
    output_template TEXT NOT NULL,
    priority INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT true,
    metadata_tags JSONB,
    test_cases JSONB,
    test_examples TEXT[],
    usage_count BIGINT DEFAULT 0,
    success_rate DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_regex_preprocessing_rules_active ON regex_preprocessing_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_regex_preprocessing_rules_category ON regex_preprocessing_rules(category);
CREATE INDEX IF NOT EXISTS idx_regex_preprocessing_rules_priority ON regex_preprocessing_rules(priority);
CREATE INDEX IF NOT EXISTS idx_regex_preprocessing_rules_active_priority ON regex_preprocessing_rules(is_active, priority DESC);

-- 기존 regex_rules 테이블 (호환성 유지)
CREATE TABLE IF NOT EXISTS regex_rules (
    id BIGSERIAL PRIMARY KEY,
    pattern VARCHAR(1000) NOT NULL,
    replacement VARCHAR(1000),
    description TEXT,
    category VARCHAR(100),
    enabled BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 기존 인덱스 유지
CREATE INDEX IF NOT EXISTS idx_regex_rules_enabled ON regex_rules(enabled);
CREATE INDEX IF NOT EXISTS idx_regex_rules_category ON regex_rules(category);
CREATE INDEX IF NOT EXISTS idx_regex_rules_priority ON regex_rules(priority);
CREATE INDEX IF NOT EXISTS idx_regex_rules_enabled_category ON regex_rules(enabled, category);

-- 기본 카테고리 데이터 삽입
INSERT INTO regex_preprocessing_categories (category_name, description, color_code) VALUES
('법인구조', '법인 구조 표시자 정규화 (주식회사, (주), (유) 등)', '#3B82F6'),
('주유소', '주유소 관련 패턴 정규화 (상행선, 하행선, 셀프 등)', '#10B981'),
('대형마트', '대형마트 및 백화점 패턴 정규화', '#F59E0B'),
('해외서비스', '해외 서비스 및 구독 서비스 정규화', '#8B5CF6'),
('정부기관', '정부 및 공공기관 명칭 정규화', '#EF4444'),
('금융기관', '은행 및 금융기관 명칭 정규화', '#06B6D4'),
('편의점', '편의점 브랜드명 정규화', '#84CC16'),
('카페', '카페 및 커피전문점 정규화', '#F97316')
ON CONFLICT (category_name) DO NOTHING;

-- 샘플 정규식 전처리 규칙 삽입  
INSERT INTO regex_preprocessing_rules (rule_name, description, category, input_pattern, output_template, priority, metadata_tags, test_cases, test_examples) VALUES
('법인구조_주식회사', '(주) 표시 제거', '법인구조', '\\(주\\)(.+)', '$1', 200, '{"type":"corporate","structure":"corporation"}', '[{"input":"(주)코드쉬프트","expected":"코드쉬프트"}]', ARRAY['(주)삼성전자', '(주)네이버', '(주)카카오']),
('법인구조_유한회사', '(유) 표시 제거', '법인구조', '\\(유\\)(.+)', '$1', 200, '{"type":"corporate","structure":"limited"}', '[{"input":"(유)부자마트","expected":"부자마트"}]', ARRAY['(유)부자마트', '(유)한국마트']),
('주유소_상행선', '상행선 주유소 정규화', '주유소', '(.+)\\(상\\)주', '$1 상행선 주유소', 180, '{"type":"gas_station","direction":"upward"}', '[{"input":"(주)부자 충주(상)주","expected":"부자 충주 상행선 주유소"}]', ARRAY['SK에너지 서울(상)주', '(주)부자 충주(상)주']),
('주유소_하행선', '하행선 주유소 정규화', '주유소', '(.+)\\(하\\)주', '$1 하행선 주유소', 180, '{"type":"gas_station","direction":"downward"}', '[{"input":"SK에너지 서울(하)주","expected":"SK에너지 서울 하행선 주유소"}]', ARRAY['SK에너지 서울(하)주', '현대오일뱅크 부산(하)주']),
('대형마트_이마트', '이마트 브랜드명 정규화', '대형마트', 'E-?MART|이마트 에브리데이|이마트24', '이마트', 160, '{"type":"mart","brand":"emart"}', '[{"input":"이마트 에브리데이 서","expected":"이마트"}]', ARRAY['이마트 에브리데이 서', 'E-MART 강남점', '이마트24']),
('해외서비스_Claude', 'Claude AI 서비스 정규화', '해외서비스', 'CLAUDE\\.AI.*|ANTHROPIC.*', 'Claude AI', 150, '{"type":"subscription","service":"ai"}', '[{"input":"CLAUDE.AI SUBSCRIPTION SAN FRANCISCO USA","expected":"Claude AI"}]', ARRAY['CLAUDE.AI SUBSCRIPTION SAN FRANCISCO USA', 'ANTHROPIC PAYMENT']),
('정부기관_국민연금', '국민연금 기관명 정규화', '정부기관', '국민연금관리공단|국민연금공단', '국민연금', 140, '{"type":"government","service":"pension"}', '[{"input":"국민연금관리공단","expected":"국민연금"}]', ARRAY['국민연금관리공단', '국민연금공단']),
('편의점_GS25', 'GS25 브랜드명 정규화', '편의점', 'GS25|GS 25|지에스25', 'GS25', 120, '{"type":"convenience","brand":"gs25"}', '[{"input":"GS25 강남점","expected":"GS25"}]', ARRAY['GS25 강남점', 'GS 25', '지에스25'])
ON CONFLICT DO NOTHING;

-- 기존 샘플 규칙
INSERT INTO regex_rules (pattern, replacement, description, category, enabled, priority) VALUES
('(\d{3})-(\d{4})-(\d{4})', '$1-****-$3', 'Phone number masking', 'privacy', true, 10),
('(\d{4})-(\d{4})-(\d{4})-(\d{4})', '$1-****-****-$4', 'Credit card number masking', 'privacy', true, 10),
('\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', '***@***.***', 'Email masking', 'privacy', true, 10),
('\b[가-힣]{2,4}\b', '***', 'Korean name masking', 'privacy', true, 5),
('\b스타벅스\b', '커피전문점', 'Brand name normalization', 'normalization', true, 8),
('\b맥도날드\b', '패스트푸드점', 'Brand name normalization', 'normalization', true, 8),
('\b이마트\b', '대형마트', 'Brand name normalization', 'normalization', true, 8),
('\s+', ' ', 'Multiple spaces to single space', 'cleanup', true, 1),
('^[\s\t\n\r]+|[\s\t\n\r]+$', '', 'Trim whitespace', 'cleanup', true, 1)
ON CONFLICT DO NOTHING;