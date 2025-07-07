-- PostgreSQL 로컬 데이터베이스 테이블 생성 스크립트
-- 2025-12-09 생성

-- UUID 확장 설치
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUM 타입 정의
CREATE TYPE taxpayer_type_enum AS ENUM ('CORPORATION', 'SOLE_PROPRIETORSHIP');
CREATE TYPE rule_creator_enum AS ENUM ('ADMIN', 'AUTO_GENERATED');
CREATE TYPE transaction_status_enum AS ENUM ('NORMALIZED', 'RULE_PROCESSED', 'NEEDS_CLARIFICATION', 'LLM_PROCESSED', 'CLARIFIED', 'NEEDS_REVIEW');
CREATE TYPE processor_type_enum AS ENUM ('CACHE', 'REGEX_FILTER', 'INFERENCE_ML', 'NORMALIZER_LLM', 'RULE_ENGINE', 'ANALYZER_LLM');
CREATE TYPE transaction_io_type AS ENUM ('EXPENSE', 'INCOME');

-- 고객사 정보 테이블
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name TEXT NOT NULL,
    business_registration_number VARCHAR(20) UNIQUE,
    taxpayer_type taxpayer_type_enum DEFAULT 'CORPORATION'::taxpayer_type_enum NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 거래 캐시 테이블 (0단계: 초고속 조회)
