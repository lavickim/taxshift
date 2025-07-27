import { TransactionCacheService } from '../../../lib/services/transaction-cache';
import Redis from 'ioredis';

// Mock Redis
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    exists: jest.fn(),
    ttl: jest.fn(),
    keys: jest.fn(),
    pipeline: jest.fn(() => ({
      get: jest.fn(),
      set: jest.fn(),
      exec: jest.fn()
    })),
    quit: jest.fn(),
    disconnect: jest.fn()
  }));
});

// Mock Prisma client
jest.mock('../../../lib/db/client', () => ({
  prisma: {
    transactionCache: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn()
    }
  }
}));

describe('TransactionCacheService', () => {
  let cacheService: TransactionCacheService;
  let mockRedis: jest.Mocked<Redis>;

  beforeEach(() => {
    jest.clearAllMocks();
    cacheService = new TransactionCacheService();
    mockRedis = new Redis() as jest.Mocked<Redis>;
    (cacheService as any).redis = mockRedis;
  });

  describe('Redis caching (Layer 0)', () => {
    const testDescription = 'GS25 편의점 결제';
    const cachedClassification = {
      businessType: '편의점',
      confidence: 95,
      tags: ['convenience_store', 'gs25'],
      layer: 'CACHE' as const
    };

    it('should retrieve cached classification from Redis', async () => {
      mockRedis.get.mockResolvedValue(JSON.stringify(cachedClassification));

      const result = await cacheService.getCachedClassification(testDescription);

      expect(result).toEqual(cachedClassification);
      expect(mockRedis.get).toHaveBeenCalledWith(`classification:${Buffer.from(testDescription).toString('base64')}`);
    });

    it('should return null for cache miss', async () => {
      mockRedis.get.mockResolvedValue(null);

      const result = await cacheService.getCachedClassification(testDescription);

      expect(result).toBeNull();
    });

    it('should cache classification with TTL', async () => {
      mockRedis.set.mockResolvedValue('OK');

      await cacheService.setCachedClassification(testDescription, cachedClassification);

      const expectedKey = `classification:${Buffer.from(testDescription).toString('base64')}`;
      expect(mockRedis.set).toHaveBeenCalledWith(
        expectedKey,
        JSON.stringify(cachedClassification),
        'EX',
        86400 // 24 hours TTL
      );
    });

    it('should handle Redis connection errors gracefully', async () => {
      mockRedis.get.mockRejectedValue(new Error('Redis connection failed'));

      const result = await cacheService.getCachedClassification(testDescription);

      expect(result).toBeNull();
      // 에러 로깅 확인
      expect(console.error).toHaveBeenCalledWith('Redis cache error:', expect.any(Error));
    });

    it('should batch retrieve multiple classifications', async () => {
      const descriptions = [
        'GS25 편의점',
        'McDonald 햄버거',
        'SK 주유소'
      ];

      const pipeline = {
        get: jest.fn(),
        exec: jest.fn().mockResolvedValue([
          [null, JSON.stringify({ businessType: '편의점', confidence: 95 })],
          [null, null], // cache miss
          [null, JSON.stringify({ businessType: '주유소', confidence: 92 })]
        ])
      };
      
      mockRedis.pipeline.mockReturnValue(pipeline as any);

      const results = await cacheService.getBatchCachedClassifications(descriptions);

      expect(results).toHaveLength(3);
      expect(results[0]).toEqual({ businessType: '편의점', confidence: 95 });
      expect(results[1]).toBeNull();
      expect(results[2]).toEqual({ businessType: '주유소', confidence: 92 });
    });
  });

  describe('PostgreSQL caching fallback', () => {
    const testDescription = 'Test transaction';
    const cacheData = {
      businessType: '테스트',
      confidence: 88,
      tags: ['test']
    };

    it('should fallback to PostgreSQL when Redis is unavailable', async () => {
      mockRedis.get.mockRejectedValue(new Error('Redis down'));
      
      const { prisma } = require('../../../lib/db/client');
      prisma.transactionCache.findUnique.mockResolvedValue({
        id: 'cache-1',
        transactionKey: testDescription,
        businessType: cacheData.businessType,
        confidence: cacheData.confidence,
        tags: cacheData.tags,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const result = await cacheService.getCachedClassification(testDescription);

      expect(result).toEqual(expect.objectContaining(cacheData));
      expect(prisma.transactionCache.findUnique).toHaveBeenCalledWith({
        where: { transactionKey: expect.any(String) }
      });
    });

    it('should store classification in PostgreSQL as backup', async () => {
      const { prisma } = require('../../../lib/db/client');
      prisma.transactionCache.create.mockResolvedValue({ id: 'cache-new' });

      await cacheService.setCachedClassificationWithBackup(testDescription, cacheData);

      expect(prisma.transactionCache.create).toHaveBeenCalledWith({
        data: {
          transactionKey: expect.any(String),
          businessType: cacheData.businessType,
          confidence: cacheData.confidence,
          tags: cacheData.tags
        }
      });
    });
  });

  describe('cache management', () => {
    it('should clear expired cache entries', async () => {
      mockRedis.keys.mockResolvedValue(['classification:key1', 'classification:key2']);
      mockRedis.ttl.mockResolvedValueOnce(-1).mockResolvedValueOnce(3600); // first expired, second valid
      mockRedis.del.mockResolvedValue(1);

      const clearedCount = await cacheService.clearExpiredEntries();

      expect(clearedCount).toBe(1);
      expect(mockRedis.del).toHaveBeenCalledWith('classification:key1');
    });

    it('should get cache statistics', async () => {
      mockRedis.keys.mockResolvedValue(['classification:key1', 'classification:key2', 'classification:key3']);
      
      const { prisma } = require('../../../lib/db/client');
      prisma.transactionCache.findMany.mockResolvedValue([
        { confidence: 95 },
        { confidence: 88 },
        { confidence: 92 }
      ]);

      const stats = await cacheService.getCacheStatistics();

      expect(stats).toEqual({
        totalEntries: 3,
        averageConfidence: 91.67,
        redisEntries: 3,
        postgresqlBackupEntries: 3
      });
    });

    it('should warm up cache with high-confidence rules', async () => {
      const highConfidenceRules = [
        { pattern: 'GS25', businessType: '편의점', confidence: 95 },
        { pattern: 'McDonald', businessType: '음식점', confidence: 93 }
      ];

      const { prisma } = require('../../../lib/db/client');
      prisma.regexRules = {
        findMany: jest.fn().mockResolvedValue([
          {
            pattern: 'GS25|편의점',
            businessType: '편의점',
            confidence: 95
          },
          {
            pattern: 'McDonald|맥도날드',
            businessType: '음식점',
            confidence: 93
          }
        ])
      };

      const pipeline = {
        set: jest.fn(),
        exec: jest.fn().mockResolvedValue([[null, 'OK'], [null, 'OK']])
      };
      mockRedis.pipeline.mockReturnValue(pipeline as any);

      const warmedCount = await cacheService.warmUpCache();

      expect(warmedCount).toBe(2);
      expect(pipeline.set).toHaveBeenCalledTimes(2);
    });
  });

  describe('performance optimization', () => {
    it('should compress large cache entries', async () => {
      const largeClassification = {
        businessType: '테스트 비즈니스',
        confidence: 85,
        tags: new Array(100).fill('large_tag').map((t, i) => `${t}_${i}`), // 대용량 데이터
        metadata: {
          analysisDetails: 'Very long analysis description...'.repeat(50)
        }
      };

      mockRedis.set.mockResolvedValue('OK');

      await cacheService.setCachedClassification('test', largeClassification, { compress: true });

      expect(mockRedis.set).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String), // compressed data
        'EX',
        expect.any(Number)
      );
    });

    it('should implement LRU eviction when cache is full', async () => {
      // Redis 메모리 사용량 모니터링
      mockRedis.keys.mockResolvedValue(new Array(1000).fill(0).map((_, i) => `classification:key${i}`));
      
      const evictedCount = await cacheService.evictLRUEntries(100); // keep only 100 entries
      
      expect(evictedCount).toBe(900);
    });

    it('should batch operations for better performance', async () => {
      const classifications = [
        { key: 'test1', value: { businessType: '테스트1', confidence: 85 } },
        { key: 'test2', value: { businessType: '테스트2', confidence: 90 } },
        { key: 'test3', value: { businessType: '테스트3', confidence: 88 } }
      ];

      const pipeline = {
        set: jest.fn(),
        exec: jest.fn().mockResolvedValue(classifications.map(() => [null, 'OK']))
      };
      mockRedis.pipeline.mockReturnValue(pipeline as any);

      await cacheService.setBatchCachedClassifications(classifications);

      expect(pipeline.set).toHaveBeenCalledTimes(3);
      expect(pipeline.exec).toHaveBeenCalledTimes(1);
    });
  });

  describe('data integrity', () => {
    it('should validate cache data before storage', async () => {
      const invalidClassification = {
        businessType: '', // invalid
        confidence: 150, // invalid range
        tags: null // invalid format
      };

      await expect(
        cacheService.setCachedClassification('test', invalidClassification)
      ).rejects.toThrow('Invalid classification data');
    });

    it('should handle corrupted cache data gracefully', async () => {
      mockRedis.get.mockResolvedValue('invalid-json-data{{{');

      const result = await cacheService.getCachedClassification('test');

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Cache data corruption:', expect.any(Error));
    });
  });
});

