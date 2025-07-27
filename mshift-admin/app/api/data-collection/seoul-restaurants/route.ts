import { NextRequest, NextResponse } from 'next/server';

import csv from 'csv-parser';
import fs from 'fs';
import iconv from 'iconv-lite';
import path from 'path';

interface SeoulRestaurantData {
  개방자치단체코드: string;
  관리번호: string;
  인허가일자: string;
  인허가취소일자: string;
  영업상태코드: string;
  영업상태명: string;
  상세영업상태코드: string;
  상세영업상태명: string;
  폐업일자: string;
  휴업시작일자: string;
  휴업종료일자: string;
  재개업일자: string;
  전화번호: string;
  소재지면적: string;
  소재지우편번호: string;
  지번주소: string;
  도로명주소: string;
  도로명우편번호: string;
  사업장명: string;
  최종수정일자: string;
  데이터갱신구분: string;
  데이터갱신일자: string;
  업태구분명: string;
  좌표정보X: string;
  좌표정보Y: string;
  위생업태명: string;
  남성종사자수: string;
  여성종사자수: string;
  영업장주변구분명: string;
  등급구분명: string;
  급수시설구분명: string;
  총인원: string;
  본사종업원수: string;
  공장사무직종업원수: string;
  공장판매직종업원수: string;
  공장생산직종업원수: string;
  건물소유구분명: string;
  보증액: string;
  월세액: string;
  다중이용업소여부: string;
  시설총규모: string;
  전통업소지정번호: string;
  전통업소주된음식: string;
  홈페이지: string;
}

// 메모리에 로드된 데이터와 처리 상태
let memoryData: SeoulRestaurantData[] = [];
let processingStatus = {
  isLoading: false,
  isProcessing: false,
  totalRecords: 0,
  loadedRecords: 0,
  processedRecords: 0,
  savedRecords: 0,
  errorRecords: 0,
  skippedRecords: 0,
  currentBatch: 0,
  totalBatches: 0,
  batchId: '',
  logs: [] as string[],
  startTime: null as Date | null,
  pauseRequested: false,
};

// 현재 처리 중인 배치 데이터 (실시간 그리드 표시용)
let currentBatchData: Array<{
  index: number;
  original: SeoulRestaurantData;
  processed: {
    management_number: string;
    business_name: string;
    business_status: string;
    road_address: string;
    phone_number: string;
  };
  status: 'processing' | 'success' | 'error' | 'skipped';
  error?: string;
  reason?: string;
}> = [];

// 로그 추가 함수
function addLog(message: string) {
  const timestamp = new Date().toLocaleTimeString();
  const logEntry = `${timestamp} - ${message}`;
  processingStatus.logs.push(logEntry);
  console.log(logEntry);

  // 로그는 최대 100개까지만 보관
  if (processingStatus.logs.length > 100) {
    processingStatus.logs = processingStatus.logs.slice(-100);
  }
}

// 사업자번호 추출 및 정리 함수
function extractBusinessNumber(
  managementNumber: string,
  localGovCode: string
): string {
  if (!managementNumber) return '';

  // 관리번호에서 개방자치단체코드 제거
  let businessNumber = managementNumber;
  if (localGovCode && managementNumber.startsWith(localGovCode)) {
    businessNumber = managementNumber.substring(localGovCode.length);
    // 코드 뒤에 붙는 구분자(-) 제거
    if (businessNumber.startsWith('-')) {
      businessNumber = businessNumber.substring(1);
    }
  }

  // 하이픈과 공백 제거하고 숫자만 남기기
  businessNumber = businessNumber.replace(/[-\s]/g, '').replace(/[^0-9]/g, '');

  // 10자리 사업자번호만 추출 (맨 앞 10자리)
  if (businessNumber.length >= 10) {
    businessNumber = businessNumber.substring(0, 10);
  }

  return businessNumber;
}

