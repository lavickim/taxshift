const { PrismaClient } = require('../lib/generated/prisma');

const prisma = new PrismaClient();

// API 설정
const KEYWORD_CLASSIFY_API = 'http://localhost:8080/api/v2/keyword-system/classify';

async function verifyClassificationAccuracy() {
  console.log('🔍 성공 케이스의 분류 정확성 검증 시작...');
  
  try {
    // 기대 태그가 명확한 브랜드들을 선택
    const verificationBrands = await prisma.franchiseBrands.findMany({
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
      },
      take: 500 // 검증용 샘플
    });

    console.log(`📊 검증 대상: ${verificationBrands.length}개 브랜드`);
    
    // 태그별 매핑 테이블 조회 (정확한 분류 검증을 위해)
    const tagMappings = await prisma.tagsMaster.findMany({
      where: { isActive: true },
      select: {
        id: true,
        tagName: true,
        tagCategory: true,
        description: true
      }
    });

    // 태그 ID -> 태그명 매핑
    const tagIdToName = {};
    for (const tag of tagMappings) {
      tagIdToName[tag.id] = tag.tagName;
      tagIdToName[`태그_${tag.id}`] = tag.tagName; // API 응답 형식에 맞춤
    }

    console.log(`📊 태그 매핑: ${Object.keys(tagIdToName).length}개`);

    let results = [];
    let correctClassifications = 0;
    let incorrectClassifications = 0;
    let unmatchedTags = 0;

    // 배치별로 처리
    const batchSize = 50;
    for (let i = 0; i < verificationBrands.length; i += batchSize) {
      const batch = verificationBrands.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(verificationBrands.length / batchSize);
      
      console.log(`🔄 배치 ${batchNum}/${totalBatches} 검증 중... (${batch.length}개)`);
      
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
          
          // 태그 정확성 검증
          const actualTagName = tagIdToName[result.tag] || result.tag || 'UNKNOWN';
          const expectedTag = brand.primaryTag;
          
          // 태그 정확성 판단 로직
          let isCorrect = false;
          let classificationStatus = 'INCORRECT';
          
          if (actualTagName === expectedTag) {
            // 정확히 일치
            isCorrect = true;
            classificationStatus = 'EXACT_MATCH';
          } else if (actualTagName && expectedTag) {
            // 유사 태그 매칭 (예: 커피전문점 vs 커피, 제과제빵 vs 베이커리)
            const similarityPairs = [
              ['커피전문점', '커피'],
              ['제과제빵', '베이커리'],
              ['치킨전문점', '치킨'],
              ['패스트푸드', '햄버거'],
              ['한식전문점', '한식'],
              ['이미용', '뷰티'],
              ['스포츠시설', '스포츠'],
              ['편의점', '마트'],
              ['디저트전문점', '디저트']
            ];
            
            for (const [tag1, tag2] of similarityPairs) {
              if ((actualTagName.includes(tag1) && expectedTag.includes(tag2)) ||
                  (actualTagName.includes(tag2) && expectedTag.includes(tag1)) ||
                  (actualTagName === tag1 && expectedTag === tag2) ||
                  (actualTagName === tag2 && expectedTag === tag1)) {
                isCorrect = true;
                classificationStatus = 'SIMILAR_MATCH';
                break;
              }
            }
          }

          const testResult = {
            brandId: brand.id,
            brandName: brand.brandName,
            industryCategory: brand.industryLargeCategory,
            mainProduct: brand.mainProduct,
            generatedString: brand.generatedTransactionString,
            matched: result.matched,
            actualTag: actualTagName,
            expectedTag: expectedTag,
            confidence: result.confidence || 0,
            extractedKeywords: result.extractedKeywords || [],
            processingPath: result.processingPath || '',
            isCorrectClassification: isCorrect,
            classificationStatus: classificationStatus
          };

          return testResult;
          
        } catch (error) {
          return {
            brandId: brand.id,
            brandName: brand.brandName,
            industryCategory: brand.industryLargeCategory,
            mainProduct: brand.mainProduct,
            generatedString: brand.generatedTransactionString,
            matched: false,
            actualTag: 'ERROR',
            expectedTag: brand.primaryTag,
            confidence: 0,
            extractedKeywords: [],
            processingPath: 'ERROR',
            error: error.message,
            isCorrectClassification: false,
            classificationStatus: 'ERROR'
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // 누적 통계
      const batchCorrect = batchResults.filter(r => r.isCorrectClassification).length;
      correctClassifications += batchCorrect;
      incorrectClassifications += (batchResults.length - batchCorrect);
      
      const currentAccuracy = (correctClassifications / results.length * 100).toFixed(2);
      console.log(`   📈 현재까지 정확 분류율: ${currentAccuracy}% (${correctClassifications}/${results.length})`);
      
      // 배치 간 대기
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // 최종 결과 분석
    const totalClassified = results.filter(r => r.matched).length;
    const accurateClassifications = results.filter(r => r.isCorrectClassification).length;
    const finalAccuracy = (accurateClassifications / results.length * 100).toFixed(2);
    const classificationAccuracy = totalClassified > 0 ? (accurateClassifications / totalClassified * 100).toFixed(2) : 0;
    
    console.log(`\n🎉 분류 정확성 검증 완료!`);
    console.log(`📊 최종 결과:`);
    console.log(`   총 테스트: ${results.length}개`);
    console.log(`   매칭 성공: ${totalClassified}개`);
    console.log(`   정확한 분류: ${accurateClassifications}개`);
    console.log(`   잘못된 분류: ${results.length - accurateClassifications}개`);
    console.log(`   전체 정확도: ${finalAccuracy}%`);
    console.log(`   분류 정확도 (매칭된 것 중): ${classificationAccuracy}%`);

    // 잘못 분류된 케이스 분석
    const incorrectCases = results.filter(r => r.matched && !r.isCorrectClassification);
    console.log(`\n❌ 잘못 분류된 케이스 분석 (총 ${incorrectCases.length}개):`);
    
    if (incorrectCases.length > 0) {
      console.log(`\n잘못 분류된 브랜드 (상위 20개):`);
      incorrectCases.slice(0, 20).forEach((incorrect, index) => {
        console.log(`${index + 1}. ${incorrect.brandName} (${incorrect.industryCategory})`);
        console.log(`   거래문자열: "${incorrect.generatedString}"`);
        console.log(`   기대태그: ${incorrect.expectedTag}`);
        console.log(`   실제태그: ${incorrect.actualTag}`);
        console.log(`   신뢰도: ${incorrect.confidence}`);
        console.log(`   키워드: [${incorrect.extractedKeywords.join(', ')}]`);
        console.log('');
      });

      // 잘못된 분류 패턴 분석
      const misclassificationPatterns = {};
      for (const incorrect of incorrectCases) {
        const pattern = `${incorrect.expectedTag} → ${incorrect.actualTag}`;
        misclassificationPatterns[pattern] = (misclassificationPatterns[pattern] || 0) + 1;
      }

      console.log(`잘못된 분류 패턴 (상위 10개):`);
      Object.entries(misclassificationPatterns)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .forEach(([pattern, count]) => {
          console.log(`   ${pattern}: ${count}건`);
        });

      // 산업별 잘못된 분류 분석
      const industryMisclassifications = {};
      for (const incorrect of incorrectCases) {
        const industry = incorrect.industryCategory || '기타';
        industryMisclassifications[industry] = (industryMisclassifications[industry] || 0) + 1;
      }

      console.log(`\n산업별 잘못된 분류:`);
      Object.entries(industryMisclassifications)
        .sort((a, b) => b[1] - a[1])
        .forEach(([industry, count]) => {
          const industryTotal = results.filter(r => r.industryCategory === industry).length;
          const errorRate = (count / industryTotal * 100).toFixed(1);
          console.log(`   ${industry}: ${count}개 오분류 (오분류율 ${errorRate}%)`);
        });
    }

    // 정확한 분류 예시도 보여주기
    const correctCases = results.filter(r => r.isCorrectClassification);
    console.log(`\n✅ 정확한 분류 예시 (상위 10개):`);
    correctCases.slice(0, 10).forEach((correct, index) => {
      console.log(`${index + 1}. ${correct.brandName} → ${correct.actualTag} (${correct.classificationStatus})`);
    });

    // 개선 권장사항
    console.log(`\n🎯 개선 권장사항:`);
    if (parseFloat(finalAccuracy) >= 95) {
      console.log(`✅ 매우 우수한 분류 정확도! (${finalAccuracy}%)`);
    } else if (parseFloat(finalAccuracy) >= 90) {
      console.log(`🟡 양호한 분류 정확도 (${finalAccuracy}%), 소폭 개선 가능`);
    } else {
      console.log(`🔴 분류 정확도 개선 필요 (${finalAccuracy}%)`);
    }

    if (incorrectCases.length > 0) {
      console.log(`\n개선 방안:`);
      console.log(`1. 잘못된 분류 패턴에 대한 키워드 그룹 조정`);
      console.log(`2. 태그 매핑 우선순위 재조정`);
      console.log(`3. 유사 태그 통합 또는 세분화 검토`);
    }

    return {
      totalTested: results.length,
      totalMatched: totalClassified,
      correctClassifications: accurateClassifications,
      incorrectClassifications: incorrectCases.length,
      overallAccuracy: parseFloat(finalAccuracy),
      classificationAccuracy: parseFloat(classificationAccuracy),
      incorrectCases: incorrectCases.slice(0, 50),
      isHighQuality: parseFloat(finalAccuracy) >= 95
    };

  } catch (error) {
    console.error('❌ 분류 정확성 검증 중 오류:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 실행
if (require.main === module) {
  verifyClassificationAccuracy()
    .then((result) => {
      console.log('\n✅ 분류 정확성 검증 완료');
      if (result.isHighQuality) {
        console.log('🎊 고품질 분류 시스템!');
      } else {
        console.log('📊 분류 품질 개선 필요');
      }
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 분류 정확성 검증 실패:', error);
      process.exit(1);
    });
}

module.exports = { verifyClassificationAccuracy };