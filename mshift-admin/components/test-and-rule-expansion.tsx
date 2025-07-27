'use client';

import React, { useState } from 'react';

import { BarChart3, Building, TestTube, Zap } from 'lucide-react';

import BrandTestManagement from '@/components/brand-test-management';
// 기존 컴포넌트들 임포트
import { KeywordRuleTest } from '@/components/keyword-rule-test';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function TestAndRuleExpansion() {
  const [activeTab, setActiveTab] = useState('transaction-test');

  return (
    <div className='space-y-6'>
      {/* 헤더 섹션 */}
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>테스트 및 룰확장</h1>
        <p className='mt-2 text-muted-foreground'>
          키워드 분류 시스템 테스트 및 룰 확장을 위한 통합 관리 도구
        </p>
      </div>

      {/* 개요 통계 카드들 */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              거래문자열 테스트
            </CardTitle>
            <TestTube className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-blue-600'>실시간</div>
            <Badge variant='secondary' className='mt-2'>
              <Zap className='mr-1 h-3 w-3' />
              즉시 분류 테스트
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>브랜드 테스트</CardTitle>
            <Building className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>11,418개</div>
            <Badge variant='secondary' className='mt-2'>
              <BarChart3 className='mr-1 h-3 w-3' />
              프랜차이즈 브랜드
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>키워드 그룹</CardTitle>
            <Zap className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-purple-600'>80개</div>
            <Badge variant='default' className='mt-2'>
              최근 강화됨
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>분류 성공률</CardTitle>
            <BarChart3 className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-emerald-600'>89%</div>
            <Badge variant='default' className='mt-2'>
              ↗️ 741% 개선
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* 메인 탭 컨텐츠 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <TabsList className='grid w-full grid-cols-2'>
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
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
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
            <h4 className='mb-2 font-semibold'>🚀 최근 개선 사항</h4>
            <div className='flex flex-wrap gap-2'>
              <Badge variant='outline'>15개 키워드 그룹 추가</Badge>
              <Badge variant='outline'>8개 신규 태그 생성</Badge>
              <Badge variant='outline'>100% 테스트 성공률 달성</Badge>
              <Badge variant='outline'>Java API 완전 연동</Badge>
              <Badge variant='outline'>프롬프트 기반 룰 생성</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
