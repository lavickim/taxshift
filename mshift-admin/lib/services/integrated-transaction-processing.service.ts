/**
 * 통합 거래 처리 서비스
 * RegexPreprocessingEngine + KeywordExtractionEngine 통합 파이프라인
 */
import {
  ProcessingResult,
  RegexPreprocessingEngine,
} from './regex-preprocessing.service';

export interface IntegratedProcessingResult {
  // 원본 데이터
  originalText: string;
  amount?: number;

  // 전처리 단계 결과
  preprocessingResult: ProcessingResult;
  preprocessedText: string;
  preprocessingSuccess: boolean;

  // 키워드 추출 단계 결과
  keywordExtractionResult?: KeywordExtractionResult;
  extractedKeywords: string[];
  keywordExtractionSuccess: boolean;

  // 최종 분류 결과
  finalTag?: string;
  finalAccount?: string;
  finalConfidence: number;

  // 성능 메트릭
  totalProcessingTime: number;
  preprocessingTime: number;
  keywordExtractionTime: number;

  // 처리 경로
  processingPath: 'CACHE' | 'REGEX_ONLY' | 'FULL_PIPELINE' | 'FALLBACK';

  // 메타데이터
  appliedRegexRules: string[];
  matchedKeywordPatterns: string[];
  processingSteps: ProcessingStep[];
}

export interface KeywordExtractionResult {
  matched: boolean;
  tag?: string;
  tagId?: number;
  confidence: number;
  extractedKeywords: string[];
  processingPath: string;
  accountCode?: string;
  accountName?: string;
  error?: string;
}

export interface ProcessingStep {
  step: string;
  input: string;
  output: string;
  processingTime: number;
  success: boolean;
  metadata?: Record<string, any>;
}

export class IntegratedTransactionProcessingService {
  private static instance: IntegratedTransactionProcessingService;
  private regexEngine: RegexPreprocessingEngine;

  // Java 백엔드 URL
  private readonly JAVA_API_BASE_URL =
    process.env.JAVA_API_BASE_URL || 'http://localhost:8080';

  static getInstance(): IntegratedTransactionProcessingService {
    if (!IntegratedTransactionProcessingService.instance) {
      IntegratedTransactionProcessingService.instance =
        new IntegratedTransactionProcessingService();
    }
    return IntegratedTransactionProcessingService.instance;
  }

  private constructor() {
    this.regexEngine = RegexPreprocessingEngine.getInstance();
  }

