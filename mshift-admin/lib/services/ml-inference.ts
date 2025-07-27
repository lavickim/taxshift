// ML Inference Service - Layer 2 (Dummy Implementation)
// TODO: 나중에 실제 ML 모델로 교체 예정

export interface MLInferenceRequest {
  text: string;
  originalText: string;
}

export interface MLInferenceResponse {
  success: boolean;
  data?: {
    matched: boolean;
    category: string | null;
    confidence: number;
    predictedName: string | null;
    description: string;
    originalText: string;
    source: 'ml';
  };
  error?: string;
}

export class MLInferenceService {
  private static instance: MLInferenceService;

  public static getInstance(): MLInferenceService {
    if (!MLInferenceService.instance) {
      MLInferenceService.instance = new MLInferenceService();
    }
    return MLInferenceService.instance;
  }

  /**
   * ML 추론을 수행합니다 (현재는 더미 구현)
   * @param request ML 추론 요청
   * @returns ML 추론 결과
   */
  public async inferCategory(
    request: MLInferenceRequest
  ): Promise<MLInferenceResponse> {
    try {
      // 더미 구현: 항상 매치되지 않음으로 반환하여 LLM으로 넘어가도록 함
      return {
        success: true,
        data: {
          matched: false,
          category: null,
          confidence: 0.0,
          predictedName: null,
          description: 'ML 모델이 아직 구현되지 않음 (더미 응답)',
          originalText: request.originalText,
          source: 'ml',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `ML 추론 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
      };
    }
  }

  /**
   * ML 모델 상태 확인
   * @returns 모델 로드 상태
   */
  public isModelLoaded(): boolean {
    // 더미 구현: 항상 false 반환
    return false;
  }

  /**
   * ML 모델 통계 정보
   * @returns 모델 통계
   */
  public getModelStats() {
    return {
      modelLoaded: false,
      modelVersion: 'dummy-v0.1.0',
      lastInferenceTime: null,
      totalInferences: 0,
      accuracy: 0.0,
      status: 'not_implemented',
    };
  }
}
