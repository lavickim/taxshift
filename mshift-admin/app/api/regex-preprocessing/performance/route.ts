/**
 * 정규식 전처리 성능 통계 API
 * GET /api/regex-preprocessing/performance - 성능 통계 조회
 */
import { NextRequest, NextResponse } from 'next/server';

import { RegexPerformanceService } from '@/lib/services/regex-preprocessing.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d'; // 1d, 7d, 30d

    if (!['1d', '7d', '30d'].includes(period)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid period. Use 1d, 7d, or 30d',
        },
        { status: 400 }
      );
    }

    const stats = await RegexPerformanceService.getPerformanceStats(period);

    return NextResponse.json({
      success: true,
      data: stats,
      period,
    });
  } catch (error) {
    console.error('Failed to fetch performance stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
