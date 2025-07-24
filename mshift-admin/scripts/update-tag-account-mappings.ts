#!/usr/bin/env ts-node

/**
 * 태그-계정과목 매핑 업데이트 스크립트
 * 3자리 계정코드를 4자리 계정코드로 업데이트합니다.
 * TDD Phase 2: Red → Green 전환을 위한 구현
 */

import { PrismaClient } from '../lib/generated/prisma';

const prisma = new PrismaClient();

// 3자리 → 4자리 계정코드 매핑 테이블 (확장)
const accountCodeMapping = {
  // 기존 3자리 → 새로운 4자리 매핑
  '622': '5310', // 차량유지비 → 차량유지비
  '651': '5230', // 접대비 → 접대비  
  '111': '5410', // 식료품비 → 소모품비 (식료품은 소모품으로 분류)
  '634': '5410', // 소모품비 → 소모품비
  '611': '5260', // 여비교통비 → 출장비
  '999': '5910', // 의료비 → 의료비 (기타는 의료비가 가장 적절)
  
  // 추가 3자리 코드들 (확장된 매핑)
  '603': '5410', // 기타 → 소모품비
  '655': '5230', // 접대비 관련 → 접대비
  '701': '5230', // 기타 접대 → 접대비
  '702': '5270', // 통신 → 통신비
  '703': '5451', // 수수료 → 은행수수료
  '801': '5260', // 교통비 → 출장비
  '901': '5910', // 의료/기타 → 의료비
  
  // 나머지 가능한 3자리 코드들 (안전 매핑)
  '601': '5410', // 기타 소모품
  '602': '5410', // 기타 소모품
  '604': '5410', // 기타 소모품
  '605': '5410', // 기타 소모품
  '650': '5230', // 접대비 관련
  '652': '5230', // 접대비 관련
  '653': '5230', // 접대비 관련
  '654': '5230', // 접대비 관련
  '656': '5230', // 접대비 관련
  '657': '5230', // 접대비 관련
  '658': '5230', // 접대비 관련
  '659': '5230', // 접대비 관련
} as const;

// 비즈니스 태그별 권장 계정과목 매핑
const businessTagMappings = {
  '편의점': '5410', // 소모품비
  '주유소': '5310', // 차량유지비
  '치킨전문점': '5230', // 접대비
  '패스트푸드': '5230', // 접대비
  '한식음식점': '5230', // 접대비
  '피자전문점': '5230', // 접대비
  '카페': '5230', // 접대비
  '음료전문점': '5230', // 접대비
  '레스토랑': '5230', // 접대비
  '마트': '5410', // 소모품비
  '면세점': '5410', // 소모품비
  '온라인쇼핑': '5410', // 소모품비
  '교통': '5260', // 출장비
  '주차비': '5260', // 출장비
  '여행숙박': '5260', // 출장비
  '의료': '5910', // 의료비
  '금융': '5451', // 은행수수료
  '통신비': '5270', // 통신비
} as const;

