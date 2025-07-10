import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const analysisType = searchParams.get('type') || 'summary';

    switch (analysisType) {
      case 'summary':
        const totalTransactions = await prisma.transaction.count();
        const totalCompanies = await prisma.company.count();
        const totalRules = await prisma.rule.count();

        return NextResponse.json({
          success: true,
          data: {
            totalTransactions,
            totalCompanies,
            totalRules,
            lastUpdated: new Date().toISOString()
          }
        });

      case 'categories':
        const categoryStats = await prisma.transaction.groupBy({
          by: ['finalDebitAccount'],
          _count: {
            _all: true
          },
          orderBy: {
            _count: {
              _all: 'desc'
            }
          },
          take: 10
        });

        return NextResponse.json({
          success: true,
          data: categoryStats.map(stat => ({
            account: stat.finalDebitAccount,
            count: stat._count._all
          }))
        });

      case 'monthly':
        const monthlyStats = await prisma.transaction.groupBy({
          by: ['transactionDate'],
          _count: {
            _all: true
          },
          orderBy: {
            transactionDate: 'desc'
          },
          take: 12
        });

        return NextResponse.json({
          success: true,
          data: monthlyStats
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid analysis type'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Transactions analysis error:', error);
    return NextResponse.json({
      success: false,
      error: 'Analysis failed'
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { transactions } = body;
    
    if (!transactions || !Array.isArray(transactions)) {
      return NextResponse.json({
        success: false,
        error: 'transactions 배열이 필요합니다'
      }, { status: 400 });
    }

    if (transactions.length === 0) {
      return NextResponse.json({
        success: false,
        error: '거래 내역이 비어있습니다'
      }, { status: 400 });
    }

    // Simple analysis for now
    const analysis = {
      total_transactions: transactions.length,
      categories: [],
      suggestions: []
    };

    return NextResponse.json({
      success: true,
      data: analysis
    });

  } catch (error) {
    console.error('Transaction analysis error:', error);
    return NextResponse.json({
      success: false,
      error: 'Analysis failed'
    }, { status: 500 });
  }
} 