// CSV 파일 읽기 및 메모리 로드
async function loadCSVToMemory(): Promise<SeoulRestaurantData[]> {
  // 정식 대용량 파일 경로 (198MB 파일)
  const mainFilePath = path.join(
    process.cwd(),
    'data',
    '서울시 일반음식점 인허가 정보.csv'
  );

  // 정식 파일이 있으면 사용
  if (fs.existsSync(mainFilePath)) {
    addLog(
      `📂 정식 CSV 파일 로드 시작: 서울시 일반음식점 인허가 정보.csv (198MB, CP949 인코딩)`
    );
    return readCSVFileFromPath(mainFilePath);
  }

  // 정식 파일이 없으면 이전 파일명으로 시도
  const legacyFilePath = path.join(
    process.cwd(),
    'data',
    '서울시_일반음식점.csv'
  );
  if (fs.existsSync(legacyFilePath)) {
    addLog(`📂 CSV 파일 로드 시작: ${legacyFilePath}`);
    return readCSVFileFromPath(legacyFilePath);
  }

  // 둘 다 없으면 샘플 파일 사용
  const samplePath = path.join(
    process.cwd(),
    'data',
    '서울시_일반음식점_샘플.csv'
  );
  if (fs.existsSync(samplePath)) {
    addLog(`⚠️ 원본 파일이 없어 샘플 파일 사용: ${samplePath}`);
    return readCSVFileFromPath(samplePath);
  }

  throw new Error('CSV 파일을 찾을 수 없습니다.');
}

// 지정된 경로에서 CSV 파일 읽기
async function readCSVFileFromPath(
  filePath: string
): Promise<SeoulRestaurantData[]> {
  return new Promise((resolve, reject) => {
    const results: SeoulRestaurantData[] = [];
    let rowCount = 0;

    fs.createReadStream(filePath)
      .pipe(iconv.decodeStream('cp949'))
      .pipe(csv())
      .on('data', data => {
        rowCount++;

        // 10,000건마다 진행 상황 로그
        if (rowCount % 10000 === 0) {
          addLog(`📥 CSV 읽기 진행: ${rowCount.toLocaleString()}건 로드됨`);
          processingStatus.loadedRecords = rowCount;
        }

        // 첫 5개 레코드의 데이터 구조를 로그로 확인
        if (rowCount <= 5) {
          addLog(`📝 레코드 ${rowCount} 샘플 데이터:`);
          addLog(`  - 개방자치단체코드: "${data['개방자치단체코드']}"`);
          addLog(`  - 관리번호: "${data['관리번호']}"`);
          addLog(`  - 사업장명: "${data['사업장명']}"`);
          addLog(`  - 영업상태명: "${data['영업상태명']}"`);
          addLog(`  - 컬럼 수: ${Object.keys(data).length}`);

          // 사업자번호 추출 테스트
          const testBusinessNumber = extractBusinessNumber(
            data['관리번호'] || '',
            data['개방자치단체코드'] || ''
          );
          addLog(
            `  - 추출된 사업자번호: "${testBusinessNumber}" (길이: ${testBusinessNumber.length})`
          );
        }

        // 폐업 데이터는 CSV 읽기 단계에서 바로 스킵
        const businessStatus = data['영업상태명'] || '';
        if (businessStatus === '폐업') {
          processingStatus.skippedRecords++;
          if (processingStatus.skippedRecords % 1000 === 0) {
            addLog(
              `⏭️ 폐업 데이터 스킵: ${processingStatus.skippedRecords.toLocaleString()}건 제외됨`
            );
          }
          return; // 이 레코드는 메모리에 저장하지 않음
        }

        // CSV 컬럼명을 인터페이스에 맞게 매핑 (실제 CSV 헤더에 맞춰 수정)
        const restaurant: SeoulRestaurantData = {
          개방자치단체코드: data['개방자치단체코드'] || '',
          관리번호: data['관리번호'] || '',
          인허가일자: data['인허가일자'] || '',
          인허가취소일자: data['인허가취소일자'] || '',
          영업상태코드: data['영업상태코드'] || '',
          영업상태명: businessStatus,
          상세영업상태코드: data['상세영업상태코드'] || '',
          상세영업상태명: data['상세영업상태명'] || '',
          폐업일자: data['폐업일자'] || '',
          휴업시작일자: data['휴업시작일자'] || '',
          휴업종료일자: data['휴업종료일자'] || '',
          재개업일자: data['재개업일자'] || '',
          전화번호: data['전화번호'] || '',
          소재지면적: data['소재지면적'] || '',
          소재지우편번호: data['소재지우편번호'] || '',
          지번주소: data['지번주소'] || '',
          도로명주소: data['도로명주소'] || '',
          도로명우편번호: data['도로명 우편번호'] || '', // 공백 포함된 컬럼명
          사업장명: data['사업장명'] || '',
          최종수정일자: data['최종수정일자'] || '',
          데이터갱신구분: data['데이터갱신구분'] || '',
          데이터갱신일자: data['데이터갱신일자'] || '',
          업태구분명: data['업태구분명'] || '',
          좌표정보X: data['좌표정보(X)'] || '',
          좌표정보Y: data['좌표정보(Y)'] || '',
          위생업태명: data['위생업태명'] || '',
          남성종사자수: data[' 남성종사자수'] || '', // 앞에 공백 포함
          여성종사자수: data['여성종사자수'] || '',
          영업장주변구분명: data['영업장주변구분명'] || '',
          등급구분명: data['등급구분명'] || '',
          급수시설구분명: data['급수시설구분명'] || '',
          총인원: data['총인원'] || '',
          본사종업원수: data['본사종업원수'] || '',
          공장사무직종업원수: data['공장사무직종업원수'] || '',
          공장판매직종업원수: data['공장판매직종업원수'] || '',
          공장생산직종업원수: data['공장생산직종업원수'] || '',
          건물소유구분명: data['건물소유구분명'] || '',
          보증액: data['보증액'] || '',
          월세액: data['월세액'] || '',
          다중이용업소여부: data['다중이용업소여부'] || '',
          시설총규모: data['시설총규모'] || '',
          전통업소지정번호: data['전통업소지정번호'] || '',
          전통업소주된음식: data['전통업소주된음식'] || '',
          홈페이지: data['홈페이지'] || '',
        };
        results.push(restaurant);
      })
      .on('end', () => {
        addLog(
          `✅ CSV 파일 로드 완료: 총 ${results.length.toLocaleString()}건 (폐업 ${processingStatus.skippedRecords.toLocaleString()}건 제외됨)`
        );
        processingStatus.loadedRecords = results.length;
        resolve(results);
      })
      .on('error', error => {
        addLog(`❌ CSV 파일 로드 오류: ${error.message}`);
        reject(error);
      });
  });
}

