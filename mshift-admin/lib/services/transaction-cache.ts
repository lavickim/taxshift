import { prisma } from '@/lib/db/client';
import { TransactionCache } from '@/lib/generated/prisma';

export interface CreateTransactionCacheData {
  rawTextHash: string;
  rawText: string;
  uniqueKey: string;
}

export interface UpdateTransactionCacheData {
  uniqueKey?: string;
}

export interface DeleteResult {
  count: number;
}

/**
 * TransactionCache 테이블을 위한 서비스 클래스
 * CRUD 연산과 유효성 검증을 제공합니다.
 */
export class TransactionCacheService {
  /**
   * 새로운 거래 캐시를 생성합니다.
   * @param data 생성할 캐시 데이터
   * @returns 생성된 캐시 데이터
   */
  async create(data: CreateTransactionCacheData): Promise<TransactionCache> {
    this.validateHash(data.rawTextHash);
    this.validateCreateData(data);

    try {
      return await prisma.transactionCache.create({
        data: {
          rawTextHash: data.rawTextHash,
          rawText: data.rawText,
          uniqueKey: data.uniqueKey,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new Error('이미 존재하는 해시입니다');
      }
      throw error;
    }
  }

  /**
   * 해시로 캐시 데이터를 조회합니다.
   * @param hash 조회할 해시값
   * @returns 캐시 데이터 또는 null
   */
  async findByHash(hash: string): Promise<TransactionCache | null> {
    this.validateHash(hash);

    return await prisma.transactionCache.findUnique({
      where: { rawTextHash: hash },
    });
  }

  /**
   * 모든 캐시 데이터를 조회합니다.
   * @returns 모든 캐시 데이터 배열 (생성 순서대로)
   */
  async findAll(): Promise<TransactionCache[]> {
    return await prisma.transactionCache.findMany({
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * 캐시 데이터의 총 개수를 조회합니다.
   * @returns 캐시 데이터 개수
   */
  async count(): Promise<number> {
    return await prisma.transactionCache.count();
  }

  /**
   * 캐시 데이터를 수정합니다.
   * @param hash 수정할 데이터의 해시
   * @param data 수정할 데이터
   * @returns 수정된 캐시 데이터
   */
  async update(
    hash: string,
    data: UpdateTransactionCacheData
  ): Promise<TransactionCache> {
    this.validateHash(hash);

    try {
      return await prisma.transactionCache.update({
        where: { rawTextHash: hash },
        data: data,
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new Error('해당 해시의 캐시를 찾을 수 없습니다');
      }
      throw error;
    }
  }

  /**
   * 캐시 데이터를 삭제합니다.
   * @param hash 삭제할 데이터의 해시
   * @returns 삭제된 캐시 데이터
   */
  async delete(hash: string): Promise<TransactionCache> {
    this.validateHash(hash);

    try {
      return await prisma.transactionCache.delete({
        where: { rawTextHash: hash },
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new Error('해당 해시의 캐시를 찾을 수 없습니다');
      }
      throw error;
    }
  }

  /**
   * 모든 캐시 데이터를 삭제합니다.
   * @returns 삭제 결과
   */
  async deleteAll(): Promise<DeleteResult> {
    const result = await prisma.transactionCache.deleteMany({});
    return { count: result.count };
  }

  /**
   * 캐시 데이터를 생성하거나 업데이트합니다.
   * @param hash 대상 해시
   * @param createData 생성할 데이터
   * @param updateData 업데이트할 데이터
   * @returns upsert된 캐시 데이터
   */
  async upsert(
    hash: string,
    createData: CreateTransactionCacheData,
    updateData: UpdateTransactionCacheData
  ): Promise<TransactionCache> {
    this.validateHash(hash);
    this.validateCreateData(createData);

    return await prisma.transactionCache.upsert({
      where: { rawTextHash: hash },
      create: {
        rawTextHash: createData.rawTextHash,
        rawText: createData.rawText,
        uniqueKey: createData.uniqueKey,
      },
      update: updateData,
    });
  }

  /**
   * 캐시에서 값을 조회합니다 (키 기반)
   * @param key 조회할 키
   * @returns 캐시된 값 또는 null
   */
  async get(key: string): Promise<any | null> {
    // 키를 해시로 변환
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256').update(key).digest('hex');

    const cached = await this.findByHash(hash);
    if (cached) {
      try {
        return JSON.parse(cached.uniqueKey);
      } catch {
        return cached.uniqueKey;
      }
    }
    return null;
  }

  /**
   * 캐시에 값을 저장합니다 (키 기반)
   * @param key 저장할 키
   * @param value 저장할 값
   * @param ttl TTL (초) - 현재는 무시됨
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256').update(key).digest('hex');

    const serializedValue =
      typeof value === 'string' ? value : JSON.stringify(value);

    await this.upsert(
      hash,
      {
        rawTextHash: hash,
        rawText: key,
        uniqueKey: serializedValue,
      },
      {
        uniqueKey: serializedValue,
      }
    );
  }

  /**
   * 헬스체크를 수행합니다
   * @returns 서비스 상태
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.count();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 해시 형식이 유효한지 검증합니다.
   * @param hash 검증할 해시
   * @throws 잘못된 해시 형식인 경우 에러
   */
  private validateHash(hash: string): void {
    if (!hash || typeof hash !== 'string') {
      throw new Error('해시는 문자열이어야 합니다');
    }

    if (hash.length !== 64) {
      throw new Error('해시는 64자리 16진수여야 합니다');
    }

    if (!/^[a-f0-9]{64}$/.test(hash)) {
      throw new Error('해시는 64자리 16진수여야 합니다');
    }
  }

  /**
   * 생성 데이터가 유효한지 검증합니다.
   * @param data 검증할 데이터
   * @throws 잘못된 데이터인 경우 에러
   */
  private validateCreateData(data: CreateTransactionCacheData): void {
    if (
      !data.rawText ||
      typeof data.rawText !== 'string' ||
      data.rawText.trim() === ''
    ) {
      throw new Error('rawText는 비어있을 수 없습니다');
    }

    if (
      !data.uniqueKey ||
      typeof data.uniqueKey !== 'string' ||
      data.uniqueKey.trim() === ''
    ) {
      throw new Error('uniqueKey는 비어있을 수 없습니다');
    }
  }
}
