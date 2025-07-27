// Transaction Classifier - 통합 분류 서비스
// Cache (Layer 0) → Regex (Layer 1) → ML (Layer 2) → LLM (Layer 3)
import { CsvRegexRuleEngine } from './csv-regex-rule-engine';
import { LLMInferenceService } from './llm-inference';
import { MLInferenceService } from './ml-inference';
import { TransactionCacheService } from './transaction-cache';

export interface ClassificationRequest {
  text: string;
  context?: {
    amount?: number;
    date?: string;
    location?: string;
    userId?: string;
  };
}

export interface ClassificationResult {
  success: boolean;
  data?: {
    matched: boolean;
    category: string | null;
    confidence: number;
    predictedName: string | null;
    description: string;
    originalText: string;
    source: 'cache' | 'regex' | 'ml' | 'llm';
    processingTime: number;
    reasoning?: string;
    layerResults?: {
      cache?: any;
      regex?: any;
      ml?: any;
      llm?: any;
    };
  };
  error?: string;
}

export interface ClassificationStats {
  totalRequests: number;
  cacheHits: number;
  regexMatches: number;
  mlInferences: number;
  llmInferences: number;
  averageProcessingTime: number;
  layerDistribution: {
    cache: number;
    regex: number;
    ml: number;
    llm: number;
  };
}

export class TransactionClassifier {
  private static instance: TransactionClassifier;
  private cacheService: TransactionCacheService;
  private regexEngine: CsvRegexRuleEngine;
  private mlService: MLInferenceService;
  private llmService: LLMInferenceService;

  // 통계 추적
  private stats: ClassificationStats = {
    totalRequests: 0,
    cacheHits: 0,
    regexMatches: 0,
    mlInferences: 0,
    llmInferences: 0,
    averageProcessingTime: 0,
    layerDistribution: {
      cache: 0,
      regex: 0,
      ml: 0,
      llm: 0,
    },
  };

  private constructor() {
    this.cacheService = new TransactionCacheService();
    this.regexEngine = CsvRegexRuleEngine.getInstance();
    this.mlService = MLInferenceService.getInstance();
    this.llmService = LLMInferenceService.getInstance();
  }

  public static getInstance(): TransactionClassifier {
    if (!TransactionClassifier.instance) {
      TransactionClassifier.instance = new TransactionClassifier();
    }
    return TransactionClassifier.instance;
  }