// 배치 단위로 데이터 전처리 및 DB 저장
async function processBatch(
  batch: SeoulRestaurantData[],
  batchNumber: number,
  batchId: string,
  prisma: any
) {
  let batchSaved = 0;
  let batchErrors = 0;
  const batchSkipped = 0;

  addLog(`📦 배치 ${batchNumber} 전처리 및 저장 시작 (${batch.length}건)`);

  // 현재 배치 데이터 초기화
  currentBatchData = batch.map((restaurant, index) => ({
    index: (batchNumber - 1) * 100 + index + 1,
    original: restaurant,
    processed: {
      management_number: '',
      business_name: restaurant.사업장명 || '',
      business_status: restaurant.영업상태명 || '',
      road_address: restaurant.도로명주소 || '',
      phone_number: restaurant.전화번호 || '',
    },
    status: 'processing' as const,
  }));

  for (let i = 0; i < batch.length; i++) {
    const restaurant = batch[i];

    // 일시정지 요청 확인
    if (processingStatus.pauseRequested) {
      addLog(`⏸️ 사용자 요청에 의해 처리 일시정지`);
      return {
        saved: batchSaved,
        errors: batchErrors,
        skipped: batchSkipped,
        paused: true,
      };
    }

    try {
      // 현재 레코드 상태 업데이트
      currentBatchData[i].status = 'processing';

      // 필수 데이터 확인 (더 관대하게)
      if (!restaurant.사업장명 && !restaurant.관리번호) {
        currentBatchData[i].status = 'error';
        currentBatchData[i].error =
          '필수 데이터 부족 (사업장명과 관리번호 모두 없음)';
        batchErrors++;
        if (i < 3) {
          // 처음 3개만 로그
          addLog(
            `❌ 필수 데이터 부족: 사업장명="${restaurant.사업장명}", 관리번호="${restaurant.관리번호}"`
          );
        }
        continue;
      }

      // 사업자번호 추출 (관리번호에서 개방자치단체코드 제거)
      let cleanedBusinessNumber = '';
      if (restaurant.관리번호) {
        cleanedBusinessNumber = extractBusinessNumber(
          restaurant.관리번호,
          restaurant.개방자치단체코드
        );
      }

      // 사업자번호가 없거나 유효하지 않은 경우 관리번호 원본 사용
      if (!cleanedBusinessNumber || cleanedBusinessNumber.length !== 10) {
        cleanedBusinessNumber =
          restaurant.관리번호 || `temp_${Date.now()}_${i}`;
        if (i < 3) {
          addLog(
            `⚠️ 사업자번호 추출 실패, 원본 사용: "${restaurant.관리번호}" -> "${cleanedBusinessNumber}"`
          );
        }
      }

      // 처리된 데이터 업데이트
      currentBatchData[i].processed.management_number = cleanedBusinessNumber;

      // 날짜 파싱 함수
      const parseDate = (dateStr: string) => {
        if (!dateStr || dateStr.trim() === '') return null;
        try {
          const date = new Date(dateStr);
          return isNaN(date.getTime()) ? null : date;
        } catch {
          return null;
        }
      };

      // 숫자 파싱 함수 (좌표 데이터 오버플로우 방지)
      const parseNumber = (numStr: string) => {
        if (!numStr || numStr.trim() === '') return null;
        const num = parseFloat(numStr);
        if (isNaN(num)) return null;

        // 좌표 데이터의 경우 범위 제한 (정수 5자리 이하)
        if (Math.abs(num) >= 100000) {
          return null; // 범위 초과 시 null 반환
        }
        return num;
      };

      // 정수 파싱 함수
      const parseInteger = (numStr: string) => {
        if (!numStr || numStr.trim() === '') return null;
        const num = parseInt(numStr);
        return isNaN(num) ? null : num;
      };

      // DB 저장 (개방자치단체코드 제외) - 스키마에 맞는 컬럼명 사용
      await prisma.$executeRaw`
        INSERT INTO datacollection_seoul_restaurants (
          management_number, license_date, license_cancel_date, business_status_code, business_status_name,
          detailed_status_code, detailed_status_name, closure_date, suspension_start_date,
          suspension_end_date, reopening_date, phone_number, site_area, postal_code,
          lot_address, road_address, road_postal_code, business_name, last_modified_date,
          data_update_type, data_update_date, business_type, coordinate_x, coordinate_y,
          hygiene_business_type, male_employee_count, female_employee_count, surrounding_area_type,
          grade_type, water_supply_type, total_employees, headquarters_employees,
          factory_office_employees, factory_sales_employees, factory_production_employees,
          building_ownership_type, deposit_amount, monthly_rent, multi_use_facility_yn,
          total_facility_size, traditional_business_number, traditional_main_food,
          homepage, collection_batch_id
        ) VALUES (
          ${cleanedBusinessNumber}, ${parseDate(restaurant.인허가일자)}, ${parseDate(restaurant.인허가취소일자)},
          ${restaurant.영업상태코드}, ${restaurant.영업상태명}, ${restaurant.상세영업상태코드}, ${restaurant.상세영업상태명},
          ${parseDate(restaurant.폐업일자)}, ${parseDate(restaurant.휴업시작일자)}, ${parseDate(restaurant.휴업종료일자)},
          ${parseDate(restaurant.재개업일자)}, ${restaurant.전화번호}, ${restaurant.소재지면적},
          ${restaurant.소재지우편번호}, ${restaurant.지번주소}, ${restaurant.도로명주소}, ${restaurant.도로명우편번호},
          ${restaurant.사업장명}, ${parseDate(restaurant.최종수정일자)}, ${restaurant.데이터갱신구분}, ${parseDate(restaurant.데이터갱신일자)},
          ${restaurant.업태구분명}, ${parseNumber(restaurant.좌표정보X)}, ${parseNumber(restaurant.좌표정보Y)}, ${restaurant.위생업태명},
          ${parseInteger(restaurant.남성종사자수)}, ${parseInteger(restaurant.여성종사자수)}, ${restaurant.영업장주변구분명},
          ${restaurant.등급구분명}, ${restaurant.급수시설구분명}, ${parseInteger(restaurant.총인원)}, ${parseInteger(restaurant.본사종업원수)},
          ${parseInteger(restaurant.공장사무직종업원수)}, ${parseInteger(restaurant.공장판매직종업원수)}, ${parseInteger(restaurant.공장생산직종업원수)},
          ${restaurant.건물소유구분명}, ${parseNumber(restaurant.보증액)}, ${parseNumber(restaurant.월세액)}, ${restaurant.다중이용업소여부},
          ${parseNumber(restaurant.시설총규모)}, ${restaurant.전통업소지정번호}, ${restaurant.전통업소주된음식},
          ${restaurant.홈페이지}, ${batchId}
        )
      
      `;
      // ON CONFLICT (management_number)
      // DO UPDATE SET
      //   business_status_name = EXCLUDED.business_status_name,
      //   business_name = EXCLUDED.business_name,
      //   road_address = EXCLUDED.road_address,
      //   phone_number = EXCLUDED.phone_number,
      //   updated_at = NOW()
      // 성공 상태 업데이트
      currentBatchData[i].status = 'success';
      batchSaved++;

      // 첫 3건은 성공 로그 표시
      if (i < 3) {
        addLog(
          `✅ 저장 완료: ${restaurant.사업장명} (${cleanedBusinessNumber})`
        );
        addLog(
          `  📍 좌표: X=${restaurant.좌표정보X}, Y=${restaurant.좌표정보Y}`
        );
        addLog(`  📋 영업상태: ${restaurant.영업상태명}`);
      }
    } catch (error: any) {
      // 에러 상태 업데이트
      currentBatchData[i].status = 'error';
      currentBatchData[i].error = error.message;
      batchErrors++;
      if (i < 5) {
        // 처음 5개 오류만 자세히 로그
        addLog(`💥 저장 오류: ${restaurant.사업장명}`);
        addLog(`  ❌ 에러: ${error.message}`);
        addLog(
          `  📝 관리번호: "${restaurant.관리번호}" -> "${cleanedBusinessNumber}"`
        );
        addLog(
          `  📍 좌표: X="${restaurant.좌표정보X}", Y="${restaurant.좌표정보Y}"`
        );
        if (error.message.includes('numeric field overflow')) {
          const x = parseNumber(restaurant.좌표정보X);
          const y = parseNumber(restaurant.좌표정보Y);
          addLog(`  🔢 파싱된 좌표: X=${x}, Y=${y}`);
        }
      }
    }

    // 진행률 업데이트
    processingStatus.processedRecords++;
  }

  addLog(
    `✅ 배치 ${batchNumber} 완료: 저장 ${batchSaved}건, 제외 ${batchSkipped}건, 오류 ${batchErrors}건`
  );

  return {
    saved: batchSaved,
    errors: batchErrors,
    skipped: batchSkipped,
    paused: false,
  };
}

