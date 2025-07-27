import { NextResponse } from 'next/server';

// Mock endpoint for rule-engine feedback
export async function GET() {
  const mockFeedback = {
    success: true,
    data: [
      {
        id: 1,
        transaction: '스타벅스 강남점',
        originalTag: '기타',
        suggestedTag: '카페',
        confidence: 0.95,
        status: 'processed',
      },
      {
        id: 2,
        transaction: 'GS칼텍스 서초점',
        originalTag: '기타',
        suggestedTag: '주유소',
        confidence: 0.88,
        status: 'pending',
      },
    ],
  };

  return NextResponse.json(mockFeedback);
}

export async function POST() {
  return NextResponse.json({
    success: true,
    message:
      'Rule engine feedback endpoint is deprecated. Use keyword system instead.',
  });
}
