import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';

export async function GET() {
  try {
    // 모든 회사 조회
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        companyName: true,
        businessRegistrationNumber: true,
        taxpayerType: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            transactions: true,
            rules: true,
            ruleCandidates: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      companies
    });
  } catch (error) {
    console.error('Companies API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyName, businessRegistrationNumber, taxpayerType } = body;

    if (!companyName) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    // UUID 생성
    const { v4: uuidv4 } = await import('uuid');
    
    // 새 회사 생성
    const company = await prisma.company.create({
      data: {
        id: uuidv4(),
        companyName,
        businessRegistrationNumber: businessRegistrationNumber || null,
        taxpayerType: taxpayerType || 'CORPORATION',
      }
    });

    return NextResponse.json({
      success: true,
      company
    });
  } catch (error) {
    console.error('Companies POST API error:', error);
    
    // 중복 사업자등록번호 에러 처리
    if (error instanceof Error && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Business registration number already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create company' },
      { status: 500 }
    );
  }
} 