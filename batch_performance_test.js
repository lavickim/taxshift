#!/usr/bin/env node

/**
 * MoneyShift 4-Layer Pipeline 배치 성능 테스트
 * 
 * 테스트 시나리오:
 * 1. 다양한 거래 문자열로 4-Layer 파이프라인 테스트
 * 2. 성능 지표 측정 (처리 시간, 정확도, 성공률)
 * 3. 결과 분석 및 보고서 생성
 */

const https = require('http');
const { performance } = require('perf_hooks');

// 테스트 데이터 - 다양한 한국 거래 패턴
const testTransactions = [
  // 카페/음료
  { text: "스타벅스 강남점 아메리카노 4500원", expected: "카페" },
  { text: "투썸플레이스 라떼 5800원", expected: "카페" },
  { text: "이디야커피 원두 구매 15000원", expected: "카페" },
  
  // 음식점
  { text: "맥도날드 빅맥세트 7500원", expected: "음식점" },
  { text: "김밥천국 참치김밥 3500원", expected: "음식점" },
  { text: "교촌치킨 반반순살 19900원", expected: "음식점" },
  { text: "피자헛 슈퍼콤비네이션 28000원", expected: "음식점" },
  
  // 편의점
  { text: "GS25 도시락 4900원", expected: "편의점" },
  { text: "세븐일레븐 생수 1200원", expected: "편의점" },
  { text: "CU 컵라면 2300원", expected: "편의점" },
  
  // 주유소
  { text: "SK주유소 휘발유 65000원", expected: "주유소" },
  { text: "GS칼텍스 경유 55000원", expected: "주유소" },
  { text: "현대오일뱅크 LPG 35000원", expected: "주유소" },
  
  // 마트/쇼핑
  { text: "이마트 생필품 구매 35600원", expected: "마트" },
  { text: "롯데마트 식료품 42300원", expected: "마트" },
  { text: "홈플러스 과일 18500원", expected: "마트" },
  
  // 교통
  { text: "버스카드 충전 10000원", expected: "교통" },
  { text: "지하철 요금 1400원", expected: "교통" },
  { text: "택시 요금 8500원", expected: "교통" },
  
  // 의료
  { text: "삼성서울병원 진료비 15000원", expected: "의료" },
  { text: "온누리약국 감기약 8500원", expected: "의료" },
  
  // 통신
  { text: "KT 통신비 45000원", expected: "통신" },
  { text: "SKT 휴대폰 요금 65000원", expected: "통신" },
  
  // 금융
  { text: "우리은행 ATM 출금 100000원", expected: "금융" },
  { text: "신한카드 연회비 15000원", expected: "금융" },
  
  // 기타
  { text: "다이소 생활용품 7800원", expected: "기타" },
  { text: "올리브영 화장품 25600원", expected: "기타" },
  { text: "세차장 세차비 12000원", expected: "기타" },
  
  // 복잡한 거래 (정규식 전처리 테스트)
  { text: "(주)스타벅스코리아 강남역점 아메리카노 4500원", expected: "카페" },
  { text: "유한회사 삼성전자서비스 AS비용 45000원", expected: "기타" },
  { text: "개인택시 홍길동 택시비 12500원", expected: "교통" },
  
  // 영문 포함
  { text: "McDonald's 빅맥세트 7500원", expected: "음식점" },
  { text: "KFC 치킨버거 6800원", expected: "음식점" },
  { text: "Subway 샌드위치 5900원", expected: "음식점" },
  
  // 온라인 결제
  { text: "쿠팡 생필품 주문 23400원", expected: "쇼핑" },
  { text: "11번가 의류 구매 45600원", expected: "쇼핑" },
  { text: "배달의민족 치킨 주문 18900원", expected: "음식점" },
  
  // 정기 결제
  { text: "넷플릭스 구독료 9500원", expected: "구독" },
  { text: "멜론 음악 서비스 8000원", expected: "구독" },
  { text: "유튜브 프리미엄 7900원", expected: "구독" }
];

// 성능 측정 클래스
class PerformanceTest {
  constructor() {
    this.results = [];
    this.totalRequests = 0;
    this.successfulRequests = 0;
    this.failedRequests = 0;
    this.totalResponseTime = 0;
    this.responseTimes = [];
  }

