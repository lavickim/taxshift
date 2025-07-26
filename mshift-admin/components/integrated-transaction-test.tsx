'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Zap, Play, CheckCircle, AlertTriangle, Clock, 
  ArrowRight, BarChart3, Target, Layers, TrendingUp,
  FileText, Database, Cpu, Activity
} from "lucide-react";

interface IntegratedTestResult {
  originalText: string;
  amount?: number;
  preprocessingResult: any;
  preprocessedText: string;
  preprocessingSuccess: boolean;
  keywordExtractionResult?: any;
  extractedKeywords: string[];
  keywordExtractionSuccess: boolean;
  finalTag?: string;
  finalAccount?: string;
  finalConfidence: number;
  totalProcessingTime: number;
  preprocessingTime: number;
  keywordExtractionTime: number;
  processingPath: string;
  appliedRegexRules: string[];
  matchedKeywordPatterns: string[];
  processingSteps: ProcessingStep[];
}

interface ProcessingStep {
  step: string;
  input: string;
  output: string;
  processingTime: number;
  success: boolean;
  metadata?: Record<string, any>;
}

interface BatchSummary {
  totalProcessed: number;
  successfulClassifications: number;
  successRate: number;
  preprocessingSuccessRate: number;
  keywordExtractionSuccessRate: number;
  averageProcessingTime: number;
  averageConfidence: number;
  processingPathDistribution: Record<string, number>;
  topRegexRules: Array<{item: string, count: number}>;
  topExtractedKeywords: Array<{item: string, count: number}>;
}

