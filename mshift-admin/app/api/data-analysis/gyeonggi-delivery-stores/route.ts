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
      case 'region':
        return await getRegionData()
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
      lastCollection
    ] = await Promise.all([
      prisma.$queryRaw`SELECT COUNT(*) as count FROM datacollection_gyeonggi_delivery`,
      prisma.$queryRaw`SELECT COUNT(DISTINCT collection_batch_id) as count FROM datacollection_gyeonggi_delivery WHERE collection_batch_id IS NOT NULL`,
      prisma.$queryRaw`SELECT MIN(created_at) as date FROM datacollection_gyeonggi_delivery`,
      prisma.$queryRaw`SELECT MAX(created_at) as date FROM datacollection_gyeonggi_delivery`
    ])

    const data = {
      totalRecords: Number((totalRecords as any)[0]?.count || 0),
      batchCount: Number((batchCount as any)[0]?.count || 0),
      firstCollection: (firstCollection as any)[0]?.date || new Date().toISOString(),
      lastCollection: (lastCollection as any)[0]?.date || new Date().toISOString()
    }

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
        industry_type as industry,
        COUNT(*) as count
      FROM datacollection_gyeonggi_delivery 
      WHERE industry_type IS NOT NULL AND industry_type != ''
      GROUP BY industry_type 
      ORDER BY count DESC
      LIMIT 20
    `

    return Response.json({ 
      success: true, 
      data: (data as any[]).map(row => ({
        industry: row.industry,
        count: Number(row.count)
      }))
    })
  } catch (error) {
    console.error('업종별 데이터 조회 오류:', error)
    throw error
  }
}

async function getRegionData() {
  try {
    const data = await prisma.$queryRaw`
      SELECT 
        sigun_name as region,
        COUNT(*) as count
      FROM datacollection_gyeonggi_delivery 
      WHERE sigun_name IS NOT NULL AND sigun_name != ''
      GROUP BY sigun_name 
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

async function getTimelineData() {
  try {
    const data = await prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM datacollection_gyeonggi_delivery 
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
    const industry = searchParams.get('industry') || ''
    const region = searchParams.get('region') || ''

    const offset = (page - 1) * limit

    // 필터 조건 구성
    let whereConditions = []
    let params: any[] = []
    let paramIndex = 1

    if (search) {
      whereConditions.push(`(store_name ILIKE $${paramIndex} OR business_reg_no ILIKE $${paramIndex + 1})`)
      params.push(`%${search}%`, `%${search}%`)
      paramIndex += 2
    }

    if (industry) {
      whereConditions.push(`industry_type = $${paramIndex}`)
      params.push(industry)
      paramIndex++
    }

    if (region) {
      whereConditions.push(`sigun_name = $${paramIndex}`)
      params.push(region)
      paramIndex++
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

    // 전체 카운트 조회
    const countQuery = `SELECT COUNT(*) as count FROM datacollection_gyeonggi_delivery ${whereClause}`
    const countResult = await prisma.$queryRawUnsafe(countQuery, ...params)
    const total = Number((countResult as any)[0]?.count || 0)

    // 데이터 조회
    const dataQuery = `
      SELECT 
        business_reg_no,
        store_name,
        sigun_name,
        industry_type,
        refined_road_address,
        refined_zipcode,
        created_at
      FROM datacollection_gyeonggi_delivery 
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