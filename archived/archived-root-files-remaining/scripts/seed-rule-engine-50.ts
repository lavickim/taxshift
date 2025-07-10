import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('50개의 실제 사용 가능한 룰 생성 시작...');

  // 기존 데이터 삭제
  await prisma.ruleEngineFeedback.deleteMany();
  await prisma.ruleEngineCandidate.deleteMany();
  await prisma.ruleEngine.deleteMany();

  // 50개의 실제 룰 데이터 생성
  const rules = await prisma.ruleEngine.createMany({
    data: [
      // 카페/음료
      {
        keyword: '스타벅스',
        confidence: 85,
        question: '스타벅스 지출의 목적은 무엇인가요?',
        primaryTag: '#접대비',
        primaryAccount: '접대비',
        secondaryTag: '#복리후생비',
        secondaryAccount: '복리후생비',
        createdBy: 'ADMIN'
      },
      {
        keyword: '이디야',
        confidence: 85,
        question: '이디야커피 지출의 목적은 무엇인가요?',
        primaryTag: '#접대비',
        primaryAccount: '접대비',
        secondaryTag: '#복리후생비',
        secondaryAccount: '복리후생비',
        createdBy: 'ADMIN'
      },
      {
        keyword: '투썸',
        confidence: 85,
        question: '투썸플레이스 지출의 목적은 무엇인가요?',
        primaryTag: '#접대비',
        primaryAccount: '접대비',
        secondaryTag: '#복리후생비',
        secondaryAccount: '복리후생비',
        createdBy: 'ADMIN'
      },
      {
        keyword: '커피빈',
        confidence: 85,
        question: '커피빈 지출의 목적은 무엇인가요?',
        primaryTag: '#접대비',
        primaryAccount: '접대비',
        secondaryTag: '#복리후생비',
        secondaryAccount: '복리후생비',
        createdBy: 'ADMIN'
      },
      {
        keyword: '할리스',
        confidence: 85,
        question: '할리스커피 지출의 목적은 무엇인가요?',
        primaryTag: '#접대비',
        primaryAccount: '접대비',
        secondaryTag: '#복리후생비',
        secondaryAccount: '복리후생비',
        createdBy: 'ADMIN'
      },

      // 교통/운송
      {
        keyword: '택시',
        confidence: 95,
        primaryTag: '#교통비',
        primaryAccount: '여비교통비',
        createdBy: 'ADMIN'
      },
      {
        keyword: '카카오택시',
        confidence: 95,
        primaryTag: '#교통비',
        primaryAccount: '여비교통비',
        createdBy: 'ADMIN'
      },
      {
        keyword: '티머니',
        confidence: 95,
        primaryTag: '#교통비',
        primaryAccount: '여비교통비',
        createdBy: 'ADMIN'
      },
      {
        keyword: '주유',
        confidence: 90,
        primaryTag: '#차량유지비',
        primaryAccount: '차량유지비',
        createdBy: 'ADMIN'
      },
      {
        keyword: 'SK에너지',
        confidence: 90,
        primaryTag: '#차량유지비',
        primaryAccount: '차량유지비',
        createdBy: 'ADMIN'
      },
      {
        keyword: 'GS칼텍스',
        confidence: 90,
        primaryTag: '#차량유지비',
        primaryAccount: '차량유지비',
        createdBy: 'ADMIN'
      },
      {
        keyword: 'S-OIL',
        confidence: 90,
        primaryTag: '#차량유지비',
        primaryAccount: '차량유지비',
        createdBy: 'ADMIN'
      },

      // 편의점
      {
        keyword: 'CU',
        confidence: 70,
        question: 'CU 편의점 구매의 용도는 무엇인가요?',
        primaryTag: '#사무용품비',
        primaryAccount: '소모품비',
        secondaryTag: '#복리후생비',
        secondaryAccount: '복리후생비',
        createdBy: 'ADMIN'
      },
      {
        keyword: 'GS25',
        confidence: 70,
        question: 'GS25 편의점 구매의 용도는 무엇인가요?',
        primaryTag: '#사무용품비',
        primaryAccount: '소모품비',
        secondaryTag: '#복리후생비',
        secondaryAccount: '복리후생비',
        createdBy: 'ADMIN'
      },
      {
        keyword: '세븐일레븐',
        confidence: 70,
        question: '세븐일레븐 구매의 용도는 무엇인가요?',
        primaryTag: '#사무용품비',
        primaryAccount: '소모품비',
        secondaryTag: '#복리후생비',
        secondaryAccount: '복리후생비',
        createdBy: 'ADMIN'
      },
      {
        keyword: '이마트24',
        confidence: 70,
        question: '이마트24 구매의 용도는 무엇인가요?',
        primaryTag: '#사무용품비',
        primaryAccount: '소모품비',
        secondaryTag: '#복리후생비',
        secondaryAccount: '복리후생비',
        createdBy: 'ADMIN'
      },

      // 온라인 쇼핑
      {
        keyword: '쿠팡',
        confidence: 75,
        question: '쿠팡 구매의 용도는 무엇인가요?',
        primaryTag: '#사무용품비',
        primaryAccount: '소모품비',
        secondaryTag: '#복리후생비',
        secondaryAccount: '복리후생비',
        createdBy: 'ADMIN'
      },
      {
        keyword: '11번가',
        confidence: 75,
        question: '11번가 구매의 용도는 무엇인가요?',
        primaryTag: '#사무용품비',
        primaryAccount: '소모품비',
        secondaryTag: '#복리후생비',
        secondaryAccount: '복리후생비',
        createdBy: 'ADMIN'
      },
      {
        keyword: 'G마켓',
        confidence: 75,
        question: 'G마켓 구매의 용도는 무엇인가요?',
        primaryTag: '#사무용품비',
        primaryAccount: '소모품비',
        secondaryTag: '#복리후생비',
        secondaryAccount: '복리후생비',
        createdBy: 'ADMIN'
      },
      {
        keyword: '네이버페이',
        confidence: 70,
        question: '네이버페이 결제의 용도는 무엇인가요?',
        primaryTag: '#기타경비',
        primaryAccount: '잡비',
        secondaryTag: '#사무용품비',
        secondaryAccount: '소모품비',
        createdBy: 'ADMIN'
      },

      // 마트/대형마트
      {
        keyword: '이마트',
        confidence: 75,
        question: '이마트 구매의 용도는 무엇인가요?',
        primaryTag: '#복리후생비',
        primaryAccount: '복리후생비',
        secondaryTag: '#사무용품비',
        secondaryAccount: '소모품비',
        createdBy: 'ADMIN'
      },
      {
        keyword: '홈플러스',
        confidence: 75,
        question: '홈플러스 구매의 용도는 무엇인가요?',
        primaryTag: '#복리후생비',
        primaryAccount: '복리후생비',
        secondaryTag: '#사무용품비',
        secondaryAccount: '소모품비',
        createdBy: 'ADMIN'
      },
      {
        keyword: '롯데마트',
        confidence: 75,
        question: '롯데마트 구매의 용도는 무엇인가요?',
        primaryTag: '#복리후생비',
        primaryAccount: '복리후생비',
        secondaryTag: '#사무용품비',
        secondaryAccount: '소모품비',
        createdBy: 'ADMIN'
      },
      {
        keyword: '코스트코',
        confidence: 80,
        question: '코스트코 구매의 용도는 무엇인가요?',
        primaryTag: '#복리후생비',
        primaryAccount: '복리후생비',
        secondaryTag: '#사무용품비',
        secondaryAccount: '소모품비',
        createdBy: 'ADMIN'
      },

      // 음식/배달
      {
        keyword: '배달의민족',
        confidence: 80,
        question: '배달의민족 주문의 목적은 무엇인가요?',
        primaryTag: '#접대비',
        primaryAccount: '접대비',
        secondaryTag: '#복리후생비',
        secondaryAccount: '복리후생비',
        createdBy: 'ADMIN'
      },
      {
        keyword: '요기요',
        confidence: 80,
        question: '요기요 주문의 목적은 무엇인가요?',
        primaryTag: '#접대비',
        primaryAccount: '접대비',
        secondaryTag: '#복리후생비',
        secondaryAccount: '복리후생비',
        createdBy: 'ADMIN'
      },
      {
        keyword: '쿠팡이츠',
        confidence: 80,
        question: '쿠팡이츠 주문의 목적은 무엇인가요?',
        primaryTag: '#접대비',
        primaryAccount: '접대비',
        secondaryTag: '#복리후생비',
        secondaryAccount: '복리후생비',
        createdBy: 'ADMIN'
      },

      // 사무용품
      {
        keyword: '다이소',
        confidence: 85,
        primaryTag: '#사무용품비',
        primaryAccount: '소모품비',
        createdBy: 'ADMIN'
      },
      {
        keyword: '알파문구',
        confidence: 90,
        primaryTag: '#사무용품비',
        primaryAccount: '소모품비',
        createdBy: 'ADMIN'
      },
      {
        keyword: '오피스디포',
        confidence: 90,
        primaryTag: '#사무용품비',
        primaryAccount: '소모품비',
        createdBy: 'ADMIN'
      },

      // 통신비
      {
        keyword: 'SKT',
        confidence: 95,
        primaryTag: '#통신비',
        primaryAccount: '통신비',
        createdBy: 'ADMIN'
      },
      {
        keyword: 'KT',
        confidence: 95,
        primaryTag: '#통신비',
        primaryAccount: '통신비',
        createdBy: 'ADMIN'
      },
      {
        keyword: 'LGU+',
        confidence: 95,
        primaryTag: '#통신비',
        primaryAccount: '통신비',
        createdBy: 'ADMIN'
      },
      {
        keyword: 'LG유플러스',
        confidence: 95,
        primaryTag: '#통신비',
        primaryAccount: '통신비',
        createdBy: 'ADMIN'
      },

      // 보험/금융
      {
        keyword: '국민건강보험',
        confidence: 95,
        primaryTag: '#복리후생비',
        primaryAccount: '복리후생비',
        createdBy: 'ADMIN'
      },
      {
        keyword: '국민연금',
        confidence: 95,
        primaryTag: '#복리후생비',
        primaryAccount: '복리후생비',
        createdBy: 'ADMIN'
      },
      {
        keyword: '고용보험',
        confidence: 95,
        primaryTag: '#복리후생비',
        primaryAccount: '복리후생비',
        createdBy: 'ADMIN'
      },
      {
        keyword: '산재보험',
        confidence: 95,
        primaryTag: '#복리후생비',
        primaryAccount: '복리후생비',
        createdBy: 'ADMIN'
      },

      // 숙박
      {
        keyword: '호텔',
        confidence: 85,
        question: '호텔 비용의 목적은 무엇인가요?',
        primaryTag: '#출장비',
        primaryAccount: '여비교통비',
        secondaryTag: '#접대비',
        secondaryAccount: '접대비',
        createdBy: 'ADMIN'
      },
      {
        keyword: '모텔',
        confidence: 85,
        question: '숙박 비용의 목적은 무엇인가요?',
        primaryTag: '#출장비',
        primaryAccount: '여비교통비',
        secondaryTag: '#접대비',
        secondaryAccount: '접대비',
        createdBy: 'ADMIN'
      },
      {
        keyword: '에어비앤비',
        confidence: 85,
        question: '에어비앤비 숙박의 목적은 무엇인가요?',
        primaryTag: '#출장비',
        primaryAccount: '여비교통비',
        secondaryTag: '#접대비',
        secondaryAccount: '접대비',
        createdBy: 'ADMIN'
      },

      // IT/소프트웨어
      {
        keyword: '구글',
        confidence: 90,
        primaryTag: '#IT비용',
        primaryAccount: '지급수수료',
        createdBy: 'ADMIN'
      },
      {
        keyword: '마이크로소프트',
        confidence: 90,
        primaryTag: '#IT비용',
        primaryAccount: '지급수수료',
        createdBy: 'ADMIN'
      },
      {
        keyword: '어도비',
        confidence: 90,
        primaryTag: '#IT비용',
        primaryAccount: '지급수수료',
        createdBy: 'ADMIN'
      },
      {
        keyword: '네이버클라우드',
        confidence: 90,
        primaryTag: '#IT비용',
        primaryAccount: '지급수수료',
        createdBy: 'ADMIN'
      },
      {
        keyword: 'AWS',
        confidence: 90,
        primaryTag: '#IT비용',
        primaryAccount: '지급수수료',
        createdBy: 'ADMIN'
      },

      // 교육/도서
      {
        keyword: '교보문고',
        confidence: 85,
        question: '교보문고 구매의 목적은 무엇인가요?',
        primaryTag: '#교육훈련비',
        primaryAccount: '교육훈련비',
        secondaryTag: '#도서인쇄비',
        secondaryAccount: '도서인쇄비',
        createdBy: 'ADMIN'
      },
      {
        keyword: '예스24',
        confidence: 85,
        question: '예스24 구매의 목적은 무엇인가요?',
        primaryTag: '#교육훈련비',
        primaryAccount: '교육훈련비',
        secondaryTag: '#도서인쇄비',
        secondaryAccount: '도서인쇄비',
        createdBy: 'ADMIN'
      },
      {
        keyword: '알라딘',
        confidence: 85,
        question: '알라딘 구매의 목적은 무엇인가요?',
        primaryTag: '#교육훈련비',
        primaryAccount: '교육훈련비',
        secondaryTag: '#도서인쇄비',
        secondaryAccount: '도서인쇄비',
        createdBy: 'ADMIN'
      },

      // 택배/물류
      {
        keyword: '우체국',
        confidence: 90,
        primaryTag: '#운반비',
        primaryAccount: '운반비',
        createdBy: 'ADMIN'
      },
      {
        keyword: 'CJ대한통운',
        confidence: 90,
        primaryTag: '#운반비',
        primaryAccount: '운반비',
        createdBy: 'ADMIN'
      },
      {
        keyword: '한진택배',
        confidence: 90,
        primaryTag: '#운반비',
        primaryAccount: '운반비',
        createdBy: 'ADMIN'
      },
      {
        keyword: '로젠택배',
        confidence: 90,
        primaryTag: '#운반비',
        primaryAccount: '운반비',
        createdBy: 'ADMIN'
      }
    ]
  });

  console.log(`${rules.count}개의 룰이 생성되었습니다.`);

  // 몇 개의 룰 후보도 추가
  const candidates = await prisma.ruleEngineCandidate.createMany({
    data: [
      {
        keyword: '올리브영',
        tag: '#복리후생비',
        account: '복리후생비',
        suggestionCount: 7,
        firstSuggested: new Date('2024-01-14'),
        lastSuggested: new Date('2024-01-16')
      },
      {
        keyword: '맥도날드',
        tag: '#복리후생비',
        account: '복리후생비',
        suggestionCount: 5,
        firstSuggested: new Date('2024-01-12'),
        lastSuggested: new Date('2024-01-15')
      },
      {
        keyword: 'CGV',
        tag: '#복리후생비',
        account: '복리후생비',
        suggestionCount: 3,
        firstSuggested: new Date('2024-01-13'),
        lastSuggested: new Date('2024-01-16')
      }
    ]
  });

  console.log(`${candidates.count}개의 룰 후보가 생성되었습니다.`);
  console.log('50개의 실제 사용 가능한 룰 생성 완료!');
}

main()
  .catch((e) => {
    console.error('오류 발생:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 