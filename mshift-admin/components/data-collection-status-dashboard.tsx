'use client';

import { useEffect, useState } from 'react';

import {
  AlertTriangle,
  BarChart3,
  Database,
  Gauge,
  TrendingUp,
  Zap,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DataStats {
  total: number;
  utilized: number;
  percentage: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
}

interface AccuracyScenario {
  phase: string;
  description: string;
  target: string;
  requirements: {
    nationalPension: string;
    jsonPatterns: string;
    regexRules: string;
    tags: string;
  };
  expectedAccuracy: string;
  timeline: string;
}

export function DataCollectionStatusDashboard() {
  const [dataStats, setDataStats] = useState<{
    nationalPension: DataStats;
    jsonPatterns: DataStats;
    regexRules: DataStats;
    tags: DataStats;
  }>({
    nationalPension: {
      total: 542366,
      utilized: 5,
      percentage: 0.001,
      quality: 'poor',
    },
    jsonPatterns: {
      total: 588,
      utilized: 390,
      percentage: 66.3,
      quality: 'fair',
    },
    regexRules: {
      total: 9,
      utilized: 9,
      percentage: 100,
      quality: 'poor',
    },
    tags: {
      total: 6,
      utilized: 6,
      percentage: 100,
      quality: 'poor',
    },
  });

  const [currentAccuracy, setCurrentAccuracy] = useState(55);

  const accuracyScenarios: AccuracyScenario[] = [
    {
      phase: '현재 상황',
      description: '기본 시스템',
      target: '50-60%',
      requirements: {
        nationalPension: '0.001% (5건)',
        jsonPatterns: '588개 (음식점 위주)',
        regexRules: '9개 (기본 패턴)',
        tags: '6개 (최소 구성)',
      },
      expectedAccuracy: '50-60%',
      timeline: '현재',
    },
    {
      phase: 'Phase 1',
      description: '단기 개선',
      target: '60-75%',
      requirements: {
        nationalPension: '50% (27만건)',
        jsonPatterns: '2,000개 (업종 확장)',
        regexRules: '100개 (주요 업종)',
        tags: '50개 (계정 연동)',
      },
      expectedAccuracy: '70-75%',
      timeline: '1-2개월',
    },
    {
      phase: 'Phase 2',
      description: '중기 확장',
      target: '75-90%',
      requirements: {
        nationalPension: '80% (43만건)',
        jsonPatterns: '5,000개 (전업종)',
        regexRules: '300개 (세분화)',
        tags: '100개 (상세 분류)',
      },
      expectedAccuracy: '85-90%',
      timeline: '3-6개월',
    },
    {
      phase: '목표 달성',
      description: '완전 시스템',
      target: '95%+',
      requirements: {
        nationalPension: '95% (51만건)',
        jsonPatterns: '10,000개 (실시간)',
        regexRules: '500개 (ML 지원)',
        tags: '200개 (완전 매핑)',
      },
      expectedAccuracy: '95%+',
      timeline: '6-12개월',
    },
  ];

  const missingDataAreas = [
    {
      category: '은행/카드 실제 거래 데이터',
      current: '8건 샘플',
      required: '10,000건+',
      impact: 'Critical',
      priority: 'High',
    },
    {
      category: '중소기업 거래 패턴',
      current: '대기업 위주',
      required: '중소기업 특화',
      impact: 'High',
      priority: 'High',
    },
    {
      category: 'B2B 거래 패턴',
      current: 'B2C 위주',
      required: '기업간 거래',
      impact: 'Medium',
      priority: 'Medium',
    },
    {
      category: '지역별 상호명',
      current: '서울/경기 위주',
      required: '전국 17개 시도',
      impact: 'Medium',
      priority: 'Medium',
    },
    {
      category: '온라인/모바일 결제',
      current: '일부 해외서비스',
      required: '앱 결제 전반',
      impact: 'High',
      priority: 'Medium',
    },
  ];

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent':
        return 'bg-green-500';
      case 'good':
        return 'bg-blue-500';
      case 'fair':
        return 'bg-yellow-500';
      case 'poor':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getQualityBadge = (quality: string) => {
    switch (quality) {
      case 'excellent':
        return 'bg-green-100 text-green-800';
      case 'good':
        return 'bg-blue-100 text-blue-800';
      case 'fair':
        return 'bg-yellow-100 text-yellow-800';
      case 'poor':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'Critical':
        return 'bg-red-100 text-red-800';
      case 'High':
        return 'bg-orange-100 text-orange-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* 현재 정확도 상태 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            현재 시스템 정확도
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">현재 추정 정확도</span>
              <span className="text-2xl font-bold">{currentAccuracy}%</span>
            </div>
            <Progress value={currentAccuracy} className="w-full" />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">목표: </span>
                <span className="font-semibold">95%</span>
              </div>
              <div>
                <span className="text-muted-foreground">차이: </span>
                <span className="font-semibold text-red-600">-40%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">데이터 현황</TabsTrigger>
          <TabsTrigger value="roadmap">달성 로드맵</TabsTrigger>
          <TabsTrigger value="gaps">부족 영역</TabsTrigger>
          <TabsTrigger value="strategy">수집 전략</TabsTrigger>
        </TabsList>

        {/* 데이터 현황 탭 */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 국민연금 데이터 */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  국민연금 데이터
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">
                    {dataStats.nationalPension.total.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    활용: {dataStats.nationalPension.utilized}건 (
                    {dataStats.nationalPension.percentage}%)
                  </div>
                  <Progress value={dataStats.nationalPension.percentage} />
                  <Badge className={getQualityBadge(dataStats.nationalPension.quality)}>
                    {dataStats.nationalPension.quality}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* JSON 패턴 */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  JSON 패턴
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">
                    {dataStats.jsonPatterns.total}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    활용: {dataStats.jsonPatterns.utilized}개 (
                    {dataStats.jsonPatterns.percentage}%)
                  </div>
                  <Progress value={dataStats.jsonPatterns.percentage} />
                  <Badge className={getQualityBadge(dataStats.jsonPatterns.quality)}>
                    {dataStats.jsonPatterns.quality}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* 정규식 규칙 */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  정규식 규칙
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{dataStats.regexRules.total}</div>
                  <div className="text-xs text-muted-foreground">
                    활용: {dataStats.regexRules.utilized}개 (
                    {dataStats.regexRules.percentage}%)
                  </div>
                  <Progress value={dataStats.regexRules.percentage} />
                  <Badge className={getQualityBadge(dataStats.regexRules.quality)}>
                    {dataStats.regexRules.quality}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* 태그 시스템 */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  태그 시스템
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{dataStats.tags.total}</div>
                  <div className="text-xs text-muted-foreground">
                    활용: {dataStats.tags.utilized}개 ({dataStats.tags.percentage}%)
                  </div>
                  <Progress value={dataStats.tags.percentage} />
                  <Badge className={getQualityBadge(dataStats.tags.quality)}>
                    {dataStats.tags.quality}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 달성 로드맵 탭 */}
        <TabsContent value="roadmap" className="space-y-4">
          <div className="grid gap-4">
            {accuracyScenarios.map((scenario, index) => (
              <Card key={scenario.phase} className={index === 0 ? 'border-blue-300' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{scenario.phase}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{scenario.timeline}</Badge>
                      <Badge
                        className={
                          index === 0
                            ? 'bg-blue-100 text-blue-800'
                            : index === 3
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }
                      >
                        {scenario.expectedAccuracy}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{scenario.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">
                        국민연금
                      </span>
                      <p className="text-sm">{scenario.requirements.nationalPension}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">
                        JSON 패턴
                      </span>
                      <p className="text-sm">{scenario.requirements.jsonPatterns}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">
                        정규식 규칙
                      </span>
                      <p className="text-sm">{scenario.requirements.regexRules}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">태그</span>
                      <p className="text-sm">{scenario.requirements.tags}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 부족 영역 탭 */}
        <TabsContent value="gaps" className="space-y-4">
          <div className="space-y-4">
            {missingDataAreas.map((area, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{area.category}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={getImpactColor(area.impact)}>
                        {area.impact}
                      </Badge>
                      <Badge className={getPriorityColor(area.priority)}>
                        {area.priority}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">
                        현재 상태
                      </span>
                      <p className="text-sm">{area.current}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">
                        필요 수준
                      </span>
                      <p className="text-sm">{area.required}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 수집 전략 탭 */}
        <TabsContent value="strategy" className="space-y-4">
          <div className="grid gap-6">
            {/* 단기 전략 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  단기 전략 (1-2개월)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium">국민연금 키워드 추출 완료</h4>
                      <p className="text-sm text-muted-foreground">
                        54만건 → 27만건 (50%) 키워드 추출 및 분류
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium">은행 거래 데이터 수집</h4>
                      <p className="text-sm text-muted-foreground">
                        8건 → 1,000건 실제 거래 패턴 수집
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium">JSON 패턴 확장</h4>
                      <p className="text-sm text-muted-foreground">
                        588개 → 2,000개 (기존 업종 세분화)
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 중기 전략 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  중기 전략 (3-6개월)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium">카드사 데이터 연동</h4>
                      <p className="text-sm text-muted-foreground">
                        5개 주요 카드사 거래 패턴 API 연동
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium">지역별 상호명 DB 구축</h4>
                      <p className="text-sm text-muted-foreground">
                        17개 시도별 특화 패턴 수집
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium">온라인 결제 패턴</h4>
                      <p className="text-sm text-muted-foreground">
                        해외 서비스, 앱 결제 등 신규 패턴
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 장기 전략 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-500" />
                  장기 전략 (6-12개월)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium">실시간 패턴 학습</h4>
                      <p className="text-sm text-muted-foreground">
                        ML 기반 자동 패턴 생성 시스템
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium">사용자 피드백 시스템</h4>
                      <p className="text-sm text-muted-foreground">
                        수동 분류 → 자동 학습 피드백 루프
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium">완전 API 연동</h4>
                      <p className="text-sm text-muted-foreground">
                        은행, 카드사, 간편결제 실시간 연동
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}