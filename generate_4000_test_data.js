const { Pool } = require('pg');

// 4,000개 테스트 데이터 생성 스크립트
// 현재 1,000개 → 5,000개로 확장

// 데이터베이스 연결 설정
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'moneyshift',
  password: 'moneyshift123',
  port: 5432,
});

// 1. 현대적 거래 패턴 템플릿
const modernTransactionTemplates = [
  // 온라인 결제
  { template: '네이버페이 {merchant}', category: '온라인결제', expectedTag: '온라인결제' },
  { template: '카카오페이 {merchant}', category: '온라인결제', expectedTag: '온라인결제' },
  { template: '토스 {merchant}', category: '온라인결제', expectedTag: '온라인결제' },
  { template: '페이코 {merchant}', category: '온라인결제', expectedTag: '온라인결제' },
  { template: '삼성페이 {merchant}', category: '온라인결제', expectedTag: '온라인결제' },
  
  // 구독 서비스
  { template: '넷플릭스 월 구독료', category: '구독서비스', expectedTag: '엔터테인먼트' },
  { template: '유튜브 프리미엄', category: '구독서비스', expectedTag: '엔터테인먼트' },
  { template: '스포티파이 구독', category: '구독서비스', expectedTag: '엔터테인먼트' },
  { template: '디즈니플러스 구독료', category: '구독서비스', expectedTag: '엔터테인먼트' },
  { template: '멜론 이용료', category: '구독서비스', expectedTag: '엔터테인먼트' },
  
  // 배달 서비스
  { template: '배달의민족 {restaurant}', category: '배달서비스', expectedTag: '음식점' },
  { template: '쿠팡이츠 {restaurant}', category: '배달서비스', expectedTag: '음식점' },
  { template: '요기요 {restaurant}', category: '배달서비스', expectedTag: '음식점' },
  { template: '우버이츠 {restaurant}', category: '배달서비스', expectedTag: '음식점' },
  
  // 쇼핑몰
  { template: '쿠팡 {product}', category: '쇼핑몰', expectedTag: '쇼핑' },
  { template: '11번가 {product}', category: '쇼핑몰', expectedTag: '쇼핑' },
  { template: 'G마켓 {product}', category: '쇼핑몰', expectedTag: '쇼핑' },
  { template: '옥션 {product}', category: '쇼핑몰', expectedTag: '쇼핑' },
  
  // 교통
  { template: '서울교통공사 지하철', category: '교통카드', expectedTag: '교통' },
  { template: '버스 요금', category: '교통카드', expectedTag: '교통' },
  { template: '카카오택시', category: '택시', expectedTag: '교통' },
  { template: '타다 이용료', category: '택시', expectedTag: '교통' },
  { template: '쏘카 대여료', category: '교통카드', expectedTag: '교통' },
  
  // 의료
  { template: '{name} 종합병원', category: '병원', expectedTag: '의료' },
  { template: '{name} 치과', category: '치과', expectedTag: '의료' },
  { template: '{name} 한의원', category: '한의원', expectedTag: '의료' },
  { template: '{name} 약국', category: '약국', expectedTag: '의료' },
  { template: '{name} 동물병원', category: '동물병원', expectedTag: '의료' },
  
  // 교육
  { template: '{name} 학원', category: '학교', expectedTag: '교육' },
  { template: '{name} 어학원', category: '학교', expectedTag: '교육' },
  { template: '{name} 유치원', category: '유치원', expectedTag: '교육' },
  { template: '{name} 대학교', category: '학교', expectedTag: '교육' },
  
  // 금융
  { template: '신한은행', category: '은행', expectedTag: '금융' },
  { template: '국민은행', category: '은행', expectedTag: '금융' },
  { template: '카카오뱅크', category: '은행', expectedTag: '금융' },
  { template: '삼성생명보험', category: '보험', expectedTag: '금융' },
  
  // 생활
  { template: '{name} 미용실', category: '미용', expectedTag: '미용' },
  { template: '{name} 네일샵', category: '미용', expectedTag: '미용' },
  { template: '{name} 세탁소', category: '세탁소', expectedTag: '생활' },
  { template: '{name} 헬스장', category: '스포츠', expectedTag: '스포츠' },
  { template: '{name} 부동산', category: '부동산', expectedTag: '생활' },
];

// 2. 랜덤 데이터 생성을 위한 배열들
const merchantNames = [
  '서울점', '강남점', '홍대점', '신촌점', '잠실점', '건대점', '노원점', '구로점',
  '성북점', '마포점', '용산점', '종로점', '중구점', '송파점', '강서점', '양천점',
  '중랑점', '동대문점', '성동점', '광진점', '은평점', '서대문점', '관악점', '영등포점',
  '동작점', '금천점', '구리점', '남양주점', '하남점', '고양점', '부천점', '안양점'
];

