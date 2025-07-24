import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../../../lib/generated/prisma";

const prisma = new PrismaClient();

// PUT - 통합 regex rule 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const ruleId = parseInt(resolvedParams.id);
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

    // 규칙 존재 확인
    const existingRule = await prisma.regex_rules.findUnique({
      where: { id: BigInt(ruleId) },
    });

    if (!existingRule) {
      return NextResponse.json(
        { error: "규칙을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 필수 필드 검증
    if (!description || !category) {
      return NextResponse.json(
        { error: "설명과 카테고리는 필수입니다." },
        { status: 400 }
      );
    }

    if (pattern_type === "BRAND" && !pattern) {
      return NextResponse.json(
        { error: "브랜드 패턴에는 정규식 패턴이 필요합니다." },
        { status: 400 }
      );
    }

    if (pattern_type === "KEYWORD" && !keyword) {
      return NextResponse.json(
        { error: "키워드 패턴에는 키워드가 필요합니다." },
        { status: 400 }
      );
    }

    const updatedRule = await prisma.regex_rules.update({
      where: { id: BigInt(ruleId) },
      data: {
        pattern: pattern || keyword,
        replacement,
        description,
        category,
        enabled: enabled !== undefined ? enabled : existingRule.enabled,
        priority: priority !== undefined ? priority : existingRule.priority,
        confidence: confidence !== undefined ? confidence : existingRule.confidence,
        normalizer_type,
        pattern_type: pattern_type || existingRule.pattern_type,
        keyword,
        tags,
        primary_tag,
        primary_account,
        secondary_tag,
        secondary_account,
        is_active: is_active !== undefined ? is_active : existingRule.is_active,
        updated_at: new Date(),
      },
    });

    // BigInt ID를 문자열로 변환
    const serializedRule = {
      ...updatedRule,
      id: updatedRule.id.toString(),
      confidence: updatedRule.confidence ? Number(updatedRule.confidence) : null,
      success_rate: updatedRule.success_rate ? Number(updatedRule.success_rate) : null,
    };

    return NextResponse.json(serializedRule);
  } catch (error) {
    console.error("통합 regex rule 수정 오류:", error);
    return NextResponse.json(
      { error: "통합 regex rule 수정 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// DELETE - 통합 regex rule 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const ruleId = parseInt(resolvedParams.id);

    // 규칙 존재 확인
    const existingRule = await prisma.regex_rules.findUnique({
      where: { id: BigInt(ruleId) },
    });

    if (!existingRule) {
      return NextResponse.json(
        { error: "규칙을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    await prisma.regex_rules.delete({
      where: { id: BigInt(ruleId) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("통합 regex rule 삭제 오류:", error);
    return NextResponse.json(
      { error: "통합 regex rule 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}