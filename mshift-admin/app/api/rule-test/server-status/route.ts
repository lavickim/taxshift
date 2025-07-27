import { NextResponse } from 'next/server';

const API_BASE_URL =
  process.env.JAVA_API_BASE_URL || 'http://localhost:8080/mshift-api';

export async function GET() {
  try {
    // API 서버 헬스 체크
    const response = await fetch(`${API_BASE_URL}/transactions/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000), // 5초 타임아웃
    });

    if (response.ok) {
      return NextResponse.json({ status: 'running' });
    } else {
      return NextResponse.json({ status: 'stopped' });
    }
  } catch (error) {
    console.error('Error checking API server status:', error);
    return NextResponse.json({ status: 'stopped' });
  }
}
