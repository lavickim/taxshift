import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'overview';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';

    switch (type) {
      case 'overview':
        const totalCount = await prisma.$queryRaw`
          SELECT COUNT(*) as count FROM incheon_restaurants
        `;
        
        const activeCount = await prisma.$queryRaw`
          SELECT COUNT(*) as count FROM incheon_restaurants 
          WHERE business_status = '영업'
        `;

        return NextResponse.json({
          success: true,
          data: {
            totalCount: Number((totalCount as any)[0]?.count || 0),
            activeCount: Number((activeCount as any)[0]?.count || 0)
          }
        });

      case 'region':
        const regionData = await prisma.$queryRaw`
          SELECT 
            district as region,
            COUNT(*) as count
          FROM incheon_restaurants 
          WHERE district IS NOT NULL AND district != ''
          GROUP BY district 
          ORDER BY count DESC
          LIMIT 20
        `;

        return NextResponse.json({
          success: true,
          data: regionData
        });

      case 'status':
        const statusData = await prisma.$queryRaw`
          SELECT 
            business_status as status,
            COUNT(*) as count
          FROM incheon_restaurants 
          WHERE business_status IS NOT NULL
          GROUP BY business_status 
          ORDER BY count DESC
        `;

        return NextResponse.json({
          success: true,
          data: statusData
        });

      case 'details':
        const offset = (page - 1) * limit;
        
        if (search) {
          const searchPattern = `%${search}%`;
          const detailsData = await prisma.$queryRaw`
            SELECT 
              restaurant_name,
              business_status,
              district,
              address,
              phone,
              business_type
            FROM incheon_restaurants 
            WHERE restaurant_name ILIKE ${searchPattern} OR address ILIKE ${searchPattern}
            ORDER BY id DESC
            LIMIT ${limit} OFFSET ${offset}
          `;

          const totalQuery = await prisma.$queryRaw`
            SELECT COUNT(*) as total
            FROM incheon_restaurants 
            WHERE restaurant_name ILIKE ${searchPattern} OR address ILIKE ${searchPattern}
          `;

          return NextResponse.json({
            success: true,
            data: {
              items: detailsData,
              total: Number((totalQuery as any)[0]?.total || 0),
              page,
              limit
            }
          });
        } else {
          const detailsData = await prisma.$queryRaw`
            SELECT 
              restaurant_name,
              business_status,
              district,
              address,
              phone,
              business_type
            FROM incheon_restaurants 
            ORDER BY id DESC
            LIMIT ${limit} OFFSET ${offset}
          `;

          const totalQuery = await prisma.$queryRaw`
            SELECT COUNT(*) as total
            FROM incheon_restaurants
          `;

          return NextResponse.json({
            success: true,
            data: {
              items: detailsData,
              total: Number((totalQuery as any)[0]?.total || 0),
              page,
              limit
            }
          });
        }

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid analysis type'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Incheon restaurants analysis error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to analyze incheon restaurants data'
    }, { status: 500 });
  }
} 