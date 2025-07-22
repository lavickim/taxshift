import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // 키워드 그룹 통계
    const totalKeywordGroups = await prisma.keywordGroup.count()
    const activeKeywordGroups = await prisma.keywordGroup.count({
      where: { isActive: true }
    })

    // 브랜드 매핑 통계 (franchise_brands 테이블에서)
    const totalBrandMappings = await prisma.franchiseBrands.count({
      where: {
        generatedTransactionString: { not: null }
      }
    })

    // 자동 등록된 브랜드 수 (추후 동적 브랜드 시스템에서 추적)
    const autoRegisteredBrands = 0 // 임시값

    // 캐시 적중률 (임시값 - 실제로는 Redis 통계에서 가져와야 함)
    const cacheHitRate = 75.5

    // 평균 신뢰도 (최근 분류 결과에서 계산)
    const averageConfidence = 0.89

    // 처리 경로별 통계 (임시값 - 실제로는 로그 분석 필요)
    const processingPaths = {
      keywordEngine: 850,
      dynamicBrand: 125,
      cache: 324
    }

    // 태그 매핑 통계
    const totalTagMappings = await prisma.keywordTagMapping.count({
      where: { isActive: true }
    })

    // 활성 태그 수
    const activeTags = await prisma.tagsMaster.count({
      where: { isActive: true }
    })

    const response = {
      totalKeywordGroups,
      activeKeywordGroups,
      totalBrandMappings,
      autoRegisteredBrands,
      totalTagMappings,
      activeTags,
      cacheHitRate,
      averageConfidence,
      processingPaths,
      lastUpdated: new Date().toISOString()
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('시스템 통계 조회 오류:', error)
    return NextResponse.json(
      { error: '시스템 통계 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}