const { PrismaClient } = require('../lib/generated/prisma');

const prisma = new PrismaClient();

// API 설정
const KEYWORD_CLASSIFY_API = 'http://localhost:8080/v2/keyword-system/classify';

async function deepFailureAnalysis() {
  console.log('🔍 상세 실패 원인 분석 시작...');
  
  try {
    // 더 큰 샘플로 정확한 실패 패턴 파악
    const sampleBrands = await prisma.franchiseBrands.findMany({
      where: {
        generatedTransactionString: {
          not: null
        },
        primaryTag: {
          not: '기타'  // 기대 태그가 있는 것들만
        }
      },
      select: {
        id: true,
        brandName: true,
        companyName: true,
        industryLargeCategory: true,
        industryMediumCategory: true,
        mainProduct: true,
        generatedTransactionString: true,
        primaryTag: true,
        secondaryTag: true,
        tertiaryTag: true
      },
      orderBy: {
        id: 'asc'
      },
      take: 2000  // 더 큰 샘플
    });

    console.log(`📊 분석 대상: ${sampleBrands.length}개 브랜드`);
    
    let failedCases = [];
    let successCases = [];
    let results = [];

    // 배치별로 처리
    const batchSize = 100;
    for (let i = 0; i < sampleBrands.length; i += batchSize) {
      const batch = sampleBrands.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(sampleBrands.length / batchSize);
      
      console.log(`🔄 배치 ${batchNum}/${totalBatches} 처리 중...`);
      
      const batchPromises = batch.map(async (brand) => {
        try {
          const response = await fetch(KEYWORD_CLASSIFY_API, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              description: brand.generatedTransactionString,
              amount: 10000
            })
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const result = await response.json();
          
          const testResult = {
            brandId: brand.id,
            brandName: brand.brandName,
            companyName: brand.companyName,
            industryLargeCategory: brand.industryLargeCategory,
            industryMediumCategory: brand.industryMediumCategory,
            mainProduct: brand.mainProduct,
            generatedString: brand.generatedTransactionString,
            matched: result.matched,
            tag: result.tag || '',
            confidence: result.confidence || 0,
            extractedKeywords: result.extractedKeywords || [],
            processingPath: result.processingPath || '',
            primaryTag: brand.primaryTag,
            expectedMatch: brand.primaryTag !== '기타'
          };

          // 실패/성공 케이스 분류
          if (testResult.expectedMatch && !testResult.matched) {
            failedCases.push(testResult);
          } else if (testResult.matched) {
            successCases.push(testResult);
          }

          return testResult;
          
        } catch (error) {
          const failedResult = {
            brandId: brand.id,
            brandName: brand.brandName,
            companyName: brand.companyName,
            industryLargeCategory: brand.industryLargeCategory,
            industryMediumCategory: brand.industryMediumCategory,
            mainProduct: brand.mainProduct,
            generatedString: brand.generatedTransactionString,
            matched: false,
            tag: '',
            confidence: 0,
            extractedKeywords: [],
            processingPath: 'ERROR',
            error: error.message,
            primaryTag: brand.primaryTag,
            expectedMatch: brand.primaryTag !== '기타'
          };
          
          failedCases.push(failedResult);
          return failedResult;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // 진행률 출력
      const totalMatched = results.filter(r => r.matched).length;
      const currentAccuracy = (totalMatched / results.length * 100).toFixed(2);
      console.log(`   📈 현재까지 정확도: ${currentAccuracy}% (${totalMatched}/${results.length})`);
      
      // 배치 간 짧은 대기
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    const finalAccuracy = (successCases.length / results.length * 100).toFixed(2);
    console.log(`\n📊 최종 분석 완료`);
    console.log(`총 테스트: ${results.length}개`);
    console.log(`성공: ${successCases.length}개`);
    console.log(`실패: ${failedCases.length}개`);
    console.log(`최종 정확도: ${finalAccuracy}%`);

    // 실패 원인 상세 분석
    console.log(`\n🔍 실패 원인 상세 분석:`);
    
    // 1. 실패 타입 분류
    const failureTypes = {
      NO_KEYWORDS_EXTRACTED: [],
      KEYWORDS_NOT_MATCHED: [],
      WRONG_TAG_MAPPED: [],
      API_ERROR: []
    };

    for (const failed of failedCases) {
      if (failed.error) {
        failureTypes.API_ERROR.push(failed);
      } else if (!failed.extractedKeywords || failed.extractedKeywords.length === 0) {
        failureTypes.NO_KEYWORDS_EXTRACTED.push(failed);
      } else if (failed.extractedKeywords.length > 0 && !failed.matched) {
        failureTypes.KEYWORDS_NOT_MATCHED.push(failed);
      } else if (failed.tag && failed.tag !== failed.primaryTag) {
        failureTypes.WRONG_TAG_MAPPED.push(failed);
      }
    }

    console.log(`\n📈 실패 유형별 분포:`);
    console.log(`   키워드 추출 실패: ${failureTypes.NO_KEYWORDS_EXTRACTED.length}개 (${(failureTypes.NO_KEYWORDS_EXTRACTED.length/failedCases.length*100).toFixed(1)}%)`);
    console.log(`   키워드는 있으나 매칭 실패: ${failureTypes.KEYWORDS_NOT_MATCHED.length}개 (${(failureTypes.KEYWORDS_NOT_MATCHED.length/failedCases.length*100).toFixed(1)}%)`);
    console.log(`   잘못된 태그 매핑: ${failureTypes.WRONG_TAG_MAPPED.length}개 (${(failureTypes.WRONG_TAG_MAPPED.length/failedCases.length*100).toFixed(1)}%)`);
    console.log(`   API 오류: ${failureTypes.API_ERROR.length}개 (${(failureTypes.API_ERROR.length/failedCases.length*100).toFixed(1)}%)`);

    // 2. 키워드 추출 실패 케이스 분석
    console.log(`\n❌ 키워드 추출 실패 케이스 (상위 30개):`);
    failureTypes.NO_KEYWORDS_EXTRACTED.slice(0, 30).forEach((failed, index) => {
      console.log(`${index + 1}. ${failed.brandName} (${failed.industryLargeCategory})`);
      console.log(`   거래문자열: "${failed.generatedString}"`);
      console.log(`   기대태그: ${failed.primaryTag}`);
      console.log(`   주력상품: ${failed.mainProduct || 'N/A'}`);
      console.log('');
    });

    // 3. 키워드는 있으나 매칭 실패 케이스 분석
    console.log(`\n⚠️  키워드 있으나 매칭 실패 케이스 (상위 30개):`);
    failureTypes.KEYWORDS_NOT_MATCHED.slice(0, 30).forEach((failed, index) => {
      console.log(`${index + 1}. ${failed.brandName} (${failed.industryLargeCategory})`);
      console.log(`   거래문자열: "${failed.generatedString}"`);
      console.log(`   추출된 키워드: [${failed.extractedKeywords.join(', ')}]`);
      console.log(`   기대태그: ${failed.primaryTag}`);
      console.log('');
    });

    // 4. 브랜드명 패턴 분석
    console.log(`\n🏷️  실패한 브랜드명 패턴 분석:`);
    
    // 브랜드명에서 공통 패턴 추출
    const brandPatterns = {};
    for (const failed of failedCases) {
      const brandName = failed.brandName;
      
      // 숫자 패턴
      if (/\d+/.test(brandName)) {
        brandPatterns['숫자포함'] = (brandPatterns['숫자포함'] || 0) + 1;
      }
      
      // 영어 패턴
      if (/[A-Za-z]+/.test(brandName)) {
        brandPatterns['영어포함'] = (brandPatterns['영어포함'] || 0) + 1;
      }
      
      // 특수문자 패턴
      if (/[^\w\s가-힣]/.test(brandName)) {
        brandPatterns['특수문자포함'] = (brandPatterns['특수문자포함'] || 0) + 1;
      }
      
      // 길이 패턴
      if (brandName.length > 10) {
        brandPatterns['긴브랜드명'] = (brandPatterns['긴브랜드명'] || 0) + 1;
      }
      
      // 지역명 포함
      if (/역|점|센터|타운|몰|마트/.test(brandName)) {
        brandPatterns['지역/매장명포함'] = (brandPatterns['지역/매장명포함'] || 0) + 1;
      }
    }

    console.log(`브랜드명 패턴별 실패 분포:`);
    Object.entries(brandPatterns)
      .sort((a, b) => b[1] - a[1])
      .forEach(([pattern, count]) => {
        console.log(`   ${pattern}: ${count}개 (${(count/failedCases.length*100).toFixed(1)}%)`);
      });

    // 5. 산업 카테고리별 실패 분석
    console.log(`\n🏭 산업 카테고리별 실패 분석:`);
    const industryFailures = {};
    for (const failed of failedCases) {
      const industry = failed.industryLargeCategory || '기타';
      industryFailures[industry] = (industryFailures[industry] || 0) + 1;
    }

    Object.entries(industryFailures)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([industry, count]) => {
        const industryTotal = results.filter(r => r.industryLargeCategory === industry).length;
        const failureRate = (count / industryTotal * 100).toFixed(1);
        console.log(`   ${industry}: ${count}개 실패 (실패율 ${failureRate}%)`);
      });

    // 6. 주력상품별 실패 분석
    console.log(`\n🛍️  주력상품별 실패 분석 (상위 20개):`);
    const productFailures = {};
    for (const failed of failedCases) {
      if (failed.mainProduct) {
        const products = failed.mainProduct.split(/[,/]/);
        for (const product of products) {
          const cleanProduct = product.trim();
          if (cleanProduct.length > 1) {
            productFailures[cleanProduct] = (productFailures[cleanProduct] || 0) + 1;
          }
        }
      }
    }

    Object.entries(productFailures)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .forEach(([product, count]) => {
        console.log(`   ${product}: ${count}회 실패`);
      });

    // 7. 성공 케이스와 실패 케이스 비교
    console.log(`\n🔄 성공 vs 실패 케이스 비교:`);
    
    const successKeywordCount = successCases.reduce((sum, s) => sum + s.extractedKeywords.length, 0) / successCases.length;
    const failureKeywordCount = failedCases.filter(f => f.extractedKeywords.length > 0).reduce((sum, f) => sum + f.extractedKeywords.length, 0) / failedCases.filter(f => f.extractedKeywords.length > 0).length;
    
    console.log(`   성공 케이스 평균 키워드 수: ${successKeywordCount.toFixed(2)}개`);
    console.log(`   실패 케이스 평균 키워드 수: ${failureKeywordCount.toFixed(2)}개`);
    
    const successConfidence = successCases.reduce((sum, s) => sum + s.confidence, 0) / successCases.length;
    console.log(`   성공 케이스 평균 신뢰도: ${successConfidence.toFixed(2)}`);

    return {
      totalTested: results.length,
      totalSuccess: successCases.length,
      totalFailed: failedCases.length,
      accuracy: parseFloat(finalAccuracy),
      failureTypes,
      brandPatterns,
      industryFailures,
      productFailures,
      recommendations: generateRecommendations(failureTypes, brandPatterns, industryFailures, productFailures)
    };

  } catch (error) {
    console.error('❌ 상세 분석 중 오류:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

function generateRecommendations(failureTypes, brandPatterns, industryFailures, productFailures) {
  const recommendations = [];
  
  // 키워드 추출 실패 해결방안
  if (failureTypes.NO_KEYWORDS_EXTRACTED.length > 0) {
    recommendations.push({
      priority: 'HIGH',
      category: '키워드 추출 개선',
      issue: `${failureTypes.NO_KEYWORDS_EXTRACTED.length}개 케이스에서 키워드 추출 실패`,
      solution: '브랜드명 자체를 키워드로 인식하는 로직 추가 필요',
      impact: `약 ${(failureTypes.NO_KEYWORDS_EXTRACTED.length * 0.8).toFixed(0)}개 추가 성공 예상`
    });
  }

  // 키워드 매칭 실패 해결방안
  if (failureTypes.KEYWORDS_NOT_MATCHED.length > 0) {
    recommendations.push({
      priority: 'HIGH', 
      category: '키워드 매칭 개선',
      issue: `${failureTypes.KEYWORDS_NOT_MATCHED.length}개 케이스에서 키워드는 있으나 매칭 실패`,
      solution: '추출된 키워드들에 대한 동의어 사전 확장 및 새로운 키워드 그룹 생성',
      impact: `약 ${(failureTypes.KEYWORDS_NOT_MATCHED.length * 0.7).toFixed(0)}개 추가 성공 예상`
    });
  }

  // 브랜드명 패턴별 해결방안
  if (brandPatterns['영어포함'] > 50) {
    recommendations.push({
      priority: 'MEDIUM',
      category: '영어 브랜드명 처리',
      issue: `영어 포함 브랜드 ${brandPatterns['영어포함']}개 실패`,
      solution: '영어 브랜드명에 대한 별도 키워드 그룹 생성',
      impact: `약 ${(brandPatterns['영어포함'] * 0.6).toFixed(0)}개 추가 성공 예상`
    });
  }

  // 산업별 해결방안
  const topFailureIndustry = Object.entries(industryFailures).sort((a, b) => b[1] - a[1])[0];
  if (topFailureIndustry && topFailureIndustry[1] > 20) {
    recommendations.push({
      priority: 'HIGH',
      category: '산업별 특화 키워드',
      issue: `${topFailureIndustry[0]} 업종에서 ${topFailureIndustry[1]}개 실패`,
      solution: `${topFailureIndustry[0]} 업종 특화 키워드 그룹 생성`,
      impact: `약 ${(topFailureIndustry[1] * 0.8).toFixed(0)}개 추가 성공 예상`
    });
  }

  return recommendations;
}

// 실행
if (require.main === module) {
  deepFailureAnalysis()
    .then((result) => {
      console.log('\n✅ 상세 실패 분석 완료');
      console.log(`\n🎯 개선 권장사항:`);
      result.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. [${rec.priority}] ${rec.category}`);
        console.log(`   문제: ${rec.issue}`);
        console.log(`   해결방안: ${rec.solution}`);
        console.log(`   예상효과: ${rec.impact}`);
        console.log('');
      });
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 상세 분석 실패:', error);
      process.exit(1);
    });
}

module.exports = { deepFailureAnalysis };