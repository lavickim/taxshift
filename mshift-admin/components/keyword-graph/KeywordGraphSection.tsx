'use client';

import React, { useEffect, useState } from 'react';

import {
  BarChart3,
  Info,
  Loader2,
  Network,
  RefreshCw,
  Settings,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useKeywordGraph,
  useKeywordGraphPerformance,
} from '@/hooks/useKeywordGraph';

import KeywordNetworkGraph from './KeywordNetworkGraph';

interface KeywordGraphSectionProps {
  className?: string;
}

const KeywordGraphSection: React.FC<KeywordGraphSectionProps> = ({
  className = '',
}) => {
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [graphSettings, setGraphSettings] = useState({
    minMemberCount: 100,
    maxIndustries: 150,
  });

  // 키워드 그래프 데이터 관리
  const {
    data: graphData,
    graphData: d3GraphData,
    loading,
    error,
    loadGraph,
    loadPreview,
    loadCached,
    refreshGraph,
    retryLoad,
  } = useKeywordGraph({
    autoLoad: true,
    minMemberCount: graphSettings.minMemberCount,
    maxIndustries: graphSettings.maxIndustries,
  });

  // 성능 통계
  const { stats: performanceStats } = useKeywordGraphPerformance();

  const handleNodeClick = (node: any) => {
    setSelectedNode(node);
  };

  const handleNodeHover = (node: any) => {
    // 호버 이벤트 처리 (추후 구현)
  };

  const handleLoadGraph = async () => {
    await loadGraph({
      minMemberCount: graphSettings.minMemberCount,
      maxIndustries: graphSettings.maxIndustries,
    });
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  const formatMemory = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div className={`keyword-graph-section space-y-6 ${className}`}>
      {/* 헤더 섹션 */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900'>
            키워드 관계 그래프
          </h2>
          <p className='mt-1 text-gray-600'>
            🚀 실제 54만+ 국민연금 업종 데이터 기반 키워드 네트워크 분석 (PMI
            알고리즘)
          </p>
        </div>
        <div className='flex gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={loadPreview}
            disabled={loading}
          >
            <BarChart3 className='mr-1 h-4 w-4' />
            미리보기
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={loadCached}
            disabled={loading}
          >
            <RefreshCw className='mr-1 h-4 w-4' />
            캐시 로드
          </Button>
          <Button onClick={handleLoadGraph} disabled={loading} size='sm'>
            {loading ? (
              <Loader2 className='mr-1 h-4 w-4 animate-spin' />
            ) : (
              <Network className='mr-1 h-4 w-4' />
            )}
            생성
          </Button>
        </div>
      </div>

      {/* 설정 및 통계 */}
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
        {/* 그래프 설정 */}
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center text-sm'>
              <Settings className='mr-2 h-4 w-4' />
              그래프 설정
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div>
              <label className='text-xs text-gray-600'>최소 회원 수</label>
              <div className='flex items-center gap-2'>
                <input
                  type='number'
                  value={graphSettings.minMemberCount}
                  onChange={e =>
                    setGraphSettings(prev => ({
                      ...prev,
                      minMemberCount: parseInt(e.target.value) || 100,
                    }))
                  }
                  className='flex-1 rounded border px-2 py-1 text-sm'
                  min='50'
                  max='1000'
                />
                <span className='text-xs text-gray-500'>명</span>
              </div>
            </div>
            <div>
              <label className='text-xs text-gray-600'>최대 업종 수</label>
              <div className='flex items-center gap-2'>
                <input
                  type='number'
                  value={graphSettings.maxIndustries}
                  onChange={e =>
                    setGraphSettings(prev => ({
                      ...prev,
                      maxIndustries: parseInt(e.target.value) || 150,
                    }))
                  }
                  className='flex-1 rounded border px-2 py-1 text-sm'
                  min='50'
                  max='200'
                />
                <span className='text-xs text-gray-500'>개</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 처리 통계 */}
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center text-sm'>
              <Info className='mr-2 h-4 w-4' />
              처리 통계
            </CardTitle>
          </CardHeader>
          <CardContent>
            {graphData?.statistics ? (
              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>키워드:</span>
                  <span className='font-medium'>
                    {formatNumber(graphData.statistics.totalKeywords || 0)}개
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>관계:</span>
                  <span className='font-medium'>
                    {formatNumber(graphData.statistics.totalRelationships || 0)}
                    개
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>총 회원:</span>
                  <span className='font-medium'>
                    {formatNumber(graphData.statistics.totalMembers || 0)}명
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>업종:</span>
                  <span className='font-medium'>
                    {formatNumber(graphData.statistics.totalIndustries || 0)}개
                  </span>
                </div>
              </div>
            ) : (
              <div className='py-4 text-center text-sm text-gray-500'>
                데이터를 로드해주세요
              </div>
            )}
          </CardContent>
        </Card>

        {/* 성능 정보 */}
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center text-sm'>
              <BarChart3 className='mr-2 h-4 w-4' />
              성능 정보
            </CardTitle>
          </CardHeader>
          <CardContent>
            {performanceStats ? (
              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>사용 메모리:</span>
                  <span className='font-medium'>
                    {formatMemory(performanceStats.usedMemory)}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>CPU 코어:</span>
                  <span className='font-medium'>
                    {performanceStats.availableProcessors}개
                  </span>
                </div>
                {graphData?.performanceMetrics && (
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>처리 시간:</span>
                    <span className='font-medium'>
                      {formatNumber(
                        graphData.performanceMetrics.total_processing_ms
                      )}
                      ms
                    </span>
                  </div>
                )}
                <div className='pt-2'>
                  <Badge variant='outline' className='text-xs'>
                    최적화됨
                  </Badge>
                </div>
              </div>
            ) : (
              <div className='py-4 text-center text-sm text-gray-500'>
                성능 정보 로딩 중...
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 메인 그래프 영역 */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='flex items-center'>
                <Network className='mr-2 h-5 w-5' />
                키워드 네트워크 그래프
              </CardTitle>
              <CardDescription>
                업종별 키워드 관계를 시각화한 인터랙티브 그래프입니다
              </CardDescription>
            </div>
            <div className='flex items-center gap-2'>
              {graphData?.metadata?.optimized && (
                <Badge variant='secondary' className='text-xs'>
                  고성능 최적화
                </Badge>
              )}
              {graphData?.cached && (
                <Badge variant='outline' className='text-xs'>
                  캐시됨
                </Badge>
              )}
              {graphData?.metadata?.mock && (
                <Badge variant='destructive' className='text-xs'>
                  Demo 데이터
                </Badge>
              )}
              {loading && (
                <Badge variant='secondary' className='text-xs'>
                  <Loader2 className='mr-1 h-3 w-3 animate-spin' />
                  처리 중
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className='py-12 text-center'>
              <div className='mb-4 text-red-600'>⚠️ 오류가 발생했습니다</div>
              <p className='mb-4 text-gray-600'>{error}</p>
              <Button onClick={retryLoad} variant='outline' size='sm'>
                다시 시도
              </Button>
            </div>
          ) : loading ? (
            <div className='py-12 text-center'>
              <Loader2 className='mx-auto mb-4 h-8 w-8 animate-spin text-blue-600' />
              <p className='text-gray-600'>
                실제 54만건 국민연금 데이터에서 키워드를 추출하고 있습니다...
              </p>
              <p className='mt-2 text-sm text-gray-500'>
                🔄 배치 처리 + PMI 관계 분석 진행 중 (1-3분 소요)
              </p>
            </div>
          ) : d3GraphData ? (
            <KeywordNetworkGraph
              data={d3GraphData}
              onNodeClick={handleNodeClick}
              onNodeHover={handleNodeHover}
              width={1200}
              height={700}
            />
          ) : (
            <div className='py-12 text-center'>
              <Network className='mx-auto mb-4 h-12 w-12 text-gray-400' />
              <p className='mb-4 text-gray-600'>키워드 그래프를 생성해보세요</p>
              <Button onClick={handleLoadGraph} size='sm'>
                그래프 생성
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 상세 정보 탭 */}
      {(graphData || selectedNode) && (
        <Card>
          <CardHeader>
            <CardTitle>상세 분석</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue='overview' className='w-full'>
              <TabsList className='grid w-full grid-cols-4'>
                <TabsTrigger value='overview'>개요</TabsTrigger>
                <TabsTrigger value='keywords'>키워드</TabsTrigger>
                <TabsTrigger value='relationships'>관계</TabsTrigger>
                <TabsTrigger value='performance'>성능</TabsTrigger>
              </TabsList>

              <TabsContent value='overview' className='space-y-4'>
                {graphData?.statistics && (
                  <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
                    <div className='rounded-lg bg-blue-50 p-4 text-center'>
                      <div className='text-2xl font-bold text-blue-600'>
                        {formatNumber(graphData.statistics.totalKeywords || 0)}
                      </div>
                      <div className='text-sm text-gray-600'>총 키워드</div>
                    </div>
                    <div className='rounded-lg bg-green-50 p-4 text-center'>
                      <div className='text-2xl font-bold text-green-600'>
                        {formatNumber(
                          graphData.statistics.totalRelationships || 0
                        )}
                      </div>
                      <div className='text-sm text-gray-600'>총 관계</div>
                    </div>
                    <div className='rounded-lg bg-purple-50 p-4 text-center'>
                      <div className='text-2xl font-bold text-purple-600'>
                        {formatNumber(graphData.statistics.totalMembers || 0)}
                      </div>
                      <div className='text-sm text-gray-600'>총 회원</div>
                    </div>
                    <div className='rounded-lg bg-orange-50 p-4 text-center'>
                      <div className='text-2xl font-bold text-orange-600'>
                        {formatNumber(
                          graphData.statistics.totalIndustries || 0
                        )}
                      </div>
                      <div className='text-sm text-gray-600'>총 업종</div>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value='keywords'>
                {graphData?.statistics?.topKeywords ? (
                  <div className='space-y-2'>
                    <h4 className='font-medium text-gray-900'>상위 키워드</h4>
                    <div className='grid gap-2'>
                      {graphData.statistics.topKeywords
                        .slice(0, 10)
                        .map((keyword: any, index: number) => (
                          <div
                            key={index}
                            className='flex items-center justify-between rounded bg-gray-50 px-3 py-2'
                          >
                            <div className='flex items-center gap-2'>
                              <Badge variant='outline' className='text-xs'>
                                {keyword.category}
                              </Badge>
                              <span className='font-medium'>
                                {keyword.keyword}
                              </span>
                            </div>
                            <div className='text-sm text-gray-600'>
                              {formatNumber(keyword.memberCount)}명
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ) : (
                  <div className='py-8 text-center text-gray-500'>
                    키워드 데이터를 로드해주세요
                  </div>
                )}
              </TabsContent>

              <TabsContent value='relationships'>
                <div className='py-8 text-center text-gray-500'>
                  관계 분석 데이터 (구현 예정)
                </div>
              </TabsContent>

              <TabsContent value='performance'>
                {graphData?.performanceMetrics ? (
                  <div className='space-y-4'>
                    <h4 className='font-medium text-gray-900'>성능 메트릭</h4>
                    <div className='grid grid-cols-2 gap-4 md:grid-cols-3'>
                      {Object.entries(graphData.performanceMetrics).map(
                        ([key, value]) => (
                          <div key={key} className='rounded bg-gray-50 p-3'>
                            <div className='text-sm text-gray-600'>
                              {key.replace(/_/g, ' ')}
                            </div>
                            <div className='font-medium'>
                              {typeof value === 'number'
                                ? `${formatNumber(value)}ms`
                                : value}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                ) : (
                  <div className='py-8 text-center text-gray-500'>
                    성능 데이터를 로드해주세요
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default KeywordGraphSection;
