import { NextRequest, NextResponse } from 'next/server';

const JAVA_API_BASE_URL = process.env.JAVA_API_BASE_URL || 'http://localhost:8080';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testType, testData } = body;
    
    console.log(`키워드 시스템 테스트 시작: ${testType}`, testData);
    
    const testResults = {
      testType,
      timestamp: new Date().toISOString(),
      results: []
    };

    switch (testType) {
      case 'keyword-extraction':
        testResults.results = await testKeywordExtraction(testData);
        break;
      case 'tag-mapping':
        testResults.results = await testTagMapping(testData);
        break;
      case 'end-to-end':
        testResults.results = await testEndToEnd(testData);
        break;
      default:
        return NextResponse.json(
          { error: '지원되지 않는 테스트 타입입니다.' },
          { status: 400 }
        );
    }

    console.log('키워드 시스템 테스트 완료:', testResults);
    return NextResponse.json(testResults);
    
  } catch (error) {
    console.error('키워드 시스템 테스트 실패:', error);
    return NextResponse.json(
      { error: '테스트 실행 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

async function testKeywordExtraction(testData: any[]) {
  const results = [];
  
  for (const test of testData) {
    const startTime = Date.now();
    
    try {
      // Mock keyword extraction test
      const extractedKeywords = extractKeywordsFromText(test.input);
      const processingTime = Date.now() - startTime;
      
      results.push({
        input: test.input,
        extractedKeywords,
        expectedKeywords: test.expectedKeywords || [],
        matched: checkKeywordMatch(extractedKeywords, test.expectedKeywords || []),
        processingTime,
        success: true
      });
    } catch (error) {
      results.push({
        input: test.input,
        error: error.message,
        processingTime: Date.now() - startTime,
        success: false
      });
    }
  }
  
  return results;
}

async function testTagMapping(testData: any[]) {
  const results = [];
  
  for (const test of testData) {
    const startTime = Date.now();
    
    try {
      // Test tag recommendation
      const response = await fetch(`${process.env.NEXTAUTH_URL}/api/v2/tag-mapping/recommend-tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: test.keyword,
          transactionText: test.input,
          amount: test.amount || 5000,
          timestamp: new Date().toISOString()
        })
      });
      
      const recommendations = await response.json();
      const processingTime = Date.now() - startTime;
      
      results.push({
        input: test.input,
        keyword: test.keyword,
        recommendations,
        expectedTags: test.expectedTags || [],
        matched: checkTagMatch(recommendations, test.expectedTags || []),
        processingTime,
        success: response.ok
      });
    } catch (error) {
      results.push({
        input: test.input,
        keyword: test.keyword,
        error: error.message,
        processingTime: Date.now() - startTime,
        success: false
      });
    }
  }
  
  return results;
}

async function testEndToEnd(testData: any[]) {
  const results = [];
  
  for (const test of testData) {
    const startTime = Date.now();
    
    try {
      // 1. Extract keywords
      const extractedKeywords = extractKeywordsFromText(test.input);
      
      // 2. Get tag recommendations
      const response = await fetch(`${process.env.NEXTAUTH_URL}/api/v2/tag-mapping/recommend-tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: extractedKeywords[0] || test.input,
          transactionText: test.input,
          amount: test.amount || 5000,
          timestamp: new Date().toISOString()
        })
      });
      
      const recommendations = await response.json();
      const processingTime = Date.now() - startTime;
      
      // 3. Evaluate end-to-end result
      const finalResult = {
        extractedKeywords,
        recommendations,
        finalTag: recommendations[0]?.tagMapping?.tag?.tagName || 'Unknown',
        finalAccount: recommendations[0]?.recommendedAccount || 'Unknown',
        confidence: recommendations[0]?.finalConfidence || 0
      };
      
      results.push({
        input: test.input,
        result: finalResult,
        expectedTag: test.expectedTag,
        expectedAccount: test.expectedAccount,
        matched: finalResult.finalTag === test.expectedTag,
        processingTime,
        success: response.ok
      });
    } catch (error) {
      results.push({
        input: test.input,
        error: error.message,
        processingTime: Date.now() - startTime,
        success: false
      });
    }
  }
  
  return results;
}

function extractKeywordsFromText(text: string): string[] {
  const keywords = [];
  const normalizedText = text.toLowerCase();
  
  // Simple keyword extraction patterns
  const patterns = [
    { regex: /세븐일레븐|7-?eleven|세븐/g, keyword: '세븐일레븐' },
    { regex: /cu|씨유/g, keyword: 'CU' },
    { regex: /gs칼텍스|gs/g, keyword: 'GS칼텍스' },
    { regex: /sk에너지|sk/g, keyword: 'SK에너지' },
    { regex: /맥도날드|맥도/g, keyword: '맥도날드' },
    { regex: /스타벅스|스벅/g, keyword: '스타벅스' },
    { regex: /이마트24/g, keyword: '이마트24' },
    { regex: /롯데리아/g, keyword: '롯데리아' }
  ];
  
  for (const pattern of patterns) {
    if (pattern.regex.test(normalizedText)) {
      keywords.push(pattern.keyword);
    }
  }
  
  return keywords;
}

function checkKeywordMatch(extracted: string[], expected: string[]): boolean {
  if (expected.length === 0) return true;
  return expected.some(exp => extracted.includes(exp));
}

function checkTagMatch(recommendations: any[], expectedTags: string[]): boolean {
  if (expectedTags.length === 0) return true;
  const extractedTags = recommendations.map(rec => rec.tagMapping?.tag?.tagName).filter(Boolean);
  return expectedTags.some(exp => extractedTags.includes(exp));
}