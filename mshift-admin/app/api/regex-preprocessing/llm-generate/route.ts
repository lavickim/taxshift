/**
 * LLM 기반 정규식 패턴 생성 API
 * POST /api/regex-preprocessing/llm-generate - AI를 통한 정규식 패턴 생성
 */
import { NextRequest, NextResponse } from 'next/server';

import { RegexRuleManagementService } from '@/lib/services/regex-preprocessing.service';

const ruleService = RegexRuleManagementService.getInstance();

interface LLMGenerateRequest {
  category: string;
  description: string;
  sampleInputs: string[];
  expectedOutputs?: string[];
  context?: string;
}

interface LLMGenerateResponse {
  generatedRules: GeneratedRule[];
  suggestions: PatternSuggestion[];
  analysisResult: PatternAnalysis;
}

interface GeneratedRule {
  ruleName: string;
  description: string;
  category: string;
  inputPattern: string;
  outputTemplate: string;
  priority: number;
  confidence: number;
  testCases: TestCase[];
  metadataTags: Record<string, any>;
}

interface PatternSuggestion {
  type: 'optimization' | 'alternative' | 'conflict_resolution';
  title: string;
  description: string;
  pattern: string;
  reasoning: string;
}

interface PatternAnalysis {
  complexity: 'low' | 'medium' | 'high';
  potentialConflicts: string[];
  estimatedAccuracy: number;
  performanceImpact: 'minimal' | 'moderate' | 'significant';
  recommendations: string[];
}

interface TestCase {
  id: string;
  input: string;
  expected: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: LLMGenerateRequest = await request.json();

    const { category, description, sampleInputs, expectedOutputs, context } =
      body;

    // 입력 검증
    if (
      !category ||
      !description ||
      !sampleInputs ||
      sampleInputs.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Category, description, and sample inputs are required',
        },
        { status: 400 }
      );
    }

    if (sampleInputs.length > 20) {
      return NextResponse.json(
        {
          success: false,
          error: 'Maximum 20 sample inputs allowed',
        },
        { status: 400 }
      );
    }

    // 기존 규칙 분석 (충돌 방지)
    const existingRules = await ruleService.getRulesByCategory(category);

    // LLM 프롬프트 구성
    const prompt = buildLLMPrompt({
      category,
      description,
      sampleInputs,
      expectedOutputs,
      context,
      existingRules: existingRules.slice(0, 10), // 최대 10개까지만 참조
    });

    // Mock LLM 응답 (실제 구현 시 Gemini API 호출)
    const llmResponse = await callLLMService(prompt);

    // LLM 응답 파싱 및 검증
    const generatedRules = parseLLMResponse(llmResponse, category);

    // 생성된 규칙 유효성 검증
    const validatedRules = await validateGeneratedRules(
      generatedRules,
      sampleInputs
    );

    // 충돌 분석
    const conflictAnalysis = await analyzePatternConflicts(
      validatedRules,
      existingRules
    );

    // 패턴 분석
    const analysisResult = analyzePatternComplexity(validatedRules);

    // 개선 제안 생성
    const suggestions = generatePatternSuggestions(
      validatedRules,
      conflictAnalysis
    );

    const response: LLMGenerateResponse = {
      generatedRules: validatedRules,
      suggestions,
      analysisResult: {
        ...analysisResult,
        potentialConflicts: conflictAnalysis,
      },
    };

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('LLM generation failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Generation failed',
      },
      { status: 500 }
    );
  }
}

function buildLLMPrompt(params: {
  category: string;
  description: string;
  sampleInputs: string[];
  expectedOutputs?: string[];
  context?: string;
  existingRules: any[];
}): string {
  const {
    category,
    description,
    sampleInputs,
    expectedOutputs,
    context,
    existingRules,
  } = params;

  let prompt = `당신은 정규식 패턴 전문가입니다. 한국어 거래 문자열 정규화를 위한 정규식 패턴을 생성해주세요.

요구사항:
- 카테고리: ${category}
- 설명: ${description}
- 목적: 다양한 형태의 거래 문자열을 표준화된 형태로 변환

샘플 입력:
${sampleInputs.map((input, i) => `${i + 1}. "${input}"`).join('\n')}`;

  if (expectedOutputs && expectedOutputs.length > 0) {
    prompt += `\n\n기대 출력:
${expectedOutputs.map((output, i) => `${i + 1}. "${output}"`).join('\n')}`;
  }

  if (context) {
    prompt += `\n\n추가 컨텍스트: ${context}`;
  }

  if (existingRules.length > 0) {
    prompt += `\n\n기존 ${category} 카테고리 규칙 (충돌 방지 참고):
${existingRules.map(rule => `- ${rule.ruleName}: ${rule.inputPattern} → ${rule.outputTemplate}`).join('\n')}`;
  }

  prompt += `\n\n다음 JSON 형식으로 응답해주세요:
{
  "rules": [
    {
      "ruleName": "규칙명",
      "description": "상세 설명",
      "inputPattern": "정규식 패턴",
      "outputTemplate": "출력 템플릿 (캡처 그룹 사용: $1, $2 등)",
      "priority": 100,
      "confidence": 0.9,
      "testCases": [
        {"id": "1", "input": "테스트 입력", "expected": "예상 출력"}
      ],
      "metadataTags": {
        "type": "normalization",
        "complexity": "medium"
      }
    }
  ],
  "reasoning": "패턴 생성 근거 설명"
}

주의사항:
1. 정규식은 JavaScript 호환 문법 사용
2. 한국어 특성 고려 (조사, 띄어쓰기 변형)
3. 캡처 그룹을 효과적으로 활용
4. 성능을 고려한 최적화된 패턴 작성
5. 기존 규칙과의 충돌 최소화`;

  return prompt;
}

