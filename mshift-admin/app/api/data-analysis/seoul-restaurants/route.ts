import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'overview'

    switch (type) {
      case 'overview':
        return await getOverviewData()
      case 'business_type':
        return await getBusinessTypeData()
      case 'business_status':
        return await getBusinessStatusData()
      case 'timeline':
        return await getTimelineData()
      case 'details':
        return await getDetailData(searchParams)
      default:
        return Response.json({ success: false, error: '유효하지 않은 타입입니다.' }, { status: 400 })
    }
  } catch (error) {
    console.error('API 오류:', error)
    return Response.json({ 
      success: false, 
      error: '데이터를 불러오는 중 오류가 발생했습니다.' 
    }, { status: 500 })
  }
}

async function getOverviewData() {
  try {
    const [
      totalRecords,
      batchCount,
      firstCollection,
      lastCollection,
      activeBusinesses
    ] = await Promise.all([
      prisma.$queryRaw`SELECT COUNT(*) as count FROM datacollection_seoul_restaurants`,
      prisma.$queryRaw`SELECT COUNT(DISTINCT collection_batch_id) as count FROM datacollection_seoul_restaurants WHERE collection_batch_id IS NOT NULL`,
      prisma.$queryRaw`SELECT MIN(created_at) as date FROM datacollection_seoul_restaurants`,
      prisma.$queryRaw`SELECT MAX(created_at) as date FROM datacollection_seoul_restaurants`,
      prisma.$queryRaw`SELECT COUNT(*) as count FROM datacollection_seoul_restaurants WHERE business_status_name = '영업'`
    ])

    const data = {
      totalRecords: Number((totalRecords as any)[0]?.count || 0),
      batchCount: Number((batchCount as any)[0]?.count || 0),
      firstCollection: (firstCollection as any)[0]?.date || new Date().toISOString(),
      lastCollection: (lastCollection as any)[0]?.date || new Date().toISOString(),
      activeBusinesses: Number((activeBusinesses as any)[0]?.count || 0)
    }

    return Response.json({ success: true, data })
  } catch (error) {
    console.error('개요 데이터 조회 오류:', error)
    throw error
  }
}

async function getBusinessTypeData() {
  try {
    const data = await prisma.$queryRaw`
      SELECT 
        business_type as type,
        COUNT(*) as count
      FROM datacollection_seoul_restaurants 
      WHERE business_type IS NOT NULL AND business_type != ''
      GROUP BY business_type 
      ORDER BY count DESC
      LIMIT 20
    `

    return Response.json({ 
      success: true, 
      data: (data as any[]).map(row => ({
        type: row.type,
        count: Number(row.count)
      }))
    })
  } catch (error) {
    console.error('업종별 데이터 조회 오류:', error)
    throw error
  }
}

async function getBusinessStatusData() {
  try {
    const data = await prisma.$queryRaw`
      SELECT 
        business_status_name as status,
        COUNT(*) as count
      FROM datacollection_seoul_restaurants 
      WHERE business_status_name IS NOT NULL AND business_status_name != ''
      GROUP BY business_status_name 
      ORDER BY count DESC
      LIMIT 10
    `

    return Response.json({ 
      success: true, 
      data: (data as any[]).map(row => ({
        status: row.status,
        count: Number(row.count)
      }))
    })
  } catch (error) {
    console.error('영업상태별 데이터 조회 오류:', error)
    throw error
  }
}

async function getTimelineData() {
  try {
    const data = await prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM datacollection_seoul_restaurants 
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `

    return Response.json({ 
      success: true, 
      data: (data as any[]).map(row => ({
        date: row.date,
        count: Number(row.count)
      }))
    })
  } catch (error) {
    console.error('시간별 데이터 조회 오류:', error)
    throw error
  }
}

async function getDetailData(searchParams: URLSearchParams) {
  try {
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const businessType = searchParams.get('business_type') || ''
    const businessStatus = searchParams.get('business_status') || ''

    const offset = (page - 1) * limit

    // 필터 조건 구성
    let whereConditions = []
    let params: any[] = []
    let paramIndex = 1

    if (search) {
      whereConditions.push(`(business_name ILIKE $${paramIndex} OR management_number ILIKE $${paramIndex + 1})`)
      params.push(`%${search}%`, `%${search}%`)
      paramIndex += 2
    }

    if (businessType) {
      whereConditions.push(`business_type = $${paramIndex}`)
      params.push(businessType)
      paramIndex++
    }

    if (businessStatus) {
      whereConditions.push(`business_status_name = $${paramIndex}`)
      params.push(businessStatus)
      paramIndex++
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

    // 전체 카운트 조회
    const countQuery = `SELECT COUNT(*) as count FROM datacollection_seoul_restaurants ${whereClause}`
    const countResult = await prisma.$queryRawUnsafe(countQuery, ...params)
    const total = Number((countResult as any)[0]?.count || 0)

    // 데이터 조회
    const dataQuery = `
      SELECT 
        management_number,
        business_name,
        business_status_name,
        business_type,
        road_address,
        lot_address,
        phone_number,
        license_date,
        created_at
      FROM datacollection_seoul_restaurants 
      ${whereClause}
      ORDER BY created_at DESC
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