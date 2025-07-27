import { NextRequest, NextResponse } from 'next/server';

import { PrismaClient } from '../../../../lib/generated/prisma';

const prisma = new PrismaClient();

// GET - 통합 regex rules 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pattern_type = searchParams.get('pattern_type');
    const category = searchParams.get('category');

    const whereClause: any = {};

    if (pattern_type && pattern_type !== 'all') {
      whereClause.pattern_type = pattern_type;
    }

    if (category && category !== 'all') {
      whereClause.category = category;
    }

    const rules = await prisma.regex_rules.findMany({
      where: whereClause,
      orderBy: [
        { pattern_type: 'asc' },
        { priority: 'desc' },
        { confidence: 'desc' },
        { created_at: 'desc' },
      ],
    });

    // BigInt ID를 문자열로 변환
    const serializedRules = rules.map(rule => ({
      ...rule,
      id: rule.id.toString(),
      confidence: rule.confidence ? Number(rule.confidence) : null,
      success_rate: rule.success_rate ? Number(rule.success_rate) : null,
    }));

    return NextResponse.json(serializedRules);
  } catch (error) {
    console.error('통합 regex rules 조회 오류:', error);
    return NextResponse.json(
      { error: '통합 regex rules 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// POST - 새 통합 regex rule 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      pattern,
      replacement,
      description,
      category,
      enabled,
      priority,
      confidence,
      normalizer_type,
      pattern_type,
      keyword,
      tags,
      primary_tag,
      primary_account,
      secondary_tag,
      secondary_account,
      is_active,
    } = body;

    // 필수 필드 검증
    if (!description || !category) {
      return NextResponse.json(
        { error: '설명과 카테고리는 필수입니다.' },
        { status: 400 }
      );
    }

    if (pattern_type === 'BRAND' && !pattern) {
      return NextResponse.json(
        { error: '브랜드 패턴에는 정규식 패턴이 필요합니다.' },
        { status: 400 }
      );
    }

    if (pattern_type === 'KEYWORD' && !keyword) {
      return NextResponse.json(
        { error: '키워드 패턴에는 키워드가 필요합니다.' },
        { status: 400 }
      );
    }

    // 중복 검사
    const existingRule = await prisma.regex_rules.findFirst({
      where: {
        OR: [
          ...(pattern ? [{ pattern }] : []),
          ...(keyword ? [{ keyword }] : []),
        ],
      },
    });

    if (existingRule) {
      return NextResponse.json(
        { error: '이미 존재하는 패턴 또는 키워드입니다.' },
        { status: 400 }
      );
    }

    const newRule = await prisma.regex_rules.create({
      data: {
        pattern: pattern || keyword, // KEYWORD 타입의 경우 pattern에 keyword 저장
        replacement,
        description,
        category,
        enabled: enabled !== undefined ? enabled : true,
        priority: priority || 50,
        confidence: confidence || 0.8,
        normalizer_type,
        pattern_type: pattern_type || 'BRAND',
        keyword,
        tags,
        primary_tag,
        primary_account,
        secondary_tag,
        secondary_account,
        usage_count: 0,
        positive_count: 0,
        negative_count: 0,
        is_active: is_active !== undefined ? is_active : true,
        created_by: 'ADMIN',
        success_rate: null,
      },
    });

    // BigInt ID를 문자열로 변환
    const serializedRule = {
      ...newRule,
      id: newRule.id.toString(),
      confidence: newRule.confidence ? Number(newRule.confidence) : null,
      success_rate: newRule.success_rate ? Number(newRule.success_rate) : null,
    };

    return NextResponse.json(serializedRule);
  } catch (error) {
    console.error('통합 regex rule 생성 오류:', error);
    return NextResponse.json(
      { error: '통합 regex rule 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
