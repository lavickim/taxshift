import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prisma } = await import('@/lib/db/client');
    const data = await request.json();

    // 요청 데이터 로깅
    console.log('💾 [API] 데이터 저장 요청:', {
      business_reg_no: data.business_reg_no,
      store_name: data.store_name,
      sigun_name: data.sigun_name,
      batchId: data.batchId
    });

    // 배치 ID가 없으면 생성
    const batchId = data.batchId || `batch_${Date.now()}`;

    // 필수 필드 검증
    if (!data.business_reg_no || !data.store_name) {
      console.log('❌ [API] 필수 필드 누락:', { 
        business_reg_no: data.business_reg_no, 
        store_name: data.store_name 
      });
      return NextResponse.json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: '사업자등록번호와 상호명은 필수입니다.',
        missing_fields: {
          business_reg_no: !data.business_reg_no,
          store_name: !data.store_name
        }
      }, { status: 400 });
    }

    // 데이터 저장
    const insertData = {
      list_total_count: data.list_total_count,
      response_code: data.response_code,
      response_message: data.response_message,
      api_version: data.api_version,
      business_reg_no: data.business_reg_no,
      sigun_name: data.sigun_name,
      store_name: data.store_name,
      industry_type: data.industry_type,
      refined_road_address: data.refined_road_address,
      refined_lot_address: data.refined_lot_address,
      refined_zipcode: data.refined_zipcode,
      refined_latitude: data.refined_latitude ? parseFloat(data.refined_latitude) : null,
      refined_longitude: data.refined_longitude ? parseFloat(data.refined_longitude) : null,
      collection_batch_id: batchId,
      data_source: 'gyeonggi_delivery'
    };

    console.log('💾 [API] DB 저장 시도 (Prisma):', {
      business_reg_no: insertData.business_reg_no,
      store_name: insertData.store_name,
      collection_batch_id: insertData.collection_batch_id
    });

    try {
      const result = await prisma.$executeRaw`
        INSERT INTO datacollection_gyeonggi_delivery (
          list_total_count, response_code, response_message, api_version,
          business_reg_no, sigun_name, store_name, industry_type,
          refined_road_address, refined_lot_address, refined_zipcode,
          refined_latitude, refined_longitude, collection_batch_id, data_source
        ) VALUES (
          ${insertData.list_total_count}, ${insertData.response_code}, 
          ${insertData.response_message}, ${insertData.api_version},
          ${insertData.business_reg_no}, ${insertData.sigun_name}, 
          ${insertData.store_name}, ${insertData.industry_type},
          ${insertData.refined_road_address}, ${insertData.refined_lot_address}, 
          ${insertData.refined_zipcode}, ${insertData.refined_latitude}, 
          ${insertData.refined_longitude}, ${insertData.collection_batch_id}, 
          ${insertData.data_source}
        )
      `;

      console.log('✅ [API] DB 저장 성공 (Prisma):', {
        business_reg_no: data.business_reg_no,
        store_name: data.store_name,
        affected_rows: result
      });

      return NextResponse.json({
        success: true,
        data: { 
          business_reg_no: data.business_reg_no,
          store_name: data.store_name,
          affected_rows: result
        },
        message: '데이터가 성공적으로 저장되었습니다.'
      });

    } catch (dbError: any) {
      console.log('❌ [API] DB 저장 오류 (Prisma):', {
        error_code: dbError.code,
        error_message: dbError.message,
        business_reg_no: data.business_reg_no,
        store_name: data.store_name
      });

      // 중복 키 오류 체크 (Prisma 에러 코드)
      if (dbError.code === 'P2002' || dbError.message?.includes('unique constraint')) {
        console.log('🔄 [API] 중복 키 감지 (Prisma):', data.business_reg_no);
        return NextResponse.json({
          success: false,
          error: 'DUPLICATE_KEY',
          message: `사업자등록번호 ${data.business_reg_no}가 이미 존재합니다.`,
          business_reg_no: data.business_reg_no
        }, { status: 409 });
      }

      return NextResponse.json({
        success: false,
        error: 'DATABASE_ERROR',
        message: dbError.message || 'Database insertion failed',
        details: dbError
      }, { status: 500 });
    }

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'SERVER_ERROR',
      message: error.message
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { prisma } = await import('@/lib/db/client');
    const { searchParams } = new URL(request.url);
    
    const action = searchParams.get('action');
    
    // DB 데이터 삭제 요청
    if (action === 'clear-db') {
      try {
        const deleteResult = await prisma.$executeRaw`
          DELETE FROM datacollection_gyeonggi_delivery
        `;
        
        return NextResponse.json({
          success: true,
          message: `배달특급 DB 데이터가 성공적으로 삭제되었습니다 (${deleteResult}건)`,
          deletedCount: deleteResult
        });
      } catch (error: any) {
        return NextResponse.json({
          success: false,
          error: `DB 데이터 삭제 중 오류가 발생했습니다: ${error.message}`
        }, { status: 500 });
      }
    }

    // DB 상태 확인 요청
    if (action === 'status') {
      try {
        // 총 레코드 수 조회
        const totalCount = await prisma.$queryRaw<[{count: bigint}]>`
          SELECT COUNT(*) as count FROM datacollection_gyeonggi_delivery
        `;
        
        // 최근 배치 정보 조회
        const recentBatches = await prisma.$queryRaw<Array<{
          collection_batch_id: string;
          created_at: Date;
          record_count: bigint;
        }>>`
          SELECT 
            collection_batch_id, 
            MIN(created_at) as created_at,
            COUNT(*) as record_count
          FROM datacollection_gyeonggi_delivery 
          GROUP BY collection_batch_id 
          ORDER BY MIN(created_at) DESC 
          LIMIT 5
        `;

        // 수집 재개를 위한 추가 정보
        const lastBatchInfo = await prisma.$queryRaw<Array<{
          collection_batch_id: string;
          max_created_at: Date;
          record_count: bigint;
        }>>`
          SELECT 
            collection_batch_id,
            MAX(created_at) as max_created_at,
            COUNT(*) as record_count
          FROM datacollection_gyeonggi_delivery 
          GROUP BY collection_batch_id 
          ORDER BY MAX(created_at) DESC 
          LIMIT 1
        `;

        return NextResponse.json({
          success: true,
          status: {
            totalRecords: Number(totalCount[0]?.count || 0),
            recentBatches: recentBatches.length,
            lastUpdate: recentBatches[0]?.created_at || null,
            connectionStatus: 'connected',
            lastBatch: lastBatchInfo[0] ? {
              batchId: lastBatchInfo[0].collection_batch_id,
              recordCount: Number(lastBatchInfo[0].record_count),
              lastUpdated: lastBatchInfo[0].max_created_at
            } : null,
            // 수집 재개를 위한 정보
            resumeInfo: {
              totalRecords: Number(totalCount[0]?.count || 0),
              estimatedPages: Math.ceil(Number(totalCount[0]?.count || 0) / 1000),
              suggestedStartPage: Math.max(1, Math.ceil(Number(totalCount[0]?.count || 0) / 1000) - 1) // 마지막 페이지 이전부터 시작 (오버랩)
            }
          }
        });
      } catch (dbError: any) {
        return NextResponse.json({
          success: false,
          error: 'DATABASE_ERROR',
          message: dbError.message
        }, { status: 500 });
      }
    }

    // 데이터 조회 요청 (기본)
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const batchId = searchParams.get('batchId');
    
    try {
      let whereClause = '';
      let params: any[] = [];
      
      if (batchId) {
        whereClause = 'WHERE collection_batch_id = $1';
        params.push(batchId);
      }
      
      // 데이터 조회
      const data = await prisma.$queryRawUnsafe(`
        SELECT * FROM datacollection_gyeonggi_delivery 
        ${whereClause}
        ORDER BY created_at DESC 
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `, ...params, limit, (page - 1) * limit);
      
      // 총 개수 조회
      const countResult = await prisma.$queryRawUnsafe<[{count: bigint}]>(`
        SELECT COUNT(*) as count FROM datacollection_gyeonggi_delivery ${whereClause}
      `, ...params);
      
      const total = Number(countResult[0]?.count || 0);

      return NextResponse.json({
        success: true,
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (dbError: any) {
      return NextResponse.json({
        success: false,
        error: 'DATABASE_ERROR',
        message: dbError.message
      }, { status: 500 });
    }

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'SERVER_ERROR',
      message: error.message
    }, { status: 500 });
  }
} 