const restaurantNames = [
  '맛있는집', '황금식당', '서울집', '엄마손맛', '전통한식', '모던키친', '팜투테이블',
  '도심속맛집', '골목식당', '우리집밥상', '정성가득', '건강한식탁', '신선한재료',
  '푸드앤조이', '테이스트하우스', '딜리셔스', '쿡앤쿡', '퓨전키친', '그릴하우스'
];

const productNames = [
  '생활용품', '의류', '전자제품', '도서', '화장품', '식품', '주방용품', '인테리어',
  '스포츠용품', '건강식품', '완구', '문구', '가전제품', '휴대폰', '컴퓨터', '가구',
  '신발', '가방', '액세서리', '반려용품', '자동차용품', '원예용품', '공구', '음향기기'
];

const personalNames = [
  '서울', '강남', '홍대', '신촌', '잠실', '건대', '노원', '구로', '성북', '마포',
  '용산', '종로', '중구', '송파', '강서', '양천', '중랑', '동대문', '성동', '광진',
  '은평', '서대문', '관악', '영등포', '동작', '금천', '구리', '남양주', '하남', '고양'
];

// 3. 랜덤 선택 함수
const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];

// 4. 거래 문자열 생성 함수
const generateTransactionString = (template) => {
  let result = template.template;
  
  if (result.includes('{merchant}')) {
    result = result.replace('{merchant}', getRandomElement(merchantNames));
  }
  if (result.includes('{restaurant}')) {
    result = result.replace('{restaurant}', getRandomElement(restaurantNames));
  }
  if (result.includes('{product}')) {
    result = result.replace('{product}', getRandomElement(productNames));
  }
  if (result.includes('{name}')) {
    result = result.replace('{name}', getRandomElement(personalNames));
  }
  
  return result;
};

// 5. 금액 생성 함수
const generateAmount = (category) => {
  const ranges = {
    '온라인결제': [5000, 100000],
    '구독서비스': [5000, 20000],
    '배달서비스': [15000, 50000],
    '쇼핑몰': [10000, 200000],
    '교통카드': [1000, 5000],
    '택시': [3000, 30000],
    '병원': [10000, 100000],
    '치과': [20000, 200000],
    '한의원': [15000, 80000],
    '약국': [5000, 50000],
    '동물병원': [20000, 150000],
    '학교': [100000, 500000],
    '유치원': [200000, 800000],
    '은행': [1000, 10000],
    '보험': [50000, 300000],
    '미용': [20000, 100000],
    '세탁소': [5000, 30000],
    '스포츠': [50000, 200000],
    '부동산': [100000, 2000000]
  };
  
  const range = ranges[category] || [5000, 50000];
  return Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
};

// 6. 4,000개 테스트 데이터 생성 및 삽입
async function generateTestData() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 4,000개 테스트 데이터 생성 시작...');
    
    const insertPromises = [];
    
    for (let i = 0; i < 4000; i++) {
      const template = getRandomElement(modernTransactionTemplates);
      const transactionString = generateTransactionString(template);
      const amount = generateAmount(template.category);
      
      const query = `
        INSERT INTO transaction_test_data (
          transaction_string, 
          amount, 
          expected_tag, 
          category,
          confidence_score,
          created_at,
          metadata
        ) VALUES ($1, $2, $3, $4, $5, NOW(), $6)
      `;
      
      const values = [
        transactionString,
        amount,
        template.expectedTag,
        template.category,
        Math.random() * 0.3 + 0.7, // 0.7-1.0 신뢰도
        JSON.stringify({
          source: 'modern_patterns',
          batch_id: 'expansion_4k',
          template_used: template.template
        })
      ];
      
      insertPromises.push(client.query(query, values));
      
      // 진행률 출력
      if ((i + 1) % 500 === 0) {
        console.log(`📊 진행률: ${i + 1}/4000 (${((i + 1) / 4000 * 100).toFixed(1)}%)`);
      }
    }
    
    // 모든 삽입 실행
    await Promise.all(insertPromises);
    
    console.log('✅ 4,000개 테스트 데이터 생성 완료!');
    
    // 최종 통계 확인
    const countResult = await client.query('SELECT COUNT(*) as total FROM transaction_test_data');
    const categoryStats = await client.query(`
      SELECT category, COUNT(*) as count 
      FROM transaction_test_data 
      WHERE metadata->>'source' = 'modern_patterns'
      GROUP BY category 
      ORDER BY count DESC
    `);
    
    console.log(`📈 총 테스트 데이터: ${countResult.rows[0].total}개`);
    console.log('\n📊 신규 추가된 카테고리별 분포:');
    categoryStats.rows.forEach(row => {
      console.log(`  ${row.category}: ${row.count}개`);
    });
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// 7. 실행
generateTestData().catch(console.error);