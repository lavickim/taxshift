'use client';

import React, { useState } from 'react';

import { CheckCircle, Loader2, Play, TestTube, XCircle } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface TestResult {
  keyword: string;
  matched: boolean;
  confidence: number;
  extractedTags: string[];
  matchReason: string;
  processingTime: number;
}

interface TestSuite {
  id: string;
  name: string;
  testCases: {
    input: string;
    expectedKeywords: string[];
    expectedTags: string[];
  }[];
}

const PREDEFINED_TEST_SUITES: TestSuite[] = [
  {
    id: 'convenience-stores',
    name: '편의점 테스트',
    testCases: [
      {
        input: '세븐일레븐 강남점에서 커피 구매',
        expectedKeywords: ['세븐일레븐'],
        expectedTags: ['편의점', '음료'],
      },
      {
        input: 'CU편의점 야식 구매 2:30AM',
        expectedKeywords: ['CU'],
        expectedTags: ['편의점', '심야구매'],
      },
      {
        input: '이마트24 생필품 구매',
        expectedKeywords: ['이마트24'],
        expectedTags: ['편의점', '생필품'],
      },
    ],
  },
  {
    id: 'gas-stations',
    name: '주유소 테스트',
    testCases: [
      {
        input: 'GS칼텍스 주유소 휘발유 충전',
        expectedKeywords: ['GS칼텍스'],
        expectedTags: ['주유소', '연료'],
      },
      {
        input: 'SK에너지 셀프 주유',
        expectedKeywords: ['SK에너지'],
        expectedTags: ['주유소', '셀프'],
      },
    ],
  },
  {
    id: 'restaurants',
    name: '음식점 테스트',
    testCases: [
      {
        input: '맥도날드 빅맥세트 주문',
        expectedKeywords: ['맥도날드'],
        expectedTags: ['패스트푸드', '세트메뉴'],
      },
      {
        input: '스타벅스 아메리카노',
        expectedKeywords: ['스타벅스'],
        expectedTags: ['카페', '음료'],
      },
    ],
  },
];

