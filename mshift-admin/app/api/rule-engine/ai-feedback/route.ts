import { NextRequest, NextResponse } from 'next/server';

// Mock endpoint for rule-engine AI feedback
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const mockFeedbackResponse = {
      success: true,
      data: {
        feedbackId: Date.now(),
        status: 'processed',
        improvements: [
          'Pattern accuracy improved by 3%',
          'New keyword variations added',
          'Category mapping refined',
        ],
        processingTime: 45,
        affectedRules: 5,
      },
    };

    return NextResponse.json(mockFeedbackResponse);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          'AI feedback endpoint is deprecated. Use keyword system instead.',
      },
      { status: 500 }
    );
  }
}
