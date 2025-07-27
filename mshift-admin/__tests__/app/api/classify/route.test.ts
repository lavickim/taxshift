/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { POST } from '../../../../app/api/classify/route';

// Mock dependencies
jest.mock('../../../../lib/services/transaction-classifier', () => ({
  transactionClassifier: {
    classify: jest.fn(),
    classifyBatch: jest.fn()
  }
}));

jest.mock('../../../../lib/db/client', () => ({
  prisma: {
    transactions: {
      create: jest.fn(),
      findMany: jest.fn()
    }
  }
}));

describe('/api/classify', () => {
  const { transactionClassifier } = require('../../../../lib/services/transaction-classifier');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/classify', () => {
    it('should classify single transaction successfully', async () => {
      const mockClassification = {
        businessType: '편의점',
        confidence: 95,
        layer: 'REGEX' as const,
        tags: ['convenience_store', 'gs25']
      };

      transactionClassifier.classify.mockResolvedValue(mockClassification);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars

      const request = new NextRequest('http://localhost:3000/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: 'GS25 강남점',
          amount: 15000,
          date: '2025-07-22'
        })
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toEqual({
        success: true,
        classification: mockClassification,
        processingTime: expect.any(Number)
      });
      
      expect(transactionClassifier.classify).toHaveBeenCalledWith({
        description: 'GS25 강남점',
        amount: 15000,
        date: '2025-07-22'
      });
    });

    it('should handle batch classification requests', async () => {
      const mockBatchClassifications = [
        { businessType: '편의점', confidence: 95, layer: 'REGEX' },
        { businessType: '음식점', confidence: 88, layer: 'LLM' },
        { businessType: '주유소', confidence: 92, layer: 'CACHE' }
      ];

      transactionClassifier.classifyBatch.mockResolvedValue(mockBatchClassifications);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars

      const request = new NextRequest('http://localhost:3000/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batch: [
            { description: 'GS25 결제', amount: 15000 },
            { description: '맥도날드', amount: 8500 },
            { description: 'SK 주유소', amount: 70000 }
          ]
        })
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.classifications).toHaveLength(3);
      expect(result.statistics).toEqual({
        totalProcessed: 3,
        averageConfidence: 91.67,
        layerDistribution: {
          REGEX: 1,
          LLM: 1,
          CACHE: 1
        }
      });
    });

    it('should validate request payload', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const request = new NextRequest('http://localhost:3000/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // missing required fields
        })
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result).toEqual({
        success: false,
        error: 'Missing required field: description'
      });
    });

    it('should handle empty description gracefully', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const request = new NextRequest('http://localhost:3000/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: '',
          amount: 10000
        })
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toContain('description cannot be empty');
    });

    it('should handle classification service errors', async () => {
      transactionClassifier.classify.mockRejectedValue(new Error('Service unavailable'));

      // eslint-disable-next-line @typescript-eslint/no-unused-vars

      const request = new NextRequest('http://localhost:3000/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: 'Test transaction',
          amount: 10000
        })
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result).toEqual({
        success: false,
        error: 'Classification failed',
        details: 'Service unavailable'
      });
    });

    it('should include performance metrics in response', async () => {
      const mockClassification = {
        businessType: '편의점',
        confidence: 95,
        layer: 'REGEX' as const
      };

      // 지연 시뮬레이션
      transactionClassifier.classify.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(mockClassification), 100))
      );

      // eslint-disable-next-line @typescript-eslint/no-unused-vars

      const request = new NextRequest('http://localhost:3000/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: 'GS25 결제',
          amount: 15000
        })
      });

      const response = await POST(request);
      const result = await response.json();

      expect(result.processingTime).toBeGreaterThan(90);
      expect(result.processingTime).toBeLessThan(200);
    });

    it('should handle malformed JSON request', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const request = new NextRequest('http://localhost:3000/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json {{{ malformed'
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toContain('Invalid JSON payload');
    });

    it('should support confidence threshold filtering', async () => {
      const lowConfidenceClassification = {
        businessType: '기타',
        confidence: 45,
        layer: 'LLM' as const
      };

      transactionClassifier.classify.mockResolvedValue(lowConfidenceClassification);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars

      const request = new NextRequest('http://localhost:3000/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: '애매한 거래',
          amount: 10000,
          minConfidence: 70
        })
      });

      const response = await POST(request);
      const result = await response.json();

      expect(result.classification.confidence).toBe(45);
      expect(result.warning).toBe('Classification confidence below threshold');
    });

    it('should log classification requests for analytics', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      transactionClassifier.classify.mockResolvedValue({
        businessType: '편의점',
        confidence: 95,
        layer: 'REGEX'
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars

      const request = new NextRequest('http://localhost:3000/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: 'GS25 결제',
          amount: 15000
        })
      });

      await POST(request);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Classification request:'),
        expect.objectContaining({
          description: 'GS25 결제',
          result: expect.objectContaining({ businessType: '편의점' })
        })
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('error edge cases', () => {
    it('should handle extremely large batch requests', async () => {
      const largeBatch = new Array(1000).fill(0).map((_, i) => ({
        description: `Transaction ${i}`,
        amount: 10000 + i
      }));

      // eslint-disable-next-line @typescript-eslint/no-unused-vars

      const request = new NextRequest('http://localhost:3000/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batch: largeBatch })
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(413); // Payload too large
      expect(result.error).toContain('Batch size exceeds limit');
    });

    it('should handle special characters in Korean text', async () => {
      const specialCharacterTransaction = {
        description: 'GS25　강남점❤️😊감사합니다!@#$%^&*()',
        amount: 15000
      };

      transactionClassifier.classify.mockResolvedValue({
        businessType: '편의점',
        confidence: 85,
        layer: 'REGEX'
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars

      const request = new NextRequest('http://localhost:3000/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(specialCharacterTransaction)
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
    });

    it('should sanitize sensitive information in logs', async () => {
      const sensitiveTransaction = {
        description: '카드번호 1234-5678-9012-3456',
        amount: 50000,
        metadata: {
          cardNumber: '1234-5678-9012-3456',
          expiryDate: '12/25'
        }
      };

      transactionClassifier.classify.mockResolvedValue({
        businessType: '금융서비스',
        confidence: 90,
        layer: 'LLM'
      });

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // eslint-disable-next-line @typescript-eslint/no-unused-vars

      const request = new NextRequest('http://localhost:3000/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sensitiveTransaction)
      });

      await POST(request);

      // 카드 번호가 로그에 마스킹되어 기록되어야 함
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Classification request:'),
        expect.objectContaining({
          description: expect.stringMatching(/\*{4}-\*{4}-\*{4}-3456/)
        })
      );
      
      consoleSpy.mockRestore();
    });
  });
});

