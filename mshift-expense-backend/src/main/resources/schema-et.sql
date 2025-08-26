-- 편한가계부 클론 앱 데이터베이스 스키마 V0.6
-- PostgreSQL Database Schema
-- et_ (Expense Tracker) 프리픽스 사용

-- 1. 사용자 테이블
CREATE TABLE IF NOT EXISTS et_users (
    user_id BIGSERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nickname VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    is_premium BOOLEAN DEFAULT FALSE
);

-- 2. 자산(계좌) 테이블
CREATE TABLE IF NOT EXISTS et_assets (
    asset_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES et_users(user_id) ON DELETE CASCADE,
    asset_name VARCHAR(100) NOT NULL,
    asset_type VARCHAR(20) NOT NULL CHECK (asset_type IN ('CASH', 'BANK', 'CARD', 'INVESTMENT')),
    bank_name VARCHAR(50),
    account_number VARCHAR(50),
    initial_balance DECIMAL(15,2) DEFAULT 0,
    current_balance DECIMAL(15,2) DEFAULT 0,
    color_code VARCHAR(7) DEFAULT '#FF5757',
    icon_name VARCHAR(50),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. 카테고리 테이블
CREATE TABLE IF NOT EXISTS et_categories (
    category_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES et_users(user_id) ON DELETE CASCADE,
    category_name VARCHAR(50) NOT NULL,
    category_type VARCHAR(10) NOT NULL CHECK (category_type IN ('INCOME', 'EXPENSE', 'TRANSFER')),
    icon_name VARCHAR(50) DEFAULT 'default',
    color_code VARCHAR(7) DEFAULT '#FF5757',
    parent_category_id BIGINT REFERENCES et_categories(category_id),
    display_order INTEGER DEFAULT 0,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. 거래 테이블
CREATE TABLE IF NOT EXISTS et_transactions (
    transaction_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES et_users(user_id) ON DELETE CASCADE,
    transaction_type VARCHAR(10) NOT NULL CHECK (transaction_type IN ('INCOME', 'EXPENSE', 'TRANSFER')),
    amount DECIMAL(15,2) NOT NULL,
    
    -- 기본 정보
    asset_id BIGINT REFERENCES et_assets(asset_id),
    category_id BIGINT REFERENCES et_categories(category_id),
    description VARCHAR(200),
    memo TEXT,
    
    -- 날짜/시간
    transaction_date DATE NOT NULL,
    transaction_time TIME DEFAULT CURRENT_TIME,
    
    -- 이체 관련 (TRANSFER일 때만 사용)
    target_asset_id BIGINT REFERENCES et_assets(asset_id),
    
    -- 첨부파일
    receipt_photo_url VARCHAR(500),
    
    -- 반복 거래
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_type VARCHAR(20) CHECK (recurring_type IN ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', NULL)),
    recurring_end_date DATE,
    parent_transaction_id BIGINT REFERENCES et_transactions(transaction_id),
    
    -- 메타데이터
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. 예산 테이블
CREATE TABLE IF NOT EXISTS et_budgets (
    budget_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES et_users(user_id) ON DELETE CASCADE,
    category_id BIGINT REFERENCES et_categories(category_id),
    budget_amount DECIMAL(15,2) NOT NULL,
    budget_year INTEGER NOT NULL,
    budget_month INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_et_user_category_period UNIQUE (user_id, category_id, budget_year, budget_month)
);

-- 6. 반복 거래 템플릿
CREATE TABLE IF NOT EXISTS et_recurring_templates (
    template_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES et_users(user_id) ON DELETE CASCADE,
    template_name VARCHAR(100),
    transaction_type VARCHAR(10) NOT NULL CHECK (transaction_type IN ('INCOME', 'EXPENSE', 'TRANSFER')),
    amount DECIMAL(15,2) NOT NULL,
    asset_id BIGINT REFERENCES et_assets(asset_id),
    category_id BIGINT REFERENCES et_categories(category_id),
    description VARCHAR(200),
    recurring_type VARCHAR(20) NOT NULL CHECK (recurring_type IN ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY')),
    recurring_day INTEGER, -- 매월 몇일
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. 알림 설정
CREATE TABLE IF NOT EXISTS et_notifications (
    notification_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES et_users(user_id) ON DELETE CASCADE,
    notification_type VARCHAR(30) CHECK (notification_type IN ('DAILY_SUMMARY', 'BUDGET_ALERT', 'RECURRING_REMINDER')),
    is_enabled BOOLEAN DEFAULT TRUE,
    notification_time TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. 사용자 설정
CREATE TABLE IF NOT EXISTS et_user_settings (
    setting_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES et_users(user_id) ON DELETE CASCADE,
    setting_key VARCHAR(50) NOT NULL,
    setting_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_et_user_setting UNIQUE (user_id, setting_key)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_et_transactions_user_date ON et_transactions(user_id, transaction_date);
CREATE INDEX IF NOT EXISTS idx_et_transactions_asset ON et_transactions(asset_id);
CREATE INDEX IF NOT EXISTS idx_et_transactions_category ON et_transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_et_assets_user ON et_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_et_categories_user ON et_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_et_budgets_user_period ON et_budgets(user_id, budget_year, budget_month);

-- 트리거 함수: updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_et_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성
DROP TRIGGER IF EXISTS update_et_transactions_updated_at ON et_transactions;
CREATE TRIGGER update_et_transactions_updated_at BEFORE UPDATE ON et_transactions
    FOR EACH ROW EXECUTE FUNCTION update_et_updated_at_column();