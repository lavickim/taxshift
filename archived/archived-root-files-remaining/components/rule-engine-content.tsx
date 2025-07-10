'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Brain, ArrowRight, CheckCircle, AlertCircle, Info, Sparkles, TrendingUp, Clock, Plus, Wand2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface RuleResult {
  matched: boolean;
  ruleId?: string;
  ruleName?: string;
  confidence?: number;
  question?: string;
  options?: Array<{ text: string; tag: string; account: string }>;
  directResult?: { tag: string; account: string };
  source: 'rule' | 'llm';
}

interface ProcessingStep {
  step: number;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'skipped';
  result?: string;
}

export function RuleEngineContent() {
  const [transactionText, setTransactionText] = useState('');
  const [normalizedText, setNormalizedText] = useState('');
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([
    { step: 1, name: '전처리 및 정규화', status: 'pending' },
    { step: 2, name: '룰 DB 검색', status: 'pending' },
    { step: 3, name: '규칙 적용', status: 'pending' },
    { step: 4, name: 'LLM 추론', status: 'pending' },
    { step: 5, name: '학습 및 업데이트', status: 'pending' },
  ]);
  const [result, setResult] = useState<RuleResult | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rules, setRules] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [isLoadingRules, setIsLoadingRules] = useState(false);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);
  const [showNewRuleDialog, setShowNewRuleDialog] = useState(false);
  const [newRuleForm, setNewRuleForm] = useState({
    keyword: '',
    confidence: 70,
    question: '',
    primaryTag: '',
    primaryAccount: '',
    secondaryTag: '',
    secondaryAccount: ''
  });
  const [isAiSuggesting, setIsAiSuggesting] = useState(false);

  const normalizeText = (text: string): string => {
    // 금액 제거
    let normalized = text.replace(/[\d,]+원/g, '').trim();
    
    // 법인 형태 제거
    const corporatePatterns = ['(주)', '주식회사', '(유)', '(합)', '㈜'];
    corporatePatterns.forEach(pattern => {
      normalized = normalized.replace(pattern, '');
    });
    
    // 일반 명사 제거
    const commonWords = ['지점', '코리아', '본점', '센터', '매장'];
    commonWords.forEach(word => {
      normalized = normalized.replace(new RegExp(word + '$'), '');
    });
    
    return normalized.trim();
  };

  const updateStep = (stepNumber: number, status: ProcessingStep['status'], result?: string) => {
    setProcessingSteps(prev => prev.map(step => 
      step.step === stepNumber ? { ...step, status, result } : step
    ));
  };

  const processTransaction = async () => {
    if (!transactionText.trim()) return;
    
    setIsProcessing(true);
    setResult(null);
    setSelectedOption(null);
    
    // 모든 단계를 pending으로 리셋
    setProcessingSteps(prev => prev.map(step => ({ ...step, status: 'pending', result: undefined })));
    
    try {
      // 1단계: 전처리 및 정규화
      updateStep(1, 'processing');
      const normalized = normalizeText(transactionText);
      setNormalizedText(normalized);
      await new Promise(resolve => setTimeout(resolve, 500));
      updateStep(1, 'completed', `정제된 거래처명: "${normalized}"`);
      
      // 2단계: 룰 DB 검색
      updateStep(2, 'processing');
      const ruleResponse = await fetch('/api/rule-engine/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: normalized }),
      });
      
      if (ruleResponse.ok) {
        const ruleData = await ruleResponse.json();
        if (ruleData.matches && ruleData.matches.length > 0) {
          const match = ruleData.matches[0];
          updateStep(2, 'completed', `룰 매치: "${match.ruleName}" (신뢰도: ${match.confidence || 80}%)`);
          
          // 3단계: 규칙 적용
          updateStep(3, 'processing');
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const confidence = match.confidence || 80;
          if (confidence >= 90) {
            // 높은 신뢰도 - 직접 적용
            setResult({
              matched: true,
              ruleId: match.ruleId,
              ruleName: match.ruleName,
              confidence,
              directResult: { tag: match.tag || '#기타', account: match.account || '기타비용' },
              source: 'rule'
            });
            updateStep(3, 'completed', '높은 신뢰도 - 자동 분류');
            updateStep(4, 'skipped');
            updateStep(5, 'pending');
          } else {
            // 중간 신뢰도 - 사용자 선택 필요
            setResult({
              matched: true,
              ruleId: match.ruleId,
              ruleName: match.ruleName,
              confidence,
              question: match.question || '이 거래의 성격을 선택해주세요',
              options: [
                { text: '업무 관련', tag: match.tag || '#업무', account: match.account || '접대비' },
                { text: '개인 사용', tag: '#개인', account: '개인경비' }
              ],
              source: 'rule'
            });
            updateStep(3, 'completed', '중간 신뢰도 - 사용자 확인 필요');
            updateStep(4, 'skipped');
            updateStep(5, 'pending');
          }
        } else {
          updateStep(2, 'completed', '매칭된 룰 없음');
          updateStep(3, 'skipped');
          
          // 4단계: LLM 추론
          updateStep(4, 'processing');
          const llmResponse = await fetch('/api/rule-engine/llm-infer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              text: normalized,
              prompt: `너는 한국 최고의 세무사 AI야. 사용자가 '${normalized}'이라는 곳에서 돈을 썼어. 이 상호명으로 미루어 볼 때, 가장 가능성이 높은 업종과 추천 계정과목은 무엇이야? 두 번째 가능성도 있다면 알려줘.`
            }),
          });
          
          if (llmResponse.ok) {
            const llmData = await llmResponse.json();
            setResult({
              matched: false,
              question: 'AI가 추론한 결과입니다. 적절한 분류를 선택해주세요.',
              options: [
                { text: llmData.primary || '업무 관련', tag: llmData.primaryTag || '#추론', account: llmData.primaryAccount || '기타비용' },
                { text: llmData.secondary || '개인 사용', tag: llmData.secondaryTag || '#개인', account: llmData.secondaryAccount || '개인경비' }
              ],
              source: 'llm'
            });
            updateStep(4, 'completed', 'LLM 추론 완료');
            updateStep(5, 'pending');
          } else {
            throw new Error('LLM 추론 실패');
          }
        }
      } else {
        throw new Error('룰 DB 검색 실패');
      }
    } catch (error) {
      console.error('처리 중 오류 발생:', error);
      setResult({
        matched: false,
        source: 'llm',
        directResult: { tag: '#오류', account: '분류실패' }
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOptionSelect = async (optionIndex: number) => {
    setSelectedOption(optionIndex);
    updateStep(5, 'processing');
    
    // 5단계: 학습 및 업데이트
    try {
      const option = result?.options?.[optionIndex];
      if (!option) return;

      // 피드백 API 호출
      const feedbackResponse = await fetch('/api/rule-engine/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ruleId: result.ruleId,
          transactionText,
          normalizedText,
          selectedOption: optionIndex,
          selectedTag: option.tag,
          selectedAccount: option.account,
          source: result.source
        })
      });

      if (!feedbackResponse.ok) {
        throw new Error('피드백 저장 실패');
      }
      
      if (result?.source === 'rule') {
        if (optionIndex === 0) {
          updateStep(5, 'completed', '긍정 피드백 - 신뢰도 +1');
        } else {
          updateStep(5, 'completed', '부정 피드백 - 신뢰도 -2, 순서 변경');
        }
      } else {
        updateStep(5, 'completed', '새로운 규칙 후보로 등록');
      }

      // 룰 목록 새로고침
      if (rules.length > 0) {
        loadRules();
      }
    } catch (error) {
      console.error('피드백 저장 오류:', error);
      updateStep(5, 'completed', '피드백 저장 실패');
    }
  };

  const getStepIcon = (status: ProcessingStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'processing':
        return <Sparkles className="h-5 w-5 text-blue-500 animate-pulse" />;
      case 'skipped':
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />;
    }
  };

  const loadRules = async () => {
    setIsLoadingRules(true);
    try {
      const response = await fetch('/api/rule-engine/rules');
      if (response.ok) {
        const data = await response.json();
        setRules(data.rules || []);
      }
    } catch (error) {
      console.error('룰 목록 로드 실패:', error);
    } finally {
      setIsLoadingRules(false);
    }
  };

  const loadCandidates = async () => {
    setIsLoadingCandidates(true);
    try {
      const response = await fetch('/api/rule-engine/candidates');
      if (response.ok) {
        const data = await response.json();
        setCandidates(data.candidates || []);
      }
    } catch (error) {
      console.error('룰 후보 로드 실패:', error);
    } finally {
      setIsLoadingCandidates(false);
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('ko-KR');
  };

  const handleCreateRule = async () => {
    try {
      const response = await fetch('/api/rule-engine/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRuleForm)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '룰 생성 실패');
      }

      // 성공 시 폼 초기화 및 목록 새로고침
      setNewRuleForm({
        keyword: '',
        confidence: 70,
        question: '',
        primaryTag: '',
        primaryAccount: '',
        secondaryTag: '',
        secondaryAccount: ''
      });
      setShowNewRuleDialog(false);
      loadRules();
    } catch (error) {
      console.error('룰 생성 오류:', error);
      alert(error instanceof Error ? error.message : '룰 생성 중 오류가 발생했습니다');
    }
  };

  const handlePromoteCandidate = async (candidateId: string) => {
    try {
      const response = await fetch('/api/rule-engine/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId })
      });

      if (!response.ok) {
        throw new Error('후보 승급 실패');
      }

      // 성공 시 목록 새로고침
      loadCandidates();
      loadRules();
    } catch (error) {
      console.error('후보 승급 오류:', error);
      alert('후보 승급 중 오류가 발생했습니다');
    }
  };

  const handleAiSuggest = async () => {
    if (!newRuleForm.keyword.trim()) {
      alert('키워드를 먼저 입력해주세요');
      return;
    }

    setIsAiSuggesting(true);
    try {
      const response = await fetch('/api/rule-engine/ai-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: newRuleForm.keyword })
      });

      if (!response.ok) {
        throw new Error('AI 제안 실패');
      }

      const { suggestion } = await response.json();
      
      // AI 제안으로 폼 업데이트
      setNewRuleForm(prev => ({
        ...prev,
        confidence: suggestion.confidence,
        question: suggestion.question || '',
        primaryTag: suggestion.primaryTag,
        primaryAccount: suggestion.primaryAccount,
        secondaryTag: suggestion.secondaryTag || '',
        secondaryAccount: suggestion.secondaryAccount || ''
      }));

      // 사용자에게 AI의 분석 결과 표시
      if (suggestion.reasoning) {
        alert(`AI 분석 결과: ${suggestion.reasoning}`);
      }
    } catch (error) {
      console.error('AI 제안 오류:', error);
      alert('AI 제안을 가져오는 중 오류가 발생했습니다');
    } finally {
      setIsAiSuggesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Brain className="h-8 w-8 text-primary" />
          하이브리드 룰 엔진
        </h1>
        <p className="text-muted-foreground mt-2">
          AI 기반 거래 분류 시스템 - 룰 DB와 LLM을 결합한 지능형 분류
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          이 시스템은 거래 문자열을 분석하여 적절한 태그와 계정과목을 자동으로 추천합니다.
          높은 신뢰도의 룰은 자동 적용되며, 애매한 경우 사용자의 선택을 요청합니다.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="engine" className="w-full" onValueChange={(value) => {
        if (value === 'rules' && rules.length === 0) {
          loadRules();
        } else if (value === 'candidates' && candidates.length === 0) {
          loadCandidates();
        }
      }}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="engine">룰 엔진 테스트</TabsTrigger>
          <TabsTrigger value="rules">현재 룰 목록</TabsTrigger>
          <TabsTrigger value="candidates">신규 룰 후보</TabsTrigger>
        </TabsList>

        <TabsContent value="engine" className="space-y-4">
          {/* 입력 섹션 */}
          <Card>
            <CardHeader>
              <CardTitle>거래 문자열 입력</CardTitle>
              <CardDescription>
                분석할 거래 내역을 입력하세요 (예: "(주)스타벅스커피코리아 강남역점 9,800원")
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="transaction">거래 내역</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="transaction"
                    placeholder="거래처명과 금액을 입력하세요"
                    value={transactionText}
                    onChange={(e) => setTransactionText(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={processTransaction} 
                    disabled={isProcessing || !transactionText.trim()}
                  >
                    {isProcessing ? (
                      <>
                        <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                        처리 중...
                      </>
                    ) : (
                      <>
                        <ArrowRight className="mr-2 h-4 w-4" />
                        분석 시작
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              {normalizedText && (
                <div>
                  <Label>정규화된 텍스트</Label>
                  <div className="p-3 bg-muted rounded-md mt-2">
                    <code>{normalizedText}</code>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 처리 단계 */}
          <Card>
            <CardHeader>
              <CardTitle>처리 단계</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {processingSteps.map((step) => (
                  <div key={step.step} className="flex items-start gap-3">
                    {getStepIcon(step.status)}
                    <div className="flex-1">
                      <div className="font-medium">{step.step}단계: {step.name}</div>
                      {step.result && (
                        <div className="text-sm text-muted-foreground mt-1">{step.result}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 결과 섹션 */}
          {result && (
            <Card>
              <CardHeader>
                <CardTitle>분석 결과</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.directResult ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="font-medium">자동 분류 완료</span>
                      {result.confidence && (
                        <Badge variant="secondary">신뢰도 {result.confidence}%</Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                      <div>
                        <div className="text-sm text-muted-foreground">태그</div>
                        <div className="font-medium">{result.directResult.tag}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">계정과목</div>
                        <div className="font-medium">{result.directResult.account}</div>
                      </div>
                    </div>
                  </div>
                ) : result.question && result.options ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                      <span className="font-medium">{result.question}</span>
                      {result.confidence && (
                        <Badge variant="secondary">신뢰도 {result.confidence}%</Badge>
                      )}
                    </div>
                    <div className="grid gap-2">
                      {result.options.map((option, index) => (
                        <Button
                          key={index}
                          variant={selectedOption === index ? "default" : "outline"}
                          className="justify-between"
                          onClick={() => handleOptionSelect(index)}
                          disabled={selectedOption !== null}
                        >
                          <span>{option.text}</span>
                          <div className="flex gap-2">
                            <Badge variant="secondary">{option.tag}</Badge>
                            <Badge variant="outline">{option.account}</Badge>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : null}
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Info className="h-4 w-4" />
                  출처: {result.source === 'rule' ? '룰 DB' : 'LLM 추론'}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>등록된 룰 목록</CardTitle>
                  <CardDescription>
                    현재 시스템에 등록된 분류 규칙들입니다. 신뢰도가 높을수록 자동으로 적용됩니다.
                  </CardDescription>
                </div>
                <Button onClick={() => setShowNewRuleDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  새 룰 추가
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingRules ? (
                <div className="text-center text-muted-foreground py-8">
                  <Sparkles className="h-8 w-8 mx-auto mb-2 animate-spin" />
                  룰 목록을 불러오는 중...
                </div>
              ) : rules.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  등록된 룰이 없습니다.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>키워드</TableHead>
                      <TableHead>신뢰도</TableHead>
                      <TableHead>1순위 분류</TableHead>
                      <TableHead>2순위 분류</TableHead>
                      <TableHead>사용 횟수</TableHead>
                      <TableHead>마지막 사용</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rules.map((rule) => (
                      <TableRow key={rule.id}>
                        <TableCell className="font-medium">{rule.keyword}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={rule.confidence} className="w-20" />
                            <span className="text-sm">{rule.confidence}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant="default">{rule.primaryTag}</Badge>
                            <div className="text-sm text-muted-foreground">{rule.primaryAccount}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {rule.secondaryTag && (
                            <div className="space-y-1">
                              <Badge variant="outline">{rule.secondaryTag}</Badge>
                              <div className="text-sm text-muted-foreground">{rule.secondaryAccount}</div>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            {rule.usageCount}
                          </div>
                        </TableCell>
                        <TableCell>
                          {rule.lastUsed && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {formatDate(rule.lastUsed)}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="candidates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>신규 룰 후보</CardTitle>
              <CardDescription>
                사용자 피드백을 통해 학습된 새로운 룰 후보들입니다. 10회 이상 제안되면 정식 룰로 승급 검토됩니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingCandidates ? (
                <div className="text-center text-muted-foreground py-8">
                  <Sparkles className="h-8 w-8 mx-auto mb-2 animate-spin" />
                  신규 룰 후보를 불러오는 중...
                </div>
              ) : candidates.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  신규 룰 후보가 없습니다.
                </div>
              ) : (
                <div className="space-y-4">
                  {candidates.map((candidate) => (
                    <Card key={candidate.id} className="border-dashed">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-lg">{candidate.keyword}</span>
                              <ArrowRight className="h-4 w-4 text-muted-foreground" />
                              <Badge>{candidate.tag}</Badge>
                              <span className="text-sm text-muted-foreground">{candidate.account}</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>제안 횟수: {candidate.suggestionCount}/10</span>
                              <span>•</span>
                              <span>최초 제안: {formatDate(candidate.firstSuggested)}</span>
                              <span>•</span>
                              <span>최근 제안: {formatDate(candidate.lastSuggested)}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Progress 
                              value={(candidate.suggestionCount / candidate.approvalThreshold) * 100} 
                              className="w-32"
                            />
                            {candidate.suggestionCount >= candidate.approvalThreshold ? (
                              <Button
                                size="sm"
                                onClick={() => handlePromoteCandidate(candidate.id)}
                                className="animate-pulse"
                              >
                                정식 룰로 승급
                              </Button>
                            ) : (
                              <Badge variant="outline">
                                {candidate.approvalThreshold - candidate.suggestionCount}회 더 필요
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 새 룰 추가 다이얼로그 */}
      <Dialog open={showNewRuleDialog} onOpenChange={setShowNewRuleDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>새 룰 추가</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="keyword">키워드 *</Label>
                <div className="flex gap-2">
                  <Input
                    id="keyword"
                    value={newRuleForm.keyword}
                    onChange={(e) => setNewRuleForm({...newRuleForm, keyword: e.target.value})}
                    placeholder="예: 스타벅스"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAiSuggest}
                    disabled={!newRuleForm.keyword.trim() || isAiSuggesting}
                  >
                    {isAiSuggesting ? (
                      <>
                        <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                        분석 중...
                      </>
                    ) : (
                      <>
                        <Wand2 className="mr-2 h-4 w-4" />
                        AI 도움
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="confidence">신뢰도 (0-100)</Label>
                <Input
                  id="confidence"
                  type="number"
                  min="0"
                  max="100"
                  value={newRuleForm.confidence}
                  onChange={(e) => setNewRuleForm({...newRuleForm, confidence: parseInt(e.target.value) || 70})}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="question">질문 (선택)</Label>
              <Textarea
                id="question"
                value={newRuleForm.question}
                onChange={(e) => setNewRuleForm({...newRuleForm, question: e.target.value})}
                placeholder="신뢰도가 90 미만일 때 사용자에게 보여질 질문"
                rows={2}
              />
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">1순위 분류 *</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primaryTag">태그</Label>
                    <Input
                      id="primaryTag"
                      value={newRuleForm.primaryTag}
                      onChange={(e) => setNewRuleForm({...newRuleForm, primaryTag: e.target.value})}
                      placeholder="예: #접대비"
                    />
                  </div>
                  <div>
                    <Label htmlFor="primaryAccount">계정과목</Label>
                    <Input
                      id="primaryAccount"
                      value={newRuleForm.primaryAccount}
                      onChange={(e) => setNewRuleForm({...newRuleForm, primaryAccount: e.target.value})}
                      placeholder="예: 접대비"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">2순위 분류 (선택)</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="secondaryTag">태그</Label>
                    <Input
                      id="secondaryTag"
                      value={newRuleForm.secondaryTag}
                      onChange={(e) => setNewRuleForm({...newRuleForm, secondaryTag: e.target.value})}
                      placeholder="예: #복리후생비"
                    />
                  </div>
                  <div>
                    <Label htmlFor="secondaryAccount">계정과목</Label>
                    <Input
                      id="secondaryAccount"
                      value={newRuleForm.secondaryAccount}
                      onChange={(e) => setNewRuleForm({...newRuleForm, secondaryAccount: e.target.value})}
                      placeholder="예: 복리후생비"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewRuleDialog(false)}>
              취소
            </Button>
            <Button 
              onClick={handleCreateRule}
              disabled={!newRuleForm.keyword || !newRuleForm.primaryTag || !newRuleForm.primaryAccount}
            >
              룰 생성
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 