  /**
   * 전체 4레이어 파이프라인을 통한 거래 텍스트 분류
   */
  public async classify(
    request: ClassificationRequest
  ): Promise<ClassificationResult> {
    const startTime = Date.now();
    const layerResults: any = {};

    try {
      this.stats.totalRequests++;

      const text = request.text.trim();
      const cacheKey = this.generateCacheKey(text, request.context);

      // Layer 0: Cache 확인
      const cachedResult = await this.cacheService.get(cacheKey);
      if (cachedResult) {
        this.stats.cacheHits++;
        this.stats.layerDistribution.cache++;
        layerResults.cache = cachedResult;

        const processingTime = Date.now() - startTime;
        this.updateAverageProcessingTime(processingTime);

        return {
          success: true,
          data: {
            ...cachedResult,
            source: 'cache',
            processingTime,
            layerResults,
          },
        };
      }

      // Layer 1: Regex 매칭
      const regexResult = this.regexEngine.matchPattern(text);
      layerResults.regex = regexResult;

      if (regexResult) {
        this.stats.regexMatches++;
        this.stats.layerDistribution.regex++;

        const result = {
          matched: true,
          category: regexResult.businessType,
          confidence: regexResult.confidence,
          predictedName: regexResult.businessType,
          description: '정규식 매칭 결과',
          originalText: text,
          source: 'regex' as const,
          processingTime: Date.now() - startTime,
        };

        // 캐시에 저장
        await this.cacheService.set(cacheKey, result, 3600); // 1시간 캐시

        this.updateAverageProcessingTime(result.processingTime);
        return {
          success: true,
          data: {
            ...result,
            layerResults,
          },
        };
      }

      // Layer 2: ML 추론 (더미 - 항상 매치되지 않음)
      const mlResult = await this.mlService.inferCategory({
        text: text,
        originalText: text,
      });
      layerResults.ml = mlResult;

      if (mlResult.success && mlResult.data?.matched) {
        this.stats.mlInferences++;
        this.stats.layerDistribution.ml++;

        const result = {
          matched: true,
          category: mlResult.data.category,
          confidence: mlResult.data.confidence,
          predictedName: mlResult.data.predictedName,
          description: mlResult.data.description,
          originalText: text,
          source: 'ml' as const,
          processingTime: Date.now() - startTime,
        };

        // 캐시에 저장 (ML 결과는 짧은 시간 캐시)
        await this.cacheService.set(cacheKey, result, 1800); // 30분 캐시

        this.updateAverageProcessingTime(result.processingTime);
        return {
          success: true,
          data: {
            ...result,
            layerResults,
          },
        };
      }

      // Layer 3: LLM 추론
      const llmResult = await this.llmService.inferCategory({
        text: text,
        originalText: text,
        context: request.context,
      });
      layerResults.llm = llmResult;

      if (llmResult.success) {
        this.stats.llmInferences++;
        this.stats.layerDistribution.llm++;

        const result = {
          matched: llmResult.data?.matched || false,
          category: llmResult.data?.category || null,
          confidence: llmResult.data?.confidence || 0,
          predictedName: llmResult.data?.predictedName || null,
          description: llmResult.data?.description || 'LLM 분류 결과',
          originalText: text,
          source: 'llm' as const,
          processingTime: Date.now() - startTime,
          reasoning: llmResult.data?.reasoning,
        };

        // LLM 결과도 캐시에 저장 (더 짧은 시간)
        if (result.matched && result.confidence > 0.7) {
          await this.cacheService.set(cacheKey, result, 900); // 15분 캐시
        }

        this.updateAverageProcessingTime(result.processingTime);
        return {
          success: true,
          data: {
            ...result,
            layerResults,
          },
        };
      }

      // 모든 레이어에서 실패한 경우
      const processingTime = Date.now() - startTime;
      this.updateAverageProcessingTime(processingTime);

      return {
        success: false,
        error: '모든 분류 레이어에서 처리할 수 없는 텍스트입니다',
        data: {
          matched: false,
          category: null,
          confidence: 0,
          predictedName: null,
          description: '분류 실패',
          originalText: text,
          source: 'llm',
          processingTime,
          layerResults,
        },
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.updateAverageProcessingTime(processingTime);

      console.error('TransactionClassifier 오류:', error);
      return {
        success: false,
        error: `분류 처리 중 오류 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
        data: {
          matched: false,
          category: null,
          confidence: 0,
          predictedName: null,
          description: '오류 발생',
          originalText: request.text,
          source: 'llm',
          processingTime,
          layerResults,
        },
      };
    }
  }

  /**
   * 캐시 키 생성
   */
  private generateCacheKey(text: string, context?: any): string {
    const contextStr = context ? JSON.stringify(context) : '';
    return `classify:${text}:${contextStr}`;
  }

  /**
   * 평균 처리 시간 업데이트
   */
  private updateAverageProcessingTime(processingTime: number) {
    const totalTime =
      this.stats.averageProcessingTime * (this.stats.totalRequests - 1);
    this.stats.averageProcessingTime =
      (totalTime + processingTime) / this.stats.totalRequests;
  }

  /**
   * 분류 통계 정보 조회
   */
  public getStats(): ClassificationStats {
    return { ...this.stats };
  }

  /**
   * 통계 초기화
   */
  public resetStats(): void {
    this.stats = {
      totalRequests: 0,
      cacheHits: 0,
      regexMatches: 0,
      mlInferences: 0,
      llmInferences: 0,
      averageProcessingTime: 0,
      layerDistribution: {
        cache: 0,
        regex: 0,
        ml: 0,
        llm: 0,
      },
    };
  }

  /**
   * 전체 시스템 헬스 체크
   */
  public async healthCheck(): Promise<{
    overall: boolean;
    layers: {
      cache: boolean;
      regex: boolean;
      ml: boolean;
      llm: boolean;
    };
  }> {
    try {
      const [cacheHealthy, regexHealthy, mlHealthy, llmHealthy] =
        await Promise.all([
          this.cacheService.healthCheck(),
          this.regexEngine.isLoaded,
          this.mlService.isModelLoaded(),
          this.llmService.healthCheck(),
        ]);

      return {
        overall: cacheHealthy && regexHealthy && mlHealthy && llmHealthy,
        layers: {
          cache: cacheHealthy,
          regex: regexHealthy,
          ml: mlHealthy,
          llm: llmHealthy,
        },
      };
    } catch (error) {
      console.error('헬스체크 오류:', error);
      return {
        overall: false,
        layers: {
          cache: false,
          regex: false,
          ml: false,
          llm: false,
        },
      };
    }
  }
}