  async runSingleTest(transaction, index) {
    const startTime = performance.now();
    
    try {
      console.log(`[${index + 1}/${testTransactions.length}] 테스트 중: "${transaction.text}"`);
      
      const result = await this.callAPI(transaction.text);
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      this.totalRequests++;
      this.responseTimes.push(responseTime);
      this.totalResponseTime += responseTime;
      
      if (result.success) {
        this.successfulRequests++;
        
        const testResult = {
          index: index + 1,
          transaction: transaction.text,
          expected: transaction.expected,
          actual: result.selectedTag || result.suggestedTags?.[0] || "Unknown",
          confidence: result.confidence || 0,
          processingPath: result.processingPath || "Unknown",
          responseTime: responseTime,
          success: true,
          layers: {
            regex: result.regex || null,
            keywords: result.extractedKeywords || [],
            tagging: result.selectedTag || null,
            accounting: result.selectedAccount || null
          }
        };
        
        this.results.push(testResult);
        
        console.log(`  ✅ 성공 - 예측: ${testResult.actual}, 신뢰도: ${(testResult.confidence * 100).toFixed(1)}%, 응답: ${responseTime.toFixed(0)}ms`);
        
      } else {
        this.failedRequests++;
        console.log(`  ❌ 실패 - 오류: ${result.errorMessage || 'Unknown error'}`);
      }
      
    } catch (error) {
      this.failedRequests++;
      console.log(`  ❌ 오류 - ${error.message}`);
    }
    
    // 요청 간 간격 (API 부하 방지)
    await this.sleep(100);
  }

  async callAPI(transactionText) {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify({
        transactionText: transactionText,
        amount: Math.floor(Math.random() * 50000) + 1000
      });

      const options = {
        hostname: 'localhost',
        port: 8080,
        path: '/mshift-api/v2/test/parse-transaction',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        });
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  generateReport() {
    const avgResponseTime = this.totalResponseTime / this.totalRequests;
    const successRate = (this.successfulRequests / this.totalRequests) * 100;
    
    // P95, P99 계산
    const sortedTimes = this.responseTimes.sort((a, b) => a - b);
    const p95Index = Math.floor(sortedTimes.length * 0.95);
    const p99Index = Math.floor(sortedTimes.length * 0.99);
    const p95ResponseTime = sortedTimes[p95Index] || 0;
    const p99ResponseTime = sortedTimes[p99Index] || 0;
    
    // 정확도 계산 (간단한 키워드 매칭 기반)
    let correctPredictions = 0;
    for (const result of this.results) {
      if (this.isAccuratePrediction(result.expected, result.actual)) {
        correctPredictions++;
      }
    }
    const accuracy = (correctPredictions / this.results.length) * 100;
    
    const report = {
      summary: {
        testName: "MoneyShift 4-Layer Pipeline Performance Test",
        timestamp: new Date().toISOString(),
        totalTransactions: this.totalRequests,
        successfulTransactions: this.successfulRequests,
        failedTransactions: this.failedRequests,
        successRate: successRate.toFixed(2) + '%',
        accuracy: accuracy.toFixed(2) + '%'
      },
      performance: {
        averageResponseTime: avgResponseTime.toFixed(2) + 'ms',
        p95ResponseTime: p95ResponseTime.toFixed(2) + 'ms',
        p99ResponseTime: p99ResponseTime.toFixed(2) + 'ms',
        minResponseTime: Math.min(...this.responseTimes).toFixed(2) + 'ms',
        maxResponseTime: Math.max(...this.responseTimes).toFixed(2) + 'ms',
        totalExecutionTime: this.totalResponseTime.toFixed(2) + 'ms'
      },
      analysis: {
        layerBreakdown: this.analyzeLayers(),
        confidenceDistribution: this.analyzeConfidence(),
        categoryAccuracy: this.analyzeCategoryAccuracy()
      },
      detailedResults: this.results
    };
    
    return report;
  }

