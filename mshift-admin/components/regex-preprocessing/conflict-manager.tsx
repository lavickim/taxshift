'use client';

import React, { useEffect, useState } from 'react';

import {
  AlertCircle,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Eye,
  Info,
  RefreshCw,
  Settings,
  Shield,
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
// import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

interface ConflictAnalysis {
  ruleId: number;
  ruleName: string;
  conflictingRuleId: number;
  conflictingRuleName: string;
  overlapPercentage: number;
  impactLevel: 'critical' | 'warning' | 'info';
  suggestedResolution: string[];
  affectedTransactionsPerDay: number;
  conflictType: 'pattern_overlap' | 'priority_conflict' | 'output_mismatch';
  testSamples: ConflictTestSample[];
}

interface ConflictTestSample {
  input: string;
  rule1Output: string;
  rule2Output: string;
  winningRule: number;
}

interface ConflictSummary {
  totalConflicts: number;
  criticalConflicts: number;
  warningConflicts: number;
  infoConflicts: number;
  averageOverlapPercentage: number;
}

export function RegexConflictManager() {
  const [conflicts, setConflicts] = useState<ConflictAnalysis[]>([]);
  const [summary, setSummary] = useState<ConflictSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedConflicts, setExpandedConflicts] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    loadConflicts();
  }, []);

  const loadConflicts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/regex-preprocessing/conflicts');
      const result = await response.json();

      if (result.success) {
        setConflicts(result.data.conflicts);
        setSummary(result.data.summary);
      } else {
        console.error('Failed to load conflicts:', result.error);
      }
    } catch (error) {
      console.error('Error loading conflicts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleConflictExpansion = (conflictId: string) => {
    const newExpanded = new Set(expandedConflicts);
    if (newExpanded.has(conflictId)) {
      newExpanded.delete(conflictId);
    } else {
      newExpanded.add(conflictId);
    }
    setExpandedConflicts(newExpanded);
  };

  const getImpactIcon = (level: string) => {
    switch (level) {
      case 'critical':
        return <AlertCircle className='h-4 w-4 text-red-600' />;
      case 'warning':
        return <AlertTriangle className='h-4 w-4 text-yellow-600' />;
      case 'info':
        return <Info className='h-4 w-4 text-blue-600' />;
      default:
        return <Info className='h-4 w-4 text-gray-600' />;
    }
  };

  const getImpactColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'destructive';
      case 'warning':
        return 'secondary';
      case 'info':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getConflictTypeLabel = (type: string) => {
    switch (type) {
      case 'pattern_overlap':
        return '패턴 겹침';
      case 'priority_conflict':
        return '우선순위 충돌';
      case 'output_mismatch':
        return '출력 불일치';
      default:
        return type;
    }
  };

  return (
    <div className='space-y-6'>
      {/* 개요 및 통계 */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Shield className='h-5 w-5' />
              패턴 충돌 관리 및 우선순위 최적화
            </div>
            <Button
              onClick={loadConflicts}
              disabled={isLoading}
              variant='outline'
              size='sm'
            >
              {isLoading ? (
                <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
              ) : (
                <RefreshCw className='mr-2 h-4 w-4' />
              )}
              {isLoading ? '분석 중...' : '충돌 재분석'}
            </Button>
          </CardTitle>
          <CardDescription>
            정규식 패턴 간 충돌을 자동 감지하고 해결 방안을 제안합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {summary && (
            <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
              <div className='rounded-lg border p-4 text-center'>
                <div className='text-2xl font-bold text-blue-600'>
                  {summary.totalConflicts}
                </div>
                <div className='text-sm text-gray-600'>총 충돌</div>
              </div>
              <div className='rounded-lg border p-4 text-center'>
                <div className='text-2xl font-bold text-red-600'>
                  {summary.criticalConflicts}
                </div>
                <div className='text-sm text-gray-600'>Critical</div>
              </div>
              <div className='rounded-lg border p-4 text-center'>
                <div className='text-2xl font-bold text-yellow-600'>
                  {summary.warningConflicts}
                </div>
                <div className='text-sm text-gray-600'>Warning</div>
              </div>
              <div className='rounded-lg border p-4 text-center'>
                <div className='text-2xl font-bold text-gray-600'>
                  {summary.averageOverlapPercentage.toFixed(1)}%
                </div>
                <div className='text-sm text-gray-600'>평균 겹침률</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 충돌 목록 */}
      {conflicts.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>감지된 충돌 목록</CardTitle>
            <CardDescription>
              심각도 순으로 정렬된 패턴 충돌들입니다. 각 충돌을 클릭하여 상세
              정보를 확인하세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {conflicts.map((conflict, index) => {
                const conflictId = `${conflict.ruleId}-${conflict.conflictingRuleId}`;
                const isExpanded = expandedConflicts.has(conflictId);

                return (
                  <div
                    key={conflictId}
                    className={`rounded-lg border p-4 ${
                      conflict.impactLevel === 'critical'
                        ? 'border-red-200 bg-red-50'
                        : conflict.impactLevel === 'warning'
                          ? 'border-yellow-200 bg-yellow-50'
                          : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div
                      className='flex cursor-pointer items-center justify-between'
                      onClick={() => toggleConflictExpansion(conflictId)}
                    >
                      <div className='flex items-center gap-3'>
                        {isExpanded ? (
                          <ChevronDown className='h-4 w-4' />
                        ) : (
                          <ChevronRight className='h-4 w-4' />
                        )}
                        {getImpactIcon(conflict.impactLevel)}
                        <div>
                          <div className='font-medium'>
                            {conflict.ruleName} ↔{' '}
                            {conflict.conflictingRuleName}
                          </div>
                          <div className='text-sm text-gray-600'>
                            {getConflictTypeLabel(conflict.conflictType)} •
                            겹침률: {conflict.overlapPercentage.toFixed(1)}% •
                            일일 영향: {conflict.affectedTransactionsPerDay}건
                          </div>
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Badge
                          variant={getImpactColor(conflict.impactLevel) as any}
                        >
                          {conflict.impactLevel.toUpperCase()}
                        </Badge>
                        <div className='text-right'>
                          <div className='text-lg font-bold'>
                            {conflict.overlapPercentage.toFixed(1)}%
                          </div>
                          <div className='text-xs text-gray-500'>겹침률</div>
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className='mt-4 space-y-4'>
                        <Separator />

                        {/* 해결 방안 */}
                        <div>
                          <h4 className='mb-2 flex items-center gap-2 font-medium'>
                            <Zap className='h-4 w-4' />
                            제안된 해결 방안
                          </h4>
                          <ul className='space-y-1'>
                            {conflict.suggestedResolution.map(
                              (suggestion, idx) => (
                                <li
                                  key={idx}
                                  className='flex items-start gap-2 text-sm text-gray-700'
                                >
                                  <span className='mt-1 text-blue-500'>•</span>
                                  {suggestion}
                                </li>
                              )
                            )}
                          </ul>
                        </div>

                        {/* 테스트 샘플 */}
                        {conflict.testSamples.length > 0 && (
                          <div>
                            <h4 className='mb-2 flex items-center gap-2 font-medium'>
                              <Eye className='h-4 w-4' />
                              충돌 샘플 ({conflict.testSamples.length}개)
                            </h4>
                            <div className='space-y-2'>
                              {conflict.testSamples
                                .slice(0, 3)
                                .map((sample, idx) => (
                                  <div
                                    key={idx}
                                    className='rounded border bg-white p-3 text-sm'
                                  >
                                    <div className='mb-2 font-mono text-gray-800'>
                                      입력: {sample.input}
                                    </div>
                                    <div className='grid grid-cols-2 gap-4 text-xs'>
                                      <div>
                                        <span className='text-gray-600'>
                                          규칙 1 출력:
                                        </span>
                                        <div
                                          className={`font-mono ${
                                            sample.winningRule ===
                                            conflict.ruleId
                                              ? 'font-semibold text-green-700'
                                              : 'text-gray-500'
                                          }`}
                                        >
                                          {sample.rule1Output}
                                          {sample.winningRule ===
                                            conflict.ruleId && ' ← 적용됨'}
                                        </div>
                                      </div>
                                      <div>
                                        <span className='text-gray-600'>
                                          규칙 2 출력:
                                        </span>
                                        <div
                                          className={`font-mono ${
                                            sample.winningRule ===
                                            conflict.conflictingRuleId
                                              ? 'font-semibold text-green-700'
                                              : 'text-gray-500'
                                          }`}
                                        >
                                          {sample.rule2Output}
                                          {sample.winningRule ===
                                            conflict.conflictingRuleId &&
                                            ' ← 적용됨'}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              {conflict.testSamples.length > 3 && (
                                <div className='text-center text-sm text-gray-500'>
                                  ... 및 {conflict.testSamples.length - 3}개
                                  추가 샘플
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* 액션 버튼 */}
                        <div className='flex gap-2 pt-2'>
                          <Button size='sm' variant='outline'>
                            <Settings className='mr-2 h-4 w-4' />
                            우선순위 조정
                          </Button>
                          <Button size='sm' variant='outline'>
                            <Eye className='mr-2 h-4 w-4' />
                            규칙 편집
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className='py-12 text-center'>
            {isLoading ? (
              <div>
                <RefreshCw className='mx-auto mb-4 h-12 w-12 animate-spin text-muted-foreground' />
                <h3 className='mb-2 text-lg font-semibold'>충돌 분석 중...</h3>
                <p className='text-muted-foreground'>
                  모든 정규식 패턴을 분석하여 충돌을 감지하고 있습니다.
                </p>
              </div>
            ) : (
              <div>
                <Shield className='mx-auto mb-4 h-12 w-12 text-green-600' />
                <h3 className='mb-2 text-lg font-semibold text-green-700'>
                  충돌이 감지되지 않았습니다
                </h3>
                <p className='text-muted-foreground'>
                  현재 모든 정규식 패턴이 올바르게 분리되어 있습니다.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
