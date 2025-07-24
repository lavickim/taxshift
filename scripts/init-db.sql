-- MoneyShift Database Initialization Script
-- PostgreSQL 15+ with UTF8 encoding

-- Ensure UTF8 encoding
SET client_encoding = 'UTF8';

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set timezone
SET TIME ZONE 'Asia/Seoul';

-- Ensure database exists (this is handled by POSTGRES_DB env var)
SELECT 'MoneyShift database initialized successfully' AS message;