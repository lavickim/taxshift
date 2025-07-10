import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';

export async function GET(req: NextRequest) {
  try {
    // DB에서 룰 후보 목록 조회
    const candidates = await prisma.ruleEngineCandidate.findMany({
      where: {
        isApproved: false
      },
      orderBy: [
        { suggestionCount: 'desc' },
        { lastSuggested: 'desc' }
      ]
    });

    return NextResponse.json({
      success: true,
      candidates: candidates,
      totalCount: candidates.length
    });

  } catch (error) {
    console.error('룰 후보 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '룰 후보 조회 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

// 룰 후보 승급 API
export async function POST(req: NextRequest) {
  try {
    const { candidateId } = await req.json();

    if (!candidateId) {
      return NextResponse.json(
        { success: false, error: '후보 ID가 필요합니다' },
        { status: 400 }
      );
    }

    // 후보 조회
    const candidate = await prisma.ruleEngineCandidate.findUnique({
      where: { id: candidateId }
    });

    if (!candidate) {
      return NextResponse.json(
        { success: false, error: '후보를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // 이미 승급된 경우
    if (candidate.isApproved) {
      return NextResponse.json(
        { success: false, error: '이미 승급된 후보입니다' },
        { status: 400 }
      );
    }

    // 트랜잭션으로 후보 승급 처리
    const [newRule, updatedCandidate] = await prisma.$transaction([
      // 새 룰 생성
      prisma.ruleEngine.create({
        data: {
          keyword: candidate.keyword,
          confidence: 70, // 기본 신뢰도
          primaryTag: candidate.tag,
          primaryAccount: candidate.account,
          createdBy: 'AUTO_GENERATED'
        }
      }),
      // 후보 승급 처리
      prisma.ruleEngineCandidate.update({
        where: { id: candidateId },
        data: {
          isApproved: true,
          approvedAt: new Date(),
          approvedBy: 'ADMIN'
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      rule: newRule
    });

  } catch (error) {
    console.error('룰 후보 승급 오류:', error);
    return NextResponse.json(
      { success: false, error: '룰 후보 승급 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
} 