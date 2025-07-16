import { NextResponse } from 'next/server';

// Mock endpoint for rule-engine analytics
export async function GET() {
  const mockAnalytics = {
    success: true,
    data: {
      totalRules: 45,
      activeRules: 42,
      averageAccuracy: 0.87,
      processingSpeed: 25,
      dailyStats: [
        { date: '2024-01-01', accuracy: 0.85, processed: 1200 },
        { date: '2024-01-02', accuracy: 0.88, processed: 1350 },
        { date: '2024-01-03', accuracy: 0.86, processed: 1100 }
      ]
    }
  };

  return NextResponse.json(mockAnalytics);
}