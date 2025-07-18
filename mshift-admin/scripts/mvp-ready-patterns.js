#!/usr/bin/env node

/**
 * MVP 런칭 준비를 위한 최종 키워드 패턴
 * 75%+ 목표 달성을 위한 마지막 보강
 */

const { ENHANCED_KEYWORD_PATTERNS } = require('./enhanced-keyword-patterns.js');
const { ADDITIONAL_KEYWORD_PATTERNS } = require('./additional-keyword-patterns.js');

// 누락된 핵심 패턴들 추가
const MVP_SPECIFIC_PATTERNS = {
  // 지하철/전철 노선 확장
  '교통확장': {
    keywords: [
      // 기존 교통 키워드 확장
      '서울교통공사', '분당선', '신분당선', '경의중앙선', '공항철도', 'AREX',
      '경춘선', '수인분당선', '우이신설선', '신림선', 'GTX-A', 'GTX',
      '1호선', '2호선', '3호선', '4호선', '5호선', '6호선', '7호선', '8호선', '9호선',
      '인천1호선', '인천2호선', '경의선', '중앙선', '분당선', '안산선', '과천선',
      '일산선', '신분당선', '수인선', '경춘선', '공항철도', '우이신설선',
      '모빌리티', 'MOBILITY', '카카오T', '카카오택시', '우버', 'UBER',
      '타다', 'TADA', '심야할증', '하이패스', 'HI-PASS', '교통카드충전'
    ],
    tag: '교통',
    accountCode: '611',
    accountName: '여비교통비',
    confidence: 0.93
  },

  // 카드사/금융기관
  '금융확장': {
    keywords: [
      'KEB하나카드', '하나카드', 'HANA CARD', '현대카드', 'HYUNDAI CARD',
      '신한카드', 'SHINHAN CARD', '삼성카드', 'SAMSUNG CARD',
      'KB국민카드', '국민카드', '우리카드', 'WOORI CARD',
      'BC카드', 'NH농협카드', '농협카드', 'IBK기업은행카드',
      '롯데카드', 'LOTTE CARD', '시티카드', 'CITI CARD',
      '카드결제', '카드승인', '무이자할부', '일시불', '할부',
      '케이뱅크', 'K-BANK', '카카오뱅크', 'KAKAO BANK', '토스뱅크', 'TOSS BANK'
    ],
    tag: '금융',
    accountCode: '999',
    accountName: '금융수수료',
    confidence: 0.95
  },

  // 패션/쇼핑몰
  '패션쇼핑': {
    keywords: [
      '갤러리아*패션', '더현대*푸드코트', '패션', 'FASHION',
      '자라', 'ZARA', '유니클로', 'UNIQLO', '무지', 'MUJI',
      'H&M', '포에버21', 'FOREVER21', '망고', 'MANGO',
      '탑텐', 'TOPTEN', '엠폴햄', 'MPH', '빈폴', 'BEANPOLE',
      '시티', 'CITY', '매직', 'MAGIC', '로가디스', 'ROGATIS',
      '올리브데올리브', 'OLIVE DES OLIVE', '폴로', 'POLO',
      '랄프로렌', 'RALPH LAUREN', '타미힐피거', 'TOMMY',
      '의류', '옷', '패션잡화', '신발', '가방', '액세서리'
    ],
    tag: '의류패션',
    accountCode: '634',
    accountName: '소모품비',
    confidence: 0.85
  },

  // 온라인 서비스/구독
  '온라인서비스': {
    keywords: [
      '카카오톡선물', '카톡선물', '네이버페이', 'NAVER PAY',
      '페이코', 'PAYCO', '토스', 'TOSS', '삼성페이', 'SAMSUNG PAY',
      '넷플릭스', 'NETFLIX', '디즈니플러스', 'DISNEY+',
      '웨이브', 'WAVVE', '티빙', 'TVING', '쿠팡플레이', 'COUPANG PLAY',
      '스포티파이', 'SPOTIFY', '애플뮤직', 'APPLE MUSIC',
      '멜론', 'MELON', '지니뮤직', 'GENIE', '벅스뮤직', 'BUGS',
      '아이클라우드', 'iCLOUD', '구글원', 'GOOGLE ONE',
      '어도비', 'ADOBE', '오피스365', 'OFFICE365',
      '구독', 'SUBSCRIPTION', '온라인서비스'
    ],
    tag: '온라인서비스',
    accountCode: '634',
    accountName: '통신비',
    confidence: 0.88
  },

  // 푸드코트/음식점 확장
  '푸드코트': {
    keywords: [
      '더현대*푸드코트', '푸드코트', 'FOOD COURT', '푸드홀', 'FOOD HALL',
      '지하식당가', '식당가', '먹자골목', '포장마차',
      '분식', '분식집', '떡볶이집', '순대', '튀김',
      '족발', '보쌈', '찜닭', '삼겹살', '갈비', '불고기',
      '돈까스', '치킨까스', '함박스테이크', '스테이크',
      '회', '초밥', '일식', '중식', '양식', '한식',
      '포차', '술집', '호프', '맥주', '소주', '안주'
    ],
    tag: '음식점',
    accountCode: '651',
    accountName: '접대비',
    confidence: 0.85
  },

  // 편의점 상세 확장
  '편의점확장': {
    keywords: [
      // 기존 편의점에 누락된 것들 추가
      '세븐스포츠', 'SEVEN SPORTS', 'CU24', '지에스25', 'GS25',
      '스토리웨이', 'STORY WAY', '위드미', 'WITH ME',
      '코리아세븐', 'KOREA SEVEN', '미니스톱24', '24시편의점',
      '편의점택배', '편의점픽업', '편의점결제'
    ],
    tag: '편의점',
    accountCode: '622',
    accountName: '차량유지비',
    confidence: 0.95
  },

  // 기타 생활서비스
  '생활서비스': {
    keywords: [
      '세탁소', '드라이클리닝', '빨래방', '코인세탁',
      '미용실', '헤어샵', '네일샵', '피부관리실', '스파', 'SPA',
      '마사지', '찜질방', '사우나', '목욕탕', '스파랜드',
      '세차장', '세차', '정비소', '타이어', '자동차정비',
      '주차장관리소', '주차타워', '발렛파킹', '주차요금정산',
      '은행ATM', '우체국', '택배보관함', '무인택배함',
      '사진관', '증명사진', '프린트', '복사', '팩스',
      '동사무소', '구청', '시청', '관공서', '민원서류'
    ],
    tag: '생활서비스',
    accountCode: '634',
    accountName: '소모품비',
    confidence: 0.85
  }
};

