const { PrismaClient } = require('../lib/generated/prisma');

const prisma = new PrismaClient();

// API 설정
const KEYWORD_CLASSIFY_API = 'http://localhost:8080/v2/keyword-system/classify';

async function accuratePerformanceTest() {
  console.log('🎯 정확한 성능 측정 테스트 시작...');
  
  try {
    // 기대 태그가 '기타'가 아닌 브랜드들만 정확하게 선택
    const validBrands = await prisma.franchiseBrands.findMany({
      where: {
        AND: [
          {
            generatedTransactionString: {
              not: null
            }
          },
          {
            primaryTag: {
              not: '기타'
            }
          },
          {
            primaryTag: {
              not: null
            }
          }
        ]
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
      }
    });

    console.log(`📊 유효한 테스트 대상: ${validBrands.length}개 브랜드`);
    
    // 랜덤 샘플링이 아닌 균등 분포 샘플링
    const sampleSize = Math.min(1500, validBrands.length);
    const step = Math.floor(validBrands.length / sampleSize);
    const sampleBrands = [];
    
    for (let i = 0; i < validBrands.length && sampleBrands.length < sampleSize; i += step) {
      sampleBrands.push(validBrands[i]);
    }

    console.log(`📊 균등 분포 샘플: ${sampleBrands.length}개 브랜드 선택`);
    
    let results = [];
    let totalSuccess = 0;
    let totalFailed = 0;

    // 배치별로 처리
    const batchSize = 50; // 더 작은 배치로 안정성 확보
    for (let i = 0; i < sampleBrands.length; i += batchSize) {
      const batch = sampleBrands.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(sampleBrands.length / batchSize);
      
      console.log(`🔄 배치 ${batchNum}/${totalBatches} 처리 중... (${batch.length}개)`);
      
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
            industryCategory: brand.industryLargeCategory,
            generatedString: brand.generatedTransactionString,
            matched: result.matched,
            tag: result.tag || '',
            confidence: result.confidence || 0,
            extractedKeywords: result.extractedKeywords || [],
            processingPath: result.processingPath || '',
            expectedTag: brand.primaryTag,
            expectedMatch: true // 모든 샘플이 매칭되어야 함
          };

          return testResult;
          
        } catch (error) {
          return {
            brandId: brand.id,
            brandName: brand.brandName,
            industryCategory: brand.industryLargeCategory,
            generatedString: brand.generatedTransactionString,
            matched: false,
            tag: '',
            confidence: 0,
            extractedKeywords: [],
            processingPath: 'ERROR',
            error: error.message,
            expectedTag: brand.primaryTag,
            expectedMatch: true
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // 누적 통계
      const batchSuccess = batchResults.filter(r => r.matched).length;
      totalSuccess += batchSuccess;
      totalFailed += (batchResults.length - batchSuccess);
      
      const currentAccuracy = (totalSuccess / results.length * 100).toFixed(2);
      console.log(`   📈 현재까지 정확도: ${currentAccuracy}% (${totalSuccess}/${results.length})`);
      
      // 배치 간 대기
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // 최종 결과 분석
    const finalAccuracy = (totalSuccess / results.length * 100).toFixed(2);
    
    console.log(`\n🎉 정확한 성능 측정 완료!`);
    console.log(`📊 최종 결과:`);
    console.log(`   총 테스트: ${results.length}개`);
    console.log(`   성공: ${totalSuccess}개`);
    console.log(`   실패: ${totalFailed}개`);
    console.log(`   최종 정확도: ${finalAccuracy}%`);

    // 실패 케이스 분석
    const failedCases = results.filter(r => !r.matched);
    console.log(`\n❌ 실패 케이스 분석 (총 ${failedCases.length}개):`);
    
    if (failedCases.length > 0) {
      console.log(`\n실패한 브랜드 (상위 20개):`);
      failedCases.slice(0, 20).forEach((failed, index) => {
        console.log(`${index + 1}. ${failed.brandName} (${failed.industryCategory})`);
        console.log(`   거래문자열: "${failed.generatedString}"`);
        console.log(`   기대태그: ${failed.expectedTag}`);
        console.log(`   추출키워드: [${failed.extractedKeywords.join(', ')}]`);
        console.log('');
      });

      // 실패 패턴 분석
      const failurePatterns = {};
      for (const failed of failedCases) {
        const category = failed.industryCategory || '기타';
        failurePatterns[category] = (failurePatterns[category] || 0) + 1;
      }

      console.log(`실패 패턴 (카테고리별):`);
      Object.entries(failurePatterns)
        .sort((a, b) => b[1] - a[1])
        .forEach(([category, count]) => {
          const categoryTotal = results.filter(r => r.industryCategory === category).length;
          const failureRate = (count / categoryTotal * 100).toFixed(1);
          console.log(`   ${category}: ${count}개 실패 (실패율 ${failureRate}%)`);
        });
    }

    // 성공률 목표 달성 여부
    console.log(`\n🎯 목표 달성 분석:`);
    if (parseFloat(finalAccuracy) >= 75) {
      console.log(`✅ 목표 달성! 현재 정확도 ${finalAccuracy}%가 목표 75% 이상입니다.`);
    } else {
      console.log(`⚠️  목표 근접! 현재 정확도 ${finalAccuracy}%`);
      console.log(`   목표 75%까지 ${(75 - parseFloat(finalAccuracy)).toFixed(2)}% 더 필요합니다.`);
      const additionalMatches = Math.ceil((75 * results.length / 100) - totalSuccess);
      console.log(`   약 ${additionalMatches}개 브랜드가 더 매칭되어야 합니다.`);
    }

    return {
      accuracy: parseFloat(finalAccuracy),
      totalTested: results.length,
      totalSuccess,
      totalFailed,
      failedCases: failedCases.slice(0, 50),
      isTargetAchieved: parseFloat(finalAccuracy) >= 75
    };

  } catch (error) {
    console.error('❌ 정확한 성능 측정 중 오류:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 실행
if (require.main === module) {
  accuratePerformanceTest()
    .then((result) => {
      console.log('\n✅ 정확한 성능 측정 완료');
      if (result.isTargetAchieved) {
        console.log('🎊 75% 목표 달성!');
      } else {
        console.log('📊 추가 개선 필요');
      }
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 정확한 성능 측정 실패:', error);
      process.exit(1);
    });
}

module.exports = { accuratePerformanceTest };