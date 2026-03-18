import { LLMInferenceService } from '../../../lib/services/llm-inference';
import { GoogleGenAI } from '@google/genai';

// Mock Google GenAI SDK
jest.mock('@google/genai', () => {
  const mockGenerateContent = jest.fn();

  return {
    GoogleGenAI: jest.fn(() => ({
      models: {
        generateContent: mockGenerateContent
      }
    })),
    mockGenerateContent,
  };
});

describe('LLMInferenceService', () => {
  let llmService: LLMInferenceService;
  let mockGenerateContent: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    llmService = new LLMInferenceService();

    const { mockGenerateContent: mockGenerate } = require('@google/genai');
    mockGenerateContent = mockGenerate;
  });

  describe('Gemini AI inference (Layer 3)', () => {
    const mockTransaction = {
      description: 'GS25 강남점 결제',
      amount: 15000,
      date: '2025-07-22'
    };

    it('should classify Korean convenience store transaction', async () => {
      const geminiResponse = {
        text: JSON.stringify({
          businessType: '편의점',
          confidence: 92,
          reasoning: 'GS25는 대표적인 편의점 브랜드입니다.',
          tags: ['convenience_store', 'gs25', 'retail'],
          suggestedAccountCodes: {
            debit: '1120', // 카드매출채권
            credit: '4100' // 매출
          }
        })
      };

      mockGenerateContent.mockResolvedValue(geminiResponse);

      const result = await llmService.infer(mockTransaction);

      expect(result).toEqual({
        businessType: '편의점',
        confidence: 92,
        layer: 'LLM',
        reasoning: 'GS25는 대표적인 편의점 브랜드입니다.',
        tags: ['convenience_store', 'gs25', 'retail'],
        suggestedAccountCodes: {
          debit: '1120',
          credit: '4100'
        }
      });

      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gemini-2.0-flash',
          contents: expect.stringContaining('거래 설명: GS25 강남점 결제')
        })
      );
    });

    it('should handle gas station transactions with amount context', async () => {
      const gasTransaction = {
        description: 'SK주유소 광화문',
        amount: 85000,
        date: '2025-07-22'
      };

      const geminiResponse = {
        text: JSON.stringify({
          businessType: '주유소',
          confidence: 95,
          reasoning: '고액 결제와 SK주유소라는 명칭으로 보아 주유 구매로 판단됩니다.',
          tags: ['gas_station', 'sk', 'fuel']
        })
      };

      mockGenerateContent.mockResolvedValue(geminiResponse);

      const result = await llmService.infer(gasTransaction);

      expect(result.businessType).toBe('주유소');
      expect(result.confidence).toBe(95);
      expect(result.tags).toContain('fuel');
    });

    it('should handle unknown/ambiguous transactions', async () => {
      const ambiguousTransaction = {
        description: '앱카드 대금지급',
        amount: 50000,
        date: '2025-07-22'
      };

      const geminiResponse = {
        text: JSON.stringify({
          businessType: '금융서비스',
          confidence: 65,
          reasoning: '앱카드 대금지급은 금융 서비스로 분류되나 정확한 비즈니스 타입 판단이 어렵습니다.',
          tags: ['financial_service', 'card_payment', 'uncertain']
        })
      };

      mockGenerateContent.mockResolvedValue(geminiResponse);

      const result = await llmService.infer(ambiguousTransaction);

      expect(result.businessType).toBe('금융서비스');
      expect(result.confidence).toBe(65);
      expect(result.tags).toContain('uncertain');
    });

    it('should provide Korean context-aware prompt engineering', async () => {
      mockGenerateContent.mockResolvedValue({
        text: JSON.stringify({ businessType: '편의점', confidence: 90, tags: [] })
      });

      await llmService.infer(mockTransaction);

      const promptCall = mockGenerateContent.mock.calls[0][0];

      expect(promptCall.contents).toContain('한국어 거래 내역 분석');
      expect(promptCall.contents).toContain('비즈니스 유형');
      expect(promptCall.contents).toContain('신뢰도');
      expect(promptCall.contents).toContain('JSON 형식으로 반환');
    });

    it('should include business context for better accuracy', async () => {
      const contextTransaction = {
        description: '유비쿠팡 서비스',
        amount: 12000,
        date: '2025-07-22',
        metadata: {
          location: '강남구',
          timeOfDay: '12:30',
          merchantCategory: 'restaurant'
        }
      };

      const geminiResponse = {
        text: JSON.stringify({
          businessType: '음식배달',
          confidence: 90,
          reasoning: '점심시간대, 배달 앱 이름, 금액대를 고려할 때 음식 배달 서비스로 판단됩니다.',
          tags: ['food_delivery', 'ubereats', 'restaurant']
        })
      };

      mockGenerateContent.mockResolvedValue(geminiResponse);

      await llmService.infer(contextTransaction);

      const promptCall = mockGenerateContent.mock.calls[0][0];
      expect(promptCall.contents).toContain('시간: 12:30');
      expect(promptCall.contents).toContain('지역: 강남구');
    });
  });

  describe('error handling and fallback', () => {
    it('should handle API rate limiting gracefully', async () => {
      mockGenerateContent.mockRejectedValue(new Error('Rate limit exceeded'));

      const result = await llmService.infer(mockTransaction);

      expect(result).toEqual({
        businessType: '기타',
        confidence: 30,
        layer: 'LLM',
        error: 'API rate limit exceeded',
        tags: ['api_error', 'rate_limited']
      });
    });

    it('should handle malformed JSON response', async () => {
      const malformedResponse = {
        text: 'This is not valid JSON { incomplete...'
      };

      mockGenerateContent.mockResolvedValue(malformedResponse);

      const result = await llmService.infer(mockTransaction);

      expect(result).toEqual({
        businessType: '기타',
        confidence: 20,
        layer: 'LLM',
        error: 'Invalid JSON response',
        tags: ['parsing_error']
      });
    });

    it('should implement retry mechanism for transient failures', async () => {
      mockGenerateContent
        .mockRejectedValueOnce(new Error('Network timeout'))
        .mockRejectedValueOnce(new Error('Service temporarily unavailable'))
        .mockResolvedValueOnce({
          text: JSON.stringify({
            businessType: '편의점',
            confidence: 85,
            tags: ['convenience_store']
          })
        });

      const result = await llmService.inferWithRetry(mockTransaction, { maxRetries: 3 });

      expect(result.businessType).toBe('편의점');
      expect(mockGenerateContent).toHaveBeenCalledTimes(3);
    });

    it('should timeout long-running requests', async () => {
      jest.useFakeTimers();

      mockGenerateContent.mockImplementation(() =>
        new Promise(resolve => setTimeout(resolve, 30000))
      );

      const inferencePromise = llmService.infer(mockTransaction, { timeout: 10000 });

      jest.advanceTimersByTime(10000);

      const result = await inferencePromise;

      expect(result).toEqual({
        businessType: '기타',
        confidence: 10,
        layer: 'LLM',
        error: 'Request timeout',
        tags: ['timeout_error']
      });

      jest.useRealTimers();
    });
  });

  describe('performance optimization', () => {
    it('should batch multiple inferences for efficiency', async () => {
      const transactions = [
        { description: 'GS25 결제', amount: 15000 },
        { description: '맥도날드 햄버거', amount: 8500 },
        { description: 'SK 주유소', amount: 70000 }
      ];

      const batchResponse = {
        text: JSON.stringify([
          { businessType: '편의점', confidence: 92, tags: ['convenience_store'] },
          { businessType: '음식점', confidence: 95, tags: ['fast_food', 'mcdonalds'] },
          { businessType: '주유소', confidence: 96, tags: ['gas_station', 'sk'] }
        ])
      };

      mockGenerateContent.mockResolvedValue(batchResponse);

      const results = await llmService.inferBatch(transactions);

      expect(results).toHaveLength(3);
      expect(results[0].businessType).toBe('편의점');
      expect(results[1].businessType).toBe('음식점');
      expect(results[2].businessType).toBe('주유소');
      expect(mockGenerateContent).toHaveBeenCalledTimes(1); // 단일 호출
    });

    it('should cache frequent patterns to reduce API calls', async () => {
      const frequentTransaction = {
        description: 'GS25 결제',
        amount: 15000
      };

      // 첫 번째 호출
      mockGenerateContent.mockResolvedValueOnce({
        text: JSON.stringify({
          businessType: '편의점',
          confidence: 92,
          tags: ['convenience_store']
        })
      });

      const result1 = await llmService.infer(frequentTransaction);
      const result2 = await llmService.infer(frequentTransaction); // 캐시된 결과

      expect(result1).toEqual(result2);
      expect(mockGenerateContent).toHaveBeenCalledTimes(1); // 캐시로 인해 한 번만 호출
    });
  });

  describe('Korean business type specialization', () => {
    const koreanBusinessCases = [
      {
        description: '인천공항 SK주유소',
        expected: '주유소',
        expectedTags: ['gas_station', 'airport', 'sk']
      },
      {
        description: '현대블루해즈 차량정비',
        expected: '카센터',
        expectedTags: ['car_service', 'maintenance', 'hyundai']
      },
      {
        description: '쪼시 배달의민족 배달요금',
        expected: '배달서비스',
        expectedTags: ['delivery', 'taxi', 'service_fee']
      },
      {
        description: '매가박스 대형마트',
        expected: '대형마트',
        expectedTags: ['hypermarket', 'megabox', 'retail']
      }
    ];

    it.each(koreanBusinessCases)(
      'should correctly classify Korean business: $description -> $expected',
      async ({ description, expected, expectedTags }) => {
        const geminiResponse = {
          text: JSON.stringify({
            businessType: expected,
            confidence: 90,
            tags: expectedTags
          })
        };

        mockGenerateContent.mockResolvedValue(geminiResponse);

        const result = await llmService.infer({ description, amount: 25000 });

        expect(result.businessType).toBe(expected);
        expect(result.tags).toEqual(expect.arrayContaining(expectedTags));
      }
    );

    it('should provide accounting suggestions for Korean businesses', async () => {
      const restaurantTransaction = {
        description: '백다방 직원 등심',
        amount: 45000
      };

      const geminiResponse = {
        text: JSON.stringify({
          businessType: '음식점',
          confidence: 94,
          tags: ['restaurant', 'korean_food', 'employee_meal'],
          suggestedAccountCodes: {
            debit: '6200', // 복리후생비
            credit: '1100', // 현금
            description: '직원 식대비 (복리후생비 처리)'
          }
        })
      };

      mockGenerateContent.mockResolvedValue(geminiResponse);

      const result = await llmService.infer(restaurantTransaction);

      expect(result.suggestedAccountCodes).toEqual({
        debit: '6200',
        credit: '1100',
        description: '직원 식대비 (복리후생비 처리)'
      });
    });
  });
});

