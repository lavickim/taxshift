import { LLMInferenceService } from '../../../lib/services/llm-inference';
import { MLInferenceService } from '../../../lib/services/ml-inference';
import { TransactionCacheService } from '../../../lib/services/transaction-cache';
import { transactionClassifier } from '../../../lib/services/transaction-classifier';

// Mock dependencies
jest.mock('../../../lib/services/transaction-cache');
jest.mock('../../../lib/services/llm-inference');
jest.mock('../../../lib/services/ml-inference');
jest.mock('../../../lib/db/client', () => ({
  prisma: {
    regexRules: {
      findMany: jest.fn(),
    },
    transactions: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

const mockCacheService = TransactionCacheService as jest.Mocked<
  typeof TransactionCacheService
>;
const mockLLMService = LLMInferenceService as jest.Mocked<
  typeof LLMInferenceService
>;
const mockMLService = MLInferenceService as jest.Mocked<
  typeof MLInferenceService
>;

describe('TransactionClassifier', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('4-layer classification pipeline', () => {
    const mockTransaction = {
      id: 'tx-test-001',
      description: 'GS25 편의점 결제',
      amount: 15000,
      date: '2025-07-22',
    };

    it('should return cached result from Layer 0 (Redis)', async () => {
      const cachedResult = {
        businessType: '편의점',
        confidence: 98,
        layer: 'CACHE' as const,
        tags: ['convenience_store', 'gs25'],
      };

      mockCacheService.getCachedClassification = jest
        .fn()
        .mockResolvedValue(cachedResult);

      const result = await transactionClassifier.classify(mockTransaction);

      expect(result).toEqual(cachedResult);
      expect(mockCacheService.getCachedClassification).toHaveBeenCalledWith(
        mockTransaction.description
      );
      // 다른 layer는 호출되지 않아야 함
      expect(mockLLMService.infer).not.toHaveBeenCalled();
    });

    it('should fallback to Layer 1 (Regex) when cache miss', async () => {
      mockCacheService.getCachedClassification = jest
        .fn()
        .mockResolvedValue(null);

      const regexResult = {
        businessType: '편의점',
        confidence: 95,
        layer: 'REGEX' as const,
        tags: ['convenience_store'],
        ruleId: 'rule-convenience-001',
      };

      // Mock regex rule matching
      const { prisma } = require('../../../lib/db/client');
      prisma.regexRules.findMany.mockResolvedValue([
        {
          id: 'rule-convenience-001',
          pattern: 'GS25|편의점|CU|이마트24',
          businessType: '편의점',
          confidence: 95,
        },
      ]);

      const result = await transactionClassifier.classify(mockTransaction);

      expect(result.layer).toBe('REGEX');
      expect(result.businessType).toBe('편의점');
      expect(result.confidence).toBeGreaterThanOrEqual(95);
    });

    it('should fallback to Layer 2 (ML) when regex fails', async () => {
      mockCacheService.getCachedClassification = jest
        .fn()
        .mockResolvedValue(null);

      const { prisma } = require('../../../lib/db/client');
      prisma.regexRules.findMany.mockResolvedValue([]);

      const mlResult = {
        businessType: '음식점',
        confidence: 87,
        layer: 'ML' as const,
        tags: ['restaurant', 'korean_food'],
      };

      mockMLService.infer = jest.fn().mockResolvedValue(mlResult);

      const result = await transactionClassifier.classify(mockTransaction);

      expect(result).toEqual(mlResult);
      expect(mockMLService.infer).toHaveBeenCalledWith(mockTransaction);
    });

    it('should fallback to Layer 3 (LLM) as final resort', async () => {
      mockCacheService.getCachedClassification = jest
        .fn()
        .mockResolvedValue(null);

      const { prisma } = require('../../../lib/db/client');
      prisma.regexRules.findMany.mockResolvedValue([]);

      mockMLService.infer = jest.fn().mockResolvedValue(null);

      const llmResult = {
        businessType: '주유소',
        confidence: 82,
        layer: 'LLM' as const,
        tags: ['gas_station', 'fuel'],
      };

      mockLLMService.infer = jest.fn().mockResolvedValue(llmResult);

      const result = await transactionClassifier.classify(mockTransaction);

      expect(result).toEqual(llmResult);
      expect(mockLLMService.infer).toHaveBeenCalledWith(mockTransaction);
    });

    it('should cache successful classification results', async () => {
      mockCacheService.getCachedClassification = jest
        .fn()
        .mockResolvedValue(null);
      mockCacheService.setCachedClassification = jest.fn();

      const regexResult = {
        businessType: '편의점',
        confidence: 95,
        layer: 'REGEX' as const,
        tags: ['convenience_store'],
      };

      const { prisma } = require('../../../lib/db/client');
      prisma.regexRules.findMany.mockResolvedValue([
        {
          id: 'rule-convenience-001',
          pattern: 'GS25',
          businessType: '편의점',
          confidence: 95,
        },
      ]);

      await transactionClassifier.classify(mockTransaction);

      expect(mockCacheService.setCachedClassification).toHaveBeenCalledWith(
        mockTransaction.description,
        expect.objectContaining({
          businessType: '편의점',
          confidence: 95,
        })
      );
    });
  });

  describe('performance optimization', () => {
    it('should respect confidence threshold for caching', async () => {
      const lowConfidenceResult = {
        businessType: '기타',
        confidence: 45, // 낮은 신뢰도
        layer: 'LLM' as const,
        tags: ['unknown'],
      };

      mockCacheService.getCachedClassification = jest
        .fn()
        .mockResolvedValue(null);
      mockCacheService.setCachedClassification = jest.fn();

      const { prisma } = require('../../../lib/db/client');
      prisma.regexRules.findMany.mockResolvedValue([]);
      mockMLService.infer = jest.fn().mockResolvedValue(null);
      mockLLMService.infer = jest.fn().mockResolvedValue(lowConfidenceResult);

      await transactionClassifier.classify({
        description: 'Unknown transaction',
      });

      // 낮은 신뢰도는 캐싱하지 않아야 함
      expect(mockCacheService.setCachedClassification).not.toHaveBeenCalled();
    });

    it('should handle batch classification efficiently', async () => {
      const transactions = [
        { description: 'GS25 편의점', amount: 15000 },
        { description: 'McDonald 햄버거', amount: 25000 },
        { description: 'Shell 주유소', amount: 80000 },
      ];

      mockCacheService.getCachedClassification = jest
        .fn()
        .mockResolvedValueOnce(null) // GS25 - cache miss
        .mockResolvedValueOnce({
          businessType: '음식점',
          confidence: 96,
          layer: 'CACHE',
        }) // McDonald - cache hit
        .mockResolvedValueOnce(null); // Shell - cache miss

      const results = await transactionClassifier.classifyBatch(transactions);

      expect(results).toHaveLength(3);
      expect(results[1].layer).toBe('CACHE'); // McDonald should be from cache
      expect(mockCacheService.getCachedClassification).toHaveBeenCalledTimes(3);
    });
  });

  describe('error handling', () => {
    it('should handle service failures gracefully', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const errorTransaction = {
        description: 'Error test transaction',
      };

      mockCacheService.getCachedClassification = jest
        .fn()
        .mockRejectedValue(new Error('Cache service error'));

      // 에러가 발생해도 분류는 계속 진행되어야 함
      const { prisma } = require('../../../lib/db/client');
      prisma.regexRules.findMany.mockResolvedValue([]);
      mockMLService.infer = jest.fn().mockResolvedValue(null);
      mockLLMService.infer = jest.fn().mockResolvedValue({
        businessType: '기타',
        confidence: 60,
        layer: 'LLM',
      });

      const result = await transactionClassifier.classify(errorTransaction);

      expect(result.layer).toBe('LLM');
      expect(result.businessType).toBe('기타');
    });

    it('should return fallback classification when all layers fail', async () => {
      mockCacheService.getCachedClassification = jest
        .fn()
        .mockRejectedValue(new Error('Cache error'));

      const { prisma } = require('../../../lib/db/client');
      prisma.regexRules.findMany.mockRejectedValue(new Error('DB error'));
      mockMLService.infer = jest.fn().mockRejectedValue(new Error('ML error'));
      mockLLMService.infer = jest
        .fn()
        .mockRejectedValue(new Error('LLM error'));

      const result = await transactionClassifier.classify({
        description: 'Failing transaction',
      });

      expect(result).toEqual({
        businessType: '기타',
        confidence: 0,
        layer: 'FALLBACK',
        tags: ['unclassified'],
        error: 'All classification layers failed',
      });
    });
  });

  describe('Korean business type recognition', () => {
    const koreanBusinessCases = [
      { description: 'GS25 강남점', expected: '편의점' },
      { description: 'SK주유소 서초', expected: '주유소' },
      { description: '현대카센터', expected: '카센터' },
      { description: '쿠팡이츠 배달', expected: '음식배달' },
      { description: '네이버페이', expected: '온라인결제' },
    ];

    it.each(koreanBusinessCases)(
      'should classify Korean business: $description -> $expected',
      async ({ description, expected }) => {
        mockCacheService.getCachedClassification = jest
          .fn()
          .mockResolvedValue(null);

        const { prisma } = require('../../../lib/db/client');
        prisma.regexRules.findMany.mockResolvedValue([
          {
            pattern: getPatternForBusinessType(expected),
            businessType: expected,
            confidence: 95,
          },
        ]);

        const result = await transactionClassifier.classify({ description });

        expect(result.businessType).toBe(expected);
        expect(result.confidence).toBeGreaterThanOrEqual(90);
      }
    );
  });
});

// Helper function for Korean business pattern matching
function getPatternForBusinessType(businessType: string): string {
  const patterns: { [key: string]: string } = {
    편의점: 'GS25|CU|이마트24|세븐일레븐|편의점',
    주유소: 'SK|GS|현대오일뱅크|S-OIL|주유소',
    카센터: '카센터|정비소|타이어|오토',
    음식배달: '배달|쿠팡이츠|배민|요기요',
    온라인결제: '페이|온라인|인터넷',
  };

  return patterns[businessType] || '.*';
}
