import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';

export async function POST(req: NextRequest) {
  try {
    const {
      ruleId,
      transactionText,
      normalizedText,
      selectedOption,
      selectedTag,
      selectedAccount,
      source
    } = await req.json();

    // 필수 필드 검증
    if (!transactionText || !normalizedText || selectedOption === undefined || !selectedTag || !selectedAccount) {
      return NextResponse.json(
        { success: false, error: '필수 필드가 누락되었습니다' },
        { status: 400 }
      );
    }

    // 룰 기반 피드백 처리
    if (source === 'rule' && ruleId) {
      const rule = await prisma.ruleEngine.findUnique({
        where: { id: ruleId }
      });

      if (!rule) {
        return NextResponse.json(
          { success: false, error: '룰을 찾을 수 없습니다' },
          { status: 404 }
        );
      }

      // 피드백 저장
      await prisma.ruleEngineFeedback.create({
        data: {
          ruleId,
          transactionText,
          normalizedText,
          selectedOption,
          selectedTag,
          selectedAccount,
          feedbackType: selectedOption === 0 ? 'POSITIVE' : 'NEGATIVE'
        }
      });

      // 신뢰도 업데이트
      if (selectedOption === 0) {
        // 긍정 피드백 - 신뢰도 +1 (최대 100)
        await prisma.ruleEngine.update({
          where: { id: ruleId },
          data: {
            confidence: Math.min(rule.confidence + 1, 100),
            positiveCount: { increment: 1 }
          }
        });
      } else {
        // 부정 피드백 - 신뢰도 -2 (최소 0)
        await prisma.ruleEngine.update({
          where: { id: ruleId },
          data: {
            confidence: Math.max(rule.confidence - 2, 0),
            negativeCount: { increment: 1 }
          }
        });

        // 2순위가 있는 경우 1순위와 2순위 교체
        if (rule.secondaryTag && rule.secondaryAccount) {
          await prisma.ruleEngine.update({
            where: { id: ruleId },
            data: {
              primaryTag: rule.secondaryTag,
              primaryAccount: rule.secondaryAccount,
              secondaryTag: rule.primaryTag,
              secondaryAccount: rule.primaryAccount
            }
          });
        }
      }
    } 
    // LLM 기반 피드백 처리 (새 후보 생성)
    else if (source === 'llm') {
      // 피드백 저장
      await prisma.ruleEngineFeedback.create({
        data: {
          transactionText,
          normalizedText,
          selectedOption,
          selectedTag,
          selectedAccount,
          feedbackType: 'NEW_CANDIDATE'
        }
      });

      // 기존 후보 확인 또는 생성
      const existingCandidate = await prisma.ruleEngineCandidate.findFirst({
        where: {
          keyword: normalizedText,
          tag: selectedTag,
          account: selectedAccount
        }
      });

      if (existingCandidate) {
        // 기존 후보의 제안 횟수 증가
        await prisma.ruleEngineCandidate.update({
          where: { id: existingCandidate.id },
          data: {
            suggestionCount: { increment: 1 },
            lastSuggested: new Date()
          }
        });
      } else {
        // 새 후보 생성
        await prisma.ruleEngineCandidate.create({
          data: {
            keyword: normalizedText,
            tag: selectedTag,
            account: selectedAccount,
            suggestionCount: 1
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: '피드백이 저장되었습니다'
    });

  } catch (error) {
    console.error('피드백 저장 오류:', error);
    return NextResponse.json(
      { success: false, error: '피드백 저장 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
} 