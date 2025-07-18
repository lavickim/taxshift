const { PrismaClient } = require('../lib/generated/prisma');

const prisma = new PrismaClient();

// API 설정
const KEYWORD_CLASSIFY_API = 'http://localhost:8080/v2/keyword-system/classify';

async function testDynamicBrandSystem() {
  console.log('🔧 동적 브랜드 시스템 테스트 시작...');
  
  try {
    // 이전에 실패했던 브랜드들로 테스트
    const testCases = [
      "버거리BURGERRY 간편결제 23,308원",
      "정브라더카페 모바일 47,980원", 
      "돼지팥빙수 결제 46,901원",
      "아나덴헤어닥터 간편결제 162,205원",
      "레코드피자 온라인 33,868원",
      "성북당 십원빵 결제 3,101원",
      "빵명장 결제 27,231원",
      "로그인편의점 체크카드 8,650원",
      "알려지지않은브랜드999 결제 5,000원", // 존재하지 않는 브랜드
      "스타벅스 신용카드 15,000원" // 알려진 브랜드
    ];
    
    console.log(`📊 총 ${testCases.length}개 테스트 케이스`);
    
    let results = [];
    let keywordEngineMatches = 0;
    let dynamicBrandMatches = 0;
    let noMatches = 0;
    
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      console.log(`\n🔄 테스트 ${i + 1}/${testCases.length}: "${testCase}"`);
      
      try {
        const response = await fetch(KEYWORD_CLASSIFY_API, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            description: testCase,
            amount: 10000
          })
        });

        if (response.ok) {
          const result = await response.json();
          
          // 결과 분석
          const processingPath = result.processingPath || 'UNKNOWN';
          switch (processingPath) {
            case 'KEYWORD_ENGINE':
            case 'CACHE':
              keywordEngineMatches++;
              break;
            case 'DYNAMIC_BRAND':
              dynamicBrandMatches++;
              break;
            default:
              noMatches++;
              break;
          }
          
          console.log(`   ✅ 매칭: ${result.matched ? '성공' : '실패'}`);
          console.log(`   🛤️  처리 경로: ${processingPath}`);
          console.log(`   🏷️  태그: ${result.tag || 'N/A'}`);
          console.log(`   📊 신뢰도: ${result.confidence || 0}`);
          console.log(`   🔑 키워드: [${result.extractedKeywords?.join(', ') || ''}]`);
          
          if (result.brandName) {
            console.log(`   🏪 브랜드: ${result.brandName}`);
          }
          if (result.industryCategory) {
            console.log(`   🏭 산업: ${result.industryCategory}`);
          }
          
          results.push({
            testCase,
            ...result
          });
          
        } else {
          console.log(`   ❌ API 오류: HTTP ${response.status}`);
          noMatches++;
        }
      } catch (error) {
        console.log(`   ❌ 테스트 실패: ${error.message}`);
        noMatches++;
      }
    }
    
    // 최종 통계
    console.log(`\n📈 동적 브랜드 시스템 테스트 결과:`);
    console.log(`==========================================`);
    console.log(`총 테스트: ${testCases.length}개`);
    console.log(`키워드 엔진 매칭: ${keywordEngineMatches}개 (${(keywordEngineMatches/testCases.length*100).toFixed(1)}%)`);
    console.log(`동적 브랜드 매칭: ${dynamicBrandMatches}개 (${(dynamicBrandMatches/testCases.length*100).toFixed(1)}%)`);
    console.log(`매칭 실패: ${noMatches}개 (${(noMatches/testCases.length*100).toFixed(1)}%)`);
    console.log(`전체 매칭률: ${((keywordEngineMatches + dynamicBrandMatches)/testCases.length*100).toFixed(1)}%`);
    
    // 처리 경로별 상세 분석
    const pathCounts = results.reduce((acc, result) => {
      const path = result.processingPath || 'UNKNOWN';
      acc[path] = (acc[path] || 0) + 1;
      return acc;
    }, {});
    
    console.log(`\n🛤️  처리 경로 분포:`);
    Object.entries(pathCounts).forEach(([path, count]) => {
      console.log(`   ${path}: ${count}개`);
    });
    
    // 동적 브랜드 매칭 사례
    const dynamicMatches = results.filter(r => r.processingPath === 'DYNAMIC_BRAND');
    if (dynamicMatches.length > 0) {
      console.log(`\n🎯 동적 브랜드 매칭 성공 사례:`);
      dynamicMatches.forEach((match, index) => {
        console.log(`   ${index + 1}. "${match.testCase}"`);
        console.log(`      브랜드: ${match.brandName || 'N/A'}`);
        console.log(`      태그: ${match.tag || 'N/A'}`);
        console.log(`      신뢰도: ${match.confidence || 0}`);
      });
    }
    
    // 개선 권장사항
    console.log(`\n💡 시스템 개선 효과:`);
    if (dynamicBrandMatches > 0) {
      console.log(`✅ 동적 브랜드 검색으로 ${dynamicBrandMatches}개 추가 매칭 성공`);
      console.log(`✅ 기존 키워드 시스템 대비 ${dynamicBrandMatches}개 케이스 개선`);
      console.log(`✅ 11,418개 브랜드 DB 활용으로 확장성 확보`);
    } else {
      console.log(`⚠️ 동적 브랜드 매칭이 작동하지 않음 - 시스템 점검 필요`);
    }
    
    if (noMatches > 0) {
      console.log(`🔧 ${noMatches}개 케이스는 여전히 개선 필요`);
    }
    
    return {
      totalTests: testCases.length,
      keywordEngineMatches,
      dynamicBrandMatches,
      noMatches,
      overallMatchRate: (keywordEngineMatches + dynamicBrandMatches) / testCases.length * 100,
      results
    };

  } catch (error) {
    console.error('❌ 동적 브랜드 시스템 테스트 중 오류:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 실행
if (require.main === module) {
  testDynamicBrandSystem()
    .then((result) => {
      console.log('\n✅ 동적 브랜드 시스템 테스트 완료');
      if (result.overallMatchRate >= 90) {
        console.log('🎊 매우 우수한 매칭률!')
      } else if (result.overallMatchRate >= 80) {
        console.log('👍 양호한 매칭률')
      } else {
        console.log('🔧 매칭률 개선 필요')
      }
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 동적 브랜드 시스템 테스트 실패:', error);
      process.exit(1);
    });
}

module.exports = { testDynamicBrandSystem };