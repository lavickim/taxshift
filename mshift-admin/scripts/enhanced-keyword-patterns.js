#!/usr/bin/env node

/**
 * 향상된 키워드 패턴 - 대규모 테스트 결과를 반영한 확장된 패턴
 */

// 1063개 테스트 결과를 분석해서 누락된 패턴들을 대폭 추가
const ENHANCED_KEYWORD_PATTERNS = {
  // 편의점
  '편의점': {
    keywords: [
      '세븐일레븐', '7ELEVEN', '7-ELEVEN', '711', '7-11', '7ELV', '7일레븐',
      'CU', 'CU편의점', 'CU점', '시유', 'BGF리테일',
      'GS25', 'GS이십오', 'GS25편의점', 'GS25점', 'GS-25',
      '이마트24', 'EMART24', 'E마트24', '이마트이십사', '이마트편의점',
      '미니스톱', 'MINISTOP', '미니스톱편의점',
      '바이더웨이', '코리아세븐', '위드미', '스토리웨이'
    ],
    tag: '편의점',
    accountCode: '622',
    accountName: '차량유지비',
    confidence: 0.95
  },
  
  // 주유소
  '주유소': {
    keywords: [
      'GS칼텍스', 'GSCALTEX', '지에스칼텍스', 'GS주유소', 'GS석유',
      'SK에너지', 'SKENERGY', '에스케이에너지', 'SK주유소', 'SK석유',
      '현대오일뱅크', 'HYUNDAIOILBANK', '오일뱅크', '현대주유소', '현대석유',
      'S-Oil', 'SOIL', '에스오일', 'S오일', '쌍용석유',
      '주유소', '주유', '석유', '기름', '셀프주유소', '무인주유소', '24시간주유소'
    ],
    tag: '주유소',
    accountCode: '622',
    accountName: '차량유지비',
    confidence: 0.95
  },
  
  // 치킨 전문점 (새로운 카테고리)
  '치킨': {
    keywords: [
      'BBQ', '비비큐', '굽네치킨', 'GOOBNE', '네네치킨', 'NENE',
      '교촌치킨', 'KYOCHON', '처갓집양념치킨', '맘스터치', 'MOM\'S TOUCH',
      '멕시카나', 'MEXICANA', '치킨', '통닭', '양념치킨', '후라이드치킨'
    ],
    tag: '치킨전문점',
    accountCode: '651',
    accountName: '접대비',
    confidence: 0.92
  },
  
  // 패스트푸드/버거
  '패스트푸드': {
    keywords: [
      '맥도날드', 'McDonalds', '맥날', 'MCD',
      '롯데리아', 'LOTTERIA', '롯데버거',
      '버거킹', 'BURGERKING', 'BK',
      'KFC', '켄터키', '케이에프씨',
      '서브웨이', 'SUBWAY'
    ],
    tag: '패스트푸드',
    accountCode: '651',
    accountName: '접대비',
    confidence: 0.92
  },
  
  // 한식/일반음식점
  '한식음식점': {
    keywords: [
      '백종원의본가', '본죽&비빔밥', '본죽', '비빔밥',
      '김밥천국', '컵밥마차', '한솥도시락', '원조할머니보쌈',
      '중국집', '홍콩반점', '차이나타운',
      '신전떡볶이', '엽기떡볶이', '죠스떡볶이', '떡볶이',
      '청년다방', '투다리', '음식점', '식당', '레스토랑'
    ],
    tag: '한식음식점',
    accountCode: '651',
    accountName: '접대비',
    confidence: 0.88
  },
  
  // 피자
  '피자': {
    keywords: [
      '피자헛', 'PIZZAHUT', '도미노피자', 'DOMINOS', '도미노',
      '파파존스', '미스터피자', '청년피자', '피자마루',
      '피자에땅', '피자', 'PIZZA'
    ],
    tag: '피자전문점',
    accountCode: '651',
    accountName: '접대비',
    confidence: 0.90
  },
  
  // 카페
  '카페': {
    keywords: [
      '스타벅스', 'STARBUCKS', '스벅',
      '투썸플레이스', 'A-TWOSOME', '투썸',
      '이디야커피', 'EDIYA', '이디야',
      '커피빈', 'COFFEEBEAN',
      '할리스커피', 'HOLLYS',
      '파스쿠찌', 'PASCUCCI',
      '엔젤리너스', 'ANGELINUS',
      '빽다방', 'PAIK',
      '공차', 'GONG CHA',
      '카페', '커피', 'COFFEE', 'CAFE'
    ],
    tag: '카페',
    accountCode: '651',
    accountName: '접대비',
    confidence: 0.90
  },
  
  // 대형마트
  '마트': {
    keywords: [
      '이마트', 'EMART', 'E마트', '신세계마트',
      '롯데마트', 'LOTTEMART', '롯데',
      '홈플러스', 'HOMEPLUS',
      '코스트코', 'COSTCO',
      '현대백화점', '신세계백화점', '롯데백화점', '갤러리아백화점',
      'AK플라자', '더현대서울', '마트', '백화점', '쇼핑센터'
    ],
    tag: '마트',
    accountCode: '111',
    accountName: '식료품비',
    confidence: 0.95
  },
  
  // 온라인쇼핑
  '온라인쇼핑': {
    keywords: [
      '쿠팡', 'COUPANG', '11번가', '11ST', '일일번가',
      '지마켓', 'GMARKET', '옥션', 'AUCTION',
      '티몬', 'TMON', 'TICKET MONSTER',
      '위메프', 'WEMAKEPRICE', 'WMP',
      '네이버쇼핑', '카카오쇼핑', 'SSG닷컴', '현대Hmall', '롯데iMall'
    ],
    tag: '온라인쇼핑',
    accountCode: '634',
    accountName: '소모품비',
    confidence: 0.85
  },
  
  // 교통
  '교통': {
    keywords: [
      '지하철', 'SUBWAY', '전철', '도시철도',
      '버스', 'BUS', '시내버스', '시외버스', '고속버스', '광역버스',
      '택시', 'TAXI', '카카오택시', '우버', '타다',
      '톨게이트', 'TOLLGATE', '고속도로', '통행료',
      '교통카드', 'T머니', '캐시비', '한페이', 'U패스', '위체크',
      'KTX', 'SRT', '새마을호', '무궁화호', '기차', '열차'
    ],
    tag: '교통',
    accountCode: '611',
    accountName: '여비교통비',
    confidence: 0.90
  },
  
  // 의료
  '의료': {
    keywords: [
      '병원', 'HOSPITAL', '의원', '클리닉',
      '약국', 'PHARMACY', '치과', 'DENTAL', '치과의원',
      '삼성서울병원', '서울대학교병원', '세브란스병원', '서울성모병원',
      '강남세브란스병원', '서울아산병원', '고려대학교안암병원',
      '온누리약국', '하나약국', '동아약국'
    ],
    tag: '의료',
    accountCode: '999',
    accountName: '의료비',
    confidence: 0.90
  },
  
  // 금융
  '금융': {
    keywords: [
      'ATM', '현금인출기', 'CD기', '계좌이체', '이체', '송금',
      '신용카드', '체크카드', '직불카드', '선불카드',
      'KB국민은행', '신한은행', '우리은행', '하나은행', 'NH농협은행',
      'IBK기업은행', '케이뱅크', '카카오뱅크', '토스뱅크',
      '수수료', '이체수수료', 'ATM수수료', '타행수수료'
    ],
    tag: '금융',
    accountCode: '999',
    accountName: '금융수수료',
    confidence: 0.95
  },
  
  // 통신/인터넷
  '통신': {
    keywords: [
      'KT', 'SK', 'LG', 'LGU+', 'olleh', '유플러스',
      '인터넷', 'WIFI', '휴대폰', '핸드폰', '스마트폰',
      '통신비', '인터넷요금', '핸드폰요금', 'IPTV'
    ],
    tag: '통신비',
    accountCode: '634',
    accountName: '통신비',
    confidence: 0.95
  },
  
  // 주차
  '주차': {
    keywords: [
      '주차', '주차장', '주차료', '주차비', '발렛파킹', '주차요금',
      'PARKING', '주차타워', '공영주차장', '유료주차장'
    ],
    tag: '주차비',
    accountCode: '611',
    accountName: '여비교통비',
    confidence: 0.92
  }
};

/**
 * 향상된 키워드 기반 거래 분류
 */
function classifyTransactionEnhanced(description) {
  const normalizedDescription = description.toLowerCase();
  
  for (const [category, pattern] of Object.entries(ENHANCED_KEYWORD_PATTERNS)) {
    for (const keyword of pattern.keywords) {
      if (normalizedDescription.includes(keyword.toLowerCase())) {
        return {
          matched: true,
          category,
          tag: pattern.tag,
          accountCode: pattern.accountCode,
          accountName: pattern.accountName,
          confidence: pattern.confidence,
          matchedKeyword: keyword,
          processingPath: 'keyword'
        };
      }
    }
  }
  
  return {
    matched: false,
    category: null,
    tag: null,
    accountCode: null,
    accountName: null,
    confidence: 0,
    matchedKeyword: null,
    processingPath: 'unmatched'
  };
}

module.exports = {
  ENHANCED_KEYWORD_PATTERNS,
  classifyTransactionEnhanced
};