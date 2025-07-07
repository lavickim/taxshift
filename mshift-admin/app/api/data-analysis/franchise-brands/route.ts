import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'overview'

    switch (type) {
      case 'overview':
        return await getOverviewData()
      case 'industry':
        return await getIndustryData()
      case 'company':
        return await getCompanyData()
      case 'year':
        return await getYearData()
      case 'details':
        return await getDetailData(searchParams)
      default:
        return Response.json({ success: false, error: '유효하지 않은 타입입니다.' }, { status: 400 })
    }
  } catch (error) {
    console.error('API 오류 상세:', error)
    console.error('Error message:', (error as any)?.message)
    console.error('Error stack:', (error as any)?.stack)
    return Response.json({ 
      success: false, 
      error: '데이터를 불러오는 중 오류가 발생했습니다.',
      details: (error as any)?.message
    }, { status: 500 })
  }
}

async function getOverviewData() {
  try {
    console.log('Overview data query started...')
    
    const [totalBrands, totalCompanies, industryCount, yearRange] = await Promise.all([
      prisma.$queryRaw`SELECT COUNT(*) as count FROM franchise_brands`,
      prisma.$queryRaw`SELECT COUNT(DISTINCT company_name) as count FROM franchise_brands WHERE company_name IS NOT NULL AND company_name != ''`,
      prisma.$queryRaw`SELECT COUNT(DISTINCT industry_large_category) as count FROM franchise_brands WHERE industry_large_category IS NOT NULL AND industry_large_category != ''`,
      prisma.$queryRaw`SELECT MIN(business_year) as min_year, MAX(business_year) as max_year FROM franchise_brands WHERE business_year IS NOT NULL AND business_year != ''`
    ])

    const data = {
      totalBrands: Number((totalBrands as any)[0]?.count || 0),
      totalCompanies: Number((totalCompanies as any)[0]?.count || 0),
      industryCount: Number((industryCount as any)[0]?.count || 0),
      yearRange: {
        minYear: (yearRange as any)[0]?.min_year || '2024',
        maxYear: (yearRange as any)[0]?.max_year || '2024'
      }
    }

    console.log('Real database data:', data)
    return Response.json({ success: true, data })
  } catch (error) {
    console.error('개요 데이터 조회 오류:', error)
    throw error
  }
}

async function getIndustryData() {
  try {
    const data = await prisma.$queryRaw`
      SELECT 
        industry_large_category as category,
        COUNT(*) as count
      FROM franchise_brands 
      WHERE industry_large_category IS NOT NULL AND industry_large_category != ''
      GROUP BY industry_large_category 
      ORDER BY count DESC
      LIMIT 20
    `

    return Response.json({ 
      success: true, 
      data: (data as any[]).map(row => ({
        category: row.category,
        count: Number(row.count)
      }))
    })
  } catch (error) {
    console.error('업종별 데이터 조회 오류:', error)
    throw error
  }
}

async function getCompanyData() {
  try {
    const data = await prisma.$queryRaw`
      SELECT 
        company_name as company,
        COUNT(*) as brand_count
      FROM franchise_brands 
      WHERE company_name IS NOT NULL AND company_name != ''
      GROUP BY company_name 
      ORDER BY brand_count DESC
      LIMIT 20
    `

    return Response.json({ 
      success: true, 
      data: (data as any[]).map(row => ({
        company: row.company,
        brandCount: Number(row.brand_count)
      }))
    })
  } catch (error) {
    console.error('회사별 데이터 조회 오류:', error)
    throw error
  }
}

async function getYearData() {
  try {
    const data = await prisma.$queryRaw`
      SELECT 
        business_year as year,
        COUNT(*) as count
      FROM franchise_brands 
      WHERE business_year IS NOT NULL AND business_year != ''
      GROUP BY business_year 
      ORDER BY business_year DESC
    `

    return Response.json({ 
      success: true, 
      data: (data as any[]).map(row => ({
        year: row.year,
        count: Number(row.count)
      }))
    })
  } catch (error) {
    console.error('연도별 데이터 조회 오류:', error)
    throw error
  }
}

async function getDetailData(searchParams: URLSearchParams) {
  try {
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const industry = searchParams.get('industry') || ''
    const company = searchParams.get('company') || ''
    const year = searchParams.get('year') || ''

    const offset = (page - 1) * limit

    // 필터 조건 구성
    let whereConditions = []
    let params: any[] = []
    let paramIndex = 1

    if (search) {
      whereConditions.push(`(brand_name ILIKE $${paramIndex} OR company_name ILIKE $${paramIndex + 1})`)
      params.push(`%${search}%`, `%${search}%`)
      paramIndex += 2
    }

    if (industry) {
      whereConditions.push(`industry_large_category = $${paramIndex}`)
      params.push(industry)
      paramIndex++
    }

    if (company) {
      whereConditions.push(`company_name = $${paramIndex}`)
      params.push(company)
      paramIndex++
    }

    if (year) {
      whereConditions.push(`business_year = $${paramIndex}`)
      params.push(year)
      paramIndex++
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

    // 전체 카운트 조회
    const countQuery = `SELECT COUNT(*) as count FROM franchise_brands ${whereClause}`
    const countResult = await prisma.$queryRawUnsafe(countQuery, ...params)
    const total = Number((countResult as any)[0]?.count || 0)

    // 데이터 조회
    const dataQuery = `
      SELECT 
        brand_name,
        company_name,
        industry_large_category,
        industry_medium_category,
        main_product,
        business_year,
        business_start_date,
        representative_name,
        created_at
      FROM franchise_brands 
      ${whereClause}
      ORDER BY id DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `
    
    const items = await prisma.$queryRawUnsafe(dataQuery, ...params, limit, offset)

    const pages = Math.ceil(total / limit)

    return Response.json({
      success: true,
      data: {
        items,
        pagination: {
          page,
          limit,
          total,
          pages
        }
      }
    })
  } catch (error) {
    console.error('상세 데이터 조회 오류:', error)
    throw error
  }
} 