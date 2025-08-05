-- MoneyShift Trojan Horse Database Schema
-- Purpose: Collect real transaction data through household budget app

-- Create database (run manually)
-- CREATE DATABASE moneyshift_trojan;
-- CREATE DATABASE moneyshift_trojan_test;

-- Users table - Core user management
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    profile_image_url VARCHAR(500),
    
    -- Subscription and premium features
    is_premium BOOLEAN DEFAULT false,
    subscription_type VARCHAR(20) DEFAULT 'FREE', -- FREE, PREMIUM
    subscription_expires_at TIMESTAMP,
    
    -- User preferences (stored as JSONB for flexibility)
    preferences JSONB DEFAULT '{"currency": "KRW", "language": "ko", "notifications": true, "autoCategory": true}',
    
    -- Privacy and consent
    data_collection_consent BOOLEAN DEFAULT false,
    marketing_consent BOOLEAN DEFAULT false,
    terms_accepted_version VARCHAR(10),
    privacy_accepted_version VARCHAR(10),
    
    -- Usage statistics
    total_receipts INTEGER DEFAULT 0,
    total_transactions INTEGER DEFAULT 0,
    last_active_at TIMESTAMP,
    
    -- Gamification
    current_level INTEGER DEFAULT 1,
    total_points INTEGER DEFAULT 0,
    current_badge VARCHAR(50) DEFAULT 'BEGINNER',
    
    -- Device analytics (for improving the main MoneyShift service)
    device_type VARCHAR(50), -- iOS, Android, Web
    app_version VARCHAR(20),
    os_version VARCHAR(50),
    device_id VARCHAR(255), -- Anonymous device identifier
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Receipts table - Core receipt data collection
CREATE TABLE IF NOT EXISTS receipts (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Image storage
    original_image_url VARCHAR(500) NOT NULL,
    processed_image_url VARCHAR(500),
    image_hash VARCHAR(64), -- SHA-256 for duplicate detection
    image_size_bytes BIGINT,
    
    -- OCR results
    raw_ocr_text TEXT,
    ocr_confidence DECIMAL(3,2), -- 0.00 to 1.00
    ocr_metadata JSONB, -- Structured OCR data
    
    -- Extracted business information
    merchant_name VARCHAR(200),
    merchant_address TEXT,
    merchant_phone VARCHAR(20),
    business_registration_number VARCHAR(20),
    
    -- Transaction details
    total_amount DECIMAL(12,2),
    tax_amount DECIMAL(12,2),
    discount_amount DECIMAL(12,2),
    currency VARCHAR(3) DEFAULT 'KRW',
    transaction_date TIMESTAMP,
    payment_method VARCHAR(50),
    
    -- Categorization
    category VARCHAR(100),
    subcategory VARCHAR(100),
    tags TEXT[], -- Array of tags
    
    -- Processing status
    processing_status VARCHAR(20) DEFAULT 'UPLOADED', -- UPLOADED, PROCESSING, COMPLETED, FAILED
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- Quality metrics
    image_quality_score DECIMAL(3,2),
    data_completeness_score DECIMAL(3,2),
    
    -- Analytics data (anonymized for MoneyShift analysis)
    analytics_data JSONB,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP
);

