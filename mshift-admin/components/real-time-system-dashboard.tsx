'use client';

import { useEffect, useState } from 'react';

import {
  Activity,
  AlertCircle,
  Calculator,
  CheckCircle,
  Clock,
  // Cpu,
  Database,
  Gauge,
  Hash,
  RefreshCw,
  Regex,
  TrendingUp,
  Zap,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface SystemMetrics {
  services: {
    regexEngine: {
      status: 'healthy' | 'warning' | 'error';
      responseTime: number;
      uptime: string;
    };
    keywordEngine: {
      status: 'healthy' | 'warning' | 'error';
      responseTime: number;
      uptime: string;
    };
    accountingEngine: {
      status: 'healthy' | 'warning' | 'error';
      responseTime: number;
      uptime: string;
    };
    redis: {
      status: 'healthy' | 'warning' | 'error';
      hitRate: number;
      memory: string;
    };
    postgresql: {
      status: 'healthy' | 'warning' | 'error';
      connections: string;
      queryTime: number;
    };
  };
  performance: {
    totalProcessed: number;
    avgResponseTime: number;
    successRate: number;
    cacheHitRate: number;
    errorRate: number;
    dailyGrowth: number;
  };
  engines: {
    regex: {
      activeRules: number;
      applicationRate: number;
      avgProcessingTime: number;
      topRule: { name: string; usage: number };
    };
    keyword: {
      activeGroups: number;
      matchSuccessRate: number;
      avgProcessingTime: number;
      topTag: { name: string; usage: number };
    };
    accounting: {
      generatedEntries: number;
      mappingRate: number;
      avgProcessingTime: number;
    };
  };
  recentActivities: Array<{
    id: string;
    timestamp: string;
    type: 'success' | 'warning' | 'error';
    message: string;
  }>;
}

export function RealTimeSystemDashboard() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  // 실시간 데이터 가져오기
  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/system/metrics');
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setMetrics(result.data);
          setLastUpdate(new Date().toLocaleTimeString());
        } else {
          console.error('API returned error:', result.error);
        }
      } else {
        console.error('API response not ok:', response.status);
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    // 10초마다 자동 새로고침
    const interval = setInterval(fetchMetrics, 10000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className='h-4 w-4' />;
      case 'warning':
        return <AlertCircle className='h-4 w-4' />;
      case 'error':
        return <AlertCircle className='h-4 w-4' />;
      default:
        return <Clock className='h-4 w-4' />;
    }
  };

  if (loading || !metrics) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='flex items-center space-x-2'>
          <RefreshCw className='h-6 w-6 animate-spin' />
          <span>시스템 데이터 로딩 중...</span>
        </div>
      </div>
    );
  }

  // 데이터 구조 검증
  if (!metrics.services || !metrics.performance || !metrics.engines) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='text-center'>
          <AlertCircle className='mx-auto mb-4 h-12 w-12 text-red-500' />
          <p className='text-lg font-semibold'>
            시스템 데이터를 불러올 수 없습니다
          </p>
          <Button onClick={fetchMetrics} className='mt-4'>
            <RefreshCw className='mr-2 h-4 w-4' />
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* 헤더 */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>실시간 시스템 모니터링</h1>
          <p className='mt-1 text-muted-foreground'>
            MoneyShift AI 시스템 현황 및 성능 지표
          </p>
        </div>
        <div className='flex items-center space-x-4'>
          <span className='text-sm text-muted-foreground'>
            마지막 업데이트: {lastUpdate}
          </span>
          <Button onClick={fetchMetrics} variant='outline' size='sm'>
            <RefreshCw className='mr-2 h-4 w-4' />
            새로고침
          </Button>
        </div>
      </div>

      {/* 시스템 서비스 상태 */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              정규식전처리엔진
            </CardTitle>
            <Regex className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='flex items-center space-x-2'>
              <Badge
                className={getStatusColor(
                  metrics.services?.regexEngine?.status || 'error'
                )}
              >
                {getStatusIcon(
                  metrics.services?.regexEngine?.status || 'error'
                )}
                {metrics.services?.regexEngine?.status === 'healthy'
                  ? '정상'
                  : '이상'}
              </Badge>
            </div>
            <p className='mt-2 text-xs text-muted-foreground'>
              응답시간: {metrics.services?.regexEngine?.responseTime || 0}ms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              키워드처리엔진
            </CardTitle>
            <Hash className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='flex items-center space-x-2'>
              <Badge
                className={getStatusColor(
                  metrics.services?.keywordEngine?.status || 'error'
                )}
              >
                {getStatusIcon(
                  metrics.services?.keywordEngine?.status || 'error'
                )}
                {metrics.services?.keywordEngine?.status === 'healthy'
                  ? '정상'
                  : '이상'}
              </Badge>
            </div>
            <p className='mt-2 text-xs text-muted-foreground'>
              응답시간: {metrics.services?.keywordEngine?.responseTime || 0}ms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>복식부기엔진</CardTitle>
            <Calculator className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='flex items-center space-x-2'>
              <Badge
                className={getStatusColor(
                  metrics.services?.accountingEngine?.status || 'error'
                )}
              >
                {getStatusIcon(
                  metrics.services?.accountingEngine?.status || 'error'
                )}
                {metrics.services?.accountingEngine?.status === 'healthy'
                  ? '정상'
                  : '이상'}
              </Badge>
            </div>
            <p className='mt-2 text-xs text-muted-foreground'>
              응답시간: {metrics.services?.accountingEngine?.responseTime || 0}
              ms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Redis 캐시</CardTitle>
            <Zap className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='flex items-center space-x-2'>
              <Badge
                className={getStatusColor(
                  metrics.services?.redis?.status || 'error'
                )}
              >
                {getStatusIcon(metrics.services?.redis?.status || 'error')}
                {metrics.services?.redis?.status === 'healthy'
                  ? '정상'
                  : '이상'}
              </Badge>
            </div>
            <p className='mt-2 text-xs text-muted-foreground'>
              히트율: {metrics.services?.redis?.hitRate || 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>PostgreSQL</CardTitle>
            <Database className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='flex items-center space-x-2'>
              <Badge
                className={getStatusColor(
                  metrics.services?.postgresql?.status || 'error'
                )}
              >
                {getStatusIcon(metrics.services?.postgresql?.status || 'error')}
                {metrics.services?.postgresql?.status === 'healthy'
                  ? '정상'
                  : '이상'}
              </Badge>
            </div>
            <p className='mt-2 text-xs text-muted-foreground'>
              연결: {metrics.services?.postgresql?.connections || '0/0'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 성능 메트릭 */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>총 처리 건수</CardTitle>
            <Activity className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-blue-600'>
              {(metrics.performance?.totalProcessed || 0).toLocaleString()}
            </div>
            <p className='mt-1 flex items-center text-xs text-muted-foreground'>
              <TrendingUp className='mr-1 h-3 w-3 text-green-500' />+
              {metrics.performance?.dailyGrowth || 0}% vs 어제
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>평균 응답시간</CardTitle>
            <Gauge className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>
              {metrics.performance?.avgResponseTime || 0}ms
            </div>
            <Progress
              value={Math.max(
                0,
                100 - ((metrics.performance?.avgResponseTime || 0) / 100) * 100
              )}
              className='mt-2'
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>분류 성공률</CardTitle>
            <CheckCircle className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>
              {metrics.performance?.successRate || 0}%
            </div>
            <Progress
              value={metrics.performance?.successRate || 0}
              className='mt-2'
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>캐시 히트율</CardTitle>
            <Zap className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-purple-600'>
              {metrics.performance?.cacheHitRate || 0}%
            </div>
            <Progress
              value={metrics.performance?.cacheHitRate || 0}
              className='mt-2'
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>에러율</CardTitle>
            <AlertCircle className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-red-600'>
              {(metrics.performance?.errorRate || 0).toFixed(1)}%
            </div>
            <Progress
              value={metrics.performance?.errorRate || 0}
              className='mt-2'
            />
          </CardContent>
        </Card>
      </div>

      {/* 엔진별 상세 현황 */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center'>
              <Regex className='mr-2 h-5 w-5' />
              정규식전처리엔진
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex justify-between'>
              <span className='text-sm font-medium'>활성 규칙</span>
              <span className='text-sm font-bold'>
                {metrics.engines?.regex?.activeRules || 0}개
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm font-medium'>적용률</span>
              <span className='text-sm font-bold text-blue-600'>
                {metrics.engines?.regex?.applicationRate || 0}%
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm font-medium'>평균 처리시간</span>
              <span className='text-sm font-bold'>
                {metrics.engines?.regex?.avgProcessingTime || 0}ms
              </span>
            </div>
            <div className='border-t pt-2'>
              <p className='text-xs text-muted-foreground'>최다 사용 규칙</p>
              <p className='text-sm font-medium'>
                {metrics.engines?.regex?.topRule?.name || 'N/A'} (
                {metrics.engines?.regex?.topRule?.usage || 0}회)
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center'>
              <Hash className='mr-2 h-5 w-5' />
              키워드처리엔진
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex justify-between'>
              <span className='text-sm font-medium'>활성 키워드 그룹</span>
              <span className='text-sm font-bold'>
                {metrics.engines?.keyword?.activeGroups || 0}개
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm font-medium'>매칭 성공률</span>
              <span className='text-sm font-bold text-green-600'>
                {metrics.engines?.keyword?.matchSuccessRate || 0}%
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm font-medium'>평균 처리시간</span>
              <span className='text-sm font-bold'>
                {metrics.engines?.keyword?.avgProcessingTime || 0}ms
              </span>
            </div>
            <div className='border-t pt-2'>
              <p className='text-xs text-muted-foreground'>최다 매칭 태그</p>
              <p className='text-sm font-medium'>
                {metrics.engines?.keyword?.topTag?.name || 'N/A'} (
                {metrics.engines?.keyword?.topTag?.usage || 0}회)
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center'>
              <Calculator className='mr-2 h-5 w-5' />
              복식부기엔진
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex justify-between'>
              <span className='text-sm font-medium'>생성된 분개</span>
              <span className='text-sm font-bold'>
                {(
                  metrics.engines?.accounting?.generatedEntries || 0
                ).toLocaleString()}
                건
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm font-medium'>계정과목 매핑률</span>
              <span className='text-sm font-bold text-purple-600'>
                {metrics.engines?.accounting?.mappingRate || 0}%
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm font-medium'>평균 처리시간</span>
              <span className='text-sm font-bold'>
                {metrics.engines?.accounting?.avgProcessingTime || 0}ms
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 최근 활동 로그 */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center'>
            <Activity className='mr-2 h-5 w-5' />
            최근 시스템 활동
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            {(metrics.recentActivities || []).map(activity => (
              <div
                key={activity.id}
                className='flex items-start space-x-3 rounded-lg border p-3'
              >
                <div
                  className={`rounded-full p-1 ${
                    activity.type === 'success'
                      ? 'bg-green-100'
                      : activity.type === 'warning'
                        ? 'bg-yellow-100'
                        : 'bg-red-100'
                  }`}
                >
                  {activity.type === 'success' ? (
                    <CheckCircle className='h-4 w-4 text-green-600' />
                  ) : activity.type === 'warning' ? (
                    <AlertCircle className='h-4 w-4 text-yellow-600' />
                  ) : (
                    <AlertCircle className='h-4 w-4 text-red-600' />
                  )}
                </div>
                <div className='flex-1'>
                  <p className='text-sm font-medium'>{activity.message}</p>
                  <p className='text-xs text-muted-foreground'>
                    {activity.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
