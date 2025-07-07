// LLM Inference Service - Layer 3
// Gemini API를 사용한 한국어 거래 텍스트 분류

import { GoogleGenAI } from "@google/genai";
import { buildTransactionClassificationPrompt, type ClassificationPromptContext } from "@/data/llm-prompts";

export interface LLMInferenceRequest {
  text: string;
  originalText: string;
  context?: {
    amount?: number;
    date?: string;
    location?: string;
  };
}

export interface LLMInferenceResponse {
  success: boolean;
  data?: {
    matched: boolean;
    category: string | null;
    confidence: number;
    predictedName: string | null;
    description: string;
    originalText: string;
    source: 'llm';
    reasoning?: string;
  };
  error?: string;
}

export class LLMInferenceService {
  private static instance: LLMInferenceService;
  private genAI: GoogleGenAI;

  private constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY가 환경변수에 설정되지 않았습니다.');
    }
    this.genAI = new GoogleGenAI({ apiKey });
  }

  public static getInstance(): LLMInferenceService {
    if (!LLMInferenceService.instance) {
      LLMInferenceService.instance = new LLMInferenceService();
    }
    return LLMInferenceService.instance;
  }

  /**
   * LLM을 사용한 거래 텍스트 분류
   * @param request LLM 추론 요청
   * @returns LLM 추론 결과
   */
  public async inferCategory(request: LLMInferenceRequest): Promise<LLMInferenceResponse> {
    try {
      const prompt = this.buildPrompt(request);
      
      const response = await this.genAI.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('LLM 응답이 비어있습니다');
      }
      const parsedResult = this.parseResponse(responseText, request.originalText);
      
      return {
        success: true,
        data: parsedResult
      };

    } catch (error) {
      console.error('LLM 추론 오류:', error);
      return {
        success: false,
        error: `LLM 추론 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
      };
    }
  }

  /**
   * 한국어 거래 텍스트 분류를 위한 프롬프트 생성
   */
  private buildPrompt(request: LLMInferenceRequest): string {
    const context: ClassificationPromptContext | undefined = request.context ? {
      amount: request.context.amount,
      date: request.context.date,
      location: request.context.location
    } : undefined;

    return buildTransactionClassificationPrompt(request.text, context);
  }

  /**
   * LLM 응답을 파싱하여 구조화된 결과로 변환
   */
  private parseResponse(responseText: string, originalText: string) {
    try {
      // JSON 부분만 추출 (```json과 ```로 감싸진 경우 처리)
      let jsonText = responseText.trim();
      
      // 마크다운 코드 블록 제거
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const parsed = JSON.parse(jsonText);
      
      return {
        matched: Boolean(parsed.matched),
        category: parsed.category || null,
        confidence: Math.max(0, Math.min(1, Number(parsed.confidence) || 0)),
        predictedName: parsed.predictedName || null,
        description: parsed.description || 'LLM 분석 결과',
        originalText: originalText,
        source: 'llm' as const,
        reasoning: parsed.reasoning || null
      };

    } catch (error) {
      console.warn('LLM 응답 파싱 실패:', error, '\n원본 응답:', responseText);
      
      // 파싱 실패 시 기본값 반환
      return {
        matched: false,
        category: null,
        confidence: 0.0,
        predictedName: null,
        description: 'LLM 응답 파싱에 실패했습니다',
        originalText: originalText,
        source: 'llm' as const,
        reasoning: `파싱 실패 - 원본 응답: ${responseText.substring(0, 200)}...`
      };
    }
  }

  /**
   * LLM 서비스 상태 확인
   */
  public async healthCheck(): Promise<boolean> {
    try {
      const testResponse = await this.genAI.models.generateContent({
        model: "gemini-2.0-flash",
        contents: "Hello, are you working?",
      });
      
      return Boolean(testResponse.text);
    } catch (error) {
      console.error('LLM 헬스체크 실패:', error);
      return false;
    }
  }

  /**
   * LLM 서비스 통계 정보
   */
  public getServiceStats() {
    return {
      modelName: 'gemini-2.0-flash',
      provider: 'Google Gemini',
      version: 'v1.0.0',
      lastInferenceTime: null,
      totalInferences: 0,
      status: 'active'
    };
  }
} 