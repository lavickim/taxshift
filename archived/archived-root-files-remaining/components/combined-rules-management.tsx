'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Trash2, Edit, Plus, Search, BarChart3, Settings, Play, AlertCircle, 
  Cpu, CheckCircle, XCircle, HelpCircle, Sparkles, TrendingUp, 
  AlertTriangle, MessageSquare, Lightbulb, Database, HardDrive, 
  FileText, Code, Table, Layers, BookOpen 
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RuleEngineData {
  id: number;
  keyword: string;
  confidence: number;
  tags: string;
  primary_tag?: string;
  primary_account?: string;
  secondary_tag?: string;
  secondary_account?: string;
  usage_count?: number;
  positive_count?: number;
  negative_count?: number;
  last_used?: Date;
  is_active?: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  success_rate?: number;
}

interface RuleFormData {
  keyword: string;
  confidence: number;
  tags: string;
  primary_tag: string;
  primary_account: string;
  secondary_tag: string;
  secondary_account: string;
  is_active: boolean;
}

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

interface CacheData {
  rawTextHash: string;
  rawText: string;
  uniqueKey: string;
  createdAt: string;
}

interface RegexRule {
  pattern: string;
  category: string;
  confidence: number;
  description: string;
  normalizer_type: string;
  enabled: boolean;
}

const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const ACCOUNT_OPTIONS = [
  '급여', '임차보증금', '소모품비', '접대비', '차량유지비', '통신비', '전력비', 
  '수도광열비', '보험료', '세금과공과', '복리후생비', '여비교통비', '교육훈련비',
  '도서인쇄비', '회의비', '기타판매비', '광고선전비', '수수료', '임대료'
];

