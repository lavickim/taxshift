import { NextResponse } from 'next/server';

import { prisma } from '@/lib/db/client';

export async function GET() {
  try {
    // 기본 통계
    const totalBrands = await prisma.datacollection_franchise_brands.count();
    const testedBrands = await prisma.datacollection_franchise_brands.count({
      where: { testPassed: { not: null } },
    });
    const passedBrands = await prisma.datacollection_franchise_brands.count({
      where: { testPassed: true },
    });
    const failedBrands = await prisma.datacollection_franchise_brands.count({
      where: { testPassed: false },
    });

    // 상위 태그 통계
    const topTags = await prisma.datacollection_franchise_brands.groupBy({
      by: ['primaryTag'],
      _count: {
        primaryTag: true,
      },
      where: {
        primaryTag: { not: null },
      },
      orderBy: {
        _count: {
          primaryTag: 'desc',
        },
      },
      take: 10,
    });

    const formattedTopTags = topTags.map(tag => ({
      tag: tag.primaryTag || '미분류',
      count: tag._count.primaryTag,
    }));

    // 산업분류별 통계
    const industryStats = await prisma.datacollection_franchise_brands.groupBy({
      by: ['industryLargeCategory'],
      _count: {
        industryLargeCategory: true,
      },
      where: {
        industryLargeCategory: { not: null },
      },
      orderBy: {
        _count: {
          industryLargeCategory: 'desc',
        },
      },
      take: 10,
    });

    const formattedIndustryStats = industryStats.map(industry => ({
      industry: industry.industryLargeCategory || '미분류',
      count: industry._count.industryLargeCategory,
    }));

    // 테스트 성공률 추이 (최근 7일)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentTests = await prisma.datacollection_franchise_brands.findMany({
      where: {
        lastTestAt: {
          gte: sevenDaysAgo,
        },
      },
      select: {
        lastTestAt: true,
        testPassed: true,
      },
      orderBy: {
        lastTestAt: 'asc',
      },
    });

    // 일별 성공률 계산
    const dailyStats = new Map();
    recentTests.forEach(test => {
      if (test.lastTestAt) {
        const date = test.lastTestAt.toISOString().split('T')[0];
        if (!dailyStats.has(date)) {
          dailyStats.set(date, { total: 0, passed: 0 });
        }
        const stats = dailyStats.get(date);
        stats.total++;
        if (test.testPassed) {
          stats.passed++;
        }
      }
    });

    const successRateTrend = Array.from(dailyStats.entries()).map(
      ([date, stats]) => ({
        date,
        successRate: stats.total > 0 ? (stats.passed / stats.total) * 100 : 0,
        total: stats.total,
        passed: stats.passed,
      })
    );

    return NextResponse.json({
      totalBrands,
      testedBrands,
      passedBrands,
      failedBrands,
      topTags: formattedTopTags,
      industryStats: formattedIndustryStats,
      successRateTrend,
    });
  } catch (error) {
    console.error('Error fetching brand statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
