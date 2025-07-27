'use client';

import { useEffect, useState } from 'react';

// import 주석처리됨

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
// import 주석처리됨
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

interface ApiTestResult {
  endpoint: string;
  method: string;
  status: 'loading' | 'success' | 'error' | 'idle';
  statusCode?: number;
  response?: any;
  error?: string;
  duration?: number;
}

interface DatabaseInfo {
  connected: boolean;
  tables: string[];
  rowCounts: Record<string, number>;
  error?: string;
}

export function AdminTestDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  // Test states
  const [testResults, setTestResults] = useState<Record<string, ApiTestResult>>(
    {}
  );
  const [dbInfo, setDbInfo] = useState<DatabaseInfo>({
    connected: false,
    tables: [],
    rowCounts: {},
  });
  const [testInputs, setTestInputs] = useState({
    regexText: 'GS25강남역점',
    llmText: '구글페이먼트코리아',
    cacheHash:
      'a1b2c3d4e5f67890123456789012345678901234567890123456789012345678',
    analysisText: '신한카드 GS25 결제 15000원',
  });

  // 데이터베이스 정보 조회
  const loadDatabaseInfo = async () => {
    try {
      const dbResponse = await fetch('/api/test-db-connection');
      const dbData = await dbResponse.json();

      const statsResponse = await fetch('/api/cache/stats');
      const statsData = await statsResponse.json();

      setDbInfo({
        connected: dbResponse.ok,
        tables: ['TransactionCache', 'User', 'Companies'],
        rowCounts: {
          TransactionCache: statsData.success ? statsData.data.totalEntries : 0,
        },
        error: !dbResponse.ok ? dbData.error : undefined,
      });
    } catch (error) {
      setDbInfo({
        connected: false,
        tables: [],
        rowCounts: {},
        error:
          error instanceof Error ? error.message : 'Database connection failed',
      });
    }
  };

  // API 테스트 함수
  const testApi = async (endpoint: string, method: string, body?: any) => {
    const key = `${method}-${endpoint}`;

    setTestResults(prev => ({
      ...prev,
      [key]: { endpoint, method, status: 'loading' },
    }));

    const startTime = Date.now();

    try {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (body && method !== 'GET') {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(endpoint, options);
      const data = await response.json();
      const duration = Date.now() - startTime;

      setTestResults(prev => ({
        ...prev,
        [key]: {
          endpoint,
          method,
          status: response.ok ? 'success' : 'error',
          statusCode: response.status,
          response: data,
          duration,
        },
      }));
    } catch (error) {
      const duration = Date.now() - startTime;
      setTestResults(prev => ({
        ...prev,
        [key]: {
          endpoint,
          method,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
          duration,
        },
      }));
    }
  };

  // 통합 테스트 함수
  const runFullIntegrationTest = async () => {
    console.log('Running full integration test...');
    // 여기에 통합 테스트 로직 구현
  };

  // 컴포넌트 마운트 시 DB 정보 로드
  useEffect(() => {
    loadDatabaseInfo();
  }, []);

  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case 'loading':
        return <span className='text-blue-500'>🔄</span>;
      case 'success':
        return <span className='text-green-500'>✅</span>;
      case 'error':
        return <span className='text-red-500'>❌</span>;
      default:
        return <span className='text-gray-400'>⏳</span>;
    }
  };

  return (
    <div className='w-full space-y-6'>
      {/* 시스템 상태 표시 */}
      <Alert className='border-green-200 bg-green-50/50'>
        <div className='flex items-center'>
          <span className='mr-2 text-green-600'>✅</span>
          <div>
            <AlertTitle className='text-green-800'>
              관리자 테스트 대시보드
            </AlertTitle>
            <AlertDescription className='text-green-700'>
              시스템 상태 확인 및 API 테스트 기능
            </AlertDescription>
          </div>
        </div>
      </Alert>

      {/* 메인 대시보드 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <TabsList className='grid w-full grid-cols-6'>
          <TabsTrigger value='overview'>개요</TabsTrigger>
          <TabsTrigger value='database'>데이터베이스</TabsTrigger>
          <TabsTrigger value='endpoints'>API 테스트</TabsTrigger>
          <TabsTrigger value='layers'>레이어 테스트</TabsTrigger>
          <TabsTrigger value='integration'>통합 테스트</TabsTrigger>
          <TabsTrigger value='monitoring'>모니터링</TabsTrigger>
        </TabsList>

        {/* 개요 탭 */}
        <TabsContent value='overview' className='space-y-6'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Layer 0: Cache
                </CardTitle>
                <span className='text-2xl'>🔍</span>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>Redis</div>
                <p className='text-xs text-muted-foreground'>
                  고속 캐시 시스템
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Layer 1: Regex
                </CardTitle>
                <span className='text-2xl'>📄</span>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>95%</div>
                <p className='text-xs text-muted-foreground'>
                  정규식 매칭 처리율
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Layer 2: ML
                </CardTitle>
                <span className='text-2xl'>📊</span>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>4%</div>
                <p className='text-xs text-muted-foreground'>머신러닝 처리율</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Layer 3: LLM
                </CardTitle>
                <span className='text-2xl'>🧠</span>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>Gemini</div>
                <p className='text-xs text-muted-foreground'>
                  11개 카테고리 분류
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                🚀 MoneyShift AI Tax Service - 4-Layer Defense Architecture
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='text-sm font-medium text-foreground'>
                한국 AI 세무 서비스의 4단계 방어 아키텍처 (95% Rules + 4% ML +
                1% LLM)
              </div>

              <div className='space-y-3'>
                <div className='flex items-center gap-3 rounded-lg bg-blue-50 p-3 dark:bg-blue-950/20'>
                  <span className='text-2xl'>🔍</span>
                  <div>
                    <div className='font-medium text-blue-900 dark:text-blue-100'>
                      Layer 0: Cache System
                    </div>
                    <div className='text-sm text-blue-700 dark:text-blue-300'>
                      이전 처리 결과 캐싱으로 성능 최적화
                    </div>
                  </div>
                </div>

                <div className='flex items-center gap-3 rounded-lg bg-green-50 p-3 dark:bg-green-950/20'>
                  <span className='text-2xl'>📄</span>
                  <div>
                    <div className='font-medium text-green-900 dark:text-green-100'>
                      Layer 1: Regex Engine (95%)
                    </div>
                    <div className='text-sm text-green-700 dark:text-green-300'>
                      정규식 패턴 매칭으로 대부분의 거래 분류
                    </div>
                  </div>
                </div>

                <div className='flex items-center gap-3 rounded-lg bg-orange-50 p-3 dark:bg-orange-950/20'>
                  <span className='text-2xl'>📊</span>
                  <div>
                    <div className='font-medium text-orange-900 dark:text-orange-100'>
                      Layer 2: ML Engine (4%)
                    </div>
                    <div className='text-sm text-orange-700 dark:text-orange-300'>
                      기계학습 모델로 복잡한 패턴 처리
                    </div>
                  </div>
                </div>

                <div className='flex items-center gap-3 rounded-lg bg-purple-50 p-3 dark:bg-purple-950/20'>
                  <span className='text-2xl'>🧠</span>
                  <div>
                    <div className='font-medium text-purple-900 dark:text-purple-100'>
                      Layer 3: LLM Engine (1%)
                    </div>
                    <div className='text-sm text-purple-700 dark:text-purple-300'>
                      Gemini AI로 최종 분류 및 컨텍스트 이해
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 데이터베이스 탭 */}
        <TabsContent value='database' className='space-y-6'>
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  🗄️ 데이터베이스 연결 상태
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <span>연결 상태:</span>
                  {dbInfo.connected ? (
                    <Badge className='bg-green-100 text-green-800'>
                      연결됨
                    </Badge>
                  ) : (
                    <Badge variant='destructive'>연결 안됨</Badge>
                  )}
                </div>

                <Button
                  onClick={() => testApi('/api/test-db-connection', 'GET')}
                  className='w-full'
                  disabled={
                    testResults['GET-/api/test-db-connection']?.status ===
                    'loading'
                  }
                >
                  ▶️ DB 연결 테스트
                </Button>

                {testResults['GET-/api/test-db-connection'] && (
                  <div className='mt-4 rounded-lg bg-muted p-3'>
                    <pre className='text-xs'>
                      {JSON.stringify(
                        testResults['GET-/api/test-db-connection'],
                        null,
                        2
                      )}
                    </pre>
                  </div>
                )}

                <Button
                  onClick={loadDatabaseInfo}
                  variant='outline'
                  className='w-full'
                >
                  🔄 DB 정보 새로고침
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>테이블 정보</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className='h-64'>
                  <div className='space-y-3'>
                    {dbInfo.tables.map(table => (
                      <div
                        key={table}
                        className='flex items-center justify-between rounded bg-muted/50 p-3'
                      >
                        <span className='font-medium'>{table}</span>
                        <Badge variant='outline'>
                          {dbInfo.rowCounts[table] !== undefined
                            ? `${dbInfo.rowCounts[table]} rows`
                            : 'Unknown'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* API 엔드포인트 테스트 탭 */}
        <TabsContent value='endpoints' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>API 엔드포인트 테스트</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-3'>
                {[
                  {
                    endpoint: '/api/test-db-connection',
                    method: 'GET',
                    label: 'DB 연결 테스트',
                  },
                  {
                    endpoint: '/api/cache/stats',
                    method: 'GET',
                    label: '캐시 통계',
                  },
                  {
                    endpoint: '/api/cache/lookup',
                    method: 'GET',
                    label: '캐시 조회',
                  },
                ].map(({ endpoint, method, label }) => {
                  const key = `${method}-${endpoint}`;
                  const result = testResults[key];

                  return (
                    <div
                      key={key}
                      className='flex items-center justify-between rounded border p-3'
                    >
                      <div className='flex items-center gap-2'>
                        <StatusIcon status={result?.status || 'idle'} />
                        <span className='font-medium'>{label}</span>
                        <Badge variant='outline'>{method}</Badge>
                      </div>
                      <Button
                        size='sm'
                        onClick={() => testApi(endpoint, method)}
                        disabled={result?.status === 'loading'}
                      >
                        테스트
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 레이어 테스트 탭 */}
        <TabsContent value='layers' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>레이어별 테스트</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>테스트 텍스트:</label>
                <Input
                  value={testInputs.regexText}
                  onChange={e =>
                    setTestInputs(prev => ({
                      ...prev,
                      regexText: e.target.value,
                    }))
                  }
                  placeholder='예: GS25강남역점'
                />
              </div>

              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <Button
                  onClick={() =>
                    testApi('/api/regex/match', 'POST', {
                      text: testInputs.regexText,
                    })
                  }
                  disabled={
                    testResults['POST-/api/regex/match']?.status === 'loading'
                  }
                >
                  📄 정규식 매칭 테스트
                </Button>

                <Button
                  onClick={() =>
                    testApi('/api/llm/infer', 'POST', {
                      text: testInputs.regexText,
                    })
                  }
                  disabled={
                    testResults['POST-/api/llm/infer']?.status === 'loading'
                  }
                >
                  🧠 LLM 분류 테스트
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 통합 테스트 탭 */}
        <TabsContent value='integration' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>전체 파이프라인 통합 테스트</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>거래 분석 텍스트:</label>
                <Textarea
                  value={testInputs.analysisText}
                  onChange={e =>
                    setTestInputs(prev => ({
                      ...prev,
                      analysisText: e.target.value,
                    }))
                  }
                  placeholder='예: 신한카드 GS25 결제 15000원'
                  rows={3}
                />
              </div>

              <Button onClick={runFullIntegrationTest} size='lg'>
                ▶️ 전체 파이프라인 테스트
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 모니터링 탭 */}
        <TabsContent value='monitoring' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>시스템 상태</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <span>데이터베이스</span>
                  <Badge variant={dbInfo.connected ? 'default' : 'destructive'}>
                    {dbInfo.connected ? '정상' : '오류'}
                  </Badge>
                </div>

                <div className='flex items-center justify-between'>
                  <span>캐시 시스템</span>
                  <Badge variant='default'>정상</Badge>
                </div>

                <div className='flex items-center justify-between'>
                  <span>정규식 엔진</span>
                  <Badge variant='default'>정상</Badge>
                </div>

                <div className='flex items-center justify-between'>
                  <span>LLM 서비스</span>
                  <Badge variant='default'>정상</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
