import { NextRequest, NextResponse } from 'next/server';

const JAVA_API_BASE_URL =
  process.env.JAVA_API_BASE_URL || 'http://localhost:8080/mshift-api';

export async function POST(request: NextRequest) {
  try {
    console.log(
      'POST /api/v2/keyword-test/classify - 키워드 기반 거래 분류 테스트'
    );

    const body = await request.json();
    const { description, amount } = body;

    if (!description) {
      return NextResponse.json(
        { error: '거래 설명이 필요합니다.' },
        { status: 400 }
      );
    }

    console.log('Testing transaction:', { description, amount });

    // Java API로 키워드 분류 요청
    const startTime = Date.now();
    const response = await fetch(
      `${JAVA_API_BASE_URL}/v2/keyword-system/classify`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description,
          amount: amount || 10000,
        }),
      }
    );

    const processingTime = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Java API error:', errorText);

      // Mock response for testing when backend is not available
      const mockResult = {
        matched: false,
        extractedKeywords: [],
        processingPath: 'mock',
        processingTime: processingTime,
        confidence: 0.0,
        message: 'Backend not available - using mock data',
      };

      return NextResponse.json(mockResult);
    }

    const result = await response.json();

    // Add processing time to the result
    result.processingTime = processingTime;

    console.log('Classification result:', result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in keyword classification:', error);

    // Return mock data on error
    const mockResult = {
      matched: false,
      extractedKeywords: [],
      processingPath: 'error-fallback',
      processingTime: 0,
      confidence: 0.0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };

    return NextResponse.json(mockResult, { status: 500 });
  }
}
