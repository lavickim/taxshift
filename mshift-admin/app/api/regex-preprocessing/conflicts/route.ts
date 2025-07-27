/**
 * 정규식 규칙 충돌 감지 API
 * GET /api/regex-preprocessing/conflicts - 모든 충돌 분석
 */
import { NextRequest, NextResponse } from 'next/server';

import { RegexConflictDetectionService } from '@/lib/services/regex-preprocessing.service';

const conflictService = RegexConflictDetectionService.getInstance();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ruleId = searchParams.get('ruleId');

    let conflicts;

    if (ruleId) {
      // 특정 규칙의 충돌만 분석
      const id = parseInt(ruleId);
      if (isNaN(id)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid rule ID',
          },
          { status: 400 }
        );
      }

      conflicts = await conflictService.analyzeRuleConflicts(id);
    } else {
      // 모든 규칙의 충돌 분석
      conflicts = await conflictService.analyzeAllConflicts();
    }

    return NextResponse.json({
      success: true,
      data: {
        conflicts,
        summary: {
          totalConflicts: conflicts.length,
          criticalConflicts: conflicts.filter(c => c.impactLevel === 'critical')
            .length,
          warningConflicts: conflicts.filter(c => c.impactLevel === 'warning')
            .length,
          infoConflicts: conflicts.filter(c => c.impactLevel === 'info').length,
          averageOverlapPercentage:
            conflicts.length > 0
              ? conflicts.reduce((sum, c) => sum + c.overlapPercentage, 0) /
                conflicts.length
              : 0,
        },
      },
    });
  } catch (error) {
    console.error('Failed to analyze conflicts:', error);

    if (error instanceof Error && error.message === 'Rule not found') {
      return NextResponse.json(
        {
          success: false,
          error: 'Rule not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
