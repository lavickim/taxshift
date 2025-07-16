import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source') || 'cache';
    const keywordGroupId = searchParams.get('keywordGroupId');
    const tagId = searchParams.get('tagId');
    
    // Build query parameters
    const params = new URLSearchParams();
    params.append('source', source);
    if (keywordGroupId) params.append('keywordGroupId', keywordGroupId);
    if (tagId) params.append('tagId', tagId);
    
    const backendUrl = `${BACKEND_URL}/api/v2/tag-mapping-mgmt/mappings?${params.toString()}`;
    console.log('Proxying to:', backendUrl);
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying to backend:', error);
    return NextResponse.json({ error: 'Failed to fetch mappings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const backendUrl = `${BACKEND_URL}/api/v2/tag-mapping-mgmt/mappings`;
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying to backend:', error);
    return NextResponse.json({ error: 'Failed to create mapping' }, { status: 500 });
  }
}