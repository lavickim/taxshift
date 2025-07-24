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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  BookOpen, 
  Plus, 
  Check, 
  Send, 
  Search, 
  Filter,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

interface JournalEntry {
  id: number;
  companyId: string;
  entryDate: string;
  description: string;
  totalDebitAmount: number;
  totalCreditAmount: number;
  status: 'DRAFT' | 'APPROVED' | 'POSTED';
  confidenceScore?: number;
  createdAt: string;
  approvedAt?: string;
  postedAt?: string;
  details?: JournalEntryDetail[];
}

interface JournalEntryDetail {
  id: number;
  lineNumber: number;
  accountCode: string;
  accountName: string;
  debitAmount: number;
  creditAmount: number;
  description: string;
}

interface JournalEntryLine {
  accountCode: string;
  accountName: string;
  debitAmount: number;
  creditAmount: number;
  description: string;
}

export function JournalEntryManagement() {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  
  // 분개 생성 폼 상태
  const [description, setDescription] = useState('');
  const [debitAccountCode, setDebitAccountCode] = useState('');
  const [creditAccountCode, setCreditAccountCode] = useState('');
  const [amount, setAmount] = useState('');
  const [companyId, setCompanyId] = useState('test-company');
  
  // 복합 분개 상태
  const [isComplexMode, setIsComplexMode] = useState(false);
  const [journalLines, setJournalLines] = useState<JournalEntryLine[]>([
    { accountCode: '', accountName: '', debitAmount: 0, creditAmount: 0, description: '' }
  ]);
  
  // 검색 및 필터 상태
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadJournalEntries();
  }, [currentPage, statusFilter, searchTerm]);

  const loadJournalEntries = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: '10',
        ...(statusFilter !== 'ALL' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/v2/accounting/journal-entries?${params}`);
      const data = await response.json();
      
      setJournalEntries(data.journalEntries || []);
      setTotalPages(Math.ceil((data.pagination?.total || 0) / 10));
    } catch (error) {
      console.error('분개 목록 조회 오류:', error);
      toast.error('분개 목록을 불러오는데 실패했습니다.');
    }
  };

  const createJournalEntry = async () => {
    if (!description.trim()) {
      toast.error('적요를 입력해주세요.');
      return;
    }
    
    if (!debitAccountCode || !creditAccountCode) {
      toast.error('차변 및 대변 계정을 선택해주세요.');
      return;
    }
    
    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) {
      toast.error('금액은 0보다 커야 합니다.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/v2/accounting/journal-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          entryDate: new Date().toISOString().split('T')[0],
          description,
          debitAccountCode,
          creditAccountCode,
          amount: amountNum
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('분개가 성공적으로 생성되었습니다.');
        resetForm();
        loadJournalEntries();
      } else {
        toast.error(result.message || '분개 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('분개 생성 오류:', error);
      toast.error('분개 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const createComplexJournalEntry = async () => {
    const totalDebit = journalLines.reduce((sum, line) => sum + line.debitAmount, 0);
    const totalCredit = journalLines.reduce((sum, line) => sum + line.creditAmount, 0);
    
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      toast.error('분개가 균형을 이루지 않습니다.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/v2/accounting/journal-entries/complex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          entryDate: new Date().toISOString().split('T')[0],
          description,
          lines: journalLines
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('복합 분개가 성공적으로 생성되었습니다.');
        resetComplexForm();
        loadJournalEntries();
      } else {
        toast.error(result.message || '복합 분개 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('복합 분개 생성 오류:', error);
      toast.error('복합 분개 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const approveJournalEntry = async (entryId: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/v2/accounting/journal-entries/${entryId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('분개가 승인되었습니다.');
        loadJournalEntries();
      } else {
        toast.error(result.message || '분개 승인에 실패했습니다.');
      }
    } catch (error) {
      console.error('분개 승인 오류:', error);
      toast.error('분개 승인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const postJournalEntry = async (entryId: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/v2/accounting/journal-entries/${entryId}/post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('분개가 총계정원장에 전기되었습니다.');
        loadJournalEntries();
      } else {
        toast.error(result.message || '분개 전기에 실패했습니다.');
      }
    } catch (error) {
      console.error('분개 전기 오류:', error);
      toast.error('분개 전기 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setDescription('');
    setDebitAccountCode('');
    setCreditAccountCode('');
    setAmount('');
  };

  const resetComplexForm = () => {
    setDescription('');
    setJournalLines([
      { accountCode: '', accountName: '', debitAmount: 0, creditAmount: 0, description: '' }
    ]);
  };

  const addJournalLine = () => {
    setJournalLines([
      ...journalLines,
      { accountCode: '', accountName: '', debitAmount: 0, creditAmount: 0, description: '' }
    ]);
  };

  const updateJournalLine = (index: number, field: keyof JournalEntryLine, value: any) => {
    const updatedLines = [...journalLines];
    updatedLines[index] = { ...updatedLines[index], [field]: value };
    setJournalLines(updatedLines);
  };

  const removeJournalLine = (index: number) => {
    if (journalLines.length > 1) {
      setJournalLines(journalLines.filter((_, i) => i !== index));
    }
  };

  const showJournalEntryDetails = async (entry: JournalEntry) => {
    try {
      const response = await fetch(`/api/v2/accounting/journal-entries/${entry.id}`);
      const detailedEntry = await response.json();
      setSelectedEntry(detailedEntry);
      setIsDetailsModalOpen(true);
    } catch (error) {
      console.error('분개 상세 조회 오류:', error);
      toast.error('분개 상세 정보를 불러오는데 실패했습니다.');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />초안</Badge>;
      case 'APPROVED':
        return <Badge variant="secondary"><CheckCircle className="w-3 h-3 mr-1" />승인</Badge>;
      case 'POSTED':
        return <Badge variant="default"><Check className="w-3 h-3 mr-1" />전기</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">분개 관리</h1>
        <p className="text-muted-foreground mt-2">
          복식부기 원칙에 따른 분개 생성, 승인, 전기 프로세스를 관리합니다.
        </p>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">분개 목록</TabsTrigger>
          <TabsTrigger value="create">새 분개 작성</TabsTrigger>
          <TabsTrigger value="complex">복합 분개</TabsTrigger>
        </TabsList>

        {/* 분개 목록 탭 */}
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>분개 목록</CardTitle>
              <CardDescription>
                생성된 분개 내역을 조회하고 승인/전기 처리를 할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 검색 및 필터 */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="분개 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="w-48">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">전체 상태</SelectItem>
                      <SelectItem value="DRAFT">초안</SelectItem>
                      <SelectItem value="APPROVED">승인</SelectItem>
                      <SelectItem value="POSTED">전기</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={loadJournalEntries}>
                  <Search className="w-4 h-4 mr-2" />
                  검색
                </Button>
              </div>

              {/* 분개 테이블 */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>분개번호</TableHead>
                    <TableHead>일자</TableHead>
                    <TableHead>적요</TableHead>
                    <TableHead>금액</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {journalEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{entry.id}</TableCell>
                      <TableCell>{entry.entryDate}</TableCell>
                      <TableCell>
                        <Button
                          variant="link"
                          className="p-0 h-auto"
                          onClick={() => showJournalEntryDetails(entry)}
                        >
                          {entry.description}
                        </Button>
                      </TableCell>
                      <TableCell>{formatCurrency(entry.totalDebitAmount)}</TableCell>
                      <TableCell>{getStatusBadge(entry.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {entry.status === 'DRAFT' && (
                            <Button
                              size="sm"
                              onClick={() => approveJournalEntry(entry.id)}
                              disabled={isLoading}
                            >
                              <Check className="w-3 h-3 mr-1" />
                              승인
                            </Button>
                          )}
                          {entry.status === 'APPROVED' && (
                            <Button
                              size="sm"
                              onClick={() => postJournalEntry(entry.id)}
                              disabled={isLoading}
                            >
                              <Send className="w-3 h-3 mr-1" />
                              전기
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => showJournalEntryDetails(entry)}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            상세
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* 페이지네이션 */}
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  {currentPage} / {totalPages} 페이지
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    이전
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    다음
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 새 분개 작성 탭 */}
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>새 분개 작성</CardTitle>
              <CardDescription>
                단일 거래에 대한 분개를 생성합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="description">적요</Label>
                  <Input
                    id="description"
                    placeholder="분개 내용을 입력하세요"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">금액</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="debitAccount">차변 계정</Label>
                  <Select value={debitAccountCode} onValueChange={setDebitAccountCode}>
                    <SelectTrigger>
                      <SelectValue placeholder="차변 계정 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5030">5030 - 사무용품비</SelectItem>
                      <SelectItem value="5010">5010 - 급여</SelectItem>
                      <SelectItem value="5020">5020 - 임차료</SelectItem>
                      <SelectItem value="5040">5040 - 통신비</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="creditAccount">대변 계정</Label>
                  <Select value={creditAccountCode} onValueChange={setCreditAccountCode}>
                    <SelectTrigger>
                      <SelectValue placeholder="대변 계정 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1010">1010 - 보통예금</SelectItem>
                      <SelectItem value="1100">1100 - 현금</SelectItem>
                      <SelectItem value="2110">2110 - 미지급금</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={createJournalEntry} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    생성 중...
                  </>
                ) : (
                  <>
                    <BookOpen className="mr-2 h-4 w-4" />
                    분개 생성
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 복합 분개 탭 */}
        <TabsContent value="complex">
          <Card>
            <CardHeader>
              <CardTitle>복합 분개</CardTitle>
              <CardDescription>
                여러 계정이 관련된 복합 거래에 대한 분개를 생성합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="complexDescription">적요</Label>
                <Input
                  id="complexDescription"
                  placeholder="복합 분개 내용을 입력하세요"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold">분개 라인</h4>
                  <Button onClick={addJournalLine} size="sm">
                    <Plus className="w-3 h-3 mr-1" />
                    라인 추가
                  </Button>
                </div>

                {journalLines.map((line, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-medium">라인 {index + 1}</span>
                      {journalLines.length > 1 && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeJournalLine(index)}
                        >
                          삭제
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <Label>계정코드</Label>
                        <Input
                          placeholder="1010"
                          value={line.accountCode}
                          onChange={(e) => updateJournalLine(index, 'accountCode', e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>계정명</Label>
                        <Input
                          placeholder="보통예금"
                          value={line.accountName}
                          onChange={(e) => updateJournalLine(index, 'accountName', e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>차변금액</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={line.debitAmount || ''}
                          onChange={(e) => updateJournalLine(index, 'debitAmount', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>대변금액</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={line.creditAmount || ''}
                          onChange={(e) => updateJournalLine(index, 'creditAmount', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                  </Card>
                ))}

                {/* 분개 균형 검증 */}
                <div className="p-3 bg-muted rounded">
                  <div className="flex justify-between text-sm">
                    <span>차변 합계: {formatCurrency(journalLines.reduce((sum, line) => sum + line.debitAmount, 0))}</span>
                    <span>대변 합계: {formatCurrency(journalLines.reduce((sum, line) => sum + line.creditAmount, 0))}</span>
                  </div>
                  {Math.abs(journalLines.reduce((sum, line) => sum + line.debitAmount, 0) - journalLines.reduce((sum, line) => sum + line.creditAmount, 0)) < 0.01 ? (
                    <div className="text-green-600 text-sm mt-1 flex items-center">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      분개가 균형을 이룹니다
                    </div>
                  ) : (
                    <div className="text-red-600 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      분개가 균형을 이루지 않습니다
                    </div>
                  )}
                </div>
              </div>

              <Button onClick={createComplexJournalEntry} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    생성 중...
                  </>
                ) : (
                  <>
                    <BookOpen className="mr-2 h-4 w-4" />
                    복합 분개 생성
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 분개 상세 정보 모달 */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>분개 상세 정보</DialogTitle>
            <DialogDescription>
              분개의 상세 내용과 감사 추적 정보를 확인할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          
          {selectedEntry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>분개번호</Label>
                  <div className="font-mono">{selectedEntry.id}</div>
                </div>
                <div>
                  <Label>상태</Label>
                  <div>{getStatusBadge(selectedEntry.status)}</div>
                </div>
                <div>
                  <Label>일자</Label>
                  <div>{selectedEntry.entryDate}</div>
                </div>
                <div>
                  <Label>총금액</Label>
                  <div className="font-semibold">
                    차변: {formatCurrency(selectedEntry.totalDebitAmount)} / 
                    대변: {formatCurrency(selectedEntry.totalCreditAmount)}
                  </div>
                </div>
              </div>

              <div>
                <Label>적요</Label>
                <div className="mt-1 p-2 bg-muted rounded">{selectedEntry.description}</div>
              </div>

              {selectedEntry.details && (
                <div>
                  <Label>분개 상세</Label>
                  <Table className="mt-2">
                    <TableHeader>
                      <TableRow>
                        <TableHead>계정</TableHead>
                        <TableHead>차변</TableHead>
                        <TableHead>대변</TableHead>
                        <TableHead>적요</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedEntry.details.map((detail) => (
                        <TableRow key={detail.id}>
                          <TableCell>
                            <div className="font-mono text-sm">{detail.accountCode}</div>
                            <div className="text-sm text-muted-foreground">{detail.accountName}</div>
                          </TableCell>
                          <TableCell>
                            {detail.debitAmount > 0 && formatCurrency(detail.debitAmount)}
                          </TableCell>
                          <TableCell>
                            {detail.creditAmount > 0 && formatCurrency(detail.creditAmount)}
                          </TableCell>
                          <TableCell className="text-sm">{detail.description}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              <Separator />
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDetailsModalOpen(false)}>
                  닫기
                </Button>
                {selectedEntry.status === 'DRAFT' && (
                  <Button onClick={() => approveJournalEntry(selectedEntry.id)}>
                    승인
                  </Button>
                )}
                {selectedEntry.status === 'APPROVED' && (
                  <Button onClick={() => postJournalEntry(selectedEntry.id)}>
                    전기
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}