CREATE TABLE transaction_cache (
    raw_text_hash CHAR(64) PRIMARY KEY,
    raw_text TEXT NOT NULL,
    unique_key TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 규칙 테이블
CREATE TABLE rules (
    id SERIAL PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    unique_key TEXT NOT NULL,
    target_debit_account VARCHAR(100) NOT NULL,
    target_credit_account VARCHAR(100) DEFAULT '보통예금' NOT NULL,
    target_suggested_tag VARCHAR(100),
    vat_applicable BOOLEAN DEFAULT FALSE,
    priority INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_by rule_creator_enum DEFAULT 'AUTO_GENERATED'::rule_creator_enum NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    CONSTRAINT rules_company_id_unique_key_key UNIQUE (company_id, unique_key)
);

-- 규칙 후보 테이블
CREATE TABLE rule_candidates (
    id SERIAL PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    unique_key TEXT NOT NULL,
    target_debit_account VARCHAR(100) NOT NULL,
    target_suggested_tag VARCHAR(100),
    vat_applicable BOOLEAN,
    suggestion_count INTEGER DEFAULT 1,
    last_suggested_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    CONSTRAINT uq_company_key_account UNIQUE (company_id, unique_key, target_debit_account)
);

-- 거래 내역 테이블
CREATE TABLE transactions (
    id BIGSERIAL PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    raw_text TEXT NOT NULL,
    transaction_date DATE NOT NULL,
    amount BIGINT NOT NULL,
    transaction_type transaction_io_type NOT NULL,
    normalized_unique_key TEXT,
    status transaction_status_enum DEFAULT 'NORMALIZED'::transaction_status_enum NOT NULL,
    processed_by processor_type_enum,
    is_anomaly BOOLEAN DEFAULT FALSE,
    anomaly_score DECIMAL(5, 4),
    llm_response JSONB,
    user_clarification JSONB,
    final_debit_account VARCHAR(100),
    final_credit_account VARCHAR(100),
    final_suggested_tag VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 인덱스 생성
CREATE INDEX idx_rules_company_id_unique_key ON rules(company_id, unique_key);
CREATE INDEX idx_transactions_company_id_status ON transactions(company_id, status);
CREATE INDEX idx_transactions_transaction_date ON transactions(transaction_date);

-- 경기도 배달특급 데이터 테이블 추가
CREATE TABLE gyeonggi_delivery_stores (
    id BIGSERIAL PRIMARY KEY,
    list_total_count INTEGER,
    response_code VARCHAR(10),
    response_message TEXT,
    api_version VARCHAR(10),
    business_reg_no VARCHAR(20),
    sigun_name VARCHAR(100),
    store_name VARCHAR(200),
    industry_type VARCHAR(100),
    refined_road_address TEXT,
    refined_lot_address TEXT,
    refined_zipcode VARCHAR(10),
    refined_latitude DECIMAL(10, 8),
    refined_longitude DECIMAL(11, 8),
    batch_id VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    CONSTRAINT unique_business_reg_no UNIQUE (business_reg_no)
);

-- 서울시 일반음식점 데이터 테이블 추가
CREATE TABLE seoul_restaurants (
    id BIGSERIAL PRIMARY KEY,
    sigungu_code VARCHAR(10),
    license_number VARCHAR(50),
    license_date VARCHAR(10),
    cancel_date VARCHAR(10),
    business_status_code VARCHAR(10),
    business_status_name VARCHAR(50),
    detailed_status_code VARCHAR(10),
    detailed_status_name VARCHAR(50),
    closure_date VARCHAR(10),
    suspension_start_date VARCHAR(10),
    suspension_end_date VARCHAR(10),
    reopening_date VARCHAR(10),
    phone_number VARCHAR(20),
    location_area VARCHAR(20),
    location_zipcode VARCHAR(10),
    road_address TEXT,
    lot_address TEXT,
    road_zipcode VARCHAR(10),
    business_name VARCHAR(200),
    last_modified_date VARCHAR(10),
    data_update_type VARCHAR(10),
    data_update_date VARCHAR(10),
    business_type VARCHAR(100),
    x_coordinate VARCHAR(20),
    y_coordinate VARCHAR(20),
    food_category VARCHAR(100),
    male_employees VARCHAR(10),
    female_employees VARCHAR(10),
    business_area_type VARCHAR(50),
    grade_type VARCHAR(20),
    water_supply_type VARCHAR(50),
    total_employees VARCHAR(10),
    headquarters_employees VARCHAR(10),
    office_employees VARCHAR(10),
    sales_employees VARCHAR(10),
    production_employees VARCHAR(10),
    building_ownership VARCHAR(50),
    guarantee_amount VARCHAR(20),
    monthly_rent VARCHAR(20),
    multi_use_facility VARCHAR(10),
    total_facility_scale VARCHAR(50),
    traditional_business_number VARCHAR(50),
    traditional_business_food VARCHAR(100),
    homepage TEXT,
    batch_id VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    CONSTRAINT unique_license_number UNIQUE (license_number)
);

-- 통합 룰 관리 테이블 (사용자가 요청한 기능)
CREATE TABLE combined_rules (
    id BIGSERIAL PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    rule_name VARCHAR(200) NOT NULL,
    rule_description TEXT,
    rule_pattern TEXT NOT NULL,
    target_debit_account VARCHAR(100) NOT NULL,
    target_credit_account VARCHAR(100) DEFAULT '보통예금' NOT NULL,
    target_suggested_tag VARCHAR(100),
    vat_applicable BOOLEAN DEFAULT FALSE,
    confidence_score DECIMAL(5, 4) DEFAULT 1.0000,
    priority INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_by rule_creator_enum DEFAULT 'ADMIN'::rule_creator_enum NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    CONSTRAINT unique_company_rule_name UNIQUE (company_id, rule_name)
);

-- 룰 실행 로그 테이블
CREATE TABLE rule_execution_logs (
    id BIGSERIAL PRIMARY KEY,
    rule_id BIGINT REFERENCES combined_rules(id) ON DELETE CASCADE,
    input_text TEXT NOT NULL,
    match_result BOOLEAN NOT NULL,
    confidence_score DECIMAL(5, 4),
    processing_time_ms INTEGER,
    executed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 추가 인덱스
CREATE INDEX idx_gyeonggi_delivery_business_reg_no ON gyeonggi_delivery_stores(business_reg_no);
CREATE INDEX idx_gyeonggi_delivery_batch_id ON gyeonggi_delivery_stores(batch_id);
CREATE INDEX idx_seoul_restaurants_license_number ON seoul_restaurants(license_number);
CREATE INDEX idx_seoul_restaurants_batch_id ON seoul_restaurants(batch_id);
CREATE INDEX idx_combined_rules_company_id ON combined_rules(company_id);
CREATE INDEX idx_combined_rules_is_active ON combined_rules(is_active);
CREATE INDEX idx_rule_execution_logs_rule_id ON rule_execution_logs(rule_id);

-- 업데이트 시간 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 업데이트 트리거 생성
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_combined_rules_updated_at BEFORE UPDATE ON combined_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 초기 데이터 삽입 (테스트용 회사)
INSERT INTO companies (id, company_name, business_registration_number, taxpayer_type) 
VALUES (uuid_generate_v4(), '테스트 회사', '123-45-67890', 'CORPORATION');

COMMIT; 