async function updateTagAccountMappings() {
  console.log('🔄 태그-계정과목 매핑 업데이트 시작...');
  console.log('📊 3자리 → 4자리 계정코드 변환 중...');
  
  try {
    // 1. 현재 매핑 상태 분석
    const currentMappings = await prisma.tagAccountMapping.findMany({
      include: {
        tag: {
          select: { tagName: true }
        }
      }
    });
    
    console.log(`\n📋 현재 매핑 현황: ${currentMappings.length}개`);
    
    // 2. 3자리 코드 사용 중인 매핑들 조회
    const oldCodeMappings = currentMappings.filter(mapping => 
      Object.keys(accountCodeMapping).includes(mapping.accountCode)
    );
    
    console.log(`🔍 3자리 코드 사용 중인 매핑: ${oldCodeMappings.length}개`);
    
    if (oldCodeMappings.length === 0) {
      console.log('✅ 모든 매핑이 이미 4자리 코드를 사용하고 있습니다.');
      return;
    }
    
    // 3. 업데이트할 계정들이 존재하는지 확인
    const targetAccountCodes = Object.values(accountCodeMapping);
    for (const accountCode of targetAccountCodes) {
      const account = await prisma.chartOfAccounts.findUnique({
        where: { accountCode }
      });
      
      if (!account) {
        throw new Error(`대상 계정 ${accountCode}가 존재하지 않습니다. 먼저 확장 계정과목을 생성해주세요.`);
      }
    }
    
    console.log('✅ 모든 대상 계정과목 존재 확인 완료');
    
    // 4. 매핑 업데이트 실행
    let updatedCount = 0;
    const updateResults: Array<{
      tagName: string;
      oldCode: string;
      newCode: string;
      oldAccountName: string;
      newAccountName: string;
    }> = [];
    
    for (const mapping of oldCodeMappings) {
      const oldCode = mapping.accountCode;
      const newCode = accountCodeMapping[oldCode as keyof typeof accountCodeMapping];
      
      if (newCode) {
        // 새로운 계정 정보 조회
        const newAccount = await prisma.chartOfAccounts.findUnique({
          where: { accountCode: newCode }
        });
        
        // 매핑 업데이트
        await prisma.tagAccountMapping.update({
          where: { id: mapping.id },
          data: {
            accountCode: newCode,
            accountName: newAccount?.accountName || '계정명 미확인'
          }
        });
        
        updateResults.push({
          tagName: mapping.tag.tagName,
          oldCode,
          newCode,
          oldAccountName: mapping.accountName,
          newAccountName: newAccount?.accountName || '계정명 미확인'
        });
        
        updatedCount++;
        console.log(`  ✓ ${mapping.tag.tagName}: ${oldCode}(${mapping.accountName}) → ${newCode}(${newAccount?.accountName})`);
      }
    }
    
    // 5. 비즈니스 태그별 최적화 매핑 적용
    console.log('\n🎯 비즈니스 태그별 최적화 매핑 적용 중...');
    
    let optimizedCount = 0;
    for (const [tagName, recommendedAccountCode] of Object.entries(businessTagMappings)) {
      const tag = await prisma.tagsMaster.findUnique({
        where: { tagName }
      });
      
      if (tag) {
        const existingMapping = await prisma.tagAccountMapping.findFirst({
          where: { tagId: tag.id }
        });
        
        if (existingMapping && existingMapping.accountCode !== recommendedAccountCode) {
          const recommendedAccount = await prisma.chartOfAccounts.findUnique({
            where: { accountCode: recommendedAccountCode }
          });
          
          if (recommendedAccount) {
            await prisma.tagAccountMapping.update({
              where: { id: existingMapping.id },
              data: {
                accountCode: recommendedAccountCode,
                accountName: recommendedAccount.accountName
              }
            });
            
            optimizedCount++;
            console.log(`  🎯 ${tagName}: ${existingMapping.accountCode} → ${recommendedAccountCode}(${recommendedAccount.accountName})`);
          }
        }
      }
    }
    
    // 6. 업데이트 결과 요약
    console.log('\n📊 업데이트 완료 요약:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ 기본 매핑 업데이트: ${updatedCount}개`);
    console.log(`🎯 비즈니스 최적화: ${optimizedCount}개`);
    console.log(`📋 총 처리된 매핑: ${updatedCount + optimizedCount}개`);
    
    // 7. 최종 검증
    const finalMappings = await prisma.tagAccountMapping.findMany({
      where: {
        accountCode: {
          in: Object.keys(accountCodeMapping)
        }
      }
    });
    
    if (finalMappings.length === 0) {
      console.log('✅ 모든 3자리 계정코드가 성공적으로 4자리로 변환되었습니다!');
    } else {
      console.log(`⚠️ 아직 ${finalMappings.length}개의 3자리 코드가 남아있습니다.`);
    }
    
    // 8. 업데이트된 매핑 통계
    const updatedStats = await Promise.all([
      prisma.tagAccountMapping.count({ where: { accountCode: { startsWith: '5' } } }), // 비용 계정
      prisma.tagAccountMapping.count(), // 전체 매핑 수
    ]);
    
    console.log('\n📈 업데이트 후 통계:');
    console.log(`비용 계정 매핑: ${updatedStats[0]}개`);
    console.log(`전체 매핑 수: ${updatedStats[1]}개`);
    
    console.log('\n🎉 태그-계정과목 매핑 업데이트가 완료되었습니다!');
    console.log('💡 다음 단계: yarn test __tests__/accounting/tag-account-mapping-update.test.ts');
    
  } catch (error) {
    console.error('❌ 매핑 업데이트 중 오류 발생:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
if (require.main === module) {
  updateTagAccountMappings()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { updateTagAccountMappings };