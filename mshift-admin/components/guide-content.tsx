'use client';

import React, { useEffect, useState } from 'react';

// import 주석처리됨
import ReactMarkdown from 'react-markdown';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export function GuideContent() {
  const [guideContent, setGuideContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // PRD 문서 로드
  const loadGuideContent = async () => {
    try {
      setLoading(true);
      const response = await fetch('/mvp.md');
      if (response.ok) {
        const text = await response.text();
        setGuideContent(text);
      } else {
        console.error('시스템 PRD 문서 로드 실패:', response.status);
      }
    } catch (error) {
      console.error('시스템 PRD 문서 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGuideContent();
  }, []);

  // 구현 상태 통계 계산
  const calculateImplementationStats = () => {
    const completedItems = guideContent.split('- ✅').length - 1;
    const pendingItems = guideContent.split('- ⏳').length - 1;
    const totalItems = completedItems + pendingItems;
    const completionRate =
      totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

    return {
      completed: completedItems,
      pending: pendingItems,
      total: totalItems,
      completionRate: Math.round(completionRate),
    };
  };

  const stats = calculateImplementationStats();

  return (
    <div className='space-y-6'>
      {/* 구현 현황 요약 카드 */}
      {guideContent && (
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Rocket className='h-5 w-5' />
                <CardTitle>시스템 구현 현황</CardTitle>
              </div>
              <Badge
                variant={stats.completionRate >= 80 ? 'default' : 'secondary'}
                className='text-sm'
              >
                {stats.completionRate}% 완료
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {/* 전체 진행률 */}
              <div>
                <div className='mb-2 flex justify-between text-sm'>
                  <span>전체 구현 진행률</span>
                  <span>
                    {stats.completed}/{stats.total} 항목
                  </span>
                </div>
                <Progress value={stats.completionRate} className='h-2' />
              </div>

              {/* 간단한 통계 */}
              <div className='grid grid-cols-3 gap-4 text-center'>
                <div>
                  <div className='text-2xl font-bold text-green-600'>
                    {stats.completed}
                  </div>
                  <div className='text-sm text-muted-foreground'>완료</div>
                </div>
                <div>
                  <div className='text-2xl font-bold text-yellow-600'>
                    {stats.pending}
                  </div>
                  <div className='text-sm text-muted-foreground'>진행 중</div>
                </div>
                <div>
                  <div className='text-2xl font-bold text-blue-600'>
                    {stats.total}
                  </div>
                  <div className='text-sm text-muted-foreground'>총 항목</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 메인 문서 카드 */}
      <Card>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <BookOpen className='h-5 w-5' />
            <CardTitle>MoneyShift AI 시스템 PRD</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className='prose prose-sm max-w-none'>
            {guideContent ? (
              <div className='prose prose-sm prose-slate max-w-none rounded-lg p-6 dark:prose-invert dark:bg-gray-900/20 dark:text-gray-100 [&_code]:dark:bg-gray-800 [&_code]:dark:text-gray-200 [&_h1]:dark:text-white [&_h2]:dark:text-gray-100 [&_h3]:dark:text-gray-200 [&_li]:text-gray-700 [&_li]:dark:text-gray-300 [&_pre]:dark:bg-gray-800 [&_strong]:dark:text-white [&_ul]:space-y-1'>
                <ReactMarkdown
                  components={{
                    // 체크박스 처리를 위한 커스텀 렌더링
                    li: ({ children, ...props }) => {
                      // children을 안전하게 문자열로 변환
                      const getTextFromChildren = (node: any): string => {
                        if (typeof node === 'string') return node;
                        if (typeof node === 'number') return String(node);
                        if (Array.isArray(node))
                          return node.map(getTextFromChildren).join('');
                        if (
                          node &&
                          typeof node === 'object' &&
                          node.props &&
                          node.props.children
                        ) {
                          return getTextFromChildren(node.props.children);
                        }
                        return '';
                      };

                      const content = getTextFromChildren(children);
                      if (content.includes('✅') || content.includes('⏳')) {
                        const isCompleted = content.includes('✅');
                        const text = content
                          .replace(/[✅⏳]\s*/, '')
                          .replace(/\*\*(.*?)\*\*/g, '$1');
                        return (
                          <li
                            className='my-1 flex list-none items-center gap-2'
                            {...props}
                          >
                            <input
                              type='checkbox'
                              checked={isCompleted}
                              readOnly
                              className='h-4 w-4 accent-green-600'
                            />
                            <span
                              className={
                                isCompleted
                                  ? 'text-gray-900 dark:text-gray-100'
                                  : 'text-gray-600 dark:text-gray-400'
                              }
                            >
                              {text}
                            </span>
                            {isCompleted && (
                              <Badge variant='outline' className='ml-2 text-xs'>
                                완료
                              </Badge>
                            )}
                          </li>
                        );
                      }
                      return <li {...props}>{children}</li>;
                    },
                  }}
                >
                  {guideContent}
                </ReactMarkdown>
              </div>
            ) : loading ? (
              <div className='py-8 text-center'>
                <div className='mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary'></div>
                <p className='text-muted-foreground'>
                  시스템 PRD 문서를 불러오고 있습니다...
                </p>
              </div>
            ) : (
              <div className='py-8 text-center'>
                <FileText className='mx-auto mb-4 h-12 w-12 text-muted-foreground' />
                <p className='text-lg font-medium'>
                  시스템 PRD 문서를 불러올 수 없습니다.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
