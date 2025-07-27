'use client';

import { useEffect, useState } from 'react';

import {
  Activity,
  AlertCircle,
  BarChart3,
  Database,
  TrendingUp,
  Zap,
} from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SystemStats {
  totalKeywordGroups: number;
  activeKeywordGroups: number;
  totalBrandMappings: number;
  autoRegisteredBrands: number;
  cacheHitRate: number;
  averageConfidence: number;
  processingPaths: {
    keywordEngine: number;
    dynamicBrand: number;
    cache: number;
  };
}

interface BrandUsageStats {
  brandName: string;
  usageCount: number;
  lastUsed: string;
  autoRegistered: boolean;
  confidence: number;
  tag: string;
}

interface SuccessAnalysis {
  totalTests: number;
  successRate: number;
  exactMatchRate: number;
  similarMatchRate: number;
  industryBreakdown: Array<{
    industry: string;
    successRate: number;
    count: number;
  }>;
  confidenceDistribution: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
}

export default function DynamicSystemMonitoring() {
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [brandUsageStats, setBrandUsageStats] = useState<BrandUsageStats[]>([]);
  const [successAnalysis, setSuccessAnalysis] =
    useState<SuccessAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSystemStats = async () => {
    setLoading(true);
    try {
      // 시스템 통계 조회
      const statsResponse = await fetch('/api/v2/keyword-system/stats');
      if (statsResponse.ok) {
        const stats = await statsResponse.json();
        setSystemStats(stats);
      }

      // 브랜드 사용 통계 조회
      const brandStatsResponse = await fetch(
        '/api/v2/dynamic-brand/usage-stats?limit=50'
      );
      if (brandStatsResponse.ok) {
        const brandStats = await brandStatsResponse.json();
        setBrandUsageStats(brandStats);
      }
    } catch (error) {
      console.error('시스템 통계 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const runSuccessAnalysis = async () => {
    setAnalysisLoading(true);
    try {
      const response = await fetch('/api/v2/analysis/success-cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sampleSize: 200 }),
      });

      if (response.ok) {
        const analysis = await response.json();
        setSuccessAnalysis(analysis);
      }
    } catch (error) {
      console.error('성공 케이스 분석 실패:', error);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const refreshCache = async () => {
    setRefreshing(true);
    try {
      const response = await fetch('/api/v2/tag-mapping-mgmt/refresh-cache', {
        method: 'POST',
      });

      if (response.ok) {
        alert('캐시가 성공적으로 새로고침되었습니다.');
        fetchSystemStats(); // 통계 새로고침
      } else {
        alert('캐시 새로고침 실패');
      }
    } catch (error) {
      console.error('캐시 새로고침 실패:', error);
      alert('캐시 새로고침 중 오류 발생');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSystemStats();
  }, []);

  const getStatusColor = (
    value: number,
    thresholds: { good: number; warning: number }
  ) => {
    if (value >= thresholds.good) return 'text-green-600';
    if (value >= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold'>동적 시스템 모니터링</h2>
          <p className='text-muted-foreground'>
            키워드 분류 시스템 성능 및 브랜드 매칭 현황
          </p>
        </div>
        <div className='space-x-2'>
          <Button
            onClick={refreshCache}
            disabled={refreshing}
            variant='outline'
          >
            {refreshing ? '새로고침 중...' : '캐시 새로고침'}
          </Button>
          <Button onClick={fetchSystemStats} disabled={loading}>
            {loading ? '로딩 중...' : '통계 새로고침'}
          </Button>
        </div>
      </div>

      {/* 시스템 현황 대시보드 */}
      {systemStats && (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>키워드 그룹</CardTitle>
              <Database className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {systemStats.activeKeywordGroups}
              </div>
              <p className='text-xs text-muted-foreground'>
                전체 {systemStats.totalKeywordGroups}개 중 활성
              </p>
              <Progress
                value={
                  (systemStats.activeKeywordGroups /
                    systemStats.totalKeywordGroups) *
                  100
                }
                className='mt-2'
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                자동 등록 브랜드
              </CardTitle>
              <Zap className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {systemStats.autoRegisteredBrands}
              </div>
              <p className='text-xs text-muted-foreground'>
                동적 시스템으로 추가된 브랜드
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>캐시 적중률</CardTitle>
              <TrendingUp className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${getStatusColor(systemStats.cacheHitRate, { good: 80, warning: 60 })}`}
              >
                {systemStats.cacheHitRate.toFixed(1)}%
              </div>
              <p className='text-xs text-muted-foreground'>캐시 성능 지표</p>
              <Progress value={systemStats.cacheHitRate} className='mt-2' />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>평균 신뢰도</CardTitle>
              <Activity className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${getStatusColor(systemStats.averageConfidence * 100, { good: 85, warning: 70 })}`}
              >
                {(systemStats.averageConfidence * 100).toFixed(1)}%
              </div>
              <p className='text-xs text-muted-foreground'>분류 정확도</p>
              <Progress
                value={systemStats.averageConfidence * 100}
                className='mt-2'
              />
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue='processing' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='processing'>처리 경로 분석</TabsTrigger>
          <TabsTrigger value='brands'>브랜드 사용 통계</TabsTrigger>
          <TabsTrigger value='success'>성공 케이스 분석</TabsTrigger>
        </TabsList>

        <TabsContent value='processing' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>처리 경로별 성능</CardTitle>
              <CardDescription>
                요청이 어떤 경로로 처리되고 있는지 분석
              </CardDescription>
            </CardHeader>
            <CardContent>
              {systemStats && (
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium'>키워드 엔진</span>
                    <div className='flex items-center space-x-2'>
                      <Badge variant='secondary'>
                        {systemStats.processingPaths.keywordEngine}회
                      </Badge>
                      <span className='text-sm text-muted-foreground'>
                        {(
                          (systemStats.processingPaths.keywordEngine /
                            (systemStats.processingPaths.keywordEngine +
                              systemStats.processingPaths.dynamicBrand +
                              systemStats.processingPaths.cache)) *
                          100
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={
                      (systemStats.processingPaths.keywordEngine /
                        (systemStats.processingPaths.keywordEngine +
                          systemStats.processingPaths.dynamicBrand +
                          systemStats.processingPaths.cache)) *
                      100
                    }
                  />

                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium'>동적 브랜드</span>
                    <div className='flex items-center space-x-2'>
                      <Badge variant='secondary'>
                        {systemStats.processingPaths.dynamicBrand}회
                      </Badge>
                      <span className='text-sm text-muted-foreground'>
                        {(
                          (systemStats.processingPaths.dynamicBrand /
                            (systemStats.processingPaths.keywordEngine +
                              systemStats.processingPaths.dynamicBrand +
                              systemStats.processingPaths.cache)) *
                          100
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={
                      (systemStats.processingPaths.dynamicBrand /
                        (systemStats.processingPaths.keywordEngine +
                          systemStats.processingPaths.dynamicBrand +
                          systemStats.processingPaths.cache)) *
                      100
                    }
                  />

                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium'>캐시</span>
                    <div className='flex items-center space-x-2'>
                      <Badge variant='secondary'>
                        {systemStats.processingPaths.cache}회
                      </Badge>
                      <span className='text-sm text-muted-foreground'>
                        {(
                          (systemStats.processingPaths.cache /
                            (systemStats.processingPaths.keywordEngine +
                              systemStats.processingPaths.dynamicBrand +
                              systemStats.processingPaths.cache)) *
                          100
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={
                      (systemStats.processingPaths.cache /
                        (systemStats.processingPaths.keywordEngine +
                          systemStats.processingPaths.dynamicBrand +
                          systemStats.processingPaths.cache)) *
                      100
                    }
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='brands' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>브랜드 사용 통계 (상위 50개)</CardTitle>
              <CardDescription>
                자주 사용되는 브랜드와 자동 등록 현황
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>브랜드명</TableHead>
                    <TableHead>사용 횟수</TableHead>
                    <TableHead>마지막 사용</TableHead>
                    <TableHead>자동 등록</TableHead>
                    <TableHead>신뢰도</TableHead>
                    <TableHead>태그</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {brandUsageStats.map((brand, index) => (
                    <TableRow key={index}>
                      <TableCell className='font-medium'>
                        {brand.brandName}
                      </TableCell>
                      <TableCell>
                        <Badge variant='outline'>{brand.usageCount}</Badge>
                      </TableCell>
                      <TableCell className='text-sm text-muted-foreground'>
                        {new Date(brand.lastUsed).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {brand.autoRegistered ? (
                          <Badge className='bg-green-100 text-green-800'>
                            자동
                          </Badge>
                        ) : (
                          <Badge variant='outline'>수동</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <span
                          className={getStatusColor(brand.confidence * 100, {
                            good: 85,
                            warning: 70,
                          })}
                        >
                          {(brand.confidence * 100).toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant='secondary'>{brand.tag}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='success' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center space-x-2'>
                <BarChart3 className='h-5 w-5' />
                <span>성공 케이스 분석</span>
              </CardTitle>
              <CardDescription>
                시스템 성능 및 분류 정확도 상세 분석
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <Button
                  onClick={runSuccessAnalysis}
                  disabled={analysisLoading}
                  className='w-full'
                >
                  {analysisLoading ? '분석 중...' : '성공 케이스 분석 실행'}
                </Button>

                {successAnalysis && (
                  <div className='space-y-6'>
                    {/* 전체 성능 지표 */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                      <Card>
                        <CardContent className='pt-6'>
                          <div className='text-center text-2xl font-bold'>
                            {successAnalysis.successRate.toFixed(1)}%
                          </div>
                          <p className='text-center text-sm text-muted-foreground'>
                            전체 성공률
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className='pt-6'>
                          <div className='text-center text-2xl font-bold'>
                            {successAnalysis.exactMatchRate.toFixed(1)}%
                          </div>
                          <p className='text-center text-sm text-muted-foreground'>
                            정확한 매칭
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className='pt-6'>
                          <div className='text-center text-2xl font-bold'>
                            {successAnalysis.similarMatchRate.toFixed(1)}%
                          </div>
                          <p className='text-center text-sm text-muted-foreground'>
                            유사 매칭
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* 산업별 성공률 */}
                    <div>
                      <h4 className='mb-3 text-lg font-semibold'>
                        산업별 성공률
                      </h4>
                      <div className='space-y-2'>
                        {successAnalysis.industryBreakdown.map(
                          (industry, index) => (
                            <div
                              key={index}
                              className='flex items-center justify-between'
                            >
                              <span className='text-sm font-medium'>
                                {industry.industry}
                              </span>
                              <div className='flex items-center space-x-2'>
                                <Badge variant='outline'>
                                  {industry.count}개
                                </Badge>
                                <span
                                  className={`text-sm ${getStatusColor(industry.successRate, { good: 85, warning: 70 })}`}
                                >
                                  {industry.successRate.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    {/* 신뢰도 분포 */}
                    <div>
                      <h4 className='mb-3 text-lg font-semibold'>
                        신뢰도 분포
                      </h4>
                      <div className='space-y-2'>
                        {successAnalysis.confidenceDistribution.map(
                          (range, index) => (
                            <div
                              key={index}
                              className='flex items-center justify-between'
                            >
                              <span className='text-sm font-medium'>
                                {range.range}
                              </span>
                              <div className='flex items-center space-x-2'>
                                <Badge variant='outline'>{range.count}개</Badge>
                                <span className='text-sm text-muted-foreground'>
                                  {range.percentage.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    {/* 권장사항 */}
                    <Alert>
                      <AlertCircle className='h-4 w-4' />
                      <AlertDescription>
                        <strong>개선 권장사항:</strong>
                        <ul className='mt-2 list-inside list-disc space-y-1 text-sm'>
                          <li>
                            유사 매칭 비율(
                            {successAnalysis.similarMatchRate.toFixed(1)}%)을
                            줄이기 위해 태그 통합 검토
                          </li>
                          <li>
                            도소매 업종의 낮은 성공률 개선을 위한 키워드 그룹
                            추가
                          </li>
                          <li>
                            신뢰도 90% 이상 케이스가{' '}
                            {successAnalysis.confidenceDistribution[0]?.percentage.toFixed(
                              1
                            )}
                            %로 우수
                          </li>
                        </ul>
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