// Mock implementation
class LLMInferenceService {
  private genAI: GoogleGenAI;
  private cache: Map<string, any> = new Map();

  constructor() {
    this.genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'test-key' });
  }

  async infer(transaction: any, options?: { timeout?: number }) {
    const cacheKey = JSON.stringify(transaction);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const prompt = this.buildPrompt(transaction);

      let response;
      if (options?.timeout) {
        response = await Promise.race([
          this.genAI.models.generateContent({ model: 'gemini-2.0-flash', contents: prompt }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), options.timeout)
          )
        ]);
      } else {
        response = await this.genAI.models.generateContent({ model: 'gemini-2.0-flash', contents: prompt });
      }

      const result = this.parseResponse(response);
      this.cache.set(cacheKey, result);
      return result;

    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async inferWithRetry(transaction: any, options: { maxRetries: number }) {
    let lastError;

    for (let i = 0; i < options.maxRetries; i++) {
      try {
        return await this.infer(transaction);
      } catch (error) {
        lastError = error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // exponential backoff
      }
    }

    return this.handleError(lastError);
  }

  async inferBatch(transactions: any[]) {
    const batchPrompt = this.buildBatchPrompt(transactions);

    try {
      const response = await this.genAI.models.generateContent({ model: 'gemini-2.0-flash', contents: batchPrompt });

      const batchResult = JSON.parse(response.text);
      return batchResult.map((result: any, index: number) => ({
        ...result,
        layer: 'LLM'
      }));
    } catch (error) {
      // fallback to individual processing
      return Promise.all(transactions.map(tx => this.infer(tx)));
    }
  }

  private buildPrompt(transaction: any): string {
    return `
한국어 거래 내역 분석 및 비즈니스 유형 분류

거래 정보:
- 거래 설명: ${transaction.description}
- 금액: ${transaction.amount?.toLocaleString()}원
- 날짜: ${transaction.date}
${transaction.metadata ? `- 추가 정보: 시간: ${transaction.metadata.timeOfDay}, 지역: ${transaction.metadata.location}` : ''}

다음 JSON 형식으로 반환해주세요:
{
  "businessType": "비즈니스 유형 (한국어)",
  "confidence": 신뢰도(0-100),
  "reasoning": "판단 근거",
  "tags": ["태그 리스트"],
  "suggestedAccountCodes": {
    "debit": "차변 계정코드",
    "credit": "대변 계정코드",
    "description": "회계 처리 설명"
  }
}
    `;
  }

  private buildBatchPrompt(transactions: any[]): string {
    const transactionList = transactions.map((tx, i) =>
      `${i + 1}. ${tx.description} (${tx.amount?.toLocaleString()}원)`
    ).join('\n');

    return `
다음 거래 내역들을 비즈니스 유형으로 분류해주세요:

${transactionList}

JSON 배열로 반환:
[{
  "businessType": "비즈니스 유형",
  "confidence": 신뢰도,
  "tags": ["태그들"]
}, ...]
    `;
  }

  private parseResponse(response: any) {
    try {
      const text = response.text;
      const parsed = JSON.parse(text);
      return {
        ...parsed,
        layer: 'LLM'
      };
    } catch (error) {
      return {
        businessType: '기타',
        confidence: 20,
        layer: 'LLM',
        error: 'Invalid JSON response',
        tags: ['parsing_error']
      };
    }
  }

  private handleError(error: any) {
    if (error.message.includes('Rate limit')) {
      return {
        businessType: '기타',
        confidence: 30,
        layer: 'LLM',
        error: 'API rate limit exceeded',
        tags: ['api_error', 'rate_limited']
      };
    }

    if (error.message.includes('timeout')) {
      return {
        businessType: '기타',
        confidence: 10,
        layer: 'LLM',
        error: 'Request timeout',
        tags: ['timeout_error']
      };
    }

    return {
      businessType: '기타',
      confidence: 15,
      layer: 'LLM',
      error: error.message,
      tags: ['llm_error']
    };
  }
}