export function CombinedRulesManagement() {
  const [rules, setRules] = useState<RuleEngineData[]>([]);
  const [candidates, setCandidates] = useState<RuleCandidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const [editingRule, setEditingRule] = useState<RuleEngineData | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [testInput, setTestInput] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [currentTab, setCurrentTab] = useState('overview');
  const [showAiSuggest, setShowAiSuggest] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<any>(null);
  const [loadingAiFeedback, setLoadingAiFeedback] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<string | null>(null);
  
  // 캐시 데이터 상태
  const [cacheData, setCacheData] = useState<CacheData[]>([]);
  const [cacheLoading, setCacheLoading] = useState(false);
  const [cacheSearch, setCacheSearch] = useState("");

  // 정규식 룰 상태
  const [regexRules, setRegexRules] = useState<RegexRule[]>([]);
  const [regexLoading, setRegexLoading] = useState(false);
  const [regexSearch, setRegexSearch] = useState("");

  // 가이드 문서 상태
  const [guideContent, setGuideContent] = useState<string>("");

  const [formData, setFormData] = useState<RuleFormData>({
    keyword: '',
    confidence: 10,
    tags: '',
    primary_tag: '',
    primary_account: '',
    secondary_tag: '',
    secondary_account: '보통예금',
    is_active: true
  });

  // 룰 목록 로드
  const loadRules = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterActive !== null) params.append('is_active', filterActive.toString());
      
      const response = await fetch(`/api/rules/combined?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setRules(data.data.rules);
      } else {
        console.error('룰 로드 실패:', data.error);
      }
    } catch (error) {
      console.error('룰 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  // 후보 목록 로드
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

  // 캐시 데이터 로드
  const loadCacheData = async () => {
    setCacheLoading(true);
    try {
      const response = await fetch('/api/cache/all');
      if (response.ok) {
        const data = await response.json();
        setCacheData(data.data || []);
      } else {
        console.error('캐시 데이터 로드 실패:', response.statusText);
      }
    } catch (error) {
      console.error('캐시 데이터 로드 에러:', error);
    } finally {
      setCacheLoading(false);
    }
  };

  // 정규식 룰 로드
  const loadRegexRules = async () => {
    setRegexLoading(true);
    try {
      const response = await fetch('/data/regex-rules.csv');
      const text = await response.text();
      
      // CSV 파싱
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
      const rules: RegexRule[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
          const values = line.split(',').map(v => v.replace(/"/g, ''));
          rules.push({
            pattern: values[0],
            category: values[1],
            confidence: parseFloat(values[2]),
            description: values[3],
            normalizer_type: values[4],
            enabled: values[5] === 'true'
          });
        }
      }
      
      setRegexRules(rules);
    } catch (error) {
      console.error('정규식 룰 로드 오류:', error);
    } finally {
      setRegexLoading(false);
    }
  };

  // 가이드 문서 로드
  const loadGuideContent = async () => {
    try {
      const response = await fetch('/docs/regex-usage-guide.md');
      const text = await response.text();
      setGuideContent(text);
    } catch (error) {
      console.error('가이드 문서 로드 오류:', error);
    }
  };

  // 룰 생성
  const createRule = async () => {
    try {
      const response = await fetch('/api/rules/combined', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setShowCreateDialog(false);
        resetForm();
        loadRules();
        alert('룰이 성공적으로 생성되었습니다!');
      } else {
        alert('룰 생성 실패: ' + data.error);
      }
    } catch (error) {
      console.error('룰 생성 오류:', error);
      alert('룰 생성 중 오류가 발생했습니다.');
    }
  };

  // AI 제안 받기
  const getAiSuggestion = async (keyword: string) => {
    try {
      const response = await fetch('/api/rule-engine/ai-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setFormData(prev => ({
          ...prev,
          confidence: data.data.confidence,
          tags: data.data.tags,
          primary_tag: data.data.primary_tag,
          primary_account: data.data.primary_account,
          secondary_tag: data.data.secondary_tag,
          secondary_account: data.data.secondary_account || '보통예금'
        }));
        setShowAiSuggest(false);
      } else {
        alert('AI 제안 실패: ' + data.error);
      }
    } catch (error) {
      console.error('AI 제안 오류:', error);
      alert('AI 제안 중 오류가 발생했습니다.');
    }
  };

  // 룰 수정
  const updateRule = async () => {
    if (!editingRule) return;
    
    try {
      const response = await fetch('/api/rules/combined', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingRule.id, ...formData })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setEditingRule(null);
        resetForm();
        loadRules();
        alert('룰이 성공적으로 수정되었습니다!');
      } else {
        alert('룰 수정 실패: ' + data.error);
      }
    } catch (error) {
      console.error('룰 수정 오류:', error);
      alert('룰 수정 중 오류가 발생했습니다.');
    }
  };

  // 룰 삭제
  const deleteRule = async (ruleId: number) => {
    if (!confirm('정말 이 룰을 삭제하시겠습니까?')) return;
    
    try {
      const response = await fetch(`/api/rules/combined?id=${ruleId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        loadRules();
        alert('룰이 성공적으로 삭제되었습니다!');
      } else {
        alert('룰 삭제 실패: ' + data.error);
      }
    } catch (error) {
      console.error('룰 삭제 오류:', error);
      alert('룰 삭제 중 오류가 발생했습니다.');
    }
  };

  // 전체 룰 삭제
  const deleteAllRules = async () => {
    if (!confirm('정말 모든 룰을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;
    
    try {
      const response = await fetch('/api/rules/combined?delete_all=true', {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        loadRules();
        alert(`${data.deletedCount}개의 룰이 삭제되었습니다!`);
      } else {
        alert('전체 삭제 실패: ' + data.error);
      }
    } catch (error) {
      console.error('전체 삭제 오류:', error);
      alert('전체 삭제 중 오류가 발생했습니다.');
    }
  };

  // 룰 테스트
  const testRule = async (transaction: string) => {
    if (!transaction.trim()) return;
    
    // 이전 결과 초기화
    setAiFeedback(null);
    setSelectedFeedback(null);
    
    try {
      const response = await fetch('/api/rule-engine/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transaction })
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

  // 피드백 저장
  const saveFeedback = async (feedbackData: any) => {
    try {
      const response = await fetch('/api/rule-engine/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        loadRules(); // 룰 목록 새로고침
        alert('피드백이 저장되었습니다!');
      } else {
        alert('피드백 저장 실패: ' + data.error);
      }
    } catch (error) {
      console.error('피드백 저장 오류:', error);
      alert('피드백 저장 중 오류가 발생했습니다.');
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
          allRules: testResult.matches
        })
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

  // 폼 초기화
  const resetForm = () => {
    setFormData({
      keyword: '',
      confidence: 10,
      tags: '',
      primary_tag: '',
      primary_account: '',
      secondary_tag: '',
      secondary_account: '보통예금',
      is_active: true
    });
  };

  // 편집 모드 시작
  const startEdit = (rule: RuleEngineData) => {
    setEditingRule(rule);
    setFormData({
      keyword: rule.keyword,
      confidence: rule.confidence,
      tags: rule.tags,
      primary_tag: rule.primary_tag || '',
      primary_account: rule.primary_account || '',
      secondary_tag: rule.secondary_tag || '',
      secondary_account: rule.secondary_account || '보통예금',
      is_active: rule.is_active || true
    });
  };

  // 후보 승인
  const approveCandidate = async (candidateId: number) => {
    try {
      const response = await fetch('/api/rule-engine/candidates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: candidateId })
      });
      
      const data = await response.json();
      
      if (data.success) {
        loadCandidates();
        loadRules();
        alert('후보가 승인되어 룰로 생성되었습니다!');
      } else {
        alert('후보 승인 실패: ' + data.error);
      }
    } catch (error) {
      console.error('후보 승인 오류:', error);
      alert('후보 승인 중 오류가 발생했습니다.');
    }
  };

  // 통계 데이터 생성
  const getStatistics = () => {
    const activeRules = rules.filter(r => r.is_active !== false).length;
    const inactiveRules = rules.filter(r => r.is_active === false).length;
    const avgConfidence = rules.length > 0 ? 
      rules.reduce((sum, r) => sum + r.confidence, 0) / rules.length : 0;
    const totalUsage = rules.reduce((sum, r) => sum + (r.usage_count || 0), 0);
    const avgSuccessRate = rules.length > 0 ?
      rules.reduce((sum, r) => sum + (r.success_rate || 0), 0) / rules.length : 0;
    
    // 계정별 분포
    const accountDistribution = rules.reduce((acc, rule) => {
      const account = rule.primary_account || '미분류';
      acc[account] = (acc[account] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const accountChartData = Object.entries(accountDistribution)
      .map(([account, count]) => ({ account, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // 상위 10개만

    // 태그별 분포
    const tagDistribution = rules.reduce((acc, rule) => {
      const tags = (rule.tags || '').split(',').map(t => t.trim()).filter(t => t);
      tags.forEach(tag => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    const tagChartData = Object.entries(tagDistribution)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      total: rules.length,
      active: activeRules,
      inactive: inactiveRules,
      avgConfidence: avgConfidence.toFixed(1),
      totalUsage,
      avgSuccessRate: avgSuccessRate.toFixed(1),
      accountChartData,
      tagChartData,
      pendingCandidates: (candidates || []).filter(c => !c.is_approved).length
    };
  };

  useEffect(() => {
    loadRules();
    if (currentTab === 'candidates') {
      loadCandidates();
    }
    if (currentTab === 'cache') {
      loadCacheData();
    }
    if (currentTab === 'regex-csv') {
      loadRegexRules();
    }
    if (currentTab === 'overview') {
      loadGuideContent();
    }
  }, [searchTerm, filterActive, currentTab]);

  const stats = getStatistics();

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">통합 룰 관리</h2>
          <p className="text-muted-foreground">
            AI 거래 분류를 위한 규칙을 생성, 관리
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                새 룰 생성
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>새 룰 생성</DialogTitle>
              </DialogHeader>
              <RuleForm 
                formData={formData} 
                setFormData={setFormData} 
                onSubmit={createRule}
                onCancel={() => setShowCreateDialog(false)}
                showAiSuggest={showAiSuggest}
                setShowAiSuggest={setShowAiSuggest}
                onAiSuggest={getAiSuggestion}
              />
            </DialogContent>
          </Dialog>
          
          <Button 
            variant="destructive" 
            onClick={deleteAllRules}
            disabled={rules.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            전체 삭제
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4" onValueChange={setCurrentTab}>
        <TabsList>
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="rules">키워드 룰</TabsTrigger>
          <TabsTrigger value="regex-hardcoded">정규식 룰</TabsTrigger>
          <TabsTrigger value="regex-csv">CSV 정규식</TabsTrigger>
          <TabsTrigger value="hybrid">하이브리드</TabsTrigger>
          <TabsTrigger value="test">룰 엔진 테스트</TabsTrigger>
          <TabsTrigger value="candidates">신규 룰 후보</TabsTrigger>
          <TabsTrigger value="cache">캐시 데이터</TabsTrigger>
          <TabsTrigger value="analytics">분석 대시보드</TabsTrigger>
        </TabsList>

        {/* 개요 탭 */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                <CardTitle>정규 표현식 사용 가이드</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                {guideContent ? (
                  <div className="prose prose-slate prose-sm max-w-none dark:prose-invert dark:text-gray-100 dark:bg-gray-900/20 p-6 rounded-lg [&_h1]:dark:text-white [&_h2]:dark:text-gray-100 [&_h3]:dark:text-gray-200 [&_code]:dark:bg-gray-800 [&_code]:dark:text-gray-200 [&_pre]:dark:bg-gray-800 [&_strong]:dark:text-white">
                    <ReactMarkdown>
                      {guideContent}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium">가이드 문서를 로드하고 있습니다...</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 정규식 룰 엔진 탭 */}
        <TabsContent value="regex-hardcoded" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                <CardTitle>정규식 기반 룰 엔진 (하드코딩)</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">성능 특성</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>처리 속도:</span>
                          <Badge variant="secondary">~0.1ms</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>정확도:</span>
                          <Badge variant="secondary">95-99%</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>유지보수:</span>
                          <Badge variant="destructive">어려움</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">지원 카테고리</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>주유소:</span>
                          <Badge variant="outline">95%</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>편의점:</span>
                          <Badge variant="outline">95%</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>카센터:</span>
                          <Badge variant="outline">90%</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>온라인:</span>
                          <Badge variant="outline">95%</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">파일 위치</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1 text-xs font-mono">
                        <div>lib/services/regex-rule-engine.ts</div>
                        <div>__tests__/services/regex-rule-engine.test.ts</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">주요 패턴 예시</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm font-mono">
                    <div>
                      <div className="font-medium text-muted-foreground">주유소 패턴</div>
                      <div className="bg-background p-2 rounded border">
                        /(.+?)\(상\)주/i<br/>
                        /(.+?)\(하\)주/i
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-muted-foreground">편의점 패턴</div>
                      <div className="bg-background p-2 rounded border">
                        /GS25/i<br/>
                        /\bCU\b/i
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CSV 정규식 룰 엔진 탭 */}
        <TabsContent value="regex-csv" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Table className="h-5 w-5" />
                  <CardTitle>CSV 정규식 룰 엔진</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={loadRegexRules}>
                    새로고침
                  </Button>
                  <Badge variant="outline">
                    총 {regexRules.length}개 룰
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  <Input
                    placeholder="패턴 검색..."
                    value={regexSearch}
                    onChange={(e) => setRegexSearch(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                
                {regexLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">CSV 파일을 로드하고 있습니다...</p>
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-4 py-3 text-left font-medium text-sm">패턴</th>
                          <th className="px-4 py-3 text-left font-medium text-sm">카테고리</th>
                          <th className="px-4 py-3 text-left font-medium text-sm">신뢰도</th>
                          <th className="px-4 py-3 text-left font-medium text-sm">설명</th>
                          <th className="px-4 py-3 text-left font-medium text-sm">상태</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {regexRules
                          .filter(rule => 
                            rule.pattern.toLowerCase().includes(regexSearch.toLowerCase()) ||
                            rule.category.toLowerCase().includes(regexSearch.toLowerCase()) ||
                            rule.description.toLowerCase().includes(regexSearch.toLowerCase())
                          )
                          .map((rule, index) => (
                            <tr key={index} className="hover:bg-muted/20">
                              <td className="px-4 py-3 font-mono text-sm">{rule.pattern}</td>
                              <td className="px-4 py-3">
                                <Badge variant="outline">{rule.category}</Badge>
                              </td>
                              <td className="px-4 py-3">
                                <Badge variant="secondary">{rule.confidence}</Badge>
                              </td>
                              <td className="px-4 py-3 text-sm text-muted-foreground">{rule.description}</td>
                              <td className="px-4 py-3">
                                <Badge variant={rule.enabled ? "default" : "destructive"}>
                                  {rule.enabled ? "활성" : "비활성"}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 하이브리드 룰 엔진 탭 */}
        <TabsContent value="hybrid" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                <CardTitle>하이브리드 룰 엔진 (룰 DB + LLM)</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">5단계 처리 흐름</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">1</div>
                          <span>전처리 및 정규화</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">2</div>
                          <span>룰 DB 우선 검색</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs">3</div>
                          <span>규칙 적용 및 사용자 상호작용</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs">4</div>
                          <span>LLM 추론</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">5</div>
                          <span>학습 루프</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">신뢰도 기반 처리</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center">
                          <span>신뢰도 ≥ 90%</span>
                          <Badge variant="default">자동 적용</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>신뢰도 70-89%</span>
                          <Badge variant="secondary">사용자 선택</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>신뢰도 &lt; 70%</span>
                          <Badge variant="destructive">LLM 호출</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-3">알고리즘 특징</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="font-medium text-blue-600 mb-1">계층적 처리</div>
                      <div className="text-muted-foreground">단계별 처리를 통한 최적화</div>
                    </div>
                    <div>
                      <div className="font-medium text-green-600 mb-1">비용 최적화</div>
                      <div className="text-muted-foreground">LLM 호출 최소화</div>
                    </div>
                    <div>
                      <div className="font-medium text-purple-600 mb-1">자체 학습</div>
                      <div className="text-muted-foreground">피드백 기반 성능 향상</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-3">파일 위치</h4>
                  <div className="space-y-1 text-xs font-mono">
                    <div>project-design/runleendgine.md</div>
                    <div>components/rule-engine-content.tsx</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 키워드 룰 목록 탭 */}
        <TabsContent value="rules" className="space-y-4">
          {/* 필터 및 검색 */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4 items-center">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                    <Input
                      placeholder="룰 이름, 설명, 패턴으로 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select onValueChange={(value) => setFilterActive(value === 'all' ? null : value === 'true')}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="상태 필터" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="true">활성</SelectItem>
                    <SelectItem value="false">비활성</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* 통계 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">총 룰 개수</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <Settings className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">활성 룰</p>
                    <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                  </div>
                  <Badge variant="outline" className="text-green-600">Active</Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">비활성 룰</p>
                    <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
                  </div>
                  <Badge variant="outline" className="text-red-600">Inactive</Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">평균 신뢰도</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.avgConfidence}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">총 사용 횟수</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.totalUsage}</p>
                  </div>
                  <Badge variant="outline" className="text-purple-600">Total</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">평균 성공률</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.avgSuccessRate}%</p>
                  </div>
                  <Badge variant="outline" className="text-orange-600">Success</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">대기중인 후보</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pendingCandidates}</p>
                  </div>
                  <Badge variant="outline" className="text-yellow-600">Pending</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 룰 목록 */}
          <div className="space-y-4">
            {loading ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">룰을 로드하고 있습니다...</p>
                </CardContent>
              </Card>
            ) : rules.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium">룰이 없습니다</p>
                  <p className="text-muted-foreground">새 룰을 생성해보세요.</p>
                </CardContent>
              </Card>
            ) : (
              rules.map((rule) => (
                <Card key={rule.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{rule.keyword}</h3>
                      <Badge variant={rule.is_active !== false ? "default" : "secondary"}>
                        {rule.is_active !== false ? "활성" : "비활성"}
                      </Badge>
                      <Badge variant="outline">신뢰도: {rule.confidence}</Badge>
                      {rule.usage_count && rule.usage_count > 0 && (
                        <Badge variant="outline">사용: {rule.usage_count}회</Badge>
                      )}
                      {rule.success_rate !== undefined && (
                        <Badge variant="outline" className={rule.success_rate >= 80 ? "text-green-600" : rule.success_rate >= 50 ? "text-yellow-600" : "text-red-600"}>
                          성공률: {rule.success_rate}%
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">태그:</span>
                        <span className="ml-2 text-purple-600">{rule.tags || '-'}</span>
                      </div>
                      <div>
                        <span className="font-medium">1순위:</span>
                        <span className="ml-2 text-blue-600">{rule.primary_tag || '-'} / {rule.primary_account || '-'}</span>
                      </div>
                      <div>
                        <span className="font-medium">2순위:</span>
                        <span className="ml-2 text-green-600">{rule.secondary_tag || '-'} / {rule.secondary_account || '-'}</span>
                      </div>
                      <div>
                        <span className="font-medium">생성:</span>
                        <span className="ml-2 text-muted-foreground">{rule.created_by || 'ADMIN'}</span>
                      </div>
                    </div>
                  </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => startEdit(rule)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => deleteRule(rule.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* 분석 대시보드 탭 */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 계정별 분포 */}
            <Card>
              <CardHeader>
                <CardTitle>계정별 룰 분포</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.accountChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="account" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      fontSize={12}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#0088FE" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* 태그별 분포 */}
            <Card>
              <CardHeader>
                <CardTitle>태그별 분포</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.tagChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ tag, count }) => `${tag}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {stats.tagChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 룰 테스트 탭 */}
        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>룰 엔진 테스트</CardTitle>
              <p className="text-sm text-muted-foreground">
                거래 내역을 입력하여 룰 엔진의 분류 결과를 테스트해보세요
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>거래 내역 입력</Label>
                  <Textarea
                    placeholder="테스트할 거래 내역을 입력하세요... (예: 스타벅스 강남점)"
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    rows={3}
                  />
                </div>
                
                <Button onClick={() => testRule(testInput)} disabled={!testInput.trim()}>
                  <Play className="h-4 w-4 mr-2" />
                  테스트 실행
                </Button>
                
                {testResult && !testResult.error && (
                  <div className="space-y-4">
                    {/* 5단계 처리 과정 표시 */}
                    <div className="flex items-center justify-between p-4 bg-muted rounded">
                      {['전처리', '정규화', '룰 매칭', '결과 조합', '출력'].map((step, idx) => (
                        <div key={step} className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${idx <= 2 ? 'bg-green-500' : 'bg-gray-400'}`}>
                            {idx + 1}
                          </div>
                          <span className="ml-2 text-sm">{step}</span>
                          {idx < 4 && <span className="mx-2">→</span>}
                        </div>
                      ))}
                    </div>

                    {/* 결과 표시 */}
                    {testResult.matches && testResult.matches.length > 0 ? (
                      <div className="space-y-2">
                        <h4 className="font-medium">매칭된 룰 (신뢰도 순)</h4>
                        {testResult.matches.map((match: any, idx: number) => (
                          <Card key={idx} className={idx === 0 ? 'border-green-500' : ''}>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">{match.keyword}</p>
                                  <p className="text-sm text-muted-foreground">태그: {match.tag}</p>
                                  <p className="text-sm text-muted-foreground">계정: {match.account}</p>
                                </div>
                                <Badge variant="outline">신뢰도: {match.confidence}</Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        
                        {/* 개선된 피드백 섹션 */}
                        <Card className="mt-4">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5" />
                                <CardTitle className="text-base">피드백 제공</CardTitle>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={getAiFeedback}
                                disabled={loadingAiFeedback}
                              >
                                {loadingAiFeedback ? (
                                  <>
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary mr-2" />
                                    분석 중...
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    AI 피드백
                                  </>
                                )}
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {/* 빠른 피드백 버튼들 */}
                            <div className="space-y-3">
                              <p className="text-sm text-muted-foreground">이 분류 결과가 얼마나 정확한가요?</p>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                <Button
                                  size="sm"
                                  variant={selectedFeedback === 'perfect' ? 'default' : 'outline'}
                                  className="h-auto flex-col py-3"
                                  onClick={() => {
                                    setSelectedFeedback('perfect');
                                    saveFeedback({
                                      transaction_text: testInput,
                                      normalized_text: testResult.normalized || testInput,
                                      selected_option: 1,
                                      selected_tag: testResult.matches[0].tag,
                                      selected_account: testResult.matches[0].account,
                                      feedback_type: 'positive',
                                      rule_id: testResult.matches[0].id
                                    });
                                  }}
                                >
                                  <CheckCircle className="h-5 w-5 text-green-600 mb-1" />
                                  <span className="text-xs">완벽함</span>
                                  <span className="text-xs text-muted-foreground">100%</span>
                                </Button>
                                
                                <Button
                                  size="sm"
                                  variant={selectedFeedback === 'good' ? 'default' : 'outline'}
                                  className="h-auto flex-col py-3"
                                  onClick={() => {
                                    setSelectedFeedback('good');
                                    if (testResult.matches[1]) {
                                      saveFeedback({
                                        transaction_text: testInput,
                                        normalized_text: testResult.normalized || testInput,
                                        selected_option: 2,
                                        selected_tag: testResult.matches[1].tag,
                                        selected_account: testResult.matches[1].account,
                                        feedback_type: 'negative',
                                        rule_id: testResult.matches[0].id
                                      });
                                    }
                                  }}
                                  disabled={!testResult.matches[1]}
                                >
                                  <TrendingUp className="h-5 w-5 text-blue-600 mb-1" />
                                  <span className="text-xs">거의 맞음</span>
                                  <span className="text-xs text-muted-foreground">70%</span>
                                </Button>
                                
                                <Button
                                  size="sm"
                                  variant={selectedFeedback === 'partial' ? 'default' : 'outline'}
                                  className="h-auto flex-col py-3"
                                  onClick={() => {
                                    setSelectedFeedback('partial');
                                    saveFeedback({
                                      transaction_text: testInput,
                                      normalized_text: testResult.normalized || testInput,
                                      selected_option: 0,
                                      selected_tag: testResult.matches[0].tag,
                                      selected_account: testResult.matches[0].account,
                                      feedback_type: 'negative',
                                      rule_id: testResult.matches[0].id
                                    });
                                  }}
                                >
                                  <HelpCircle className="h-5 w-5 text-yellow-600 mb-1" />
                                  <span className="text-xs">부분 맞음</span>
                                  <span className="text-xs text-muted-foreground">50%</span>
                                </Button>
                                
                                <Button
                                  size="sm"
                                  variant={selectedFeedback === 'wrong' ? 'default' : 'outline'}
                                  className="h-auto flex-col py-3"
                                  onClick={() => {
                                    setSelectedFeedback('wrong');
                                    saveFeedback({
                                      transaction_text: testInput,
                                      normalized_text: testResult.normalized || testInput,
                                      selected_option: 0,
                                      selected_tag: '',
                                      selected_account: '',
                                      feedback_type: 'negative',
                                      rule_id: testResult.matches[0].id
                                    });
                                  }}
                                >
                                  <XCircle className="h-5 w-5 text-red-600 mb-1" />
                                  <span className="text-xs">틀렸음</span>
                                  <span className="text-xs text-muted-foreground">0%</span>
                                </Button>
                              </div>
                            </div>

                            {/* 추가 피드백 옵션 */}
                            <div className="space-y-2">
                              <p className="text-sm font-medium">추가 조치가 필요한가요?</p>
                              <div className="flex flex-wrap gap-2">
                                <Button size="sm" variant="outline" className="text-xs">
                                  <Edit className="h-3 w-3 mr-1" />
                                  룰 수정 필요
                                </Button>
                                <Button size="sm" variant="outline" className="text-xs">
                                  <Plus className="h-3 w-3 mr-1" />
                                  새 룰 생성 필요
                                </Button>
                                <Button size="sm" variant="outline" className="text-xs">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  신뢰도 조정 필요
                                </Button>
                              </div>
                            </div>

                            {/* AI 피드백 결과 표시 */}
                            {aiFeedback && (
                              <Card className="border-purple-200 bg-purple-50/50 dark:bg-purple-950/20">
                                <CardHeader className="pb-3">
                                  <div className="flex items-center gap-2">
                                    <Lightbulb className="h-5 w-5 text-purple-600" />
                                    <CardTitle className="text-sm">AI 분석 결과</CardTitle>
                                  </div>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                  {/* 정확도 */}
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium">매칭 정확도</span>
                                    <div className="flex items-center gap-2">
                                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div 
                                          className={`h-full ${
                                            aiFeedback.accuracyScore >= 80 ? 'bg-green-500' :
                                            aiFeedback.accuracyScore >= 60 ? 'bg-yellow-500' :
                                            'bg-red-500'
                                          }`}
                                          style={{ width: `${aiFeedback.accuracyScore}%` }}
                                        />
                                      </div>
                                      <span className="font-medium">{aiFeedback.accuracyScore}%</span>
                                    </div>
                                  </div>
                                  
                                  {/* 정확도 이유 */}
                                  <div className="text-muted-foreground">
                                    {aiFeedback.accuracyReason}
                                  </div>

                                  {/* 개선 제안 */}
                                  {aiFeedback.improvements && aiFeedback.improvements.length > 0 && (
                                    <div>
                                      <p className="font-medium mb-1">개선 제안</p>
                                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                        {aiFeedback.improvements.map((imp: string, idx: number) => (
                                          <li key={idx}>{imp}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {/* 주의사항 */}
                                  {aiFeedback.warnings && aiFeedback.warnings.length > 0 && (
                                    <div className="bg-yellow-100 dark:bg-yellow-900/20 p-3 rounded">
                                      <p className="font-medium mb-1 flex items-center gap-1">
                                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                        주의사항
                                      </p>
                                      <ul className="list-disc list-inside space-y-1 text-sm">
                                        {aiFeedback.warnings.map((warning: string, idx: number) => (
                                          <li key={idx}>{warning}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {/* 신뢰도 조정 제안 */}
                                  {aiFeedback.confidenceAdjustment && 
                                   aiFeedback.confidenceAdjustment.current !== aiFeedback.confidenceAdjustment.suggested && (
                                    <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded">
                                      <p className="font-medium mb-1">신뢰도 조정 제안</p>
                                      <p className="text-sm">
                                        현재 {aiFeedback.confidenceAdjustment.current} → 
                                        <span className="font-bold"> {aiFeedback.confidenceAdjustment.suggested}</span>
                                      </p>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {aiFeedback.confidenceAdjustment.reason}
                                      </p>
                                    </div>
                                  )}

                                  {/* 대안 분류 */}
                                  {aiFeedback.alternativeClassification && (
                                    <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded">
                                      <p className="font-medium mb-1">대안 분류 제안</p>
                                      <p className="text-sm">
                                        태그: {aiFeedback.alternativeClassification.tag} / 
                                        계정: {aiFeedback.alternativeClassification.account}
                                      </p>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {aiFeedback.alternativeClassification.reason}
                                      </p>
                                    </div>
                                  )}

                                  {/* 전반적인 통찰 */}
                                  {aiFeedback.insights && (
                                    <div className="border-t pt-3">
                                      <p className="text-muted-foreground italic">
                                        💡 {aiFeedback.insights}
                                      </p>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    ) : (
                      <Card className="border-red-500">
                        <CardContent className="p-4">
                          <p className="text-red-600">매칭되는 룰이 없습니다.</p>
                          <p className="text-sm text-muted-foreground mt-2">
                            새로운 룰을 생성하거나 기존 룰을 수정해보세요.
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
                
                {testResult && testResult.error && (
                  <Card className="border-red-500">
                    <CardContent className="p-4">
                      <p className="text-red-600">{testResult.error}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 신규 룰 후보 탭 */}
        <TabsContent value="candidates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>신규 룰 후보</CardTitle>
              <p className="text-sm text-muted-foreground">
                LLM이 제안한 룰 후보들입니다. 임계값에 도달하면 자동으로 룰로 승인됩니다.
              </p>
            </CardHeader>
            <CardContent>
              {(candidates || []).length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium">후보가 없습니다</p>
                  <p className="text-muted-foreground">룰 엔진 테스트에서 LLM 결과를 선택하면 후보가 생성됩니다.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {(candidates || []).map((candidate) => (
                    <Card key={candidate.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium">{candidate.keyword}</h4>
                            <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">제안 태그:</span>
                                <span className="ml-2">{candidate.suggested_tag}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">제안 계정:</span>
                                <span className="ml-2">{candidate.suggested_account}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">제안 횟수:</span>
                                <span className="ml-2">{candidate.suggestion_count} / {candidate.approval_threshold}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">최초 제안:</span>
                                <span className="ml-2">{new Date(candidate.first_suggested).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => approveCandidate(candidate.id)}
                            disabled={candidate.is_approved}
                          >
                            {candidate.is_approved ? '승인됨' : '수동 승인'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 캐시 데이터 탭 */}
        <TabsContent value="cache" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5" />
                  <CardTitle>캐시 데이터 관리</CardTitle>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-sm">
                    총 {cacheData.filter(item => 
                      item.rawText.toLowerCase().includes(cacheSearch.toLowerCase()) ||
                      item.uniqueKey.toLowerCase().includes(cacheSearch.toLowerCase()) ||
                      item.rawTextHash.toLowerCase().includes(cacheSearch.toLowerCase())
                    ).length}개 항목
                  </Badge>
                  <Button 
                    onClick={loadCacheData}
                    disabled={cacheLoading}
                    variant="outline"
                    size="sm"
                  >
                    {cacheLoading ? '🔄 로딩...' : '🔄 새로고침'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 통계 카드들 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">총 캐시 레코드</p>
                        <p className="text-2xl font-bold text-blue-600">{cacheData.length.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground mt-1">전체 캐시 데이터</p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-950/20 flex items-center justify-center">
                        <Database className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">검색 결과</p>
                        <p className="text-2xl font-bold text-green-600">
                          {cacheData.filter(item => 
                            item.rawText.toLowerCase().includes(cacheSearch.toLowerCase()) ||
                            item.uniqueKey.toLowerCase().includes(cacheSearch.toLowerCase()) ||
                            item.rawTextHash.toLowerCase().includes(cacheSearch.toLowerCase())
                          ).length.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">필터링된 결과</p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-950/20 flex items-center justify-center">
                        <Search className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">캐시 상태</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {cacheLoading ? (
                            <span className="text-orange-600">로딩중</span>
                          ) : (
                            <span className="text-green-600">정상</span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">시스템 상태</p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-950/20 flex items-center justify-center">
                        {cacheLoading ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600" />
                        ) : (
                          <CheckCircle className="h-5 w-5 text-purple-600" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">마지막 업데이트</p>
                        <p className="text-lg font-bold text-orange-600">
                          {cacheData.length > 0 ? '방금 전' : 'N/A'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">최근 갱신</p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-950/20 flex items-center justify-center">
                        <Settings className="h-5 w-5 text-orange-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 검색 입력 */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                    <Input
                      placeholder="원본 텍스트, 고유 키, 해시로 검색..."
                      value={cacheSearch}
                      onChange={(e) => setCacheSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* 캐시 데이터 테이블 */}
              <div className="border rounded-lg">
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          순번
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          해시
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          원본 텍스트
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          고유 키
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          생성일시
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {cacheLoading ? (
                        <tr>
                          <td colSpan={5} className="text-center py-8">
                            <div className="flex items-center justify-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                              <span>데이터 로딩 중...</span>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        cacheData
                          .filter(item => 
                            item.rawText.toLowerCase().includes(cacheSearch.toLowerCase()) ||
                            item.uniqueKey.toLowerCase().includes(cacheSearch.toLowerCase()) ||
                            item.rawTextHash.toLowerCase().includes(cacheSearch.toLowerCase())
                          )
                          .length === 0 ? (
                          <tr>
                            <td colSpan={5} className="text-center py-8 text-muted-foreground">
                              {cacheSearch ? '검색 결과가 없습니다.' : '캐시 데이터가 없습니다.'}
                            </td>
                          </tr>
                        ) : (
                          cacheData
                            .filter(item => 
                              item.rawText.toLowerCase().includes(cacheSearch.toLowerCase()) ||
                              item.uniqueKey.toLowerCase().includes(cacheSearch.toLowerCase()) ||
                              item.rawTextHash.toLowerCase().includes(cacheSearch.toLowerCase())
                            )
                            .map((item, index) => (
                              <tr key={item.rawTextHash} className="hover:bg-muted/50">
                                <td className="px-4 py-2">
                                  <Badge variant="outline" className="text-xs">
                                    {index + 1}
                                  </Badge>
                                </td>
                                <td className="px-4 py-2">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="font-mono text-xs">
                                      {item.rawTextHash.substring(0, 8)}...
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">64자 해시</span>
                                  </div>
                                </td>
                                <td className="px-4 py-2 max-w-xs">
                                  <div className="truncate font-medium">
                                    {item.rawText}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {item.rawText.length}자
                                  </div>
                                </td>
                                <td className="px-4 py-2 max-w-xs">
                                  <div className="truncate">
                                    {item.uniqueKey}
                                  </div>
                                  <Badge variant="outline" className="text-xs mt-1">
                                    고유키
                                  </Badge>
                                </td>
                                <td className="px-4 py-2">
                                  <div className="text-sm font-medium">
                                    {new Date(item.createdAt).toLocaleDateString('ko-KR')}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {new Date(item.createdAt).toLocaleTimeString('ko-KR')}
                                  </div>
                                </td>
                              </tr>
                            ))
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 룰 편집 다이얼로그 */}
      {editingRule && (
        <Dialog open={!!editingRule} onOpenChange={() => setEditingRule(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>룰 편집: {editingRule.keyword}</DialogTitle>
            </DialogHeader>
            <RuleForm 
              formData={formData} 
              setFormData={setFormData} 
              onSubmit={updateRule}
              onCancel={() => setEditingRule(null)}
              isEdit={true}
              showAiSuggest={showAiSuggest}
              setShowAiSuggest={setShowAiSuggest}
              onAiSuggest={getAiSuggestion}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// 룰 폼 컴포넌트
function RuleForm({ 
  formData, 
  setFormData, 
  onSubmit, 
  onCancel, 
  isEdit = false,
  showAiSuggest,
  setShowAiSuggest,
  onAiSuggest 
}: {
  formData: RuleFormData;
  setFormData: (data: RuleFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isEdit?: boolean;
  showAiSuggest?: boolean;
  setShowAiSuggest?: (show: boolean) => void;
  onAiSuggest?: (keyword: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="keyword">키워드 *</Label>
        <div className="flex gap-2">
          <Input
            id="keyword"
            value={formData.keyword}
            onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
            placeholder="예: 스타벅스"
            className="flex-1"
          />
          {!isEdit && onAiSuggest && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (formData.keyword.trim()) {
                  onAiSuggest(formData.keyword);
                }
              }}
              disabled={!formData.keyword.trim()}
            >
              <Cpu className="h-4 w-4 mr-2" />
              AI 도움
            </Button>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="tags">태그 (쉼표로 구분)</Label>
        <Input
          id="tags"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          placeholder="예: 카페, 음료, 커피"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="primary_tag">1순위 태그</Label>
          <Input
            id="primary_tag"
            value={formData.primary_tag}
            onChange={(e) => setFormData({ ...formData, primary_tag: e.target.value })}
            placeholder="예: 카페"
          />
        </div>
        <div>
          <Label htmlFor="primary_account">1순위 계정</Label>
          <Select 
            value={formData.primary_account}
            onValueChange={(value) => setFormData({ ...formData, primary_account: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="계정 선택" />
            </SelectTrigger>
            <SelectContent>
              {ACCOUNT_OPTIONS.map((account) => (
                <SelectItem key={account} value={account}>{account}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="secondary_tag">2순위 태그</Label>
          <Input
            id="secondary_tag"
            value={formData.secondary_tag}
            onChange={(e) => setFormData({ ...formData, secondary_tag: e.target.value })}
            placeholder="예: 음료"
          />
        </div>
        <div>
          <Label htmlFor="secondary_account">2순위 계정</Label>
          <Input
            id="secondary_account"
            value={formData.secondary_account}
            onChange={(e) => setFormData({ ...formData, secondary_account: e.target.value })}
            placeholder="예: 보통예금"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="confidence">신뢰도 (1-20)</Label>
          <Input
            id="confidence"
            type="number"
            min="1"
            max="20"
            value={formData.confidence}
            onChange={(e) => setFormData({ ...formData, confidence: parseInt(e.target.value) || 10 })}
          />
        </div>
        <div className="flex items-center space-x-2 mt-8">
          <Switch
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
          />
          <Label htmlFor="is_active">활성 상태</Label>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          취소
        </Button>
        <Button 
          onClick={onSubmit}
          disabled={!formData.keyword}
        >
          {isEdit ? '수정' : '생성'}
        </Button>
      </div>
    </div>
  );
} 