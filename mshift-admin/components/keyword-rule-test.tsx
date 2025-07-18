'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Play,
  Server,
  Target,
  Hash,
  Tags,
  BarChart3,
  Clock,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";

interface Transaction {
  id: string;
  date: string;
  displayDate: string;
  description: string;
  amount: number;
  displayAmount: string;
  balance: number;
  displayBalance: string;
  category: string;
  type: string;
}

interface TransactionData {
  accountInfo: {
    bankName: string;
    accountNumber: string;
    balance: string;
    currency: string;
  };
  transactions: Transaction[];
}

interface KeywordClassificationResult {
  matched: boolean;
  keywordGroup?: string;
  extractedKeywords?: string[];
  tag?: string;
  accountCode?: string;
  accountName?: string;
  confidence?: number;
  processingPath?: string; // 'cache' | 'keyword' | 'ml' | 'llm'
  processingTime?: number;
}

interface SystemStats {
  totalTests: number;
  successRate: number;
  averageProcessingTime: number;
  cacheHitRate: number;
  keywordMatchRate: number;
  llmFallbackRate: number;
}

interface TestTransactionString {
  id: number;
  transactionText: string;
  amount?: number;
  formattedAmount?: string;
  category?: string;
  expectedTag?: string;
  expectedAccountCode?: string;
  expectedAccountName?: string;
  description?: string;
  isActive: boolean;
  lastTestResult?: any;
  lastTestAt?: string;
  isMatched?: boolean;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

interface TestFilters {
  category: string;
  isMatched: string; // 'all' | 'matched' | 'failed'
  hasBeenTested: string; // 'all' | 'tested' | 'untested'
}

export function KeywordRuleTest() {
  const [transactionData, setTransactionData] = useState<TransactionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, KeywordClassificationResult>>({});
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [apiServerStatus, setApiServerStatus] = useState<'unknown' | 'running' | 'stopped'>('unknown');
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalTests: 0,
    successRate: 0,
    averageProcessingTime: 0,
    cacheHitRate: 0,
    keywordMatchRate: 0,
    llmFallbackRate: 0
  });
  
  // 단일 테스트 입력
  const [testInput, setTestInput] = useState('');
  const [singleTestResult, setSingleTestResult] = useState<KeywordClassificationResult | null>(null);
  
  // 테스트 트랜잭션 데이터
  const [testTransactions, setTestTransactions] = useState<TestTransactionString[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });
  const [filters, setFilters] = useState<TestFilters>({
    category: 'all',
    isMatched: 'all',
    hasBeenTested: 'all'
  });
  const [bulkTestLoading, setBulkTestLoading] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState<Set<number>>(new Set());

  // 카테고리별 색상 매핑
  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      '편의점': 'bg-blue-100 text-blue-800 border-blue-300',
      '주유소': 'bg-orange-100 text-orange-800 border-orange-300',
      '음식점': 'bg-green-100 text-green-800 border-green-300',
      '카페': 'bg-purple-100 text-purple-800 border-purple-300',
      '온라인쇼핑': 'bg-indigo-100 text-indigo-800 border-indigo-300',
      '교통비': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      '의료비': 'bg-red-100 text-red-800 border-red-300',
      '미분류': 'bg-gray-100 text-gray-800 border-gray-300',
    };
    return colors[category] || colors['미분류'];
  };

  // 처리 경로별 색상
  const getProcessingPathColor = (path: string) => {
    const colors: { [key: string]: string } = {
      'cache': 'bg-green-100 text-green-800',
      'keyword': 'bg-blue-100 text-blue-800',
      'ml': 'bg-purple-100 text-purple-800',
      'llm': 'bg-yellow-100 text-yellow-800',
    };
    return colors[path] || 'bg-gray-100 text-gray-800';
  };

  // 처리 경로별 아이콘
  const getProcessingPathIcon = (path: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      'cache': <Clock className="w-3 h-3" />,
      'keyword': <Hash className="w-3 h-3" />,
      'ml': <TrendingUp className="w-3 h-3" />,
      'llm': <Server className="w-3 h-3" />,
    };
    return icons[path] || <Server className="w-3 h-3" />;
  };

  useEffect(() => {
    loadSampleData();
    checkApiServerStatus();
    loadSystemStats();
  }, []);

  // 샘플 데이터 로드
  const loadSampleData = async () => {
    try {
      const response = await fetch('/data/app-data/bank-a-transaction.json');
      const data = await response.json();
      setTransactionData(data);
      console.log('Sample data loaded:', data);
    } catch (error) {
      console.error('Error loading sample data:', error);
      toast.error('샘플 데이터 로드에 실패했습니다.');
    }
  };

  // API 서버 상태 확인
  const checkApiServerStatus = async () => {
    try {
      const response = await fetch('/api/v2/tag-mapping/keyword-groups');
      setApiServerStatus(response.ok ? 'running' : 'stopped');
    } catch (error) {
      setApiServerStatus('stopped');
    }
  };

  // 시스템 통계 로드
  const loadSystemStats = async () => {
    try {
      const response = await fetch('/api/v2/tag-mapping/stats');
      if (response.ok) {
        const data = await response.json();
        setSystemStats(data);
      }
    } catch (error) {
      console.error('Error loading system stats:', error);
    }
  };

  // 단일 거래 분류 테스트
  const testSingleClassification = async (inputText: string) => {
    if (!inputText.trim()) {
      toast.error('테스트할 거래 내용을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/v2/keyword-test/classify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: inputText.trim(),
          amount: 10000
        })
      });

      if (response.ok) {
        const result = await response.json();
        const classificationResult: KeywordClassificationResult = {
          matched: result.matched,
          keywordGroup: result.keywordGroup,
          extractedKeywords: result.extractedKeywords || [],
          tag: result.tag,
          accountCode: result.accountCode,
          accountName: result.accountName,
          confidence: result.confidence,
          processingPath: result.processingPath,
          processingTime: result.processingTime
        };
        
        setSingleTestResult(classificationResult);
        toast.success('거래 분류 테스트 완료');
      } else {
        throw new Error('Classification failed');
      }
    } catch (error) {
      console.error('Error testing classification:', error);
      toast.error('거래 분류 테스트에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 거래 분류 테스트
  const testClassification = async (transaction: Transaction) => {
    try {
      const response = await fetch('/api/v2/keyword-test/classify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: transaction.description,
          amount: 10000
        })
      });

      if (response.ok) {
        const result = await response.json();
        const classificationResult: KeywordClassificationResult = {
          matched: result.matched,
          keywordGroup: result.keywordGroup,
          extractedKeywords: result.extractedKeywords || [],
          tag: result.tag,
          accountCode: result.accountCode,
          accountName: result.accountName,
          confidence: result.confidence,
          processingPath: result.processingPath,
          processingTime: result.processingTime
        };
        
        setTestResults(prev => ({
          ...prev,
          [transaction.id]: classificationResult
        }));
        
        toast.success(`거래 "${transaction.description}" 분류 완료`);
      } else {
        throw new Error('Classification failed');
      }
    } catch (error) {
      console.error('Error classifying transaction:', error);
      toast.error('거래 분류에 실패했습니다.');
    }
  };

  // 모든 거래 분류 테스트
  const testAllClassifications = async () => {
    if (!transactionData?.transactions) return;
    
    setLoading(true);
    const results: Record<string, KeywordClassificationResult> = {};
    
    try {
      for (const transaction of transactionData.transactions) {
        const response = await fetch('/api/v2/keyword-test/classify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            description: transaction.description,
            amount: 10000
          })
        });

        if (response.ok) {
          const result = await response.json();
          results[transaction.id] = {
            matched: result.matched,
            keywordGroup: result.keywordGroup,
            extractedKeywords: result.extractedKeywords || [],
            tag: result.tag,
            accountCode: result.accountCode,
            accountName: result.accountName,
            confidence: result.confidence,
            processingPath: result.processingPath,
            processingTime: result.processingTime
          };
        }
      }
      
      setTestResults(results);
      toast.success(`${transactionData.transactions.length}개 거래 분류 완료`);
      
      // 통계 업데이트
      loadSystemStats();
    } catch (error) {
      console.error('Error testing all classifications:', error);
      toast.error('전체 거래 분류에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">키워드 룰 테스트</h2>
          <p className="text-muted-foreground">
            키워드 기반 거래 분류 시스템을 테스트합니다.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={apiServerStatus === 'running' ? 'default' : 'destructive'}>
            <Server className="w-3 h-3 mr-1" />
            API 서버 {apiServerStatus === 'running' ? '실행 중' : '중단됨'}
          </Badge>
          <Button onClick={checkApiServerStatus} disabled={loading} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            상태 확인
          </Button>
        </div>
      </div>

      {/* 시스템 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 테스트</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.totalTests}</div>
            <p className="text-xs text-muted-foreground">개 거래</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">성공률</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.successRate}%</div>
            <p className="text-xs text-muted-foreground">분류 성공</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 처리시간</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.averageProcessingTime}ms</div>
            <p className="text-xs text-muted-foreground">평균 소요</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">캐시 적중률</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.cacheHitRate}%</div>
            <p className="text-xs text-muted-foreground">캐시 활용</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">키워드 매칭율</CardTitle>
            <Hash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.keywordMatchRate}%</div>
            <p className="text-xs text-muted-foreground">키워드 매칭</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">LLM 폴백율</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.llmFallbackRate}%</div>
            <p className="text-xs text-muted-foreground">LLM 사용</p>
          </CardContent>
        </Card>
      </div>

      {/* 단일 테스트 */}
      <Card>
        <CardHeader>
          <CardTitle>단일 거래 테스트</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <div className="flex-1">
              <Label htmlFor="test-input">거래 내용</Label>
              <Input
                id="test-input"
                placeholder="예: 세븐일레븐 강남점"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && testSingleClassification(testInput)}
              />
            </div>
            <Button 
              onClick={() => testSingleClassification(testInput)}
              disabled={loading || !testInput.trim()}
            >
              <Play className="w-4 h-4 mr-2" />
              테스트
            </Button>
          </div>

          {singleTestResult && (
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                {singleTestResult.matched ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span className="font-medium">
                  {singleTestResult.matched ? '분류 성공' : '분류 실패'}
                </span>
                {singleTestResult.processingPath && (
                  <Badge className={getProcessingPathColor(singleTestResult.processingPath)}>
                    {getProcessingPathIcon(singleTestResult.processingPath)}
                    <span className="ml-1">{singleTestResult.processingPath}</span>
                  </Badge>
                )}
              </div>

              {singleTestResult.matched && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">키워드 그룹</Label>
                    <p className="text-sm">{singleTestResult.keywordGroup || '없음'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">추출된 키워드</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {singleTestResult.extractedKeywords?.map((keyword, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">태그</Label>
                    <p className="text-sm">{singleTestResult.tag || '없음'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">계정과목</Label>
                    <p className="text-sm">
                      {singleTestResult.accountCode} - {singleTestResult.accountName}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">신뢰도</Label>
                    <p className="text-sm">{Math.round((singleTestResult.confidence || 0) * 100)}%</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">처리 시간</Label>
                    <p className="text-sm">{singleTestResult.processingTime || 0}ms</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 거래 데이터 테스트 */}
      {transactionData && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>거래 데이터 테스트</CardTitle>
              <div className="flex gap-2">
                <Button
                  onClick={testAllClassifications}
                  disabled={loading}
                  variant="outline"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4 mr-2" />
                  )}
                  전체 테스트
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>거래 내용</TableHead>
                  <TableHead>금액</TableHead>
                  <TableHead>키워드 그룹</TableHead>
                  <TableHead>태그</TableHead>
                  <TableHead>계정과목</TableHead>
                  <TableHead>처리 경로</TableHead>
                  <TableHead>신뢰도</TableHead>
                  <TableHead>작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactionData.transactions.map((transaction) => {
                  const result = testResults[transaction.id];
                  return (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">
                        {transaction.description}
                      </TableCell>
                      <TableCell>{transaction.displayAmount}</TableCell>
                      <TableCell>
                        {result?.keywordGroup || '-'}
                      </TableCell>
                      <TableCell>
                        {result?.tag ? (
                          <Badge className={getCategoryColor(result.tag)}>
                            {result.tag}
                          </Badge>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {result?.accountCode ? (
                          <span className="text-sm">
                            {result.accountCode} - {result.accountName}
                          </span>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {result?.processingPath ? (
                          <Badge className={getProcessingPathColor(result.processingPath)}>
                            {getProcessingPathIcon(result.processingPath)}
                            <span className="ml-1">{result.processingPath}</span>
                          </Badge>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {result?.confidence ? (
                          <span className="text-sm">
                            {Math.round(result.confidence * 100)}%
                          </span>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => testClassification(transaction)}
                        >
                          <Play className="w-3 h-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}