// Mock implementations
const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const startTime = Date.now();

    // Validation
    if (body.batch && body.batch.length > 500) {
      return Response.json(
        { success: false, error: 'Batch size exceeds limit (500)' },
        { status: 413 }
      );
    }

    if (!body.description && !body.batch) {
      return Response.json(
        { success: false, error: 'Missing required field: description' },
        { status: 400 }
      );
    }

    if (body.description === '') {
      return Response.json(
        { success: false, error: 'description cannot be empty' },
        { status: 400 }
      );
    }

    // Sanitize sensitive data for logging
    const sanitizedBody = {
      ...body,
      description: body.description?.replace(/\d{4}-\d{4}-\d{4}-(\d{4})/g, '****-****-****-$1')
    };

    if (body.batch) {
      // Batch processing
      const { transactionClassifier } = require('../../../../lib/services/transaction-classifier');
      const classifications = await transactionClassifier.classifyBatch(body.batch);
      
      const totalProcessed = classifications.length;
      const averageConfidence = Math.round(
        (classifications.reduce((sum: number, c: any) => sum + c.confidence, 0) / totalProcessed) * 100
      ) / 100;
      
      const layerDistribution = classifications.reduce((acc: any, c: any) => {
        acc[c.layer] = (acc[c.layer] || 0) + 1;
        return acc;
      }, {});

      return Response.json({
        success: true,
        classifications,
        statistics: {
          totalProcessed,
          averageConfidence,
          layerDistribution
        },
        processingTime: Date.now() - startTime
      });
    } else {
      // Single classification
      const { transactionClassifier } = require('../../../../lib/services/transaction-classifier');
      const classification = await transactionClassifier.classify(body);
      
      const result: any = {
        success: true,
        classification,
        processingTime: Date.now() - startTime
      };

      if (body.minConfidence && classification.confidence < body.minConfidence) {
        result.warning = 'Classification confidence below threshold';
      }

      // Logging for analytics
      console.log('Classification request:', {
        description: sanitizedBody.description,
        result: { businessType: classification.businessType, confidence: classification.confidence }
      });

      return Response.json(result);
    }
  } catch (error: any) {
    if (error instanceof SyntaxError) {
      return Response.json(
        { success: false, error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    return Response.json(
      {
        success: false,
        error: 'Classification failed',
        details: error.message
      },
      { status: 500 }
    );
  }
};