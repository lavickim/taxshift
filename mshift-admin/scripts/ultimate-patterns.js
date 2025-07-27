#!/usr/bin/env node

/**
 * 75% 목표 달성을 위한 최종 궁극 패턴
 */

const { MVP_KEYWORD_PATTERNS } = require('./mvp-ready-patterns.js');

// 마지막 누락된 패턴들
const ULTIMATE_PATTERNS = {
  // 카드사 완전 확장
  카드사완전확장: {
    keywords: [
      '기업은행카드',
      'IBK기업은행카드',
      'IBK CARD',
      '새마을금고카드',
      '새마을금고',
      'MG새마을금고',
      '신협카드',
      '신용협동조합',
      '지역신협',
      '저축은행카드',
      '상호저축은행',
      '산업은행카드',
      '수협카드',
      '수협은행카드',
      '산림조합카드',
      '우체국카드',
      '우체국체크카드',
      '전북은행카드',
      '경남은행카드',
      '광주은행카드',
      '제주은행카드',
      '전남은행카드',
      '대구은행카드',
      '부산은행카드',
      'BNK부산은행',
      'DGB대구은행',
    ],
    tag: '금융',
    accountCode: '999',
    accountName: '금융수수료',
    confidence: 0.93,
  },

  // 페이 서비스 확장
  페이서비스: {
    keywords: [
      '애플페이',
      'APPLE PAY',
      '구글페이',
      'GOOGLE PAY',
      '엘페이',
      'L.PAY',
      '카카오페이',
      'KAKAO PAY',
      '제로페이',
      'ZERO PAY',
      '네이버페이',
      'NAVER PAY',
      '페이코',
      'PAYCO',
      '시럽페이',
      'SYRUP PAY',
      '스마일페이',
      'SMILE PAY',
      '하나페이',
      '우리페이',
      '신한페이',
      '국민페이',
      'KB페이',
      '머니트리',
      '간편결제',
      '간편송금',
      '페이',
      'PAY',
    ],
    tag: '간편결제',
    accountCode: '999',
    accountName: '금융수수료',
    confidence: 0.9,
  },

  // 철도/교통 완전 확장
  철도교통완전: {
    keywords: [
      '누리로',
      'NURIRO',
      'ITX청춘',
      'ITX-청춘',
      'ITX새마을',
      'ITX-새마을',
      '수서고속철도',
      'SRT수서',
      '경인선',
      '태백선',
      '영동선',
      '경전선',
      '전라선',
      '장항선',
      '경북선',
      '동해선',
      '충북선',
      '중앙선',
      '경의선',
      '경춘선',
      '경원선',
      '평택선',
      '장항선',
      '호남선',
      '전라선',
      '경전선',
      '동해선',
      '태백선',
      '영동선',
      '중앙선',
    ],
    tag: '교통',
    accountCode: '611',
    accountName: '여비교통비',
    confidence: 0.92,
  },

  // 할인/혜택 시스템
  할인혜택: {
    keywords: [
      '학생할인',
      '청소년할인',
      '어린이할인',
      '경로할인',
      '노인할인',
      '시니어할인',
      '장애인할인',
      '중증환자할인',
      '유공자할인',
      '국가유공자할인',
      '보훈대상자할인',
      '다자녀할인',
      '임산부할인',
      '육아맘할인',
      '군인할인',
      '의경할인',
      '의무소방관할인',
      '할인',
      'DISCOUNT',
      '혜택',
      '우대',
      '면제',
    ],
    tag: '교통할인',
    accountCode: '611',
    accountName: '여비교통비',
    confidence: 0.85,
  },

  // 특수 서비스
  특수서비스: {
    keywords: [
      '배달의민족',
      '배민',
      'BAEMIN',
      '요기요',
      'YOGIYO',
      '쿠팡이츠',
      'COUPANG EATS',
      '배달앱',
      '딜리버리',
      '우버이츠',
      'UBER EATS',
      '배달음식',
      '배달주문',
      '카카오택시',
      '카카오T',
      '타다',
      'TADA',
      '우버',
      'UBER',
      '그랩',
      'GRAB',
      '카풀',
      '온라인주문',
      '픽업주문',
      '포장주문',
      '테이크아웃',
      '배달',
      'DELIVERY',
      '픽업',
      'PICKUP',
    ],
    tag: '배달서비스',
    accountCode: '651',
    accountName: '접대비',
    confidence: 0.88,
  },

  // 기타 누락 브랜드
  기타브랜드: {
    keywords: [
      // 추가 카페 브랜드
      '투썸',
      'A TWOSOME',
      '커피빈앤티리프',
      '더카페',
      'THE CAFE',
      '카페드롭탑',
      'DROP TOP',

      // 추가 음식점
      '버거킹',
      'BURGER KING',
      '롯데리아',
      'LOTTERIA',
      '도미노',
      'DOMINOS',
      '피자스쿨',
      'PIZZA SCHOOL',

      // 기타 편의점
      '바이더웨이',
      'BY THE WAY',
      '위드미',
      'WITH ME',

      // 기타 서비스
      '펀치',
      'PUNCH',
      '이마트몰',
      '이마트 온라인몰',
      '홈플러스몰',
      '롯데몰',
      'LOTTE MALL',
    ],
    tag: '기타서비스',
    accountCode: '634',
    accountName: '소모품비',
    confidence: 0.8,
  },
};

// 최종 궁극 패턴 통합
const ULTIMATE_KEYWORD_PATTERNS = {
  ...MVP_KEYWORD_PATTERNS,
  ...ULTIMATE_PATTERNS,
};

/**
 * 궁극 키워드 기반 거래 분류 (75% 목표)
 */
function classifyTransactionUltimate(description) {
  const normalizedDescription = description.toLowerCase();

  // 키워드 길이별 우선순위 적용
  const allPatterns = [];

  for (const [category, pattern] of Object.entries(ULTIMATE_KEYWORD_PATTERNS)) {
    for (const keyword of pattern.keywords) {
      allPatterns.push({
        keyword,
        length: keyword.length,
        category,
        pattern,
      });
    }
  }

  // 긴 키워드부터 매칭 (더 구체적인 매칭 우선)
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
        processingPath: 'keyword',
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
    processingPath: 'unmatched',
  };
}

module.exports = {
  ULTIMATE_KEYWORD_PATTERNS,
  classifyTransactionUltimate,
};
