/**
 * 정규식 규칙 엑셀 임포트 API
 * POST /api/regex-preprocessing/import - Excel 파일에서 규칙 데이터 임포트
 */
import { NextRequest, NextResponse } from 'next/server';

import * as XLSX from 'xlsx';

import { RegexRuleManagementService } from '@/lib/services/regex-preprocessing.service';

const ruleService = RegexRuleManagementService.getInstance();

interface ImportValidationError {
  row: number;
  field: string;
  message: string;
}

interface ImportResult {
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: ImportValidationError[];
  importedRules: any[];
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // 파일 타입 검증
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid file type. Only Excel files are supported.',
        },
        { status: 400 }
      );
    }

    // 파일 크기 검증 (10MB 제한)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File size too large. Maximum 10MB allowed.' },
        { status: 400 }
      );
    }

    // Excel 파일 파싱
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'buffer' });

    // 첫 번째 시트 데이터 읽기
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (rawData.length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: 'Excel file must contain header row and at least one data row',
        },
        { status: 400 }
      );
    }

    // 헤더 확인 및 매핑
    const headers = rawData[0] as string[];

    const requiredFields = ['규칙명', '카테고리', '입력 패턴', '출력 템플릿'];
    const missingFields = requiredFields.filter(
      field => !headers.includes(field)
    );

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Missing required columns: ${missingFields.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // 데이터 변환 및 검증
    const result: ImportResult = {
      totalRows: rawData.length - 1,
      successCount: 0,
      errorCount: 0,
      errors: [],
      importedRules: [],
    };

    const dataRows = rawData.slice(1) as any[][];

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const rowNumber = i + 2; // Excel row number (1-based + header)

      try {
        // 필수 필드 검증
        const ruleName = getCellValue(row, headers, '규칙명');
        const category = getCellValue(row, headers, '카테고리');
        const inputPattern = getCellValue(row, headers, '입력 패턴');
        const outputTemplate = getCellValue(row, headers, '출력 템플릿');

        if (!ruleName) {
          result.errors.push({
            row: rowNumber,
            field: '규칙명',
            message: '규칙명은 필수입니다',
          });
          continue;
        }

        if (!category) {
          result.errors.push({
            row: rowNumber,
            field: '카테고리',
            message: '카테고리는 필수입니다',
          });
          continue;
        }

        if (!inputPattern) {
          result.errors.push({
            row: rowNumber,
            field: '입력 패턴',
            message: '입력 패턴은 필수입니다',
          });
          continue;
        }

        if (!outputTemplate) {
          result.errors.push({
            row: rowNumber,
            field: '출력 템플릿',
            message: '출력 템플릿은 필수입니다',
          });
          continue;
        }

        // 정규식 패턴 유효성 검증
        try {
          new RegExp(inputPattern);
        } catch (regexError) {
          result.errors.push({
            row: rowNumber,
            field: '입력 패턴',
            message: '유효하지 않은 정규식 패턴입니다',
          });
          continue;
        }

        // 선택적 필드들
        const description = getCellValue(row, headers, '설명') || '';
        const priority =
          parseInt(getCellValue(row, headers, '우선순위')) || 100;
        const isActive = getCellValue(row, headers, '활성 상태') !== '비활성';

        // 메타데이터 파싱
        let metadataTags = null;
        const metadataStr = getCellValue(row, headers, '메타데이터');
        if (metadataStr) {
          try {
            metadataTags = JSON.parse(metadataStr);
          } catch {
            result.errors.push({
              row: rowNumber,
              field: '메타데이터',
              message: '메타데이터는 유효한 JSON 형식이어야 합니다',
            });
            continue;
          }
        }

        // 테스트 케이스 파싱
        let testCases = null;
        const testCasesStr = getCellValue(row, headers, '테스트 케이스');
        if (testCasesStr) {
          try {
            testCases = JSON.parse(testCasesStr);
          } catch {
            result.errors.push({
              row: rowNumber,
              field: '테스트 케이스',
              message: '테스트 케이스는 유효한 JSON 형식이어야 합니다',
            });
            continue;
          }
        }

        // 규칙 생성
        const newRule = await ruleService.createRule({
          ruleName,
          description,
          category,
          inputPattern,
          outputTemplate,
          priority,
          isActive,
          metadataTags,
          testCases,
        });

        result.importedRules.push(newRule);
        result.successCount++;
      } catch (error) {
        result.errors.push({
          row: rowNumber,
          field: 'general',
          message: error instanceof Error ? error.message : '알 수 없는 오류',
        });
        result.errorCount++;
      }
    }

    result.errorCount = result.errors.length;

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Excel import failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Import failed',
      },
      { status: 500 }
    );
  }
}

function getCellValue(
  row: any[],
  headers: string[],
  fieldName: string
): string {
  const index = headers.indexOf(fieldName);
  if (index === -1) return '';
  const value = row[index];
  return value !== undefined && value !== null ? String(value).trim() : '';
}
