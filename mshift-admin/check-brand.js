const { PrismaClient } = require('./lib/generated/prisma');

async function checkBrandDetails() {
  const prisma = new PrismaClient();

  try {
    const brand = await prisma.franchiseBrands.findUnique({
      where: { id: 12079 },
      select: {
        id: true,
        brandName: true,
        companyName: true,
        industryLargeCategory: true,
        industryMediumCategory: true,
        mainProduct: true,
        generatedTransactionString: true,
        primaryTag: true,
        secondaryTag: true,
        tertiaryTag: true,
        testPassed: true,
        lastTestAt: true,
        testResult: true,
        tagGenerationReason: true,
      },
    });

    console.log('오로지라멘 브랜드 전체 데이터:');
    console.log(JSON.stringify(brand, null, 2));

    // 라멘 관련 다른 브랜드들 확인
    const ramenBrands = await prisma.franchiseBrands.findMany({
      where: {
        OR: [
          { brandName: { contains: '라멘', mode: 'insensitive' } },
          { brandName: { contains: '라면', mode: 'insensitive' } },
          { mainProduct: { contains: '라멘', mode: 'insensitive' } },
          { mainProduct: { contains: '라면', mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        brandName: true,
        primaryTag: true,
        secondaryTag: true,
        tertiaryTag: true,
        testPassed: true,
      },
      take: 10,
    });

    console.log('\n라멘 관련 다른 브랜드들:');
    ramenBrands.forEach(b => {
      console.log(
        `${b.brandName}: [${b.primaryTag}, ${b.secondaryTag}, ${b.tertiaryTag}] - 테스트: ${b.testPassed}`
      );
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBrandDetails();
