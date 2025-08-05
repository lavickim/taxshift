'use client';

import { useEffect, useState } from 'react';

import {
  AlertTriangle,
  // ArrowUpDown,
  Brain,
  CheckCircle,
  Edit,
  Filter,
  MoreHorizontal,
  Plus,
  // Search,
  Star,
  TestTube,
  Trash2,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RegexRule } from '@/lib/services/regex-preprocessing.service';

interface UIRegexRule extends RegexRule {
  testCases: number;
  hasConflict: boolean;
  lastModified: string;
  isNew?: boolean;
}

export function RegexRuleManagement() {
  const [rules, setRules] = useState<UIRegexRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('priority');

  // 데이터 로딩
  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        '/api/regex-preprocessing/rules?sortBy=priority'
      );
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch rules');
      }

      const fetchedRules = result.data;

      // RegexRule을 UIRegexRule로 변환
      const uiRules: UIRegexRule[] = fetchedRules.map(rule => ({
        ...rule,
        testCases: rule.testCases?.length || 0,
        hasConflict: false, // TODO: 실제 충돌 감지 서비스와 연동
        lastModified: getRelativeTime(rule.updatedAt),
        isNew: isRecentlyCreated(rule.createdAt),
        testExamples: rule.testExamples || [],
      }));

      setRules(uiRules);
    } catch (err) {
      console.error('Failed to load rules:', err);
      setError(
        err instanceof Error ? err.message : '규칙을 불러오는데 실패했습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  // 상대 시간 계산
  const getRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    return `${Math.floor(diffDays / 7)}주 전`;
  };

  // 최근 생성 여부 확인 (24시간 이내)
  const isRecentlyCreated = (dateString: string): boolean => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    return diffMs < 24 * 60 * 60 * 1000; // 24시간
  };

  const categories = [
    'all',
    '법인구조',
    '주유소',
    '대형마트',
    '해외서비스',
    '편의점',
    '공공기관',
  ];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const statusOptions = ['all', 'active', 'inactive'];

  const filteredRules = rules.filter(rule => {
    const matchesSearch =
      rule.ruleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.inputPattern.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || rule.category === selectedCategory;

    const matchesStatus =
      selectedStatus === 'all' ||
      (selectedStatus === 'active' && rule.isActive) ||
      (selectedStatus === 'inactive' && !rule.isActive);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const sortedRules = [...filteredRules].sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        return b.priority - a.priority;
      case 'name':
        return a.ruleName.localeCompare(b.ruleName);
      case 'usage':
        return b.usageCount - a.usageCount;
      case 'success':
        return b.successRate - a.successRate;
      default:
        return 0;
    }
  });

  const handleRuleAction = (action: string, ruleId: number) => {
    console.log(`${action} rule with ID: ${ruleId}`);
    // TODO: Implement actual actions
  };

  // 로딩 상태
  if (loading) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center justify-center p-8'>
          <div className='text-center'>
            <div className='mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600'></div>
            <p className='text-muted-foreground'>규칙을 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className='space-y-6'>
        <Card className='border-red-200'>
          <CardContent className='p-6 text-center'>
            <AlertTriangle className='mx-auto mb-4 h-12 w-12 text-red-500' />
            <h3 className='mb-2 text-lg font-semibold text-red-700'>
              데이터 로딩 실패
            </h3>
            <p className='mb-4 text-red-600'>{error}</p>
            <Button onClick={loadRules} variant='outline'>
              다시 시도
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* 필터 및 검색 */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Filter className='h-5 w-5' />
            필터 및 검색
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col gap-4'>
            <div className='flex flex-col gap-4 sm:flex-row'>
              <div className='flex-1'>
                <Input
                  placeholder='키워드 검색...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='w-full'
                />
              </div>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className='w-full sm:w-[180px]'>
                  <SelectValue placeholder='카테고리' />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category === 'all' ? '전체' : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className='w-full sm:w-[180px]'>
                  <SelectValue placeholder='상태' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>전체</SelectItem>
                  <SelectItem value='active'>활성</SelectItem>
                  <SelectItem value='inactive'>비활성</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className='w-full sm:w-[180px]'>
                  <SelectValue placeholder='정렬' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='priority'>우선순위</SelectItem>
                  <SelectItem value='name'>이름</SelectItem>
                  <SelectItem value='usage'>사용 횟수</SelectItem>
                  <SelectItem value='success'>성공률</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 태그 필터 */}
            <div className='flex flex-wrap items-center gap-2'>
              <span className='text-sm font-medium'>태그 필터:</span>
              {categories.slice(1).map(category => (
                <Badge
                  key={category}
                  variant={
                    selectedCategory === category ? 'default' : 'secondary'
                  }
                  className='cursor-pointer'
                  onClick={() =>
                    setSelectedCategory(
                      selectedCategory === category ? 'all' : category
                    )
                  }
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 통계 정보 */}
      <div className='flex items-center justify-between'>
        <div className='text-sm text-muted-foreground'>
          총 {rules.length}개 규칙 | 활성 {rules.filter(r => r.isActive).length}
          개 | 비활성 {rules.filter(r => !r.isActive).length}개 | 충돌{' '}
          {rules.filter(r => r.hasConflict).length}개
        </div>
        <div className='flex gap-2'>
          <Button size='sm' variant='outline'>
            <Plus className='mr-2 h-4 w-4' />새 규칙
          </Button>
          <Button size='sm' variant='outline'>
            <Brain className='mr-2 h-4 w-4' />
            LLM 생성
          </Button>
          <Button size='sm' variant='outline'>
            가져오기
          </Button>
          <Button size='sm' variant='outline'>
            내보내기
          </Button>
        </div>
      </div>

      {/* 규칙 목록 테이블 */}
      <Card>
        <CardContent className='p-0'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-[50px]'>상태</TableHead>
                <TableHead>규칙명</TableHead>
                <TableHead>카테고리</TableHead>
                <TableHead>패턴</TableHead>
                <TableHead>테스트 예시</TableHead>
                <TableHead className='text-center'>우선순위</TableHead>
                <TableHead className='text-center'>성공률</TableHead>
                <TableHead className='text-center'>사용 횟수</TableHead>
                <TableHead className='text-center'>최근 수정</TableHead>
                <TableHead className='w-[100px]'>액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRules.map(rule => (
                <TableRow
                  key={rule.id}
                  className={
                    rule.hasConflict ? 'bg-red-50 dark:bg-red-950/20' : ''
                  }
                >
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      {rule.hasConflict && (
                        <AlertTriangle className='h-4 w-4 text-orange-500' />
                      )}
                      {rule.isActive ? (
                        <CheckCircle className='h-4 w-4 text-green-500' />
                      ) : (
                        <div className='h-4 w-4 rounded-full bg-gray-300' />
                      )}
                      {rule.isNew && (
                        <Badge variant='secondary' className='text-xs'>
                          새
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='font-medium'>{rule.ruleName}</div>
                    {rule.hasConflict && (
                      <div className='text-xs text-orange-600'>
                        충돌: "GS칼텍스 패턴"과 67% 겹침
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant='outline'>{rule.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <code className='rounded bg-muted px-2 py-1 text-xs'>
                      {rule.inputPattern.length > 30
                        ? `${rule.inputPattern.substring(0, 30)}...`
                        : rule.inputPattern}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div className='space-y-1'>
                      {rule.testExamples.slice(0, 2).map((example, index) => (
                        <div
                          key={index}
                          className='rounded border bg-blue-50 px-2 py-1 text-xs dark:bg-blue-950/20'
                        >
                          {example.length > 20
                            ? `${example.substring(0, 20)}...`
                            : example}
                        </div>
                      ))}
                      {rule.testExamples.length > 2 && (
                        <div className='text-xs text-muted-foreground'>
                          +{rule.testExamples.length - 2}개 더
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className='text-center'>
                    <Badge
                      variant={rule.priority >= 150 ? 'default' : 'secondary'}
                    >
                      {rule.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-center'>
                    <Badge
                      variant={rule.successRate >= 95 ? 'default' : 'secondary'}
                    >
                      {rule.successRate}%
                    </Badge>
                  </TableCell>
                  <TableCell className='text-center'>
                    {rule.usageCount.toLocaleString()}회
                  </TableCell>
                  <TableCell className='text-center text-sm text-muted-foreground'>
                    {rule.lastModified}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' size='sm'>
                          <MoreHorizontal className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem
                          onClick={() => handleRuleAction('edit', rule.id)}
                        >
                          <Edit className='mr-2 h-4 w-4' />
                          편집
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleRuleAction('test', rule.id)}
                        >
                          <TestTube className='mr-2 h-4 w-4' />
                          테스트
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleRuleAction('copy', rule.id)}
                        >
                          <Star className='mr-2 h-4 w-4' />
                          복사
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleRuleAction('delete', rule.id)}
                          className='text-destructive'
                        >
                          <Trash2 className='mr-2 h-4 w-4' />
                          삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 페이지네이션 */}
      <div className='flex items-center justify-between'>
        <div className='text-sm text-muted-foreground'>
          10개씩 보기 | 1/25 페이지
        </div>
        <div className='flex gap-2'>
          <Button variant='outline' size='sm' disabled>
            이전
          </Button>
          <Button variant='outline' size='sm'>
            1
          </Button>
          <Button variant='outline' size='sm'>
            2
          </Button>
          <Button variant='outline' size='sm'>
            3
          </Button>
          <span>...</span>
          <Button variant='outline' size='sm'>
            25
          </Button>
          <Button variant='outline' size='sm'>
            다음
          </Button>
        </div>
      </div>
    </div>
  );
}