  /**
   * 통합 거래 처리 메인 메서드
   * 단계: 거래 원문 → 정규식 전처리 → 키워드 추출 → 분류
   */
  async processTransaction(
    originalText: string,
    amount?: number,
    useCache: boolean = true
  ): Promise<IntegratedProcessingResult> {
    const startTime = Date.now();
    const processingSteps: ProcessingStep[] = [];

    const result: IntegratedProcessingResult = {
      originalText,
      amount,
      preprocessingResult: {} as ProcessingResult,
      preprocessedText: originalText,
      preprocessingSuccess: false,
      extractedKeywords: [],
      keywordExtractionSuccess: false,
      finalConfidence: 0,
      totalProcessingTime: 0,
      preprocessingTime: 0,
      keywordExtractionTime: 0,
      processingPath: 'FULL_PIPELINE',
      appliedRegexRules: [],
      matchedKeywordPatterns: [],
      processingSteps,
    };

    try {
      // 단계 1: 정규식 전처리
      const preprocessingStart = Date.now();
      const preprocessingResult =
        await this.regexEngine.preprocess(originalText);
      const preprocessingTime = Date.now() - preprocessingStart;

      result.preprocessingResult = preprocessingResult;
      result.preprocessedText = preprocessingResult.normalizedText;
      result.preprocessingSuccess = preprocessingResult.success;
      result.preprocessingTime = preprocessingTime;

      if (preprocessingResult.appliedRuleName) {
        result.appliedRegexRules.push(preprocessingResult.appliedRuleName);
      }

      processingSteps.push({
        step: 'regex_preprocessing',
        input: originalText,
        output: result.preprocessedText,
        processingTime: preprocessingTime,
        success: result.preprocessingSuccess,
        metadata: {
          appliedRule: preprocessingResult.appliedRuleName,
          ruleId: preprocessingResult.appliedRuleId,
        },
      });

      // 단계 2: 키워드 추출 및 분류
      const keywordStart = Date.now();

      // 전처리된 텍스트를 사용하거나, 실패 시 원본 텍스트 사용
      const textForKeywordExtraction = result.preprocessingSuccess
        ? result.preprocessedText
        : originalText;

      const keywordResult = await this.callKeywordExtractionAPI(
        textForKeywordExtraction,
        amount
      );

      const keywordTime = Date.now() - keywordStart;

      result.keywordExtractionResult = keywordResult;
      result.extractedKeywords = keywordResult.extractedKeywords || [];
      result.keywordExtractionSuccess = keywordResult.matched || false;
      result.keywordExtractionTime = keywordTime;

      processingSteps.push({
        step: 'keyword_extraction',
        input: textForKeywordExtraction,
        output: keywordResult.tag || 'NO_MATCH',
        processingTime: keywordTime,
        success: result.keywordExtractionSuccess,
        metadata: {
          confidence: keywordResult.confidence,
          accountCode: keywordResult.accountCode,
          extractedKeywords: keywordResult.extractedKeywords,
        },
      });

      // 단계 3: 최종 결과 결정
      if (result.keywordExtractionSuccess && keywordResult.tag) {
        result.finalTag = keywordResult.tag;
        result.finalAccount =
          keywordResult.accountName || keywordResult.accountCode;
        result.finalConfidence = keywordResult.confidence;
        result.processingPath = 'FULL_PIPELINE';
      } else if (result.preprocessingSuccess) {
        // 키워드 추출은 실패했지만 전처리는 성공한 경우
        result.finalTag = 'REGEX_NORMALIZED';
        result.finalConfidence = 0.5; // 중간 신뢰도
        result.processingPath = 'REGEX_ONLY';
      } else {
        // 전체 실패
        result.finalTag = 'UNKNOWN';
        result.finalConfidence = 0;
        result.processingPath = 'FALLBACK';
      }

      result.totalProcessingTime = Date.now() - startTime;

      // 성능 로깅
      this.logPerformanceMetrics(result);

      return result;
    } catch (error) {
      console.error('통합 거래 처리 실패:', error);

      result.totalProcessingTime = Date.now() - startTime;
      result.processingPath = 'FALLBACK';

      processingSteps.push({
        step: 'error_handling',
        input: originalText,
        output: 'ERROR',
        processingTime: result.totalProcessingTime,
        success: false,
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      return result;
    }
  }

  /**
   * Java 백엔드 키워드 추출 API 호출
   */
  private async callKeywordExtractionAPI(
    text: string,
    amount?: number
  ): Promise<KeywordExtractionResult> {
    try {
      const response = await fetch(
        `${this.JAVA_API_BASE_URL}/v2/keyword-system/classify`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            description: text,
            amount: amount || 10000,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      return {
        matched: result.matched || false,
        tag: result.tag,
        tagId: result.tagId,
        confidence: result.confidence || 0,
        extractedKeywords: result.extractedKeywords || [],
        processingPath: result.processingPath || 'KEYWORD_ENGINE',
        accountCode: result.accountCode,
        accountName: result.accountName,
        error: result.error,
      };
    } catch (error) {
      console.error('키워드 추출 API 호출 실패:', error);

      return {
        matched: false,
        confidence: 0,
        extractedKeywords: [],
        processingPath: 'API_ERROR',
        error: error instanceof Error ? error.message : 'Unknown API error',
      };
    }
  }

  /**
   * 대량 거래 처리
   */
  async processBatch(
    transactions: Array<{ text: string; amount?: number }>,
    batchSize: number = 10
  ): Promise<IntegratedProcessingResult[]> {
    const results: IntegratedProcessingResult[] = [];

    // 배치 단위로 처리하여 메모리 사용량 제한
    for (let i = 0; i < transactions.length; i += batchSize) {
      const batch = transactions.slice(i, i + batchSize);

      const batchPromises = batch.map(tx =>
        this.processTransaction(tx.text, tx.amount)
      );

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // 배치 간 약간의 지연으로 시스템 부하 완화
      if (i + batchSize < transactions.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return results;
  }

  /**
   * 성능 메트릭 로깅
   */
  private logPerformanceMetrics(result: IntegratedProcessingResult): void {
    const metrics = {
      totalTime: result.totalProcessingTime,
      preprocessingTime: result.preprocessingTime,
      keywordTime: result.keywordExtractionTime,
      preprocessingRatio:
        (result.preprocessingTime / result.totalProcessingTime) * 100,
      keywordRatio:
        (result.keywordExtractionTime / result.totalProcessingTime) * 100,
      path: result.processingPath,
      confidence: result.finalConfidence,
    };

    console.log('통합 처리 성능 메트릭:', metrics);

    // 성능 임계값 경고
    if (result.totalProcessingTime > 1000) {
      console.warn('⚠️ 처리시간 과다:', result.totalProcessingTime + 'ms');
    }

    if (
      result.finalConfidence < 0.7 &&
      result.processingPath === 'FULL_PIPELINE'
    ) {
      console.warn('⚠️ 낮은 신뢰도:', result.finalConfidence);
    }
  }

  /**
   * 통계 수집
   */
  async getProcessingStats(
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<ProcessingStats> {
    // 실제 구현에서는 데이터베이스에서 통계 수집
    return {
      totalProcessed: 0,
      successRate: 0,
      averageProcessingTime: 0,
      preprocessingSuccessRate: 0,
      keywordExtractionSuccessRate: 0,
      pathDistribution: {
        CACHE: 0,
        REGEX_ONLY: 0,
        FULL_PIPELINE: 0,
        FALLBACK: 0,
      },
      topAppliedRegexRules: [],
      topMatchedKeywords: [],
    };
  }
}

export interface ProcessingStats {
  totalProcessed: number;
  successRate: number;
  averageProcessingTime: number;
  preprocessingSuccessRate: number;
  keywordExtractionSuccessRate: number;
  pathDistribution: {
    CACHE: number;
    REGEX_ONLY: number;
    FULL_PIPELINE: number;
    FALLBACK: number;
  };
  topAppliedRegexRules: Array<{ rule: string; count: number }>;
  topMatchedKeywords: Array<{ keyword: string; count: number }>;
}
