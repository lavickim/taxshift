/**
 * 정규식 규칙 테스트 API
 * POST /api/regex-preprocessing/rules/[id]/test - 특정 규칙 테스트 실행
 */
import { NextRequest, NextResponse } from 'next/server';

import { RegexRuleManagementService } from '@/lib/services/regex-preprocessing.service';

const ruleService = RegexRuleManagementService.getInstance();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ruleId = parseInt(params.id);

    if (isNaN(ruleId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid rule ID',
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { testInputs } = body;

    if (!Array.isArray(testInputs)) {
      return NextResponse.json(
        {
          success: false,
          error: 'testInputs must be an array of strings',
        },
        { status: 400 }
      );
    }

    const result = await ruleService.testRule(ruleId, testInputs);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Failed to test rule:', error);

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
