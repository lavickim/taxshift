import { testDatabaseConnection } from './client';
import { checkDatabaseUrl, logDatabaseInfo } from './connection';

/**
 * 애플리케이션 시작 시 데이터베이스를 초기화합니다.
 * 1. DATABASE_URL 확인
 * 2. 데이터베이스 연결 테스트
 * 3. 스키마 확인 및 마이그레이션 적용
 * 4. 기본 데이터 생성 (필요한 경우)
 */
export async function initializeDatabase(): Promise<void> {
  console.log('🔄 Initializing database...');
  
  // DATABASE_URL 확인
  if (!checkDatabaseUrl()) {
    throw new Error('DATABASE_URL이 환경 변수에 설정되지 않았습니다. .env 파일에 Supabase에서 제공하는 DATABASE_URL을 추가해주세요.');
  }
  
  logDatabaseInfo();
  
  try {
    // 1. 데이터베이스 연결 테스트
    await testDatabaseConnection();
    
    // 2. 마이그레이션 상태 확인
    await checkMigrationStatus();
    
    // 3. 데이터 수집 테이블 확인 및 생성
    await checkDataCollectionTables();
    
    // 4. 기본 데이터 확인 및 생성
    await seedRequiredData();
    
    console.log('✅ Database initialization completed');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    
    // 개발 환경에서는 자동으로 마이그레이션 시도
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Attempting to apply migrations...');
      await applyMigrationsInDevelopment();
    } else {
      throw error;
    }
  }
}

/**
 * 마이그레이션 상태를 확인합니다.
 */
async function checkMigrationStatus(): Promise<void> {
  try {
    // Prisma의 _prisma_migrations 테이블을 확인하여 마이그레이션 상태 체크
    // 실제 테이블 쿼리로 스키마 존재 여부 확인
    const { prisma } = await import('./client');
    
    // companies 테이블이 존재하는지 확인 (대표 테이블)
    await prisma.$queryRaw`SELECT 1 FROM companies LIMIT 1`;
    console.log('✅ Database schema is up to date');
  } catch (error) {
    console.log('⚠️ Database schema needs migration');
    throw new Error('Database schema is not up to date. Please run migrations.');
  }
}

/**
 * 개발 환경에서 마이그레이션을 자동 적용합니다.
 */
