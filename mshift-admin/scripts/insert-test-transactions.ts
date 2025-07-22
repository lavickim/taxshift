import { PrismaClient } from '../lib/generated/prisma';

const prisma = new PrismaClient();

async function insertTestTransactions() {
  console.log('🧪 테스트 거래 데이터 생성 중...');

  try {
    // 테스트 거래 데이터 생성
    const testTransactions = [
      {
        id: 1,
        companyId: 'COMP001',
        rawText: '스타벅스 커피 결제 15,000원',
        transactionDate: new Date('2024-01-15'),
        amount: 15000,
        finalSuggestedTag: '커피전문점',
        finalDebitAccount: null,
        finalCreditAccount: null,
        transactionType: 'EXPENSE',
        status: 'PROCESSED'
      },
      {
        id: 2,
        companyId: 'COMP001',
        rawText: 'GS칼텍스 주유 80,000원',
        transactionDate: new Date('2024-01-16'),
        amount: 80000,
        finalSuggestedTag: '주유소',
        finalDebitAccount: null,
        finalCreditAccount: null,
        transactionType: 'EXPENSE',
        status: 'PROCESSED'
      },
      {
        id: 3,
        companyId: 'COMP001',
        rawText: '택시 이용료 25,000원',
        transactionDate: new Date('2024-01-17'),
        amount: 25000,
        finalSuggestedTag: '택시',
        finalDebitAccount: null,
        finalCreditAccount: null,
        transactionType: 'EXPENSE',
        status: 'PROCESSED'
      },
      {
        id: 4,
        companyId: 'COMP001',
        rawText: '편의점 사무용품 구매 12,000원',
        transactionDate: new Date('2024-01-18'),
        amount: 12000,
        finalSuggestedTag: '편의점',
        finalDebitAccount: null,
        finalCreditAccount: null,
        transactionType: 'EXPENSE',
        status: 'PROCESSED'
      },
      {
        id: 5,
        companyId: 'COMP001',
        rawText: '고객 서비스 매출 500,000원',
        transactionDate: new Date('2024-01-19'),
        amount: 500000,
        finalSuggestedTag: '서비스매출',
        finalDebitAccount: null,
        finalCreditAccount: null,
        transactionType: 'INCOME',
        status: 'PROCESSED'
      },
      {
        id: 6,
        companyId: 'COMP001',
        rawText: '통신비 결제 45,000원',
        transactionDate: new Date('2024-01-20'),
        amount: 45000,
        finalSuggestedTag: '통신',
        finalDebitAccount: null,
        finalCreditAccount: null,
        transactionType: 'EXPENSE',
        status: 'PROCESSED'
      },
      {
        id: 7,
        companyId: 'COMP001',
        rawText: '임차료 지급 300,000원',
        transactionDate: new Date('2024-01-21'),
        amount: 300000,
        finalSuggestedTag: '사무실임대',
        finalDebitAccount: null,
        finalCreditAccount: null,
        transactionType: 'EXPENSE',
        status: 'PROCESSED'
      },
      {
        id: 8,
        companyId: 'COMP001',
        rawText: '직원 급여 지급 2,000,000원',
        transactionDate: new Date('2024-01-25'),
        amount: 2000000,
        finalSuggestedTag: '급여',
        finalDebitAccount: null,
        finalCreditAccount: null,
        transactionType: 'EXPENSE',
        status: 'PROCESSED'
      }
    ];

    // 기존 데이터 삭제 (ID 충돌 방지)
    await prisma.transactions.deleteMany({
      where: {
        id: { in: testTransactions.map(t => t.id) }
      }
    });

    // 새 데이터 삽입
    for (const transaction of testTransactions) {
      await prisma.transactions.create({
        data: {
          id: transaction.id,
          company_id: transaction.companyId,
          raw_text: transaction.rawText,
          transaction_date: transaction.transactionDate,
          amount: transaction.amount,
          final_suggested_tag: transaction.finalSuggestedTag,
          final_debit_account: transaction.finalDebitAccount,
          final_credit_account: transaction.finalCreditAccount,
          transaction_type: transaction.transactionType,
          status: transaction.status,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
    }

    console.log(`✅ ${testTransactions.length}개의 테스트 거래 데이터가 성공적으로 생성되었습니다.`);

    // 생성된 데이터 확인
    const count = await prisma.transactions.count({
      where: { company_id: 'COMP001' }
    });
    console.log(`📊 COMP001 회사의 총 거래 수: ${count}개`);

    // 각 거래별 요약 출력
    console.log('\n📝 생성된 거래 요약:');
    for (const transaction of testTransactions) {
      console.log(`ID ${transaction.id}: ${transaction.finalSuggestedTag} - ${transaction.amount.toLocaleString()}원 (${transaction.transactionType})`);
    }

  } catch (error) {
    console.error('❌ 테스트 거래 데이터 생성 실패:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
if (require.main === module) {
  insertTestTransactions()
    .then(() => {
      console.log('🎉 테스트 거래 데이터 생성 완료!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 스크립트 실행 실패:', error);
      process.exit(1);
    });
}

export { insertTestTransactions };