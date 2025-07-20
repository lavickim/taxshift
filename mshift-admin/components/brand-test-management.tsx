'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  Play, 
  Pause, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Filter,
  Download,
  TrendingUp,
  Package,
  Tags,
  Building,
  Clock,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";

interface FranchiseBrand {
  id: number;
  brandName: string;
  companyName?: string;
  industryLargeCategory?: string;
  industryMediumCategory?: string;
  mainProduct?: string;
  generatedTransactionString?: string;
  primaryTag?: string;
  secondaryTag?: string;
  tertiaryTag?: string;
  testPassed?: boolean;
  lastTestAt?: string;
  testResult?: any;
  tagGenerationReason?: string;
}

interface TestBatch {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  totalCount: number;
  processedCount: number;
  successCount: number;
  failureCount: number;
  startTime?: Date;
  endTime?: Date;
  currentBrand?: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

interface TestFilters {
  testStatus: string; // 'all' | 'tested' | 'untested' | 'passed' | 'failed'
  industry: string;
  primaryTag: string;
  search: string;
}

export default function BrandTestManagement() {
  const [brands, setBrands] = useState<FranchiseBrand[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentBatch, setCurrentBatch] = useState<TestBatch | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });
  const [filters, setFilters] = useState<TestFilters>({
    testStatus: 'all',
    industry: 'all',
    primaryTag: 'all',
    search: ''
  });
  const [statistics, setStatistics] = useState({
    totalBrands: 0,
    testedBrands: 0,
    passedBrands: 0,
    failedBrands: 0,
    topTags: [] as { tag: string; count: number }[]
  });

  useEffect(() => {
    loadBrands();
    loadStatistics();
  }, [pagination.currentPage, filters]);

  /**
   * 브랜드 목록 로드
   */
  const loadBrands = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: pagination.itemsPerPage.toString(),
        testStatus: filters.testStatus,
        industry: filters.industry,
        primaryTag: filters.primaryTag,
        search: filters.search
      });

      const response = await fetch(`/api/brands/test?${queryParams}`);
      if (response.ok) {
        const data = await response.json();
        setBrands(data.brands);
        setPagination(prev => ({
          ...prev,
          totalPages: data.pagination.totalPages,
          totalItems: data.pagination.totalItems
        }));
      }
    } catch (error) {
      console.error('Error loading brands:', error);
      toast.error('브랜드 목록 로드 실패');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 통계 로드
   */
  const loadStatistics = async () => {
    try {
      const response = await fetch('/api/brands/statistics');
      if (response.ok) {
        const data = await response.json();
        setStatistics(data);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  /**
   * 브랜드 거래 문자열 생성
   */
  const generateTransactionStrings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/brands/generate-strings', {
        method: 'POST'
      });
      
      if (response.ok) {
        toast.success('브랜드 거래 문자열 생성 완료');
        loadBrands();
        loadStatistics();
      } else {
        throw new Error('Generation failed');
      }
    } catch (error) {
      console.error('Error generating strings:', error);
      toast.error('거래 문자열 생성 실패');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 배치 테스트 시작
   */
  const startBatchTest = async (batchSize: number = 100) => {
    if (currentBatch?.status === 'running') {
      toast.error('이미 테스트가 진행 중입니다');
      return;
    }

    const batchId = Date.now().toString();
    setCurrentBatch({
      id: batchId,
      status: 'running',
      totalCount: batchSize,
      processedCount: 0,
      successCount: 0,
      failureCount: 0,
      startTime: new Date()
    });

    try {
      const response = await fetch('/api/brands/batch-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          batchId,
          batchSize,
          filters: filters.testStatus === 'untested' ? { testStatus: 'untested' } : {}
        })
      });

      if (response.ok) {
        // 배치 테스트 진행 상황 폴링
        pollBatchStatus(batchId);
      } else {
        throw new Error('Batch test failed to start');
      }
    } catch (error) {
      console.error('Error starting batch test:', error);
      toast.error('배치 테스트 시작 실패');
      setCurrentBatch(null);
    }
  };

  /**
   * 배치 테스트 상태 폴링
   */
  const pollBatchStatus = async (batchId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/brands/batch-status?batchId=${batchId}`);
        if (response.ok) {
          const status = await response.json();
          
          setCurrentBatch(prev => prev ? {
            ...prev,
            ...status,
            endTime: status.status === 'completed' || status.status === 'failed' ? new Date() : undefined
          } : null);

          if (status.status === 'completed' || status.status === 'failed') {
            clearInterval(interval);
            loadBrands();
            loadStatistics();
            
            if (status.status === 'completed') {
              toast.success(`배치 테스트 완료: ${status.successCount}/${status.totalCount} 성공`);
            } else {
              toast.error('배치 테스트 실패');
            }
          }
        }
      } catch (error) {
        console.error('Error polling batch status:', error);
        clearInterval(interval);
      }
    }, 2000);
  };

  /**
   * 단일 브랜드 테스트
   */
  const testSingleBrand = async (brandId: number) => {
    try {
      const response = await fetch(`/api/brands/test-single`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ brandId })
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`테스트 완료: ${result.testPassed ? '성공' : '실패'}`);
        loadBrands();
        loadStatistics();
      } else {
        throw new Error('Single test failed');
      }
    } catch (error) {
      console.error('Error testing single brand:', error);
      toast.error('단일 브랜드 테스트 실패');
    }
  };

  /**
   * 테스트 결과 색상
   */
  const getTestResultColor = (testPassed?: boolean) => {
    if (testPassed === undefined) return 'bg-gray-100 text-gray-800';
    return testPassed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  /**
   * 테스트 결과 아이콘
   */
  const getTestResultIcon = (testPassed?: boolean) => {
    if (testPassed === undefined) return <Clock className="w-3 h-3" />;
    return testPassed ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />;
  };

  /**
   * 테스트 결과 상세 정보 토스트
   */
  const showTestResultDetails = (brand: FranchiseBrand) => {
    if (!brand.testResult) {
      toast.info('테스트 결과가 없습니다.');
      return;
    }

    const result = brand.testResult;
    const status = brand.testPassed ? '성공' : '실패';
    const statusIcon = brand.testPassed ? '✅' : '❌';
    
    let message = `${statusIcon} ${brand.brandName} 테스트 ${status}\n\n`;
    
    if (result.inputText) {
      message += `📝 입력 텍스트: ${result.inputText}\n`;
    }
    
    if (result.expectedTags && result.expectedTags.length > 0) {
      message += `🎯 기대 태그: [${result.expectedTags.join(', ')}]\n`;
    }
    
    if (result.actualTag) {
      message += `🏷️ 실제 태그: ${result.actualTag}\n`;
    }
    
    if (result.confidence !== undefined) {
      message += `📊 신뢰도: ${(result.confidence * 100).toFixed(1)}%\n`;
    }
    
    if (result.processingPath) {
      message += `⚙️ 처리 경로: ${result.processingPath}\n`;
    }
    
    if (result.processingTime) {
      message += `⏱️ 처리 시간: ${result.processingTime}ms\n`;
    }
    
    if (result.error) {
      message += `❗ 오류: ${result.error}\n`;
    }
    
    if (result.rawResult?.extractedKeywords && result.rawResult.extractedKeywords.length > 0) {
      message += `🔍 추출된 키워드: [${result.rawResult.extractedKeywords.join(', ')}]`;
    }

    toast.info(message, {
      duration: 8000,
      style: {
        whiteSpace: 'pre-line',
        maxWidth: '500px',
        fontSize: '14px'
      }
    });
  };

  const successRate = statistics.testedBrands > 0 ? (statistics.passedBrands / statistics.testedBrands) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">브랜드 테스트 관리</h2>
          <p className="text-muted-foreground">
            franchise_brands 테이블 기반 브랜드 거래 문자열 테스트
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={generateTransactionStrings} disabled={loading} variant="outline">
            <Package className="w-4 h-4 mr-2" />
            거래 문자열 생성
          </Button>
          <Button onClick={() => startBatchTest(100)} disabled={loading || currentBatch?.status === 'running'}>
            <Play className="w-4 h-4 mr-2" />
            배치 테스트 (100개)
          </Button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 브랜드</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalBrands.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">프랜차이즈 브랜드</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">테스트 완료</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.testedBrands.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {statistics.totalBrands > 0 && `${Math.round((statistics.testedBrands / statistics.totalBrands) * 100)}% 완료`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">성공률</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {statistics.passedBrands}/{statistics.testedBrands} 성공
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">실패 케이스</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.failedBrands.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">룰 개선 필요</p>
          </CardContent>
        </Card>
      </div>

      {/* 배치 테스트 진행 상황 */}
      {currentBatch && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 ${currentBatch.status === 'running' ? 'animate-spin' : ''}`} />
              배치 테스트 진행 상황
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">진행률</span>
                <span className="text-sm font-medium">
                  {currentBatch.processedCount}/{currentBatch.totalCount} 
                  ({Math.round((currentBatch.processedCount / currentBatch.totalCount) * 100)}%)
                </span>
              </div>
              <Progress value={(currentBatch.processedCount / currentBatch.totalCount) * 100} />
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-medium text-green-600">{currentBatch.successCount}</div>
                  <div className="text-muted-foreground">성공</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-red-600">{currentBatch.failureCount}</div>
                  <div className="text-muted-foreground">실패</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">{currentBatch.totalCount - currentBatch.processedCount}</div>
                  <div className="text-muted-foreground">대기</div>
                </div>
              </div>
              {currentBatch.currentBrand && (
                <div className="text-sm text-muted-foreground">
                  현재 처리 중: {currentBatch.currentBrand}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 필터 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            필터
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="test-status">테스트 상태</Label>
              <Select value={filters.testStatus} onValueChange={(value) => setFilters(prev => ({ ...prev, testStatus: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="상태 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="tested">테스트 완료</SelectItem>
                  <SelectItem value="untested">미테스트</SelectItem>
                  <SelectItem value="passed">성공</SelectItem>
                  <SelectItem value="failed">실패</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="industry">산업분류</Label>
              <Select value={filters.industry} onValueChange={(value) => setFilters(prev => ({ ...prev, industry: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="산업분류 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="음식점업">음식점업</SelectItem>
                  <SelectItem value="도매 및 소매업">도매 및 소매업</SelectItem>
                  <SelectItem value="제조업">제조업</SelectItem>
                  <SelectItem value="서비스업">서비스업</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="primary-tag">주요 태그</Label>
              <Select value={filters.primaryTag} onValueChange={(value) => setFilters(prev => ({ ...prev, primaryTag: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="태그 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  {statistics.topTags.map(tag => (
                    <SelectItem key={tag.tag} value={tag.tag}>
                      {tag.tag} ({tag.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="search">검색</Label>
              <Input
                id="search"
                placeholder="브랜드명, 회사명 검색"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 브랜드 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>브랜드 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>브랜드명</TableHead>
                <TableHead>회사명</TableHead>
                <TableHead>산업분류</TableHead>
                <TableHead>주요상품</TableHead>
                <TableHead>생성된 거래 문자열</TableHead>
                <TableHead>태그</TableHead>
                <TableHead>테스트 결과</TableHead>
                <TableHead>작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brands.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell className="font-medium">{brand.brandName}</TableCell>
                  <TableCell>{brand.companyName || '-'}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{brand.industryLargeCategory || '-'}</div>
                      <div className="text-muted-foreground">{brand.industryMediumCategory || '-'}</div>
                    </div>
                  </TableCell>
                  <TableCell>{brand.mainProduct || '-'}</TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate text-sm">
                      {brand.generatedTransactionString || '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {brand.primaryTag && (
                        <Badge variant="default" className="text-xs">
                          {brand.primaryTag}
                        </Badge>
                      )}
                      {brand.secondaryTag && (
                        <Badge variant="secondary" className="text-xs">
                          {brand.secondaryTag}
                        </Badge>
                      )}
                      {brand.tertiaryTag && (
                        <Badge variant="outline" className="text-xs">
                          {brand.tertiaryTag}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={`${getTestResultColor(brand.testPassed)} ${brand.testResult ? 'cursor-pointer hover:opacity-80' : ''}`}
                      onClick={() => brand.testResult && showTestResultDetails(brand)}
                    >
                      {getTestResultIcon(brand.testPassed)}
                      <span className="ml-1">
                        {brand.testPassed === undefined ? '미테스트' : brand.testPassed ? '성공' : '실패'}
                      </span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testSingleBrand(brand.id)}
                      disabled={loading}
                    >
                      <Play className="w-3 h-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* 페이지네이션 */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-muted-foreground">
              총 {pagination.totalItems}개 중 {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1}-{Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}개 표시
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.max(1, prev.currentPage - 1) }))}
                disabled={pagination.currentPage === 1 || loading}
              >
                이전
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.min(prev.totalPages, prev.currentPage + 1) }))}
                disabled={pagination.currentPage === pagination.totalPages || loading}
              >
                다음
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}