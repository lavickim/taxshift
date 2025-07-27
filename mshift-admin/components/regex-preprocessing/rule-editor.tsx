'use client';

import React, { useEffect, useState } from 'react';

import {
  AlertCircle,
  CheckCircle,
  Clock,
  Play,
  Plus,
  Save,
  TestTube,
  Trash2,
  Zap,
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
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

interface TestCase {
  id: string;
  input: string;
  expected: string;
  actual?: string;
  success?: boolean;
  processingTime?: number;
  description?: string;
}

interface RuleTestResult {
  ruleId: number;
  ruleName: string;
  testResults: TestCaseResult[];
  successRate: number;
}

interface TestCaseResult {
  input: string;
  output?: string;
  expected?: string;
  metadata?: Record<string, any>;
  processingTime: number;
  success: boolean;
  errorMessage?: string;
}

interface RegexRule {
  id?: number;
  ruleName: string;
  description?: string;
  category: string;
  inputPattern: string;
  outputTemplate: string;
  priority: number;
  isActive: boolean;
  metadataTags?: Record<string, any>;
  testCases?: TestCase[];
}

export function RegexRuleEditor() {
  const [rule, setRule] = useState<RegexRule>({
    ruleName: '',
    description: '',
    category: '법인구조',
    inputPattern: '',
    outputTemplate: '',
    priority: 100,
    isActive: true,
    metadataTags: {},
    testCases: [],
  });

  const [newTestInput, setNewTestInput] = useState('');
  const [newTestExpected, setNewTestExpected] = useState('');
  const [testResults, setTestResults] = useState<TestCaseResult[]>([]);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [patternValidation, setPatternValidation] = useState<{
    valid: boolean;
    error?: string;
    complexity?: number;
  }>({ valid: true });

  // 정규식 패턴 실시간 검증
  useEffect(() => {
    if (!rule.inputPattern) {
      setPatternValidation({ valid: true });
      return;
    }

    try {
      new RegExp(rule.inputPattern);

      // 복잡도 계산 (간단한 휴리스틱)
      const complexity = calculatePatternComplexity(rule.inputPattern);

      setPatternValidation({
        valid: true,
        complexity,
      });
    } catch (error) {
      setPatternValidation({
        valid: false,
        error: error instanceof Error ? error.message : 'Invalid pattern',
      });
    }
  }, [rule.inputPattern]);

  const calculatePatternComplexity = (pattern: string): number => {
    let complexity = 0;
    complexity += (pattern.match(/\*/g)?.length || 0) * 2;
    complexity += (pattern.match(/\+/g)?.length || 0) * 2;
    complexity += (pattern.match(/\{/g)?.length || 0) * 3;
    complexity += (pattern.match(/\[/g)?.length || 0) * 1;
    complexity += (pattern.match(/\(/g)?.length || 0) * 1;
    return Math.min(complexity, 100);
  };

  const addTestCase = () => {
    if (!newTestInput.trim()) return;

    const newTest: TestCase = {
      id: Date.now().toString(),
      input: newTestInput.trim(),
      expected: newTestExpected.trim(),
      description: '',
    };

    setRule(prev => ({
      ...prev,
      testCases: [...(prev.testCases || []), newTest],
    }));

    setNewTestInput('');
    setNewTestExpected('');
  };

  const removeTestCase = (id: string) => {
    setRule(prev => ({
      ...prev,
      testCases: prev.testCases?.filter(test => test.id !== id) || [],
    }));
  };

  const runRealtimeTest = async () => {
    if (!rule.inputPattern || !rule.outputTemplate) {
      alert('입력 패턴과 출력 템플릿을 먼저 설정해주세요.');
      return;
    }

    setIsRunningTest(true);

    try {
      // 현재 테스트 케이스들로 실시간 테스트 실행
      const testInputs = rule.testCases?.map(tc => tc.input) || [];

      if (testInputs.length === 0) {
        alert('테스트할 입력이 없습니다. 테스트 케이스를 추가해주세요.');
        return;
      }

      // 임시 규칙으로 테스트 (API에 저장하지 않고)
      const results: TestCaseResult[] = [];

      for (const input of testInputs) {
        const startTime = Date.now();

        try {
          const regex = new RegExp(rule.inputPattern, 'gi');
          const match = regex.exec(input);

          if (match) {
            // 출력 템플릿 적용
            let output = rule.outputTemplate;
            for (let i = 1; i < match.length; i++) {
              output = output.replace(
                new RegExp(`\\$${i}`, 'g'),
                match[i] || ''
              );
            }
            output = output.trim();

            const expectedOutput = rule.testCases?.find(
              tc => tc.input === input
            )?.expected;
            const isSuccess = !expectedOutput || output === expectedOutput;

            results.push({
              input,
              output,
              expected: expectedOutput,
              metadata: {
                matchedGroups: match.slice(1),
                fullMatch: match[0],
              },
              processingTime: Date.now() - startTime,
              success: isSuccess,
              errorMessage: isSuccess
                ? undefined
                : `Expected "${expectedOutput}", got "${output}"`,
            });
          } else {
            results.push({
              input,
              processingTime: Date.now() - startTime,
              success: false,
              errorMessage: 'Pattern did not match',
            });
          }
        } catch (error) {
          results.push({
            input,
            processingTime: Date.now() - startTime,
            success: false,
            errorMessage:
              error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      setTestResults(results);
    } catch (error) {
      console.error('Test execution failed:', error);
      alert('테스트 실행 중 오류가 발생했습니다.');
    } finally {
      setIsRunningTest(false);
    }
  };

  const saveRule = async () => {
    if (!rule.ruleName || !rule.inputPattern || !rule.outputTemplate) {
      alert('필수 필드를 모두 입력해주세요.');
      return;
    }

    try {
      const response = await fetch('/api/regex-preprocessing/rules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ruleName: rule.ruleName,
          description: rule.description,
          category: rule.category,
          inputPattern: rule.inputPattern,
          outputTemplate: rule.outputTemplate,
          priority: rule.priority,
          metadataTags: rule.metadataTags,
          testCases: rule.testCases,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('규칙이 성공적으로 저장되었습니다!');
        // 폼 초기화
        setRule({
          ruleName: '',
          description: '',
          category: '법인구조',
          inputPattern: '',
          outputTemplate: '',
          priority: 100,
          isActive: true,
          metadataTags: {},
          testCases: [],
        });
        setTestResults([]);
      } else {
        alert(`저장 실패: ${result.error}`);
      }
    } catch (error) {
      console.error('Save failed:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  const successCount = testResults.filter(r => r.success).length;
  const successRate =
    testResults.length > 0 ? (successCount / testResults.length) * 100 : 0;
  const avgProcessingTime =
    testResults.length > 0
      ? testResults.reduce((sum, r) => sum + r.processingTime, 0) /
        testResults.length
      : 0;

  return (
    <div className='space-y-6'>
      {/* 기본 정보 */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <TestTube className='h-5 w-5' />
            규칙 편집기
          </CardTitle>
          <CardDescription>
            새로운 정규식 전처리 규칙을 생성하고 실시간으로 테스트해보세요.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='text-sm font-medium'>규칙명 *</label>
              <Input
                value={rule.ruleName}
                onChange={e =>
                  setRule(prev => ({ ...prev, ruleName: e.target.value }))
                }
                placeholder='예: 주식회사 표시 제거'
              />
            </div>
            <div>
              <label className='text-sm font-medium'>카테고리</label>
              <select
                className='w-full rounded-md border p-2'
                value={rule.category}
                onChange={e =>
                  setRule(prev => ({ ...prev, category: e.target.value }))
                }
              >
                <option value='법인구조'>법인구조</option>
                <option value='주유소'>주유소</option>
                <option value='마트'>마트</option>
                <option value='해외서비스'>해외서비스</option>
                <option value='공공기관'>공공기관</option>
                <option value='카페'>카페</option>
                <option value='편의점'>편의점</option>
                <option value='기타'>기타</option>
              </select>
            </div>
          </div>

          <div>
            <label className='text-sm font-medium'>설명</label>
            <Textarea
              value={rule.description}
              onChange={e =>
                setRule(prev => ({ ...prev, description: e.target.value }))
              }
              placeholder='이 규칙이 무엇을 하는지 간단히 설명해주세요'
              rows={2}
            />
          </div>

          <div className='grid grid-cols-3 gap-4'>
            <div>
              <label className='text-sm font-medium'>우선순위</label>
              <Input
                type='number'
                value={rule.priority}
                onChange={e =>
                  setRule(prev => ({
                    ...prev,
                    priority: parseInt(e.target.value) || 100,
                  }))
                }
                placeholder='100'
              />
            </div>
            <div className='flex items-center space-x-2 pt-6'>
              <input
                type='checkbox'
                id='isActive'
                checked={rule.isActive}
                onChange={e =>
                  setRule(prev => ({ ...prev, isActive: e.target.checked }))
                }
              />
              <label htmlFor='isActive' className='text-sm font-medium'>
                활성 상태
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 패턴 정의 */}
      <Card>
        <CardHeader>
          <CardTitle>패턴 정의</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <label className='text-sm font-medium'>입력 패턴 (정규식) *</label>
            <Textarea
              value={rule.inputPattern}
              onChange={e =>
                setRule(prev => ({ ...prev, inputPattern: e.target.value }))
              }
              placeholder='예: 주식회사\\s*(.+)'
              rows={3}
              className={!patternValidation.valid ? 'border-red-500' : ''}
            />
            <div className='mt-2 flex items-center gap-4 text-sm'>
              {!patternValidation.valid ? (
                <div className='flex items-center gap-1 text-red-600'>
                  <AlertCircle className='h-4 w-4' />
                  <span>{patternValidation.error}</span>
                </div>
              ) : (
                <div className='flex items-center gap-1 text-green-600'>
                  <CheckCircle className='h-4 w-4' />
                  <span>패턴 유효</span>
                </div>
              )}
              {patternValidation.complexity !== undefined && (
                <div className='flex items-center gap-1 text-gray-600'>
                  <Zap className='h-4 w-4' />
                  <span>복잡도: {patternValidation.complexity}/100</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className='text-sm font-medium'>출력 템플릿 *</label>
            <Input
              value={rule.outputTemplate}
              onChange={e =>
                setRule(prev => ({ ...prev, outputTemplate: e.target.value }))
              }
              placeholder='예: $1'
            />
            <p className='mt-1 text-xs text-gray-500'>
              $1, $2, ... 를 사용하여 캡처 그룹을 참조하세요
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 실시간 테스트 */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            <span>실시간 테스트</span>
            <Button
              onClick={runRealtimeTest}
              disabled={isRunningTest || !patternValidation.valid}
              size='sm'
            >
              {isRunningTest ? (
                <Clock className='mr-2 h-4 w-4 animate-spin' />
              ) : (
                <Play className='mr-2 h-4 w-4' />
              )}
              {isRunningTest ? '테스트 중...' : '테스트 실행'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* 테스트 케이스 추가 */}
          <div className='rounded-lg border p-4'>
            <div className='mb-3 flex items-center justify-between'>
              <h4 className='font-medium'>테스트 케이스 추가</h4>
            </div>
            <div className='grid grid-cols-2 gap-3'>
              <Input
                value={newTestInput}
                onChange={e => setNewTestInput(e.target.value)}
                placeholder='테스트 입력 (예: 주식회사 삼성전자)'
              />
              <Input
                value={newTestExpected}
                onChange={e => setNewTestExpected(e.target.value)}
                placeholder='예상 출력 (예: 삼성전자)'
              />
            </div>
            <Button onClick={addTestCase} size='sm' className='mt-3'>
              <Plus className='mr-2 h-4 w-4' />
              추가
            </Button>
          </div>

          {/* 테스트 케이스 목록 */}
          {rule.testCases && rule.testCases.length > 0 && (
            <div className='space-y-2'>
              <h4 className='font-medium'>테스트 케이스 목록</h4>
              {rule.testCases.map(testCase => (
                <div
                  key={testCase.id}
                  className='flex items-center justify-between rounded border p-3'
                >
                  <div className='flex-1'>
                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <span className='text-sm text-gray-600'>입력:</span>
                        <div className='font-mono text-sm'>
                          {testCase.input}
                        </div>
                      </div>
                      <div>
                        <span className='text-sm text-gray-600'>
                          예상 출력:
                        </span>
                        <div className='font-mono text-sm'>
                          {testCase.expected}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => removeTestCase(testCase.id)}
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* 테스트 결과 */}
          {testResults.length > 0 && (
            <div className='mt-6 space-y-4'>
              <Separator />
              <div className='flex items-center justify-between'>
                <h4 className='font-medium'>테스트 결과</h4>
                <div className='flex items-center gap-4 text-sm'>
                  <Badge
                    variant={successRate >= 80 ? 'default' : 'destructive'}
                  >
                    성공률: {successRate.toFixed(1)}%
                  </Badge>
                  <span className='text-gray-600'>
                    평균 처리시간: {avgProcessingTime.toFixed(1)}ms
                  </span>
                </div>
              </div>

              <div className='space-y-2'>
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`rounded border p-3 ${result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
                  >
                    <div className='mb-2 flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        {result.success ? (
                          <CheckCircle className='h-4 w-4 text-green-600' />
                        ) : (
                          <AlertCircle className='h-4 w-4 text-red-600' />
                        )}
                        <span className='font-mono text-sm'>
                          {result.input}
                        </span>
                      </div>
                      <Badge variant='outline' className='text-xs'>
                        {result.processingTime}ms
                      </Badge>
                    </div>

                    {result.success ? (
                      <div className='text-sm'>
                        <span className='text-gray-600'>출력:</span>
                        <span className='ml-2 font-mono text-green-700'>
                          {result.output}
                        </span>
                        {result.expected &&
                          result.output !== result.expected && (
                            <div className='mt-1'>
                              <span className='text-gray-600'>예상:</span>
                              <span className='ml-2 font-mono text-gray-700'>
                                {result.expected}
                              </span>
                            </div>
                          )}
                      </div>
                    ) : (
                      <div className='text-sm text-red-600'>
                        오류: {result.errorMessage}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 저장 버튼 */}
      <div className='flex justify-end'>
        <Button onClick={saveRule} size='lg'>
          <Save className='mr-2 h-4 w-4' />
          규칙 저장
        </Button>
      </div>
    </div>
  );
}