const KeywordPatternTest: React.FC = () => {
  const [testInput, setTestInput] = useState('');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [batchTesting, setBatchTesting] = useState(false);
  const [selectedSuite, setSelectedSuite] = useState<TestSuite | null>(null);
  const [batchResults, setBatchResults] = useState<{
    suite: string;
    results: TestResult[];
    passed: number;
    failed: number;
  } | null>(null);

  const handleSingleTest = async () => {
    if (!testInput.trim()) {
      toast.error('테스트할 텍스트를 입력해주세요.');
      return;
    }

    setLoading(true);
    const startTime = Date.now();

    try {
      // Simulate keyword extraction and pattern matching
      const response = await fetch('/api/v2/tag-mapping-mgmt/recommend-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: testInput,
          transactionText: testInput,
          amount: 5000,
          timestamp: new Date().toISOString(),
        }),
      });

      const processingTime = Date.now() - startTime;

      if (response.ok) {
        const recommendations = await response.json();

        const results: TestResult[] = recommendations.map((rec: any) => ({
          keyword: rec.keywordGroup?.primaryKeyword || 'Unknown',
          matched: true,
          confidence: rec.finalConfidence * 100,
          extractedTags: [rec.tagMapping?.tag?.tagName || 'Unknown'],
          matchReason: rec.reason || 'Pattern match',
          processingTime,
        }));

        if (results.length === 0) {
          results.push({
            keyword: 'No Match',
            matched: false,
            confidence: 0,
            extractedTags: [],
            matchReason: 'No matching pattern found',
            processingTime,
          });
        }

        setTestResults(results);
        toast.success(
          `테스트 완료 - ${results.length}개 결과 (${processingTime}ms)`
        );
      } else {
        toast.error('테스트 API 호출 실패');
        setTestResults([
          {
            keyword: 'Error',
            matched: false,
            confidence: 0,
            extractedTags: [],
            matchReason: 'API call failed',
            processingTime,
          },
        ]);
      }
    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.error('Test error:', error);
      toast.error('테스트 중 오류가 발생했습니다.');
      setTestResults([
        {
          keyword: 'Error',
          matched: false,
          confidence: 0,
          extractedTags: [],
          matchReason: 'Network or system error',
          processingTime,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchTest = async (suite: TestSuite) => {
    setBatchTesting(true);
    setSelectedSuite(suite);

    const results: TestResult[] = [];
    let passed = 0;
    let failed = 0;

    try {
      for (const testCase of suite.testCases) {
        const startTime = Date.now();

        try {
          const response = await fetch(
            '/api/v2/tag-mapping-mgmt/recommend-tags',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                keyword: testCase.input,
                transactionText: testCase.input,
                amount: 5000,
                timestamp: new Date().toISOString(),
              }),
            }
          );

          const processingTime = Date.now() - startTime;

          if (response.ok) {
            const recommendations = await response.json();

            if (recommendations.length > 0) {
              const result: TestResult = {
                keyword:
                  recommendations[0].keywordGroup?.primaryKeyword || 'Unknown',
                matched: true,
                confidence: recommendations[0].finalConfidence * 100,
                extractedTags: [
                  recommendations[0].tagMapping?.tag?.tagName || 'Unknown',
                ],
                matchReason: recommendations[0].reason || 'Pattern match',
                processingTime,
              };

              // Simple validation: check if expected keyword is found
              const expectedFound = testCase.expectedKeywords.some(expected =>
                result.keyword.toLowerCase().includes(expected.toLowerCase())
              );

              if (expectedFound) {
                passed++;
              } else {
                failed++;
              }

              results.push(result);
            } else {
              failed++;
              results.push({
                keyword: 'No Match',
                matched: false,
                confidence: 0,
                extractedTags: [],
                matchReason: 'No matching pattern found',
                processingTime,
              });
            }
          } else {
            failed++;
            results.push({
              keyword: 'Error',
              matched: false,
              confidence: 0,
              extractedTags: [],
              matchReason: 'API call failed',
              processingTime,
            });
          }
        } catch (error) {
          failed++;
          results.push({
            keyword: 'Error',
            matched: false,
            confidence: 0,
            extractedTags: [],
            matchReason: 'Test execution error',
            processingTime: Date.now() - startTime,
          });
        }
      }

      setBatchResults({
        suite: suite.name,
        results,
        passed,
        failed,
      });

      toast.success(`배치 테스트 완료 - 통과: ${passed}, 실패: ${failed}`);
    } catch (error) {
      console.error('Batch test error:', error);
      toast.error('배치 테스트 중 오류가 발생했습니다.');
    } finally {
      setBatchTesting(false);
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h2 className='text-3xl font-bold tracking-tight'>
          키워드 패턴 테스트
        </h2>
        <p className='text-muted-foreground'>
          키워드 추출 엔진과 패턴 매칭의 정확성을 검증합니다.
        </p>
      </div>

      {/* Single Test */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <TestTube className='h-5 w-5' />
            단일 테스트
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='testInput'>테스트 텍스트</Label>
            <Textarea
              id='testInput'
              placeholder='예: 세븐일레븐에서 커피 구매, GS칼텍스 주유소 휘발유 충전'
              value={testInput}
              onChange={e => setTestInput(e.target.value)}
              rows={3}
            />
          </div>
          <Button
            onClick={handleSingleTest}
            disabled={loading}
            className='w-full'
          >
            {loading ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : (
              <Play className='mr-2 h-4 w-4' />
            )}
            테스트 실행
          </Button>

          {/* Single Test Results */}
          {testResults.length > 0 && (
            <div className='mt-4 space-y-3'>
              <h4 className='font-semibold'>테스트 결과:</h4>
              {testResults.map((result, index) => (
                <div key={index} className='space-y-2 rounded-lg border p-3'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      {result.matched ? (
                        <CheckCircle className='h-4 w-4 text-green-500' />
                      ) : (
                        <XCircle className='h-4 w-4 text-red-500' />
                      )}
                      <span className='font-medium'>{result.keyword}</span>
                    </div>
                    <Badge variant={result.matched ? 'default' : 'secondary'}>
                      {result.confidence.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className='text-sm text-muted-foreground'>
                    <p>태그: {result.extractedTags.join(', ') || '없음'}</p>
                    <p>이유: {result.matchReason}</p>
                    <p>처리 시간: {result.processingTime}ms</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Batch Tests */}
      <Card>
        <CardHeader>
          <CardTitle>배치 테스트 스위트</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            {PREDEFINED_TEST_SUITES.map(suite => (
              <Card
                key={suite.id}
                className='cursor-pointer transition-shadow hover:shadow-md'
              >
                <CardHeader>
                  <CardTitle className='text-lg'>{suite.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='mb-3 text-sm text-muted-foreground'>
                    {suite.testCases.length}개 테스트 케이스
                  </p>
                  <Button
                    onClick={() => handleBatchTest(suite)}
                    disabled={batchTesting}
                    className='w-full'
                    variant='outline'
                  >
                    {batchTesting && selectedSuite?.id === suite.id ? (
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    ) : (
                      <Play className='mr-2 h-4 w-4' />
                    )}
                    테스트 실행
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Batch Test Results */}
          {batchResults && (
            <div className='mt-6 space-y-4'>
              <div className='flex items-center justify-between'>
                <h4 className='text-lg font-semibold'>
                  {batchResults.suite} 결과
                </h4>
                <div className='flex gap-2'>
                  <Badge variant='default'>{batchResults.passed}개 통과</Badge>
                  <Badge variant='destructive'>
                    {batchResults.failed}개 실패
                  </Badge>
                </div>
              </div>

              <div className='space-y-2'>
                {batchResults.results.map((result, index) => (
                  <div key={index} className='rounded-lg border p-3'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        {result.matched ? (
                          <CheckCircle className='h-4 w-4 text-green-500' />
                        ) : (
                          <XCircle className='h-4 w-4 text-red-500' />
                        )}
                        <span className='font-medium'>{result.keyword}</span>
                      </div>
                      <Badge variant={result.matched ? 'default' : 'secondary'}>
                        {result.confidence.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className='mt-1 text-sm text-muted-foreground'>
                      <p>처리 시간: {result.processingTime}ms</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default KeywordPatternTest;
