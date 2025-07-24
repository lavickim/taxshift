'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar,
  CheckCircle, 
  AlertCircle,
  BarChart3,
  TrendingUp,
  DollarSign,
  FileText,
  Clock,
  Download,
  RefreshCw,
  Loader2,
  Calculator,
  Shield
} from "lucide-react";
import { toast } from "sonner";

interface ClosingResult {
  companyId: string;
  fiscalYear: number;
  fiscalMonth: number;
  status: 'SUCCESS' | 'FAILED';
  closedAccountsCount: number;
  processingTimeMs: number;
  trialBalance: TrialBalance;
  financialStatements: FinancialStatements;
}

interface TrialBalance {
  companyId: string;
  fiscalYear: number;
  fiscalMonth: number;
  items: TrialBalanceItem[];
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
}

interface TrialBalanceItem {
  accountCode: string;
  accountName: string;
  accountType: string;
  debitBalance: number;
  creditBalance: number;
}

interface FinancialStatements {
  incomeStatement: IncomeStatement;
  balanceSheet: BalanceSheet;
  cashFlowStatement: CashFlowStatement;
}

interface IncomeStatement {
  companyId: string;
  fiscalYear: number;
  fiscalMonth: number;
  revenues: Record<string, number>;
  expenses: Record<string, number>;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
}

interface BalanceSheet {
  companyId: string;
  fiscalYear: number;
  fiscalMonth: number;
  assets: Record<string, number>;
  liabilities: Record<string, number>;
  equity: Record<string, number>;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
}

interface CashFlowStatement {
  companyId: string;
  fiscalYear: number;
  fiscalMonth: number;
  operatingActivities: Record<string, number>;
  investingActivities: Record<string, number>;
  financingActivities: Record<string, number>;
  netOperatingCash: number;
  netInvestingCash: number;
  netFinancingCash: number;
  netCashChange: number;
}

interface ValidationResult {
  isValid: boolean;
  assets: number;
  liabilitiesAndEquity: number;
  difference: number;
  errors: string[];
}

