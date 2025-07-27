'use client';

import React, { useState } from 'react';

import { BarChart3, Building, TestTube, Zap, Database, Clock, Target } from 'lucide-react';

import BrandTestManagement from '@/components/brand-test-management';
// 기존 컴포넌트들 임포트
import { KeywordRuleTest } from '@/components/keyword-rule-test';
import { TransactionTestDataManagement } from '@/components/transaction-test-data-management';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function TestAndRuleExpansion() {
  const [activeTab, setActiveTab] = useState('test-data-management');

  return (
    <div className='space-y-6'>
      {/* 헤더 섹션 */}
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>거래 테스트 시스템</h1>
        <p className='mt-2 text-muted-foreground'>
          1000개 테스트 데이터 관리 및 파이프라인 테스트 실행을 위한 통합 관리 도구
        </p>
      </div>

      {/* 개요 통계 카드들 */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              테스트 데이터 관리
            </CardTitle>
            <Database className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-blue-600'>1000개</div>
            <Badge variant='secondary' className='mt-2'>
              <Database className='mr-1 h-3 w-3' />
              완전한 CRUD 시스템
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>파이프라인 테스트</CardTitle>
            <Zap className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>3단계</div>
            <Badge variant='secondary' className='mt-2'>
              <Zap className='mr-1 h-3 w-3' />
              정규식→키워드→복식부기
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>배치 실행</CardTitle>
            <Clock className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-purple-600'>실시간</div>
            <Badge variant='default' className='mt-2'>
              진행률 모니터링
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>성능 분석</CardTitle>
            <Target className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-emerald-600'>95%</div>
            <Badge variant='default' className='mt-2'>
              ↗️ 목표 성공률
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* 메인 탭 컨텐츠 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger
            value='test-data-management'
            className='flex items-center gap-2'
          >
            <Database className='h-4 w-4' />
            테스트 데이터 관리
          </TabsTrigger>
          <TabsTrigger
            value='transaction-test'
            className='flex items-center gap-2'
          >
            <TestTube className='h-4 w-4' />
            거래문자열 테스트
          </TabsTrigger>
          <TabsTrigger value='brand-test' className='flex items-center gap-2'>
            <Building className='h-4 w-4' />
            브랜드 테스트
          </TabsTrigger>
        </TabsList>

        <TabsContent value='test-data-management' className='mt-6'>
          <TransactionTestDataManagement />
        </TabsContent>

        <TabsContent value='transaction-test' className='mt-6 space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <TestTube className='h-5 w-5' />
                거래문자열 실시간 테스트
              </CardTitle>
              <p className='text-sm text-muted-foreground'>
                거래 문자열을 입력하여 키워드 기반 분류 시스템을 실시간으로
                테스트합니다. 새로운 패턴을 발견하면 자동으로 룰 확장을
                제안합니다.
              </p>
            </CardHeader>
            <CardContent>
              <KeywordRuleTest />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='brand-test' className='mt-6 space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Building className='h-5 w-5' />
                브랜드 대량 테스트 및 룰 확장
              </CardTitle>
              <p className='text-sm text-muted-foreground'>
                11,418개 프랜차이즈 브랜드를 대상으로 분류 성능을 테스트하고,
                실패한 브랜드를 분석하여 새로운 키워드 룰을 자동 생성합니다.
              </p>
            </CardHeader>
            <CardContent>
              <BrandTestManagement />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 하단 도움말 섹션 */}
      <Card className='bg-muted/50'>
        <CardHeader>
          <CardTitle className='text-lg'>💡 사용 가이드</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            <div>
              <h4 className='mb-2 flex items-center gap-2 font-semibold'>
                <Database className='h-4 w-4' />
                테스트 데이터 관리
              </h4>
              <ul className='space-y-1 text-sm text-muted-foreground'>
                <li>• 1000개 테스트 데이터 완전 관리</li>
                <li>• 페이지네이션, 검색, 필터링</li>
                <li>• 엑셀 업로드/다운로드 지원</li>
                <li>• 배치 테스트 실행 및 모니터링</li>
                <li>• 실시간 통계 및 성능 분석</li>
              </ul>
            </div>
            <div>
              <h4 className='mb-2 flex items-center gap-2 font-semibold'>
                <TestTube className='h-4 w-4' />
                거래문자열 테스트
              </h4>
              <ul className='space-y-1 text-sm text-muted-foreground'>
                <li>• 개별 거래문자열을 즉시 테스트</li>
                <li>• 분류 결과와 신뢰도 확인</li>
                <li>• 새로운 패턴 발견시 룰 추가 제안</li>
                <li>• 실시간 키워드 엔진 성능 검증</li>
              </ul>
            </div>
            <div>
              <h4 className='mb-2 flex items-center gap-2 font-semibold'>
                <Building className='h-4 w-4' />
                브랜드 테스트
              </h4>
              <ul className='space-y-1 text-sm text-muted-foreground'>
                <li>• 전체 브랜드 일괄 성능 테스트</li>
                <li>• 필터링 및 성공률 분석</li>
                <li>• 실패 브랜드 기반 자동 룰 확장</li>
                <li>• 프롬프트 기반 정교한 키워드 생성</li>
              </ul>
            </div>
          </div>

          <div className='border-t pt-4'>
            <h4 className='mb-2 font-semibold'>🚀 최신 기능 (v1.0)</h4>
            <div className='flex flex-wrap gap-2'>
              <Badge variant='outline'>1000개 테스트 데이터 관리</Badge>
              <Badge variant='outline'>18개 REST API 완전 연동</Badge>
              <Badge variant='outline'>파이프라인 테스트 실행</Badge>
              <Badge variant='outline'>실시간 배치 모니터링</Badge>
              <Badge variant='outline'>엑셀 업로드/다운로드</Badge>
              <Badge variant='outline'>성능 분석 대시보드</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
