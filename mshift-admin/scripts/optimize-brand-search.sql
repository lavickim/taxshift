-- 브랜드 검색 최적화를 위한 인덱스 생성
-- 동적 키워드 시스템 성능 향상

-- 1. 브랜드명 검색 최적화 인덱스
CREATE INDEX IF NOT EXISTS idx_franchise_brands_brand_name_lower 
ON franchise_brands (LOWER(brand_name));

-- 2. 회사명 검색 최적화 인덱스  
CREATE INDEX IF NOT EXISTS idx_franchise_brands_company_name_lower 
ON franchise_brands (LOWER(company_name));

-- 3. 브랜드명 + 회사명 복합 인덱스 (LIKE 검색 최적화)
CREATE INDEX IF NOT EXISTS idx_franchise_brands_names_gin 
ON franchise_brands USING gin(to_tsvector('simple', COALESCE(brand_name, '') || ' ' || COALESCE(company_name, '')));

-- 4. 산업 카테고리별 인덱스
CREATE INDEX IF NOT EXISTS idx_franchise_brands_industry_category 
ON franchise_brands (industry_large_category);

-- 5. 태그별 인덱스 (자주 조회되는 필드)
CREATE INDEX IF NOT EXISTS idx_franchise_brands_primary_tag 
ON franchise_brands (primary_tag);

-- 6. 복합 인덱스: 산업카테고리 + 태그
CREATE INDEX IF NOT EXISTS idx_franchise_brands_category_tag 
ON franchise_brands (industry_large_category, primary_tag);

-- 7. 브랜드명 길이별 정렬 최적화 (LENGTH 함수 인덱스)
CREATE INDEX IF NOT EXISTS idx_franchise_brands_brand_name_length 
ON franchise_brands (LENGTH(brand_name) DESC, id ASC);

-- 8. 활성 브랜드만 조회하는 경우를 위한 인덱스 (향후 활용)
-- CREATE INDEX IF NOT EXISTS idx_franchise_brands_active 
-- ON franchise_brands (is_active) WHERE is_active = true;

-- 인덱스 생성 확인
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'franchise_brands'
ORDER BY indexname;