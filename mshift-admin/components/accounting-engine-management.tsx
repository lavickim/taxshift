'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Calculator, FileText, BarChart3, CheckCircle, AlertCircle, Loader2, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface ChartOfAccount {
  id: number;
  account_code: string;
  account_name: string;
  account_type: string;
  account_subtype: string;
  is_debit_normal: boolean;
  parent_account_id: number | null;
  is_active: boolean;
  display_order: number;
}

interface JournalEntry {
  id: number;
  company_id: string;
  transaction_date: string;
  description: string;
  reference_type: string;
  reference_id: number;
  total_amount: number;
  status: string;
  details: JournalEntryDetail[];
}

interface JournalEntryDetail {
  id: number;
  journal_entry_id: number;
  line_number: number;
  account_code: string;
  account_name: string;
  debit_amount: number;
  credit_amount: number;
  description: string;
}

interface TransactionToJournalRequest {
  transactionId: number;
  companyId: string;
  forceRegenerate: boolean;
}

interface ProcessingInfo {
  processingTimeMs: number;
  success: boolean;
  processingMethod: string;
}

interface JournalEntryResponse {
  success: boolean;
  message?: string;
  journalEntry?: JournalEntry;
  processingInfo?: ProcessingInfo;
}

export function AccountingEngineManagement() {
  const [chartOfAccounts, setChartOfAccounts] = useState<ChartOfAccount[]>([]);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // 거래→분개 테스트 상태
  const [transactionId, setTransactionId] = useState('');
  const [companyId, setCompanyId] = useState('3ddc2f4b-ccf8-4f90-b905-2f01251e3e90');
  const [forceRegenerate, setForceRegenerate] = useState(false);
  const [journalResult, setJournalResult] = useState<JournalEntryResponse | null>(null);
  
  // 재무제표 생성 상태
  const [balanceSheetCompanyId, setBalanceSheetCompanyId] = useState('3ddc2f4b-ccf8-4f90-b905-2f01251e3e90');
  const [balanceSheetDate, setBalanceSheetDate] = useState(new Date().toISOString().split('T')[0]);
  const [balanceSheetData, setBalanceSheetData] = useState<any>(null);
  
  const [incomeStatementCompanyId, setIncomeStatementCompanyId] = useState('3ddc2f4b-ccf8-4f90-b905-2f01251e3e90');
  const [incomeStatementStart, setIncomeStatementStart] = useState('2024-01-01');
  const [incomeStatementEnd, setIncomeStatementEnd] = useState(new Date().toISOString().split('T')[0]);
  const [incomeStatementData, setIncomeStatementData] = useState<any>(null);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    await Promise.all([
      fetchChartOfAccounts(),
      checkSystemHealth()
    ]);
  };

  // 계정과목 조회
  const fetchChartOfAccounts = async () => {
    try {
      const response = await fetch('/api/v2/accounting/chart-of-accounts', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const accounts = await response.json();
        setChartOfAccounts(accounts);
        toast.success(`계정과목 ${accounts.length}개 로드 완료`);
      } else {
        throw new Error('계정과목 조회 실패');
      }
    } catch (error) {
      console.error('계정과목 조회 오류:', error);
      toast.error('계정과목 조회 중 오류가 발생했습니다.');
    }
  };

  // 시스템 헬스체크
  const checkSystemHealth = async () => {
    try {
      const response = await fetch('/api/v2/accounting/health', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const health = await response.json();
        setSystemHealth(health);
      } else {
        throw new Error('헬스체크 실패');
      }
    } catch (error) {
      console.error('헬스체크 오류:', error);
      setSystemHealth({ status: 'unhealthy', error: error.message });
    }
  };

  // 거래→분개 처리
  const processTransaction = async () => {
    if (!transactionId) {
      toast.error('거래 ID를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const request: TransactionToJournalRequest = {
        transactionId: parseInt(transactionId),
        companyId,
        forceRegenerate
      };

      const response = await fetch('/api/v2/accounting/process-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      const result: JournalEntryResponse = await response.json();
      setJournalResult(result);

      if (result.success) {
        toast.success('분개 생성이 완료되었습니다.');
      } else {
        toast.error(result.message || '분개 생성 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('분개 처리 오류:', error);
      toast.error('분개 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 대차대조표 생성
  const generateBalanceSheet = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        companyId: balanceSheetCompanyId,
        asOfDate: balanceSheetDate
      });

      const response = await fetch(`/api/v2/accounting/generate-balance-sheet?${params}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        setBalanceSheetData(data);
        toast.success('대차대조표 생성이 완료되었습니다.');
      } else {
        const errorData = await response.text();
        console.error('대차대조표 생성 실패:', {
          status: response.status,
          statusText: response.statusText,
          body: errorData
        });
        throw new Error(`대차대조표 생성 실패 (${response.status}): ${errorData}`);
      }
    } catch (error) {
      console.error('대차대조표 생성 오류:', error);
      toast.error('대차대조표 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 손익계산서 생성
  const generateIncomeStatement = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        companyId: incomeStatementCompanyId,
        periodStart: incomeStatementStart,
        periodEnd: incomeStatementEnd
      });

      const response = await fetch(`/api/v2/accounting/generate-income-statement?${params}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        setIncomeStatementData(data);
        toast.success('손익계산서 생성이 완료되었습니다.');
      } else {
        const errorData = await response.text();
        console.error('손익계산서 생성 실패:', {
          status: response.status,
          statusText: response.statusText,
          body: errorData
        });
        throw new Error(`손익계산서 생성 실패 (${response.status}): ${errorData}`);
      }
    } catch (error) {
      console.error('손익계산서 생성 오류:', error);
      toast.error('손익계산서 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 금액 포맷팅
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">복식부기엔진 관리</h1>
        <p className="text-muted-foreground mt-2">
          AI 기반 복식부기 자동 처리 시스템
        </p>
      </div>

      {/* 시스템 상태 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">시스템 상태</CardTitle>
            {systemHealth?.status === 'healthy' ? 
              <CheckCircle className="h-4 w-4 text-green-500" /> :
              <AlertCircle className="h-4 w-4 text-red-500" />
            }
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${systemHealth?.status === 'healthy' ? 'text-green-600' : 'text-red-600'}`}>
              {systemHealth?.status === 'healthy' ? '정상' : '비정상'}
            </div>
            <p className="text-xs text-muted-foreground">
              {systemHealth?.timestamp && new Date(systemHealth.timestamp).toLocaleString('ko-KR')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">계정과목</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{chartOfAccounts.length}</div>
            <p className="text-xs text-muted-foreground">
              활성 계정과목 수
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">복식부기엔진</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">활성</div>
            <p className="text-xs text-muted-foreground">
              복식부기 자동 처리 시스템
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 메인 기능 탭 */}
      <Tabs defaultValue="transaction-journal" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transaction-journal">거래→분개</TabsTrigger>
          <TabsTrigger value="financial-statements">재무제표</TabsTrigger>
          <TabsTrigger value="chart-of-accounts">계정과목</TabsTrigger>
        </TabsList>

        {/* 거래→분개 탭 */}
        <TabsContent value="transaction-journal">
          <Card>
            <CardHeader>
              <CardTitle>거래 내역 → 자동 분개 생성</CardTitle>
              <CardDescription>
                거래 내역을 분석하여 복식부기 분개를 자동으로 생성합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="transactionId">거래 ID</Label>
                  <Input
                    id="transactionId"
                    placeholder="예: 12345"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyId">회사 ID</Label>
                  <Select value={companyId} onValueChange={setCompanyId}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3ddc2f4b-ccf8-4f90-b905-2f01251e3e90">3ddc2f4b-ccf8-4f90-b905-2f01251e3e90 (테스트 회사)</SelectItem>
                      <SelectItem value="COMP002">COMP002 (샘플 회사)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={processTransaction} 
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        처리 중...
                      </>
                    ) : (
                      <>
                        <Calculator className="mr-2 h-4 w-4" />
                        분개 생성
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="forceRegenerate"
                  checked={forceRegenerate}
                  onChange={(e) => setForceRegenerate(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="forceRegenerate">기존 분개 강제 재생성</Label>
              </div>

              {/* 분개 결과 표시 */}
              {journalResult && (
                <div className="mt-6">
                  <Separator className="mb-4" />
                  <h3 className="text-lg font-semibold mb-4">분개 생성 결과</h3>
                  
                  {journalResult.success ? (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        분개가 성공적으로 생성되었습니다.
                        (처리시간: {journalResult.processingInfo?.processingTimeMs}ms)
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {journalResult.message}
                      </AlertDescription>
                    </Alert>
                  )}

                  {journalResult.journalEntry && (
                    <Card className="mt-4">
                      <CardHeader>
                        <CardTitle>분개 정보</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p><strong>분개 ID:</strong> {journalResult.journalEntry.id}</p>
                          <p><strong>거래일:</strong> {journalResult.journalEntry.transaction_date}</p>
                          <p><strong>적요:</strong> {journalResult.journalEntry.description}</p>
                          <p><strong>총 금액:</strong> {formatCurrency(journalResult.journalEntry.total_amount)}</p>
                        </div>
                        
                        <div className="mt-4">
                          <h4 className="font-semibold mb-2">분개 상세</h4>
                          <div className="space-y-2">
                            {journalResult.journalEntry.details?.map((detail, index) => (
                              <div key={`${detail.journal_entry_id}-${detail.line_number || index}`} className="flex justify-between items-center p-2 bg-muted rounded">
                                <div>
                                  <span className="font-medium">{detail.account_code} {detail.account_name}</span>
                                  <p className="text-sm text-muted-foreground">{detail.description}</p>
                                </div>
                                <div className="text-right">
                                  {detail.debit_amount > 0 && (
                                    <Badge variant="outline">차변: {formatCurrency(detail.debit_amount)}</Badge>
                                  )}
                                  {detail.credit_amount > 0 && (
                                    <Badge variant="secondary">대변: {formatCurrency(detail.credit_amount)}</Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 재무제표 탭 */}
        <TabsContent value="financial-statements">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 대차대조표 */}
            <Card>
              <CardHeader>
                <CardTitle>대차대조표 생성</CardTitle>
                <CardDescription>
                  특정 시점의 재무상태를 보여주는 대차대조표를 생성합니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bsCompanyId">회사 ID</Label>
                  <Select value={balanceSheetCompanyId} onValueChange={setBalanceSheetCompanyId}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3ddc2f4b-ccf8-4f90-b905-2f01251e3e90">3ddc2f4b-ccf8-4f90-b905-2f01251e3e90 (테스트 회사)</SelectItem>
                      <SelectItem value="COMP002">COMP002 (샘플 회사)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bsDate">기준일</Label>
                  <Input
                    id="bsDate"
                    type="date"
                    value={balanceSheetDate}
                    onChange={(e) => setBalanceSheetDate(e.target.value)}
                  />
                </div>
                <Button onClick={generateBalanceSheet} disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      생성 중...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      대차대조표 생성
                    </>
                  )}
                </Button>

                {balanceSheetData && (
                  <div className="mt-4 p-4 bg-muted rounded">
                    <h4 className="font-semibold mb-2">대차대조표 ({balanceSheetDate})</h4>
                    <div className="text-sm space-y-1">
                      <p><strong>자산 합계:</strong> {formatCurrency(balanceSheetData.자산합계 || 0)}</p>
                      <p><strong>부채 합계:</strong> {formatCurrency(balanceSheetData.부채합계 || 0)}</p>
                      <p><strong>자본 합계:</strong> {formatCurrency(balanceSheetData.자본합계 || 0)}</p>
                      <p><strong>부채+자본:</strong> {formatCurrency(balanceSheetData.부채자본합계 || 0)}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 손익계산서 */}
            <Card>
              <CardHeader>
                <CardTitle>손익계산서 생성</CardTitle>
                <CardDescription>
                  특정 기간의 수익과 비용을 보여주는 손익계산서를 생성합니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="isCompanyId">회사 ID</Label>
                  <Select value={incomeStatementCompanyId} onValueChange={setIncomeStatementCompanyId}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3ddc2f4b-ccf8-4f90-b905-2f01251e3e90">3ddc2f4b-ccf8-4f90-b905-2f01251e3e90 (테스트 회사)</SelectItem>
                      <SelectItem value="COMP002">COMP002 (샘플 회사)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="isStartDate">시작일</Label>
                    <Input
                      id="isStartDate"
                      type="date"
                      value={incomeStatementStart}
                      onChange={(e) => setIncomeStatementStart(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="isEndDate">종료일</Label>
                    <Input
                      id="isEndDate"
                      type="date"
                      value={incomeStatementEnd}
                      onChange={(e) => setIncomeStatementEnd(e.target.value)}
                    />
                  </div>
                </div>
                <Button onClick={generateIncomeStatement} disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      생성 중...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="mr-2 h-4 w-4" />
                      손익계산서 생성
                    </>
                  )}
                </Button>

                {incomeStatementData && (
                  <div className="mt-4 p-4 bg-muted rounded">
                    <h4 className="font-semibold mb-2">손익계산서 ({incomeStatementStart} ~ {incomeStatementEnd})</h4>
                    <div className="text-sm space-y-1">
                      <p><strong>수익 합계:</strong> {formatCurrency(incomeStatementData.수익합계 || 0)}</p>
                      <p><strong>비용 합계:</strong> {formatCurrency(incomeStatementData.비용합계 || 0)}</p>
                      <p><strong>당기순이익:</strong> {formatCurrency(incomeStatementData.당기순이익 || 0)}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 계정과목 탭 */}
        <TabsContent value="chart-of-accounts">
          <Card>
            <CardHeader>
              <CardTitle>계정과목 관리</CardTitle>
              <CardDescription>
                복식부기에 사용되는 계정과목을 관리합니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Button onClick={fetchChartOfAccounts} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      로딩 중...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      새로고침
                    </>
                  )}
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {chartOfAccounts.map((account) => (
                  <Card key={account.id} className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="font-mono text-sm font-medium">{account.account_code}</span>
                        <Badge variant={account.is_active ? "default" : "secondary"}>
                          {account.is_active ? "활성" : "비활성"}
                        </Badge>
                      </div>
                      <h4 className="font-semibold">{account.account_name}</h4>
                      <p className="text-sm text-muted-foreground">{account.account_type}</p>
                      <p className="text-xs text-muted-foreground">{account.account_subtype}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}