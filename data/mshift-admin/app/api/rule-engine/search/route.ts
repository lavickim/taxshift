import { NextRequest, NextResponse } from 'next/server';

// Mock endpoint for rule-engine search
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const query = body.query || '';
    
    const mockSearchResults = {
      success: true,
      data: {
        query: query,
        results: [
          {
            id: 1,
            pattern: "스타벅스",
            category: "카페",
            confidence: 0.95,
            usage: 45,
            lastUsed: "2024-01-15"
          },
          {
            id: 2,
            pattern: "GS칼텍스",
            category: "주유소",
            confidence: 0.88,
            usage: 32,
            lastUsed: "2024-01-14"
          }
        ],
        totalResults: 2,
        processingTime: 12
      }
    };

    return NextResponse.json(mockSearchResults);
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: "Search endpoint is deprecated. Use keyword system instead." 
    }, { status: 500 });
  }
}