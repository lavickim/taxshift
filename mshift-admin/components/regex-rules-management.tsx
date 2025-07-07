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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Trash2, Edit, Plus, Search, Play, AlertCircle, CheckCircle, XCircle,
  Database, FileText, Code, TestTube, RefreshCw, Zap
} from 'lucide-react';
import { toast } from 'sonner';

interface RegexRule {
  id?: number;
  pattern: string;
  replacement?: string;
  description: string;
  category: string;
  enabled: boolean;
  priority: number;
  confidence?: number;
  normalizer_type?: string;
  created_at?: string;
  updated_at?: string;
}

interface RuleMatchResponse {
  matched: boolean;
  processedText: string;
  matchedRules: MatchedRule[];
  originalText: string;
}

interface MatchedRule {
  ruleId: number;
  pattern: string;
  replacement?: string;
  description: string;
  category: string;
  priority: number;
  matchedText: string;
  startIndex: number;
  endIndex: number;
}

interface TestResult {
  success: boolean;
  data?: RuleMatchResponse;
  error?: string;
}

const CATEGORIES = [
  '주유소', '편의점', '카센터', '온라인서비스', '레스토랑', '카페', 
  '마트', '병원', '약국', '은행', '교통', '통신', '교육', 'privacy', 
  'normalization', 'cleanup'
];

const NORMALIZER_TYPES = [
  'gas_station', 'gas_station_self', 'gas_station_generic',
  'convenience_store', 'car_center', 'car_center_service', 'car_center_garage',
  'online_service', 'restaurant', 'cafe', 'mart', 'hospital', 'pharmacy',
  'bank', 'transportation', 'communication', 'education'
];

