'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Database, 
  Search, 
  Plus, 
  Download, 
  Upload, 
  Play, 
  Pause, 
  BarChart3, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Trash2,
  Edit3,
  RefreshCw,
  Filter,
  Calendar,
  DollarSign,
  Target,
  Zap,
  Settings
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';

// Types
interface TransactionTestData {
  id: number;
  transaction_text: string;
  amount?: number;
  transaction_date?: string;
  source_type: string;
  test_category: string;
  expected_category?: string;
  expected_account_code?: string;
  expected_description?: string;
  expected_company_name?: string;
  expected_keywords?: string[];
  business_type?: string;
  region?: string;
  difficulty_level: number;
  test_tags?: string[];
  processing_results?: any;
  test_passed?: boolean;
  test_score?: number;
  test_notes?: string;
  last_tested_at?: string;
  created_at?: string;
  updated_at?: string;
}

interface TestExecutionResult {
  id: number;
  success: boolean;
  actualOutcome?: string;
  confidenceScore?: number;
  processingTimeMs?: number;
  errors?: string[];
}

interface BatchExecution {
  id: number;
  batchName: string;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED';
  totalTests: number;
  completedTests: number;
  successCount: number;
  failureCount: number;
  startTime: string;
  endTime?: string;
  createdBy: string;
}

interface Statistics {
  basic: {
    total_records: number;
    by_source_type: Record<string, number>;
    by_category: Record<string, number>;
    by_difficulty: Record<string, number>;
  };
  performance: {
    overall_success_rate: number;
    avg_confidence_score: number;
    avg_processing_time_ms: number;
  };
  recent: {
    last_24h_tests: number;
    last_7d_success_rate: number;
  };
}

