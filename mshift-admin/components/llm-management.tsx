'use client';

import { useEffect, useState } from 'react';

import {
  AlertCircle,
  // AlertTriangle,
  BarChart3,
  Brain,
  CheckCircle,
  // Cpu,
  // Edit,
  HelpCircle,
  Layers,
  Lightbulb,
  MessageSquare,
  Play,
  // Plus,
  Settings2,
  Sparkles,
  Target,
  TrendingUp,
  XCircle,
  Zap,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  // Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import 주석처리됨
// import 주석처리됨
import { Label } from '@/components/ui/label';
// import 주석처리됨
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

interface RuleCandidate {
  id: number;
  keyword: string;
  suggested_tag: string;
  suggested_account: string;
  suggestion_count: number;
  approval_threshold: number;
  first_suggested: string;
  last_suggested: string;
  is_approved: boolean;
  approved_at?: string;
  approved_by?: string;
}

interface Feedback {
  id: number;
  rule_id?: number;
  transaction_text: string;
  normalized_text: string;
  selected_option: number;
  selected_tag: string;
  selected_account: string;
  feedback_type: 'positive' | 'negative' | 'llm';
  created_at: string;
}

interface LLMInferenceResult {
  success: boolean;
  data?: {
    classification: string;
    confidence: number;
    reasoning: string;
    alternative_options: Array<{
      tag: string;
      account: string;
      confidence: number;
      reasoning: string;
    }>;
  };
  error?: string;
}

interface AIAnalytics {
  total_llm_calls: number;
  avg_confidence: number;
  success_rate: number;
  common_classifications: Array<{
    tag: string;
    count: number;
    avg_confidence: number;
  }>;
  feedback_stats: {
    positive: number;
    negative: number;
    llm: number;
  };
}

const CHART_COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884D8',
  '#82CA9D',
];

const ACCOUNT_OPTIONS = [
  '급여',
  '임차보증금',
  '소모품비',
  '접대비',
  '차량유지비',
  '통신비',
  '전력비',
  '수도광열비',
  '보험료',
  '세금과공과',
  '복리후생비',
  '여비교통비',
  '교육훈련비',
  '도서인쇄비',
  '회의비',
  '기타판매비',
  '광고선전비',
  '수수료',
  '임대료',
];

