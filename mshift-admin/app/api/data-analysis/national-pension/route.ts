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
      case 'industry':
        return await getIndustryData()
      case 'company-size':
        return await getCompanySizeData()
      case 'monthly-trend':
        return await getMonthlyTrendData()
      case 'top-companies':
        return await getTopCompaniesData()
      case 'all-companies':
        return await getAllCompaniesData(searchParams)
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
      prisma.$queryRaw`SELECT COUNT(*) as count FROM datacollection_national_pension`,
      prisma.$queryRaw`SELECT COUNT(*) as count FROM datacollection_national_pension WHERE workplace_status_code = '1'`,
      prisma.$queryRaw`SELECT COUNT(DISTINCT SUBSTRING(address_road FROM '^[^ ]+')) as count FROM datacollection_national_pension WHERE address_road IS NOT NULL`,
      prisma.$queryRaw`SELECT MIN(data_year_month) as min_date, MAX(data_year_month) as max_date FROM datacollection_national_pension`
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
      FROM datacollection_national_pension 
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
          WHEN workplace_status_code = '1' THEN '가입'
          WHEN workplace_status_code = '2' THEN '탈퇴'
          ELSE '기타'
        END as status,
        COUNT(*) as count
      FROM datacollection_national_pension 
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
    const whereConditions = []
    const params: any[] = []
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
        whereConditions.push("workplace_status_code = '1'")
      } else if (status === '탈퇴') {
        whereConditions.push("workplace_status_code = '2'")
      }
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

    // 전체 카운트 조회
    const countQuery = `SELECT COUNT(*) as count FROM datacollection_national_pension ${whereClause}`
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
      FROM datacollection_national_pension 
      ${whereClause}
      ORDER BY id DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `
    
    const items = await prisma.$queryRawUnsafe(dataQuery, ...params, limit, offset)

    const pages = Math.ceil(total / limit)

    // BigInt 처리
    const processedItems = (items as any[]).map(item => ({
      ...item,
      id: Number(item.id)
    }))

    return Response.json({
      success: true,
      data: {
        items: processedItems,
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

async function getIndustryData() {
  try {
    const data = await prisma.$queryRaw`
      SELECT 
        industry_name,
        COUNT(*) as count,
        AVG(CAST(member_count as FLOAT)) as avg_employees
      FROM datacollection_national_pension 
      WHERE industry_name IS NOT NULL AND industry_name != '' AND industry_name != 'BIZ_NO미존재사업장'
      GROUP BY industry_name 
      ORDER BY count DESC 
      LIMIT 20
    `

    return Response.json({ 
      success: true, 
      data: (data as any[]).map(row => ({
        industry: row.industry_name,
        count: Number(row.count),
        avgEmployees: Math.round(Number(row.avg_employees) || 0)
      }))
    })
  } catch (error) {
    console.error('업종별 데이터 조회 오류:', error)
    throw error
  }
}

async function getCompanySizeData() {
  try {
    const data = await prisma.$queryRaw`
      SELECT 
        size_category,
        COUNT(*) as count,
        SUM(member_count) as total_employees
      FROM (
        SELECT 
          CASE 
            WHEN member_count IS NULL OR member_count = 0 THEN '미상'
            WHEN member_count BETWEEN 1 AND 4 THEN '1-4명'
            WHEN member_count BETWEEN 5 AND 9 THEN '5-9명'
            WHEN member_count BETWEEN 10 AND 19 THEN '10-19명'
            WHEN member_count BETWEEN 20 AND 49 THEN '20-49명'
            WHEN member_count BETWEEN 50 AND 99 THEN '50-99명'
            WHEN member_count BETWEEN 100 AND 299 THEN '100-299명'
            WHEN member_count BETWEEN 300 AND 999 THEN '300-999명'
            ELSE '1000명+'
          END as size_category,
          member_count
        FROM datacollection_national_pension
      ) t
      GROUP BY size_category
      ORDER BY 
        CASE size_category
          WHEN '미상' THEN 0
          WHEN '1-4명' THEN 1
          WHEN '5-9명' THEN 2
          WHEN '10-19명' THEN 3
          WHEN '20-49명' THEN 4
          WHEN '50-99명' THEN 5
          WHEN '100-299명' THEN 6
          WHEN '300-999명' THEN 7
          ELSE 8
        END
    `

    return Response.json({ 
      success: true, 
      data: (data as any[]).map(row => ({
        category: row.size_category,
        count: Number(row.count),
        totalEmployees: Number(row.total_employees) || 0
      }))
    })
  } catch (error) {
    console.error('기업규모별 데이터 조회 오류:', error)
    throw error
  }
}

async function getMonthlyTrendData() {
  try {
    const data = await prisma.$queryRaw`
      SELECT 
        data_year_month,
        COUNT(*) as total_workplaces,
        COUNT(CASE WHEN workplace_status_code = '1' THEN 1 END) as active_workplaces,
        COUNT(CASE WHEN workplace_status_code = '2' THEN 1 END) as inactive_workplaces,
        SUM(member_count) as total_members,
        AVG(CAST(monthly_notice_amount as FLOAT)) as avg_monthly_amount
      FROM datacollection_national_pension 
      GROUP BY data_year_month 
      ORDER BY data_year_month
    `

    return Response.json({ 
      success: true, 
      data: (data as any[]).map(row => ({
        month: row.data_year_month,
        totalWorkplaces: Number(row.total_workplaces),
        activeWorkplaces: Number(row.active_workplaces),
        inactiveWorkplaces: Number(row.inactive_workplaces),
        totalMembers: Number(row.total_members) || 0,
        avgMonthlyAmount: Math.round(Number(row.avg_monthly_amount) || 0)
      }))
    })
  } catch (error) {
    console.error('월별 트렌드 데이터 조회 오류:', error)
    throw error
  }
}

async function getTopCompaniesData() {
  try {
    const data = await prisma.$queryRaw`
      SELECT 
        workplace_name,
        industry_name,
        member_count,
        monthly_notice_amount,
        address_road,
        SUBSTRING(address_road FROM '^[^ ]+') as region
      FROM datacollection_national_pension 
      WHERE member_count IS NOT NULL AND member_count > 0
      ORDER BY member_count DESC 
      LIMIT 50
    `

    return Response.json({ 
      success: true, 
      data: (data as any[]).map(row => ({
        name: row.workplace_name,
        industry: row.industry_name,
        employees: Number(row.member_count),
        monthlyAmount: Number(row.monthly_notice_amount) || 0,
        address: row.address_road,
        region: row.region
      }))
    })
  } catch (error) {
    console.error('주요 기업 데이터 조회 오류:', error)
    throw error
  }
}

async function getAllCompaniesData(searchParams: URLSearchParams) {
  try {
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '100')
    const search = searchParams.get('search') || ''
    const region = searchParams.get('region') || ''
    const industry = searchParams.get('industry') || ''
    const sortBy = searchParams.get('sortBy') || 'employees' // employees, name, monthly_amount
    const sortOrder = searchParams.get('sortOrder') || 'desc' // asc, desc

    const offset = (page - 1) * limit

    // 필터 조건 구성
    const whereConditions = ['member_count IS NOT NULL', 'member_count > 0']
    const params: any[] = []
    let paramIndex = 1

    if (search) {
      whereConditions.push(`workplace_name ILIKE $${paramIndex}`)
      params.push(`%${search}%`)
      paramIndex++
    }

    if (region) {
      whereConditions.push(`address_road ILIKE $${paramIndex}`)
      params.push(`${region}%`)
      paramIndex++
    }

    if (industry) {
      whereConditions.push(`industry_name ILIKE $${paramIndex}`)
      params.push(`%${industry}%`)
      paramIndex++
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`

    // 정렬 조건 매핑
    const sortMapping: { [key: string]: string } = {
      'employees': 'member_count',
      'name': 'workplace_name',
      'monthly_amount': 'monthly_notice_amount'
    }
    const sortColumn = sortMapping[sortBy] || 'member_count'
    const orderClause = `ORDER BY ${sortColumn} ${sortOrder.toUpperCase()}`

    // 전체 카운트 조회
    const countQuery = `SELECT COUNT(*) as count FROM datacollection_national_pension ${whereClause}`
    const countResult = await prisma.$queryRawUnsafe(countQuery, ...params)
    const total = Number((countResult as any)[0]?.count || 0)

    // 데이터 조회
    const dataQuery = `
      SELECT 
        workplace_name,
        industry_name,
        member_count,
        monthly_notice_amount,
        address_road,
        SUBSTRING(address_road FROM '^[^ ]+') as region,
        workplace_status_code,
        data_year_month
      FROM datacollection_national_pension 
      ${whereClause}
      ${orderClause}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `
    
    const items = await prisma.$queryRawUnsafe(dataQuery, ...params, limit, offset)
    const pages = Math.ceil(total / limit)

    return Response.json({
      success: true,
      data: {
        items: (items as any[]).map(row => ({
          name: row.workplace_name,
          industry: row.industry_name,
          employees: Number(row.member_count),
          monthlyAmount: Number(row.monthly_notice_amount) || 0,
          address: row.address_road,
          region: row.region,
          status: row.workplace_status_code === '1' ? '가입' : '탈퇴',
          dataMonth: row.data_year_month
        })),
        pagination: {
          page,
          limit,
          total,
          pages
        },
        filters: {
          search,
          region,
          industry,
          sortBy,
          sortOrder
        }
      }
    })
  } catch (error) {
    console.error('전체 기업 데이터 조회 오류:', error)
    throw error
  }
} 