// 모든 패턴을 통합 (우선순위: MVP_SPECIFIC > ADDITIONAL > ENHANCED)
const MVP_KEYWORD_PATTERNS = {
  ...ENHANCED_KEYWORD_PATTERNS,
  ...ADDITIONAL_KEYWORD_PATTERNS,
  ...MVP_SPECIFIC_PATTERNS
};

/**
 * MVP 준비 키워드 기반 거래 분류
 */
function classifyTransactionMVP(description) {
  const normalizedDescription = description.toLowerCase();
  
  // 길이별 우선순위 적용 (긴 키워드부터 매칭)
  const allPatterns = [];
  
  for (const [category, pattern] of Object.entries(MVP_KEYWORD_PATTERNS)) {
    for (const keyword of pattern.keywords) {
      allPatterns.push({
        keyword,
        length: keyword.length,
        category,
        pattern
      });
    }
  }
  
  // 키워드 길이 순으로 정렬 (긴 것부터)
  allPatterns.sort((a, b) => b.length - a.length);
  
  for (const item of allPatterns) {
    if (normalizedDescription.includes(item.keyword.toLowerCase())) {
      return {
        matched: true,
        category: item.category,
        tag: item.pattern.tag,
        accountCode: item.pattern.accountCode,
        accountName: item.pattern.accountName,
        confidence: item.pattern.confidence,
        matchedKeyword: item.keyword,
        processingPath: 'keyword'
      };
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
  MVP_KEYWORD_PATTERNS,
  classifyTransactionMVP
};