export function RegexRulesManagement() {
  const [rules, setRules] = useState<RegexRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterEnabled, setFilterEnabled] = useState<boolean | null>(null);
  const [editingRule, setEditingRule] = useState<RegexRule | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  
  // API 테스트 상태
  const [testInput, setTestInput] = useState('');
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [testCategory, setTestCategory] = useState('');

  const [formData, setFormData] = useState<RegexRule>({
    pattern: '',
    replacement: '',
    description: '',
    category: '',
    enabled: true,
    priority: 50,
    confidence: 0.8,
    normalizer_type: ''
  });

  // 규칙 목록 로드
  const loadRules = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterCategory && filterCategory !== 'all') params.append('category', filterCategory);
      
      const response = await fetch(`/api/regex-rules?${params}`);
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setRules(data);
        toast.success(`${data.length}개의 규칙을 로드했습니다.`);
      } else {
        console.error('규칙 로드 실패:', data);
        toast.error('규칙 로드에 실패했습니다.');
      }
    } catch (error) {
      console.error('규칙 로드 오류:', error);
      toast.error('규칙 로드 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 새 규칙 생성
  const createRule = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/regex-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('새 규칙이 생성되었습니다.');
        setShowCreateDialog(false);
        resetForm();
        await loadRules();
        await refreshCache();
      } else {
        const error = await response.json();
        toast.error(`규칙 생성 실패: ${error.error || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('규칙 생성 오류:', error);
      toast.error('규칙 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 규칙 수정
  const updateRule = async () => {
    if (!editingRule?.id) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/regex-rules/${editingRule.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('규칙이 수정되었습니다.');
        setShowEditDialog(false);
        setEditingRule(null);
        resetForm();
        await loadRules();
        await refreshCache();
      } else {
        const error = await response.json();
        toast.error(`규칙 수정 실패: ${error.error || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('규칙 수정 오류:', error);
      toast.error('규칙 수정 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 규칙 삭제
  const deleteRule = async (id: number) => {
    if (!confirm('정말로 이 규칙을 삭제하시겠습니까?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/regex-rules/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('규칙이 삭제되었습니다.');
        await loadRules();
        await refreshCache();
      } else {
        const error = await response.json();
        toast.error(`규칙 삭제 실패: ${error.error || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('규칙 삭제 오류:', error);
      toast.error('규칙 삭제 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 캐시 새로고침
  const refreshCache = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/rule-engine/refresh-cache', {
        method: 'POST',
      });
      
      if (response.ok) {
        console.log('캐시가 새로고침되었습니다.');
      }
    } catch (error) {
      console.error('캐시 새로고침 오류:', error);
    }
  };

  // API 테스트
  const testAPI = async () => {
    if (!testInput.trim()) {
      toast.error('테스트할 텍스트를 입력하세요.');
      return;
    }

    setTestLoading(true);
    try {
      const response = await fetch('/api/regex/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: testInput,
          category: testCategory || undefined
        }),
      });

      const data = await response.json();
      setTestResult(data);
      
      if (data.success) {
        toast.success('API 테스트가 완료되었습니다.');
      } else {
        toast.error(`API 테스트 실패: ${data.error}`);
      }
    } catch (error) {
      console.error('API 테스트 오류:', error);
      setTestResult({
        success: false,
        error: '테스트 중 오류가 발생했습니다.'
      });
      toast.error('API 테스트 중 오류가 발생했습니다.');
    } finally {
      setTestLoading(false);
    }
  };

  // 폼 초기화
  const resetForm = () => {
    setFormData({
      pattern: '',
      replacement: '',
      description: '',
      category: '',
      enabled: true,
      priority: 50,
      confidence: 0.8,
      normalizer_type: ''
    });
  };

  // 편집 시작
  const startEdit = (rule: RegexRule) => {
    setEditingRule(rule);
    setFormData({ ...rule });
    setShowEditDialog(true);
  };

  // 필터된 규칙들
  const filteredRules = rules.filter(rule => {
    const matchesSearch = rule.pattern.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEnabled = filterEnabled === null || rule.enabled === filterEnabled;
    return matchesSearch && matchesEnabled;
  });

  useEffect(() => {
    loadRules();
  }, [filterCategory]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">정규식 규칙 관리</h2>
          <p className="text-muted-foreground">데이터베이스 기반 정규식 규칙 관리 시스템</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refreshCache} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            캐시 새로고침
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setShowCreateDialog(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                새 규칙 추가
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>새 정규식 규칙 추가</DialogTitle>
              </DialogHeader>
              <RuleForm 
                formData={formData} 
                setFormData={setFormData} 
                onSave={createRule}
                loading={loading}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="rules" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="rules">
            <Database className="h-4 w-4 mr-2" />
            규칙 관리
          </TabsTrigger>
          <TabsTrigger value="test">
            <TestTube className="h-4 w-4 mr-2" />
            API 테스트
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          {/* 필터 영역 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">필터 및 검색</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="search">검색</Label>
                  <Input
                    id="search"
                    placeholder="패턴, 설명, 카테고리 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="category">카테고리</Label>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="전체 카테고리" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체</SelectItem>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="enabled">상태</Label>
                  <Select 
                    value={filterEnabled === null ? "" : filterEnabled.toString()} 
                    onValueChange={(value) => setFilterEnabled(value === "" ? null : value === "true")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="전체 상태" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체</SelectItem>
                      <SelectItem value="true">활성</SelectItem>
                      <SelectItem value="false">비활성</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={loadRules} disabled={loading}>
                    <Search className="h-4 w-4 mr-2" />
                    새로고침
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 규칙 통계 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">전체 규칙</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{rules.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">활성 규칙</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {rules.filter(r => r.enabled).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">비활성 규칙</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {rules.filter(r => !r.enabled).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">카테고리 수</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Set(rules.map(r => r.category)).size}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 규칙 테이블 */}
          <Card>
            <CardHeader>
              <CardTitle>정규식 규칙 목록 ({filteredRules.length}개)</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p>규칙을 로딩 중입니다...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>패턴</TableHead>
                      <TableHead>카테고리</TableHead>
                      <TableHead>설명</TableHead>
                      <TableHead>우선순위</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRules.map((rule) => (
                      <TableRow key={rule.id}>
                        <TableCell className="font-mono text-sm max-w-xs truncate">
                          {rule.pattern}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{rule.category}</Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {rule.description}
                        </TableCell>
                        <TableCell>{rule.priority}</TableCell>
                        <TableCell>
                          {rule.enabled ? (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              활성
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <XCircle className="h-3 w-3 mr-1" />
                              비활성
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEdit(rule)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => rule.id && deleteRule(rule.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="space-y-4">
          <APITestPanel 
            testInput={testInput}
            setTestInput={setTestInput}
            testCategory={testCategory}
            setTestCategory={setTestCategory}
            testResult={testResult}
            testLoading={testLoading}
            onTest={testAPI}
          />
        </TabsContent>
      </Tabs>

      {/* 편집 다이얼로그 */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>규칙 편집</DialogTitle>
          </DialogHeader>
          <RuleForm 
            formData={formData} 
            setFormData={setFormData} 
            onSave={updateRule}
            loading={loading}
            isEdit={true}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// 규칙 폼 컴포넌트
function RuleForm({ 
  formData, 
  setFormData, 
  onSave, 
  loading, 
  isEdit = false 
}: {
  formData: RegexRule;
  setFormData: (data: RegexRule) => void;
  onSave: () => void;
  loading: boolean;
  isEdit?: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="pattern">정규식 패턴 *</Label>
          <Input
            id="pattern"
            value={formData.pattern}
            onChange={(e) => setFormData({ ...formData, pattern: e.target.value })}
            placeholder="예: (GS25|편의점)"
            className="font-mono"
          />
        </div>
        <div>
          <Label htmlFor="category">카테고리 *</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger>
              <SelectValue placeholder="카테고리 선택" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">설명 *</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="이 규칙에 대한 설명을 입력하세요"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="priority">우선순위</Label>
          <Input
            id="priority"
            type="number"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
            min="0"
            max="100"
          />
        </div>
        <div>
          <Label htmlFor="confidence">신뢰도</Label>
          <Input
            id="confidence"
            type="number"
            step="0.1"
            value={formData.confidence}
            onChange={(e) => setFormData({ ...formData, confidence: parseFloat(e.target.value) || 0 })}
            min="0"
            max="1"
          />
        </div>
        <div className="flex items-center space-x-2 pt-6">
          <Switch
            id="enabled"
            checked={formData.enabled}
            onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
          />
          <Label htmlFor="enabled">활성화</Label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="replacement">대체 텍스트</Label>
          <Input
            id="replacement"
            value={formData.replacement || ''}
            onChange={(e) => setFormData({ ...formData, replacement: e.target.value })}
            placeholder="선택사항: 매칭 시 대체할 텍스트"
          />
        </div>
        <div>
          <Label htmlFor="normalizer_type">정규화 타입</Label>
          <Select 
            value={formData.normalizer_type || ''} 
            onValueChange={(value) => setFormData({ ...formData, normalizer_type: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="정규화 타입 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">없음</SelectItem>
              {NORMALIZER_TYPES.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          onClick={onSave}
          disabled={loading || !formData.pattern || !formData.category || !formData.description}
        >
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              {isEdit ? '수정 중...' : '생성 중...'}
            </>
          ) : (
            <>
              {isEdit ? '수정' : '생성'}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// API 테스트 패널 컴포넌트
function APITestPanel({
  testInput,
  setTestInput,
  testCategory,
  setTestCategory,
  testResult,
  testLoading,
  onTest
}: {
  testInput: string;
  setTestInput: (value: string) => void;
  testCategory: string;
  setTestCategory: (value: string) => void;
  testResult: TestResult | null;
  testLoading: boolean;
  onTest: () => void;
}) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            실시간 API 테스트
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="testInput">테스트 입력</Label>
              <Textarea
                id="testInput"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder="예: GS25에서 커피 구매, 스타벅스 결제, SK엔크린 주유..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="testCategory">카테고리 필터 (선택)</Label>
              <Select value={testCategory} onValueChange={setTestCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="전체 카테고리" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">전체</SelectItem>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                className="w-full mt-2" 
                onClick={onTest} 
                disabled={testLoading || !testInput.trim()}
              >
                {testLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    테스트 중...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    API 테스트
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {testResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {testResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              테스트 결과
            </CardTitle>
          </CardHeader>
          <CardContent>
            {testResult.success && testResult.data ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>원본 텍스트</Label>
                    <div className="p-3 bg-muted rounded-md font-mono text-sm">
                      {testResult.data.originalText}
                    </div>
                  </div>
                  <div>
                    <Label>처리된 텍스트</Label>
                    <div className="p-3 bg-muted rounded-md font-mono text-sm">
                      {testResult.data.processedText}
                    </div>
                  </div>
                </div>

                <div>
                  <Label>매칭된 규칙들 ({testResult.data.matchedRules.length}개)</Label>
                  {testResult.data.matchedRules.length > 0 ? (
                    <div className="space-y-2 mt-2">
                      {testResult.data.matchedRules.map((rule, index) => (
                        <div key={index} className="p-3 border rounded-md">
                          <div className="flex justify-between items-start mb-2">
                            <Badge>{rule.category}</Badge>
                            <span className="text-sm text-muted-foreground">
                              우선순위: {rule.priority}
                            </span>
                          </div>
                          <div className="text-sm space-y-1">
                            <div><strong>패턴:</strong> <code className="bg-muted px-1 rounded">{rule.pattern}</code></div>
                            <div><strong>설명:</strong> {rule.description}</div>
                            <div><strong>매칭 텍스트:</strong> "{rule.matchedText}"</div>
                            <div><strong>위치:</strong> {rule.startIndex} - {rule.endIndex}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-muted rounded-md text-center text-muted-foreground">
                      매칭된 규칙이 없습니다.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">테스트 실패</span>
                </div>
                <p className="text-red-600 mt-1">{testResult.error}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}