import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient()

const KEYWORD_CLASSIFY_API = 'http://localhost:8080/v2/keyword-system/classify'

export async function POST(request: NextRequest) {
  try {
    const { sampleSize = 200 } = await request.json()

    // 기대 태그가 명확한 브랜드들을 선택
    const testBrands = await prisma.franchiseBrands.findMany({
      where: {
        AND: [
          { generatedTransactionString: { not: null } },
          { primaryTag: { not: '기타' } },
          { primaryTag: { not: null } }
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
        primaryTag: true
      },
      orderBy: { id: 'asc' },
      take: sampleSize
    })

    // 태그 매핑 테이블 조회
    const tagMappings = await prisma.tagsMaster.findMany({
      where: { isActive: true },
      select: {
        id: true,
        tagName: true,
        tagCategory: true,
        description: true
      }
    })

    // 태그 ID -> 태그명 매핑
    const tagIdToName: Record<string, string> = {}
    for (const tag of tagMappings) {
      tagIdToName[tag.id.toString()] = tag.tagName
      tagIdToName[`태그_${tag.id}`] = tag.tagName
    }

    let results = []
    let successCases = []
    let failureCases = []

    // 배치별로 처리
    const batchSize = 25
    for (let i = 0; i < testBrands.length; i += batchSize) {
      const batch = testBrands.slice(i, i + batchSize)
      
      const batchPromises = batch.map(async (brand) => {
        try {
          const response = await fetch(KEYWORD_CLASSIFY_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              description: brand.generatedTransactionString,
              amount: 10000
            })
          })

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
          }

          const result = await response.json()
          
          // 태그 정확성 검증
          const actualTagName = tagIdToName[result.tag] || result.tag || 'UNKNOWN'
          const expectedTag = brand.primaryTag

          // 태그 정확성 판단
          let isCorrect = false
          let classificationStatus = 'INCORRECT'
          
          if (actualTagName === expectedTag) {
            isCorrect = true
            classificationStatus = 'EXACT_MATCH'
          } else if (actualTagName && expectedTag) {
            // 유사 태그 매칭
            const similarityPairs = [
              ['커피전문점', '커피'],
              ['제과제빵', '베이커리'],
              ['치킨전문점', '치킨'],
              ['패스트푸드', '햄버거'],
              ['한식전문점', '한식'],
              ['이미용', '뷰티'],
              ['스포츠시설', '스포츠'],
              ['편의점', '마트'],
              ['디저트전문점', '디저트'],
              ['피자전문점', '피자']
            ]
            
            for (const [tag1, tag2] of similarityPairs) {
              if ((actualTagName.includes(tag1) && expectedTag.includes(tag2)) ||
                  (actualTagName.includes(tag2) && expectedTag.includes(tag1)) ||
                  (actualTagName === tag1 && expectedTag === tag2) ||
                  (actualTagName === tag2 && expectedTag === tag1)) {
                isCorrect = true
                classificationStatus = 'SIMILAR_MATCH'
                break
              }
            }
          }

          const testResult = {
            brandId: brand.id,
            brandName: brand.brandName,
            companyName: brand.companyName,
            industryCategory: brand.industryLargeCategory,
            industrySubCategory: brand.industryMediumCategory,
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
          }

          // 성공/실패 분류
          if (isCorrect && result.matched) {
            successCases.push(testResult)
          } else {
            failureCases.push(testResult)
          }

          return testResult
          
        } catch (error) {
          const failedResult = {
            brandId: brand.id,
            brandName: brand.brandName,
            industryCategory: brand.industryLargeCategory,
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
          }
          
          failureCases.push(failedResult)
          return failedResult
        }
      })

      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)
      
      // 배치 간 대기
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    const finalSuccessRate = (successCases.length / results.length * 100)

    // 처리 경로별 분석
    const processingPathCounts: Record<string, number> = {}
    successCases.forEach(success => {
      const path = success.processingPath
      processingPathCounts[path] = (processingPathCounts[path] || 0) + 1
    })

    // 분류 상태별 분석
    const classificationStatusCounts: Record<string, number> = {}
    successCases.forEach(success => {
      const status = success.classificationStatus
      classificationStatusCounts[status] = (classificationStatusCounts[status] || 0) + 1
    })

    // 산업별 성공률
    const industrySuccessRates: Record<string, number> = {}
    const industryTotals: Record<string, number> = {}
    
    results.forEach(result => {
      const industry = result.industryCategory || '기타'
      industryTotals[industry] = (industryTotals[industry] || 0) + 1
      
      if (result.isCorrectClassification) {
        industrySuccessRates[industry] = (industrySuccessRates[industry] || 0) + 1
      }
    })

    // 신뢰도 분석
    const confidenceRanges = {
      '0.90-1.00': 0,
      '0.80-0.89': 0,
      '0.70-0.79': 0,
      '0.60-0.69': 0,
      '0.50-0.59': 0,
      '0.00-0.49': 0
    }
    
    successCases.forEach(success => {
      const confidence = success.confidence
      if (confidence >= 0.90) confidenceRanges['0.90-1.00']++
      else if (confidence >= 0.80) confidenceRanges['0.80-0.89']++
      else if (confidence >= 0.70) confidenceRanges['0.70-0.79']++
      else if (confidence >= 0.60) confidenceRanges['0.60-0.69']++
      else if (confidence >= 0.50) confidenceRanges['0.50-0.59']++
      else confidenceRanges['0.00-0.49']++
    })

    // 분석 결과 변환
    const industryBreakdown = Object.entries(industryTotals).map(([industry, total]) => ({
      industry,
      successRate: ((industrySuccessRates[industry] || 0) / total) * 100,
      count: total
    })).sort((a, b) => b.successRate - a.successRate)

    const confidenceDistribution = Object.entries(confidenceRanges).map(([range, count]) => ({
      range,
      count,
      percentage: successCases.length > 0 ? (count / successCases.length * 100) : 0
    }))

    const exactMatchRate = classificationStatusCounts['EXACT_MATCH'] ? 
      (classificationStatusCounts['EXACT_MATCH'] / successCases.length * 100) : 0
    const similarMatchRate = classificationStatusCounts['SIMILAR_MATCH'] ? 
      (classificationStatusCounts['SIMILAR_MATCH'] / successCases.length * 100) : 0

    const analysisResult = {
      totalTests: results.length,
      successCases: successCases.length,
      failureCases: failureCases.length,
      successRate: finalSuccessRate,
      exactMatchRate,
      similarMatchRate,
      processingPathDistribution: processingPathCounts,
      classificationStatusDistribution: classificationStatusCounts,
      industryBreakdown,
      confidenceDistribution,
      keywordEngineSuccessRate: processingPathCounts['KEYWORD_ENGINE'] ? 
        (processingPathCounts['KEYWORD_ENGINE'] / successCases.length * 100) : 0,
      dynamicBrandSuccessRate: processingPathCounts['DYNAMIC_BRAND'] ? 
        (processingPathCounts['DYNAMIC_BRAND'] / successCases.length * 100) : 0,
      analyzedAt: new Date().toISOString()
    }

    return NextResponse.json(analysisResult)

  } catch (error) {
    console.error('성공 케이스 분석 오류:', error)
    return NextResponse.json(
      { error: '성공 케이스 분석 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}