  isAccuratePrediction(expected, actual) {
    // 단순 매칭 또는 유사 키워드 매칭
    const synonyms = {
      "카페": ["음료", "커피", "cafe"],
      "음식점": ["식당", "레스토랑", "restaurant", "food"],
      "편의점": ["convenience", "store"],
      "마트": ["mart", "쇼핑", "shopping"],
      "교통": ["transport", "bus", "subway", "taxi"],
      "의료": ["hospital", "medical", "pharmacy"],
      "통신": ["telecom", "mobile", "internet"],
      "금융": ["bank", "finance", "card"],
      "구독": ["subscription", "service"]
    };
    
    if (expected.toLowerCase() === actual.toLowerCase()) return true;
    
    const expectedSynonyms = synonyms[expected] || [];
    return expectedSynonyms.some(syn => 
      actual.toLowerCase().includes(syn.toLowerCase()) || 
      syn.toLowerCase().includes(actual.toLowerCase())
    );
  }

  analyzeLayers() {
    const layers = {
      regexPreprocessing: 0,
      keywordExtraction: 0,
      tagging: 0,
      accounting: 0
    };
    
    for (const result of this.results) {
      if (result.layers.regex) layers.regexPreprocessing++;
      if (result.layers.keywords.length > 0) layers.keywordExtraction++;
      if (result.layers.tagging) layers.tagging++;
      if (result.layers.accounting) layers.accounting++;
    }
    
    return layers;
  }

  analyzeConfidence() {
    const ranges = { low: 0, medium: 0, high: 0 };
    
    for (const result of this.results) {
      const conf = result.confidence || 0;
      if (conf < 0.6) ranges.low++;
      else if (conf < 0.8) ranges.medium++;
      else ranges.high++;
    }
    
    return ranges;
  }

  analyzeCategoryAccuracy() {
    const categories = {};
    
    for (const result of this.results) {
      const category = result.expected;
      if (!categories[category]) {
        categories[category] = { total: 0, correct: 0 };
      }
      categories[category].total++;
      if (this.isAccuratePrediction(result.expected, result.actual)) {
        categories[category].correct++;
      }
    }
    
    // 정확도 계산
    for (const category in categories) {
      const data = categories[category];
      data.accuracy = ((data.correct / data.total) * 100).toFixed(2) + '%';
    }
    
    return categories;
  }

  async run() {
    console.log("🚀 MoneyShift 4-Layer Pipeline 성능 테스트 시작");
    console.log(`📊 총 ${testTransactions.length}개 거래 샘플 테스트`);
    console.log("=" * 60);
    
    const startTime = performance.now();
    
    for (let i = 0; i < testTransactions.length; i++) {
      await this.runSingleTest(testTransactions[i], i);
    }
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    
    console.log("=" * 60);
    console.log(`✅ 모든 테스트 완료 (총 소요시간: ${(totalTime / 1000).toFixed(2)}초)`);
    
    const report = this.generateReport();
    
    // 결과 출력
    console.log("\n📈 성능 테스트 결과:");
    console.log(`• 총 거래 수: ${report.summary.totalTransactions}`);
    console.log(`• 성공률: ${report.summary.successRate}`);
    console.log(`• 정확도: ${report.summary.accuracy}`);
    console.log(`• 평균 응답시간: ${report.performance.averageResponseTime}`);
    console.log(`• P95 응답시간: ${report.performance.p95ResponseTime}`);
    console.log(`• P99 응답시간: ${report.performance.p99ResponseTime}`);
    
    console.log("\n🎯 카테고리별 정확도:");
    for (const [category, data] of Object.entries(report.analysis.categoryAccuracy)) {
      console.log(`• ${category}: ${data.accuracy} (${data.correct}/${data.total})`);
    }
    
    console.log("\n🔧 레이어별 처리 현황:");
    const layers = report.analysis.layerBreakdown;
    console.log(`• 정규식 전처리: ${layers.regexPreprocessing}건`);
    console.log(`• 키워드 추출: ${layers.keywordExtraction}건`);
    console.log(`• 태깅: ${layers.tagging}건`);
    console.log(`• 회계 매핑: ${layers.accounting}건`);
    
    // JSON 보고서 저장
    const reportFile = `moneyshift_performance_test_${Date.now()}.json`;
    require('fs').writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log(`\n💾 상세 보고서가 저장되었습니다: ${reportFile}`);
    
    return report;
  }
}

// 테스트 실행
if (require.main === module) {
  const test = new PerformanceTest();
  test.run().catch(console.error);
}

module.exports = PerformanceTest;