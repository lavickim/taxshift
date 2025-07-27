const { PrismaClient } = require('../lib/generated/prisma');

const prisma = new PrismaClient();

async function checkPriorities() {
  console.log('🔍 현재 키워드 그룹 우선순위 분석...');

  try {
    // 결제 수단 관련 키워드 그룹들 확인
    const paymentGroups = await prisma.keywordGroup.findMany({
      where: {
        isActive: true,
        OR: [
          { primaryKeyword: { contains: '신용카드' } },
          { primaryKeyword: { contains: '체크카드' } },
          { primaryKeyword: { contains: '간편결제' } },
          { primaryKeyword: { contains: '온라인' } },
          { primaryKeyword: { contains: '모바일' } },
          { groupName: { contains: '결제' } },
          { groupName: { contains: '카드' } },
          { groupName: { contains: '온라인' } },
        ],
      },
      select: {
        id: true,
        groupName: true,
        primaryKeyword: true,
        category: true,
        synonyms: true,
      },
      orderBy: { id: 'asc' },
    });

    console.log('\n💳 결제 수단 관련 키워드 그룹:');
    paymentGroups.forEach(group => {
      console.log(
        `  ${group.id}. ${group.groupName} (${group.primaryKeyword}) - ${group.category}`
      );
      console.log(
        `     동의어: [${group.synonyms.slice(0, 5).join(', ')}${group.synonyms.length > 5 ? '...' : ''}]`
      );
    });

    // 브랜드 관련 키워드 그룹들 확인
    const brandGroups = await prisma.keywordGroup.findMany({
      where: {
        isActive: true,
        category: {
          in: ['커피전문점', '치킨전문점', '피자', '제과제빵', '패스트푸드'],
        },
      },
      select: {
        id: true,
        groupName: true,
        primaryKeyword: true,
        category: true,
      },
      orderBy: { id: 'asc' },
      take: 10,
    });

    console.log('\n🏪 브랜드 관련 키워드 그룹 (상위 10개):');
    brandGroups.forEach(group => {
      console.log(
        `  ${group.id}. ${group.groupName} (${group.primaryKeyword}) - ${group.category}`
      );
    });

    // 키워드-태그 매핑 우선순위 확인
    const mappingPriorities = await prisma.keywordTagMapping.findMany({
      where: { isActive: true },
      select: {
        id: true,
        keywordGroupId: true,
        tagId: true,
        priority: true,
        confidenceScore: true,
      },
      orderBy: [{ priority: 'desc' }, { confidenceScore: 'desc' }],
      take: 15,
    });

    console.log('\n📊 높은 우선순위 매핑 (상위 15개):');
    mappingPriorities.forEach(mapping => {
      console.log(
        `  매핑 ${mapping.id}: 그룹${mapping.keywordGroupId} → 태그${mapping.tagId} (우선순위: ${mapping.priority || 'NULL'}, 신뢰도: ${mapping.confidenceScore})`
      );
    });

    // 우선순위 분포 분석
    const priorityDistribution = await prisma.keywordTagMapping.groupBy({
      by: ['priority'],
      where: { isActive: true },
      _count: {
        id: true,
      },
      orderBy: {
        priority: 'desc',
      },
    });

    console.log('\n📈 우선순위 분포:');
    priorityDistribution.forEach(dist => {
      console.log(`  우선순위 ${dist.priority || 'NULL'}: ${dist._count.id}개`);
    });

    // 태그별 매핑 확인
    const tagMappings = await prisma.tagsMaster.findMany({
      where: { isActive: true },
      select: {
        id: true,
        tagName: true,
        tagCategory: true,
      },
      orderBy: { id: 'asc' },
      take: 20,
    });

    console.log('\n🏷️  활성 태그 목록 (상위 20개):');
    tagMappings.forEach(tag => {
      console.log(`  태그 ${tag.id}: ${tag.tagName} (${tag.tagCategory})`);
    });
  } catch (error) {
    console.error('❌ 우선순위 분석 중 오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPriorities();
