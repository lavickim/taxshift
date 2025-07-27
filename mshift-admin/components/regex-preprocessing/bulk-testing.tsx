'use client';

import React, { useState } from 'react';

import {
  AlertCircle,
  BarChart3,
  CheckCircle,
  Clock,
  Download,
  Play,
  TestTube2,
  // Upload,
  // Zap,
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
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

interface BulkTestResult {
  totalTests: number;
  successCount: number;
  failureCount: number;
  averageProcessingTime: number;
  results: ProcessingResult[];
  performanceStats: PerformanceStats;
}

interface ProcessingResult {
  originalText: string;
  normalizedText: string;
  appliedRuleId?: number;
  appliedRuleName?: string;
  extractedMetadata?: Record<string, any>;
  processingTimeMs: number;
  success: boolean;
  errorMessage?: string;
}

interface PerformanceStats {
  totalRules: number;
  activeRules: number;
  processingAccuracy: number;
  averageProcessingTime: number;
  cacheHitRate: number;
  dailyProcessingCount: number;
  errorRate: number;
  topCategories: CategoryStats[];
}

interface CategoryStats {
  category: string;
  ruleCount: number;
  usageCount: number;
  averageSuccessRate: number;
  avgProcessingTime: number;
}

export function RegexBulkTesting() {
  const [testInput, setTestInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [testResults, setTestResults] = useState<BulkTestResult | null>(null);
  const [currentTest, setCurrentTest] = useState<string>('');

  // 샘플 거래 데이터
  const sampleData = `주식회사 삼성전자 반도체 구매
(주)네이버 광고비 결제
GS칼텍스 강남(상)주 -80000
스타벅스 강남역점 커피 구매
이마트 에브리데이 생필품
NETFLIX COM BILL MONTHLY
CLAUDE.AI SUBSCRIPTION SAN FRANCISCO USA
(유)부자마트 식료품 구매
현대오일뱅크 서울(하)주 주유비
국민연금관리공단 보험료 납부`;

  const loadSampleData = () => {
    setTestInput(sampleData);
  };

  const runBulkTest = async () => {
    if (!testInput.trim()) {
      alert('테스트할 데이터를 입력해주세요.');
      return;
    }

    setIsRunning(true);
    setProgress(0);
    setTestResults(null);

    try {
      const lines = testInput.split('\n').filter(line => line.trim());

      if (lines.length === 0) {
        alert('유효한 테스트 데이터가 없습니다.');
        return;
      }

      // API 호출
      const response = await fetch('/api/regex-preprocessing/preprocess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ texts: lines }),
      });

      const result = await response.json();

      if (result.success) {
        // 결과를 BulkTestResult 형식으로 변환
        const bulkResult: BulkTestResult = {
          totalTests: result.data.summary.total,
          successCount: result.data.summary.successful,
          failureCount: result.data.summary.failed,
          averageProcessingTime: result.data.summary.averageProcessingTime,
          results: result.data.results,
          performanceStats: {
            totalRules: 0, // 실제 API에서 가져와야 함
            activeRules: 0,
            processingAccuracy: result.data.summary.successRate,
            averageProcessingTime: result.data.summary.averageProcessingTime,
            cacheHitRate: 0,
            dailyProcessingCount: 0,
            errorRate: 100 - result.data.summary.successRate,
            topCategories: [],
          },
        };

        setTestResults(bulkResult);
        setProgress(100);
      } else {
        alert(`테스트 실패: ${result.error}`);
      }
    } catch (error) {
      console.error('Bulk test failed:', error);
      alert('대량 테스트 중 오류가 발생했습니다.');
    } finally {
      setIsRunning(false);
      setCurrentTest('');
    }
  };

  const exportResults = () => {
    if (!testResults) return;

    const csv = [
      [
        '원본 텍스트',
        '정규화된 텍스트',
        '적용된 규칙',
        '처리 시간(ms)',
        '성공 여부',
        '오류 메시지',
      ],
      ...testResults.results.map(result => [
        result.originalText,
        result.normalizedText,
        result.appliedRuleName || '없음',
        result.processingTimeMs.toString(),
        result.success ? '성공' : '실패',
        result.errorMessage || '',
      ]),
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `regex-bulk-test-results-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const successRate = testResults
    ? (testResults.successCount / testResults.totalTests) * 100
    : 0;

  return (
    <div className='space-y-6'>
      {/* 테스트 입력 */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <TestTube2 className='h-5 w-5' />
            대량 테스트 및 성능 분석
          </CardTitle>
          <CardDescription>
            여러 거래 문자열을 한 번에 테스트하고 성능을 분석합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <div className='mb-2 flex items-center justify-between'>
              <label className='text-sm font-medium'>
                테스트 데이터 (한 줄에 하나씩)
              </label>
              <Button variant='outline' size='sm' onClick={loadSampleData}>
                샘플 데이터 로드
              </Button>
            </div>
            <Textarea
              value={testInput}
              onChange={e => setTestInput(e.target.value)}
              placeholder='테스트할 거래 문자열들을 한 줄에 하나씩 입력하세요...'
              rows={10}
              className='font-mono text-sm'
            />
            <p className='mt-1 text-xs text-gray-500'>
              총 {testInput.split('\n').filter(line => line.trim()).length}개
              테스트 케이스
            </p>
          </div>

          <div className='flex gap-2'>
            <Button
              onClick={runBulkTest}
              disabled={isRunning}
              className='flex-1'
            >
              {isRunning ? (
                <Clock className='mr-2 h-4 w-4 animate-spin' />
              ) : (
                <Play className='mr-2 h-4 w-4' />
              )}
              {isRunning ? '테스트 실행 중...' : '대량 테스트 실행'}
            </Button>
          </div>

          {/* 진행 상황 */}
          {isRunning && (
            <div className='space-y-2'>
              <Progress value={progress} className='w-full' />
              <div className='text-center text-sm text-gray-600'>
                {currentTest && `현재 처리 중: ${currentTest}`}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 테스트 결과 */}
      {testResults && (
        <>
          {/* 요약 통계 */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <BarChart3 className='h-5 w-5' />
                  테스트 결과 요약
                </div>
                <Button variant='outline' size='sm' onClick={exportResults}>
                  <Download className='mr-2 h-4 w-4' />
                  CSV 다운로드
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
                <div className='rounded-lg border p-4 text-center'>
                  <div className='text-2xl font-bold text-blue-600'>
                    {testResults.totalTests}
                  </div>
                  <div className='text-sm text-gray-600'>총 테스트</div>
                </div>
                <div className='rounded-lg border p-4 text-center'>
                  <div className='text-2xl font-bold text-green-600'>
                    {testResults.successCount}
                  </div>
                  <div className='text-sm text-gray-600'>성공</div>
                </div>
                <div className='rounded-lg border p-4 text-center'>
                  <div className='text-2xl font-bold text-red-600'>
                    {testResults.failureCount}
                  </div>
                  <div className='text-sm text-gray-600'>실패</div>
                </div>
                <div className='rounded-lg border p-4 text-center'>
                  <div className='text-2xl font-bold text-purple-600'>
                    {testResults.averageProcessingTime.toFixed(1)}ms
                  </div>
                  <div className='text-sm text-gray-600'>평균 처리시간</div>
                </div>
              </div>

              <Separator className='my-4' />

              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <span className='text-sm font-medium'>전체 성공률:</span>
                  <Badge
                    variant={successRate >= 80 ? 'default' : 'destructive'}
                  >
                    {successRate.toFixed(1)}%
                  </Badge>
                </div>
                <div className='text-sm text-gray-600'>
                  총 처리시간:{' '}
                  {testResults.results
                    .reduce((sum, r) => sum + r.processingTimeMs, 0)
                    .toFixed(0)}
                  ms
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 상세 결과 */}
          <Card>
            <CardHeader>
              <CardTitle>상세 테스트 결과</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                {testResults.results.map((result, index) => (
                  <div
                    key={index}
                    className={`rounded-lg border p-3 ${
                      result.success
                        ? 'border-green-200 bg-green-50'
                        : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className='mb-2 flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        {result.success ? (
                          <CheckCircle className='h-4 w-4 text-green-600' />
                        ) : (
                          <AlertCircle className='h-4 w-4 text-red-600' />
                        )}
                        <span className='font-mono text-sm font-medium'>
                          {result.originalText}
                        </span>
                      </div>
                      <div className='flex items-center gap-2'>
                        {result.appliedRuleName && (
                          <Badge variant='outline' className='text-xs'>
                            {result.appliedRuleName}
                          </Badge>
                        )}
                        <Badge variant='outline' className='text-xs'>
                          {result.processingTimeMs}ms
                        </Badge>
                      </div>
                    </div>

                    <div className='text-sm'>
                      {result.success ? (
                        <div className='space-y-1'>
                          <div>
                            <span className='text-gray-600'>정규화 결과:</span>
                            <span className='ml-2 font-mono text-green-700'>
                              {result.normalizedText}
                            </span>
                          </div>
                          {result.extractedMetadata &&
                            Object.keys(result.extractedMetadata).length >
                              0 && (
                              <div className='text-xs text-gray-500'>
                                메타데이터:{' '}
                                {JSON.stringify(
                                  result.extractedMetadata,
                                  null,
                                  0
                                )}
                              </div>
                            )}
                        </div>
                      ) : (
                        <div className='text-red-600'>
                          오류: {result.errorMessage}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
