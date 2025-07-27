import { PrismaClient } from '@prisma/client';

// Supabase 연결
const supabaseClient = new PrismaClient({
  datasources: {
    db: {
      url: 'postgres://postgres.hxeaerxvqtdhercpzaoc:IeRtSDb9MyDYJ9aM@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres?sslmode=require',
    },
  },
});

// 로컬 PostgreSQL 연결
const localClient = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:postgres@localhost:5432/moneyshift',
    },
  },
});

async function migrateData() {
  try {
    console.log('🚀 데이터 마이그레이션 시작...');

    // 1. 경기도 배달특급 데이터 마이그레이션
    console.log('📊 경기도 배달특급 데이터 조회 중...');
    const gyeonggiDeliveryData = await supabaseClient.$queryRaw`
      SELECT * FROM datacollection_gyeonggi_delivery ORDER BY created_at LIMIT 1000
    `;

    console.log(
      `📦 경기도 배달특급 데이터: ${(gyeonggiDeliveryData as any[]).length}개`
    );

    // 2. 서울시 음식점 데이터 마이그레이션
    console.log('🏪 서울시 음식점 데이터 조회 중...');
    const seoulRestaurantsData = await supabaseClient.$queryRaw`
      SELECT * FROM datacollection_seoul_restaurants ORDER BY created_at LIMIT 1000
    `;

    console.log(
      `🍽️ 서울시 음식점 데이터: ${(seoulRestaurantsData as any[]).length}개`
    );

    // 3. 기타 테이블 데이터 확인
    console.log('🔍 기타 테이블 조회 중...');

    // Companies 테이블
    const companies = await supabaseClient.$queryRaw`SELECT * FROM companies`;
    console.log(`🏢 Companies: ${(companies as any[]).length}개`);

    // Rules 테이블
    const rules = await supabaseClient.$queryRaw`SELECT * FROM rules`;
    console.log(`📋 Rules: ${(rules as any[]).length}개`);

    // Transaction Cache 테이블
    const transactionCache =
      await supabaseClient.$queryRaw`SELECT * FROM transaction_cache LIMIT 100`;
    console.log(
      `💾 Transaction Cache: ${(transactionCache as any[]).length}개`
    );

    console.log('\n📋 마이그레이션할 데이터 요약:');
    console.log(
      `- 경기도 배달특급: ${(gyeonggiDeliveryData as any[]).length}개`
    );
    console.log(`- 서울시 음식점: ${(seoulRestaurantsData as any[]).length}개`);
    console.log(`- Companies: ${(companies as any[]).length}개`);
    console.log(`- Rules: ${(rules as any[]).length}개`);
    console.log(`- Transaction Cache: ${(transactionCache as any[]).length}개`);

    console.log('\n✅ 데이터 조회 완료!');
  } catch (error) {
    console.error('❌ 마이그레이션 오류:', error);
  } finally {
    await supabaseClient.$disconnect();
    await localClient.$disconnect();
  }
}

migrateData();