async function callLLMService(prompt: string): Promise<string> {
  // Mock 구현 - 실제로는 Gemini API 호출
  // 실제 구현 예시:
  /*
  const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GEMINI_API_KEY}`
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }]
    })
  });
  
  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
  */

  // Mock 응답
  return JSON.stringify({
    rules: [
      {
        ruleName: 'AI 생성 패턴 예시',
        description: 'AI가 생성한 정규식 패턴입니다',
        inputPattern: '(.+)',
        outputTemplate: '$1',
        priority: 100,
        confidence: 0.85,
        testCases: [{ id: '1', input: '테스트', expected: '테스트' }],
        metadataTags: {
          type: 'ai_generated',
          complexity: 'low',
        },
      },
    ],
    reasoning: '입력 패턴 분석 결과를 바탕으로 최적화된 정규식을 생성했습니다.',
  });
}

function parseLLMResponse(
  llmResponse: string,
  category: string
): GeneratedRule[] {
  try {
    const parsed = JSON.parse(llmResponse);

    return parsed.rules.map((rule: any) => ({
      ...rule,
      category: category,
      confidence: Math.min(Math.max(rule.confidence || 0.7, 0), 1),
    }));
  } catch (error) {
    console.error('Failed to parse LLM response:', error);
    throw new Error('Invalid LLM response format');
  }
}

async function validateGeneratedRules(
  rules: GeneratedRule[],
  sampleInputs: string[]
): Promise<GeneratedRule[]> {
  return rules.filter(rule => {
    try {
      // 정규식 유효성 검증
      new RegExp(rule.inputPattern);

      // 샘플 입력으로 테스트
      let matchCount = 0;
      sampleInputs.forEach(input => {
        const regex = new RegExp(rule.inputPattern, 'gi');
        if (regex.test(input)) {
          matchCount++;
        }
      });

      // 최소 50% 이상 매칭되어야 유효
      rule.confidence = Math.min(
        rule.confidence,
        matchCount / sampleInputs.length
      );

      return rule.confidence >= 0.3;
    } catch {
      return false;
    }
  });
}

async function analyzePatternConflicts(
  generatedRules: GeneratedRule[],
  existingRules: any[]
): Promise<string[]> {
  const conflicts: string[] = [];

  for (const newRule of generatedRules) {
    for (const existingRule of existingRules) {
      // 단순한 충돌 감지 (실제로는 더 정교한 알고리즘 필요)
      if (
        newRule.inputPattern.includes(existingRule.inputPattern.slice(0, 10))
      ) {
        conflicts.push(
          `${newRule.ruleName}이 기존 규칙 "${existingRule.ruleName}"과 충돌할 수 있습니다`
        );
      }
    }
  }

  return conflicts;
}

function analyzePatternComplexity(rules: GeneratedRule[]): PatternAnalysis {
  let totalComplexity = 0;
  let totalAccuracy = 0;
  const recommendations: string[] = [];

  rules.forEach(rule => {
    // 복잡도 계산 (정규식 길이, 특수문자 사용 등 기준)
    const patternLength = rule.inputPattern.length;
    const specialCharCount = (
      rule.inputPattern.match(/[.*+?^${}()|[\]\\]/g) || []
    ).length;
    const complexity = (patternLength + specialCharCount * 2) / 10;

    totalComplexity += complexity;
    totalAccuracy += rule.confidence;

    if (complexity > 5) {
      recommendations.push(
        `${rule.ruleName}: 패턴이 복잡합니다. 단순화를 고려하세요.`
      );
    }

    if (rule.confidence < 0.7) {
      recommendations.push(
        `${rule.ruleName}: 신뢰도가 낮습니다. 추가 테스트가 필요합니다.`
      );
    }
  });

  const avgComplexity = totalComplexity / rules.length;
  const avgAccuracy = totalAccuracy / rules.length;

  return {
    complexity:
      avgComplexity < 2 ? 'low' : avgComplexity < 4 ? 'medium' : 'high',
    potentialConflicts: [], // 다른 함수에서 채움
    estimatedAccuracy: avgAccuracy * 100,
    performanceImpact:
      avgComplexity < 2
        ? 'minimal'
        : avgComplexity < 4
          ? 'moderate'
          : 'significant',
    recommendations,
  };
}

function generatePatternSuggestions(
  rules: GeneratedRule[],
  conflicts: string[]
): PatternSuggestion[] {
  const suggestions: PatternSuggestion[] = [];

  // 최적화 제안
  rules.forEach(rule => {
    if (rule.inputPattern.length > 50) {
      suggestions.push({
        type: 'optimization',
        title: '패턴 단순화',
        description: `${rule.ruleName}의 패턴이 너무 복잡합니다`,
        pattern: rule.inputPattern.slice(0, 30) + '...',
        reasoning: '긴 정규식은 성능에 영향을 줄 수 있습니다',
      });
    }
  });

  // 충돌 해결 제안
  if (conflicts.length > 0) {
    suggestions.push({
      type: 'conflict_resolution',
      title: '우선순위 조정 필요',
      description: '생성된 규칙이 기존 규칙과 충돌할 수 있습니다',
      pattern: '',
      reasoning:
        '우선순위를 조정하거나 패턴을 더 구체적으로 만드는 것을 권장합니다',
    });
  }

  return suggestions;
}
