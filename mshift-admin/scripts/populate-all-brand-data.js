const { PrismaClient } = require('../lib/generated/prisma');

const prisma = new PrismaClient();

// 산업분류별 태그 매핑
const industryToTagMap = {
  치킨: ['치킨', '외식', '배달'],
  피자: ['피자', '외식', '배달'],
  카페: ['카페', '음료', '디저트'],
  교육: ['교육', '학원', '강의'],
  편의점: ['편의점', '소매', '생필품'],
  스포츠: ['스포츠', '헬스', '운동'],
  뷰티: ['뷰티', '미용', '화장품'],
  패스트푸드: ['패스트푸드', '햄버거', '외식'],
  디저트: ['디저트', '달콤한', '카페'],
  베이커리: ['베이커리', '빵', '디저트'],
  패션: ['패션', '의류', '쇼핑'],
  신발: ['신발', '패션', '용품'],
  숙박: ['숙박', '호텔', '여행'],
  헬스: ['헬스', '운동', '건강'],
  기타: ['기타', '외식', '서비스'],
};

// 카테고리별 금액 범위
const categoryAmountRanges = {
  카페: [1000, 50000],
  편의점: [1000, 30000],
  치킨: [15000, 50000],
  피자: [15000, 50000],
  교육: [50000, 500000],
  스포츠: [30000, 200000],
  뷰티: [10000, 200000],
  패스트푸드: [5000, 25000],
  디저트: [3000, 30000],
  베이커리: [2000, 30000],
  패션: [20000, 200000],
  신발: [30000, 300000],
  숙박: [50000, 500000],
  헬스: [50000, 200000],
  기타: [5000, 50000],
};

// 거래 문자열 패턴들
const transactionPatterns = [
  (brand, amount) => `${brand} ${amount.toLocaleString()}원`,
  (brand, amount) => `${brand} 결제 ${amount.toLocaleString()}원`,
  (brand, amount) => `[카드] ${brand} ${amount.toLocaleString()}원`,
  (brand, amount) => `모바일 ${brand} ${amount.toLocaleString()}원`,
  (brand, amount) => `${brand} 매장 ${amount.toLocaleString()}원`,
  (brand, amount) => `${brand} 온라인 ${amount.toLocaleString()}원`,
  (brand, amount) => `${brand} 간편결제 ${amount.toLocaleString()}원`,
  (brand, amount) => `${brand} 체크카드 ${amount.toLocaleString()}원`,
  (brand, amount) => `${brand} 신용카드 ${amount.toLocaleString()}원`,
  (brand, amount) => `${brand} 승인 ${amount.toLocaleString()}원`,
];

function generateTransactionString(brand, category, amount) {
  const cleanBrand = brand.replace(/[()]/g, '').trim();
  const pattern =
    transactionPatterns[Math.floor(Math.random() * transactionPatterns.length)];
  return pattern(cleanBrand, amount);
}

