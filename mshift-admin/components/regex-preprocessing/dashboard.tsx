'use client';

import { useEffect, useState } from 'react';

import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Clock,
  FileText,
  // TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  PerformanceStats,
  RegexPerformanceService,
} from '@/lib/services/regex-preprocessing.service';

interface RecentActivity {
  id: number;
  time: string;
  user: string;
  action: string;
  status: 'success' | 'info' | 'warning' | 'error';
}

export function RegexPreprocessingDashboard() {
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'1d' | '7d' | '30d'>('7d');

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  // 실시간 데이터 로딩
  useEffect(() => {
    loadDashboardData();
  }, [period]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 성능 통계 API 호출
      const response = await fetch(
        `/api/regex-preprocessing/performance?period=${period}`
      );
      const result = await response.json();

      if (result.success) {
        setStats(result.data);
      } else {
        throw new Error(result.error || 'Failed to load performance stats');
      }

      // TODO: 실제 활동 로그 API 연동
      setRecentActivity([
        {
          id: 1,
          time: new Date().toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          user: '시스템',
          action: '성능 통계 업데이트',
          status: 'success',
        },
        {
          id: 2,
          time: '09:15',
          user: '시스템',
          action: '정규식 규칙 캐시 갱신',
          status: 'info',
        },
      ]);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(
        err instanceof Error
          ? err.message
          : '대시보드 데이터를 불러오는데 실패했습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  // 로딩 상태
  if (loading) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center justify-center p-8'>
          <div className='text-center'>
            <div className='mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600'></div>
            <p className='text-muted-foreground'>
              대시보드 데이터를 불러오는 중...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className='space-y-6'>
        <Card className='border-red-200'>
          <CardContent className='p-6 text-center'>
            <AlertTriangle className='mx-auto mb-4 h-12 w-12 text-red-500' />
            <h3 className='mb-2 text-lg font-semibold text-red-700'>
              데이터 로딩 실패
            </h3>
            <p className='mb-4 text-red-600'>{error}</p>
            <Button onClick={loadDashboardData} variant='outline'>
              다시 시도
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className='space-y-6'>
        <Card>
          <CardContent className='p-6 text-center'>
            <p className='text-muted-foreground'>통계 데이터가 없습니다.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* 기간 선택 헤더 */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold'>정규식 전처리 대시보드</h2>
          <p className='text-muted-foreground'>실시간 성능 모니터링 및 통계</p>
        </div>
        <div className='flex gap-2'>
          {(['1d', '7d', '30d'] as const).map(p => (
            <Button
              key={p}
              variant={period === p ? 'default' : 'outline'}
              size='sm'
              onClick={() => setPeriod(p)}
            >
              {p === '1d' ? '1일' : p === '7d' ? '7일' : '30일'}
            </Button>
          ))}
        </div>
      </div>

      {/* 주요 통계 카드 */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>총 규칙 수</CardTitle>
            <FileText className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-blue-600'>
              {stats.totalRules}
            </div>
            <Badge variant='secondary' className='mt-2'>
              활성: {stats.activeRules}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>처리 정확도</CardTitle>
            <CheckCircle className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>
              {stats.processingAccuracy.toFixed(1)}%
            </div>
            <Badge
              variant={stats.processingAccuracy >= 90 ? 'default' : 'secondary'}
              className='mt-2'
            >
              <TrendingUp className='mr-1 h-3 w-3' />
              {stats.errorRate < 10 ? '양호' : '개선 필요'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              평균 처리 시간
            </CardTitle>
            <Clock className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-purple-600'>
              {stats.averageProcessingTime.toFixed(1)}ms
            </div>
            <Badge variant='secondary' className='mt-2'>
              {stats.averageProcessingTime < 5 ? '빠름' : '보통'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>일일 처리량</CardTitle>
            <Activity className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-orange-600'>
              {stats.dailyProcessingCount.toLocaleString()}
            </div>
            <Badge variant='secondary' className='mt-2'>
              오늘
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* 성능 그래프 섹션 */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        {/* 성공률 추이 */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <BarChart3 className='h-5 w-5' />
              처리 통계 (최근 7일)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>성공률 추이</span>
                <Badge variant='secondary' className='flex items-center gap-1'>
                  <TrendingUp className='h-3 w-3' />
                  95.2%
                </Badge>
              </div>
              <div className='flex h-32 items-end justify-center rounded-lg bg-muted/20 p-4'>
                <div className='flex h-full items-end space-x-1'>
                  {[90, 91, 93, 94, 95, 94, 95].map((value, index) => (
                    <div key={index} className='flex flex-col items-center'>
                      <div
                        className='min-h-[4px] w-6 rounded-t bg-blue-500'
                        style={{ height: `${(value - 85) * 4}px` }}
                      />
                      <span className='mt-1 text-xs text-muted-foreground'>
                        {['월', '화', '수', '목', '금', '토', '일'][index]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className='grid grid-cols-2 gap-4 text-sm'>
                <div>
                  <span className='text-muted-foreground'>평균</span>
                  <div className='font-semibold'>93.4%</div>
                </div>
                <div>
                  <span className='text-muted-foreground'>최고</span>
                  <div className='font-semibold'>95.2%</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 응답 시간 분포 */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Zap className='h-5 w-5' />
              응답 시간 분포
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>&lt; 1ms</span>
                  <span className='text-sm font-medium'>45%</span>
                </div>
                <Progress value={45} className='h-2' />

                <div className='flex items-center justify-between'>
                  <span className='text-sm'>1-3ms</span>
                  <span className='text-sm font-medium'>38%</span>
                </div>
                <Progress value={38} className='h-2' />

                <div className='flex items-center justify-between'>
                  <span className='text-sm'>3-5ms</span>
                  <span className='text-sm font-medium'>12%</span>
                </div>
                <Progress value={12} className='h-2' />

                <div className='flex items-center justify-between'>
                  <span className='text-sm'>&gt; 5ms</span>
                  <span className='text-sm font-medium'>5%</span>
                </div>
                <Progress value={5} className='h-2' />
              </div>
              <div className='border-t pt-2'>
                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>평균 응답 시간</span>
                  <span className='font-semibold'>2.8ms</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 시스템 활동 */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        {/* 최근 활동 */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Activity className='h-5 w-5' />
              최근 활동
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {recentActivity.map(activity => (
                <div key={activity.id} className='flex items-center gap-3'>
                  <div className='flex-shrink-0'>
                    {activity.status === 'success' ? (
                      <CheckCircle className='h-4 w-4 text-green-500' />
                    ) : (
                      <Clock className='h-4 w-4 text-blue-500' />
                    )}
                  </div>
                  <div className='min-w-0 flex-1'>
                    <p className='text-sm font-medium'>
                      {activity.time} - {activity.user}: {activity.action}
                    </p>
                  </div>
                </div>
              ))}
              <Button variant='outline' size='sm' className='w-full'>
                모든 활동 보기
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 규칙 카테고리별 현황 */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <FileText className='h-5 w-5' />
              카테고리별 규칙 현황
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {stats.topCategories.length > 0 ? (
                stats.topCategories.map((category, index) => {
                  const colors = [
                    'bg-blue-500',
                    'bg-green-500',
                    'bg-purple-500',
                    'bg-orange-500',
                    'bg-cyan-500',
                    'bg-gray-500',
                  ];
                  const allActive = category.averageSuccessRate >= 95;

                  return (
                    <div
                      key={category.category}
                      className='flex items-center justify-between'
                    >
                      <div className='flex items-center gap-3'>
                        <div
                          className={`h-3 w-3 rounded-full ${colors[index % colors.length]}`}
                        />
                        <span className='text-sm font-medium'>
                          {category.category}
                        </span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Badge variant='outline' className='text-xs'>
                          {category.ruleCount}개 규칙
                        </Badge>
                        <Badge variant='outline' className='text-xs'>
                          성공률 {category.averageSuccessRate.toFixed(1)}%
                        </Badge>
                        {allActive ? (
                          <CheckCircle className='h-4 w-4 text-green-500' />
                        ) : (
                          <AlertTriangle className='h-4 w-4 text-orange-500' />
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className='py-4 text-center text-muted-foreground'>
                  카테고리별 통계가 없습니다.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 빠른 액션 */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            빠른 액션
            <Button variant='ghost' size='sm' onClick={loadDashboardData}>
              <Activity className='mr-2 h-4 w-4' />
              새로고침
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 gap-3 md:grid-cols-5'>
            <Button
              variant='outline'
              className='flex items-center gap-2'
              onClick={() => {
                // TODO: 새 규칙 추가 모달 열기
                console.log('새 규칙 추가');
              }}
            >
              <FileText className='h-4 w-4' />새 규칙 추가
            </Button>
            <Button
              variant='outline'
              className='flex items-center gap-2'
              onClick={() => {
                // TODO: 대량 테스트 탭으로 이동
                console.log('대량 테스트로 이동');
              }}
            >
              <Activity className='h-4 w-4' />
              대량 테스트
            </Button>
            <Button
              variant='outline'
              className='flex items-center gap-2'
              onClick={() => {
                // TODO: 충돌 관리 탭으로 이동
                console.log('충돌 관리로 이동');
              }}
            >
              <Zap className='h-4 w-4' />
              충돌 관리
            </Button>
            <Button
              variant='outline'
              className='flex items-center gap-2'
              onClick={() => {
                // 현재 대시보드 새로고침
                loadDashboardData();
              }}
            >
              <BarChart3 className='h-4 w-4' />
              성능 갱신
            </Button>
            <Button
              variant='outline'
              className='flex items-center gap-2'
              onClick={() => {
                // TODO: LLM 생성 탭으로 이동
                console.log('LLM 생성으로 이동');
              }}
            >
              <Users className='h-4 w-4' />
              LLM 패턴 생성
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
