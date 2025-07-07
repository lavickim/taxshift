import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';

export async function GET(req: NextRequest) {
  try {
    // DB에서 룰 목록 조회
    const rules = await prisma.ruleEngine.findMany({
      where: {
        isActive: true
      },
      orderBy: [
        { confidence: 'desc' },
        { usageCount: 'desc' }
      ]
    });

    return NextResponse.json({
      success: true,
      rules: rules,
      totalCount: rules.length
    });

  } catch (error) {
    console.error('룰 목록 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '룰 목록 조회 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

// 새 룰 생성 API
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      keyword,
      confidence = 70,
      question,
      primaryTag,
      primaryAccount,
      secondaryTag,
      secondaryAccount
    } = body;

    // 필수 필드 검증
    if (!keyword || !primaryTag || !primaryAccount) {
      return NextResponse.json(
        { success: false, error: '필수 필드가 누락되었습니다' },
        { status: 400 }
      );
    }

    // 중복 키워드 검사
    const existing = await prisma.ruleEngine.findUnique({
      where: { keyword }
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: '이미 존재하는 키워드입니다' },
        { status: 400 }
      );
    }

    // 새 룰 생성
    const newRule = await prisma.ruleEngine.create({
      data: {
        keyword,
        confidence,
        question,
        primaryTag,
        primaryAccount,
        secondaryTag,
        secondaryAccount,
        createdBy: 'ADMIN'
      }
    });

    return NextResponse.json({
      success: true,
      rule: newRule
    });

  } catch (error) {
    console.error('룰 생성 오류:', error);
    return NextResponse.json(
      { success: false, error: '룰 생성 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
} 