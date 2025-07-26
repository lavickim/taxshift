/**
 * 정규식 전처리 실행 API
 * POST /api/regex-preprocessing/preprocess - 텍스트 전처리 실행
 */

import { NextRequest, NextResponse } from 'next/server';
import { RegexPreprocessingEngine } from '@/lib/services/regex-preprocessing.service';

const engine = RegexPreprocessingEngine.getInstance();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, texts } = body;
    
    if (!text && !texts) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Either "text" (string) or "texts" (array) must be provided' 
        },
        { status: 400 }
      );
    }

    // 단일 텍스트 처리
    if (text && typeof text === 'string') {
      const result = await engine.preprocess(text);
      
      return NextResponse.json({
        success: true,
        data: result
      });
    }

    // 다중 텍스트 처리
    if (texts && Array.isArray(texts)) {
      const results = await Promise.all(
        texts.map(async (text: string) => {
          if (typeof text !== 'string') {
            return {
              originalText: text,
              normalizedText: text,
              success: false,
              errorMessage: 'Input must be a string',
              processingTimeMs: 0
            };
          }
          
          return await engine.preprocess(text);
        })
      );
      
      const successCount = results.filter(r => r.success).length;
      const totalProcessingTime = results.reduce((sum, r) => sum + r.processingTimeMs, 0);
      
      return NextResponse.json({
        success: true,
        data: {
          results,
          summary: {
            total: results.length,
            successful: successCount,
            failed: results.length - successCount,
            successRate: (successCount / results.length) * 100,
            totalProcessingTime,
            averageProcessingTime: totalProcessingTime / results.length
          }
        }
      });
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Invalid input format' 
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Failed to preprocess text:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}