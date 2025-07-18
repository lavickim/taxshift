import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'overview'

    switch (type) {
      case 'overview':
        return await getOverviewData()
      case 'region':
        return await getRegionData()
      case 'status':
        return await getStatusData()
      case 'details':
        return await getDetailData(searchParams)
      default:
        return Response.json({ success: false, error: '유효하지 않은 타입입니다.' }, { status: 400 })
    }
  } catch (error) {
    console.error('API 오류:', error)
    return Response.json({ 
      success: false, 
      error: '데이터를 불러오는 중 오류가 발생했습니다.',
      details: (error as any)?.message
    }, { status: 500 })
  }
}

async function getOverviewData() {
  try {
    const [totalWorkplaces, activeWorkplaces, regionCount, dataRange] = await Promise.all([
      prisma.$queryRaw`SELECT COUNT(*) as count FROM national_pension_workplaces`,
      prisma.$queryRaw`SELECT COUNT(*) as count FROM national_pension_workplaces WHERE workplace_status_code = 1`,
      prisma.$queryRaw`SELECT COUNT(DISTINCT SUBSTRING(address_road FROM '^[^ ]+')) as count FROM national_pension_workplaces WHERE address_road IS NOT NULL`,
      prisma.$queryRaw`SELECT MIN(data_year_month) as min_date, MAX(data_year_month) as max_date FROM national_pension_workplaces`
    ])

    const data = {
      totalWorkplaces: Number((totalWorkplaces as any)[0]?.count || 0),
      activeWorkplaces: Number((activeWorkplaces as any)[0]?.count || 0),
      regionCount: Number((regionCount as any)[0]?.count || 0),
      dataRange: {
        minDate: (dataRange as any)[0]?.min_date || '2025-05',
        maxDate: (dataRange as any)[0]?.max_date || '2025-05'
      }
    }

    return Response.json({ success: true, data })
  } catch (error) {
    console.error('개요 데이터 조회 오류:', error)
    throw error
  }
}

async function getRegionData() {
  try {
    const data = await prisma.$queryRaw`
      SELECT 
        SUBSTRING(address_road FROM '^[^ ]+') as region,
        COUNT(*) as count
      FROM national_pension_workplaces 
      WHERE address_road IS NOT NULL AND address_road != ''
      GROUP BY SUBSTRING(address_road FROM '^[^ ]+')
      ORDER BY count DESC
      LIMIT 20
    `

    return Response.json({ 
      success: true, 
      data: (data as any[]).map(row => ({
        region: row.region,
        count: Number(row.count)
      }))
    })
  } catch (error) {
    console.error('지역별 데이터 조회 오류:', error)
    throw error
  }
}

async function getStatusData() {
  try {
    const data = await prisma.$queryRaw`
      SELECT 
        CASE 
          WHEN workplace_status_code = 1 THEN '가입'
          WHEN workplace_status_code = 2 THEN '탈퇴'
          ELSE '기타'
        END as status,
        COUNT(*) as count
      FROM national_pension_workplaces 
      WHERE workplace_status_code IS NOT NULL
      GROUP BY workplace_status_code 
      ORDER BY count DESC
    `

    return Response.json({ 
      success: true, 
      data: (data as any[]).map(row => ({
        status: row.status,
        count: Number(row.count)
      }))
    })
  } catch (error) {
    console.error('상태별 데이터 조회 오류:', error)
    throw error
  }
}

async function getDetailData(searchParams: URLSearchParams) {
  try {
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const region = searchParams.get('region') || ''
    const status = searchParams.get('status') || ''

    const offset = (page - 1) * limit

    // 필터 조건 구성
    let whereConditions = []
    let params: any[] = []
    let paramIndex = 1

    if (search) {
      whereConditions.push(`(workplace_name ILIKE $${paramIndex} OR business_registration_number ILIKE $${paramIndex + 1})`)
      params.push(`%${search}%`, `%${search}%`)
      paramIndex += 2
    }

    if (region) {
      whereConditions.push(`address_road ILIKE $${paramIndex}`)
      params.push(`${region}%`)
      paramIndex++
    }

    if (status) {
      if (status === '가입') {
        whereConditions.push('workplace_status_code = 1')
      } else if (status === '탈퇴') {
        whereConditions.push('workplace_status_code = 2')
      }
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

    // 전체 카운트 조회
    const countQuery = `SELECT COUNT(*) as count FROM national_pension_workplaces ${whereClause}`
    const countResult = await prisma.$queryRawUnsafe(countQuery, ...params)
    const total = Number((countResult as any)[0]?.count || 0)

    // 데이터 조회
    const dataQuery = `
      SELECT 
        id,
        data_year_month,
        workplace_name,
        business_registration_number,
        workplace_status_code,
        postal_code,
        address_jibun,
        address_road,
        industry_code,
        industry_name,
        application_date,
        re_registration_date
      FROM national_pension_workplaces 
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