export function IntegratedTransactionTest() {
  const [testInput, setTestInput] = useState('');
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [testResult, setTestResult] = useState<IntegratedTestResult | null>(null);
  const [batchResults, setBatchResults] = useState<{results: IntegratedTestResult[], summary: BatchSummary} | null>(null);
  const [testMode, setTestMode] = useState<'single' | 'batch'>('single');

  const sampleData = {
    single: '주식회사 삼성전자 반도체 구매',
    batch: `주식회사 삼성전자 반도체 구매
(주)네이버 광고비 결제
GS칼텍스 강남(상)주 주유비
스타벅스 강남역점 커피 구매
이마트 에브리데이 생필품
NETFLIX COM BILL MONTHLY
CLAUDE.AI SUBSCRIPTION SAN FRANCISCO USA
(유)부자마트 식료품 구매
현대오일뱅크 서울(하)주 주유비
국민연금관리공단 보험료 납부`
  };

  const loadSampleData = () => {
    setTestInput(sampleData[testMode]);
    if (testMode === 'single') {
      setAmount('50000');
    }
  };

  const runTest = async () => {
    if (!testInput.trim()) {
      alert('테스트 데이터를 입력해주세요.');
      return;
    }

    setIsProcessing(true);
    setTestResult(null);
    setBatchResults(null);

    try {
      let requestBody;
      
      if (testMode === 'single') {
        requestBody = {
          text: testInput,
          amount: amount ? parseInt(amount) : undefined,
          useCache: true
        };
      } else {
        const transactions = testInput.split('\n')
          .filter(line => line.trim())
          .map(text => ({ text, amount: 10000 }));
        
        requestBody = {
          transactions,
          batchSize: 5
        };
      }

      const response = await fetch('/api/v3/transaction/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();
      
      if (result.success) {
        if (testMode === 'single') {
          setTestResult(result.data);
        } else {
          setBatchResults(result.data);
        }
      } else {
        alert(`처리 실패: ${result.error}`);
      }
    } catch (error) {
      console.error('Test failed:', error);
      alert('테스트 실행 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getPathColor = (path: string) => {
    switch (path) {
      case 'CACHE': return 'text-blue-600';
      case 'FULL_PIPELINE': return 'text-green-600';
      case 'REGEX_ONLY': return 'text-yellow-600';
      case 'FALLBACK': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getPathIcon = (path: string) => {
    switch (path) {
      case 'CACHE': return <Database className="h-4 w-4" />;
      case 'FULL_PIPELINE': return <Layers className="h-4 w-4" />;
      case 'REGEX_ONLY': return <FileText className="h-4 w-4" />;
      case 'FALLBACK': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* 테스트 설정 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            통합 거래 처리 시스템 테스트
            <Badge variant="outline">v3.0</Badge>
          </CardTitle>
          <CardDescription>
            정규식 전처리 + 키워드 추출 통합 파이프라인 테스트
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 테스트 모드 선택 */}
          <div className="flex gap-2 mb-4">
            <Button
              variant={testMode === 'single' ? 'default' : 'outline'}
              onClick={() => setTestMode('single')}
              size="sm"
            >
              단일 거래
            </Button>
            <Button
              variant={testMode === 'batch' ? 'default' : 'outline'}
              onClick={() => setTestMode('batch')}
              size="sm"
            >
              대량 처리
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>
                  {testMode === 'single' ? '거래 문자열' : '거래 문자열 목록 (한 줄에 하나씩)'}
                </Label>
                <Button variant="outline" size="sm" onClick={loadSampleData}>
                  샘플 데이터 로드
                </Button>
              </div>
              <Textarea
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder={testMode === 'single' 
                  ? "거래 문자열을 입력하세요..." 
                  : "여러 거래 문자열을 한 줄에 하나씩 입력하세요..."
                }
                rows={testMode === 'single' ? 3 : 8}
                className="font-mono text-sm"
              />
            </div>

            {testMode === 'single' && (
              <div>
                <Label>거래 금액 (선택사항)</Label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="50000"
                />
              </div>
            )}
          </div>

          <Button 
            onClick={runTest} 
            disabled={isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Activity className="h-4 w-4 mr-2 animate-spin" />
                통합 처리 실행 중...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                통합 처리 테스트 실행
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* 단일 거래 결과 */}
      {testResult && (
        <>
          {/* 처리 경로 및 성능 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  처리 결과 요약
                </div>
                <div className="flex items-center gap-2">
                  {getPathIcon(testResult.processingPath)}
                  <Badge variant="outline" className={getPathColor(testResult.processingPath)}>
                    {testResult.processingPath}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {testResult.totalProcessingTime}ms
                  </div>
                  <div className="text-sm text-gray-600">총 처리 시간</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {(testResult.finalConfidence * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">최종 신뢰도</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {testResult.finalTag || 'UNKNOWN'}
                  </div>
                  <div className="text-sm text-gray-600">분류 결과</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {testResult.finalAccount || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600">계정과목</div>
                </div>
              </div>

              {/* 처리 단계별 시간 */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>정규식 전처리</span>
                  <span>{testResult.preprocessingTime}ms</span>
                </div>
                <Progress 
                  value={(testResult.preprocessingTime / testResult.totalProcessingTime) * 100} 
                  className="h-2"
                />
                <div className="flex justify-between text-sm">
                  <span>키워드 추출</span>
                  <span>{testResult.keywordExtractionTime}ms</span>
                </div>
                <Progress 
                  value={(testResult.keywordExtractionTime / testResult.totalProcessingTime) * 100} 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* 처리 단계 상세 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRight className="h-5 w-5" />
                처리 단계별 상세
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testResult.processingSteps.map((step, index) => (
                  <div key={index} className="border rounded p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {step.success ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="font-medium">
                          {step.step.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        <span className="text-sm">{step.processingTime}ms</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">입력:</span>
                        <div className="font-mono bg-gray-100 p-2 rounded mt-1">
                          {step.input}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">출력:</span>
                        <div className="font-mono bg-gray-100 p-2 rounded mt-1">
                          {step.output}
                        </div>
                      </div>
                    </div>

                    {step.metadata && Object.keys(step.metadata).length > 0 && (
                      <div className="mt-2">
                        <span className="text-gray-600 text-sm">메타데이터:</span>
                        <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-x-auto">
                          {JSON.stringify(step.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* 대량 처리 결과 */}
      {batchResults && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                대량 처리 결과 요약
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {batchResults.summary.totalProcessed}
                  </div>
                  <div className="text-sm text-gray-600">총 처리</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {batchResults.summary.successRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">성공률</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {batchResults.summary.averageProcessingTime}ms
                  </div>
                  <div className="text-sm text-gray-600">평균 처리시간</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {batchResults.summary.averageConfidence.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">평균 신뢰도</div>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="grid grid-cols-2 gap-6">
                {/* 처리 경로 분포 */}
                <div>
                  <h4 className="font-medium mb-2">처리 경로 분포</h4>
                  <div className="space-y-2">
                    {Object.entries(batchResults.summary.processingPathDistribution).map(([path, count]) => (
                      <div key={path} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          {getPathIcon(path)}
                          <span className="text-sm">{path}</span>
                        </div>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 상위 적용 규칙 */}
                <div>
                  <h4 className="font-medium mb-2">상위 적용 정규식 규칙</h4>
                  <div className="space-y-2">
                    {batchResults.summary.topRegexRules.map((rule, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm truncate">{rule.item}</span>
                        <Badge variant="outline">{rule.count}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 개별 결과 목록 */}
          <Card>
            <CardHeader>
              <CardTitle>개별 처리 결과</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {batchResults.results.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-sm truncate">
                        {result.originalText}
                      </div>
                      <div className="text-xs text-gray-500">
                        {result.finalTag} • {(result.finalConfidence * 100).toFixed(1)}% • {result.totalProcessingTime}ms
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {getPathIcon(result.processingPath)}
                      <Badge 
                        variant={result.finalConfidence > 0.7 ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {result.processingPath}
                      </Badge>
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