'use client';

import { useEffect, useRef, useState } from 'react';

import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Database,
  Download,
  ExternalLink,
  FastForward,
  FileText,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  Search,
  Square,
  Terminal,
  Trash2,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

import { DataCollectionStatus } from './data-collection-status';

interface DeliveryStoreData {
  지역: string;
  상호명: string;
  사업자등록번호: string;
  업종: string;
  경도: string;
  소재지지번주소: string;
  위도: string;
  소재지도로명주소: string;
}

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

interface ApiError {
  code: string;
  message: string;
  type: 'ERROR' | 'INFO';
  timestamp: Date;
}

// API 에러 코드 매핑
const ERROR_CODES: Record<string, string> = {
  '300': '필수 값이 누락되어 있습니다. 요청인자를 참고 하십시오.',
  '290':
    '인증키가 유효하지 않습니다. 인증키가 없는 경우, 홈페이지에서 인증키를 신청하십시오.',
  '336': '데이터요청은 한번에 최대 1,000건을 넘을 수 없습니다.',
  '333':
    '요청위치 값의 타입이 유효하지 않습니다.요청위치 값은 정수를 입력하세요.',
  '310':
    '해당하는 서비스를 찾을 수 없습니다. 요청인자 중 SERVICE를 확인하십시오.',
  '337':
    '일별 트래픽 제한을 넘은 호출입니다. 오늘은 더이상 호출할 수 없습니다.',
  '500': '서버 오류입니다. 지속적으로 발생시 홈페이지로 문의(Q&A) 바랍니다.',
  '600':
    '데이터베이스 연결 오류입니다. 지속적으로 발생시 홈페이지로 문의(Q&A) 바랍니다.',
  '601':
    'SQL 문장 오류 입니다. 지속적으로 발생시 홈페이지로 문의(Q&A) 바랍니다.',
};

const INFO_CODES: Record<string, string> = {
  '000': '정상 처리되었습니다.',
  '300': '관리자에 의해 인증키 사용이 제한되었습니다.',
  '200': '해당하는 데이터가 없습니다.',
};

