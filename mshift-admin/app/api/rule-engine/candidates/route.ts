import { NextResponse } from 'next/server';

// Mock endpoint for rule-engine candidates
export async function GET() {
  const mockCandidates = {
    success: true,
    data: [
      {
        id: 1,
        pattern: '카페',
        category: '음식점',
        confidence: 0.85,
        status: 'approved',
      },
      {
        id: 2,
        pattern: '주유소',
        category: '교통',
        confidence: 0.9,
        status: 'pending',
      },
    ],
  };

  return NextResponse.json(mockCandidates);
}

export async function POST() {
  return NextResponse.json({
    success: true,
    message:
      'Rule engine candidates endpoint is deprecated. Use keyword system instead.',
  });
}