export function MonthEndClosingManagement() {
  const [isLoading, setIsLoading] = useState(false);
  const [closingResult, setClosingResult] = useState<ClosingResult | null>(null);
  const [trialBalance, setTrialBalance] = useState<TrialBalance | null>(null);
  const [incomeStatement, setIncomeStatement] = useState<IncomeStatement | null>(null);
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheet | null>(null);
  const [cashFlowStatement, setCashFlowStatement] = useState<CashFlowStatement | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  
  // 폼 상태
  const [companyId, setCompanyId] = useState('test-company');
  const [fiscalYear, setFiscalYear] = useState(2025);
  const [fiscalMonth, setFiscalMonth] = useState(1);
  
  // 진행 상태
  const [closingProgress, setClosingProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');

  const executeMonthEndClosing = async () => {
    if (!companyId || !fiscalYear || !fiscalMonth) {
      toast.error('회사, 회계연도, 회계월을 모두 선택해주세요.');
      return;
    }

    setIsLoading(true);
    setClosingProgress(0);
    setCurrentStep('마감 프로세스 시작 중...');

    try {
      // 마감 전 검증
      setCurrentStep('마감 전 검증 실행 중...');
      setClosingProgress(10);

      // 시산표 생성
      setCurrentStep('시산표 생성 중...');
      setClosingProgress(30);

      // GL 계정 마감
      setCurrentStep('GL 계정 마감 중...');
      setClosingProgress(60);

      // 재무제표 생성
      setCurrentStep('재무제표 생성 중...');
      setClosingProgress(80);

      // 월말 마감 API 호출
      const response = await fetch('/api/v2/accounting/month-end-closing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          fiscalYear,
          fiscalMonth
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setCurrentStep('마감 완료');
        setClosingProgress(100);
        setClosingResult(result.closingResult);
        toast.success('월말 마감이 완료되었습니다.');
      } else {
        throw new Error(result.message || '월말 마감에 실패했습니다.');
      }
    } catch (error) {
      console.error('월말 마감 오류:', error);
      toast.error('월말 마감 중 오류가 발생했습니다.');
      setCurrentStep('마감 실패');
    } finally {
      setIsLoading(false);
    }
  };

  const generateTrialBalance = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        companyId,
        fiscalYear: fiscalYear.toString(),
        fiscalMonth: fiscalMonth.toString()
      });

      const response = await fetch(`/api/v2/accounting/trial-balance?${params}`);
      const result = await response.json();
      
      setTrialBalance(result.trialBalance);
      toast.success('시산표가 생성되었습니다.');
    } catch (error) {
      console.error('시산표 생성 오류:', error);
      toast.error('시산표 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateIncomeStatement = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/v2/accounting/income-statement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          fiscalYear,
          fiscalMonth
        })
      });

      const result = await response.json();
      setIncomeStatement(result.incomeStatement);
      toast.success('손익계산서가 생성되었습니다.');
    } catch (error) {
      console.error('손익계산서 생성 오류:', error);
      toast.error('손익계산서 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateBalanceSheet = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/v2/accounting/balance-sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          fiscalYear,
          fiscalMonth
        })
      });

      const result = await response.json();
      setBalanceSheet(result.balanceSheet);
      toast.success('재무상태표가 생성되었습니다.');
    } catch (error) {
      console.error('재무상태표 생성 오류:', error);
      toast.error('재무상태표 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateCashFlowStatement = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/v2/accounting/cash-flow-statement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          fiscalYear,
          fiscalMonth
        })
      });

      const result = await response.json();
      setCashFlowStatement(result.cashFlowStatement);
      toast.success('현금흐름표가 생성되었습니다.');
    } catch (error) {
      console.error('현금흐름표 생성 오류:', error);
      toast.error('현금흐름표 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateComprehensiveFinancialStatements = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        generateIncomeStatement(),
        generateBalanceSheet(),
        generateCashFlowStatement()
      ]);
      toast.success('통합 재무제표가 생성되었습니다.');
    } catch (error) {
      console.error('통합 재무제표 생성 오류:', error);
      toast.error('통합 재무제표 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const validateAccountingEquation = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/v2/accounting/validate-accounting-equation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          fiscalYear,
          fiscalMonth
        })
      });

      const result = await response.json();
      setValidationResult(result.validation);
      
      if (result.validation.isValid) {
        toast.success('회계등식 검증을 통과했습니다.');
      } else {
        toast.error('회계등식 불균형이 감지되었습니다.');
      }
    } catch (error) {
      console.error('회계등식 검증 오류:', error);
      toast.error('회계등식 검증 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
  };

  const formatProcessingTime = (timeMs: number) => {
    return new Intl.NumberFormat('ko-KR').format(timeMs) + 'ms';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">월말 마감 관리</h1>
        <p className="text-muted-foreground mt-2">
          월말 마감 프로세스와 재무제표 생성을 관리합니다.
        </p>
      </div>

      {/* 마감 실행 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>월말 마감 실행</CardTitle>
          <CardDescription>
            선택한 회계기간에 대해 월말 마감을 실행합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">회사 선택</Label>
              <Select value={companyId} onValueChange={setCompanyId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="test-company">테스트 회사</SelectItem>
                  <SelectItem value="comp002">샘플 회사</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fiscalYear">회계연도</Label>
              <Input
                id="fiscalYear"
                type="number"
                value={fiscalYear}
                onChange={(e) => setFiscalYear(parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fiscalMonth">회계월</Label>
              <Select value={fiscalMonth.toString()} onValueChange={(value) => setFiscalMonth(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <SelectItem key={month} value={month.toString()}>
                      {month}월
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{currentStep}</span>
                <span>{closingProgress}%</span>
              </div>
              <Progress value={closingProgress} className="h-2" />
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={executeMonthEndClosing} 
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  마감 진행 중...
                </>
              ) : (
                <>
                  <Calendar className="mr-2 h-4 w-4" />
                  월말 마감 실행
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => toast.info('마감 전 검증을 실행합니다.')}
            >
              마감 전 검증
            </Button>
          </div>

          {/* 마감 결과 표시 */}
          {closingResult && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div className="font-semibold">월말 마감이 완료되었습니다.</div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>마감된 계정: {closingResult.closedAccountsCount}개</div>
                    <div>처리시간: {formatProcessingTime(closingResult.processingTimeMs)}</div>
                  </div>
                  {closingResult.processingTimeMs > 10000 && (
                    <div className="text-amber-600 text-sm">
                      처리시간이 예상보다 오래 걸렸습니다.
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* 재무제표 탭 */}
      <Tabs defaultValue="trial-balance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="trial-balance">시산표</TabsTrigger>
          <TabsTrigger value="income-statement">손익계산서</TabsTrigger>
          <TabsTrigger value="balance-sheet">재무상태표</TabsTrigger>
          <TabsTrigger value="cash-flow">현금흐름표</TabsTrigger>
          <TabsTrigger value="validation">회계등식 검증</TabsTrigger>
        </TabsList>

        {/* 시산표 탭 */}
        <TabsContent value="trial-balance">
          <Card>
            <CardHeader>
              <CardTitle>시산표</CardTitle>
              <CardDescription>
                모든 계정의 차변/대변 잔액을 확인하고 균형을 검증합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={generateTrialBalance} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    생성 중...
                  </>
                ) : (
                  <>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    시산표 생성
                  </>
                )}
              </Button>

              {trialBalance && (
                <div className="space-y-4">
                  {/* 시산표 요약 */}
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="p-4">
                      <div className="text-sm text-muted-foreground">차변 합계</div>
                      <div className="text-lg font-semibold">{formatCurrency(trialBalance.totalDebit)}</div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-sm text-muted-foreground">대변 합계</div>
                      <div className="text-lg font-semibold">{formatCurrency(trialBalance.totalCredit)}</div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-sm text-muted-foreground">균형 상태</div>
                      <div className={`text-lg font-semibold ${trialBalance.isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                        {trialBalance.isBalanced ? (
                          <>
                            <CheckCircle className="inline w-4 h-4 mr-1" />
                            시산표 균형: 정상
                          </>
                        ) : (
                          <>
                            <AlertCircle className="inline w-4 h-4 mr-1" />
                            시산표 불균형 감지
                            <div className="text-sm">
                              차이: {formatCurrency(Math.abs(trialBalance.totalDebit - trialBalance.totalCredit))}
                            </div>
                          </>
                        )}
                      </div>
                    </Card>
                  </div>

                  {/* 시산표 상세 */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>계정코드</TableHead>
                        <TableHead>계정명</TableHead>
                        <TableHead>계정유형</TableHead>
                        <TableHead className="text-right">차변잔액</TableHead>
                        <TableHead className="text-right">대변잔액</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trialBalance.items.map((item) => (
                        <TableRow key={item.accountCode}>
                          <TableCell className="font-mono">{item.accountCode}</TableCell>
                          <TableCell>{item.accountName}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.accountType}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {item.debitBalance > 0 && formatCurrency(item.debitBalance)}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.creditBalance > 0 && formatCurrency(item.creditBalance)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 손익계산서 탭 */}
        <TabsContent value="income-statement">
          <Card>
            <CardHeader>
              <CardTitle>손익계산서</CardTitle>
              <CardDescription>
                회계기간 동안의 수익과 비용을 보여주는 재무제표입니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={generateIncomeStatement} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    생성 중...
                  </>
                ) : (
                  <>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    손익계산서
                  </>
                )}
              </Button>

              {incomeStatement && (
                <div className="space-y-4">
                  {/* 수익 */}
                  <div>
                    <h3 className="font-semibold mb-2">수익</h3>
                    <Table>
                      <TableBody>
                        {Object.entries(incomeStatement.revenues).map(([account, amount]) => (
                          <TableRow key={account}>
                            <TableCell>{account}</TableCell>
                            <TableCell className="text-right">{formatCurrency(amount)}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="font-semibold">
                          <TableCell>총수익</TableCell>
                          <TableCell className="text-right">{formatCurrency(incomeStatement.totalRevenue)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  {/* 비용 */}
                  <div>
                    <h3 className="font-semibold mb-2">비용</h3>
                    <Table>
                      <TableBody>
                        {Object.entries(incomeStatement.expenses).map(([account, amount]) => (
                          <TableRow key={account}>
                            <TableCell>{account}</TableCell>
                            <TableCell className="text-right">{formatCurrency(amount)}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="font-semibold">
                          <TableCell>총비용</TableCell>
                          <TableCell className="text-right">{formatCurrency(incomeStatement.totalExpenses)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  {/* 당기순이익 */}
                  <Card className="p-4 bg-primary/5">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">당기순이익</span>
                      <span className={`text-xl font-bold ${incomeStatement.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(incomeStatement.netIncome)}
                      </span>
                    </div>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 재무상태표 탭 */}
        <TabsContent value="balance-sheet">
          <Card>
            <CardHeader>
              <CardTitle>재무상태표</CardTitle>
              <CardDescription>
                특정 시점의 자산, 부채, 자본 상황을 보여주는 재무제표입니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={generateBalanceSheet} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    생성 중...
                  </>
                ) : (
                  <>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    재무상태표
                  </>
                )}
              </Button>

              {balanceSheet && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 자산 */}
                  <div>
                    <h3 className="font-semibold mb-2">자산</h3>
                    <Table>
                      <TableBody>
                        {Object.entries(balanceSheet.assets).map(([account, amount]) => (
                          <TableRow key={account}>
                            <TableCell>{account}</TableCell>
                            <TableCell className="text-right">{formatCurrency(amount)}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="font-semibold bg-muted">
                          <TableCell>총자산</TableCell>
                          <TableCell className="text-right">{formatCurrency(balanceSheet.totalAssets)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  {/* 부채 및 자본 */}
                  <div className="space-y-4">
                    {/* 부채 */}
                    <div>
                      <h3 className="font-semibold mb-2">부채</h3>
                      <Table>
                        <TableBody>
                          {Object.entries(balanceSheet.liabilities).map(([account, amount]) => (
                            <TableRow key={account}>
                              <TableCell>{account}</TableCell>
                              <TableCell className="text-right">{formatCurrency(amount)}</TableCell>
                            </TableRow>
                          ))}
                          <TableRow className="font-semibold">
                            <TableCell>총부채</TableCell>
                            <TableCell className="text-right">{formatCurrency(balanceSheet.totalLiabilities)}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>

                    {/* 자본 */}
                    <div>
                      <h3 className="font-semibold mb-2">자본</h3>
                      <Table>
                        <TableBody>
                          {Object.entries(balanceSheet.equity).map(([account, amount]) => (
                            <TableRow key={account}>
                              <TableCell>{account}</TableCell>
                              <TableCell className="text-right">{formatCurrency(amount)}</TableCell>
                            </TableRow>
                          ))}
                          <TableRow className="font-semibold bg-muted">
                            <TableCell>총자본</TableCell>
                            <TableCell className="text-right">{formatCurrency(balanceSheet.totalEquity)}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 현금흐름표 탭 */}
        <TabsContent value="cash-flow">
          <Card>
            <CardHeader>
              <CardTitle>현금흐름표</CardTitle>
              <CardDescription>
                회계기간 동안의 현금 유입과 유출을 활동별로 분류한 재무제표입니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={generateCashFlowStatement} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    생성 중...
                  </>
                ) : (
                  <>
                    <DollarSign className="mr-2 h-4 w-4" />
                    현금흐름표
                  </>
                )}
              </Button>

              {cashFlowStatement && (
                <div className="space-y-6">
                  {/* 영업활동 현금흐름 */}
                  <div>
                    <h3 className="font-semibold mb-2">영업활동으로부터의 현금흐름</h3>
                    <Table>
                      <TableBody>
                        {Object.entries(cashFlowStatement.operatingActivities).map(([activity, amount]) => (
                          <TableRow key={activity}>
                            <TableCell>{activity}</TableCell>
                            <TableCell className="text-right">{formatCurrency(amount)}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="font-semibold">
                          <TableCell>영업활동 순현금흐름</TableCell>
                          <TableCell className="text-right">{formatCurrency(cashFlowStatement.netOperatingCash)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  {/* 투자활동 현금흐름 */}
                  <div>
                    <h3 className="font-semibold mb-2">투자활동으로부터의 현금흐름</h3>
                    <Table>
                      <TableBody>
                        {Object.entries(cashFlowStatement.investingActivities).map(([activity, amount]) => (
                          <TableRow key={activity}>
                            <TableCell>{activity}</TableCell>
                            <TableCell className="text-right">{formatCurrency(amount)}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="font-semibold">
                          <TableCell>투자활동 순현금흐름</TableCell>
                          <TableCell className="text-right">{formatCurrency(cashFlowStatement.netInvestingCash)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  {/* 재무활동 현금흐름 */}
                  <div>
                    <h3 className="font-semibold mb-2">재무활동으로부터의 현금흐름</h3>
                    <Table>
                      <TableBody>
                        {Object.entries(cashFlowStatement.financingActivities).map(([activity, amount]) => (
                          <TableRow key={activity}>
                            <TableCell>{activity}</TableCell>
                            <TableCell className="text-right">{formatCurrency(amount)}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="font-semibold">
                          <TableCell>재무활동 순현금흐름</TableCell>
                          <TableCell className="text-right">{formatCurrency(cashFlowStatement.netFinancingCash)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  {/* 현금 순증감 */}
                  <Card className="p-4 bg-primary/5">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">현금 순증감</span>
                      <span className={`text-xl font-bold ${cashFlowStatement.netCashChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(cashFlowStatement.netCashChange)}
                      </span>
                    </div>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 회계등식 검증 탭 */}
        <TabsContent value="validation">
          <Card>
            <CardHeader>
              <CardTitle>회계등식 검증</CardTitle>
              <CardDescription>
                자산 = 부채 + 자본 등식이 성립하는지 검증합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={validateAccountingEquation} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    검증 중...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    회계등식 검증
                  </>
                )}
              </Button>

              {validationResult && (
                <div className="space-y-4">
                  <Alert className={validationResult.isValid ? 'border-green-200' : 'border-red-200'}>
                    {validationResult.isValid ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertDescription>
                      <div className="space-y-2">
                        <div className="font-semibold">회계등식 검증 결과</div>
                        <div className="text-sm">
                          {validationResult.isValid ? (
                            <span className="text-green-600">검증 결과: 정상</span>
                          ) : (
                            <span className="text-red-600">회계등식 불균형</span>
                          )}
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-4">
                      <div className="text-sm text-muted-foreground">자산</div>
                      <div className="text-lg font-semibold">{formatCurrency(validationResult.assets)}</div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-sm text-muted-foreground">부채 + 자본</div>
                      <div className="text-lg font-semibold">{formatCurrency(validationResult.liabilitiesAndEquity)}</div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-sm text-muted-foreground">차이</div>
                      <div className={`text-lg font-semibold ${validationResult.difference === 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(Math.abs(validationResult.difference))}
                      </div>
                    </Card>
                  </div>

                  <div className="p-4 bg-muted rounded">
                    <div className="text-sm font-medium mb-2">자산 = 부채 + 자본</div>
                    <div className="text-lg">
                      {formatCurrency(validationResult.assets)} = {formatCurrency(validationResult.liabilitiesAndEquity)}
                    </div>
                  </div>

                  {validationResult.errors.length > 0 && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-1">
                          <div className="font-semibold">검증 오류</div>
                          {validationResult.errors.map((error, index) => (
                            <div key={index} className="text-sm">{error}</div>
                          ))}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 통합 액션 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>통합 액션</CardTitle>
          <CardDescription>
            여러 재무제표를 한 번에 생성하거나 보고서를 내보낼 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button onClick={generateComprehensiveFinancialStatements} disabled={isLoading}>
              <FileText className="mr-2 h-4 w-4" />
              통합 재무제표 생성
            </Button>
            <Button variant="outline" onClick={() => toast.info('마감 이력을 조회합니다.')}>
              <Clock className="mr-2 h-4 w-4" />
              마감 이력
            </Button>
            <Button variant="outline" onClick={() => toast.info('마감 보고서를 생성합니다.')}>
              <FileText className="mr-2 h-4 w-4" />
              마감 보고서 생성
            </Button>
            <Button variant="outline" onClick={() => toast.info('보고서가 다운로드됩니다.')}>
              <Download className="mr-2 h-4 w-4" />
              PDF 내보내기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}