async function applyMigrationsInDevelopment(): Promise<void> {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('Auto-migration is only allowed in development environment');
  }
  
  try {
    // 개발 환경에서는 prisma db push를 사용하여 스키마를 자동 동기화
    const { execSync } = require('child_process');
    
    console.log('🔄 Applying database migrations...');
    execSync('npx prisma db push --skip-generate', { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    console.log('✅ Migrations applied successfully');
    
    // 마이그레이션 후 다시 연결 테스트
    await testDatabaseConnection();
  } catch (error) {
    console.error('❌ Failed to apply migrations:', error);
    throw error;
  }
}

/**
 * 데이터 수집 관련 테이블들을 확인하고 필요시 생성합니다.
 */
async function checkDataCollectionTables(): Promise<void> {
  try {
    const { prisma } = await import('./client');
    
    // 경기도 배달특급 데이터 수집 테이블 확인
    try {
      await prisma.$queryRaw`SELECT 1 FROM datacollection_gyeonggi_delivery LIMIT 1`;
      console.log('✅ Data collection table (datacollection_gyeonggi_delivery) exists');
      
      // 기존 테이블의 RLS 설정 확인 및 수정
      await checkAndFixTablePermissions();
    } catch (error) {
      console.log('⚠️ Data collection table not found, creating...');
      await createDataCollectionTables();
    }
    
    // 서울시 일반음식점 데이터 수집 테이블 확인
    try {
      await prisma.$queryRaw`SELECT 1 FROM datacollection_seoul_restaurants LIMIT 1`;
      console.log('✅ Seoul restaurants table (datacollection_seoul_restaurants) exists');
    } catch (error) {
      console.log('⚠️ Seoul restaurants table not found, creating...');
      await createSeoulRestaurantsTable();
    }
  } catch (error) {
    console.error('❌ Failed to check data collection tables:', error);
    throw error;
  }
}

/**
 * 데이터 수집 테이블들을 생성합니다.
 */
async function createDataCollectionTables(): Promise<void> {
  try {
    const { prisma } = await import('./client');
    
    console.log('🔧 Creating datacollection_gyeonggi_delivery table...');
    
    // 경기도 배달특급 데이터 수집 테이블 생성
    await prisma.$executeRaw`
      CREATE TABLE datacollection_gyeonggi_delivery (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        list_total_count INTEGER,
        response_code TEXT,
        response_message TEXT,
        api_version TEXT,
        business_reg_no TEXT UNIQUE NOT NULL,
        sigun_name TEXT,
        store_name TEXT NOT NULL,
        industry_type TEXT,
        refined_road_address TEXT,
        refined_lot_address TEXT,
        refined_zipcode TEXT,
        refined_latitude NUMERIC(10, 8),
        refined_longitude NUMERIC(11, 8),
        data_source TEXT DEFAULT 'gyeonggi_delivery' NOT NULL,
        collection_batch_id TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    
    // 인덱스 생성
    console.log('🔧 Creating indexes...');
    await prisma.$executeRaw`
      CREATE INDEX idx_datacollection_gyeonggi_delivery_business_reg_no 
        ON datacollection_gyeonggi_delivery(business_reg_no)
    `;
    await prisma.$executeRaw`
      CREATE INDEX idx_datacollection_gyeonggi_delivery_sigun_name 
        ON datacollection_gyeonggi_delivery(sigun_name)
    `;
    await prisma.$executeRaw`
      CREATE INDEX idx_datacollection_gyeonggi_delivery_industry_type 
        ON datacollection_gyeonggi_delivery(industry_type)
    `;
    await prisma.$executeRaw`
      CREATE INDEX idx_datacollection_gyeonggi_delivery_data_source 
        ON datacollection_gyeonggi_delivery(data_source)
    `;
    await prisma.$executeRaw`
      CREATE INDEX idx_datacollection_gyeonggi_delivery_created_at 
        ON datacollection_gyeonggi_delivery(created_at)
    `;
    
    // 업데이트 트리거 생성
    console.log('🔧 Creating update trigger...');
    await prisma.$executeRaw`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `;
    
    await prisma.$executeRaw`
      CREATE TRIGGER update_datacollection_gyeonggi_delivery_updated_at 
          BEFORE UPDATE ON datacollection_gyeonggi_delivery 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `;
    
    console.log('✅ Data collection tables created successfully');
    
    // RLS 설정 (Row Level Security)
    console.log('🔧 Setting up Row Level Security...');
    try {
      // RLS 비활성화 (데이터 수집용 테이블이므로)
      await prisma.$executeRaw`
        ALTER TABLE datacollection_gyeonggi_delivery DISABLE ROW LEVEL SECURITY
      `;
      
      // 또는 모든 사용자에게 INSERT/SELECT 권한 부여
      await prisma.$executeRaw`
        GRANT INSERT, SELECT, UPDATE, DELETE ON datacollection_gyeonggi_delivery TO anon, authenticated
      `;
      
      console.log('✅ RLS settings configured');
    } catch (rlsError) {
      console.log('⚠️ RLS setup failed:', rlsError);
      // RLS 설정 실패 시에도 진행
    }
    
    // 테이블 코멘트 추가 (선택사항)
    try {
      await prisma.$executeRaw`
        COMMENT ON TABLE datacollection_gyeonggi_delivery IS '경기도 배달특급 가맹점 데이터 수집 테이블'
      `;
      await prisma.$executeRaw`
        COMMENT ON COLUMN datacollection_gyeonggi_delivery.business_reg_no IS '사업자등록번호 (유니크)'
      `;
      console.log('✅ Table comments added');
    } catch (commentError) {
      console.log('⚠️ Failed to add table comments (non-critical)');
    }
    
  } catch (error) {
    console.error('❌ Failed to create data collection tables:', error);
    throw error;
  }
}

/**
 * 서울시 일반음식점 데이터 수집 테이블을 생성합니다.
 */
async function createSeoulRestaurantsTable(): Promise<void> {
  try {
    const { prisma } = await import('./client');
    
    console.log('🔧 Creating datacollection_seoul_restaurants table...');
    
    // 서울시 일반음식점 데이터 수집 테이블 생성 (첫 번째 컬럼은 제외, 폐업 데이터는 필터링)
    await prisma.$executeRaw`
      CREATE TABLE datacollection_seoul_restaurants (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        management_number TEXT,  -- 관리번호 (사업자등록번호)
        license_date DATE,                       -- 인허가일자
        license_cancel_date DATE,               -- 인허가취소일자
        business_status_code TEXT,              -- 영업상태코드
        business_status_name TEXT,              -- 영업상태명
        detailed_status_code TEXT,              -- 상세영업상태코드
        detailed_status_name TEXT,              -- 상세영업상태명
        closure_date DATE,                      -- 폐업일자
        suspension_start_date DATE,             -- 휴업시작일자
        suspension_end_date DATE,               -- 휴업종료일자
        reopening_date DATE,                    -- 재개업일자
        phone_number TEXT,                      -- 전화번호
        site_area TEXT,                         -- 소재지면적
        postal_code TEXT,                       -- 소재지우편번호
        lot_address TEXT,                       -- 지번주소
        road_address TEXT,                      -- 도로명주소
        road_postal_code TEXT,                  -- 도로명우편번호
        business_name TEXT NOT NULL,            -- 사업장명
        last_modified_date TIMESTAMP,           -- 최종수정일자
        data_update_type TEXT,                  -- 데이터갱신구분
        data_update_date TIMESTAMP,             -- 데이터갱신일자
        business_type TEXT,                     -- 업태구분명
        coordinate_x NUMERIC(20, 6),            -- 좌표정보(X) - UTM/TM 좌표 지원
        coordinate_y NUMERIC(20, 6),            -- 좌표정보(Y) - UTM/TM 좌표 지원
        hygiene_business_type TEXT,             -- 위생업태명
        male_employee_count INTEGER,            -- 남성종사자수
        female_employee_count INTEGER,          -- 여성종사자수
        surrounding_area_type TEXT,             -- 영업장주변구분명
        grade_type TEXT,                        -- 등급구분명
        water_supply_type TEXT,                 -- 급수시설구분명
        total_employees INTEGER,                -- 총인원
        headquarters_employees INTEGER,         -- 본사종업원수
        factory_office_employees INTEGER,       -- 공장사무직종업원수
        factory_sales_employees INTEGER,        -- 공장판매직종업원수
        factory_production_employees INTEGER,   -- 공장생산직종업원수
        building_ownership_type TEXT,           -- 건물소유구분명
        deposit_amount NUMERIC(15, 2),          -- 보증액
        monthly_rent NUMERIC(15, 2),            -- 월세액
        multi_use_facility_yn TEXT,             -- 다중이용업소여부
        total_facility_size NUMERIC(10, 2),     -- 시설총규모
        traditional_business_number TEXT,       -- 전통업소지정번호
        traditional_main_food TEXT,             -- 전통업소주된음식
        homepage TEXT,                          -- 홈페이지
        data_source TEXT DEFAULT 'seoul_restaurants' NOT NULL,
        collection_batch_id TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    
    // 인덱스 생성
    console.log('🔧 Creating indexes for Seoul restaurants table...');
    await prisma.$executeRaw`
      CREATE INDEX idx_seoul_restaurants_management_number 
        ON datacollection_seoul_restaurants(management_number)
    `;
    await prisma.$executeRaw`
      CREATE INDEX idx_seoul_restaurants_business_name 
        ON datacollection_seoul_restaurants(business_name)
    `;
    await prisma.$executeRaw`
      CREATE INDEX idx_seoul_restaurants_business_status 
        ON datacollection_seoul_restaurants(business_status_name)
    `;
    await prisma.$executeRaw`
      CREATE INDEX idx_seoul_restaurants_business_type 
        ON datacollection_seoul_restaurants(business_type)
    `;
    await prisma.$executeRaw`
      CREATE INDEX idx_seoul_restaurants_road_address 
        ON datacollection_seoul_restaurants(road_address)
    `;
    await prisma.$executeRaw`
      CREATE INDEX idx_seoul_restaurants_created_at 
        ON datacollection_seoul_restaurants(created_at)
    `;
    
    // 업데이트 트리거 생성
    console.log('🔧 Creating update trigger for Seoul restaurants...');
    await prisma.$executeRaw`
      CREATE TRIGGER update_seoul_restaurants_updated_at 
          BEFORE UPDATE ON datacollection_seoul_restaurants 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `;
    
    // RLS 설정
    console.log('🔧 Setting up Row Level Security for Seoul restaurants...');
    try {
      await prisma.$executeRaw`
        ALTER TABLE datacollection_seoul_restaurants DISABLE ROW LEVEL SECURITY
      `;
      
      await prisma.$executeRaw`
        GRANT INSERT, SELECT, UPDATE, DELETE ON datacollection_seoul_restaurants TO anon, authenticated
      `;
      
      console.log('✅ Seoul restaurants RLS settings configured');
    } catch (rlsError) {
      console.log('⚠️ Seoul restaurants RLS setup failed:', rlsError);
    }
    
    // 테이블 코멘트 추가
    try {
      await prisma.$executeRaw`
        COMMENT ON TABLE datacollection_seoul_restaurants IS '서울시 일반음식점 인허가 정보 수집 테이블'
      `;
      await prisma.$executeRaw`
        COMMENT ON COLUMN datacollection_seoul_restaurants.management_number IS '관리번호 (사업자등록번호 역할, 유니크)'
      `;
      await prisma.$executeRaw`
        COMMENT ON COLUMN datacollection_seoul_restaurants.business_name IS '사업장명'
      `;
      console.log('✅ Seoul restaurants table comments added');
    } catch (commentError) {
      console.log('⚠️ Failed to add Seoul restaurants table comments (non-critical)');
    }
    
    console.log('✅ Seoul restaurants table created successfully');
    
  } catch (error) {
    console.error('❌ Failed to create Seoul restaurants table:', error);
    throw error;
  }
}

/**
 * 기존 테이블의 권한 설정을 확인하고 수정합니다.
 */
async function checkAndFixTablePermissions(): Promise<void> {
  try {
    const { prisma } = await import('./client');
    
    console.log('🔧 Checking table permissions...');
    
    // RLS 비활성화
    await prisma.$executeRaw`
      ALTER TABLE datacollection_gyeonggi_delivery DISABLE ROW LEVEL SECURITY
    `;
    
    // 권한 부여
    await prisma.$executeRaw`
      GRANT INSERT, SELECT, UPDATE, DELETE ON datacollection_gyeonggi_delivery TO anon, authenticated
    `;
    
    // 서울시 음식점 테이블 권한도 확인 (존재하는 경우에만)
    try {
      await prisma.$executeRaw`
        ALTER TABLE datacollection_seoul_restaurants DISABLE ROW LEVEL SECURITY
      `;
      await prisma.$executeRaw`
        GRANT INSERT, SELECT, UPDATE, DELETE ON datacollection_seoul_restaurants TO anon, authenticated
      `;
    } catch (error) {
      // 테이블이 아직 없을 수 있으므로 무시
    }
    
    console.log('✅ Table permissions updated');
  } catch (error) {
    console.log('⚠️ Failed to update table permissions:', error);
    // 권한 설정 실패해도 계속 진행
  }
}

/**
 * 필요한 기본 데이터를 생성합니다.
 */
async function seedRequiredData(): Promise<void> {
  // 현재는 특별히 필요한 기본 데이터가 없음
  // 필요시 여기에 추가
  console.log('✅ Required data check completed');
} 