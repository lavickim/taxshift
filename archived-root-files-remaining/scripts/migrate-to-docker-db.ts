import { Client } from 'pg'

// 소스 DB (로컬 PostgreSQL - moneyshift_dev)
const sourceClient = new Client({
  host: 'localhost',
  port: 5432,
  database: 'moneyshift_dev',
  user: 'postgres',
  password: 'Dydrkfl11!' // 기존 로컬 DB 패스워드
})

// 대상 DB (Docker PostgreSQL - moneyshift)
const targetClient = new Client({
  host: 'localhost',
  port: 5432,
  database: 'moneyshift',
  user: 'postgres',
  password: 'postgres' // Docker 컨테이너 패스워드
})

async function migrateData() {
  try {
    console.log('🚀 데이터 마이그레이션 시작...')

    // 연결
    await sourceClient.connect()
    await targetClient.connect()

    console.log('✅ 데이터베이스 연결 완료')

    // 1. 먼저 필요한 테이블들을 생성
    console.log('🔧 테이블 생성 중...')
    
    // datacollection_gyeonggi_delivery 테이블 생성
    await targetClient.query(`
      CREATE TABLE IF NOT EXISTS datacollection_gyeonggi_delivery (
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
    `)

    // datacollection_seoul_restaurants 테이블 생성
    await targetClient.query(`
      CREATE TABLE IF NOT EXISTS datacollection_seoul_restaurants (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        management_number TEXT,
        license_date DATE,
        license_cancel_date DATE,
        business_status_code TEXT,
        business_status_name TEXT,
        detailed_status_code TEXT,
        detailed_status_name TEXT,
        closure_date DATE,
        suspension_start_date DATE,
        suspension_end_date DATE,
        reopening_date DATE,
        phone_number TEXT,
        site_area TEXT,
        postal_code TEXT,
        lot_address TEXT,
        road_address TEXT,
        road_postal_code TEXT,
        business_name TEXT NOT NULL,
        last_modified_date TIMESTAMP,
        data_update_type TEXT,
        data_update_date TIMESTAMP,
        business_type TEXT,
        coordinate_x NUMERIC(20, 6),
        coordinate_y NUMERIC(20, 6),
        hygiene_business_type TEXT,
        male_employee_count INTEGER,
        female_employee_count INTEGER,
        surrounding_area_type TEXT,
        grade_type TEXT,
        water_supply_type TEXT,
        total_employees INTEGER,
        headquarters_employees INTEGER,
        factory_office_employees INTEGER,
        factory_sales_employees INTEGER,
        factory_production_employees INTEGER,
        building_ownership_type TEXT,
        deposit_amount NUMERIC(15, 2),
        monthly_rent NUMERIC(15, 2),
        multi_use_facility_yn TEXT,
        total_facility_size NUMERIC(10, 2),
        traditional_business_number TEXT,
        traditional_main_food TEXT,
        homepage TEXT,
        data_source TEXT DEFAULT 'seoul_restaurants' NOT NULL,
        collection_batch_id TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `)

    console.log('✅ 테이블 생성 완료')

    // 2. 경기도 배달특급 데이터 마이그레이션
    console.log('📊 경기도 배달특급 데이터 마이그레이션 중...')
    
    const gyeonggiData = await sourceClient.query('SELECT * FROM datacollection_gyeonggi_delivery ORDER BY created_at')
    console.log(`📦 경기도 배달특급 데이터: ${gyeonggiData.rows.length}개`)

    if (gyeonggiData.rows.length > 0) {
      // 배치로 삽입
      for (let i = 0; i < gyeonggiData.rows.length; i += 1000) {
        const batch = gyeonggiData.rows.slice(i, i + 1000)
        const values = batch.map((row, index) => {
          const paramStart = index * 17 + 1
          return `($${paramStart}, $${paramStart + 1}, $${paramStart + 2}, $${paramStart + 3}, $${paramStart + 4}, $${paramStart + 5}, $${paramStart + 6}, $${paramStart + 7}, $${paramStart + 8}, $${paramStart + 9}, $${paramStart + 10}, $${paramStart + 11}, $${paramStart + 12}, $${paramStart + 13}, $${paramStart + 14}, $${paramStart + 15}, $${paramStart + 16})`
        }).join(', ')

        const params = batch.flatMap(row => [
          row.list_total_count, row.response_code, row.response_message, row.api_version,
          row.business_reg_no, row.sigun_name, row.store_name, row.industry_type,
          row.refined_road_address, row.refined_lot_address, row.refined_zipcode,
          row.refined_latitude, row.refined_longitude, row.data_source,
          row.collection_batch_id, row.created_at, row.updated_at
        ])

        const insertQuery = `
          INSERT INTO datacollection_gyeonggi_delivery 
          (list_total_count, response_code, response_message, api_version, business_reg_no, 
           sigun_name, store_name, industry_type, refined_road_address, refined_lot_address, 
           refined_zipcode, refined_latitude, refined_longitude, data_source, 
           collection_batch_id, created_at, updated_at)
          VALUES ${values}
          ON CONFLICT (business_reg_no) DO NOTHING
        `

        await targetClient.query(insertQuery, params)
        console.log(`📦 경기도 배달특급 데이터 ${i + batch.length}/${gyeonggiData.rows.length} 완료`)
      }
    }

    // 3. 서울시 음식점 데이터 마이그레이션
    console.log('🏪 서울시 음식점 데이터 마이그레이션 중...')
    
    const seoulData = await sourceClient.query('SELECT * FROM datacollection_seoul_restaurants ORDER BY created_at LIMIT 10000')
    console.log(`🍽️ 서울시 음식점 데이터: ${seoulData.rows.length}개 (처음 10,000개만)`)

    if (seoulData.rows.length > 0) {
      // 배치로 삽입 (서울 데이터는 양이 많으므로 작은 배치로)
      for (let i = 0; i < seoulData.rows.length; i += 500) {
        const batch = seoulData.rows.slice(i, i + 500)
        
        for (const row of batch) {
          try {
            await targetClient.query(`
              INSERT INTO datacollection_seoul_restaurants 
              (management_number, license_date, license_cancel_date, business_status_code, 
               business_status_name, detailed_status_code, detailed_status_name, closure_date,
               suspension_start_date, suspension_end_date, reopening_date, phone_number,
               site_area, postal_code, lot_address, road_address, road_postal_code,
               business_name, last_modified_date, data_update_type, data_update_date,
               business_type, coordinate_x, coordinate_y, hygiene_business_type,
               male_employee_count, female_employee_count, surrounding_area_type,
               grade_type, water_supply_type, total_employees, headquarters_employees,
               factory_office_employees, factory_sales_employees, factory_production_employees,
               building_ownership_type, deposit_amount, monthly_rent, multi_use_facility_yn,
               total_facility_size, traditional_business_number, traditional_main_food,
               homepage, data_source, collection_batch_id, created_at, updated_at)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45, $46, $47)
            `, [
              row.management_number, row.license_date, row.license_cancel_date, row.business_status_code,
              row.business_status_name, row.detailed_status_code, row.detailed_status_name, row.closure_date,
              row.suspension_start_date, row.suspension_end_date, row.reopening_date, row.phone_number,
              row.site_area, row.postal_code, row.lot_address, row.road_address, row.road_postal_code,
              row.business_name, row.last_modified_date, row.data_update_type, row.data_update_date,
              row.business_type, row.coordinate_x, row.coordinate_y, row.hygiene_business_type,
              row.male_employee_count, row.female_employee_count, row.surrounding_area_type,
              row.grade_type, row.water_supply_type, row.total_employees, row.headquarters_employees,
              row.factory_office_employees, row.factory_sales_employees, row.factory_production_employees,
              row.building_ownership_type, row.deposit_amount, row.monthly_rent, row.multi_use_facility_yn,
              row.total_facility_size, row.traditional_business_number, row.traditional_main_food,
              row.homepage, row.data_source, row.collection_batch_id, row.created_at, row.updated_at
            ])
          } catch (error) {
            console.log(`⚠️ 서울 데이터 삽입 오류 (계속 진행): ${error}`)
          }
        }
        
        console.log(`🍽️ 서울시 음식점 데이터 ${i + batch.length}/${seoulData.rows.length} 완료`)
      }
    }

    // 4. 결과 확인
    console.log('\n📋 마이그레이션 결과 확인:')
    
    const gyeonggiCount = await targetClient.query('SELECT COUNT(*) FROM datacollection_gyeonggi_delivery')
    const seoulCount = await targetClient.query('SELECT COUNT(*) FROM datacollection_seoul_restaurants')
    
    console.log(`✅ 경기도 배달특급: ${gyeonggiCount.rows[0].count}개`)
    console.log(`✅ 서울시 음식점: ${seoulCount.rows[0].count}개`)

    console.log('\n🎉 데이터 마이그레이션 완료!')
    
  } catch (error) {
    console.error('❌ 마이그레이션 오류:', error)
  } finally {
    await sourceClient.end()
    await targetClient.end()
  }
}

migrateData() 