import { NextRequest, NextResponse } from 'next/server';

// PostgreSQL 직접 연결 (로컬용)
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.LOCAL_POSTGRES_URL || process.env.DATABASE_URL,
});

interface RuleEngineData {
  id?: number;
  keyword: string;
  confidence: number;
  tags: string;
  primary_tag?: string;
  primary_account?: string;
  secondary_tag?: string;
  secondary_account?: string;
  usage_count?: number;
  positive_count?: number;
  negative_count?: number;
  last_used?: Date;
  is_active?: boolean;
  created_by?: string;
  created_at?: Date;
  updated_at?: Date;
}

// GET: 룰 목록 조회
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const isActive = searchParams.get('is_active');

    // 쿼리 구성
    let whereClause = 'WHERE 1=1';
    let queryParams: any[] = [];
    let paramIndex = 1;

    if (search) {
      whereClause += ` AND (keyword ILIKE $${paramIndex} OR tags ILIKE $${paramIndex} OR primary_account ILIKE $${paramIndex} OR secondary_account ILIKE $${paramIndex})`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    if (isActive !== null && isActive !== undefined) {
      whereClause += ` AND is_active = $${paramIndex}`;
      queryParams.push(isActive === 'true');
      paramIndex++;
    }

    // 총 개수 조회
    const countQuery = `SELECT COUNT(*) as total FROM rule_engine ${whereClause}`;
    const countResult = await pool.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);

    // 페이징된 룰 목록 조회
    const offset = (page - 1) * limit;
    const rulesQuery = `
      SELECT *,
        CASE 
          WHEN usage_count > 0 THEN ROUND((positive_count::numeric / usage_count::numeric) * 100, 2)
          ELSE 0
        END as success_rate
      FROM rule_engine
      ${whereClause}
      ORDER BY confidence DESC, usage_count DESC, created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    queryParams.push(limit, offset);

    const rulesResult = await pool.query(rulesQuery, queryParams);

    return NextResponse.json({
      success: true,
      data: {
        rules: rulesResult.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('룰 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '룰 조회 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

// POST: 새 룰 생성
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      keyword,
      confidence = 10,
      tags = '',
      primary_tag = tags.split(',')[0]?.trim() || '',
      primary_account = '',
      secondary_tag = '',
      secondary_account = '보통예금',
      is_active = true,
      created_by = 'ADMIN'
    }: RuleEngineData = body;

    if (!keyword) {
      return NextResponse.json(
        { success: false, error: "키워드는 필수입니다" },
        { status: 400 }
      );
    }

    // 중복 체크
    const duplicateCheck = await pool.query(
      'SELECT id FROM rule_engine WHERE keyword = $1',
      [keyword]
    );

    if (duplicateCheck.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: "이미 존재하는 키워드입니다" },
        { status: 409 }
      );
    }

    // 새 룰 생성
    const insertQuery = `
      INSERT INTO rule_engine (
        keyword, confidence, tags, primary_tag, primary_account,
        secondary_tag, secondary_account, is_active, created_by,
        usage_count, positive_count, negative_count
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 0, 0, 0)
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [
      keyword, confidence, tags, primary_tag, primary_account,
      secondary_tag, secondary_account, is_active, created_by
    ]);

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: '룰이 성공적으로 생성되었습니다'
    }, { status: 201 });

  } catch (error) {
    console.error('룰 생성 오류:', error);
    return NextResponse.json(
      { success: false, error: '룰 생성 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

// PUT: 룰 수정
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updateData }: RuleEngineData & { id: number } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "룰 ID가 필요합니다" },
        { status: 400 }
      );
    }

    // 기존 룰 확인
    const existingRule = await pool.query(
      'SELECT * FROM rule_engine WHERE id = $1',
      [id]
    );

    if (existingRule.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "룰을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // 업데이트할 필드 구성
    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    // 수정 가능한 필드들
    const allowedFields = [
      'keyword', 'confidence', 'tags', 'primary_tag', 'primary_account',
      'secondary_tag', 'secondary_account', 'is_active'
    ];

    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id' && allowedFields.includes(key)) {
        updateFields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    if (updateFields.length === 0) {
      return NextResponse.json(
        { success: false, error: "업데이트할 데이터가 없습니다" },
        { status: 400 }
      );
    }

    updateFields.push(`updated_at = NOW()`);
    values.push(id);

    const updateQuery = `
      UPDATE rule_engine 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(updateQuery, values);

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: '룰이 성공적으로 수정되었습니다'
    });

  } catch (error) {
    console.error('룰 수정 오류:', error);
    return NextResponse.json(
      { success: false, error: '룰 수정 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

// DELETE: 룰 삭제
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ruleId = searchParams.get('id');
    const deleteAll = searchParams.get('delete_all') === 'true';

    if (deleteAll) {
      // 전체 삭제
      const result = await pool.query('DELETE FROM rule_engine');

      return NextResponse.json({
        success: true,
        message: `${result.rowCount}개의 룰이 삭제되었습니다`,
        deletedCount: result.rowCount
      });

    } else if (ruleId) {
      // 개별 삭제
      const result = await pool.query(
        'DELETE FROM rule_engine WHERE id = $1 RETURNING *',
        [ruleId]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: "룰을 찾을 수 없습니다" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: '룰이 성공적으로 삭제되었습니다',
        deletedRule: result.rows[0]
      });

    } else {
      return NextResponse.json(
        { success: false, error: "삭제할 룰 ID 또는 전체 삭제 옵션이 필요합니다" },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('룰 삭제 오류:', error);
    return NextResponse.json(
      { success: false, error: '룰 삭제 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
} 