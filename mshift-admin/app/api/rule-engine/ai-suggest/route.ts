import { NextRequest, NextResponse } from 'next/server';

// Mock endpoint for rule-engine AI suggestions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const mockSuggestions = {
      success: true,
      data: {
        suggestions: [
          {
            pattern: '카페',
            confidence: 0.92,
            category: '음식점',
            reasoning: 'Transaction contains coffee shop related keywords',
          },
          {
            pattern: '편의점',
            confidence: 0.88,
            category: '쇼핑',
            reasoning: 'Transaction matches convenience store patterns',
          },
        ],
        processingTime: 150,
        model: 'mock-ai-v1',
      },
    };

    return NextResponse.json(mockSuggestions);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          'AI suggestion endpoint is deprecated. Use keyword system instead.',
      },
      { status: 500 }
    );
  }
}
