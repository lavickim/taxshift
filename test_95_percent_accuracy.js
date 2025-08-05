const axios = require('axios');

// 95% 정확도 달성 검증 테스트
// 확장된 데이터로 정확도 측정

const API_BASE = 'http://localhost:8080/api';

// 테스트 케이스들 (확장된 현대적 거래 패턴)
const testCases = [
  // 온라인 결제 (10개)
  { text: '네이버페이 강남점', expected: '온라인결제', confidence: 0.95 },
  { text: '카카오페이 맛있는집', expected: '온라인결제', confidence: 0.95 },
  { text: '토스 생활용품', expected: '온라인결제', confidence: 0.95 },
  { text: '페이코 결제', expected: '온라인결제', confidence: 0.90 },
  { text: '삼성페이 이용', expected: '온라인결제', confidence: 0.90 },
  
  // 구독 서비스 (10개)
  { text: '넷플릭스 월 구독료', expected: '구독서비스', confidence: 0.95 },
  { text: '유튜브 프리미엄', expected: '구독서비스', confidence: 0.95 },
  { text: '스포티파이 구독', expected: '구독서비스', confidence: 0.90 },
  { text: '디즈니플러스 구독료', expected: '구독서비스', confidence: 0.90 },
  { text: '멜론 이용료', expected: '구독서비스', confidence: 0.85 },
  
  // 배달 서비스 (10개)
  { text: '배달의민족 피자헛', expected: '배달서비스', confidence: 0.95 },
  { text: '쿠팡이츠 중식당', expected: '배달서비스', confidence: 0.95 },
  { text: '요기요 맛있는집', expected: '배달서비스', confidence: 0.90 },
  { text: '우버이츠 주문', expected: '배달서비스', confidence: 0.85 },
  { text: '땡겨요 배달', expected: '배달서비스', confidence: 0.75 },
  
  // 쇼핑몰 (10개)
  { text: '쿠팡 전자제품', expected: '쇼핑몰', confidence: 0.95 },
  { text: '11번가 의류', expected: '쇼핑몰', confidence: 0.90 },
  { text: 'G마켓 생활용품', expected: '쇼핑몰', confidence: 0.90 },
  { text: '옥션 화장품', expected: '쇼핑몰', confidence: 0.85 },
  { text: '위메프 도서', expected: '쇼핑몰', confidence: 0.85 },
  
  // 교통 (10개)
  { text: '서울교통공사 지하철', expected: '교통', confidence: 0.95 },
  { text: '버스 요금', expected: '교통', confidence: 0.90 },
  { text: '카카오택시', expected: '교통', confidence: 0.95 },
  { text: '타다 이용료', expected: '교통', confidence: 0.85 },
  { text: '쏘카 대여료', expected: '교통', confidence: 0.90 },
  
  // 의료 (10개)
  { text: '서울 종합병원', expected: '의료', confidence: 0.95 },
  { text: '강남 치과', expected: '의료', confidence: 0.95 },
  { text: '부산 한의원', expected: '의료', confidence: 0.90 },
  { text: '온누리 약국', expected: '의료', confidence: 0.95 },
  { text: '사랑 동물병원', expected: '의료', confidence: 0.85 },
  
  // 교육 (10개)
  { text: '영어 전문학원', expected: '교육', confidence: 0.90 },
  { text: '수학 학원', expected: '교육', confidence: 0.85 },
  { text: '해바라기 유치원', expected: '교육', confidence: 0.90 },
  { text: '서울대학교', expected: '교육', confidence: 0.85 },
  { text: '교보문고', expected: '교육', confidence: 0.80 },
  
  // 금융 (10개)
  { text: '신한은행', expected: '금융', confidence: 0.95 },
  { text: '국민은행', expected: '금융', confidence: 0.95 },
  { text: '카카오뱅크', expected: '금융', confidence: 0.90 },
  { text: '삼성생명보험', expected: '금융', confidence: 0.90 },
  { text: '미래에셋증권', expected: '금융', confidence: 0.85 },
  
  // 생활서비스 (10개)
  { text: '서울 미용실', expected: '생활서비스', confidence: 0.90 },
  { text: '예쁜 네일샵', expected: '생활서비스', confidence: 0.85 },
  { text: '깨끗한 세탁소', expected: '생활서비스', confidence: 0.85 },
  { text: '헬스 클럽', expected: '생활서비스', confidence: 0.85 },
  { text: '서울 부동산', expected: '생활서비스', confidence: 0.80 },
  
  // 전통적 패턴 (10개)
  { text: 'CU편의점 강남점', expected: '편의점', confidence: 0.90 },
  { text: '이마트 성수점', expected: '대형마트', confidence: 0.90 },
  { text: 'SK주유소 서울역점', expected: '주유소', confidence: 0.90 },
  { text: '스타벅스 홍대점', expected: '카페', confidence: 0.95 },
  { text: 'BBQ 치킨', expected: '치킨', confidence: 0.90 }
];

