import { NextResponse } from 'next/server';

import { prisma } from '@/lib/db/client';

export async function GET() {
  try {
    // Prisma를 사용한 간단한 연결 테스트
    const result = await prisma.$queryRaw`SELECT 1 as test_connection`;

    return NextResponse.json({
      success: true,
      message: 'Database connection successful!',
      connectionStatus: 'Connected',
      testResult: result,
      testMethod: 'Prisma $queryRaw',
    });
  } catch (error: any) {
    console.error('Database connection test failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Connection failed',
        details: {
          code: error.code,
          message: error.message,
          name: error.name,
        },
        connectionStatus: 'Failed',
      },
      { status: 500 }
    );
  } finally {
    // Prisma 연결 해제
    await prisma.$disconnect();
  }
}
