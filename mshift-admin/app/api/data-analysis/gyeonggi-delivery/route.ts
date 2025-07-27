import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'overview'

    switch (type) {
      case 'overview':
        // 전체 통계
        const totalRecords = await prisma.$queryRaw`
          SELECT COUNT(*) as total_count FROM datacollection_gyeonggi_delivery
        ` as [{ total_count: bigint }]

        const batchStats = await prisma.$queryRaw`
          SELECT 
            COUNT(DISTINCT collection_batch_id) as batch_count,
            MIN(created_at) as first_collection,
            MAX(created_at) as last_collection
          FROM datacollection_gyeonggi_delivery
        ` as [{ batch_count: bigint, first_collection: Date, last_collection: Date }]

        return NextResponse.json({
          success: true,
          data: {
            totalRecords: Number(totalRecords[0].total_count),
            batchCount: Number(batchStats[0].batch_count),
            firstCollection: batchStats[0].first_collection,
            lastCollection: batchStats[0].last_collection
          }
        })

      case 'industry':
        // 업종별 분석
        const industryStats = await prisma.$queryRaw`
          SELECT 
            industry_type,
            COUNT(*) as count
          FROM datacollection_gyeonggi_delivery
          WHERE industry_type IS NOT NULL AND industry_type != ''
          GROUP BY industry_type
          ORDER BY count DESC
          LIMIT 20
        ` as Array<{ industry_type: string, count: bigint }>

        return NextResponse.json({
          success: true,
          data: industryStats.map(item => ({
            industry: item.industry_type,
            count: Number(item.count)
          }))
        })

      case 'region':
        // 지역별 분석
        const regionStats = await prisma.$queryRaw`
          SELECT 
            sigun_name,
            COUNT(*) as count
          FROM datacollection_gyeonggi_delivery
          WHERE sigun_name IS NOT NULL AND sigun_name != ''
          GROUP BY sigun_name
          ORDER BY count DESC
        ` as Array<{ sigun_name: string, count: bigint }>

        return NextResponse.json({
          success: true,
          data: regionStats.map(item => ({
            region: item.sigun_name,
            count: Number(item.count)
          }))
        })

      case 'timeline':
        // 시간대별 수집 트렌드
        const timelineStats = await prisma.$queryRaw`
          SELECT 
            DATE(created_at) as collection_date,
            COUNT(*) as count
          FROM datacollection_gyeonggi_delivery
          GROUP BY DATE(created_at)
          ORDER BY collection_date DESC
          LIMIT 30
        ` as Array<{ collection_date: Date, count: bigint }>

        return NextResponse.json({
          success: true,
          data: timelineStats.map(item => ({
            date: item.collection_date,
            count: Number(item.count)
          })).reverse()
        })

      case 'details':
        // 상세 데이터 (페이징)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '50')
        const offset = (page - 1) * limit

        const searchTerm = searchParams.get('search') || ''
        const industryFilter = searchParams.get('industry') || ''
        const regionFilter = searchParams.get('region') || ''

        const whereConditions = []
        const queryParams = []

        if (searchTerm) {
          whereConditions.push(`(store_name ILIKE $${queryParams.length + 1} OR business_reg_no ILIKE $${queryParams.length + 1})`)
          queryParams.push(`%${searchTerm}%`)
        }

        if (industryFilter) {
          whereConditions.push(`industry_type = $${queryParams.length + 1}`)
          queryParams.push(industryFilter)
        }

        if (regionFilter) {
          whereConditions.push(`sigun_name = $${queryParams.length + 1}`)
          queryParams.push(regionFilter)
        }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

        const detailsQuery = `
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
          LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
        `

        queryParams.push(limit, offset)

        const details = await prisma.$queryRawUnsafe(detailsQuery, ...queryParams) as Array<{
          business_reg_no: string,
          store_name: string,
          sigun_name: string,
          industry_type: string,
          refined_road_address: string,
          refined_zipcode: string,
          created_at: Date
        }>

        // 총 개수 조회
        const countQuery = `
          SELECT COUNT(*) as total
          FROM datacollection_gyeonggi_delivery
          ${whereClause}
        `

        const countParams = queryParams.slice(0, -2) // limit, offset 제외

        const totalCount = await prisma.$queryRawUnsafe(countQuery, ...countParams) as [{ total: bigint }]

        return NextResponse.json({
          success: true,
          data: {
            items: details,
            pagination: {
              page,
              limit,
              total: Number(totalCount[0].total),
              pages: Math.ceil(Number(totalCount[0].total) / limit)
            }
          }
        })

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid type parameter'
        }, { status: 400 })
    }
  } catch (error) {
    console.error('❌ [API] 데이터 분석 오류:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
} 