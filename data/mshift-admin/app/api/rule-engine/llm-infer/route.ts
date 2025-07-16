import { NextRequest, NextResponse } from 'next/server';

// Mock endpoint for rule-engine LLM inference
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const mockInference = {
      success: true,
      data: {
        classification: {
          category: "음식점",
          subcategory: "카페",
          confidence: 0.85
        },
        reasoning: "Based on transaction description, this appears to be a coffee shop transaction",
        alternatives: [
          { category: "편의점", confidence: 0.25 },
          { category: "기타", confidence: 0.15 }
        ],
        processingTime: 280,
        model: "mock-llm-v1"
      }
    };

    return NextResponse.json(mockInference);
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: "LLM inference endpoint is deprecated. Use keyword system instead." 
    }, { status: 500 });
  }
}