-- Transactions table - Manual and auto-generated transactions
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receipt_id VARCHAR(36) REFERENCES receipts(id) ON DELETE SET NULL,
    
    -- Basic transaction info
    amount DECIMAL(12,2) NOT NULL,
    description VARCHAR(500),
    category VARCHAR(100),
    subcategory VARCHAR(100),
    transaction_date TIMESTAMP NOT NULL,
    type VARCHAR(10) NOT NULL, -- INCOME, EXPENSE
    
    -- Payment information
    payment_method VARCHAR(50), -- CASH, CARD, BANK_TRANSFER, etc.
    account_number VARCHAR(20), -- Last 4 digits for privacy
    bank_name VARCHAR(100),
    card_type VARCHAR(50), -- CREDIT, DEBIT, PREPAID
    
    -- Location data (for spending pattern analysis)
    merchant_name VARCHAR(200),
    location VARCHAR(200),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    
    -- Classification and tagging
    tags TEXT[],
    notes TEXT,
    
    -- Data source tracking
    source VARCHAR(20) DEFAULT 'MANUAL_ENTRY', -- RECEIPT_OCR, MANUAL_ENTRY, BANK_IMPORT
    confidence DECIMAL(3,2), -- Classification confidence
    
    -- Analytics metadata (anonymized)
    analytics_metadata JSONB,
    
    -- User verification
    is_verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table - Predefined categories for classification
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR(100) NOT NULL,
    parent_id VARCHAR(36) REFERENCES categories(id),
    icon_name VARCHAR(50),
    color_code VARCHAR(7), -- Hex color
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User sessions - Track user activity for analytics
CREATE TABLE IF NOT EXISTS user_sessions (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) NOT NULL,
    
    -- Session metadata
    device_info JSONB,
    ip_address INET,
    user_agent TEXT,
    
    -- Activity tracking
    actions_count INTEGER DEFAULT 0,
    receipts_uploaded INTEGER DEFAULT 0,
    transactions_created INTEGER DEFAULT 0,
    
    -- Timestamps
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

-- Analytics events - Detailed user behavior tracking
CREATE TABLE IF NOT EXISTS analytics_events (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(36) REFERENCES user_sessions(id) ON DELETE CASCADE,
    
    -- Event details
    event_type VARCHAR(50) NOT NULL, -- RECEIPT_UPLOAD, TRANSACTION_CREATE, etc.
    event_category VARCHAR(50),
    event_data JSONB,
    
    -- Context
    screen_name VARCHAR(100),
    feature_used VARCHAR(100),
    
    -- Performance metrics
    processing_time_ms INTEGER,
    success BOOLEAN,
    error_code VARCHAR(50),
    error_message TEXT,
    
    -- Timestamp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Data export requests - Track user data exports
CREATE TABLE IF NOT EXISTS data_exports (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    export_type VARCHAR(20) NOT NULL, -- EXCEL, CSV, PDF
    date_range_start DATE,
    date_range_end DATE,
    
    -- Export configuration
    include_receipts BOOLEAN DEFAULT true,
    include_images BOOLEAN DEFAULT false,
    categories_filter TEXT[],
    
    -- Processing status
    status VARCHAR(20) DEFAULT 'REQUESTED', -- REQUESTED, PROCESSING, COMPLETED, FAILED
    file_url VARCHAR(500),
    file_size_bytes BIGINT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Achievements - Gamification system
CREATE TABLE IF NOT EXISTS achievements (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    achievement_type VARCHAR(50) NOT NULL, -- FIRST_RECEIPT, WEEKLY_GOAL, etc.
    title VARCHAR(100),
    description TEXT,
    icon_name VARCHAR(50),
    
    points_awarded INTEGER DEFAULT 0,
    badge_earned VARCHAR(50),
    
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_receipts_user_id ON receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_receipts_created_at ON receipts(created_at);
CREATE INDEX IF NOT EXISTS idx_receipts_processing_status ON receipts(processing_status);
CREATE INDEX IF NOT EXISTS idx_receipts_merchant_name ON receipts(merchant_name);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_amount ON transactions(amount);
CREATE INDEX IF NOT EXISTS idx_transactions_source ON transactions(source);

CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_is_premium ON users(is_premium);

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_receipts_updated_at BEFORE UPDATE ON receipts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default categories
INSERT INTO categories (name, icon_name, color_code, sort_order) VALUES
('음식점', 'restaurant', '#FF6B6B', 1),
('카페/음료', 'coffee', '#4ECDC4', 2),
('편의점', 'store', '#45B7D1', 3),
('쇼핑', 'shopping-bag', '#96CEB4', 4),
('교통', 'car', '#FFEAA7', 5),
('의료/건강', 'medical', '#DDA0DD', 6),
('교육', 'book', '#98D8C8', 7),
('엔터테인먼트', 'game-controller', '#F7DC6F', 8),
('공과금', 'receipt', '#BB8FCE', 9),
('기타', 'ellipsis-horizontal', '#BDC3C7', 10)
ON CONFLICT DO NOTHING;