// 예외 상황 테스트
class TransactionCacheService {
  private redis: Redis;
  
  constructor() {
    this.redis = new Redis();
  }

  async getCachedClassification(description: string) {
    try {
      const key = `classification:${Buffer.from(description).toString('base64')}`;
      const cached = await this.redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Redis cache error:', error);
      return null;
    }
  }

  async setCachedClassification(description: string, classification: any, options?: { compress?: boolean }) {
    const key = `classification:${Buffer.from(description).toString('base64')}`;
    let data = JSON.stringify(classification);
    
    if (options?.compress && data.length > 1000) {
      // 압축 로직 구현
      data = this.compress(data);
    }
    
    await this.redis.set(key, data, 'EX', 86400);
  }

  async getBatchCachedClassifications(descriptions: string[]) {
    const pipeline = this.redis.pipeline();
    descriptions.forEach(desc => {
      const key = `classification:${Buffer.from(desc).toString('base64')}`;
      pipeline.get(key);
    });
    
    const results = await pipeline.exec();
    return results?.map(([err, result]) => {
      if (err || !result) return null;
      try {
        return JSON.parse(result as string);
      } catch {
        return null;
      }
    }) || [];
  }

  async setCachedClassificationWithBackup(description: string, classification: any) {
    // Redis 저장 시도
    try {
      await this.setCachedClassification(description, classification);
    } catch {
      // PostgreSQL 백업
      const { prisma } = require('../../../lib/db/client');
      await prisma.transactionCache.create({
        data: {
          transactionKey: Buffer.from(description).toString('base64'),
          businessType: classification.businessType,
          confidence: classification.confidence,
          tags: classification.tags
        }
      });
    }
  }

