import { NextRequest, NextResponse } from 'next/server';

const JAVA_API_BASE_URL = process.env.JAVA_API_BASE_URL || 'http://localhost:8080/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    let url = `${JAVA_API_BASE_URL}/rule-engine/rules`;
    if (category) {
      url = `${JAVA_API_BASE_URL}/rule-engine/rules/category/${category}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Java API error: ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching regex rules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch regex rules' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${JAVA_API_BASE_URL}/admin/rules`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      throw new Error(`Java API error: ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating regex rule:', error);
    return NextResponse.json(
      { error: 'Failed to create regex rule' },
      { status: 500 }
    );
  }
}