// API 테스트 함수
async function testTransactionClassification(transactionText) {
  try {
    const response = await axios.post(`${API_BASE}/classify`, {
      transactionString: transactionText,
      amount: 50000
    }, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return {
      success: true,
      result: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      status: error.response?.status
    };
  }
}

// 대체 API 엔드포인트 테스트
async function testAlternativeEndpoints(transactionText) {
  const endpoints = [
    '/v2/test-data/execute',
    '/v2/keyword-test/classify',
    '/regex-rules/test',
    '/rule-test/classify'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await axios.post(`${API_BASE}${endpoint}`, {
        transactionString: transactionText,
        amount: 50000,
        transaction_text: transactionText
      }, {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`✅ ${endpoint} 응답:`, response.data);
      return { success: true, endpoint, result: response.data };
    } catch (error) {
      console.log(`❌ ${endpoint} 실패: ${error.response?.status || error.message}`);
    }
  }
  
  return { success: false, error: 'All endpoints failed' };
}

// 정확도 측정 함수
function calculateAccuracy(results) {
  let correct = 0;
  let total = results.length;
  
  const detailedResults = results.map(result => {
    const isCorrect = result.success && 
                     result.predictedCategory && 
                     result.predictedCategory.toLowerCase().includes(result.expected.toLowerCase());
    
    if (isCorrect) correct++;
    
    return {
      text: result.text,
      expected: result.expected,
      predicted: result.predictedCategory || 'FAILED',
      confidence: result.confidence || 0,
      correct: isCorrect,
      success: result.success
    };
  });
  
  const accuracy = (correct / total) * 100;
  
  return {
    accuracy: accuracy.toFixed(2),
    correct,
    total,
    detailedResults
  };
}

// 메인 테스트 실행
async function runAccuracyTest() {
  console.log('🚀 MoneyShift 95% 정확도 달성 검증 테스트 시작');
  console.log(`📊 총 테스트 케이스: ${testCases.length}개`);
  console.log('=' .repeat(60));
  
  // 서버 연결 테스트
  console.log('🔗 서버 연결 테스트...');
  try {
    await axios.get(`${API_BASE}/../`, { timeout: 5000 });
    console.log('✅ 서버 연결 성공');
  } catch (error) {
    console.log('❌ 서버 연결 실패:', error.message);
    console.log('🔄 대체 엔드포인트 탐색 중...');
  }
  
  const results = [];
  let processed = 0;
  
  for (const testCase of testCases) {
    processed++;
    console.log(`\n[${processed}/${testCases.length}] 테스트: "${testCase.text}"`);
    
    // 기본 API 테스트
    let apiResult = await testTransactionClassification(testCase.text);
    
    // 실패시 대체 엔드포인트 시도
    if (!apiResult.success) {
      console.log('🔄 대체 엔드포인트 시도...');
      const altResult = await testAlternativeEndpoints(testCase.text);
      apiResult = altResult;
    }
    
    const result = {
      text: testCase.text,
      expected: testCase.expected,
      expectedConfidence: testCase.confidence,
      success: apiResult.success,
      predictedCategory: apiResult.success ? (apiResult.result?.tag || apiResult.result?.category || apiResult.result?.classification) : null,
      confidence: apiResult.success ? (apiResult.result?.confidence || apiResult.result?.score || 0) : 0,
      rawResponse: apiResult.success ? apiResult.result : apiResult.error
    };
    
    results.push(result);
    
    if (result.success) {
      console.log(`✅ 예측: ${result.predictedCategory} (신뢰도: ${result.confidence})`);
    } else {
      console.log(`❌ 실패: ${result.rawResponse}`);
    }
  }
  
  // 정확도 계산
  console.log('\n' + '=' .repeat(60));
  console.log('📈 정확도 분석 결과');
  console.log('=' .repeat(60));
  
  const accuracyResult = calculateAccuracy(results);
  
  console.log(`🎯 전체 정확도: ${accuracyResult.accuracy}%`);
  console.log(`✅ 성공: ${accuracyResult.correct}/${accuracyResult.total}`);
  console.log(`❌ 실패: ${accuracyResult.total - accuracyResult.correct}/${accuracyResult.total}`);
  
  // 카테고리별 정확도
  const categoryAccuracy = {};
  accuracyResult.detailedResults.forEach(result => {
    if (!categoryAccuracy[result.expected]) {
      categoryAccuracy[result.expected] = { correct: 0, total: 0 };
    }
    categoryAccuracy[result.expected].total++;
    if (result.correct) {
      categoryAccuracy[result.expected].correct++;
    }
  });
  
  console.log('\n📊 카테고리별 정확도:');
  Object.entries(categoryAccuracy).forEach(([category, stats]) => {
    const acc = ((stats.correct / stats.total) * 100).toFixed(1);
    console.log(`  ${category}: ${acc}% (${stats.correct}/${stats.total})`);
  });
  
  // 실패 케이스 분석
  const failures = accuracyResult.detailedResults.filter(r => !r.success || !r.correct);
  if (failures.length > 0) {
    console.log('\n🔍 실패 케이스 분석:');
    failures.forEach(failure => {
      console.log(`  "${failure.text}" - 예상: ${failure.expected}, 실제: ${failure.predicted}`);
    });
  }
  
  // 95% 목표 달성 여부
  const targetAccuracy = 95;
  const achieved = parseFloat(accuracyResult.accuracy) >= targetAccuracy;
  
  console.log('\n' + '=' .repeat(60));
  if (achieved) {
    console.log(`🎉 95% 정확도 목표 달성! (${accuracyResult.accuracy}%)`);
    console.log('✨ MoneyShift 데이터 확장 프로젝트 성공!');
  } else {
    console.log(`⚠️  95% 목표 미달성 (${accuracyResult.accuracy}%)`);
    console.log('🔧 추가 데이터 확장 및 규칙 개선 필요');
  }
  console.log('=' .repeat(60));
  
  // 결과를 파일로 저장
  const fs = require('fs');
  const reportData = {
    timestamp: new Date().toISOString(),
    targetAccuracy,
    achievedAccuracy: parseFloat(accuracyResult.accuracy),
    goalAchieved: achieved,
    summary: accuracyResult,
    categoryBreakdown: categoryAccuracy,
    detailedResults: accuracyResult.detailedResults,
    failureCases: failures,
    testConfiguration: {
      totalTestCases: testCases.length,
      apiBase: API_BASE,
      dataExpansionVersion: 'v1.0'
    }
  };
  
  const reportPath = '/Users/lavickim/_Dev/moneyshift/accuracy_test_report.json';
  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
  console.log(`📄 상세 리포트 저장: ${reportPath}`);
  
  return reportData;
}

// 실행
if (require.main === module) {
  runAccuracyTest().catch(console.error);
}

module.exports = { runAccuracyTest, testCases };