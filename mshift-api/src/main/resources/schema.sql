-- Create regex_rules table
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_regex_rules_enabled ON regex_rules(enabled);
CREATE INDEX IF NOT EXISTS idx_regex_rules_category ON regex_rules(category);
CREATE INDEX IF NOT EXISTS idx_regex_rules_priority ON regex_rules(priority);
CREATE INDEX IF NOT EXISTS idx_regex_rules_enabled_category ON regex_rules(enabled, category);

-- Insert sample rules
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