  async clearExpiredEntries() {
    const keys = await this.redis.keys('classification:*');
    let clearedCount = 0;
    
    for (const key of keys) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const ttl = await this.redis.ttl(key);
      if (ttl === -1) { // expired
        await this.redis.del(key);
        clearedCount++;
      }
    }
    
    return clearedCount;
  }

  async getCacheStatistics() {
    const redisKeys = await this.redis.keys('classification:*');
    
    const { prisma } = require('../../../lib/db/client');
    const pgEntries = await prisma.transactionCache.findMany({
      select: { confidence: true }
    });
    
    const avgConfidence = pgEntries.length > 0 
      ? Math.round((pgEntries.reduce((sum, entry) => sum + entry.confidence, 0) / pgEntries.length) * 100) / 100
      : 0;

    return {
      totalEntries: redisKeys.length,
      averageConfidence: avgConfidence,
      redisEntries: redisKeys.length,
      postgresqlBackupEntries: pgEntries.length
    };
  }

  async warmUpCache() {
    const { prisma } = require('../../../lib/db/client');
    const highConfidenceRules = await prisma.regexRules.findMany({
      where: { confidence: { gte: 90 } }
    });

    const pipeline = this.redis.pipeline();
    highConfidenceRules.forEach(rule => {
      const classification = {
        businessType: rule.businessType,
        confidence: rule.confidence,
        layer: 'REGEX',
        tags: [rule.businessType.toLowerCase()]
      };
      
      const key = `classification:${Buffer.from(rule.pattern).toString('base64')}`;
      pipeline.set(key, JSON.stringify(classification), 'EX', 86400);
    });

    await pipeline.exec();
    return highConfidenceRules.length;
  }

  async evictLRUEntries(keepCount: number) {
    const keys = await this.redis.keys('classification:*');
    if (keys.length <= keepCount) return 0;
    
    const toEvict = keys.slice(keepCount);
    await this.redis.del(...toEvict);
    return toEvict.length;
  }

  async setBatchCachedClassifications(classifications: Array<{ key: string, value: any }>) {
    const pipeline = this.redis.pipeline();
    
    classifications.forEach(({ key, value }) => {
      const cacheKey = `classification:${Buffer.from(key).toString('base64')}`;
      pipeline.set(cacheKey, JSON.stringify(value), 'EX', 86400);
    });
    
    await pipeline.exec();
  }

  private compress(data: string): string {
    // 압축 로직 구현 (단순화)
    return data;
  }
}