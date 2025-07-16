import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const testStatus = searchParams.get('testStatus') || 'all';
    const industry = searchParams.get('industry') || 'all';
    const primaryTag = searchParams.get('primaryTag') || 'all';
    const search = searchParams.get('search') || '';

    // 필터 조건 구성
    const where: any = {};
    
    if (testStatus !== 'all') {
      switch (testStatus) {
        case 'tested':
          where.testPassed = { not: null };
          break;
        case 'untested':
          where.testPassed = null;
          break;
        case 'passed':
          where.testPassed = true;
          break;
        case 'failed':
          where.testPassed = false;
          break;
      }
    }

    if (industry !== 'all') {
      where.industryLargeCategory = { contains: industry };
    }

    if (primaryTag !== 'all') {
      where.primaryTag = primaryTag;
    }

    if (search) {
      where.OR = [
        { brandName: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } }
      ];
    }

    // 총 개수 조회
    const totalItems = await prisma.franchiseBrands.count({ where });

    // 페이지네이션 적용하여 데이터 조회
    const brands = await prisma.franchiseBrands.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [
        { testPassed: 'asc' }, // 미테스트 -> 실패 -> 성공 순
        { lastTestAt: 'desc' }
      ],
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
        tertiaryTag: true,
        testPassed: true,
        lastTestAt: true,
        testResult: true,
        tagGenerationReason: true
      }
    });

    const totalPages = Math.ceil(totalItems / limit);

    return NextResponse.json({
      brands,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit
      }
    });

  } catch (error) {
    console.error('Error fetching brands:', error);
    return NextResponse.json(
      { error: 'Failed to fetch brands' },
      { status: 500 }
    );
  }
}