export function LLMManagement() {
  const [candidates, setCandidates] = useState<RuleCandidate[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [testInput, setTestInput] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [llmResult, setLLMResult] = useState<LLMInferenceResult | null>(null);
  const [aiFeedback, setAiFeedback] = useState<any>(null);
  const [loadingAiFeedback, setLoadingAiFeedback] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<AIAnalytics | null>(null);
  const [currentTab, setCurrentTab] = useState('hybrid');
  const [loadingLLM, setLoadingLLM] = useState(false);

  // Load candidates
  const loadCandidates = async () => {
    try {
      const response = await fetch('/api/rule-engine/candidates');
      const data = await response.json();

      if (data.success) {
        setCandidates(data.data);
      } else {
        console.error('후보 로드 실패:', data.error);
      }
    } catch (error) {
      console.error('후보 로드 오류:', error);
    }
  };

  // Load feedback data
  const loadFeedback = async () => {
    try {
      const response = await fetch('/api/rule-engine/feedback');
      const data = await response.json();

      if (data.success) {
        setFeedback(data.data);
      } else {
        console.error('피드백 로드 실패:', data.error);
      }
    } catch (error) {
      console.error('피드백 로드 오류:', error);
    }
  };

  // Load AI analytics
  const loadAnalytics = async () => {
    try {
      const response = await fetch('/api/rule-engine/analytics');
      const data = await response.json();

      if (data.success) {
        setAnalytics(data.data);
      } else {
        console.error('분석 데이터 로드 실패:', data.error);
      }
    } catch (error) {
      console.error('분석 데이터 로드 오류:', error);
    }
  };

  // AI 제안 받기
  const getAiSuggestion = async (keyword: string) => {
    try {
      const response = await fetch('/api/rule-engine/ai-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword }),
      });

      const data = await response.json();

      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('AI 제안 오류:', error);
      throw error;
    }
  };

  // LLM 추론 테스트
  const testLLMInference = async (transaction: string) => {
    if (!transaction.trim()) return;

    setLoadingLLM(true);
    setLLMResult(null);

    try {
      const response = await fetch('/api/rule-engine/llm-infer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transaction }),
      });

      const data = await response.json();
      setLLMResult(data);
    } catch (error) {
      console.error('LLM 추론 오류:', error);
      setLLMResult({
        success: false,
        error: 'LLM 추론 중 오류가 발생했습니다.',
      });
    } finally {
      setLoadingLLM(false);
    }
  };

  // 룰 테스트 (하이브리드 엔진)
  const testRule = async (transaction: string) => {
    if (!transaction.trim()) return;

    setAiFeedback(null);
    setSelectedFeedback(null);

    try {
      const response = await fetch('/api/rule-engine/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transaction }),
      });

      const data = await response.json();

      if (data.success) {
        setTestResult(data);
      } else {
        setTestResult({ error: '룰 매칭 실패: ' + data.error });
      }
    } catch (error) {
      console.error('룰 테스트 오류:', error);
      setTestResult({ error: '룰 테스트 중 오류가 발생했습니다.' });
    }
  };

  // AI 피드백 가져오기
  const getAiFeedback = async () => {
    if (!testResult?.matches?.[0]) return;

    setLoadingAiFeedback(true);
    try {
      const response = await fetch('/api/rule-engine/ai-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transaction: testInput,
          matchedRule: testResult.matches[0],
          allRules: testResult.matches,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setAiFeedback(data.feedback);
      } else {
        console.error('AI 피드백 실패:', data.error);
        alert('AI 피드백을 가져올 수 없습니다.');
      }
    } catch (error) {
      console.error('AI 피드백 오류:', error);
      alert('AI 피드백 중 오류가 발생했습니다.');
    } finally {
      setLoadingAiFeedback(false);
    }
  };

  // 피드백 저장
  const saveFeedback = async (feedbackData: any) => {
    try {
      const response = await fetch('/api/rule-engine/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackData),
      });

      const data = await response.json();

      if (data.success) {
        loadFeedback();
        loadAnalytics();
        alert('피드백이 저장되었습니다!');
      } else {
        alert('피드백 저장 실패: ' + data.error);
      }
    } catch (error) {
      console.error('피드백 저장 오류:', error);
      alert('피드백 저장 중 오류가 발생했습니다.');
    }
  };

  // 후보 승인
  const approveCandidate = async (candidateId: number) => {
    try {
      const response = await fetch('/api/rule-engine/candidates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: candidateId }),
      });

      const data = await response.json();

      if (data.success) {
        loadCandidates();
        alert('후보가 승인되어 룰로 생성되었습니다!');
      } else {
        alert('후보 승인 실패: ' + data.error);
      }
    } catch (error) {
      console.error('후보 승인 오류:', error);
      alert('후보 승인 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    loadCandidates();
    loadFeedback();
    loadAnalytics();
  }, []);

  return (
    <div className='space-y-6'>
      {/* 헤더 */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-3xl font-bold tracking-tight'>AI/LLM 관리</h2>
          <p className='text-muted-foreground'>
            하이브리드 룰 엔진, LLM 추론, AI 제안 및 피드백 시스템을 관리합니다
          </p>
        </div>
        <div className='flex gap-2'>
          <Button
            variant='outline'
            onClick={() => {
              loadCandidates();
              loadFeedback();
              loadAnalytics();
            }}
          >
            <Settings2 className='mr-2 h-4 w-4' />
            새로고침
          </Button>
        </div>
      </div>

      <Tabs
        defaultValue='hybrid'
        className='space-y-4'
        onValueChange={setCurrentTab}
      >
        <TabsList className='grid w-full grid-cols-5'>
          <TabsTrigger value='hybrid'>하이브리드 엔진</TabsTrigger>
          <TabsTrigger value='llm-test'>LLM 추론 테스트</TabsTrigger>
          <TabsTrigger value='candidates'>AI 룰 후보</TabsTrigger>
          <TabsTrigger value='feedback'>피드백 관리</TabsTrigger>
          <TabsTrigger value='analytics'>AI 분석</TabsTrigger>
        </TabsList>

        {/* 하이브리드 룰 엔진 탭 */}
        <TabsContent value='hybrid' className='space-y-4'>
          <Card>
            <CardHeader>
              <div className='flex items-center gap-2'>
                <Layers className='h-5 w-5' />
                <CardTitle>하이브리드 룰 엔진 (룰 DB + LLM)</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className='space-y-6'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <Card>
                    <CardHeader className='pb-3'>
                      <CardTitle className='text-sm'>5단계 처리 흐름</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className='space-y-3 text-sm'>
                        <div className='flex items-center gap-2'>
                          <div className='flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs text-white'>
                            1
                          </div>
                          <span>전처리 및 정규화</span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <div className='flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-xs text-white'>
                            2
                          </div>
                          <span>룰 DB 우선 검색</span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <div className='flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500 text-xs text-white'>
                            3
                          </div>
                          <span>규칙 적용 및 사용자 상호작용</span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <div className='flex h-6 w-6 items-center justify-center rounded-full bg-purple-500 text-xs text-white'>
                            4
                          </div>
                          <span>LLM 추론</span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <div className='flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white'>
                            5
                          </div>
                          <span>학습 루프</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className='pb-3'>
                      <CardTitle className='text-sm'>
                        신뢰도 기반 처리
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className='space-y-3 text-sm'>
                        <div className='flex items-center justify-between'>
                          <span>신뢰도 ≥ 90%</span>
                          <Badge variant='default'>자동 적용</Badge>
                        </div>
                        <div className='flex items-center justify-between'>
                          <span>신뢰도 70-89%</span>
                          <Badge variant='secondary'>사용자 선택</Badge>
                        </div>
                        <div className='flex items-center justify-between'>
                          <span>신뢰도 &lt; 70%</span>
                          <Badge variant='destructive'>LLM 호출</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className='rounded-lg bg-muted/50 p-4'>
                  <h4 className='mb-3 font-medium'>알고리즘 특징</h4>
                  <div className='grid grid-cols-1 gap-4 text-sm md:grid-cols-3'>
                    <div>
                      <div className='mb-1 font-medium text-blue-600'>
                        계층적 처리
                      </div>
                      <div className='text-muted-foreground'>
                        단계별 처리를 통한 최적화
                      </div>
                    </div>
                    <div>
                      <div className='mb-1 font-medium text-green-600'>
                        비용 최적화
                      </div>
                      <div className='text-muted-foreground'>
                        LLM 호출 최소화
                      </div>
                    </div>
                    <div>
                      <div className='mb-1 font-medium text-purple-600'>
                        자체 학습
                      </div>
                      <div className='text-muted-foreground'>
                        피드백 기반 성능 향상
                      </div>
                    </div>
                  </div>
                </div>

                {/* 하이브리드 엔진 테스트 */}
                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg'>
                      하이브리드 엔진 테스트
                    </CardTitle>
                    <p className='text-sm text-muted-foreground'>
                      거래 내역을 입력하여 하이브리드 엔진의 분류 결과를
                      테스트해보세요
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-4'>
                      <div>
                        <Label>거래 내역 입력</Label>
                        <Textarea
                          placeholder='테스트할 거래 내역을 입력하세요... (예: 스타벅스 강남점)'
                          value={testInput}
                          onChange={e => setTestInput(e.target.value)}
                          rows={3}
                        />
                      </div>

                      <Button
                        onClick={() => testRule(testInput)}
                        disabled={!testInput.trim()}
                      >
                        <Play className='mr-2 h-4 w-4' />
                        하이브리드 엔진 테스트
                      </Button>

                      {testResult && !testResult.error && (
                        <div className='space-y-4'>
                          {/* 5단계 처리 과정 표시 */}
                          <div className='flex items-center justify-between rounded bg-muted p-4'>
                            {[
                              '전처리',
                              '정규화',
                              '룰 매칭',
                              '결과 조합',
                              '출력',
                            ].map((step, idx) => (
                              <div key={step} className='flex items-center'>
                                <div
                                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm text-white ${idx <= 2 ? 'bg-green-500' : 'bg-gray-400'}`}
                                >
                                  {idx + 1}
                                </div>
                                <span className='ml-2 text-sm'>{step}</span>
                                {idx < 4 && <span className='mx-2'>→</span>}
                              </div>
                            ))}
                          </div>

                          {/* 결과 표시 */}
                          {testResult.matches &&
                          testResult.matches.length > 0 ? (
                            <div className='space-y-2'>
                              <h4 className='font-medium'>
                                매칭된 룰 (신뢰도 순)
                              </h4>
                              {testResult.matches.map(
                                (match: any, idx: number) => (
                                  <Card
                                    key={idx}
                                    className={
                                      idx === 0 ? 'border-green-500' : ''
                                    }
                                  >
                                    <CardContent className='p-4'>
                                      <div className='flex items-start justify-between'>
                                        <div>
                                          <p className='font-medium'>
                                            {match.keyword}
                                          </p>
                                          <p className='text-sm text-muted-foreground'>
                                            태그: {match.tag}
                                          </p>
                                          <p className='text-sm text-muted-foreground'>
                                            계정: {match.account}
                                          </p>
                                        </div>
                                        <Badge variant='outline'>
                                          신뢰도: {match.confidence}
                                        </Badge>
                                      </div>
                                    </CardContent>
                                  </Card>
                                )
                              )}

                              {/* 피드백 섹션 */}
                              <Card className='mt-4'>
                                <CardHeader className='pb-3'>
                                  <div className='flex items-center justify-between'>
                                    <div className='flex items-center gap-2'>
                                      <MessageSquare className='h-5 w-5' />
                                      <CardTitle className='text-base'>
                                        피드백 제공
                                      </CardTitle>
                                    </div>
                                    <Button
                                      size='sm'
                                      variant='outline'
                                      onClick={getAiFeedback}
                                      disabled={loadingAiFeedback}
                                    >
                                      {loadingAiFeedback ? (
                                        <>
                                          <div className='mr-2 h-3 w-3 animate-spin rounded-full border-b-2 border-primary' />
                                          분석 중...
                                        </>
                                      ) : (
                                        <>
                                          <Sparkles className='mr-2 h-4 w-4' />
                                          AI 피드백
                                        </>
                                      )}
                                    </Button>
                                  </div>
                                </CardHeader>
                                <CardContent className='space-y-4'>
                                  {/* 빠른 피드백 버튼들 */}
                                  <div className='space-y-3'>
                                    <p className='text-sm text-muted-foreground'>
                                      이 분류 결과가 얼마나 정확한가요?
                                    </p>
                                    <div className='grid grid-cols-2 gap-2 md:grid-cols-4'>
                                      <Button
                                        size='sm'
                                        variant={
                                          selectedFeedback === 'perfect'
                                            ? 'default'
                                            : 'outline'
                                        }
                                        className='h-auto flex-col py-3'
                                        onClick={() => {
                                          setSelectedFeedback('perfect');
                                          saveFeedback({
                                            transaction_text: testInput,
                                            normalized_text:
                                              testResult.normalized ||
                                              testInput,
                                            selected_option: 1,
                                            selected_tag:
                                              testResult.matches[0].tag,
                                            selected_account:
                                              testResult.matches[0].account,
                                            feedback_type: 'positive',
                                            rule_id: testResult.matches[0].id,
                                          });
                                        }}
                                      >
                                        <CheckCircle className='mb-1 h-5 w-5 text-green-600' />
                                        <span className='text-xs'>완벽함</span>
                                        <span className='text-xs text-muted-foreground'>
                                          100%
                                        </span>
                                      </Button>

                                      <Button
                                        size='sm'
                                        variant={
                                          selectedFeedback === 'good'
                                            ? 'default'
                                            : 'outline'
                                        }
                                        className='h-auto flex-col py-3'
                                        onClick={() => {
                                          setSelectedFeedback('good');
                                          if (testResult.matches[1]) {
                                            saveFeedback({
                                              transaction_text: testInput,
                                              normalized_text:
                                                testResult.normalized ||
                                                testInput,
                                              selected_option: 2,
                                              selected_tag:
                                                testResult.matches[1].tag,
                                              selected_account:
                                                testResult.matches[1].account,
                                              feedback_type: 'negative',
                                              rule_id: testResult.matches[0].id,
                                            });
                                          }
                                        }}
                                        disabled={!testResult.matches[1]}
                                      >
                                        <TrendingUp className='mb-1 h-5 w-5 text-blue-600' />
                                        <span className='text-xs'>
                                          거의 맞음
                                        </span>
                                        <span className='text-xs text-muted-foreground'>
                                          70%
                                        </span>
                                      </Button>

                                      <Button
                                        size='sm'
                                        variant={
                                          selectedFeedback === 'partial'
                                            ? 'default'
                                            : 'outline'
                                        }
                                        className='h-auto flex-col py-3'
                                        onClick={() => {
                                          setSelectedFeedback('partial');
                                          saveFeedback({
                                            transaction_text: testInput,
                                            normalized_text:
                                              testResult.normalized ||
                                              testInput,
                                            selected_option: 0,
                                            selected_tag:
                                              testResult.matches[0].tag,
                                            selected_account:
                                              testResult.matches[0].account,
                                            feedback_type: 'negative',
                                            rule_id: testResult.matches[0].id,
                                          });
                                        }}
                                      >
                                        <HelpCircle className='mb-1 h-5 w-5 text-yellow-600' />
                                        <span className='text-xs'>
                                          부분 맞음
                                        </span>
                                        <span className='text-xs text-muted-foreground'>
                                          50%
                                        </span>
                                      </Button>

                                      <Button
                                        size='sm'
                                        variant={
                                          selectedFeedback === 'wrong'
                                            ? 'default'
                                            : 'outline'
                                        }
                                        className='h-auto flex-col py-3'
                                        onClick={() => {
                                          setSelectedFeedback('wrong');
                                          saveFeedback({
                                            transaction_text: testInput,
                                            normalized_text:
                                              testResult.normalized ||
                                              testInput,
                                            selected_option: 0,
                                            selected_tag: '',
                                            selected_account: '',
                                            feedback_type: 'negative',
                                            rule_id: testResult.matches[0].id,
                                          });
                                        }}
                                      >
                                        <XCircle className='mb-1 h-5 w-5 text-red-600' />
                                        <span className='text-xs'>틀렸음</span>
                                        <span className='text-xs text-muted-foreground'>
                                          0%
                                        </span>
                                      </Button>
                                    </div>
                                  </div>

                                  {/* AI 피드백 결과 표시 */}
                                  {aiFeedback && (
                                    <Card className='border-purple-200 bg-purple-50/50 dark:bg-purple-950/20'>
                                      <CardHeader className='pb-3'>
                                        <div className='flex items-center gap-2'>
                                          <Lightbulb className='h-5 w-5 text-purple-600' />
                                          <CardTitle className='text-sm'>
                                            AI 분석 결과
                                          </CardTitle>
                                        </div>
                                      </CardHeader>
                                      <CardContent className='space-y-3 text-sm'>
                                        {/* 정확도 */}
                                        <div className='flex items-center justify-between'>
                                          <span className='font-medium'>
                                            매칭 정확도
                                          </span>
                                          <div className='flex items-center gap-2'>
                                            <div className='h-2 w-24 overflow-hidden rounded-full bg-gray-200'>
                                              <div
                                                className={`h-full ${
                                                  aiFeedback.accuracyScore >= 80
                                                    ? 'bg-green-500'
                                                    : aiFeedback.accuracyScore >=
                                                        60
                                                      ? 'bg-yellow-500'
                                                      : 'bg-red-500'
                                                }`}
                                                style={{
                                                  width: `${aiFeedback.accuracyScore}%`,
                                                }}
                                              />
                                            </div>
                                            <span className='font-medium'>
                                              {aiFeedback.accuracyScore}%
                                            </span>
                                          </div>
                                        </div>

                                        {/* 정확도 이유 */}
                                        <div className='text-muted-foreground'>
                                          {aiFeedback.accuracyReason}
                                        </div>

                                        {/* 개선 제안 */}
                                        {aiFeedback.improvements &&
                                          aiFeedback.improvements.length >
                                            0 && (
                                            <div>
                                              <p className='mb-1 font-medium'>
                                                개선 제안
                                              </p>
                                              <ul className='list-inside list-disc space-y-1 text-muted-foreground'>
                                                {aiFeedback.improvements.map(
                                                  (
                                                    imp: string,
                                                    idx: number
                                                  ) => (
                                                    <li key={idx}>{imp}</li>
                                                  )
                                                )}
                                              </ul>
                                            </div>
                                          )}
                                      </CardContent>
                                    </Card>
                                  )}
                                </CardContent>
                              </Card>
                            </div>
                          ) : (
                            <Card className='border-red-500'>
                              <CardContent className='p-4'>
                                <p className='text-red-600'>
                                  매칭되는 룰이 없습니다.
                                </p>
                                <p className='mt-2 text-sm text-muted-foreground'>
                                  새로운 룰을 생성하거나 기존 룰을 수정해보세요.
                                </p>
                              </CardContent>
                            </Card>
                          )}
                        </div>
                      )}

                      {testResult && testResult.error && (
                        <Card className='border-red-500'>
                          <CardContent className='p-4'>
                            <p className='text-red-600'>{testResult.error}</p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* LLM 추론 테스트 탭 */}
        <TabsContent value='llm-test' className='space-y-4'>
          <Card>
            <CardHeader>
              <div className='flex items-center gap-2'>
                <Brain className='h-5 w-5' />
                <CardTitle>LLM 추론 테스트</CardTitle>
              </div>
              <p className='text-sm text-muted-foreground'>
                순수 LLM 추론 능력을 테스트하고 결과를 비교해보세요
              </p>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div>
                  <Label>거래 내역 입력</Label>
                  <Textarea
                    placeholder='테스트할 거래 내역을 입력하세요... (예: 스타벅스 강남점)'
                    value={testInput}
                    onChange={e => setTestInput(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className='flex gap-2'>
                  <Button
                    onClick={() => testLLMInference(testInput)}
                    disabled={!testInput.trim() || loadingLLM}
                  >
                    {loadingLLM ? (
                      <>
                        <div className='mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-primary' />
                        추론 중...
                      </>
                    ) : (
                      <>
                        <Zap className='mr-2 h-4 w-4' />
                        LLM 추론 실행
                      </>
                    )}
                  </Button>

                  <Button
                    variant='outline'
                    onClick={() => testRule(testInput)}
                    disabled={!testInput.trim()}
                  >
                    <Target className='mr-2 h-4 w-4' />
                    하이브리드 비교
                  </Button>
                </div>

                {llmResult && (
                  <div className='space-y-4'>
                    {llmResult.success && llmResult.data ? (
                      <Card className='border-blue-500'>
                        <CardHeader>
                          <CardTitle className='flex items-center gap-2 text-lg'>
                            <Brain className='h-5 w-5' />
                            LLM 추론 결과
                          </CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <div>
                              <p className='text-sm font-medium'>분류 결과</p>
                              <p className='text-lg'>
                                {llmResult.data.classification}
                              </p>
                            </div>
                            <div>
                              <p className='text-sm font-medium'>신뢰도</p>
                              <div className='flex items-center gap-2'>
                                <div className='h-2 w-24 overflow-hidden rounded-full bg-gray-200'>
                                  <div
                                    className={`h-full ${
                                      llmResult.data.confidence >= 80
                                        ? 'bg-green-500'
                                        : llmResult.data.confidence >= 60
                                          ? 'bg-yellow-500'
                                          : 'bg-red-500'
                                    }`}
                                    style={{
                                      width: `${llmResult.data.confidence}%`,
                                    }}
                                  />
                                </div>
                                <span className='font-medium'>
                                  {llmResult.data.confidence}%
                                </span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <p className='mb-2 text-sm font-medium'>
                              추론 과정
                            </p>
                            <div className='rounded bg-muted p-3 text-sm'>
                              {llmResult.data.reasoning}
                            </div>
                          </div>

                          {llmResult.data.alternative_options &&
                            llmResult.data.alternative_options.length > 0 && (
                              <div>
                                <p className='mb-2 text-sm font-medium'>
                                  대안 분류
                                </p>
                                <div className='space-y-2'>
                                  {llmResult.data.alternative_options.map(
                                    (option, idx) => (
                                      <Card
                                        key={idx}
                                        className='border-l-4 border-l-blue-300'
                                      >
                                        <CardContent className='p-3'>
                                          <div className='flex items-start justify-between'>
                                            <div>
                                              <p className='font-medium'>
                                                {option.tag} / {option.account}
                                              </p>
                                              <p className='text-sm text-muted-foreground'>
                                                {option.reasoning}
                                              </p>
                                            </div>
                                            <Badge variant='secondary'>
                                              {option.confidence}%
                                            </Badge>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                        </CardContent>
                      </Card>
                    ) : (
                      <Card className='border-red-500'>
                        <CardContent className='p-4'>
                          <p className='text-red-600'>
                            {llmResult.error || 'LLM 추론에 실패했습니다.'}
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI 룰 후보 탭 */}
        <TabsContent value='candidates' className='space-y-4'>
          <Card>
            <CardHeader>
              <div className='flex items-center gap-2'>
                <Sparkles className='h-5 w-5' />
                <CardTitle>AI 룰 후보</CardTitle>
              </div>
              <p className='text-sm text-muted-foreground'>
                LLM이 제안한 룰 후보들입니다. 임계값에 도달하면 자동으로 룰로
                승인됩니다.
              </p>
            </CardHeader>
            <CardContent>
              {(candidates || []).length === 0 ? (
                <div className='py-8 text-center'>
                  <AlertCircle className='mx-auto mb-4 h-12 w-12 text-muted-foreground' />
                  <p className='text-lg font-medium'>후보가 없습니다</p>
                  <p className='text-muted-foreground'>
                    룰 엔진 테스트에서 LLM 결과를 선택하면 후보가 생성됩니다.
                  </p>
                </div>
              ) : (
                <div className='space-y-4'>
                  {(candidates || []).map(candidate => (
                    <Card
                      key={candidate.id}
                      className='transition-shadow hover:shadow-md'
                    >
                      <CardContent className='p-4'>
                        <div className='flex items-start justify-between'>
                          <div className='flex-1'>
                            <h4 className='font-medium'>{candidate.keyword}</h4>
                            <div className='mt-2 grid grid-cols-2 gap-4 text-sm'>
                              <div>
                                <span className='text-muted-foreground'>
                                  제안 태그:
                                </span>
                                <span className='ml-2'>
                                  {candidate.suggested_tag}
                                </span>
                              </div>
                              <div>
                                <span className='text-muted-foreground'>
                                  제안 계정:
                                </span>
                                <span className='ml-2'>
                                  {candidate.suggested_account}
                                </span>
                              </div>
                              <div>
                                <span className='text-muted-foreground'>
                                  제안 횟수:
                                </span>
                                <span className='ml-2'>
                                  {candidate.suggestion_count} /{' '}
                                  {candidate.approval_threshold}
                                </span>
                              </div>
                              <div>
                                <span className='text-muted-foreground'>
                                  최초 제안:
                                </span>
                                <span className='ml-2'>
                                  {new Date(
                                    candidate.first_suggested
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className='flex gap-2'>
                            <Button
                              size='sm'
                              onClick={() => approveCandidate(candidate.id)}
                              disabled={candidate.is_approved}
                            >
                              {candidate.is_approved ? '승인됨' : '수동 승인'}
                            </Button>
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

        {/* 피드백 관리 탭 */}
        <TabsContent value='feedback' className='space-y-4'>
          <Card>
            <CardHeader>
              <div className='flex items-center gap-2'>
                <MessageSquare className='h-5 w-5' />
                <CardTitle>피드백 관리</CardTitle>
              </div>
              <p className='text-sm text-muted-foreground'>
                사용자 피드백을 관리하고 분석합니다
              </p>
            </CardHeader>
            <CardContent>
              {feedback.length === 0 ? (
                <div className='py-8 text-center'>
                  <MessageSquare className='mx-auto mb-4 h-12 w-12 text-muted-foreground' />
                  <p className='text-lg font-medium'>피드백이 없습니다</p>
                  <p className='text-muted-foreground'>
                    룰 엔진 테스트에서 피드백을 제공하면 여기에 표시됩니다.
                  </p>
                </div>
              ) : (
                <div className='space-y-4'>
                  {feedback.map(item => (
                    <Card
                      key={item.id}
                      className='transition-shadow hover:shadow-md'
                    >
                      <CardContent className='p-4'>
                        <div className='flex items-start justify-between'>
                          <div className='flex-1'>
                            <div className='mb-2 flex items-center gap-2'>
                              <Badge
                                variant={
                                  item.feedback_type === 'positive'
                                    ? 'default'
                                    : item.feedback_type === 'negative'
                                      ? 'destructive'
                                      : 'secondary'
                                }
                              >
                                {item.feedback_type === 'positive'
                                  ? '긍정'
                                  : item.feedback_type === 'negative'
                                    ? '부정'
                                    : 'LLM'}
                              </Badge>
                              <span className='text-sm text-muted-foreground'>
                                {new Date(item.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className='font-medium'>
                              {item.transaction_text}
                            </p>
                            <div className='mt-2 text-sm text-muted-foreground'>
                              선택된 분류: {item.selected_tag} /{' '}
                              {item.selected_account}
                            </div>
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

        {/* AI 분석 탭 */}
        <TabsContent value='analytics' className='space-y-4'>
          <Card>
            <CardHeader>
              <div className='flex items-center gap-2'>
                <BarChart3 className='h-5 w-5' />
                <CardTitle>AI 분석 대시보드</CardTitle>
              </div>
              <p className='text-sm text-muted-foreground'>
                AI/LLM 사용량과 성능을 분석합니다
              </p>
            </CardHeader>
            <CardContent>
              {analytics ? (
                <div className='space-y-6'>
                  {/* 통계 카드 */}
                  <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
                    <Card className='border-l-4 border-l-blue-500'>
                      <CardContent className='p-4'>
                        <div className='flex items-center justify-between'>
                          <div>
                            <p className='text-sm font-medium text-muted-foreground'>
                              총 LLM 호출
                            </p>
                            <p className='text-2xl font-bold text-blue-600'>
                              {analytics?.total_llm_calls || 0}
                            </p>
                          </div>
                          <Brain className='h-8 w-8 text-blue-600' />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className='border-l-4 border-l-green-500'>
                      <CardContent className='p-4'>
                        <div className='flex items-center justify-between'>
                          <div>
                            <p className='text-sm font-medium text-muted-foreground'>
                              평균 신뢰도
                            </p>
                            <p className='text-2xl font-bold text-green-600'>
                              {analytics?.avg_confidence || 0}%
                            </p>
                          </div>
                          <Target className='h-8 w-8 text-green-600' />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className='border-l-4 border-l-purple-500'>
                      <CardContent className='p-4'>
                        <div className='flex items-center justify-between'>
                          <div>
                            <p className='text-sm font-medium text-muted-foreground'>
                              성공률
                            </p>
                            <p className='text-2xl font-bold text-purple-600'>
                              {analytics?.success_rate || 0}%
                            </p>
                          </div>
                          <CheckCircle className='h-8 w-8 text-purple-600' />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className='border-l-4 border-l-orange-500'>
                      <CardContent className='p-4'>
                        <div className='flex items-center justify-between'>
                          <div>
                            <p className='text-sm font-medium text-muted-foreground'>
                              피드백 총계
                            </p>
                            <p className='text-2xl font-bold text-orange-600'>
                              {(analytics?.feedback_stats?.positive || 0) +
                                (analytics?.feedback_stats?.negative || 0) +
                                (analytics?.feedback_stats?.llm || 0)}
                            </p>
                          </div>
                          <MessageSquare className='h-8 w-8 text-orange-600' />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* 피드백 분포 차트 */}
                  <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                    <Card>
                      <CardHeader>
                        <CardTitle className='text-lg'>피드백 분포</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width='100%' height={300}>
                          <PieChart>
                            <Pie
                              data={[
                                {
                                  name: '긍정',
                                  value:
                                    analytics?.feedback_stats?.positive || 0,
                                },
                                {
                                  name: '부정',
                                  value:
                                    analytics?.feedback_stats?.negative || 0,
                                },
                                {
                                  name: 'LLM',
                                  value: analytics?.feedback_stats?.llm || 0,
                                },
                              ]}
                              cx='50%'
                              cy='50%'
                              labelLine={false}
                              label={({ name, value }) => `${name}: ${value}`}
                              outerRadius={80}
                              fill='#8884d8'
                              dataKey='value'
                            >
                              {[
                                {
                                  name: '긍정',
                                  value:
                                    analytics?.feedback_stats?.positive || 0,
                                },
                                {
                                  name: '부정',
                                  value:
                                    analytics?.feedback_stats?.negative || 0,
                                },
                                {
                                  name: 'LLM',
                                  value: analytics?.feedback_stats?.llm || 0,
                                },
                              ].map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={
                                    CHART_COLORS[index % CHART_COLORS.length]
                                  }
                                />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className='text-lg'>
                          주요 분류 항목
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width='100%' height={300}>
                          <BarChart
                            data={analytics?.common_classifications || []}
                          >
                            <CartesianGrid strokeDasharray='3 3' />
                            <XAxis dataKey='tag' />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey='count' fill='#0088FE' />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <div className='py-8 text-center'>
                  <BarChart3 className='mx-auto mb-4 h-12 w-12 text-muted-foreground' />
                  <p className='text-lg font-medium'>분석 데이터 로딩 중...</p>
                  <p className='text-muted-foreground'>
                    AI 사용량 데이터를 불러오고 있습니다.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
