import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

// 배치 테스트 상태 관리
const batchStatus = new Map<string, {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  totalCount: number;
  processedCount: number;
  successCount: number;
  failureCount: number;
  startTime: Date;
  endTime?: Date;
  currentBrand?: string;
  results: Array<{
    brandId: number;
    brandName: string;
    testPassed: boolean;
    testResult: any;
    processingTime: number;
  }>;
}>();

export async function POST(request: NextRequest) {
  try {
    const { batchId, batchSize = 100, filters = {} } = await request.json();
    
    console.log(`Starting batch test ${batchId} with size ${batchSize}`);
    
    // 배치 상태 초기화
    batchStatus.set(batchId, {
      id: batchId,
      status: 'running',
      totalCount: batchSize,
      processedCount: 0,
      successCount: 0,
      failureCount: 0,
      startTime: new Date(),
      results: []
    });

    // 비동기로 배치 처리 시작
    processBatch(batchId, batchSize, filters);

    return NextResponse.json({
      success: true,
      batchId,
      message: 'Batch test started'
    });

  } catch (error) {
    console.error('Error starting batch test:', error);
    return NextResponse.json(
      { error: 'Failed to start batch test' },
      { status: 500 }
    );
  }
}

async function processBatch(batchId: string, batchSize: number, filters: any) {
  const batch = batchStatus.get(batchId);
  if (!batch) return;

  try {
    // 테스트할 브랜드 조회
    const where: any = {
      generatedTransactionString: { not: null }
    };

    if (filters.testStatus === 'untested') {
      where.testPassed = null;
    }

    const brands = await prisma.franchiseBrands.findMany({
      where,
      take: batchSize,
      orderBy: [
        { testPassed: 'asc' }, // 미테스트 우선
        { lastTestAt: 'asc' }  // 오래된 테스트 우선
      ],
      select: {
        id: true,
        brandName: true,
        generatedTransactionString: true,
        primaryTag: true,
        secondaryTag: true,
        tertiaryTag: true
      }
    });

    batch.totalCount = brands.length;
    
    // 각 브랜드에 대해 테스트 수행
    for (const brand of brands) {
      if (batch.status !== 'running') break;

      batch.currentBrand = brand.brandName;
      
      const startTime = Date.now();
      
      try {
        // 키워드 분류 테스트 API 호출
        const testResult = await testBrandTransaction(brand);
        
        const processingTime = Date.now() - startTime;
        
        // 결과 저장
        await prisma.franchiseBrands.update({
          where: { id: brand.id },
          data: {
            testPassed: testResult.matched,
            lastTestAt: new Date(),
            testResult: testResult
          }
        });

        batch.results.push({
          brandId: brand.id,
          brandName: brand.brandName,
          testPassed: testResult.matched,
          testResult,
          processingTime
        });

        if (testResult.matched) {
          batch.successCount++;
        } else {
          batch.failureCount++;
        }

        console.log(`✓ ${brand.brandName}: ${testResult.matched ? 'PASS' : 'FAIL'} (${processingTime}ms)`);

      } catch (error) {
        console.error(`✗ ${brand.brandName}: ERROR`, error);
        
        batch.results.push({
          brandId: brand.id,
          brandName: brand.brandName,
          testPassed: false,
          testResult: { error: error instanceof Error ? error.message : 'Unknown error' },
          processingTime: Date.now() - startTime
        });

        batch.failureCount++;
      }

      batch.processedCount++;
      
      // 너무 빠르게 처리하지 않도록 잠시 대기
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // 배치 완료
    batch.status = 'completed';
    batch.endTime = new Date();
    batch.currentBrand = undefined;
    
    console.log(`Batch ${batchId} completed: ${batch.successCount}/${batch.totalCount} passed`);

  } catch (error) {
    console.error(`Batch ${batchId} failed:`, error);
    batch.status = 'failed';
    batch.endTime = new Date();
    batch.currentBrand = undefined;
  }
}

async function testBrandTransaction(brand: any) {
  if (!brand.generatedTransactionString) {
    return { matched: false, error: 'No transaction string generated' };
  }

  try {
    // 키워드 분류 테스트 수행
    const response = await fetch('http://localhost:8080/api/keyword-test/classify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputText: brand.generatedTransactionString,
        returnDetails: true
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const result = await response.json();
    
    // 결과 매칭 확인
    const matched = result.matched && (
      result.tag === brand.primaryTag ||
      result.tag === brand.secondaryTag ||
      result.tag === brand.tertiaryTag
    );

    return {
      matched,
      inputText: brand.generatedTransactionString,
      expectedTags: [brand.primaryTag, brand.secondaryTag, brand.tertiaryTag].filter(Boolean),
      actualTag: result.tag,
      keywordGroup: result.keywordGroup,
      confidence: result.confidence,
      processingPath: result.processingPath,
      processingTime: result.processingTime,
      rawResult: result
    };

  } catch (error) {
    return {
      matched: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      inputText: brand.generatedTransactionString,
      expectedTags: [brand.primaryTag, brand.secondaryTag, brand.tertiaryTag].filter(Boolean)
    };
  }
}

// 배치 상태 조회 엔드포인트
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get('batchId');
    
    if (!batchId) {
      return NextResponse.json(
        { error: 'Batch ID is required' },
        { status: 400 }
      );
    }

    const batch = batchStatus.get(batchId);
    
    if (!batch) {
      return NextResponse.json(
        { error: 'Batch not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: batch.id,
      status: batch.status,
      totalCount: batch.totalCount,
      processedCount: batch.processedCount,
      successCount: batch.successCount,
      failureCount: batch.failureCount,
      startTime: batch.startTime,
      endTime: batch.endTime,
      currentBrand: batch.currentBrand,
      results: batch.results
    });

  } catch (error) {
    console.error('Error fetching batch status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch batch status' },
      { status: 500 }
    );
  }
}