/**
 * 정규식 전처리 규칙 관리 API
 * GET /api/regex-preprocessing/rules - 규칙 목록 조회
 * POST /api/regex-preprocessing/rules - 새 규칙 생성
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  RegexRuleManagementService, 
  CreateRuleRequest, 
  initializeDefaultCategories 
} from '@/lib/services/regex-preprocessing.service';

const ruleService = RegexRuleManagementService.getInstance();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const filters = {
      category: searchParams.get('category') || undefined,
      active: searchParams.get('active') ? searchParams.get('active') === 'true' : undefined,
      sortBy: searchParams.get('sortBy') || 'priority',
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
    };

    const rules = await ruleService.getRules(filters);
    
    return NextResponse.json({
      success: true,
      data: rules,
      total: rules.length
    });
  } catch (error) {
    console.error('Failed to fetch rules:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as CreateRuleRequest;
    
    // 입력 검증
    if (!body.ruleName || !body.category || !body.inputPattern || !body.outputTemplate) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: ruleName, category, inputPattern, outputTemplate' 
        },
        { status: 400 }
      );
    }

    // 기본 카테고리 초기화 (처음 실행 시)
    await initializeDefaultCategories();

    const rule = await ruleService.createRule(body);
    
    return NextResponse.json({
      success: true,
      data: rule
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to create rule:', error);
    
    // 검증 오류인 경우 400 반환
    if (error instanceof Error && (
      error.message.includes('Invalid regex pattern') ||
      error.message.includes('dangerous regex pattern')
    )) {
      return NextResponse.json(
        { 
          success: false, 
          error: error.message 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}