-- Phase 4: Journal Entry Business Logic Schema Initialization
-- Create essential tables for Phase 4 TDD testing

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types with proper names
DO $$ BEGIN
    CREATE TYPE "account_type_enum" AS ENUM ('자산', '부채', '자본', '수익', '비용');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "journal_entry_approval_status_enum" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'POSTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "taxpayer_type_enum" AS ENUM ('CORPORATION', 'SOLE_PROPRIETORSHIP');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "transaction_io_type" AS ENUM ('EXPENSE', 'INCOME');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    business_registration_number VARCHAR(20) UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    taxpayer_type "taxpayer_type_enum" DEFAULT 'CORPORATION'
);

-- Chart of Accounts table
CREATE TABLE IF NOT EXISTS chart_of_accounts (
    id SERIAL PRIMARY KEY,
    account_code VARCHAR(10) UNIQUE NOT NULL,
    account_name VARCHAR(100) NOT NULL,
    account_type "account_type_enum" NOT NULL,
    account_subtype VARCHAR(50),
    is_debit_normal BOOLEAN NOT NULL,
    parent_account_id INTEGER REFERENCES chart_of_accounts(id),
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Journal Entries table
CREATE TABLE IF NOT EXISTS journal_entries (
    id BIGSERIAL PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL,
    description TEXT NOT NULL,
    total_debit_amount DECIMAL(18,2) NOT NULL,
    total_credit_amount DECIMAL(18,2) NOT NULL,
    status "journal_entry_approval_status_enum" DEFAULT 'DRAFT',
    confidence_score DECIMAL(5,2),
    posted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Journal Entry Details table
CREATE TABLE IF NOT EXISTS journal_entry_details (
    id BIGSERIAL PRIMARY KEY,
    journal_entry_id BIGINT NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    line_number INTEGER NOT NULL,
    account_code VARCHAR(20) NOT NULL REFERENCES chart_of_accounts(account_code),
    account_name VARCHAR(100) NOT NULL,
    debit_amount DECIMAL(18,2) DEFAULT 0,
    credit_amount DECIMAL(18,2) DEFAULT 0,
    description TEXT,
    cost_center VARCHAR(50),
    project_code VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions table (simplified for Phase 4)
CREATE TABLE IF NOT EXISTS transactions (
    id BIGSERIAL PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    raw_text TEXT NOT NULL,
    transaction_date DATE NOT NULL,
    amount BIGINT NOT NULL,
    transaction_type "transaction_io_type" NOT NULL,
    final_debit_account VARCHAR(100),
    final_credit_account VARCHAR(100),
    final_suggested_tag VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- General Ledger table
CREATE TABLE IF NOT EXISTS general_ledger (
    id BIGSERIAL PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    account_code VARCHAR(20) NOT NULL REFERENCES chart_of_accounts(account_code),
    fiscal_year INTEGER NOT NULL,
    fiscal_month INTEGER NOT NULL,
    beginning_debit_balance DECIMAL(18,2) DEFAULT 0,
    beginning_credit_balance DECIMAL(18,2) DEFAULT 0,
    period_debit_amount DECIMAL(18,2) DEFAULT 0,
    period_credit_amount DECIMAL(18,2) DEFAULT 0,
    year_to_date_debit DECIMAL(18,2) DEFAULT 0,
    year_to_date_credit DECIMAL(18,2) DEFAULT 0,
    ending_debit_balance DECIMAL(18,2) DEFAULT 0,
    ending_credit_balance DECIMAL(18,2) DEFAULT 0,
    is_closed BOOLEAN DEFAULT false,
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, account_code, fiscal_year, fiscal_month)
);

-- GL Details table
CREATE TABLE IF NOT EXISTS gl_details (
    id BIGSERIAL PRIMARY KEY,
    general_ledger_id BIGINT NOT NULL REFERENCES general_ledger(id) ON DELETE CASCADE,
    journal_entry_id BIGINT NOT NULL REFERENCES journal_entries(id),
    posting_date DATE NOT NULL,
    debit_amount DECIMAL(18,2) DEFAULT 0,
    credit_amount DECIMAL(18,2) DEFAULT 0,
    running_balance DECIMAL(18,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_journal_entries_company_date ON journal_entries(company_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_journal_entries_status ON journal_entries(status);
CREATE INDEX IF NOT EXISTS idx_journal_entry_details_entry_id ON journal_entry_details(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_transactions_company_id ON transactions(company_id);
CREATE INDEX IF NOT EXISTS idx_gl_company_year ON general_ledger(company_id, fiscal_year);

-- Insert basic chart of accounts for testing
INSERT INTO chart_of_accounts (account_code, account_name, account_type, is_debit_normal, display_order) VALUES
('1000', '현금', '자산', true, 1),
('1010', '보통예금', '자산', true, 2),
('1020', '당좌예금', '자산', true, 3),
('2000', '매입채무', '부채', false, 10),
('2010', '미지급금', '부채', false, 11),
('3000', '자본금', '자본', false, 20),
('4000', '매출', '수익', false, 30),
('5000', '매입비용', '비용', true, 40),
('5010', '급여', '비용', true, 41),
('5020', '임차료', '비용', true, 42),
('5030', '사무용품비', '비용', true, 43),
('5040', '통신비', '비용', true, 44),
('5050', '접대비', '비용', true, 45)
ON CONFLICT (account_code) DO NOTHING;

-- Tags Master table
CREATE TABLE IF NOT EXISTS tags_master (
    id BIGSERIAL PRIMARY KEY,
    tag_name VARCHAR(100) UNIQUE NOT NULL,
    tag_category VARCHAR(50),
    description TEXT,
    color_hex VARCHAR(7) DEFAULT '#6B7280',
    icon_name VARCHAR(50) DEFAULT 'tag',
    display_order INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tag Account Mapping table
CREATE TABLE IF NOT EXISTS tag_account_mappings (
    id BIGSERIAL PRIMARY KEY,
    tag_id BIGINT NOT NULL REFERENCES tags_master(id) ON DELETE CASCADE,
    account_code VARCHAR(20) NOT NULL REFERENCES chart_of_accounts(account_code),
    account_name VARCHAR(100) NOT NULL,
    mapping_condition JSONB,
    is_default BOOLEAN DEFAULT false,
    priority INTEGER DEFAULT 50,
    confidence_boost DECIMAL(3,2) DEFAULT 0.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert basic tags for testing
INSERT INTO tags_master (tag_name, tag_category, description) VALUES
('사무용품', '비용', '사무용품 구매'),
('임차료', '비용', '사무실 임차료'),
('급여', '비용', '직원 급여'),
('접대비', '비용', '접대비 지출')
ON CONFLICT (tag_name) DO NOTHING;

-- Insert test company
INSERT INTO companies (id, company_name, business_registration_number, taxpayer_type) VALUES
('550e8400-e29b-41d4-a716-446655440000', '테스트회사', '123-45-67890', 'CORPORATION')
ON CONFLICT (id) DO NOTHING;

SELECT 'Phase 4 schema initialized successfully' AS status;