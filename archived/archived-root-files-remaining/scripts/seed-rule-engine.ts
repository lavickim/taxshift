import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('룰엔진 초기 데이터 생성 시작...');

  // 기존 데이터 삭제
  await prisma.ruleEngineFeedback.deleteMany();
  await prisma.ruleEngineCandidate.deleteMany();
  await prisma.ruleEngine.deleteMany();

  // 초기 룰 데이터 생성
  const rules = await prisma.ruleEngine.createMany({
    data: [
      {
        keyword: '스타벅스',
        confidence: 85,
        question: '이 스타벅스 지출의 목적은 무엇인가요?',
        primaryTag: '#접대비',
        primaryAccount: '접대비',
        secondaryTag: '#복리후생비',
        secondaryAccount: '복리후생비',
        usageCount: 152,
        positiveCount: 120,
        negativeCount: 32,
        lastUsed: new Date('2024-01-15'),
        createdBy: 'ADMIN'
      },
      {
        keyword: '택시',
        confidence: 95,
        primaryTag: '#교통비',
        primaryAccount: '여비교통비',
        usageCount: 320,
        positiveCount: 304,
        negativeCount: 16,
        lastUsed: new Date('2024-01-16'),
        createdBy: 'ADMIN'
      },
      {
        keyword: '편의점',
        confidence: 70,
        question: '편의점 구매 내역의 용도는 무엇인가요?',
        primaryTag: '#사무용품비',
        primaryAccount: '소모품비',
        secondaryTag: '#복리후생비',
        secondaryAccount: '복리후생비',
        usageCount: 89,
        positiveCount: 62,
        negativeCount: 27,
        lastUsed: new Date('2024-01-14'),
        createdBy: 'ADMIN'
      },
      {
        keyword: 'CU',
        confidence: 72,
        question: 'CU 편의점 구매 내역의 용도는 무엇인가요?',
        primaryTag: '#사무용품비',
        primaryAccount: '소모품비',
        secondaryTag: '#복리후생비',
        secondaryAccount: '복리후생비',
        usageCount: 45,
        positiveCount: 32,
        negativeCount: 13,
        lastUsed: new Date('2024-01-13'),
        createdBy: 'ADMIN'
      },
      {
        keyword: '쿠팡',
        confidence: 80,
        question: '쿠팡 구매 내역의 용도는 무엇인가요?',
        primaryTag: '#사무용품비',
        primaryAccount: '소모품비',
        secondaryTag: '#복리후생비',
        secondaryAccount: '복리후생비',
        usageCount: 78,
        positiveCount: 62,
        negativeCount: 16,
        lastUsed: new Date('2024-01-16'),
        createdBy: 'ADMIN'
      }
    ]
  });

  console.log(`${rules.count}개의 룰이 생성되었습니다.`);

  // 초기 룰 후보 데이터 생성
  const candidates = await prisma.ruleEngineCandidate.createMany({
    data: [
      {
        keyword: '이마트',
        tag: '#복리후생비',
        account: '복리후생비',
        suggestionCount: 8,
        firstSuggested: new Date('2024-01-10'),
        lastSuggested: new Date('2024-01-16')
      },
      {
        keyword: '다이소',
        tag: '#사무용품비',
        account: '소모품비',
        suggestionCount: 6,
        firstSuggested: new Date('2024-01-12'),
        lastSuggested: new Date('2024-01-15')
      },
      {
        keyword: '올리브영',
        tag: '#복리후생비',
        account: '복리후생비',
        suggestionCount: 4,
        firstSuggested: new Date('2024-01-14'),
        lastSuggested: new Date('2024-01-16')
      },
      {
        keyword: '배달의민족',
        tag: '#접대비',
        account: '접대비',
        suggestionCount: 9,
        firstSuggested: new Date('2024-01-08'),
        lastSuggested: new Date('2024-01-16')
      },
      {
        keyword: '네이버페이',
        tag: '#기타경비',
        account: '잡비',
        suggestionCount: 3,
        firstSuggested: new Date('2024-01-15'),
        lastSuggested: new Date('2024-01-16')
      }
    ]
  });

  console.log(`${candidates.count}개의 룰 후보가 생성되었습니다.`);
  console.log('룰엔진 초기 데이터 생성 완료!');
}

main()
  .catch((e) => {
    console.error('오류 발생:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 