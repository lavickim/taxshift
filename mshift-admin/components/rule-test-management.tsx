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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Plus, 
  Edit, 
  Trash2, 
  Play,
  Server,
  Download,
  Upload
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

interface ClassificationResult {
  matched: boolean;
  category: string;
  confidence?: number;
  matchedRule?: string;
}

export function RuleTestManagement() {
  const [transactionData, setTransactionData] = useState<TransactionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, ClassificationResult>>({});
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [apiServerStatus, setApiServerStatus] = useState<'unknown' | 'running' | 'stopped'>('unknown');
  
  // 폼 상태
  const [editForm, setEditForm] = useState<Partial<Transaction>>({});

  // 카테고리별 색상 매핑
  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      '편의점': 'bg-blue-100 text-blue-800 border-blue-300',
      '주유소': 'bg-orange-100 text-orange-800 border-orange-300',
      '음식점': 'bg-green-100 text-green-800 border-green-300',
      '온라인서비스': 'bg-purple-100 text-purple-800 border-purple-300',
      '보험': 'bg-red-100 text-red-800 border-red-300',
      '미분류': 'bg-gray-100 text-gray-800 border-gray-300',
      '카센터': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      '교통': 'bg-indigo-100 text-indigo-800 border-indigo-300',
      '병원': 'bg-pink-100 text-pink-800 border-pink-300',
      '쇼핑': 'bg-emerald-100 text-emerald-800 border-emerald-300'
    };
    return colors[category] || colors['미분류'];
  };

  // 테스트 결과 상태에 따른 색상
  const getTestResultVariant = (matched: boolean) => {
    return matched ? 'default' : 'destructive';
  };

  // 서버 상태에 따른 색상
  const getServerStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-800 border-green-300';
      case 'stopped': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadTransactionData();
    checkApiServerStatus();
  }, []);

  // 거래 데이터 로드
  const loadTransactionData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/rule-test/transactions');
      if (response.ok) {
        const data = await response.json();
        setTransactionData(data);
        toast.success('거래 데이터를 성공적으로 로드했습니다.');
      } else {
        throw new Error('Failed to load transaction data');
      }
    } catch (error) {
      console.error('Error loading transaction data:', error);
      toast.error('거래 데이터 로드에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // API 서버 상태 확인
  const checkApiServerStatus = async () => {
    try {
      const response = await fetch('/api/rule-test/server-status');
      const data = await response.json();
      setApiServerStatus(data.status);
    } catch (error) {
      setApiServerStatus('stopped');
    }
  };

  // API 서버 재시작
  const restartApiServer = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/rule-test/restart-server', {
        method: 'POST'
      });
      
      if (response.ok) {
        toast.success('API 서버를 재시작했습니다.');
        // 서버 재시작 후 상태 확인
        setTimeout(() => {
          checkApiServerStatus();
        }, 3000);
      } else {
        throw new Error('Failed to restart server');
      }
    } catch (error) {
      console.error('Error restarting server:', error);
      toast.error('API 서버 재시작에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 거래 분류 테스트
  const testClassification = async (transaction: Transaction) => {
    try {
      const response = await fetch('/api/rule-test/classify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputText: transaction.description,
          returnAllMatches: false
        })
      });

      if (response.ok) {
        const result = await response.json();
        const classificationResult: ClassificationResult = {
          matched: result.matched,
          category: result.matchedRules?.[0]?.category || '미분류',
          confidence: result.matchedRules?.[0]?.confidence,
          matchedRule: result.matchedRules?.[0]?.description
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
    const results: Record<string, ClassificationResult> = {};
    
    try {
      for (const transaction of transactionData.transactions) {
        const response = await fetch('/api/rule-test/classify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputText: transaction.description,
            returnAllMatches: false
          })
        });

        if (response.ok) {
          const result = await response.json();
          results[transaction.id] = {
            matched: result.matched,
            category: result.matchedRules?.[0]?.category || '미분류',
            confidence: result.matchedRules?.[0]?.confidence,
            matchedRule: result.matchedRules?.[0]?.description
          };
        }
        
        // 너무 빨리 요청하지 않도록 약간의 지연
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      setTestResults(results);
      toast.success('모든 거래 분류 테스트가 완료되었습니다.');
    } catch (error) {
      console.error('Error testing all classifications:', error);
      toast.error('일괄 분류 테스트에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 거래 저장
  const saveTransaction = async () => {
    if (!selectedTransaction || !transactionData) return;
    
    try {
      const updatedTransaction = { ...selectedTransaction, ...editForm };
      
      // 새 거래인지 기존 거래 수정인지 확인
      const isNewTransaction = !transactionData.transactions.find(t => t.id === selectedTransaction.id);
      
      console.log('saveTransaction 호출:', {
        selectedTransaction,
        editForm,
        updatedTransaction,
        isNewTransaction,
        currentTransactionCount: transactionData.transactions.length
      });
      
      let response;
      if (isNewTransaction) {
        // 새 거래 추가 - POST 메서드로 새 거래만 전송
        console.log('새 거래 추가 API 호출:', updatedTransaction);
        response = await fetch('/api/rule-test/transactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedTransaction)
        });
      } else {
        // 기존 거래 수정 - PUT 메서드로 전체 데이터 전송
        console.log('기존 거래 수정');
        const updatedTransactions = transactionData.transactions.map(t => 
          t.id === selectedTransaction.id ? updatedTransaction : t
        );
        
        const updatedData = {
          ...transactionData,
          transactions: updatedTransactions
        };
        
        response = await fetch('/api/rule-test/transactions', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedData)
        });
      }

      if (response.ok) {
        if (isNewTransaction) {
          // 새 거래 추가의 경우 서버에서 반환한 전체 데이터로 업데이트
          const updatedData = await response.json();
          setTransactionData(updatedData);
        } else {
          // 기존 거래 수정의 경우 로컬에서 업데이트한 데이터 사용
          const updatedTransactions = transactionData.transactions.map(t => 
            t.id === selectedTransaction.id ? updatedTransaction : t
          );
          const updatedData = {
            ...transactionData,
            transactions: updatedTransactions
          };
          setTransactionData(updatedData);
        }
        
        setIsEditDialogOpen(false);
        setSelectedTransaction(null);
        setEditForm({});
        const message = isNewTransaction ? '새 거래가 추가되었습니다.' : '거래 정보가 저장되었습니다.';
        toast.success(message);
      } else {
        throw new Error('Failed to save transaction');
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
      toast.error('거래 저장에 실패했습니다.');
    }
  };

  // 거래 삭제
  const deleteTransaction = async (transactionId: string) => {
    if (!transactionData) return;
    
    try {
      const updatedTransactions = transactionData.transactions.filter(t => t.id !== transactionId);
      const updatedData = {
        ...transactionData,
        transactions: updatedTransactions
      };

      const response = await fetch('/api/rule-test/transactions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData)
      });

      if (response.ok) {
        setTransactionData(updatedData);
        toast.success('거래가 삭제되었습니다.');
      } else {
        throw new Error('Failed to delete transaction');
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('거래 삭제에 실패했습니다.');
    }
  };

  // 새 거래 추가
  const addNewTransaction = () => {
    const newTransaction: Transaction = {
      id: `txn_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      displayDate: new Date().toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' }),
      description: '',
      amount: 0,
      displayAmount: '0원',
      balance: 0,
      displayBalance: '잔액 0원',
      category: '미분류',
      type: '출금'
    };
    
    setSelectedTransaction(newTransaction);
    setEditForm(newTransaction);
    setIsEditDialogOpen(true);
  };

  // 편집 다이얼로그 열기
  const openEditDialog = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setEditForm(transaction);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">규칙 테스트</h1>
        <p className="text-muted-foreground mt-2">
          은행 거래데이터/카드 데이터 분류 테스트.
        </p>
        <p className="text-muted-foreground mt-2">
          Todo : 추후 DB로.. 일단은 Json
        </p>
      </div>

      {/* 상태 및 제어 패널 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">API 서버 상태</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Badge 
                variant={apiServerStatus === 'running' ? 'default' : 'destructive'}
                className={`${getServerStatusColor(apiServerStatus)} font-semibold`}
              >
                <Server className="mr-1 h-3 w-3" />
                {apiServerStatus === 'running' ? '실행 중' : apiServerStatus === 'stopped' ? '중지됨' : '확인 중'}
              </Badge>
              <Button size="sm" onClick={restartApiServer} disabled={loading}>
                <RefreshCw className="mr-1 h-3 w-3" />
                재시작
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">거래 데이터</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                {transactionData?.transactions.length || 0}건
              </span>
              <Button size="sm" onClick={loadTransactionData} disabled={loading}>
                <RefreshCw className="mr-1 h-3 w-3" />
                새로고침
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">분류 테스트</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                {Object.keys(testResults).length}건
              </span>
              <Button size="sm" onClick={testAllClassifications} disabled={loading}>
                <Play className="mr-1 h-3 w-3" />
                전체 테스트
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 거래 데이터 테이블 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>거래 내역</CardTitle>
            <Button onClick={addNewTransaction}>
              <Plus className="mr-1 h-4 w-4" />
              새 거래 추가
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>데이터를 로드하는 중...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>날짜</TableHead>
                    <TableHead>거래명</TableHead>
                    <TableHead>금액</TableHead>
                    <TableHead>현재 분류</TableHead>
                    <TableHead>테스트 결과</TableHead>
                    <TableHead>작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactionData?.transactions.map((transaction) => {
                    const testResult = testResults[transaction.id];
                    return (
                      <TableRow 
                        key={transaction.id}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <TableCell className="font-medium">{transaction.displayDate}</TableCell>
                        <TableCell className="max-w-xs truncate font-medium">
                          {transaction.description}
                        </TableCell>
                        <TableCell className={`font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.displayAmount}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={`${getCategoryColor(transaction.category)} font-semibold`}
                          >
                            {transaction.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {testResult ? (
                            <div className="space-y-1">
                              <Badge 
                                variant={getTestResultVariant(testResult.matched)}
                                className={`${testResult.matched ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'} font-semibold`}
                              >
                                {testResult.matched ? (
                                  <CheckCircle className="mr-1 h-3 w-3" />
                                ) : (
                                  <XCircle className="mr-1 h-3 w-3" />
                                )}
                                {testResult.category}
                              </Badge>
                              {testResult.matchedRule && (
                                <p className="text-xs text-muted-foreground">
                                  {testResult.matchedRule}
                                </p>
                              )}
                            </div>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => testClassification(transaction)}
                            >
                              <Play className="mr-1 h-3 w-3" />
                              테스트
                            </Button>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => openEditDialog(transaction)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => deleteTransaction(transaction.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 편집 다이얼로그 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedTransaction?.id.startsWith('txn_' + Date.now().toString().slice(0, -3)) ? '새 거래 추가' : '거래 편집'}
            </DialogTitle>
            <DialogDescription>
              거래 정보를 수정하거나 새로운 거래를 추가합니다.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="description">거래명</Label>
              <Input
                id="description"
                value={editForm.description || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="거래명을 입력하세요"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">금액</Label>
                <Input
                  id="amount"
                  type="number"
                  value={editForm.amount || 0}
                  onChange={(e) => {
                    const amount = parseInt(e.target.value);
                    setEditForm(prev => ({ 
                      ...prev, 
                      amount,
                      displayAmount: `${amount.toLocaleString()}원`
                    }));
                  }}
                />
              </div>
              
              <div>
                <Label htmlFor="type">타입</Label>
                <Select
                  value={editForm.type || '출금'}
                  onValueChange={(value) => setEditForm(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="출금">출금</SelectItem>
                    <SelectItem value="입금">입금</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="category">분류</Label>
              <Select
                value={editForm.category || '미분류'}
                onValueChange={(value) => setEditForm(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="미분류">미분류</SelectItem>
                  <SelectItem value="편의점">편의점</SelectItem>
                  <SelectItem value="음식점">음식점</SelectItem>
                  <SelectItem value="주유소">주유소</SelectItem>
                  <SelectItem value="보험">보험</SelectItem>
                  <SelectItem value="온라인서비스">온라인서비스</SelectItem>
                  <SelectItem value="마트">마트</SelectItem>
                  <SelectItem value="통신">통신</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="date">날짜</Label>
              <Input
                id="date"
                type="date"
                value={editForm.date || ''}
                onChange={(e) => {
                  const date = new Date(e.target.value);
                  setEditForm(prev => ({ 
                    ...prev, 
                    date: e.target.value,
                    displayDate: date.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })
                  }));
                }}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={saveTransaction}>
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}