'use client';

import { useEffect, useState } from 'react';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AnalysisData {
  overview?: any;
  region?: any[];
  status?: any[];
  details?: {
    items: any[];
    total: number;
    page: number;
    limit: number;
  };
}

export function IncheonRestaurantsAnalysis() {
  const [data, setData] = useState<AnalysisData>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6'];

  const fetchData = async (type: string, page: number = 1) => {
    try {
      const params = new URLSearchParams({
        type,
        page: page.toString(),
        limit: '50',
        search: searchTerm,
      });

      const response = await fetch(
        `/api/data-analysis/incheon-restaurants?${params}`
      );
      const result = await response.json();

      if (result.success) {
        setData(prev => ({
          ...prev,
          [type]: result.data,
        }));
      }
    } catch (error) {
      console.error(`Failed to fetch ${type} data:`, error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData('overview');
    fetchData('region');
    fetchData('status');
    fetchData('details', currentPage);
  }, []);

  useEffect(() => {
    if (activeTab === 'details') {
      fetchData('details', currentPage);
    }
  }, [currentPage, searchTerm]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchData('details', 1);
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('ko-KR');
  };

  if (loading && !data.overview) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='h-32 w-32 animate-spin rounded-full border-b-2 border-green-500'></div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-3xl font-bold tracking-tight text-green-600'>
          인천 음식점 분석
        </h2>
        <Badge variant='secondary' className='bg-green-100 text-green-800'>
          {data.overview ? formatNumber(data.overview.totalCount) : '0'}개
          음식점
        </Badge>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className='space-y-4'
      >
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='overview'>개요</TabsTrigger>
          <TabsTrigger value='region'>지역별</TabsTrigger>
          <TabsTrigger value='status'>상태별</TabsTrigger>
          <TabsTrigger value='details'>상세조회</TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  총 음식점 수
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold text-green-600'>
                  {data.overview ? formatNumber(data.overview.totalCount) : '0'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>영업중</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold text-blue-600'>
                  {data.overview
                    ? formatNumber(data.overview.activeCount)
                    : '0'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  지역 커버리지
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold text-purple-600'>인천시</div>
                <div className='text-sm text-gray-600'>전 지역</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='region' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>지역별 음식점 분포</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={400}>
                <BarChart data={data.region || []}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='region' />
                  <YAxis />
                  <Tooltip
                    formatter={value => [
                      formatNumber(Number(value)),
                      '음식점 수',
                    ]}
                  />
                  <Bar dataKey='count' fill='#10b981' />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='status' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>영업상태별 분포</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={400}>
                <PieChart>
                  <Pie
                    data={data.status || []}
                    cx='50%'
                    cy='50%'
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(1)}%`
                    }
                    outerRadius={150}
                    fill='#8884d8'
                    dataKey='count'
                  >
                    {(data.status || []).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={value => [
                      formatNumber(Number(value)),
                      '음식점 수',
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='details' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>상세 음식점 정보</CardTitle>
              <div className='flex gap-2'>
                <Input
                  placeholder='음식점명 또는 주소 검색...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='max-w-xs'
                />
                <Button onClick={handleSearch}>검색</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className='overflow-x-auto'>
                <table className='w-full text-sm'>
                  <thead>
                    <tr className='border-b'>
                      <th className='p-2 text-left'>음식점명</th>
                      <th className='p-2 text-left'>영업상태</th>
                      <th className='p-2 text-left'>지역</th>
                      <th className='p-2 text-left'>주소</th>
                      <th className='p-2 text-left'>전화번호</th>
                      <th className='p-2 text-left'>업종</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.details?.items || []).map((item: any, index) => (
                      <tr key={index} className='border-b hover:bg-gray-50'>
                        <td className='p-2'>{item.restaurant_name}</td>
                        <td className='p-2'>
                          <Badge
                            variant={
                              item.business_status === '영업'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {item.business_status}
                          </Badge>
                        </td>
                        <td className='p-2'>{item.district}</td>
                        <td className='max-w-xs truncate p-2'>
                          {item.address}
                        </td>
                        <td className='p-2'>{item.phone}</td>
                        <td className='p-2'>{item.business_type}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className='mt-4 flex items-center justify-between'>
                <div className='text-sm text-gray-500'>
                  총 {data.details ? formatNumber(data.details.total) : 0}개 중{' '}
                  {(currentPage - 1) * 50 + 1}-
                  {Math.min(currentPage * 50, data.details?.total || 0)}개 표시
                </div>

                <div className='flex gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setCurrentPage(p => p - 1)}
                    disabled={currentPage <= 1}
                  >
                    이전
                  </Button>
                  <span className='flex items-center px-2 text-sm'>
                    {currentPage} / {Math.ceil((data.details?.total || 0) / 50)}
                  </span>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setCurrentPage(p => p + 1)}
                    disabled={
                      currentPage >= Math.ceil((data.details?.total || 0) / 50)
                    }
                  >
                    다음
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
