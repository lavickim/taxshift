/**
 * 통합 거래 처리 API v3
 * POST /api/v3/transaction/process - 정규식 전처리 + 키워드 추출 통합 처리
 */

import { NextRequest, NextResponse } from 'next/server';
import { IntegratedTransactionProcessingService } from '@/lib/services/integrated-transaction-processing.service';

const integratedService = IntegratedTransactionProcessingService.getInstance();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 단일 거래 처리
    if (body.text) {
      const result = await integratedService.processTransaction(
        body.text,
        body.amount,
        body.useCache !== false // 기본값 true
      );
      
      return NextResponse.json({
        success: true,
        data: result
      });
    }
    
    // 대량 거래 처리
    if (body.transactions && Array.isArray(body.transactions)) {
      const results = await integratedService.processBatch(
        body.transactions,
        body.batchSize || 10
      );
      
      // 대량 처리 요약 통계 생성
      const summary = generateBatchSummary(results);
      
      return NextResponse.json({
        success: true,
        data: {
          results,
          summary
        }
      });
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Invalid request format. Provide either "text" or "transactions" array.' 
      },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('통합 거래 처리 실패:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Processing failed' 
      },
      { status: 500 }
    );
  }
}

function generateBatchSummary(results: any[]) {
  const total = results.length;
  const successful = results.filter(r => r.finalConfidence > 0).length;
  const preprocessingSuccess = results.filter(r => r.preprocessingSuccess).length;
  const keywordSuccess = results.filter(r => r.keywordExtractionSuccess).length;
  
  const pathCounts = results.reduce((acc, r) => {
    acc[r.processingPath] = (acc[r.processingPath] || 0) + 1;
    return acc;
  }, {});
  
  const avgProcessingTime = results.reduce((sum, r) => sum + r.totalProcessingTime, 0) / total;
  const avgConfidence = results.reduce((sum, r) => sum + r.finalConfidence, 0) / total;
  
  return {
    totalProcessed: total,
    successfulClassifications: successful,
    successRate: (successful / total) * 100,
    preprocessingSuccessRate: (preprocessingSuccess / total) * 100,
    keywordExtractionSuccessRate: (keywordSuccess / total) * 100,
    averageProcessingTime: Math.round(avgProcessingTime),
    averageConfidence: Math.round(avgConfidence * 100) / 100,
    processingPathDistribution: pathCounts,
    topRegexRules: getTopItems(results, 'appliedRegexRules'),
    topExtractedKeywords: getTopItems(results, 'extractedKeywords')
  };
}

function getTopItems(results: any[], fieldName: string, limit: number = 5) {
  const itemCounts: Record<string, number> = {};
  
  results.forEach(result => {
    const items = result[fieldName] || [];
    items.forEach((item: string) => {
      itemCounts[item] = (itemCounts[item] || 0) + 1;
    });
  });
  
  return Object.entries(itemCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, limit)
    .map(([item, count]) => ({ item, count }));
}