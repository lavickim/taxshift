import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL =
  process.env.BACKEND_URL || 'http://localhost:8080/mshift-api';

export async function GET(request: NextRequest) {
  try {
    const backendUrl = `${BACKEND_URL}/api/v2/tag-mapping-mgmt/mapping-stats`;
    console.log('Proxying to:', backendUrl);

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Backend mapping stats API error:', response.status);
      // Return fallback stats if backend fails
      return NextResponse.json({
        totalKeywordTagMappings: 0,
        totalTagAccountMappings: 0,
        averageConfidence: 0,
        topUsedMappings: [],
      });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying to backend mapping stats:', error);
    // Return fallback stats if error occurs
    return NextResponse.json({
      totalKeywordTagMappings: 0,
      totalTagAccountMappings: 0,
      averageConfidence: 0,
      topUsedMappings: [],
    });
  }
}
