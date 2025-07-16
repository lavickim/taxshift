const { PrismaClient } = require('../lib/generated/prisma');

const prisma = new PrismaClient();

// API 설정
const KEYWORD_CLASSIFY_API = 'http://localhost:8080/api/v2/keyword-system/classify';
const BATCH_SIZE = 100;
const DELAY_BETWEEN_BATCHES = 1000; // 1초 대기

async function testBrandsWithImprovedKeywords() {
  console.log('🚀 개선된 키워드 룰로 브랜드 테스트 시작...');
  
  try {
    // 모든 브랜드 조회 (generated_transaction_string이 있는 것만)
    const allBrands = await prisma.franchiseBrands.findMany({
      where: {
        generatedTransactionString: {
          not: null
        }
      },
      select: {
        id: true,
        brandName: true,
        companyName: true,
        industryLargeCategory: true,
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

    console.log(`📊 총 테스트 대상 브랜드: ${allBrands.length}개`);
    
    let totalTested = 0;
    let totalMatched = 0;
    let categoryStats = {};
    let failedBrands = [];
    let results = [];

    // 배치별로 처리
    for (let i = 0; i < allBrands.length; i += BATCH_SIZE) {
      const batch = allBrands.slice(i, i + BATCH_SIZE);
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(allBrands.length / BATCH_SIZE);
      
      console.log(`\n🔄 배치 ${batchNumber}/${totalBatches} 처리 중... (${batch.length}개 브랜드)`);
      
      // 배치 내 브랜드들을 병렬로 테스트
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
            category: brand.industryLargeCategory,
            generatedString: brand.generatedTransactionString,
            matched: result.matched,
            tag: result.tag || '',
            confidence: result.confidence || 0,
            extractedKeywords: result.extractedKeywords || [],
            processingPath: result.processingPath || '',
            priorityTag1: brand.primaryTag,
            expectedMatch: brand.primaryTag !== '기타'
          };

          return testResult;
          
        } catch (error) {
          console.error(`❌ 브랜드 ${brand.brandName} 테스트 실패:`, error.message);
          return {
            brandId: brand.id,
            brandName: brand.brandName,
            category: brand.industryLargeCategory,
            generatedString: brand.generatedTransactionString,
            matched: false,
            tag: '',
            confidence: 0,
            extractedKeywords: [],
            processingPath: 'ERROR',
            error: error.message,
            priorityTag1: brand.primaryTag,
            expectedMatch: brand.primaryTag !== '기타'
          };
        }
      });

      // 배치 결과 수집
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // 배치 통계 업데이트
      for (const result of batchResults) {
        totalTested++;
        
        if (result.matched) {
          totalMatched++;
        }

        // 카테고리별 통계
        const category = result.category || '기타';
        if (!categoryStats[category]) {
          categoryStats[category] = { total: 0, matched: 0 };
        }
        categoryStats[category].total++;
        if (result.matched) {
          categoryStats[category].matched++;
        }

        // 실패한 브랜드 수집 (예상된 매칭이지만 실패한 경우)
        if (result.expectedMatch && !result.matched) {
          failedBrands.push(result);
        }
      }

      // 진행률 출력
      const currentAccuracy = totalTested > 0 ? (totalMatched / totalTested * 100).toFixed(2) : 0;
      console.log(`   📈 현재까지 정확도: ${currentAccuracy}% (${totalMatched}/${totalTested})`);
      
      // 배치 간 대기
      if (i + BATCH_SIZE < allBrands.length) {
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
      }
    }

    // 최종 결과 계산
    const finalAccuracy = (totalMatched / totalTested * 100).toFixed(2);
    
    // 카테고리별 성공률 계산
    const categoryAccuracy = {};
    for (const [category, stats] of Object.entries(categoryStats)) {
      categoryAccuracy[category] = {
        total: stats.total,
        matched: stats.matched,
        accuracy: stats.total > 0 ? (stats.matched / stats.total * 100).toFixed(2) : 0
      };
    }

    console.log(`\n🎉 테스트 완료!`);
    console.log(`📊 전체 결과:`);
    console.log(`   총 테스트: ${totalTested}개`);
    console.log(`   성공: ${totalMatched}개`);
    console.log(`   최종 정확도: ${finalAccuracy}%`);

    console.log(`\n📈 카테고리별 성공률 (상위 10개):`);
    const sortedCategories = Object.entries(categoryAccuracy)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 10);
    
    for (const [category, stats] of sortedCategories) {
      console.log(`   ${category}: ${stats.accuracy}% (${stats.matched}/${stats.total})`);
    }

    console.log(`\n❌ 실패한 브랜드 (상위 20개):`);
    const topFailures = failedBrands.slice(0, 20);
    for (const brand of topFailures) {
      console.log(`   ${brand.brandName} (${brand.category}): "${brand.generatedString}"`);
    }

    // 결과를 데이터베이스에 저장
    console.log(`\n💾 테스트 결과를 데이터베이스에 저장 중...`);
    let updatedCount = 0;
    
    for (const result of results) {
      try {
        await prisma.franchiseBrands.update({
          where: { id: result.brandId },
          data: {
            testPassed: result.matched,
            lastTestAt: new Date(),
            testResult: {
              confidence: result.confidence,
              tag: result.tag,
              extractedKeywords: result.extractedKeywords,
              processingPath: result.processingPath
            }
          }
        });
        updatedCount++;
      } catch (error) {
        console.error(`❌ 브랜드 ${result.brandId} 업데이트 실패:`, error.message);
      }
    }
    
    console.log(`✅ ${updatedCount}개 브랜드 결과 저장 완료`);

    // 성능 분석 리포트 생성
    const reportContent = generatePerformanceReport({
      totalTested,
      totalMatched,
      finalAccuracy,
      categoryAccuracy,
      failedBrands: failedBrands.slice(0, 50), // 상위 50개만
      testDate: new Date().toISOString()
    });

    // 리포트 파일 저장
    const fs = require('fs');
    const reportPath = `./test-results/keyword-test-report-${Date.now()}.md`;
    
    // 디렉토리 확인 및 생성
    if (!fs.existsSync('./test-results')) {
      fs.mkdirSync('./test-results', { recursive: true });
    }
    
    fs.writeFileSync(reportPath, reportContent);
    console.log(`📄 상세 리포트 저장: ${reportPath}`);

    console.log(`\n🎯 목표 달성 여부:`);
    if (parseFloat(finalAccuracy) >= 75) {
      console.log(`✅ 목표 달성! 현재 정확도 ${finalAccuracy}%가 목표 75% 이상입니다.`);
    } else {
      console.log(`❌ 목표 미달성. 현재 정확도 ${finalAccuracy}%가 목표 75% 미만입니다.`);
      console.log(`   추가 ${Math.ceil((75 * totalTested / 100) - totalMatched)}개 브랜드가 더 매칭되어야 합니다.`);
    }

    return {
      accuracy: parseFloat(finalAccuracy),
      totalTested,
      totalMatched,
      categoryStats: categoryAccuracy,
      failedBrands: failedBrands.slice(0, 100)
    };

  } catch (error) {
    console.error('❌ 테스트 실행 중 오류:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

function generatePerformanceReport(data) {
  const { totalTested, totalMatched, finalAccuracy, categoryAccuracy, failedBrands, testDate } = data;
  
  return `# 키워드 기반 브랜드 분류 테스트 리포트

## 테스트 개요
- **테스트 일시**: ${new Date(testDate).toLocaleString('ko-KR')}
- **총 테스트 브랜드**: ${totalTested.toLocaleString()}개
- **성공 분류**: ${totalMatched.toLocaleString()}개
- **최종 정확도**: **${finalAccuracy}%**

## 목표 달성 여부
${parseFloat(finalAccuracy) >= 75 
  ? '✅ **목표 달성!** 75% 이상 정확도 확보' 
  : '❌ **목표 미달성** - 추가 키워드 룰 필요'
}

## 카테고리별 성과 분석

| 카테고리 | 총 브랜드 | 성공 | 정확도 |
|---------|----------|------|--------|
${Object.entries(categoryAccuracy)
  .sort((a, b) => b[1].total - a[1].total)
  .slice(0, 20)
  .map(([category, stats]) => 
    `| ${category} | ${stats.total} | ${stats.matched} | ${stats.accuracy}% |`
  ).join('\n')}

## 성능 개선 영역

### 높은 성과 카테고리 (80% 이상)
${Object.entries(categoryAccuracy)
  .filter(([_, stats]) => parseFloat(stats.accuracy) >= 80 && stats.total >= 10)
  .sort((a, b) => parseFloat(b[1].accuracy) - parseFloat(a[1].accuracy))
  .slice(0, 10)
  .map(([category, stats]) => `- **${category}**: ${stats.accuracy}% (${stats.matched}/${stats.total})`)
  .join('\n')}

### 개선 필요 카테고리 (50% 미만)
${Object.entries(categoryAccuracy)
  .filter(([_, stats]) => parseFloat(stats.accuracy) < 50 && stats.total >= 10)
  .sort((a, b) => b[1].total - a[1].total)
  .slice(0, 10)
  .map(([category, stats]) => `- **${category}**: ${stats.accuracy}% (${stats.matched}/${stats.total}) - 키워드 룰 추가 필요`)
  .join('\n')}

## 실패 분석 (상위 50개)

### 공통 실패 패턴
${failedBrands.slice(0, 50).map((brand, index) => 
  `${index + 1}. **${brand.brandName}** (${brand.category})  
   - 거래문자열: "${brand.generatedString}"  
   - 기대태그: ${brand.priorityTag1}  
   - 추출키워드: [${brand.extractedKeywords.join(', ')}]  
`).join('\n')}

## 개선 권장사항

1. **키워드 룰 추가**: 실패한 브랜드들의 공통 패턴 분석 후 새로운 키워드 그룹 생성
2. **동의어 확장**: 기존 키워드 그룹에 실패한 브랜드명들을 동의어로 추가
3. **카테고리별 집중**: 브랜드 수가 많지만 정확도가 낮은 카테고리 우선 개선

---
*리포트 생성 시간: ${new Date().toLocaleString('ko-KR')}*
`;
}

// 실행
if (require.main === module) {
  testBrandsWithImprovedKeywords()
    .then((result) => {
      console.log('\n✅ 테스트 완료');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 테스트 실패:', error);
      process.exit(1);
    });
}

module.exports = { testBrandsWithImprovedKeywords };