// GET: 상태 조회
export async function GET(request: NextRequest) {
  try {
    const { prisma } = await import('@/lib/db/client');
    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    if (action === 'status') {
      // 실제 DB에서 저장된 레코드 수 조회
      const totalCount = await prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) as count FROM datacollection_seoul_restaurants
      `;

      const saved = Number(totalCount[0]?.count || 0);

      return NextResponse.json({
        success: true,
        stats: {
          total: processingStatus.totalRecords || memoryData.length,
          processed: processingStatus.processedRecords,
          saved: saved, // DB에서 실제 조회
          errors: processingStatus.errorRecords,
          lastUpdate: saved > 0 ? new Date() : null,
        },
        memory: {
          loadedRecords: memoryData.length,
          isLoaded: memoryData.length > 0,
        },
        processing: {
          isLoading: processingStatus.isLoading,
          isProcessing: processingStatus.isProcessing,
          currentBatch: processingStatus.currentBatch,
          totalBatches: processingStatus.totalBatches,
          progress:
            processingStatus.totalRecords > 0
              ? Math.round(
                  (processingStatus.processedRecords /
                    processingStatus.totalRecords) *
                    100
                )
              : 0,
        },
      });
    }

    if (action === 'logs') {
      // 최근 로그 반환
      return NextResponse.json({
        success: true,
        logs: processingStatus.logs.slice(-50), // 최근 50개 로그
        isLoading: processingStatus.isLoading,
        isProcessing: processingStatus.isProcessing,
      });
    }

    if (action === 'current-batch') {
      // 현재 처리 중인 배치 데이터 반환
      return NextResponse.json({
        success: true,
        currentBatch: {
          batchNumber: processingStatus.currentBatch,
          totalBatches: processingStatus.totalBatches,
          data: currentBatchData,
          isProcessing: processingStatus.isProcessing,
        },
      });
    }

    return NextResponse.json({
      success: false,
      message: '잘못된 action 파라미터입니다.',
    });
  } catch (error: any) {
    console.error('Seoul restaurants API GET error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// POST: CSV 파일 로드 및 DB 처리
export async function POST(request: NextRequest) {
  try {
    const { prisma } = await import('@/lib/db/client');
    const body = await request.json();
    const { action } = body;

    if (action === 'load-csv') {
      // 이미 로딩 중인 경우 거부
      if (processingStatus.isLoading) {
        return NextResponse.json({
          success: false,
          message: '이미 파일 로딩이 진행 중입니다.',
        });
      }

      // 로딩 상태 초기화
      processingStatus.isLoading = true;
      processingStatus.logs = [];
      processingStatus.loadedRecords = 0;
      processingStatus.skippedRecords = 0;
      processingStatus.startTime = new Date();

      addLog(`🚀 서울시 일반음식점 CSV 파일 로드 시작`);
      addLog(`📊 데이터 출처: 서울 열린데이터광장`);
      addLog(`📋 데이터명: 서울시 일반음식점 인허가 정보`);

      // 동기적으로 CSV 로딩 완료 대기
      await loadCSVInBackground();

      return NextResponse.json({
        success: true,
        message: 'CSV 파일 로딩이 완료되었습니다.',
        loadedRecords: memoryData.length,
        skippedRecords: processingStatus.skippedRecords,
      });
    }

    if (action === 'process-to-db') {
      // 메모리에 데이터가 없으면 거부
      if (memoryData.length === 0) {
        return NextResponse.json({
          success: false,
          message: '먼저 CSV 파일을 로드해주세요.',
        });
      }

      // 이미 처리 중인 경우 거부
      if (processingStatus.isProcessing) {
        return NextResponse.json({
          success: false,
          message: '이미 DB 처리가 진행 중입니다.',
        });
      }

      // 처리 상태 초기화
      processingStatus.isProcessing = true;
      processingStatus.processedRecords = 0;
      processingStatus.savedRecords = 0;
      processingStatus.errorRecords = 0;
      processingStatus.skippedRecords = 0;
      processingStatus.currentBatch = 0;
      processingStatus.totalBatches = 0;
      processingStatus.batchId = `seoul_batch_${Date.now()}`;
      processingStatus.totalRecords = memoryData.length;
      processingStatus.pauseRequested = false;

      addLog(
        `🚀 메모리 데이터 DB 저장 시작 (${memoryData.length.toLocaleString()}건)`
      );
      addLog(`📦 배치 크기: 100건씩 처리`);

      // 백그라운드에서 처리 시작
      processMemoryDataToDb();

      return NextResponse.json({
        success: true,
        message: 'DB 저장 처리가 시작되었습니다.',
        batchId: processingStatus.batchId,
      });
    }

    if (action === 'pause') {
      processingStatus.pauseRequested = true;
      addLog(`⏸️ DB 저장 일시정지 요청됨`);

      return NextResponse.json({
        success: true,
        message: '처리 일시정지가 요청되었습니다.',
      });
    }

    if (action === 'stop') {
      processingStatus.isLoading = false;
      processingStatus.isProcessing = false;
      processingStatus.pauseRequested = true;
      addLog(`🛑 처리 중단 요청됨`);

      return NextResponse.json({
        success: true,
        message: '처리가 중단되었습니다.',
      });
    }

    if (action === 'clear-memory') {
      memoryData = [];
      processingStatus = {
        isLoading: false,
        isProcessing: false,
        totalRecords: 0,
        loadedRecords: 0,
        processedRecords: 0,
        savedRecords: 0,
        errorRecords: 0,
        skippedRecords: 0,
        currentBatch: 0,
        totalBatches: 0,
        batchId: '',
        logs: [],
        startTime: null,
        pauseRequested: false,
      };

      return NextResponse.json({
        success: true,
        message: '메모리가 초기화되었습니다.',
      });
    }

    if (action === 'clear-db') {
      // DB 데이터 모두 삭제
      try {
        addLog(`🗑️ 서울시 일반음식점 DB 데이터 삭제 시작...`);

        const deleteResult = await prisma.$executeRaw`
          DELETE FROM datacollection_seoul_restaurants
        `;

        addLog(`✅ 서울시 일반음식점 DB 데이터 삭제 완료: ${deleteResult}건`);

        return NextResponse.json({
          success: true,
          message: `DB 데이터가 성공적으로 삭제되었습니다 (${deleteResult}건)`,
          deletedCount: deleteResult,
        });
      } catch (error: any) {
        addLog(`❌ DB 데이터 삭제 오류: ${error.message}`);
        return NextResponse.json(
          {
            success: false,
            error: `DB 데이터 삭제 중 오류가 발생했습니다: ${error.message}`,
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: false,
      message: '잘못된 action입니다.',
    });
  } catch (error: any) {
    console.error('Seoul restaurants API POST error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// 백그라운드에서 CSV 로딩
async function loadCSVInBackground() {
  try {
    addLog(`📂 CSV 파일 읽기 시작...`);
    memoryData = await loadCSVToMemory();
    processingStatus.totalRecords = memoryData.length;

    const endTime = new Date();
    const duration = Math.round(
      (endTime.getTime() - (processingStatus.startTime?.getTime() || 0)) / 1000
    );

    addLog(`🎉 CSV 파일 로드 완료!`);
    addLog(`📊 총 ${memoryData.length.toLocaleString()}건이 메모리에 로드됨`);
    if (processingStatus.skippedRecords > 0) {
      addLog(
        `⏭️ 폐업 데이터 ${processingStatus.skippedRecords.toLocaleString()}건 제외됨`
      );
    }
    addLog(`⏱️ 소요시간: ${duration}초`);
    addLog(`💾 메모리 사용량: 약 ${Math.round(memoryData.length * 0.002)}MB`);
  } catch (error: any) {
    console.error('CSV 로딩 에러:', error);
    addLog(`💥 CSV 로드 중 오류 발생: ${error.message}`);

    // 에러가 발생해도 빈 배열로 설정하여 시스템이 계속 동작하도록 함
    memoryData = [];
    processingStatus.totalRecords = 0;
  } finally {
    processingStatus.isLoading = false;
  }
}

// 백그라운드에서 메모리 데이터 DB 처리
async function processMemoryDataToDb() {
  try {
    const { prisma } = await import('@/lib/db/client');

    // 배치 크기 설정 (100건씩 처리)
    const BATCH_SIZE = 100;
    const batches = [];

    // 데이터를 배치로 나누기
    for (let i = 0; i < memoryData.length; i += BATCH_SIZE) {
      batches.push(memoryData.slice(i, i + BATCH_SIZE));
    }

    processingStatus.totalBatches = batches.length;
    addLog(
      `📦 총 ${batches.length}개의 배치로 나누어 처리 (배치당 ${BATCH_SIZE}건)`
    );

    let totalSaved = 0;
    let totalErrors = 0;
    let totalSkipped = 0;

    // 각 배치 처리
    for (let i = 0; i < batches.length; i++) {
      if (processingStatus.pauseRequested) {
        addLog(`⏸️ 사용자 요청에 의해 처리 중단`);
        break;
      }

      processingStatus.currentBatch = i + 1;

      const result = await processBatch(
        batches[i],
        i + 1,
        processingStatus.batchId,
        prisma
      );

      if (result.paused) {
        break;
      }

      totalSaved += result.saved;
      totalErrors += result.errors;
      totalSkipped += result.skipped;

      processingStatus.savedRecords = totalSaved;
      processingStatus.errorRecords = totalErrors;
      processingStatus.skippedRecords = totalSkipped;

      // 배치 간 대기 (1초)
      addLog(`⏳ 다음 배치 처리를 위해 1초 대기...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // 처리 완료
    const endTime = new Date();
    const duration = Math.round(
      (endTime.getTime() - (processingStatus.startTime?.getTime() || 0)) / 1000
    );

    addLog(`🎉 DB 저장 처리 완료!`);
    addLog(
      `📊 최종 결과: 처리 ${processingStatus.processedRecords.toLocaleString()}건`
    );
    addLog(`💾 저장: ${totalSaved.toLocaleString()}건`);
    addLog(`⏭️ 제외: ${totalSkipped.toLocaleString()}건 (폐업)`);
    addLog(`❌ 오류: ${totalErrors.toLocaleString()}건`);
    addLog(`⏱️ 소요시간: ${duration}초`);
  } catch (error: any) {
    addLog(`💥 DB 저장 중 오류 발생: ${error.message}`);
  } finally {
    processingStatus.isProcessing = false;
  }
}