export function DataCollectionContent() {
  const [activeTab, setActiveTab] = useState('collection-status');
  const [isCollecting, setIsCollecting] = useState(false);

  // 배달특급 데이터 수집 상태
  const [deliveryApiKey, setDeliveryApiKey] = useState(
    process.env.NEXT_PUBLIC_GYEONGGI_DATA_DREAM_API_KEY || ''
  );
  const [isDeliveryCollecting, setIsDeliveryCollecting] = useState(false);
  const [deliveryProgress, setDeliveryProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // 수집 재개 관련 상태
  const [resumeInfo, setResumeInfo] = useState<{
    totalRecords: number;
    estimatedPages: number;
    suggestedStartPage: number;
  } | null>(null);
  const [deliveryData, setDeliveryData] = useState<DeliveryStoreData[]>([]);
  const [collectionStats, setCollectionStats] = useState({
    collected: 0,
    errors: 0,
    duplicates: 0,
    saved: 0,
    lastUpdate: null as Date | null,
  });

  // DB 저장 대시보드 상태
  const [savingProgress, setSavingProgress] = useState('');
  const [dbStats, setDbStats] = useState({
    processing: 0,
    saved: 0,
    duplicates: 0,
    errors: 0,
    currentBatch: '',
  });
  const [apiErrors, setApiErrors] = useState<ApiError[]>([]);
  const [collectionLogs, setCollectionLogs] = useState<string[]>([]);

  // 서울시 일반음식점 데이터 상태
  const [seoulRestaurantData, setSeoulRestaurantData] = useState<
    SeoulRestaurantData[]
  >([]);
  const [isSeoulCollecting, setIsSeoulCollecting] = useState(false);
  const [seoulProgress, setSeoulProgress] = useState(0);
  const [seoulStats, setSeoulStats] = useState({
    total: 0,
    processed: 0,
    saved: 0,
    errors: 0,
    lastUpdate: null as Date | null,
  });

  // 서울 데이터 배치 처리 상태
  const [seoulProcessing, setSeoulProcessing] = useState({
    isLoading: false,
    isProcessing: false,
    currentBatch: 0,
    totalBatches: 0,
    progress: 0,
  });
  const [seoulMemory, setSeoulMemory] = useState({
    loadedRecords: 0,
    isLoaded: false,
  });
  const [seoulLogs, setSeoulLogs] = useState<string[]>([]);
  const [currentBatch, setCurrentBatch] = useState<{
    batchNumber: number;
    totalBatches: number;
    data: Array<{
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
    }>;
    isProcessing: boolean;
  }>({
    batchNumber: 0,
    totalBatches: 0,
    data: [],
    isProcessing: false,
  });

  // 로그 자동 스크롤을 위한 ref
  const logScrollRef = useRef<HTMLDivElement>(null);
  const seoulLogScrollRef = useRef<HTMLDivElement>(null);

  // 로그가 업데이트될 때마다 자동 스크롤
  useEffect(() => {
    if (logScrollRef.current) {
      logScrollRef.current.scrollTop = logScrollRef.current.scrollHeight;
    }
  }, [collectionLogs]);

  useEffect(() => {
    if (seoulLogScrollRef.current) {
      seoulLogScrollRef.current.scrollTop =
        seoulLogScrollRef.current.scrollHeight;
    }
  }, [seoulLogs]);

  // DB 점검 함수
  const checkAndSetupDatabase = async () => {
    // 테스트 toast 추가
    toast.info('DB 점검 시작', {
      description: '데이터베이스 점검을 시작합니다',
      duration: 3000,
    });

    setCollectionLogs(prev => [
      ...prev,
      `🔧 ${new Date().toLocaleTimeString()} - 데이터베이스 점검 시작...`,
    ]);

    try {
      const response = await fetch('/api/db/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await response.json();

      if (result.success) {
        setCollectionLogs(prev => [
          ...prev,
          `✅ ${new Date().toLocaleTimeString()} - DB 점검 완료`,
        ]);
        setCollectionLogs(prev => [
          ...prev,
          `📋 ${new Date().toLocaleTimeString()} - 데이터 수집 테이블 점검/생성 완료`,
        ]);

        // 점검 후 상태 확인
        await checkDatabaseStatus();
      } else {
        setCollectionLogs(prev => [
          ...prev,
          `❌ ${new Date().toLocaleTimeString()} - DB 점검 실패: ${result.message}`,
        ]);
      }
    } catch (error: any) {
      setCollectionLogs(prev => [
        ...prev,
        `💥 ${new Date().toLocaleTimeString()} - DB 점검 오류: ${error.message}`,
      ]);
    }
  };

  // DB 상태 확인 함수
  const checkDatabaseStatus = async () => {
    setCollectionLogs(prev => [
      ...prev,
      `🔍 ${new Date().toLocaleTimeString()} - DB 상태 확인 시작...`,
    ]);

    try {
      // DB 연결 및 레코드 수 확인
      const statusResponse = await fetch(
        '/api/data-collection/gyeonggi-delivery?action=status'
      );
      const statusResult = await statusResponse.json();

      if (statusResult.success) {
        const {
          totalRecords,
          recentBatches,
          lastUpdate,
          connectionStatus,
          resumeInfo,
        } = statusResult.status;
        setCollectionLogs(prev => [
          ...prev,
          `✅ ${new Date().toLocaleTimeString()} - DB 연결 상태: ${connectionStatus}`,
        ]);
        setCollectionLogs(prev => [
          ...prev,
          `📊 ${new Date().toLocaleTimeString()} - 현재 총 레코드 수: ${totalRecords.toLocaleString()}건`,
        ]);

        // 수집 재개 정보 설정
        if (resumeInfo && totalRecords > 0) {
          setResumeInfo(resumeInfo);
          setCollectionLogs(prev => [
            ...prev,
            `🔄 ${new Date().toLocaleTimeString()} - 수집 재개 가능: 페이지 ${resumeInfo.suggestedStartPage}부터 시작 권장`,
          ]);
        }
      } else {
        setCollectionLogs(prev => [
          ...prev,
          `❌ ${new Date().toLocaleTimeString()} - DB 상태 확인 실패: ${statusResult.message}`,
        ]);
      }

      // 중복 방지 시스템 확인
      if (statusResult.success && statusResult.status.totalRecords > 0) {
        setCollectionLogs(prev => [
          ...prev,
          `✅ ${new Date().toLocaleTimeString()} - 중복 방지 시스템 정상 작동`,
        ]);
      }

      setCollectionLogs(prev => [
        ...prev,
        `✅ ${new Date().toLocaleTimeString()} - DB 상태 확인 완료`,
      ]);
    } catch (error: any) {
      setCollectionLogs(prev => [
        ...prev,
        `💥 ${new Date().toLocaleTimeString()} - DB 상태 확인 오류: ${error.message}`,
      ]);
    }
  };

  // 수집 재개 함수
  const resumeDeliveryCollection = async () => {
    if (!deliveryApiKey.trim()) {
      toast.error('API 키를 입력해주세요', {
        description: '경기데이터드림 API 키가 필요합니다',
        duration: 4000,
      });
      return;
    }

    if (!resumeInfo) {
      toast.warning('수집 재개 정보가 없습니다', {
        description:
          "먼저 'DB 상태 확인'을 클릭하여 수집 재개 정보를 확인해주세요",
        duration: 5000,
      });
      return;
    }

    // 예쁜 확인 대화상자
    const toastId = toast.info('수집 재개 확인', {
      description: `현재 DB에 ${resumeInfo.totalRecords.toLocaleString()}건이 저장되어 있습니다. 페이지 ${resumeInfo.suggestedStartPage}부터 수집을 재개하시겠습니까?`,
      duration: Infinity,
      action: {
        label: '재개',
        onClick: () => {
          toast.dismiss(toastId);
          startDeliveryCollectionInternal(resumeInfo.suggestedStartPage);
        },
      },
      cancel: {
        label: '취소',
        onClick: () => {
          toast.dismiss(toastId);
        },
      },
    });

    return; // 비동기 처리로 변경
  };

  // 배달특급 데이터 수집 함수 (DB 저장 포함)
  const startDeliveryCollection = async () => {
    if (!deliveryApiKey.trim()) {
      toast.error('API 키를 입력해주세요', {
        description: '경기데이터드림 API 키가 필요합니다',
        duration: 4000,
      });
      return;
    }

    await startDeliveryCollectionInternal(1);
  };

  // 실제 수집 로직 (내부 함수)
  const startDeliveryCollectionInternal = async (startPageIndex = 1) => {
    setIsDeliveryCollecting(true);
    setDeliveryProgress(0);
    setCurrentPage(0);
    setDeliveryData([]);
    setApiErrors([]);
    setCollectionLogs([]);

    const pageSize = 1000;
    let currentPageIndex = startPageIndex;
    let hasMoreData = true;
    let totalCollected = 0;
    let totalSaved = 0;
    let totalDuplicates = 0;
    let totalErrors = 0;
    let consecutiveDuplicates = 0; // 연속 중복 카운터
    let consecutiveErrors = 0; // 연속 오류 카운터
    const batchId = `batch_${Date.now()}`;

    // 수집 시작 로그
    const startTime = new Date();
    const resumeText =
      startPageIndex > 1 ? ` (페이지 ${startPageIndex}부터 재개)` : '';
    setCollectionLogs(prev => [
      ...prev,
      `🚀 ${startTime.toLocaleTimeString()} - 데이터 수집 시작${resumeText} (배치 ID: ${batchId})`,
    ]);

    // 수집 시작 전 DB 상태 확인
    try {
      const statusResponse = await fetch(
        '/api/data-collection/gyeonggi-delivery?action=status'
      );
      const statusResult = await statusResponse.json();

      if (statusResult.success) {
        const { totalRecords } = statusResult.status;
        setCollectionLogs(prev => [
          ...prev,
          `📊 ${new Date().toLocaleTimeString()} - 수집 시작 전 DB 레코드 수: ${totalRecords.toLocaleString()}건`,
        ]);
      }
    } catch (error) {
      setCollectionLogs(prev => [
        ...prev,
        `⚠️ ${new Date().toLocaleTimeString()} - DB 상태 확인 실패, 수집 계속 진행`,
      ]);
    }

    try {
      while (hasMoreData) {
        setCurrentPage(currentPageIndex);

        const url = new URL('https://openapi.gg.go.kr/GGEXPSDLV');
        url.searchParams.append('KEY', deliveryApiKey);
        url.searchParams.append('Type', 'json');
        url.searchParams.append('pIndex', currentPageIndex.toString());
        url.searchParams.append('pSize', pageSize.toString());

        // API 호출 로그
        setCollectionLogs(prev => [
          ...prev,
          `📡 ${new Date().toLocaleTimeString()} - 페이지 ${currentPageIndex} API 호출 중...`,
        ]);

        try {
          const response = await fetch(url.toString());

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();

          // API 응답 상태 확인
          if (data.GGEXPSDLV && data.GGEXPSDLV[0] && data.GGEXPSDLV[0].head) {
            const head = data.GGEXPSDLV[0].head[0];
            const resultCode = head.RESULT?.CODE || head.result?.code;
            const resultMessage = head.RESULT?.MESSAGE || head.result?.message;

            // 에러 코드 처리
            if (resultCode && resultCode !== '000') {
              const errorType = resultCode.startsWith('ERROR')
                ? 'ERROR'
                : 'INFO';
              const code = resultCode
                .replace('ERROR-', '')
                .replace('INFO-', '');
              const message =
                ERROR_CODES[code] ||
                INFO_CODES[code] ||
                resultMessage ||
                '알 수 없는 오류';

              const apiError: ApiError = {
                code: resultCode,
                message: message,
                type: errorType as 'ERROR' | 'INFO',
                timestamp: new Date(),
              };

              setApiErrors(prev => [...prev, apiError]);
              setCollectionLogs(prev => [
                ...prev,
                `❌ ${new Date().toLocaleTimeString()} - API 오류 (${resultCode}): ${message}`,
              ]);

              // 치명적 에러인 경우 수집 중단
              if (['290', '336', '337', '500', '600', '601'].includes(code)) {
                hasMoreData = false;
                setCollectionLogs(prev => [
                  ...prev,
                  `🛑 ${new Date().toLocaleTimeString()} - 치명적 오류로 수집 중단`,
                ]);
                break;
              }

              // INFO 200 (데이터 없음)인 경우 정상적으로 종료
              if (code === '200') {
                hasMoreData = false;
                setCollectionLogs(prev => [
                  ...prev,
                  `✅ ${new Date().toLocaleTimeString()} - 모든 데이터 수집 완료 (더 이상 데이터 없음)`,
                ]);
                break;
              }
            }

            // 데이터 추출 및 DB 저장
            if (data.GGEXPSDLV[1] && data.GGEXPSDLV[1].row) {
              const pageData = data.GGEXPSDLV[1].row;
              totalCollected += pageData.length;

              // 총 페이지 수 계산 (첫 번째 응답에서)
              if (currentPageIndex === 1) {
                const totalCount = parseInt(head.list_total_count || '0');
                const calculatedTotalPages = Math.ceil(totalCount / pageSize);
                setTotalPages(calculatedTotalPages);
                setCollectionLogs(prev => [
                  ...prev,
                  `📊 ${new Date().toLocaleTimeString()} - 총 ${totalCount.toLocaleString()}건, ${calculatedTotalPages}페이지 예상`,
                ]);
              }

              setCollectionLogs(prev => [
                ...prev,
                `📥 ${new Date().toLocaleTimeString()} - 페이지 ${currentPageIndex}: ${pageData.length}건 수집, DB 저장 시작...`,
              ]);

              // 각 데이터를 DB에 저장
              let pageSaved = 0;
              let pageDuplicates = 0;
              let pageErrors = 0;
              let pageConsecutiveDuplicates = 0; // 페이지 내 연속 중복

              // 페이지 처리 시작 로그
              setCollectionLogs(prev => [
                ...prev,
                `💾 ${new Date().toLocaleTimeString()} - 페이지 ${currentPageIndex} DB 저장 시작`,
              ]);

              // DB 대시보드 초기화
              setDbStats(prev => ({
                ...prev,
                processing: pageData.length,
                currentBatch: `페이지 ${currentPageIndex}`,
              }));

              for (let i = 0; i < pageData.length; i++) {
                const item = pageData[i];
                try {
                  // 실제 API 응답 필드명 확인
                  const businessRegNo =
                    item.사업자등록번호 || item.BIZREGNO || item.bizregno || '';
                  const storeName =
                    item.상호명 || item.STR_NM || item.str_nm || '';
                  const sigunName =
                    item.지역 || item.SIGUN_NM || item.sigun_nm || '';
                  const industryType =
                    item.업종 || item.INDUTYPE_NM || item.indutype_nm || '';
                  const roadAddress =
                    item.소재지도로명주소 ||
                    item.REFINE_ROADNM_ADDR ||
                    item.refine_roadnm_addr ||
                    '';
                  const lotAddress =
                    item.소재지지번주소 ||
                    item.REFINE_LOTNO_ADDR ||
                    item.refine_lotno_addr ||
                    '';
                  const zipcode =
                    item.우편번호 ||
                    item.REFINE_ZIPNO ||
                    item.refine_zipno ||
                    '';
                  const latitude =
                    item.위도 ||
                    item.REFINE_WGS84_LAT ||
                    item.refine_wgs84_lat ||
                    null;
                  const longitude =
                    item.경도 ||
                    item.REFINE_WGS84_LOGT ||
                    item.refine_wgs84_logt ||
                    null;

                  // 점 애니메이션으로 진행상황 표시
                  const dots = '.'.repeat((i % 3) + 1);
                  setSavingProgress(
                    `저장 중${dots} (${i + 1}/${pageData.length})`
                  );

                  // 필수 필드 검증
                  if (!businessRegNo) {
                    pageErrors++;
                    totalErrors++;
                    setDbStats(prev => ({
                      ...prev,
                      errors: prev.errors + 1,
                    }));
                    continue;
                  }

                  if (!storeName) {
                    pageErrors++;
                    totalErrors++;
                    setDbStats(prev => ({
                      ...prev,
                      errors: prev.errors + 1,
                    }));
                    continue;
                  }

                  const dbData = {
                    list_total_count: head.list_total_count
                      ? parseInt(head.list_total_count)
                      : null,
                    response_code: resultCode || '000',
                    response_message: resultMessage || 'Success',
                    api_version: head.api_version || '1.0',
                    business_reg_no: businessRegNo,
                    sigun_name: sigunName,
                    store_name: storeName,
                    industry_type: industryType,
                    refined_road_address: roadAddress,
                    refined_lot_address: lotAddress,
                    refined_zipcode: zipcode,
                    refined_latitude: latitude
                      ? parseFloat(latitude.toString())
                      : null,
                    refined_longitude: longitude
                      ? parseFloat(longitude.toString())
                      : null,
                    batchId,
                  };

                  const saveResponse = await fetch(
                    '/api/data-collection/gyeonggi-delivery',
                    {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(dbData),
                    }
                  );

                  const saveResult = await saveResponse.json();

                  if (saveResult.success) {
                    pageSaved++;
                    totalSaved++;
                    consecutiveDuplicates = 0; // 성공하면 연속 중복 카운터 리셋
                    consecutiveErrors = 0; // 성공하면 연속 오류 카운터 리셋
                    setDbStats(prev => ({
                      ...prev,
                      saved: prev.saved + 1,
                    }));
                  } else if (saveResult.error === 'DUPLICATE_KEY') {
                    pageDuplicates++;
                    totalDuplicates++;
                    consecutiveDuplicates++;
                    pageConsecutiveDuplicates++;

                    setDbStats(prev => ({
                      ...prev,
                      duplicates: prev.duplicates + 1,
                    }));

                    // 중복은 로그만 표시하고 계속 진행
                    if (i < 5) {
                      // 처음 5개만 로그 표시
                      setCollectionLogs(prev => [
                        ...prev,
                        `🔄 ${new Date().toLocaleTimeString()} - 중복: ${businessRegNo} (${storeName}) [연속: ${consecutiveDuplicates}]`,
                      ]);
                    }

                    // 연속 50건 중복 체크
                    if (consecutiveDuplicates >= 50) {
                      setCollectionLogs(prev => [
                        ...prev,
                        `🎯 ${new Date().toLocaleTimeString()} - 연속 ${consecutiveDuplicates}건 중복 감지! 이미 수집된 구간으로 판단됩니다.`,
                      ]);
                      hasMoreData = false;

                      // 예쁜 완료 알림
                      setTimeout(() => {
                        toast.success('🎉 수집 완료!', {
                          description: `연속 ${consecutiveDuplicates}건의 중복 데이터가 감지되어 이미 수집된 구간으로 판단됩니다.`,
                          duration: 8000,
                          action: {
                            label: '결과 보기',
                            onClick: () => {
                              toast.info('📊 최종 결과', {
                                description: `수집: ${totalCollected}건 | 저장: ${totalSaved}건 | 중복: ${totalDuplicates}건 | 오류: ${totalErrors}건`,
                                duration: 6000,
                              });
                            },
                          },
                        });
                      }, 500);

                      break;
                    }
                  } else {
                    pageErrors++;
                    totalErrors++;
                    consecutiveErrors++;

                    setDbStats(prev => ({
                      ...prev,
                      errors: prev.errors + 1,
                    }));

                    // 권한 오류나 심각한 오류 감지 시 수집 중단
                    if (
                      saveResult.message &&
                      (saveResult.message.includes('permission denied') ||
                        saveResult.message.includes('database connection') ||
                        saveResult.message.includes('table does not exist'))
                    ) {
                      setCollectionLogs(prev => [
                        ...prev,
                        `🔒 ${new Date().toLocaleTimeString()} - 시스템 오류 감지: ${saveResult.message}`,
                      ]);
                      hasMoreData = false;
                      setCollectionLogs(prev => [
                        ...prev,
                        `🛑 ${new Date().toLocaleTimeString()} - 시스템 오류로 수집 중단`,
                      ]);
                      break;
                    }

                    // 일반 오류는 로그만 표시
                    if (i < 5) {
                      // 처음 5개만 로그 표시
                      setCollectionLogs(prev => [
                        ...prev,
                        `❌ ${new Date().toLocaleTimeString()} - 저장 실패: ${businessRegNo} / ${saveResult.message} [연속: ${consecutiveErrors}]`,
                      ]);
                    }

                    // 연속 20건 오류 체크 (중복보다는 적게)
                    if (consecutiveErrors >= 20) {
                      setCollectionLogs(prev => [
                        ...prev,
                        `⚠️ ${new Date().toLocaleTimeString()} - 연속 ${consecutiveErrors}건 오류 감지! 데이터 품질 문제로 판단됩니다.`,
                      ]);
                      hasMoreData = false;

                      // 예쁜 중단 알림
                      setTimeout(() => {
                        toast.error('⚠️ 수집 중단', {
                          description: `연속 ${consecutiveErrors}건의 오류가 감지되어 데이터 품질에 문제가 있는 것으로 판단됩니다.`,
                          duration: 10000,
                          action: {
                            label: '상세 정보',
                            onClick: () => {
                              toast.info('📊 현재까지 결과 및 권장사항', {
                                description: `수집: ${totalCollected}건 | 저장: ${totalSaved}건 | 중복: ${totalDuplicates}건 | 오류: ${totalErrors}건\n\n💡 API 키, 네트워크, DB 상태를 확인하세요.`,
                                duration: 8000,
                              });
                            },
                          },
                        });
                      }, 500);

                      break;
                    }
                  }
                } catch (saveError: any) {
                  pageErrors++;
                  totalErrors++;
                  consecutiveErrors++;

                  setDbStats(prev => ({
                    ...prev,
                    errors: prev.errors + 1,
                  }));

                  if (pageErrors < 5) {
                    // 처음 5개만 로그 표시
                    setCollectionLogs(prev => [
                      ...prev,
                      `💥 ${new Date().toLocaleTimeString()} - 저장 오류: ${saveError.message} [연속: ${consecutiveErrors}]`,
                    ]);
                  }

                  // 연속 20건 오류 체크 (catch 블록에서도)
                  if (consecutiveErrors >= 20) {
                    setCollectionLogs(prev => [
                      ...prev,
                      `⚠️ ${new Date().toLocaleTimeString()} - 연속 ${consecutiveErrors}건 시스템 오류! 수집을 중단합니다.`,
                    ]);
                    hasMoreData = false;

                    setTimeout(() => {
                      toast.error('💥 시스템 오류로 수집 중단', {
                        description: `연속 ${consecutiveErrors}건의 시스템 오류가 발생했습니다. 네트워크나 서버 문제가 있을 수 있습니다.`,
                        duration: 10000,
                        action: {
                          label: '결과 보기',
                          onClick: () => {
                            toast.info('📊 현재까지 결과', {
                              description: `수집: ${totalCollected}건 | 저장: ${totalSaved}건 | 중복: ${totalDuplicates}건 | 오류: ${totalErrors}건`,
                              duration: 6000,
                            });
                          },
                        },
                      });
                    }, 500);

                    break;
                  }
                }
              }

              // 페이지별 저장 결과 로그
              const logParts: string[] = [];
              if (pageSaved > 0) logParts.push(`💾 저장: ${pageSaved}건`);
              if (pageDuplicates > 0)
                logParts.push(`🔄 중복: ${pageDuplicates}건`);
              if (pageErrors > 0) logParts.push(`❌ 오류: ${pageErrors}건`);

              setCollectionLogs(prev => [
                ...prev,
                `✅ ${new Date().toLocaleTimeString()} - 페이지 ${currentPageIndex} 완료: ${logParts.join(', ')} (누적: ${totalCollected}건)`,
              ]);

              // 페이지 완료 후 저장 진행률 초기화
              setSavingProgress('');
              setDbStats(prev => ({
                ...prev,
                processing: 0,
                currentBatch: '',
              }));

              // 받아온 데이터가 pageSize보다 적으면 마지막 페이지
              if (pageData.length < pageSize) {
                hasMoreData = false;
              }

              // 진행률 업데이트
              const progress =
                totalPages > 0
                  ? Math.min((currentPageIndex / totalPages) * 100, 100)
                  : 0;
              setDeliveryProgress(progress);

              // 통계 업데이트
              setCollectionStats(prev => ({
                ...prev,
                collected: totalCollected,
                saved: totalSaved,
                duplicates: totalDuplicates,
                errors: totalErrors,
                lastUpdate: new Date(),
              }));

              // 2초 대기 (사용자 요청)
              setCollectionLogs(prev => [
                ...prev,
                `⏳ ${new Date().toLocaleTimeString()} - 2초 대기 중...`,
              ]);
              await new Promise(resolve => setTimeout(resolve, 2000));
            } else {
              // 데이터가 없는 경우
              hasMoreData = false;
              setCollectionLogs(prev => [
                ...prev,
                `🔍 ${new Date().toLocaleTimeString()} - 페이지 ${currentPageIndex}: 데이터 없음`,
              ]);
            }
          } else {
            // API 응답 구조가 예상과 다른 경우
            hasMoreData = false;
            setCollectionLogs(prev => [
              ...prev,
              `⚠️ ${new Date().toLocaleTimeString()} - 페이지 ${currentPageIndex}: 응답 구조 오류`,
            ]);
          }

          // 다음 페이지로
          currentPageIndex++;
        } catch (error: any) {
          totalErrors++;

          const errorMessage = `페이지 ${currentPageIndex} 오류: ${error.message}`;
          setCollectionLogs(prev => [
            ...prev,
            `❌ ${new Date().toLocaleTimeString()} - ${errorMessage}`,
          ]);

          // 연속 오류가 3번 이상이면 중단
          if (totalErrors >= 3) {
            hasMoreData = false;
            setCollectionLogs(prev => [
              ...prev,
              `🛑 ${new Date().toLocaleTimeString()} - 연속 오류로 인한 수집 중단`,
            ]);
          } else {
            // 다음 페이지 시도
            currentPageIndex++;
            await new Promise(resolve => setTimeout(resolve, 3000)); // 오류 시 3초 대기
          }
        }
      }

      // 수집 완료 로그
      const endTime = new Date();
      const duration = Math.round(
        (endTime.getTime() - startTime.getTime()) / 1000
      );

      if (consecutiveDuplicates >= 50) {
        setCollectionLogs(prev => [
          ...prev,
          `🎯 ${endTime.toLocaleTimeString()} - 중복 감지로 수집 완료!`,
        ]);
        setCollectionLogs(prev => [
          ...prev,
          `📈 최종 결과: 수집 ${totalCollected}건, 저장 ${totalSaved}건, 중복 ${totalDuplicates}건 (연속 ${consecutiveDuplicates}건), 오류 ${totalErrors}건 (${duration}초 소요)`,
        ]);
      } else if (consecutiveErrors >= 20) {
        setCollectionLogs(prev => [
          ...prev,
          `⚠️ ${endTime.toLocaleTimeString()} - 오류 감지로 수집 중단!`,
        ]);
        setCollectionLogs(prev => [
          ...prev,
          `📈 최종 결과: 수집 ${totalCollected}건, 저장 ${totalSaved}건, 중복 ${totalDuplicates}건, 오류 ${totalErrors}건 (연속 ${consecutiveErrors}건) (${duration}초 소요)`,
        ]);
      } else {
        setCollectionLogs(prev => [
          ...prev,
          `🎉 ${endTime.toLocaleTimeString()} - 수집 완료!`,
        ]);
        setCollectionLogs(prev => [
          ...prev,
          `📈 최종 결과: 수집 ${totalCollected}건, 저장 ${totalSaved}건, 중복 ${totalDuplicates}건, 오류 ${totalErrors}건 (${duration}초 소요)`,
        ]);
      }

      // 권한 문제로 저장된 데이터가 없는 경우 안내
      if (totalCollected > 0 && totalSaved === 0 && totalErrors > 0) {
        setCollectionLogs(prev => [
          ...prev,
          `⚠️ ${endTime.toLocaleTimeString()} - 데이터는 수집되었지만 저장되지 않았습니다.`,
        ]);
        setCollectionLogs(prev => [
          ...prev,
          `🔧 ${endTime.toLocaleTimeString()} - "DB 점검" 버튼으로 권한을 수정한 후 다시 시도하세요.`,
        ]);
      }

      // 수집 완료 후 DB 상태 재확인
      try {
        setCollectionLogs(prev => [
          ...prev,
          `🔄 ${new Date().toLocaleTimeString()} - 수집 완료 후 DB 상태 확인 중...`,
        ]);
        const finalStatusResponse = await fetch(
          '/api/data-collection/gyeonggi-delivery?action=status'
        );
        const finalStatusResult = await finalStatusResponse.json();

        if (finalStatusResult.success) {
          const { totalRecords } = finalStatusResult.status;
          setCollectionLogs(prev => [
            ...prev,
            `📊 ${new Date().toLocaleTimeString()} - 수집 완료 후 DB 총 레코드 수: ${totalRecords.toLocaleString()}건`,
          ]);
        }
      } catch (error) {
        setCollectionLogs(prev => [
          ...prev,
          `⚠️ ${new Date().toLocaleTimeString()} - 최종 DB 상태 확인 실패`,
        ]);
      }

      setCollectionStats(prev => ({
        ...prev,
        collected: totalCollected,
        saved: totalSaved,
        duplicates: totalDuplicates,
        errors: totalErrors,
        lastUpdate: endTime,
      }));
    } catch (error: any) {
      setCollectionLogs(prev => [
        ...prev,
        `💥 ${new Date().toLocaleTimeString()} - 전체 시스템 오류: ${error.message}`,
      ]);
    } finally {
      setIsDeliveryCollecting(false);
      setDeliveryProgress(100);
    }
  };

  const stopDeliveryCollection = () => {
    setIsDeliveryCollecting(false);
  };

  const resetDeliveryCollection = () => {
    setDeliveryData([]);
    setDeliveryProgress(0);
    setCurrentPage(0);
    setTotalPages(0);
    setApiErrors([]);
    setCollectionLogs([]);
    setCollectionStats({
      collected: 0,
      errors: 0,
      duplicates: 0,
      saved: 0,
      lastUpdate: null,
    });
    setSavingProgress('');
    setDbStats({
      processing: 0,
      saved: 0,
      duplicates: 0,
      errors: 0,
      currentBatch: '',
    });
    setResumeInfo(null);
  };

  // 서울 데이터 상태 확인
  const checkSeoulStatus = async () => {
    try {
      const response = await fetch(
        '/api/data-collection/seoul-restaurants?action=status'
      );
      const result = await response.json();

      if (result.success) {
        setSeoulStats(result.stats);
        if (result.processing) {
          setSeoulProcessing(result.processing);
        }
        if (result.memory) {
          setSeoulMemory(result.memory);
        }
        setSeoulLogs(prev => [
          ...prev,
          `📊 ${new Date().toLocaleTimeString()} - 상태 조회 완료: 메모리 ${result.memory.loadedRecords.toLocaleString()}건, DB ${result.stats.saved}건`,
        ]);
      }
    } catch (error: any) {
      setSeoulLogs(prev => [
        ...prev,
        `💥 ${new Date().toLocaleTimeString()} - 상태 조회 오류: ${error.message}`,
      ]);
    }
  };

  // 서울 데이터 로그 조회
  const fetchSeoulLogs = async () => {
    try {
      const response = await fetch(
        '/api/data-collection/seoul-restaurants?action=logs'
      );
      const result = await response.json();

      if (result.success) {
        setSeoulLogs(result.logs);
        if (result.isProcessing !== seoulProcessing.isProcessing) {
          setSeoulProcessing(prev => ({
            ...prev,
            isProcessing: result.isProcessing,
          }));
        }
        if (result.isLoading !== seoulProcessing.isLoading) {
          setSeoulProcessing(prev => ({
            ...prev,
            isLoading: result.isLoading,
          }));
        }
      }
    } catch (error: any) {
      console.error('로그 조회 오류:', error);
    }
  };

  // 현재 배치 데이터 조회
  const fetchCurrentBatch = async () => {
    try {
      const response = await fetch(
        '/api/data-collection/seoul-restaurants?action=current-batch'
      );
      const result = await response.json();

      if (result.success && result.currentBatch) {
        setCurrentBatch(result.currentBatch);
      }
    } catch (error: any) {
      console.error('현재 배치 조회 오류:', error);
    }
  };

  // CSV 파일 로드
  const loadSeoulCSV = async () => {
    setSeoulLogs([]);
    setSeoulLogs(prev => [
      ...prev,
      `🚀 ${new Date().toLocaleTimeString()} - 서울시 일반음식점 CSV 파일 로드 시작...`,
    ]);

    try {
      const response = await fetch('/api/data-collection/seoul-restaurants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'load-csv' }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        throw new Error(
          `서버가 예상하지 못한 응답을 반환했습니다: ${textResponse.substring(0, 200)}...`
        );
      }

      const result = await response.json();

      if (result.success) {
        setSeoulLogs(prev => [
          ...prev,
          `✅ ${new Date().toLocaleTimeString()} - CSV 파일 로딩이 시작되었습니다.`,
        ]);

        // 상태 폴링 시작 (로딩 중)
        const interval = setInterval(async () => {
          await checkSeoulStatus();
          await fetchSeoulLogs();

          // 로딩이 완료되면 폴링 중단
          const statusResponse = await fetch(
            '/api/data-collection/seoul-restaurants?action=status'
          );
          const statusResult = await statusResponse.json();
          if (statusResult.success && !statusResult.processing.isLoading) {
            clearInterval(interval);
            if (statusResult.memory.loadedRecords > 0) {
              setSeoulLogs(prev => [
                ...prev,
                `🎉 ${new Date().toLocaleTimeString()} - CSV 파일 로드가 완료되었습니다!`,
              ]);

              toast.success('CSV 로드 완료', {
                description: `${statusResult.memory.loadedRecords.toLocaleString()}건의 데이터가 메모리에 로드되었습니다.`,
                duration: 5000,
              });
            }
          }
        }, 2000); // 2초마다 상태 확인
      } else {
        setSeoulLogs(prev => [
          ...prev,
          `❌ ${new Date().toLocaleTimeString()} - 로드 시작 실패: ${result.message}`,
        ]);
        toast.error('로드 시작 실패', {
          description: result.message,
          duration: 5000,
        });
      }
    } catch (error: any) {
      setSeoulLogs(prev => [
        ...prev,
        `💥 ${new Date().toLocaleTimeString()} - 로드 오류: ${error.message}`,
      ]);
      toast.error('오류 발생', {
        description: error.message,
        duration: 5000,
      });
    }
  };

  // DB 저장 처리 시작
  const processSeoulToDb = async () => {
    setSeoulLogs(prev => [
      ...prev,
      `🚀 ${new Date().toLocaleTimeString()} - 메모리 데이터 DB 저장 시작...`,
    ]);

    try {
      const response = await fetch('/api/data-collection/seoul-restaurants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'process-to-db' }),
      });

      const result = await response.json();

      if (result.success) {
        setSeoulLogs(prev => [
          ...prev,
          `✅ ${new Date().toLocaleTimeString()} - DB 저장 처리가 시작되었습니다. (배치 ID: ${result.batchId})`,
        ]);

        // 상태 폴링 시작 (처리 중)
        const interval = setInterval(async () => {
          await checkSeoulStatus();
          await fetchSeoulLogs();
          await fetchCurrentBatch(); // 현재 배치 데이터도 함께 조회

          // 처리가 완료되면 폴링 중단
          const statusResponse = await fetch(
            '/api/data-collection/seoul-restaurants?action=status'
          );
          const statusResult = await statusResponse.json();
          if (statusResult.success && !statusResult.processing.isProcessing) {
            clearInterval(interval);
            setSeoulLogs(prev => [
              ...prev,
              `🎉 ${new Date().toLocaleTimeString()} - DB 저장 처리가 완료되었습니다!`,
            ]);

            toast.success('DB 저장 완료', {
              description: `서울시 일반음식점 데이터가 데이터베이스에 저장되었습니다.`,
              duration: 5000,
            });
          }
        }, 1000); // 1초마다 상태 확인 (더 빠른 업데이트)
      } else {
        setSeoulLogs(prev => [
          ...prev,
          `❌ ${new Date().toLocaleTimeString()} - DB 저장 시작 실패: ${result.message}`,
        ]);
        toast.error('DB 저장 시작 실패', {
          description: result.message,
          duration: 5000,
        });
      }
    } catch (error: any) {
      setSeoulLogs(prev => [
        ...prev,
        `💥 ${new Date().toLocaleTimeString()} - DB 저장 오류: ${error.message}`,
      ]);
      toast.error('오류 발생', {
        description: error.message,
        duration: 5000,
      });
    }
  };

  // 서울 데이터 처리 일시정지
  const pauseSeoulProcessing = async () => {
    try {
      const response = await fetch('/api/data-collection/seoul-restaurants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'pause' }),
      });

      const result = await response.json();
      if (result.success) {
        setSeoulLogs(prev => [
          ...prev,
          `⏸️ ${new Date().toLocaleTimeString()} - 처리 일시정지 요청됨`,
        ]);
        toast.info('일시정지 요청', {
          description: '현재 배치 완료 후 일시정지됩니다.',
          duration: 3000,
        });
      }
    } catch (error: any) {
      setSeoulLogs(prev => [
        ...prev,
        `💥 ${new Date().toLocaleTimeString()} - 일시정지 오류: ${error.message}`,
      ]);
    }
  };

  // 서울 데이터 처리 중단
  const stopSeoulProcessing = async () => {
    try {
      const response = await fetch('/api/data-collection/seoul-restaurants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop' }),
      });

      const result = await response.json();
      if (result.success) {
        setSeoulLogs(prev => [
          ...prev,
          `🛑 ${new Date().toLocaleTimeString()} - 처리 중단 요청됨`,
        ]);
        setSeoulProcessing(prev => ({ ...prev, isProcessing: false }));
        toast.warning('처리 중단', {
          description: '데이터 처리가 중단되었습니다.',
          duration: 3000,
        });
      }
    } catch (error: any) {
      setSeoulLogs(prev => [
        ...prev,
        `💥 ${new Date().toLocaleTimeString()} - 중단 오류: ${error.message}`,
      ]);
    }
  };

  // 메모리 초기화
  const clearSeoulMemory = async () => {
    try {
      const response = await fetch('/api/data-collection/seoul-restaurants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear-memory' }),
      });

      const result = await response.json();
      if (result.success) {
        setSeoulLogs(prev => [
          ...prev,
          `🗑️ ${new Date().toLocaleTimeString()} - 메모리가 초기화되었습니다.`,
        ]);
        setSeoulMemory({ loadedRecords: 0, isLoaded: false });
        toast.info('메모리 초기화', {
          description: '로드된 데이터가 메모리에서 제거되었습니다.',
          duration: 3000,
        });
      }
    } catch (error: any) {
      setSeoulLogs(prev => [
        ...prev,
        `💥 ${new Date().toLocaleTimeString()} - 메모리 초기화 오류: ${error.message}`,
      ]);
    }
  };

  // 서울 데이터 초기화
  const resetSeoulProcessing = () => {
    setSeoulLogs([]);
    setSeoulStats({
      total: 0,
      processed: 0,
      saved: 0,
      errors: 0,
      lastUpdate: null,
    });
    setSeoulProcessing({
      isLoading: false,
      isProcessing: false,
      currentBatch: 0,
      totalBatches: 0,
      progress: 0,
    });
    setSeoulMemory({
      loadedRecords: 0,
      isLoaded: false,
    });
    setCurrentBatch({
      batchNumber: 0,
      totalBatches: 0,
      data: [],
      isProcessing: false,
    });
  };

  // DB 삭제 후 처리 상태만 초기화 (메모리 데이터는 유지)
  const resetSeoulProcessingKeepMemory = () => {
    setSeoulProcessing({
      isLoading: false,
      isProcessing: false,
      currentBatch: 0,
      totalBatches: 0,
      progress: 0,
    });
    setCurrentBatch({
      batchNumber: 0,
      totalBatches: 0,
      data: [],
      isProcessing: false,
    });
    // stats와 memory는 유지
  };

  // 서울 DB 데이터 삭제
  const clearSeoulDB = async () => {
    if (
      !confirm(
        '⚠️ 정말로 서울시 일반음식점 DB 데이터를 모두 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.'
      )
    ) {
      return;
    }

    try {
      const response = await fetch('/api/data-collection/seoul-restaurants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'clear-db' }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('DB 삭제 완료', {
          description: result.message,
          duration: 5000,
        });

        // 처리 상태만 초기화 (메모리 데이터는 유지)
        resetSeoulProcessingKeepMemory();

        // 상태 새로고침으로 정확한 DB 카운트 가져오기
        await checkSeoulStatus();
      } else {
        throw new Error(result.error || '알 수 없는 오류가 발생했습니다');
      }
    } catch (error: any) {
      console.error('서울 DB 삭제 오류:', error);
      toast.error('DB 삭제 실패', {
        description: `오류: ${error.message}`,
        duration: 5000,
      });
    }
  };

  // 배달특급 DB 데이터 삭제
  const clearDeliveryDB = async () => {
    if (
      !confirm(
        '⚠️ 정말로 배달특급 DB 데이터를 모두 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.'
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        '/api/data-collection/gyeonggi-delivery?action=clear-db'
      );

      const result = await response.json();

      if (result.success) {
        toast.success('DB 삭제 완료', {
          description: result.message,
          duration: 5000,
        });

        // 상태 초기화
        resetDeliveryCollection();
      } else {
        throw new Error(result.error || '알 수 없는 오류가 발생했습니다');
      }
    } catch (error: any) {
      console.error('배달특급 DB 삭제 오류:', error);
      toast.error('DB 삭제 실패', {
        description: `오류: ${error.message}`,
        duration: 5000,
      });
    }
  };

  return (
    <div className='space-y-6'>
      {/* 페이지 헤더 */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>📥 데이터 수집</h1>
          <p className='mt-2 text-muted-foreground'>
            외부 소스에서 데이터를 수집하고 처리합니다.
          </p>
        </div>
        <Button
          onClick={() => setIsCollecting(!isCollecting)}
          variant={isCollecting ? 'destructive' : 'default'}
          className='flex items-center gap-2'
        >
          {isCollecting ? (
            <>
              <Clock className='h-4 w-4' />
              수집 중지
            </>
          ) : (
            <>
              <RefreshCw className='h-4 w-4' />
              전체 새로고침
            </>
          )}
        </Button>
      </div>

      {/* 메인 콘텐츠 */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className='space-y-4'
      >
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='collection-status'>
            📊 수집 현황 및 전략
          </TabsTrigger>
          <TabsTrigger value='gyeonggi-data'>🏢 경기데이터드림</TabsTrigger>
          <TabsTrigger value='seoul-restaurants'>
            🍽️ 서울시 일반음식점
          </TabsTrigger>
        </TabsList>

        {/* 수집 현황 및 전략 탭 */}
        <TabsContent value='collection-status' className='space-y-6'>
          <DataCollectionStatus />
        </TabsContent>

        {/* 경기데이터드림 탭 */}
        <TabsContent value='gyeonggi-data' className='space-y-4'>
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
            {/* 정보 카드 */}
            <Card className='lg:col-span-2'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Database className='h-5 w-5 text-blue-600' />
                  경기데이터드림 연동
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/20'>
                  <div className='flex items-start gap-3'>
                    <AlertCircle className='mt-0.5 h-5 w-5 text-blue-600' />
                    <div className='space-y-2'>
                      <h4 className='font-medium text-blue-900 dark:text-blue-100'>
                        경기데이터드림이란?
                      </h4>
                      <p className='text-sm text-blue-700 dark:text-blue-300'>
                        경기도에서 운영하는 공공데이터 플랫폼으로, 다양한 행정
                        및 통계 데이터를 제공합니다. 세무 관련 사업자 정보, 지역
                        경제 통계 등을 수집할 수 있습니다.
                      </p>
                      <div className='mt-2 flex items-center gap-2'>
                        <ExternalLink className='h-4 w-4' />
                        <a
                          href='https://data.gg.go.kr'
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-sm text-blue-600 underline hover:text-blue-800'
                        >
                          경기데이터드림 사이트 방문
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='space-y-4'>
                  <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <div>
                      <Label htmlFor='api-key'>API 키</Label>
                      <Input
                        id='api-key'
                        type='password'
                        placeholder='경기데이터드림 API 키 입력'
                        className='mt-1'
                      />
                    </div>
                    <div>
                      <Label htmlFor='dataset-id'>데이터셋 ID</Label>
                      <Input
                        id='dataset-id'
                        placeholder='수집할 데이터셋 ID'
                        className='mt-1'
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor='search-query'>검색 쿼리</Label>
                    <Textarea
                      id='search-query'
                      placeholder='데이터 검색 조건을 입력하세요 (예: 사업자등록번호, 업종, 지역 등)'
                      className='mt-1'
                      rows={3}
                    />
                  </div>

                  <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <div>
                      <Label htmlFor='start-date'>시작 날짜</Label>
                      <Input id='start-date' type='date' className='mt-1' />
                    </div>
                    <div>
                      <Label htmlFor='end-date'>종료 날짜</Label>
                      <Input id='end-date' type='date' className='mt-1' />
                    </div>
                  </div>

                  <div className='flex gap-4 pt-4'>
                    <Button
                      className='flex items-center gap-2'
                      disabled={isCollecting}
                    >
                      <Search className='h-4 w-4' />
                      데이터 검색
                    </Button>
                    <Button
                      variant='outline'
                      className='flex items-center gap-2'
                      disabled={isCollecting}
                    >
                      <Download className='h-4 w-4' />
                      데이터 수집
                    </Button>
                    <Button
                      variant='secondary'
                      className='flex items-center gap-2'
                    >
                      <FileText className='h-4 w-4' />
                      API 문서
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 상태 및 통계 */}
            <div className='space-y-4'>
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>📊 수집 현황</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-muted-foreground'>
                        API 연결 상태
                      </span>
                      <Badge
                        variant='outline'
                        className='border-yellow-300 text-yellow-600'
                      >
                        대기 중
                      </Badge>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-muted-foreground'>
                        마지막 수집
                      </span>
                      <span className='text-sm'>-</span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-muted-foreground'>
                        총 수집 건수
                      </span>
                      <span className='text-sm font-medium'>0건</span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-muted-foreground'>
                        오늘 수집
                      </span>
                      <span className='text-sm font-medium'>0건</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 배달특급 가맹점 데이터 수집 */}
          <Card className='border-purple-200 bg-purple-50/50 dark:bg-purple-950/20'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Download className='h-5 w-5 text-purple-600' />
                경기도 공공배달앱 배달특급 가맹점 데이터
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-950/20'>
                <div className='flex items-start gap-3'>
                  <AlertCircle className='mt-0.5 h-5 w-5 text-purple-600' />
                  <div className='space-y-2'>
                    <h4 className='font-medium text-purple-900 dark:text-purple-100'>
                      배달특급 가맹점 정보
                    </h4>
                    <p className='text-sm text-purple-700 dark:text-purple-300'>
                      경기도에서 운영하는 공공배달앱 '배달특급'의 가맹점 정보를
                      수집합니다. 상호명, 사업자등록번호, 업종, 위치 정보 등을
                      포함합니다.
                    </p>
                    <div className='mt-2 flex items-center gap-2'>
                      <ExternalLink className='h-4 w-4' />
                      <span className='text-sm font-medium'>
                        API: https://openapi.gg.go.kr/GGEXPSDLV
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div>
                  <Label htmlFor='delivery-api-key'>API 키</Label>
                  <Input
                    id='delivery-api-key'
                    type='password'
                    placeholder='경기데이터드림 API 키'
                    value={deliveryApiKey}
                    onChange={e => setDeliveryApiKey(e.target.value)}
                    className='mt-1'
                    disabled={isDeliveryCollecting}
                  />
                </div>
                <div className='flex items-end'>
                  <div className='flex w-full flex-wrap gap-2'>
                    <Button
                      variant='outline'
                      onClick={checkAndSetupDatabase}
                      disabled={isDeliveryCollecting}
                      className='flex items-center gap-2 border-green-200 text-green-700 hover:bg-green-50'
                    >
                      <Database className='h-4 w-4' />
                      DB 점검
                    </Button>
                    <Button
                      onClick={startDeliveryCollection}
                      disabled={isDeliveryCollecting || !deliveryApiKey.trim()}
                      className='flex items-center gap-2'
                    >
                      <Play className='h-4 w-4' />
                      수집 시작
                    </Button>

                    <Button
                      variant='destructive'
                      onClick={stopDeliveryCollection}
                      disabled={!isDeliveryCollecting}
                      className='flex items-center gap-2'
                    >
                      <Pause className='h-4 w-4' />
                      중지
                    </Button>
                    <Button
                      variant='secondary'
                      onClick={checkDatabaseStatus}
                      disabled={isDeliveryCollecting}
                      className='flex items-center gap-2'
                    >
                      <Database className='h-4 w-4' />
                      DB 상태 확인
                    </Button>
                    <Button
                      variant='outline'
                      onClick={resetDeliveryCollection}
                      disabled={isDeliveryCollecting}
                      className='flex items-center gap-2'
                    >
                      <RotateCcw className='h-4 w-4' />
                      초기화
                    </Button>
                    <Button
                      variant='destructive'
                      onClick={clearDeliveryDB}
                      disabled={isDeliveryCollecting}
                      className='flex items-center gap-2'
                    >
                      <Trash2 className='h-4 w-4' />
                      DB 데이터 삭제
                    </Button>
                  </div>
                </div>
              </div>

              {/* 수집 재개 정보 */}
              {resumeInfo &&
                resumeInfo.totalRecords > 0 &&
                !isDeliveryCollecting && (
                  <Card className='border-orange-200 bg-orange-50/50 dark:bg-orange-950/20'>
                    <CardHeader className='pb-3'>
                      <CardTitle className='flex items-center gap-2 text-sm'>
                        <FastForward className='h-4 w-4 text-orange-600' />
                        수집 재개 정보
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-2'>
                      <div className='grid grid-cols-2 gap-4 text-sm'>
                        <div className='flex justify-between'>
                          <span className='text-muted-foreground'>
                            현재 DB 레코드:
                          </span>
                          <span className='font-medium'>
                            {resumeInfo.totalRecords.toLocaleString()}건
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-muted-foreground'>
                            처리된 페이지:
                          </span>
                          <span className='font-medium'>
                            {resumeInfo.estimatedPages}개
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-muted-foreground'>
                            권장 시작 페이지:
                          </span>
                          <span className='font-medium text-orange-600'>
                            {resumeInfo.suggestedStartPage}
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-muted-foreground'>상태:</span>
                          <span className='font-medium text-orange-600'>
                            재개 가능
                          </span>
                        </div>
                      </div>
                      <div className='border-t pt-3'>
                        <Button
                          onClick={resumeDeliveryCollection}
                          disabled={
                            isDeliveryCollecting || !deliveryApiKey.trim()
                          }
                          className='flex w-full items-center justify-center gap-2'
                          variant='default'
                        >
                          <FastForward className='h-4 w-4' />
                          페이지 {resumeInfo.suggestedStartPage}부터 수집 재개
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

              {/* 진행 상황 */}
              {(isDeliveryCollecting || deliveryProgress > 0) && (
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium'>수집 진행률</span>
                    <div className='text-sm text-muted-foreground'>
                      {currentPage > 0 && totalPages > 0 && (
                        <span>
                          페이지 {currentPage} / {totalPages} (1000건/페이지)
                        </span>
                      )}
                    </div>
                  </div>
                  <Progress value={deliveryProgress} className='h-2' />
                  <div className='grid grid-cols-4 gap-4 text-center'>
                    <div className='rounded bg-blue-50 p-2 dark:bg-blue-950/20'>
                      <div className='text-lg font-bold text-blue-600'>
                        {collectionStats.collected}
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        수집 완료
                      </div>
                    </div>
                    <div className='rounded bg-green-50 p-2 dark:bg-green-950/20'>
                      <div className='text-lg font-bold text-green-600'>
                        {collectionStats.saved}
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        DB 저장
                      </div>
                    </div>
                    <div className='rounded bg-yellow-50 p-2 dark:bg-yellow-950/20'>
                      <div className='text-lg font-bold text-yellow-600'>
                        {collectionStats.duplicates}
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        중복 건수
                      </div>
                    </div>
                    <div className='rounded bg-red-50 p-2 dark:bg-red-950/20'>
                      <div className='text-lg font-bold text-red-600'>
                        {collectionStats.errors}
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        오류 건수
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* DB 저장 대시보드 */}
              {isDeliveryCollecting && savingProgress && (
                <Card className='border-green-200 bg-green-50/50 dark:bg-green-950/20'>
                  <CardHeader className='pb-3'>
                    <CardTitle className='flex items-center gap-2 text-sm'>
                      <Database className='h-4 w-4 text-green-600' />
                      DB 저장 현황
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-muted-foreground'>
                        저장 진행률
                      </span>
                      <div className='text-sm font-medium text-green-600'>
                        {savingProgress}
                      </div>
                    </div>
                    {dbStats.currentBatch && (
                      <div className='flex items-center justify-between'>
                        <span className='text-sm text-muted-foreground'>
                          현재 처리 중
                        </span>
                        <div className='text-sm font-medium'>
                          {dbStats.currentBatch}
                        </div>
                      </div>
                    )}
                    <div className='grid grid-cols-4 gap-2 text-center'>
                      <div className='rounded bg-blue-50 p-2 dark:bg-blue-950/20'>
                        <div className='text-sm font-bold text-blue-600'>
                          {dbStats.processing}
                        </div>
                        <div className='text-xs text-muted-foreground'>
                          처리 중
                        </div>
                      </div>
                      <div className='rounded bg-green-50 p-2 dark:bg-green-950/20'>
                        <div className='text-sm font-bold text-green-600'>
                          {dbStats.saved}
                        </div>
                        <div className='text-xs text-muted-foreground'>
                          저장 완료
                        </div>
                      </div>
                      <div className='rounded bg-yellow-50 p-2 dark:bg-yellow-950/20'>
                        <div className='text-sm font-bold text-yellow-600'>
                          {dbStats.duplicates}
                        </div>
                        <div className='text-xs text-muted-foreground'>
                          중복
                        </div>
                      </div>
                      <div className='rounded bg-red-50 p-2 dark:bg-red-950/20'>
                        <div className='text-sm font-bold text-red-600'>
                          {dbStats.errors}
                        </div>
                        <div className='text-xs text-muted-foreground'>
                          오류
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* API 에러 표시 */}
              {apiErrors.length > 0 && (
                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium'>API 응답 로그</span>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => setApiErrors([])}
                      className='text-xs'
                    >
                      로그 지우기
                    </Button>
                  </div>
                  <div className='max-h-40 space-y-1 overflow-y-auto'>
                    {apiErrors.map((error, index) => (
                      <div
                        key={index}
                        className={`rounded border p-2 text-xs ${
                          error.type === 'ERROR'
                            ? 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/20 dark:text-red-200'
                            : 'border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950/20 dark:text-yellow-200'
                        }`}
                      >
                        <div className='flex items-center justify-between'>
                          <span className='font-medium'>{error.code}</span>
                          <span className='text-xs opacity-70'>
                            {error.timestamp.toLocaleTimeString('ko-KR')}
                          </span>
                        </div>
                        <div className='mt-1'>{error.message}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 수집 로그 */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <FileText className='h-5 w-5' />
                  수집 로그
                </div>
                {collectionLogs.length > 0 && (
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => setCollectionLogs([])}
                    className='text-xs'
                  >
                    로그 지우기
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {collectionLogs.length === 0 ? (
                <div className='py-8 text-center text-muted-foreground'>
                  <Database className='mx-auto mb-4 h-12 w-12 opacity-50' />
                  <p>아직 수집 로그가 없습니다.</p>
                  <p className='text-sm'>
                    데이터 수집을 시작하면 진행 상황이 여기에 표시됩니다.
                  </p>
                </div>
              ) : (
                <div
                  ref={logScrollRef}
                  className='max-h-60 overflow-y-auto rounded border bg-gray-50 p-3 dark:bg-gray-900'
                >
                  <div className='space-y-1 font-mono text-xs'>
                    {collectionLogs.map((log, index) => (
                      <div
                        key={index}
                        className={`${
                          log.includes('오류') || log.includes('중단')
                            ? 'text-red-600 dark:text-red-400'
                            : log.includes('완료')
                              ? 'text-green-600 dark:text-green-400'
                              : log.includes('대기')
                                ? 'text-yellow-600 dark:text-yellow-400'
                                : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {log}
                      </div>
                    ))}
                  </div>
                  {isDeliveryCollecting && (
                    <div className='mt-2 text-center'>
                      <div className='inline-flex items-center gap-2 text-blue-600 dark:text-blue-400'>
                        <div className='h-3 w-3 animate-spin rounded-full border-b-2 border-current' />
                        <span className='text-xs'>수집 진행 중...</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 서울시 일반음식점 탭 */}
        <TabsContent value='seoul-restaurants' className='space-y-6'>
          {/* 통계 카드들 */}
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
            <Card className='border-l-4 border-l-orange-500'>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-muted-foreground'>
                      CSV 레코드 수
                    </p>
                    <p className='text-2xl font-bold text-orange-600'>
                      {seoulStats.total.toLocaleString()}
                    </p>
                    <p className='mt-1 text-xs text-muted-foreground'>
                      전체 음식점 수
                    </p>
                  </div>
                  <div className='flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-950/20'>
                    <span className='text-2xl'>🍽️</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className='border-l-4 border-l-blue-500'>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-muted-foreground'>
                      처리 완료
                    </p>
                    <p className='text-2xl font-bold text-blue-600'>
                      {seoulStats.processed.toLocaleString()}
                    </p>
                    <p className='mt-1 text-xs text-muted-foreground'>
                      처리된 레코드
                    </p>
                  </div>
                  <div className='flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950/20'>
                    <span className='text-2xl'>⚡</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className='border-l-4 border-l-green-500'>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-muted-foreground'>
                      DB 저장
                    </p>
                    <p className='text-2xl font-bold text-green-600'>
                      {seoulStats.saved.toLocaleString()}
                    </p>
                    <p className='mt-1 text-xs text-muted-foreground'>
                      저장 완료
                    </p>
                  </div>
                  <div className='flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/20'>
                    <span className='text-2xl'>💾</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className='border-l-4 border-l-red-500'>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-muted-foreground'>
                      처리 오류
                    </p>
                    <p className='text-2xl font-bold text-red-600'>
                      {seoulStats.errors.toLocaleString()}
                    </p>
                    <p className='mt-1 text-xs text-muted-foreground'>
                      오류 건수
                    </p>
                  </div>
                  <div className='flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/20'>
                    <span className='text-2xl'>❌</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 메인 콘텐츠 */}
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
            {/* CSV 파일 처리 카드 */}
            <Card className='lg:col-span-2'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <FileText className='h-5 w-5 text-orange-600' />
                  서울시 일반음식점 인허가 정보
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-950/20'>
                  <div className='flex items-start gap-3'>
                    <AlertCircle className='mt-0.5 h-5 w-5 text-orange-600' />
                    <div className='space-y-2'>
                      <h4 className='font-medium text-orange-900 dark:text-orange-100'>
                        서울시 일반음식점 인허가 정보란?
                      </h4>
                      <p className='text-sm text-orange-700 dark:text-orange-300'>
                        서울시에서 제공하는 일반음식점 인허가 정보로,
                        사업자등록번호, 업종, 주소, 영업상태 등의 세무 관련 중요
                        정보를 포함합니다.
                      </p>
                      <div className='mt-2 flex items-center gap-2'>
                        <span className='text-sm text-orange-600'>
                          📄 CSV 파일 기반
                        </span>
                        <span className='text-sm text-orange-600'>
                          • 약 20만건+ 데이터
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='space-y-4'>
                  <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <div>
                      <Label>CSV 파일 상태</Label>
                      <div className='mt-1 rounded-lg bg-muted p-3'>
                        <div className='flex items-center gap-2'>
                          <CheckCircle className='h-4 w-4 text-green-600' />
                          <span className='text-sm'>
                            서울시_일반음식점_샘플.csv
                          </span>
                        </div>
                        <div className='mt-1 text-xs text-muted-foreground'>
                          샘플 데이터 100건 (테스트용)
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label>처리 옵션</Label>
                      <div className='mt-1 rounded-lg bg-muted p-3'>
                        <div className='flex items-center gap-2'>
                          <Database className='h-4 w-4 text-blue-600' />
                          <span className='text-sm'>일괄 처리 + DB 저장</span>
                        </div>
                        <div className='mt-1 text-xs text-muted-foreground'>
                          CSV 파싱 후 데이터베이스 저장
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='space-y-4'>
                    <div className='flex items-center gap-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-900'>
                      <div className='flex items-center gap-2'>
                        <span className='text-sm font-medium'>출처:</span>
                        <span className='text-sm text-blue-600'>
                          서울 열린데이터광장
                        </span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <span className='text-sm font-medium'>데이터:</span>
                        <span className='text-sm text-green-600'>
                          서울시 일반음식점 인허가 정보
                        </span>
                      </div>
                    </div>

                    <div className='flex flex-wrap gap-2'>
                      <Button
                        className='flex items-center gap-2'
                        disabled={
                          seoulProcessing.isLoading ||
                          seoulProcessing.isProcessing
                        }
                        onClick={loadSeoulCSV}
                      >
                        {seoulProcessing.isLoading ? (
                          <>
                            <div className='h-4 w-4 animate-spin rounded-full border-b-2 border-white' />
                            원본파일 로드 중...
                          </>
                        ) : (
                          <>
                            <Upload className='h-4 w-4' />
                            원본파일 로드 (200MB)
                          </>
                        )}
                      </Button>

                      <Button
                        className='flex items-center gap-2'
                        disabled={
                          !seoulMemory.isLoaded || seoulProcessing.isProcessing
                        }
                        onClick={processSeoulToDb}
                        variant={seoulMemory.isLoaded ? 'default' : 'secondary'}
                      >
                        {seoulProcessing.isProcessing ? (
                          <>
                            <div className='h-4 w-4 animate-spin rounded-full border-b-2 border-white' />
                            DB 저장 중...
                          </>
                        ) : (
                          <>
                            <Database className='h-4 w-4' />
                            전처리 및 DB 저장
                          </>
                        )}
                      </Button>

                      {(seoulProcessing.isLoading ||
                        seoulProcessing.isProcessing) && (
                        <>
                          <Button
                            variant='outline'
                            className='flex items-center gap-2'
                            onClick={pauseSeoulProcessing}
                          >
                            <Pause className='h-4 w-4' />
                            일시정지
                          </Button>
                          <Button
                            variant='destructive'
                            className='flex items-center gap-2'
                            onClick={stopSeoulProcessing}
                          >
                            <Square className='h-4 w-4' />
                            중단
                          </Button>
                        </>
                      )}

                      <Button
                        variant='outline'
                        className='flex items-center gap-2'
                        onClick={checkSeoulStatus}
                      >
                        <RefreshCw className='h-4 w-4' />
                        상태 확인
                      </Button>

                      {seoulMemory.isLoaded && (
                        <Button
                          variant='secondary'
                          className='flex items-center gap-2'
                          onClick={clearSeoulMemory}
                        >
                          <RotateCcw className='h-4 w-4' />
                          메모리 초기화
                        </Button>
                      )}

                      <Button
                        variant='destructive'
                        className='flex items-center gap-2'
                        onClick={clearSeoulDB}
                        disabled={
                          seoulProcessing.isLoading ||
                          seoulProcessing.isProcessing
                        }
                      >
                        <Trash2 className='h-4 w-4' />
                        DB 데이터 삭제
                      </Button>

                      <Button
                        variant='ghost'
                        className='flex items-center gap-2'
                        onClick={() => {
                          setSeoulLogs(prev => [
                            ...prev,
                            `📄 ${new Date().toLocaleTimeString()} - CSV 파일: /data/서울시_일반음식점.csv (원본 200MB)`,
                          ]);
                          setSeoulLogs(prev => [
                            ...prev,
                            `📦 ${new Date().toLocaleTimeString()} - 배치 크기: 100건씩 처리`,
                          ]);
                          setSeoulLogs(prev => [
                            ...prev,
                            `📊 ${new Date().toLocaleTimeString()} - 필드: 40여개 (사업장명, 주소, 영업상태, 업종 등)`,
                          ]);
                          setSeoulLogs(prev => [
                            ...prev,
                            `⚡ ${new Date().toLocaleTimeString()} - 자동 폐업 데이터 제외, 사업자번호 하이픈 제거`,
                          ]);
                        }}
                      >
                        <FileText className='h-4 w-4' />
                        파일 정보
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 상태 및 통계 */}
            <div className='space-y-4'>
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>📊 처리 현황</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-muted-foreground'>
                        메모리 상태
                      </span>
                      <Badge
                        variant={seoulMemory.isLoaded ? 'default' : 'outline'}
                        className={
                          seoulMemory.isLoaded
                            ? 'border-green-300 text-green-600'
                            : ''
                        }
                      >
                        {seoulMemory.isLoaded
                          ? `${seoulMemory.loadedRecords.toLocaleString()}건 로드됨`
                          : '미로드'}
                      </Badge>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-muted-foreground'>
                        처리 상태
                      </span>
                      <Badge
                        variant={
                          seoulProcessing.isLoading
                            ? 'default'
                            : seoulProcessing.isProcessing
                              ? 'destructive'
                              : 'outline'
                        }
                      >
                        {seoulProcessing.isLoading
                          ? '로딩 중'
                          : seoulProcessing.isProcessing
                            ? '처리 중'
                            : '대기'}
                      </Badge>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-muted-foreground'>
                        마지막 처리
                      </span>
                      <span className='text-sm'>
                        {seoulStats.lastUpdate
                          ? seoulStats.lastUpdate.toLocaleString('ko-KR')
                          : '-'}
                      </span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-muted-foreground'>
                        총 처리 건수
                      </span>
                      <span className='text-sm font-medium'>
                        {seoulStats.processed.toLocaleString()}건
                      </span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-muted-foreground'>
                        DB 저장 건수
                      </span>
                      <span className='text-sm font-medium'>
                        {seoulStats.saved.toLocaleString()}건
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 배치 처리 진행 상황 */}
          {(seoulProcessing.isProcessing || seoulProcessing.progress > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Clock className='h-5 w-5' />
                  배치 처리 진행 상황
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium'>배치 진행률</span>
                    <span className='text-sm text-muted-foreground'>
                      {seoulProcessing.progress}%
                    </span>
                  </div>
                  <Progress value={seoulProcessing.progress} className='h-2' />

                  <div className='grid grid-cols-2 gap-4 text-center'>
                    <div className='rounded bg-blue-50 p-2 dark:bg-blue-950/20'>
                      <div className='text-lg font-bold text-blue-600'>
                        {seoulProcessing.currentBatch}
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        현재 배치
                      </div>
                    </div>
                    <div className='rounded bg-purple-50 p-2 dark:bg-purple-950/20'>
                      <div className='text-lg font-bold text-purple-600'>
                        {seoulProcessing.totalBatches}
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        총 배치
                      </div>
                    </div>
                  </div>

                  <div className='grid grid-cols-4 gap-4 text-center'>
                    <div className='rounded bg-orange-50 p-2 dark:bg-orange-950/20'>
                      <div className='text-lg font-bold text-orange-600'>
                        {seoulStats.total.toLocaleString()}
                      </div>
                      <div className='text-xs text-muted-foreground'>전체</div>
                    </div>
                    <div className='rounded bg-blue-50 p-2 dark:bg-blue-950/20'>
                      <div className='text-lg font-bold text-blue-600'>
                        {seoulStats.processed.toLocaleString()}
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        처리 완료
                      </div>
                    </div>
                    <div className='rounded bg-green-50 p-2 dark:bg-green-950/20'>
                      <div className='text-lg font-bold text-green-600'>
                        {seoulStats.saved.toLocaleString()}
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        DB 저장
                      </div>
                    </div>
                    <div className='rounded bg-red-50 p-2 dark:bg-red-950/20'>
                      <div className='text-lg font-bold text-red-600'>
                        {seoulStats.errors.toLocaleString()}
                      </div>
                      <div className='text-xs text-muted-foreground'>오류</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 현재 처리 중인 배치 실시간 그리드 */}
          {currentBatch.data.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Database className='h-5 w-5' />
                  실시간 처리 현황 - 배치 {currentBatch.batchNumber}/
                  {currentBatch.totalBatches}
                  <Badge
                    variant={
                      currentBatch.isProcessing ? 'default' : 'secondary'
                    }
                  >
                    {currentBatch.isProcessing ? '처리 중' : '완료'}
                  </Badge>
                </CardTitle>
                <p className='text-sm text-muted-foreground'>
                  현재 처리되고 있는 {currentBatch.data.length}개 레코드의 상세
                  정보
                </p>
              </CardHeader>
              <CardContent>
                <div className='rounded-lg border'>
                  <div className='max-h-96 overflow-y-auto'>
                    <Table>
                      <TableHeader className='sticky top-0 bg-background'>
                        <TableRow>
                          <TableHead className='w-16'>순번</TableHead>
                          <TableHead className='w-32'>사업자번호</TableHead>
                          <TableHead className='w-48'>사업장명</TableHead>
                          <TableHead className='w-24'>영업상태</TableHead>
                          <TableHead className='w-64'>주소</TableHead>
                          <TableHead className='w-32'>전화번호</TableHead>
                          <TableHead className='w-24'>처리상태</TableHead>
                          <TableHead>결과/오류</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentBatch.data.map((record, index) => (
                          <TableRow
                            key={index}
                            className={
                              record.status === 'processing'
                                ? 'bg-blue-50 dark:bg-blue-950/20'
                                : record.status === 'success'
                                  ? 'bg-green-50 dark:bg-green-950/20'
                                  : record.status === 'error'
                                    ? 'bg-red-50 dark:bg-red-950/20'
                                    : 'bg-yellow-50 dark:bg-yellow-950/20'
                            }
                          >
                            <TableCell className='font-medium'>
                              {record.index}
                            </TableCell>
                            <TableCell className='font-mono text-sm'>
                              <div className='space-y-1'>
                                <div className='text-xs text-muted-foreground'>
                                  원본:
                                </div>
                                <div>{record.original.관리번호}</div>
                                {record.processed.management_number && (
                                  <>
                                    <div className='text-xs text-muted-foreground'>
                                      처리:
                                    </div>
                                    <div className='font-bold text-green-600'>
                                      {record.processed.management_number}
                                    </div>
                                  </>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div
                                className='max-w-48 truncate'
                                title={record.processed.business_name}
                              >
                                {record.processed.business_name}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  record.processed.business_status === '폐업'
                                    ? 'destructive'
                                    : 'outline'
                                }
                                className='text-xs'
                              >
                                {record.processed.business_status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div
                                className='max-w-64 truncate text-xs'
                                title={record.processed.road_address}
                              >
                                {record.processed.road_address || '주소 없음'}
                              </div>
                            </TableCell>
                            <TableCell className='text-xs'>
                              {record.processed.phone_number || '-'}
                            </TableCell>
                            <TableCell>
                              <div className='flex items-center gap-2'>
                                {record.status === 'processing' && (
                                  <>
                                    <div className='h-3 w-3 animate-spin rounded-full border-b border-blue-500' />
                                    <span className='text-xs text-blue-600'>
                                      처리 중
                                    </span>
                                  </>
                                )}
                                {record.status === 'success' && (
                                  <>
                                    <CheckCircle className='h-3 w-3 text-green-600' />
                                    <span className='text-xs text-green-600'>
                                      성공
                                    </span>
                                  </>
                                )}
                                {record.status === 'error' && (
                                  <>
                                    <AlertCircle className='h-3 w-3 text-red-600' />
                                    <span className='text-xs text-red-600'>
                                      오류
                                    </span>
                                  </>
                                )}
                                {record.status === 'skipped' && (
                                  <>
                                    <FastForward className='h-3 w-3 text-yellow-600' />
                                    <span className='text-xs text-yellow-600'>
                                      제외
                                    </span>
                                  </>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {record.status === 'success' && (
                                <span className='text-xs text-green-600'>
                                  ✅ DB 저장 완료
                                </span>
                              )}
                              {record.status === 'error' && record.error && (
                                <div
                                  className='max-w-48 text-xs text-red-600'
                                  title={record.error}
                                >
                                  ❌{' '}
                                  {record.error.length > 50
                                    ? record.error.substring(0, 50) + '...'
                                    : record.error}
                                </div>
                              )}
                              {record.status === 'skipped' && record.reason && (
                                <span className='text-xs text-yellow-600'>
                                  ⏭️ {record.reason}
                                </span>
                              )}
                              {record.status === 'processing' && (
                                <span className='text-xs text-blue-600'>
                                  ⏳ 전처리 및 저장 중...
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* 배치 요약 통계 */}
                <div className='mt-4 grid grid-cols-4 gap-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-900'>
                  <div className='text-center'>
                    <div className='text-lg font-bold text-blue-600'>
                      {
                        currentBatch.data.filter(r => r.status === 'processing')
                          .length
                      }
                    </div>
                    <div className='text-xs text-muted-foreground'>처리 중</div>
                  </div>
                  <div className='text-center'>
                    <div className='text-lg font-bold text-green-600'>
                      {
                        currentBatch.data.filter(r => r.status === 'success')
                          .length
                      }
                    </div>
                    <div className='text-xs text-muted-foreground'>성공</div>
                  </div>
                  <div className='text-center'>
                    <div className='text-lg font-bold text-red-600'>
                      {
                        currentBatch.data.filter(r => r.status === 'error')
                          .length
                      }
                    </div>
                    <div className='text-xs text-muted-foreground'>오류</div>
                  </div>
                  <div className='text-center'>
                    <div className='text-lg font-bold text-yellow-600'>
                      {
                        currentBatch.data.filter(r => r.status === 'skipped')
                          .length
                      }
                    </div>
                    <div className='text-xs text-muted-foreground'>제외</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 서울 데이터 실시간 로그 */}
          {seoulLogs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Terminal className='h-5 w-5' />
                  실시간 처리 로그
                  <Badge
                    variant={
                      seoulProcessing.isProcessing ? 'default' : 'secondary'
                    }
                  >
                    {seoulProcessing.isProcessing ? '처리 중' : '대기'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  ref={seoulLogScrollRef}
                  className='h-64 space-y-1 overflow-y-auto rounded-lg bg-gray-900 p-4 font-mono text-xs text-green-400 dark:bg-gray-950'
                >
                  {seoulLogs.map((log, index) => (
                    <div key={index} className='whitespace-pre-wrap'>
                      {log}
                    </div>
                  ))}
                  {seoulProcessing.isProcessing && (
                    <div className='flex items-center gap-2 text-yellow-400'>
                      <div className='h-3 w-3 animate-spin rounded-full border-b border-yellow-400' />
                      배치 처리가 진행 중입니다...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
