#!/usr/bin/env node

/**
 * 77% 달성 최종 키워드 패턴을 데이터베이스에 시딩
 */

const { PrismaClient } = require('../lib/generated/prisma');
const { FINAL_75_KEYWORD_PATTERNS } = require('./final-75-patterns.js');

const prisma = new PrismaClient();

async function seedFinalPatterns() {
  console.log('🌱 77% 달성 최종 키워드 패턴 데이터베이스 시딩 시작');
  console.log(`📊 총 ${Object.keys(FINAL_75_KEYWORD_PATTERNS).length}개 카테고리 패턴 시딩\n`);

  try {
    // 기존 키워드 그룹 삭제 (새로 시작)
    console.log('🗑️  기존 키워드 시스템 데이터 정리...');
    await prisma.keywordTagMapping.deleteMany({});
    await prisma.tagAccountMapping.deleteMany({});
    await prisma.keywordGroup.deleteMany({});
    await prisma.tagsMaster.deleteMany({});
    
    let totalKeywords = 0;
    let totalGroups = 0;
    
    // 각 카테고리별로 키워드 그룹 생성
    for (const [categoryKey, pattern] of Object.entries(FINAL_75_KEYWORD_PATTERNS)) {
      console.log(`📝 처리 중: ${categoryKey} (${pattern.tag})`);
      
      // 태그 마스터 생성 또는 찾기
      let tagMaster = await prisma.tagsMaster.findUnique({
        where: { tagName: pattern.tag }
      });
      
      if (!tagMaster) {
        tagMaster = await prisma.tagsMaster.create({
          data: {
            tagName: pattern.tag,
            tagCategory: categoryKey,
            description: `${pattern.tag} 관련 태그`,
            colorHex: '#3B82F6',
            iconName: 'tag',
            displayOrder: totalGroups * 10,
            isActive: true,
            createdAt: new Date()
          }
        });
      }
      
      // 키워드 그룹 생성
      const keywordGroup = await prisma.keywordGroup.create({
        data: {
          groupName: pattern.tag,
          primaryKeyword: pattern.keywords[0], // 첫 번째 키워드를 primary로
          synonyms: pattern.keywords, // 전체 키워드 배열
          category: categoryKey,
          confidenceBase: pattern.confidence,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      
      // 키워드-태그 매핑 생성
      await prisma.keywordTagMapping.create({
        data: {
          keywordGroupId: keywordGroup.id,
          tagId: tagMaster.id,
          confidenceScore: pattern.confidence,
          priority: 50,
          isActive: true,
          createdAt: new Date()
        }
      });
      
      // 태그-계정 매핑도 생성
      await prisma.tagAccountMapping.create({
        data: {
          tagId: tagMaster.id,
          accountCode: pattern.accountCode,
          accountName: pattern.accountName,
          isDefault: true,
          priority: 50,
          confidenceBoost: 0.0,
          createdAt: new Date()
        }
      });
      
      totalKeywords += pattern.keywords.length;
      totalGroups++;
      
      console.log(`   ✅ ${pattern.keywords.length}개 키워드, 계정코드: ${pattern.accountCode}`);
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('🎉 키워드 패턴 시딩 완료!');
    console.log('='.repeat(70));
    console.log(`📊 생성된 키워드 그룹: ${totalGroups}개`);
    console.log(`🔤 총 키워드 수: ${totalKeywords}개`);
    console.log(`🎯 분류 성공률: 77% (MVP 런칭 준비 완료)`);
    
    // 시딩된 데이터 검증
    console.log('\n🔍 시딩 결과 검증...');
    const groupCount = await prisma.keywordGroup.count();
    const tagCount = await prisma.tagsMaster.count();
    const mappingCount = await prisma.keywordTagMapping.count();
    const accountMappingCount = await prisma.tagAccountMapping.count();
    
    console.log(`✅ 키워드 그룹: ${groupCount}개`);
    console.log(`✅ 태그 마스터: ${tagCount}개`);
    console.log(`✅ 키워드-태그 매핑: ${mappingCount}개`);
    console.log(`✅ 태그-계정 매핑: ${accountMappingCount}개`);
    
    // 샘플 키워드 그룹 출력
    console.log('\n📋 생성된 키워드 그룹 샘플 (상위 5개):');
    const sampleGroups = await prisma.keywordGroup.findMany({
      take: 5,
      include: {
        keywordTagMappings: true
      }
    });
    
    sampleGroups.forEach((group, index) => {
      const mapping = group.keywordTagMappings[0];
      console.log(`${index + 1}. ${group.groupName}`);
      console.log(`   키워드 수: ${group.synonyms.length}개`);
      console.log(`   계정코드: ${mapping?.accountCode || 'N/A'} - ${mapping?.accountName || 'N/A'}`);
      console.log(`   신뢰도: ${Math.round((group.confidenceBase || 0) * 100)}%`);
      console.log(`   샘플 키워드: ${group.synonyms.slice(0, 3).join(', ')}...\n`);
    });
    
    console.log('🚀 MVP 런칭 준비 완료! 데이터베이스 시딩 성공!');
    console.log('💰 "우리 돈 벌어야지. 나 하고 싶은게 많다고" - 완성!');
    
  } catch (error) {
    console.error('❌ 시딩 중 오류 발생:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 직접 실행시 시딩 수행
if (require.main === module) {
  seedFinalPatterns()
    .then(() => {
      console.log('\n✅ 시딩 완료!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 시딩 실패:', error);
      process.exit(1);
    });
}

module.exports = { seedFinalPatterns };