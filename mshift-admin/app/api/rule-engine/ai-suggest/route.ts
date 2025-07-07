import { NextRequest, NextResponse } from 'next/server';
import { buildRuleEngineSuggestionPrompt } from '@/data/llm-prompts';

export async function POST(req: NextRequest) {
  try {
    const { keyword } = await req.json();

    if (!keyword || typeof keyword !== 'string') {
      return NextResponse.json(
        { success: false, error: '키워드가 필요합니다' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'GEMINI_API_KEY가 설정되지 않았습니다' },
        { status: 500 }
      );
    }

    // Gemini API 호출
    const prompt = buildRuleEngineSuggestionPrompt(keyword);
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Gemini API 호출 실패');
    }

    const data = await response.json();
    const result = JSON.parse(data.candidates[0].content.parts[0].text);

    // 응답 검증 및 정리
    const suggestionData = {
      confidence: Math.min(Math.max(result.confidence || 80, 0), 100),
      tags: result.primaryTag || '#기타경비',
      primary_tag: result.primaryTag || '#기타경비',
      primary_account: result.primaryAccount || '잡비',
      secondary_tag: result.secondaryTag || null,
      secondary_account: result.secondaryAccount || '보통예금',
      question: result.confidence < 90 ? (result.question || null) : null,
      reasoning: result.reasoning || '분석 결과'
    };

    return NextResponse.json({
      success: true,
      data: suggestionData
    });

  } catch (error) {
    console.error('AI 제안 오류:', error);
    return NextResponse.json(
      { success: false, error: 'AI 제안 생성 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
} 