import { NextRequest } from 'next/server';

import { prisma } from '@/lib/db/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'overview';

    switch (type) {
      case 'overview':
        return await getOverviewData();
      case 'industry':
        return await getIndustryData();
      case 'company':
        return await getCompanyData();
      case 'year':
        return await getYearData();
      case 'details':
        return await getDetailData(searchParams);
      default:
        return Response.json(
          { success: false, error: '유효하지 않은 타입입니다.' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('API 오류 상세:', error);
    console.error('Error message:', (error as any)?.message);
    console.error('Error stack:', (error as any)?.stack);
    return Response.json(
      {
        success: false,
        error: '데이터를 불러오는 중 오류가 발생했습니다.',
        details: (error as any)?.message,
      },
      { status: 500 }
    );
  }
}

async function getOverviewData() {
  try {
    console.log('Overview data query started...');

    const [totalBrands, totalCategories] = await Promise.all([
      prisma.$queryRaw`SELECT COUNT(*) as count FROM datacollection_franchise_brands`,
      prisma.$queryRaw`SELECT COUNT(DISTINCT category) as count FROM datacollection_franchise_brands WHERE category IS NOT NULL AND category != ''`,
    ]);

    const data = {
      totalBrands: Number((totalBrands as any)[0]?.count || 0),
      totalCategories: Number((totalCategories as any)[0]?.count || 0),
      dataSource: 'datacollection_franchise_brands',
    };

    console.log('Real database data:', data);
    return Response.json({ success: true, data });
  } catch (error) {
    console.error('개요 데이터 조회 오류:', error);
    throw error;
  }
}

async function getIndustryData() {
  try {
    const data = await prisma.$queryRaw`
      SELECT 
        category,
        COUNT(*) as count
      FROM datacollection_franchise_brands 
      WHERE category IS NOT NULL AND category != ''
      GROUP BY category 
      ORDER BY count DESC
      LIMIT 20
    `;

    return Response.json({
      success: true,
      data: (data as any[]).map(row => ({
        category: row.category,
        count: Number(row.count),
      })),
    });
  } catch (error) {
    console.error('카테고리별 데이터 조회 오류:', error);
    throw error;
  }
}

async function getCompanyData() {
  try {
    const data = await prisma.$queryRaw`
      SELECT 
        brand_name,
        priority,
        COUNT(*) as count
      FROM datacollection_franchise_brands 
      WHERE brand_name IS NOT NULL AND brand_name != ''
      GROUP BY brand_name, priority 
      ORDER BY priority DESC, count DESC
      LIMIT 20
    `;

    return Response.json({
      success: true,
      data: (data as any[]).map(row => ({
        brandName: row.brand_name,
        priority: row.priority,
        count: Number(row.count),
      })),
    });
  } catch (error) {
    console.error('브랜드별 데이터 조회 오류:', error);
    throw error;
  }
}

async function getYearData() {
  try {
    const data = await prisma.$queryRaw`
      SELECT 
        priority,
        COUNT(*) as count
      FROM datacollection_franchise_brands 
      WHERE priority IS NOT NULL
      GROUP BY priority 
      ORDER BY priority DESC
    `;

    return Response.json({
      success: true,
      data: (data as any[]).map(row => ({
        priority: row.priority,
        count: Number(row.count),
      })),
    });
  } catch (error) {
    console.error('우선순위별 데이터 조회 오류:', error);
    throw error;
  }
}

async function getDetailData(searchParams: URLSearchParams) {
  try {
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const industry = searchParams.get('industry') || '';
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const company = searchParams.get('company') || '';
    const year = searchParams.get('year') || '';

    const offset = (page - 1) * limit;

    // 필터 조건 구성
    const whereConditions = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (search) {
      whereConditions.push(
        `(brand_name ILIKE $${paramIndex} OR category ILIKE $${paramIndex + 1})`
      );
      params.push(`%${search}%`, `%${search}%`);
      paramIndex += 2;
    }

    if (industry) {
      whereConditions.push(`category = $${paramIndex}`);
      params.push(industry);
      paramIndex++;
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

    // 전체 카운트 조회
    const countQuery = `SELECT COUNT(*) as count FROM datacollection_franchise_brands ${whereClause}`;
    const countResult = await prisma.$queryRawUnsafe(countQuery, ...params);
    const total = Number((countResult as any)[0]?.count || 0);

    // 데이터 조회
    const dataQuery = `
      SELECT 
        brand_name,
        brand_name_english,
        category,
        priority,
        created_at
      FROM datacollection_franchise_brands 
      ${whereClause}
      ORDER BY priority DESC, id DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const items = await prisma.$queryRawUnsafe(
      dataQuery,
      ...params,
      limit,
      offset
    );

    const pages = Math.ceil(total / limit);

    return Response.json({
      success: true,
      data: {
        items,
        pagination: {
          page,
          limit,
          total,
          pages,
        },
      },
    });
  } catch (error) {
    console.error('상세 데이터 조회 오류:', error);
    throw error;
  }
}
