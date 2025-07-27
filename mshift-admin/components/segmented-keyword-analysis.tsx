'use client';

import { useEffect, useRef, useState } from 'react';

import {
  BarChart3,
  Building2,
  // Download,
  Eye,
  Filter,
  Info,
  MapPin,
  Network,
  RefreshCw,
  Search,
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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SegmentedKeywordAnalysisProps {}

interface KeywordData {
  keyword: string;
  count: number;
  confidence: number;
  segment: string;
}

interface GraphNode {
  id: string;
  category: string;
  frequency: number;
  confidence: number;
  size: number;
  color: string;
}

interface GraphLink {
  source: string;
  target: string;
  strength: number;
  type: string;
  thickness: number;
}

interface SegmentStatistics {
  segment_type: string;
  segment_count: number;
  keyword_count: number;
  avg_confidence: number;
  total_frequency: number;
  max_frequency: number;
}

export function SegmentedKeywordAnalysis({}: SegmentedKeywordAnalysisProps) {
  const [loading, setLoading] = useState(false);
  const [activeSegmentType, setActiveSegmentType] = useState('category');
  const [selectedSegment, setSelectedSegment] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [keywords, setKeywords] = useState<KeywordData[]>([]);
  const [relatedKeywords, setRelatedKeywords] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<SegmentStatistics[]>([]);
  const [graphData, setGraphData] = useState<{
    nodes: GraphNode[];
    links: GraphLink[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const svgRef = useRef<SVGSVGElement>(null);
  const API_BASE =
    process.env.NODE_ENV === 'production'
      ? '/mshift-api'
      : 'http://localhost:8080/mshift-api';

  // 세그먼트 타입별 설정
  const segmentTypes = {
    category: {
      name: '업종별',
      icon: <Building2 className='h-4 w-4' />,
      color: 'bg-blue-500',
      segments: [
        '제조업',
        '음식점',
        '의료',
        '교육',
        '소매',
        '건설/부동산',
        '운송',
        '미용',
        '서비스업',
        '기타',
      ],
    },
    region: {
      name: '지역별',
      icon: <MapPin className='h-4 w-4' />,
      color: 'bg-green-500',
      segments: [
        '11',
        '26',
        '27',
        '28',
        '29',
        '30',
        '31',
        '41',
        '42',
        '43',
        '44',
        '45',
        '46',
        '47',
        '48',
        '50',
      ],
    },
    size: {
      name: '규모별',
      icon: <BarChart3 className='h-4 w-4' />,
      color: 'bg-orange-500',
      segments: ['small', 'medium', 'large', 'xlarge'],
    },
    frequency: {
      name: '빈도별',
      icon: <TrendingUp className='h-4 w-4' />,
      color: 'bg-purple-500',
      segments: ['TOP', 'HIGH', 'MEDIUM', 'LOW'],
    },
  };

  // 지역 코드 매핑
  const regionNames = {
    '11': '서울특별시',
    '26': '부산광역시',
    '27': '대구광역시',
    '28': '인천광역시',
    '29': '광주광역시',
    '30': '대전광역시',
    '31': '울산광역시',
    '41': '경기도',
    '42': '강원도',
    '43': '충청북도',
    '44': '충청남도',
    '45': '전라북도',
    '46': '전라남도',
    '47': '경상북도',
    '48': '경상남도',
    '50': '제주특별자치도',
  };

  // 통계 로드
  const loadStatistics = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/v2/segmented-keywords/segments/statistics`
      );
      if (response.ok) {
        const data = await response.json();
        setStatistics(data.statistics || []);
        setLastUpdated(data.generatedAt || new Date().toISOString());
      }
    } catch (err) {
      console.error('통계 로드 실패:', err);
    }
  };

  // 세그먼트별 키워드 로드
  const loadSegmentKeywords = async (
    segmentType: string,
    segmentName?: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ limit: '30' });
      if (segmentName && segmentName !== 'all')
        params.append('segmentName', segmentName);

      const response = await fetch(
        `${API_BASE}/v2/segmented-keywords/segments/${segmentType}/keywords?${params}`
      );

      if (response.ok) {
        const data = await response.json();
        setKeywords(data.keywords || []);
        setLastUpdated(data.generatedAt || new Date().toISOString());
      } else {
        throw new Error(`API 오류: ${response.status}`);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : '키워드 로드 중 오류가 발생했습니다.'
      );
      setKeywords([]);
    } finally {
      setLoading(false);
    }
  };

  // 관련 키워드 로드
  const loadRelatedKeywords = async (keyword: string) => {
    if (!keyword.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}/v2/segmented-keywords/keywords/${encodeURIComponent(keyword)}/related?limit=10`
      );

      if (response.ok) {
        const data = await response.json();
        setRelatedKeywords(data.relatedKeywords || []);
      }
    } catch (err) {
      console.error('관련 키워드 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  // 그래프 데이터 로드
  const loadGraphData = async (
    segmentType: string,
    segmentName?: string,
    keyword?: string
  ) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        nodeLimit: '50',
        linkLimit: '100',
      });
      if (segmentType) params.append('segmentType', segmentType);
      if (segmentName && segmentName !== 'all')
        params.append('segmentName', segmentName);
      if (keyword) params.append('keyword', keyword);

      const response = await fetch(
        `${API_BASE}/v2/segmented-keywords/graph?${params}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.graphData) {
          setGraphData(data.graphData);
          renderD3Graph(data.graphData);
        }
      }
    } catch (err) {
      console.error('그래프 데이터 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  // D3.js 그래프 렌더링 (기본 구현)
  const renderD3Graph = (data: { nodes: GraphNode[]; links: GraphLink[] }) => {
    if (!svgRef.current || !data.nodes.length) return;

    const svg = svgRef.current;
    const width = 800;
    const height = 500;

    // SVG 초기화
    svg.innerHTML = '';
    svg.setAttribute('width', width.toString());
    svg.setAttribute('height', height.toString());

    // 간단한 원형 레이아웃으로 노드 배치
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3;

    data.nodes.forEach((node, index) => {
      const angle = (2 * Math.PI * index) / data.nodes.length;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      // 노드 생성
      const circle = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'circle'
      );
      circle.setAttribute('cx', x.toString());
      circle.setAttribute('cy', y.toString());
      circle.setAttribute(
        'r',
        Math.min(20, 5 + node.frequency / 10).toString()
      );
      circle.setAttribute('fill', node.color || '#3B82F6');
      circle.setAttribute('stroke', '#ffffff');
      circle.setAttribute('stroke-width', '2');
      circle.setAttribute('opacity', '0.8');
      svg.appendChild(circle);

      // 라벨 생성
      const text = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'text'
      );
      text.setAttribute('x', x.toString());
      text.setAttribute('y', (y + 25).toString());
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('font-size', '12');
      text.setAttribute('fill', '#374151');
      text.textContent =
        node.id.length > 8 ? node.id.substring(0, 8) + '...' : node.id;
      svg.appendChild(text);
    });
  };

  // 초기 로드
  useEffect(() => {
    loadStatistics();
    loadSegmentKeywords(activeSegmentType);
  }, [activeSegmentType]);

  // 세그먼트 변경 시 키워드 로드
  useEffect(() => {
    if (selectedSegment && selectedSegment !== 'all') {
      loadSegmentKeywords(activeSegmentType, selectedSegment);
      loadGraphData(activeSegmentType, selectedSegment);
    } else if (selectedSegment === 'all') {
      loadSegmentKeywords(activeSegmentType);
      loadGraphData(activeSegmentType);
    }
  }, [selectedSegment]);

  // 검색 키워드 변경 시 관련 키워드 로드
  useEffect(() => {
    if (searchKeyword) {
      const debounceTimeout = setTimeout(() => {
        loadRelatedKeywords(searchKeyword);
        loadGraphData(activeSegmentType, selectedSegment, searchKeyword);
      }, 500);
      return () => clearTimeout(debounceTimeout);
    }
  }, [searchKeyword]);

  return (
    <div className='space-y-6'>
      {/* 헤더 */}
      <div className='flex items-center justify-between'>
        <div className='space-y-1'>
          <h2 className='text-2xl font-bold tracking-tight'>
            세그먼트 키워드 분석
          </h2>
          <p className='text-muted-foreground'>
            54만건 국민연금 데이터에서 추출한 키워드를 세그먼트별로 분석합니다
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Badge variant='outline' className='text-xs'>
            <Zap className='mr-1 h-3 w-3' />
            고성능 세그먼트화
          </Badge>
          <Button variant='outline' size='sm' onClick={() => loadStatistics()}>
            <RefreshCw className='mr-1 h-4 w-4' />
            새로고침
          </Button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
        {statistics.map(stat => {
          const segmentConfig =
            segmentTypes[stat.segment_type as keyof typeof segmentTypes];
          return (
            <Card
              key={stat.segment_type}
              className='cursor-pointer transition-shadow hover:shadow-md'
              onClick={() => setActiveSegmentType(stat.segment_type)}
            >
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  {segmentConfig?.name || stat.segment_type}
                </CardTitle>
                <div
                  className={`rounded p-1 ${segmentConfig?.color || 'bg-gray-500'} text-white`}
                >
                  {segmentConfig?.icon || <BarChart3 className='h-4 w-4' />}
                </div>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {stat.keyword_count.toLocaleString()}
                </div>
                <p className='text-xs text-muted-foreground'>
                  {stat.segment_count}개 세그먼트 •{' '}
                  {(stat.avg_confidence * 100).toFixed(1)}% 신뢰도
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {error && (
        <Alert variant='destructive'>
          <Info className='h-4 w-4' />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 메인 분석 영역 */}
      <Tabs
        value={activeSegmentType}
        onValueChange={setActiveSegmentType}
        className='space-y-4'
      >
        <TabsList className='grid w-full grid-cols-4'>
          {Object.entries(segmentTypes).map(([key, config]) => (
            <TabsTrigger
              key={key}
              value={key}
              className='flex items-center gap-2'
            >
              {config.icon}
              {config.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(segmentTypes).map(([segmentType, config]) => (
          <TabsContent
            key={segmentType}
            value={segmentType}
            className='space-y-4'
          >
            {/* 필터 컨트롤 */}
            <div className='flex flex-col gap-4 sm:flex-row'>
              <div className='flex-1'>
                <Select
                  value={selectedSegment}
                  onValueChange={setSelectedSegment}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`${config.name} 선택...`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>전체</SelectItem>
                    {config.segments.map(segment => (
                      <SelectItem key={segment} value={segment}>
                        {segmentType === 'region'
                          ? `${regionNames[segment as keyof typeof regionNames] || segment} (${segment})`
                          : segment}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='flex-1'>
                <Input
                  placeholder='키워드 검색...'
                  value={searchKeyword}
                  onChange={e => setSearchKeyword(e.target.value)}
                  className='w-full'
                />
              </div>
            </div>

            <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
              {/* 키워드 목록 */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Filter className='h-4 w-4' />
                    상위 키워드
                    {selectedSegment && selectedSegment !== 'all' && (
                      <Badge variant='secondary'>
                        {segmentType === 'region'
                          ? regionNames[
                              selectedSegment as keyof typeof regionNames
                            ] || selectedSegment
                          : selectedSegment}
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    빈도와 신뢰도 기준 상위 키워드 목록
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className='flex items-center justify-center py-8'>
                      <RefreshCw className='h-6 w-6 animate-spin' />
                    </div>
                  ) : (
                    <div className='max-h-96 space-y-2 overflow-y-auto'>
                      {keywords.map((keyword, index) => (
                        <div
                          key={`${keyword.keyword}-${index}`}
                          className='flex cursor-pointer items-center justify-between rounded p-2 hover:bg-gray-50'
                          onClick={() => setSearchKeyword(keyword.keyword)}
                        >
                          <div className='flex items-center gap-2'>
                            <Badge variant='outline'>{index + 1}</Badge>
                            <span className='font-medium'>
                              {keyword.keyword}
                            </span>
                          </div>
                          <div className='flex items-center gap-2'>
                            <span className='text-sm text-gray-500'>
                              {keyword.count}회
                            </span>
                            <Badge variant='secondary'>
                              {(keyword.confidence * 100).toFixed(0)}%
                            </Badge>
                          </div>
                        </div>
                      ))}
                      {keywords.length === 0 && !loading && (
                        <div className='py-8 text-center text-gray-500'>
                          키워드가 없습니다
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 키워드 관계 그래프 */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Network className='h-4 w-4' />
                    키워드 관계 그래프
                    {searchKeyword && (
                      <Badge variant='secondary'>{searchKeyword}</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    키워드 간의 관계를 시각화한 네트워크 그래프
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='flex h-96 w-full items-center justify-center rounded-lg border border-gray-200 bg-gray-50'>
                    {graphData && graphData.nodes.length > 0 ? (
                      <svg ref={svgRef} className='h-full w-full'>
                        {/* D3.js 그래프가 여기에 렌더링됩니다 */}
                      </svg>
                    ) : (
                      <div className='text-center text-gray-500'>
                        <Network className='mx-auto mb-2 h-12 w-12 opacity-50' />
                        <p>키워드를 선택하면 관계 그래프가 표시됩니다</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 관련 키워드 목록 */}
            {relatedKeywords.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Search className='h-4 w-4' />
                    관련 키워드
                    <Badge variant='outline'>{searchKeyword}</Badge>
                  </CardTitle>
                  <CardDescription>
                    PMI 알고리즘 기반으로 분석된 관련 키워드
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='flex flex-wrap gap-2'>
                    {relatedKeywords.map((related, index) => (
                      <Badge
                        key={index}
                        variant='outline'
                        className='cursor-pointer hover:bg-blue-50'
                        onClick={() =>
                          setSearchKeyword(related.related_keyword)
                        }
                      >
                        {related.related_keyword}
                        <span className='ml-1 text-xs opacity-70'>
                          {(related.strength * 100).toFixed(0)}%
                        </span>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* 메타데이터 */}
      {lastUpdated && (
        <div className='text-center text-xs text-gray-500'>
          마지막 업데이트: {new Date(lastUpdated).toLocaleString('ko-KR')}
        </div>
      )}
    </div>
  );
}
