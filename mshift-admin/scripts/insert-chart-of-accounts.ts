#!/usr/bin/env ts-node

/**
 * 기본 회계 계정과목 데이터 삽입 스크립트
 * 표준 계정과목 체계를 데이터베이스에 생성합니다.
 */

const { PrismaClient } = require('../lib/generated/prisma');

const prisma = new PrismaClient();

const basicAccounts = [
  // 자산 계정 (1000번대)
  { accountCode: '1110', accountName: '현금', accountType: '자산' as const, accountSubtype: '유동자산', isDebitNormal: true, displayOrder: 10 },
  { accountCode: '1120', accountName: '보통예금', accountType: '자산' as const, accountSubtype: '유동자산', isDebitNormal: true, displayOrder: 20 },
  { accountCode: '1130', accountName: '미수금', accountType: '자산' as const, accountSubtype: '유동자산', isDebitNormal: true, displayOrder: 30 },
  { accountCode: '1140', accountName: '선급금', accountType: '자산' as const, accountSubtype: '유동자산', isDebitNormal: true, displayOrder: 40 },
  { accountCode: '1150', accountName: '재고자산', accountType: '자산' as const, accountSubtype: '유동자산', isDebitNormal: true, displayOrder: 50 },
  
  // 비유동자산
  { accountCode: '1210', accountName: '건물', accountType: '자산' as const, accountSubtype: '비유동자산', isDebitNormal: true, displayOrder: 60 },
  { accountCode: '1220', accountName: '차량운반구', accountType: '자산' as const, accountSubtype: '비유동자산', isDebitNormal: true, displayOrder: 70 },
  { accountCode: '1230', accountName: '비품', accountType: '자산' as const, accountSubtype: '비유동자산', isDebitNormal: true, displayOrder: 80 },
  
  // 부채 계정 (2000번대)
  { accountCode: '2110', accountName: '미지급금', accountType: '부채' as const, accountSubtype: '유동부채', isDebitNormal: false, displayOrder: 90 },
  { accountCode: '2120', accountName: '선수금', accountType: '부채' as const, accountSubtype: '유동부채', isDebitNormal: false, displayOrder: 100 },
  { accountCode: '2130', accountName: '단기차입금', accountType: '부채' as const, accountSubtype: '유동부채', isDebitNormal: false, displayOrder: 110 },
  { accountCode: '2140', accountName: '미지급비용', accountType: '부채' as const, accountSubtype: '유동부채', isDebitNormal: false, displayOrder: 120 },
  
  // 비유동부채  
  { accountCode: '2210', accountName: '장기차입금', accountType: '부채' as const, accountSubtype: '비유동부채', isDebitNormal: false, displayOrder: 130 },
  
  // 자본 계정 (3000번대)
  { accountCode: '3110', accountName: '자본금', accountType: '자본' as const, accountSubtype: '자본금', isDebitNormal: false, displayOrder: 140 },
  { accountCode: '3120', accountName: '이익잉여금', accountType: '자본' as const, accountSubtype: '잉여금', isDebitNormal: false, displayOrder: 150 },
  
  // 수익 계정 (4000번대)
  { accountCode: '4110', accountName: '매출', accountType: '수익' as const, accountSubtype: '영업수익', isDebitNormal: false, displayOrder: 160 },
  { accountCode: '4120', accountName: '기타수익', accountType: '수익' as const, accountSubtype: '영업외수익', isDebitNormal: false, displayOrder: 170 },
  
  // 비용 계정 (5000번대) - 판매관리비
  { accountCode: '5110', accountName: '접대비', accountType: '비용' as const, accountSubtype: '판매관리비', isDebitNormal: true, displayOrder: 180 },
  { accountCode: '5120', accountName: '복리후생비', accountType: '비용' as const, accountSubtype: '판매관리비', isDebitNormal: true, displayOrder: 190 },
  { accountCode: '5130', accountName: '소모품비', accountType: '비용' as const, accountSubtype: '판매관리비', isDebitNormal: true, displayOrder: 200 },
  { accountCode: '5140', accountName: '차량유지비', accountType: '비용' as const, accountSubtype: '판매관리비', isDebitNormal: true, displayOrder: 210 },
  { accountCode: '5150', accountName: '통신비', accountType: '비용' as const, accountSubtype: '판매관리비', isDebitNormal: true, displayOrder: 220 },
  { accountCode: '5160', accountName: '임차료', accountType: '비용' as const, accountSubtype: '판매관리비', isDebitNormal: true, displayOrder: 230 },
  { accountCode: '5170', accountName: '교육훈련비', accountType: '비용' as const, accountSubtype: '판매관리비', isDebitNormal: true, displayOrder: 240 },
  { accountCode: '5180', accountName: '광고선전비', accountType: '비용' as const, accountSubtype: '판매관리비', isDebitNormal: true, displayOrder: 250 },
  { accountCode: '5190', accountName: '보험료', accountType: '비용' as const, accountSubtype: '판매관리비', isDebitNormal: true, displayOrder: 260 },
  { accountCode: '5200', accountName: '인건비', accountType: '비용' as const, accountSubtype: '판매관리비', isDebitNormal: true, displayOrder: 270 },
  
  // 추가 비용 계정
  { accountCode: '5210', accountName: '의료비', accountType: '비용' as const, accountSubtype: '판매관리비', isDebitNormal: true, displayOrder: 280 },
  { accountCode: '5220', accountName: '세금과공과', accountType: '비용' as const, accountSubtype: '판매관리비', isDebitNormal: true, displayOrder: 290 },
  { accountCode: '5230', accountName: '차량관련비', accountType: '비용' as const, accountSubtype: '판매관리비', isDebitNormal: true, displayOrder: 300 },
  
  // 특별 계정 - 조건부 사용
  { accountCode: '5510', accountName: '야근식대', accountType: '비용' as const, accountSubtype: '복리후생비', isDebitNormal: true, displayOrder: 310 },
];

async function insertChartOfAccounts() {
  console.log('🏗️  기본 회계 계정과목 데이터 삽입 시작...');
  
  try {
    // 기존 데이터 확인
    const existingCount = await prisma.chartOfAccounts.count();
    console.log(`📊 기존 계정과목 수: ${existingCount}개`);
    
    if (existingCount > 0) {
      console.log('⚠️  이미 계정과목 데이터가 존재합니다. 덮어쓰시겠습니까? (중복 방지를 위해 스킵)');
      return;
    }
    
    // 배치 삽입
    const result = await prisma.chartOfAccounts.createMany({
      data: basicAccounts,
      skipDuplicates: true, // 중복 방지
    });
    
    console.log(`✅ 성공적으로 ${result.count}개 계정과목을 생성했습니다.`);
    
    // 생성된 계정과목 확인
    const accounts = await prisma.chartOfAccounts.findMany({
      orderBy: { displayOrder: 'asc' },
      select: {
        accountCode: true,
        accountName: true,
        accountType: true,
        accountSubtype: true,
      }
    });
    
    console.log('\n📋 생성된 계정과목 목록:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    accounts.forEach((account: any) => {
      console.log(`${account.accountCode} | ${account.accountName.padEnd(12)} | ${account.accountType} - ${account.accountSubtype || ''}`);
    });
    
    console.log('\n🎉 기본 회계 계정과목 설정이 완료되었습니다!');
    
  } catch (error) {
    console.error('❌ 계정과목 삽입 중 오류 발생:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
if (require.main === module) {
  insertChartOfAccounts()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { insertChartOfAccounts };