function generateAmount(category) {
  const range = categoryAmountRanges[category] || categoryAmountRanges['기타'];
  const [min, max] = range;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function inferTagsFromIndustry(
  industryLargeCategory,
  industryMediumCategory,
  brandName
) {
  let tags = [];

  // 브랜드명에서 카테고리 추론
  const brandLower = brandName.toLowerCase();

  if (brandLower.includes('치킨') || brandLower.includes('chicken')) {
    tags = industryToTagMap['치킨'];
  } else if (brandLower.includes('피자') || brandLower.includes('pizza')) {
    tags = industryToTagMap['피자'];
  } else if (
    brandLower.includes('카페') ||
    brandLower.includes('coffee') ||
    brandLower.includes('커피')
  ) {
    tags = industryToTagMap['카페'];
  } else if (
    brandLower.includes('편의점') ||
    brandLower.includes('마트') ||
    brandLower.includes('gs25') ||
    brandLower.includes('cu') ||
    brandLower.includes('세븐일레븐')
  ) {
    tags = industryToTagMap['편의점'];
  } else if (industryLargeCategory === '교육') {
    tags = industryToTagMap['교육'];
  } else if (
    brandLower.includes('헬스') ||
    brandLower.includes('gym') ||
    brandLower.includes('피트니스') ||
    brandLower.includes('요가')
  ) {
    tags = industryToTagMap['스포츠'];
  } else if (
    brandLower.includes('뷰티') ||
    brandLower.includes('미용') ||
    brandLower.includes('네일') ||
    brandLower.includes('헤어')
  ) {
    tags = industryToTagMap['뷰티'];
  } else if (
    brandLower.includes('버거') ||
    brandLower.includes('burger') ||
    brandLower.includes('맥도날드') ||
    brandLower.includes('롯데리아')
  ) {
    tags = industryToTagMap['패스트푸드'];
  } else if (
    brandLower.includes('베이커리') ||
    brandLower.includes('빵') ||
    brandLower.includes('파리바게뜨')
  ) {
    tags = industryToTagMap['베이커리'];
  } else if (
    brandLower.includes('아이스크림') ||
    brandLower.includes('빙수') ||
    brandLower.includes('디저트')
  ) {
    tags = industryToTagMap['디저트'];
  } else {
    tags = industryToTagMap['기타'];
  }

  return tags;
}

function getCategoryFromTags(tags) {
  if (tags.includes('치킨')) return '치킨';
  if (tags.includes('피자')) return '피자';
  if (tags.includes('카페')) return '카페';
  if (tags.includes('편의점')) return '편의점';
  if (tags.includes('교육')) return '교육';
  if (tags.includes('스포츠')) return '스포츠';
  if (tags.includes('뷰티')) return '뷰티';
  if (tags.includes('패스트푸드')) return '패스트푸드';
  if (tags.includes('디저트')) return '디저트';
  if (tags.includes('베이커리')) return '베이커리';
  return '기타';
}

async function processAllBrands() {
  console.log('🚀 전체 브랜드 데이터 처리 시작');

  const totalBrands = await prisma.franchiseBrands.count();
  console.log(`📊 총 처리할 브랜드: ${totalBrands}개`);

  const batchSize = 100;
  let processed = 0;

  for (let offset = 0; offset < totalBrands; offset += batchSize) {
    console.log(
      `\n🔄 배치 ${Math.floor(offset / batchSize) + 1} 처리 중... (${offset + 1}/${totalBrands})`
    );

    const brands = await prisma.franchiseBrands.findMany({
      skip: offset,
      take: batchSize,
      orderBy: { id: 'asc' },
    });

    console.log(
      `📦 배치 처리 시작 (${offset + 1}~${Math.min(offset + batchSize, totalBrands)})`
    );

    for (const brand of brands) {
      try {
        // 태그 추론
        const tags = inferTagsFromIndustry(
          brand.industryLargeCategory,
          brand.industryMediumCategory,
          brand.brandName
        );

        // 카테고리 결정
        const category = getCategoryFromTags(tags);

        // 금액 생성
        const amount = generateAmount(category);

        // 거래 문자열 생성
        const transactionString = generateTransactionString(
          brand.brandName,
          category,
          amount
        );

        // 태그 생성 근거
        const tagReason = `브랜드명: ${brand.brandName}, 산업분류: ${brand.industryLargeCategory}, 추론된 카테고리: ${category}`;

        // 데이터베이스 업데이트
        await prisma.franchiseBrands.update({
          where: { id: brand.id },
          data: {
            generatedTransactionString: transactionString,
            primaryTag: tags[0] || '기타',
            secondaryTag: tags[1] || null,
            tertiaryTag: tags[2] || null,
            tagGenerationReason: tagReason,
          },
        });

        processed++;

        if (processed % 10 === 0) {
          console.log(
            `  ✓ ${processed}/${totalBrands} 처리 완료 (${((processed / totalBrands) * 100).toFixed(1)}%)`
          );
        }
      } catch (error) {
        console.error(`✗ ${brand.brandName} 처리 실패:`, error.message);
      }
    }

    console.log(
      `✅ 배치 처리 완료 (${Math.min(offset + batchSize, totalBrands)}개)`
    );
    console.log(
      `📈 전체 진행률: ${((processed / totalBrands) * 100).toFixed(1)}%`
    );

    // 메모리 정리를 위한 잠시 대기
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`\n🎉 모든 브랜드 처리 완료!`);
  console.log(`📊 총 처리된 브랜드: ${processed}개`);

  // 최종 통계 출력
  const stats = await prisma.franchiseBrands.groupBy({
    by: ['primaryTag'],
    _count: { primaryTag: true },
    orderBy: { _count: { primaryTag: 'desc' } },
  });

  console.log('\n📈 태그별 통계:');
  stats.forEach(stat => {
    console.log(
      `  - ${stat.primaryTag || '미분류'}: ${stat._count.primaryTag}개`
    );
  });
}

async function main() {
  try {
    await processAllBrands();
  } catch (error) {
    console.error('처리 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
