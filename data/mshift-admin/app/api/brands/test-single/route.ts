import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { brandId } = await request.json();
    
    if (!brandId) {
      return NextResponse.json(
        { error: 'Brand ID is required' },
        { status: 400 }
      );
    }

    // 브랜드 정보 조회
    const brand = await prisma.franchiseBrands.findUnique({
      where: { id: brandId },
      select: {
        id: true,
        brandName: true,
        generatedTransactionString: true,
        primaryTag: true,
        secondaryTag: true,
        tertiaryTag: true
      }
    });

    if (!brand) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      );
    }

    if (!brand.generatedTransactionString) {
      return NextResponse.json(
        { error: 'No transaction string generated for this brand' },
        { status: 400 }
      );
    }

    // 키워드 분류 테스트 수행
    const testResult = await testBrandTransaction(brand);
    
    // 결과 저장
    await prisma.franchiseBrands.update({
      where: { id: brandId },
      data: {
        testPassed: testResult.matched,
        lastTestAt: new Date(),
        testResult: testResult
      }
    });

    return NextResponse.json({
      success: true,
      brandId,
      brandName: brand.brandName,
      testPassed: testResult.matched,
      testResult
    });

  } catch (error) {
    console.error('Error testing single brand:', error);
    return NextResponse.json(
      { error: 'Failed to test brand' },
      { status: 500 }
    );
  }
}

async function testBrandTransaction(brand: any) {
  if (!brand.generatedTransactionString) {
    return { matched: false, error: 'No transaction string generated' };
  }

  try {
    // 키워드 분류 테스트 수행 (로컬 API 호출)
    const response = await fetch('http://localhost:3000/api/v2/keyword-test/classify', {
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
    
    // 결과 매칭 확인 (우선순위 태그 중 하나라도 매칭되면 성공)
    const expectedTags = [brand.primaryTag, brand.secondaryTag, brand.tertiaryTag].filter(Boolean);
    const matched = result.matched && expectedTags.includes(result.tag);

    return {
      matched,
      inputText: brand.generatedTransactionString,
      expectedTags,
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