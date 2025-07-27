'use client';

import { useState } from 'react';

import {
  Activity,
  AlertCircle,
  AlertTriangle,
  BarChart3,
  Brain,
  CheckCircle,
  Clock,
  Download,
  LayoutDashboard,
  List,
  Plus,
  TestTube2,
  TrendingUp,
  Upload,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { RegexBulkTesting } from './regex-preprocessing/bulk-testing';
import { RegexConflictManager } from './regex-preprocessing/conflict-manager';
// 하위 컴포넌트들 (추후 구현 예정)
import { RegexPreprocessingDashboard } from './regex-preprocessing/dashboard';
import { RegexLLMGenerator } from './regex-preprocessing/llm-generator';
import { RegexRuleEditor } from './regex-preprocessing/rule-editor';
import { RegexRuleManagement } from './regex-preprocessing/rule-management';

export function RegexPreprocessingManagement() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleExcelExport = async () => {
    try {
      const response = await fetch('/api/regex-preprocessing/export');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `regex-preprocessing-rules-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('엑셀 내보내기에 실패했습니다.');
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('엑셀 내보내기 중 오류가 발생했습니다.');
    }
  };

  const handleExcelImport = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/regex-preprocessing/import', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        const { successCount, errorCount, errors } = result.data;
        let message = `임포트 완료:\n- 성공: ${successCount}개\n- 실패: ${errorCount}개`;

        if (errors.length > 0) {
          message += '\n\n오류 내역:';
          errors.slice(0, 5).forEach((error: any) => {
            message += `\n행 ${error.row}: ${error.message}`;
          });
          if (errors.length > 5) {
            message += `\n... 및 ${errors.length - 5}개 추가 오류`;
          }
        }

        alert(message);

        // 성공한 경우 페이지 새로고침
        if (successCount > 0) {
          window.location.reload();
        }
      } else {
        alert(`임포트 실패: ${result.error}`);
      }
    } catch (error) {
      console.error('Import failed:', error);
      alert('엑셀 가져오기 중 오류가 발생했습니다.');
    }

    // input 초기화
    event.target.value = '';
  };

  return (
    <div className='space-y-6'>
      {/* 헤더 */}
      <div className='flex items-start justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>정규식 전처리 시스템 관리</h1>
          <p className='mt-2 text-muted-foreground'>
            거래 문자열 정규화를 위한 정규식 패턴 관리 및 최적화 시스템
          </p>
        </div>
        <div className='flex gap-2'>
          <Button variant='outline' size='sm'>
            <Activity className='mr-2 h-4 w-4' />
            시스템 상태
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() =>
              document.getElementById('excel-import-input')?.click()
            }
          >
            <Upload className='mr-2 h-4 w-4' />
            엑셀 가져오기
          </Button>
          <input
            id='excel-import-input'
            type='file'
            accept='.xlsx,.xls'
            onChange={handleExcelImport}
            style={{ display: 'none' }}
          />
          <Button variant='outline' size='sm' onClick={handleExcelExport}>
            <Download className='mr-2 h-4 w-4' />
            엑셀 내보내기
          </Button>
          <Button size='sm'>
            <Plus className='mr-2 h-4 w-4' />새 규칙 추가
          </Button>
        </div>
      </div>

      {/* 시스템 상태 카드 */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>활성 규칙 수</CardTitle>
            <List className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-blue-600'>247</div>
            <Badge variant='secondary' className='mt-2'>
              <TrendingUp className='mr-1 h-3 w-3' />
              +12 이번 주
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>처리 정확도</CardTitle>
            <BarChart3 className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>94.3%</div>
            <Badge variant='secondary' className='mt-2'>
              <TrendingUp className='mr-1 h-3 w-3' />
              +2.1% 이번 주
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              평균 처리 시간
            </CardTitle>
            <Clock className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-purple-600'>3.2ms</div>
            <Badge variant='secondary' className='mt-2'>
              <CheckCircle className='mr-1 h-3 w-3' />
              목표 달성
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>충돌 감지</CardTitle>
            <AlertTriangle className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-orange-600'>3</div>
            <Badge variant='destructive' className='mt-2'>
              <AlertCircle className='mr-1 h-3 w-3' />
              해결 필요
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* 시스템 알림 */}
      <Card className='border-l-4 border-l-orange-500'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <AlertTriangle className='h-5 w-5 text-orange-500' />
            시스템 알림
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            <div className='flex items-start gap-3'>
              <AlertTriangle className='mt-0.5 h-4 w-4 text-orange-500' />
              <div>
                <p className='font-medium'>충돌 감지: "주유소" 패턴 3개 겹침</p>
                <p className='text-sm text-muted-foreground'>
                  우선순위 조정이 필요합니다.
                </p>
              </div>
              <Button variant='outline' size='sm'>
                해결하기
              </Button>
            </div>
            <div className='flex items-start gap-3'>
              <Clock className='mt-0.5 h-4 w-4 text-blue-500' />
              <div>
                <p className='font-medium'>
                  성능 저하: 처리 시간 5ms 초과 (12회)
                </p>
                <p className='text-sm text-muted-foreground'>
                  패턴 최적화를 권장합니다.
                </p>
              </div>
              <Button variant='outline' size='sm'>
                최적화
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 메인 탭 네비게이션 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <TabsList className='grid w-full grid-cols-6'>
          <TabsTrigger value='dashboard' className='flex items-center gap-2'>
            <LayoutDashboard className='h-4 w-4' />
            대시보드
          </TabsTrigger>
          <TabsTrigger value='rules' className='flex items-center gap-2'>
            <List className='h-4 w-4' />
            규칙 관리
          </TabsTrigger>
          <TabsTrigger value='editor' className='flex items-center gap-2'>
            <Plus className='h-4 w-4' />
            규칙 편집
          </TabsTrigger>
          <TabsTrigger value='testing' className='flex items-center gap-2'>
            <TestTube2 className='h-4 w-4' />
            대량 테스트
          </TabsTrigger>
          <TabsTrigger value='llm' className='flex items-center gap-2'>
            <Brain className='h-4 w-4' />
            LLM 생성
          </TabsTrigger>
          <TabsTrigger value='conflicts' className='flex items-center gap-2'>
            <AlertTriangle className='h-4 w-4' />
            충돌 관리
          </TabsTrigger>
        </TabsList>

        <TabsContent value='dashboard' className='mt-6'>
          <RegexPreprocessingDashboard />
        </TabsContent>

        <TabsContent value='rules' className='mt-6'>
          <RegexRuleManagement />
        </TabsContent>

        <TabsContent value='editor' className='mt-6'>
          <RegexRuleEditor />
        </TabsContent>

        <TabsContent value='testing' className='mt-6'>
          <RegexBulkTesting />
        </TabsContent>

        <TabsContent value='llm' className='mt-6'>
          <RegexLLMGenerator />
        </TabsContent>

        <TabsContent value='conflicts' className='mt-6'>
          <RegexConflictManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