export function TransactionTestDataManagement() {
  // State Management
  const [activeTab, setActiveTab] = useState('overview');
  const [testData, setTestData] = useState<TransactionTestData[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [batchExecutions, setBatchExecutions] = useState<BatchExecution[]>([]);
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  
  // Pagination & Filtering
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [sourceTypeFilter, setSourceTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  
  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBatchTestModal, setShowBatchTestModal] = useState(false);
  const [editingItem, setEditingItem] = useState<TransactionTestData | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<Partial<TransactionTestData>>({
    source_type: 'BANK',
    test_category: '',
    difficulty_level: 1
  });
  
  // Batch Test State
  const [batchTestProgress, setBatchTestProgress] = useState(0);
  const [batchTestRunning, setBatchTestRunning] = useState(false);

  // Fetch Functions
  const fetchTestData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        size: pageSize.toString(),
        ...(sourceTypeFilter && { sourceType: sourceTypeFilter }),
        ...(categoryFilter && { testCategory: categoryFilter }),
        ...(difficultyFilter && { difficultyLevel: difficultyFilter })
      });

      const response = await fetch(`/api/v2/test-data?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        // 백엔드 응답 구조에 맞춰 data.data를 사용
        setTestData(data.data || []);
        setTotalPages(data.totalPages || 0);
      } else {
        setError(data.message || '데이터 조회 실패');
      }
    } catch (err) {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      // 임시 Mock 데이터 사용 (백엔드 통계 API 이슈 해결 전까지)
      const mockStatistics: Statistics = {
        basic: {
          total_records: 1000,
          by_source_type: {
            'BANK': 650,
            'CARD': 280,
            'CASH': 70
          },
          by_category: {
            '음식점': 400,
            '편의점': 200,
            '마트': 150,
            '카페': 100,
            '기타': 150
          },
          by_difficulty: {
            '1': 200,
            '2': 400,
            '3': 250,
            '4': 100,
            '5': 50
          }
        },
        performance: {
          overall_success_rate: 0.89,
          avg_confidence_score: 0.82,
          avg_processing_time_ms: 145
        },
        recent: {
          last_24h_tests: 25,
          last_7d_success_rate: 0.91
        }
      };
      
      setStatistics(mockStatistics);
    } catch (err) {
      console.error('통계 조회 실패:', err);
    }
  };

  const fetchBatchExecutions = async () => {
    try {
      const response = await fetch('/api/v2/test-data/batch-executions?page=0&size=10');
      const data = await response.json();
      
      if (response.ok) {
        setBatchExecutions(data.content || []);
      }
    } catch (err) {
      console.error('배치 실행 이력 조회 실패:', err);
    }
  };

  // CRUD Operations
  const handleCreate = async () => {
    try {
      const response = await fetch('/api/v2/test-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowCreateModal(false);
        setFormData({ source_type: 'BANK', test_category: '', difficulty_level: 1 });
        fetchTestData();
      } else {
        const data = await response.json();
        setError(data.message || '생성 실패');
      }
    } catch (err) {
      setError('네트워크 오류가 발생했습니다.');
    }
  };

  const handleUpdate = async () => {
    if (!editingItem) return;

    try {
      const response = await fetch(`/api/v2/test-data/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowEditModal(false);
        setEditingItem(null);
        setFormData({ source_type: 'BANK', test_category: '', difficulty_level: 1 });
        fetchTestData();
      } else {
        const data = await response.json();
        setError(data.message || '수정 실패');
      }
    } catch (err) {
      setError('네트워크 오류가 발생했습니다.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/v2/test-data/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchTestData();
      } else {
        const data = await response.json();
        setError(data.message || '삭제 실패');
      }
    } catch (err) {
      setError('네트워크 오류가 발생했습니다.');
    }
  };

  const handleBatchDelete = async () => {
    if (selectedRows.length === 0) return;
    if (!confirm(`선택된 ${selectedRows.length}개 항목을 삭제하시겠습니까?`)) return;

    try {
      const response = await fetch('/api/v2/test-data/batch', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedRows)
      });

      if (response.ok) {
        setSelectedRows([]);
        fetchTestData();
      } else {
        const data = await response.json();
        setError(data.message || '일괄 삭제 실패');
      }
    } catch (err) {
      setError('네트워크 오류가 발생했습니다.');
    }
  };

  // Test Execution
  const handleSingleTest = async (id: number) => {
    try {
      const response = await fetch(`/api/v2/test-data/${id}/execute`, {
        method: 'POST'
      });

      const result = await response.json();
      
      if (response.ok) {
        const pipeline = result.pipelineResult;
        const testResult = result.testResult;
        
        const alertMessage = `🧪 테스트 완료 - ID: ${id}

📊 테스트 결과:
✅ 성공: ${testResult.passed ? '통과' : '실패'}
🎯 점수: ${(testResult.score * 100).toFixed(1)}%
⏱️ 처리시간: ${result.processingTimeMs}ms

🔍 파이프라인 결과:
📂 카테고리: ${pipeline.category}
🏷️ 계정코드: ${pipeline.accountCode}
🏢 회사명: ${pipeline.companyName}
📝 설명: ${pipeline.description}
🔗 키워드: ${pipeline.keywords.join(', ')}
🛡️ 레이어: ${pipeline.layer}
📈 신뢰도: ${(pipeline.confidence * 100).toFixed(1)}%

📋 평가:
• 키워드 일치율: ${(testResult.evaluation.keywordMatchRate * 100).toFixed(1)}%
• 회사명 일치: ${testResult.evaluation.companyNameMatch ? '✅' : '❌'}
• 계정코드 일치: ${testResult.evaluation.accountCodeMatch ? '✅' : '❌'}
• 카테고리 일치: ${testResult.evaluation.categoryMatch ? '✅' : '❌'}

💡 ${pipeline.note}`;
        
        alert(alertMessage);
        
        // 테스트 후 데이터 새로고침
        fetchTestData();
      } else {
        setError(result.message || '테스트 실행 실패');
      }
    } catch (err) {
      setError('네트워크 오류가 발생했습니다.');
    }
  };

  const handleBatchTest = async () => {
    if (selectedRows.length === 0) {
      setError('테스트할 데이터를 선택해주세요.');
      return;
    }

    setBatchTestRunning(true);
    setBatchTestProgress(0);

    try {
      const batchName = `배치테스트_${new Date().toISOString().slice(0, 19)}`;
      
      const response = await fetch('/api/v2/test-data/execute/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchName,
          testDataIds: selectedRows,
          createdBy: 'admin'
        })
      });

      if (response.ok) {
        // 진행률 시뮬레이션 (실제로는 WebSocket이나 polling으로 구현)
        const interval = setInterval(() => {
          setBatchTestProgress(prev => {
            if (prev >= 100) {
              clearInterval(interval);
              setBatchTestRunning(false);
              fetchBatchExecutions();
              setSelectedRows([]);
              setShowBatchTestModal(false);
              return 100;
            }
            return prev + 10;
          });
        }, 500);
      } else {
        const data = await response.json();
        setError(data.message || '배치 테스트 실행 실패');
        setBatchTestRunning(false);
      }
    } catch (err) {
      setError('네트워크 오류가 발생했습니다.');
      setBatchTestRunning(false);
    }
  };

  // Excel Functions
  const handleExcelExport = async () => {
    try {
      window.open('/api/v2/test-data/export/excel', '_blank');
    } catch (err) {
      setError('엑셀 내보내기 실패');
    }
  };

  const handleExcelImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/v2/test-data/import/excel', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        fetchTestData();
        fetchStatistics();
      } else {
        const data = await response.json();
        setError(data.message || '엑셀 가져오기 실패');
      }
    } catch (err) {
      setError('네트워크 오류가 발생했습니다.');
    }
  };

  // Effects
  useEffect(() => {
    fetchTestData();
  }, [currentPage, pageSize, sourceTypeFilter, categoryFilter, difficultyFilter]);

  useEffect(() => {
    fetchStatistics();
    fetchBatchExecutions();
  }, []);

  // Search filtering
  const filteredData = useMemo(() => {
    return testData.filter(item => 
      searchText === '' || 
      item.transaction_text.toLowerCase().includes(searchText.toLowerCase()) ||
      item.test_category.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [testData, searchText]);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">거래 테스트 시스템</h1>
          <p className="text-muted-foreground">
            1000개 테스트 데이터 관리 및 파이프라인 테스트 실행
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            새로고침
          </Button>
        </div>
      </div>

      {/* 에러 알림 */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 주요 탭 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            개요
          </TabsTrigger>
          <TabsTrigger value="data-management">
            <Database className="h-4 w-4 mr-2" />
            데이터 관리
          </TabsTrigger>
          <TabsTrigger value="pipeline-test">
            <Zap className="h-4 w-4 mr-2" />
            파이프라인 테스트
          </TabsTrigger>
          <TabsTrigger value="batch-history">
            <Clock className="h-4 w-4 mr-2" />
            실행 이력
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <TrendingUp className="h-4 w-4 mr-2" />
            분석
          </TabsTrigger>
        </TabsList>

        {/* 개요 탭 */}
        <TabsContent value="overview" className="space-y-6">
          {statistics && (
            <>
              {/* 기본 통계 카드들 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">총 테스트 데이터</CardTitle>
                    <Database className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{statistics.basic.total_records.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      최근 24시간: +{statistics.recent.last_24h_tests}건
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">전체 성공률</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {(statistics.performance.overall_success_rate * 100).toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      최근 7일: {(statistics.recent.last_7d_success_rate * 100).toFixed(1)}%
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">평균 신뢰도</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {(statistics.performance.avg_confidence_score * 100).toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      신뢰도 점수 평균
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">평균 처리시간</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">
                      {statistics.performance.avg_processing_time_ms.toFixed(0)}ms
                    </div>
                    <p className="text-xs text-muted-foreground">
                      파이프라인 처리시간
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* 분포 차트 섹션 */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>소스 타입별 분포</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(statistics.basic.by_source_type).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-sm">{type}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{count}</Badge>
                          <div className="w-16 bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full"
                              style={{ 
                                width: `${(count / statistics.basic.total_records) * 100}%` 
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>카테고리별 분포</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(statistics.basic.by_category).slice(0, 5).map(([category, count]) => (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-sm truncate">{category}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{count}</Badge>
                          <div className="w-16 bg-muted rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ 
                                width: `${(count / statistics.basic.total_records) * 100}%` 
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>난이도별 분포</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(statistics.basic.by_difficulty).map(([level, count]) => (
                      <div key={level} className="flex items-center justify-between">
                        <span className="text-sm">레벨 {level}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{count}</Badge>
                          <div className="w-16 bg-muted rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full"
                              style={{ 
                                width: `${(count / statistics.basic.total_records) * 100}%` 
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* 데이터 관리 탭 */}
        <TabsContent value="data-management" className="space-y-6">
          {/* 툴바 */}
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="거래내용 또는 카테고리 검색..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              
              <Select value={sourceTypeFilter} onValueChange={setSourceTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="소스타입" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">전체</SelectItem>
                  <SelectItem value="BANK">은행</SelectItem>
                  <SelectItem value="CARD">카드</SelectItem>
                  <SelectItem value="CASH">현금</SelectItem>
                </SelectContent>
              </Select>

              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="난이도" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">전체</SelectItem>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              {selectedRows.length > 0 && (
                <>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={handleBatchDelete}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    삭제 ({selectedRows.length})
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => setShowBatchTestModal(true)}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    배치 테스트 ({selectedRows.length})
                  </Button>
                </>
              )}
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleExcelExport}
              >
                <Download className="h-4 w-4 mr-2" />
                엑셀 내보내기
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => document.getElementById('excel-upload')?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                엑셀 가져오기
              </Button>
              <input
                id="excel-upload"
                type="file"
                accept=".xlsx,.xls"
                style={{ display: 'none' }}
                onChange={handleExcelImport}
              />
              
              <Button 
                size="sm"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                새 데이터
              </Button>
            </div>
          </div>

          {/* 데이터 테이블 */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedRows.length === filteredData.length && filteredData.length > 0}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedRows(filteredData.map(item => item.id));
                          } else {
                            setSelectedRows([]);
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>거래내용</TableHead>
                    <TableHead>금액</TableHead>
                    <TableHead>소스타입</TableHead>
                    <TableHead>카테고리</TableHead>
                    <TableHead>난이도</TableHead>
                    <TableHead>기대결과</TableHead>
                    <TableHead>작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        로딩 중...
                      </TableCell>
                    </TableRow>
                  ) : filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        데이터가 없습니다.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedRows.includes(item.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedRows([...selectedRows, item.id]);
                              } else {
                                setSelectedRows(selectedRows.filter(id => id !== item.id));
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell className="font-mono text-sm">{item.id}</TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate" title={item.transaction_text}>
                            {item.transaction_text}
                          </div>
                        </TableCell>
                        <TableCell>
                          {item.amount ? `₩${item.amount.toLocaleString()}` : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.source_type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{item.test_category}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={item.difficulty_level <= 2 ? "default" : 
                                   item.difficulty_level <= 4 ? "secondary" : "destructive"}
                          >
                            {item.difficulty_level}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate text-sm text-muted-foreground">
                            {item.expected_category || '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSingleTest(item.id)}
                            >
                              <Play className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingItem(item);
                                setFormData(item);
                                setShowEditModal(true);
                              }}
                            >
                              <Edit3 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(item.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* 페이지네이션 */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              총 {totalPages * pageSize}개 중 {currentPage * pageSize + 1}-{Math.min((currentPage + 1) * pageSize, totalPages * pageSize)}개 표시
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 0}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                이전
              </Button>
              <span className="text-sm">
                {currentPage + 1} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages - 1}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                다음
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* 파이프라인 테스트 탭 */}
        <TabsContent value="pipeline-test" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>파이프라인 테스트</CardTitle>
              <p className="text-sm text-muted-foreground">
                정규식전처리 → 키워드엔진 → 복식부기엔진 전체 flow 테스트
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                파이프라인 테스트 기능은 다음 단계에서 구현될 예정입니다.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 실행 이력 탭 */}
        <TabsContent value="batch-history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>배치 실행 이력</CardTitle>
            </CardHeader>
            <CardContent>
              {batchExecutions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  실행 이력이 없습니다.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>배치명</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>총 테스트</TableHead>
                      <TableHead>성공/실패</TableHead>
                      <TableHead>실행시간</TableHead>
                      <TableHead>생성자</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {batchExecutions.map((batch) => (
                      <TableRow key={batch.id}>
                        <TableCell className="font-medium">{batch.batchName}</TableCell>
                        <TableCell>
                          <Badge variant={
                            batch.status === 'COMPLETED' ? 'default' :
                            batch.status === 'RUNNING' ? 'secondary' : 'destructive'
                          }>
                            {batch.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{batch.totalTests}</TableCell>
                        <TableCell>
                          <span className="text-green-600">{batch.successCount}</span>
                          {' / '}
                          <span className="text-red-600">{batch.failureCount}</span>
                        </TableCell>
                        <TableCell>
                          {batch.endTime ? 
                            `${Math.round((new Date(batch.endTime).getTime() - new Date(batch.startTime).getTime()) / 1000)}초` :
                            '실행중'
                          }
                        </TableCell>
                        <TableCell>{batch.createdBy}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 분석 탭 */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>성능 분석</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                상세 분석 기능은 다음 단계에서 구현될 예정입니다.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 생성 모달 */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>새 테스트 데이터 생성</DialogTitle>
            <DialogDescription>
              새로운 테스트 데이터를 추가합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="transaction_text" className="text-right">
                거래내용
              </Label>
              <Textarea
                id="transaction_text"
                value={formData.transaction_text || ''}
                onChange={(e) => setFormData({...formData, transaction_text: e.target.value})}
                className="col-span-3"
                placeholder="거래내용을 입력하세요"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                금액
              </Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount || ''}
                onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value)})}
                className="col-span-3"
                placeholder="금액"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="source_type" className="text-right">
                소스타입
              </Label>
              <Select 
                value={formData.source_type} 
                onValueChange={(value) => setFormData({...formData, source_type: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BANK">은행</SelectItem>
                  <SelectItem value="CARD">카드</SelectItem>
                  <SelectItem value="CASH">현금</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="test_category" className="text-right">
                카테고리
              </Label>
              <Input
                id="test_category"
                value={formData.test_category || ''}
                onChange={(e) => setFormData({...formData, test_category: e.target.value})}
                className="col-span-3"
                placeholder="테스트 카테고리"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="difficulty_level" className="text-right">
                난이도
              </Label>
              <Select 
                value={formData.difficulty_level?.toString()} 
                onValueChange={(value) => setFormData({...formData, difficulty_level: parseInt(value)})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 (매우 쉬움)</SelectItem>
                  <SelectItem value="2">2 (쉬움)</SelectItem>
                  <SelectItem value="3">3 (보통)</SelectItem>
                  <SelectItem value="4">4 (어려움)</SelectItem>
                  <SelectItem value="5">5 (매우 어려움)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="expected_category" className="text-right">
                기대결과
              </Label>
              <Input
                id="expected_category"
                value={formData.expected_category || ''}
                onChange={(e) => setFormData({...formData, expected_category: e.target.value})}
                className="col-span-3"
                placeholder="기대되는 분류 결과"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleCreate}>
              생성
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 수정 모달 */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>테스트 데이터 수정</DialogTitle>
            <DialogDescription>
              테스트 데이터를 수정합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-transaction_text" className="text-right">
                거래내용
              </Label>
              <Textarea
                id="edit-transaction_text"
                value={formData.transaction_text || ''}
                onChange={(e) => setFormData({...formData, transaction_text: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-amount" className="text-right">
                금액
              </Label>
              <Input
                id="edit-amount"
                type="number"
                value={formData.amount || ''}
                onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value)})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-source_type" className="text-right">
                소스타입
              </Label>
              <Select 
                value={formData.source_type} 
                onValueChange={(value) => setFormData({...formData, source_type: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BANK">은행</SelectItem>
                  <SelectItem value="CARD">카드</SelectItem>
                  <SelectItem value="CASH">현금</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-test_category" className="text-right">
                카테고리
              </Label>
              <Input
                id="edit-test_category"
                value={formData.test_category || ''}
                onChange={(e) => setFormData({...formData, test_category: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-difficulty_level" className="text-right">
                난이도
              </Label>
              <Select 
                value={formData.difficulty_level?.toString()} 
                onValueChange={(value) => setFormData({...formData, difficulty_level: parseInt(value)})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 (매우 쉬움)</SelectItem>
                  <SelectItem value="2">2 (쉬움)</SelectItem>
                  <SelectItem value="3">3 (보통)</SelectItem>
                  <SelectItem value="4">4 (어려움)</SelectItem>
                  <SelectItem value="5">5 (매우 어려움)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-expected_category" className="text-right">
                기대결과
              </Label>
              <Input
                id="edit-expected_category"
                value={formData.expected_category || ''}
                onChange={(e) => setFormData({...formData, expected_category: e.target.value})}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleUpdate}>
              수정
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 배치 테스트 모달 */}
      <Dialog open={showBatchTestModal} onOpenChange={setShowBatchTestModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>배치 테스트 실행</DialogTitle>
            <DialogDescription>
              선택된 {selectedRows.length}개 데이터에 대해 배치 테스트를 실행합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {batchTestRunning && (
              <div>
                <Label>진행률</Label>
                <Progress value={batchTestProgress} className="mt-2" />
                <p className="text-sm text-muted-foreground mt-1">
                  {batchTestProgress}% 완료
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              onClick={handleBatchTest}
              disabled={batchTestRunning}
            >
              {batchTestRunning ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  실행 중...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  테스트 시작
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}