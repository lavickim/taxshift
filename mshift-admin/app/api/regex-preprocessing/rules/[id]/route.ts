/**
 * 개별 정규식 규칙 CRUD API
 * GET /api/regex-preprocessing/rules/[id] - 특정 규칙 조회
 * PUT /api/regex-preprocessing/rules/[id] - 규칙 수정
 * DELETE /api/regex-preprocessing/rules/[id] - 규칙 삭제
 */

import { NextRequest, NextResponse } from 'next/server';
import { RegexRuleManagementService } from '@/lib/services/regex-preprocessing.service';

const ruleService = RegexRuleManagementService.getInstance();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid rule ID' },
        { status: 400 }
      );
    }
    
    const rule = await ruleService.getRuleById(id);
    
    if (!rule) {
      return NextResponse.json(
        { success: false, error: 'Rule not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: rule
    });
  } catch (error) {
    console.error('Failed to get rule:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get rule' 
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid rule ID' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    // 필수 필드 검증
    const requiredFields = ['ruleName', 'category', 'inputPattern', 'outputTemplate'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Missing required fields: ${missingFields.join(', ')}` 
        },
        { status: 400 }
      );
    }
    
    // 정규식 패턴 유효성 검증
    try {
      new RegExp(body.inputPattern);
    } catch (regexError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid regular expression pattern' 
        },
        { status: 400 }
      );
    }
    
    const updatedRule = await ruleService.updateRule(id, {
      ruleName: body.ruleName,
      description: body.description,
      category: body.category,
      inputPattern: body.inputPattern,
      outputTemplate: body.outputTemplate,
      priority: body.priority || 100,
      isActive: body.isActive !== undefined ? body.isActive : true,
      metadataTags: body.metadataTags,
      testCases: body.testCases
    });
    
    return NextResponse.json({
      success: true,
      data: updatedRule
    });
  } catch (error) {
    console.error('Failed to update rule:', error);
    
    if (error instanceof Error && error.message === 'Rule not found') {
      return NextResponse.json(
        { success: false, error: 'Rule not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update rule' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid rule ID' },
        { status: 400 }
      );
    }
    
    await ruleService.deleteRule(id);
    
    return NextResponse.json({
      success: true,
      message: 'Rule deleted successfully'
    });
  } catch (error) {
    console.error('Failed to delete rule:', error);
    
    if (error instanceof Error && error.message === 'Rule not found') {
      return NextResponse.json(
        { success: false, error: 'Rule not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete rule' 
      },
      { status: 500 }
    );
  }
}