/**
 * 정규식 규칙 엑셀 익스포트 API
 * GET /api/regex-preprocessing/export - 모든 규칙을 Excel 형태로 익스포트
 */

import { NextRequest, NextResponse } from 'next/server';
import { RegexRuleManagementService } from '@/lib/services/regex-preprocessing.service';
import * as XLSX from 'xlsx';

const ruleService = RegexRuleManagementService.getInstance();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const includeInactive = searchParams.get('includeInactive') === 'true';
    
    // 규칙 데이터 조회
    const rules = await ruleService.getAllRules();
    
    // 필터링
    const filteredRules = rules.filter(rule => {
      if (category && rule.category !== category) return false;
      if (!includeInactive && !rule.isActive) return false;
      return true;
    });
    
    // Excel 데이터 포맷팅
    const excelData = filteredRules.map(rule => ({
      'ID': rule.id,
      '규칙명': rule.ruleName,
      '설명': rule.description || '',
      '카테고리': rule.category,
      '입력 패턴': rule.inputPattern,
      '출력 템플릿': rule.outputTemplate,
      '우선순위': rule.priority,
      '활성 상태': rule.isActive ? '활성' : '비활성',
      '메타데이터': rule.metadataTags ? JSON.stringify(rule.metadataTags) : '',
      '테스트 케이스': rule.testCases ? JSON.stringify(rule.testCases) : '',
      '사용 횟수': rule.usageCount.toString(),
      '성공률': rule.successRate ? `${rule.successRate}%` : '',
      '생성일': rule.createdAt.toISOString().split('T')[0],
      '수정일': rule.updatedAt.toISOString().split('T')[0]
    }));
    
    // 워크북 생성
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // 컬럼 너비 조정
    const columnWidths = [
      { wch: 8 },   // ID
      { wch: 25 },  // 규칙명
      { wch: 40 },  // 설명
      { wch: 15 },  // 카테고리
      { wch: 50 },  // 입력 패턴
      { wch: 30 },  // 출력 템플릿
      { wch: 10 },  // 우선순위
      { wch: 10 },  // 활성 상태
      { wch: 30 },  // 메타데이터
      { wch: 40 },  // 테스트 케이스
      { wch: 10 },  // 사용 횟수
      { wch: 10 },  // 성공률
      { wch: 12 },  // 생성일
      { wch: 12 }   // 수정일
    ];
    worksheet['!cols'] = columnWidths;
    
    XLSX.utils.book_append_sheet(workbook, worksheet, '정규식 규칙');
    
    // 통계 시트 추가
    const stats = {
      '총 규칙 수': filteredRules.length,
      '활성 규칙 수': filteredRules.filter(r => r.isActive).length,
      '비활성 규칙 수': filteredRules.filter(r => !r.isActive).length,
      '카테고리별 분포': {}
    };
    
    // 카테고리별 통계
    const categoryStats: Record<string, number> = {};
    filteredRules.forEach(rule => {
      categoryStats[rule.category] = (categoryStats[rule.category] || 0) + 1;
    });
    
    const statsData = [
      { '항목': '총 규칙 수', '값': stats['총 규칙 수'] },
      { '항목': '활성 규칙 수', '값': stats['활성 규칙 수'] },
      { '항목': '비활성 규칙 수', '값': stats['비활성 규칙 수'] },
      { '항목': '', '값': '' }, // 구분선
      ...Object.entries(categoryStats).map(([category, count]) => ({
        '항목': `${category} 카테고리`,
        '값': count
      }))
    ];
    
    const statsWorksheet = XLSX.utils.json_to_sheet(statsData);
    XLSX.utils.book_append_sheet(workbook, statsWorksheet, '통계');
    
    // Excel 파일 생성
    const excelBuffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx',
      compression: true
    });
    
    // 파일명 생성
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `regex-preprocessing-rules-${timestamp}.xlsx`;
    
    // Response 헤더 설정
    const headers = new Headers();
    headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    headers.set('Content-Disposition', `attachment; filename="${filename}"`);
    headers.set('Cache-Control', 'no-cache');
    
    return new NextResponse(excelBuffer, {
      status: 200,
      headers
    });
    
  } catch (error) {
    console.error('Excel export failed:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Export failed' 
      },
      { status: 500 }
    );
  }
}