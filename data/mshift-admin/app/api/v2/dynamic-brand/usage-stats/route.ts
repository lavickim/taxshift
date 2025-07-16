import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')

    // 브랜드 사용 통계 조회 - franchise_brands 테이블에서 테스트 결과가 있는 브랜드들
    const brandStats = await prisma.franchiseBrands.findMany({
      where: {
        AND: [
          { generatedTransactionString: { not: null } },
          { testResult: { not: null } }
        ]
      },
      select: {
        brandName: true,
        companyName: true,
        industryLargeCategory: true,
        primaryTag: true,
        testResult: true,
        updatedAt: true
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: limit
    })

    // 브랜드별 사용 통계 변환 (실제로는 별도 테이블에서 관리해야 함)
    const usageStats = brandStats.map((brand, index) => ({
      brandName: brand.brandName,
      usageCount: Math.floor(Math.random() * 20) + 1, // 임시 랜덤값
      lastUsed: brand.updatedAt?.toISOString() || new Date().toISOString(),
      autoRegistered: index % 3 === 0, // 임시: 1/3은 자동 등록으로 처리
      confidence: brand.testResult ? 0.85 + Math.random() * 0.1 : 0.6 + Math.random() * 0.2,
      tag: brand.primaryTag || '기타',
      industry: brand.industryLargeCategory || '기타',
      companyName: brand.companyName
    }))

    // 사용 횟수로 정렬
    usageStats.sort((a, b) => b.usageCount - a.usageCount)

    return NextResponse.json(usageStats)

  } catch (error) {
    console.error('브랜드 사용 통계 조회 오류:', error)
    return NextResponse.json(
      { error: '브랜드 사용 통계 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}