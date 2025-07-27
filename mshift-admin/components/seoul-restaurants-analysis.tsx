'use client';

import { useEffect, useState } from 'react';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  // Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface OverviewData {
  totalRecords: number;
  batchCount: number;
  firstCollection: string;
  lastCollection: string;
  activeBusinesses: number;
}

interface BusinessTypeData {
  type: string;
  count: number;
}

interface BusinessStatusData {
  status: string;
  count: number;
}

interface TimelineData {
  date: string;
  count: number;
}

interface DetailData {
  management_number: string;
  business_name: string;
  business_status_name: string;
  business_type: string;
  road_address: string;
  lot_address: string;
  phone_number: string;
  license_date: string;
  created_at: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// 어두운 테마 차트 색상 팔레트
const CHART_COLORS = [
  '#60a5fa',
  '#34d399',
  '#fbbf24',
  '#f87171',
  '#4ade80',
  '#fb923c',
  '#38bdf8',
  '#a78bfa',
  '#22d3ee',
  '#84cc16',
  '#f472b6',
  '#06b6d4',
  '#8b5cf6',
  '#10b981',
  '#ef4444',
  '#14b8a6',
  '#3b82f6',
  '#eab308',
  '#ec4899',
  '#059669',
];

// 영업상태별 색상 매핑
const STATUS_COLORS: { [key: string]: string } = {
  영업: '#10b981',
  폐업: '#ef4444',
  휴업: '#f59e0b',
  영업중지: '#f87171',
  기타: '#6b7280',
};

export function SeoulRestaurantsAnalysis() {
  const [loading, setLoading] = useState(true);
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [businessTypeData, setBusinessTypeData] = useState<BusinessTypeData[]>(
    []
  );
  const [businessStatusData, setBusinessStatusData] = useState<
    BusinessStatusData[]
  >([]);
  const [timelineData, setTimelineData] = useState<TimelineData[]>([]);
  const [detailData, setDetailData] = useState<DetailData[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBusinessType, setSelectedBusinessType] = useState('');
  const [selectedBusinessStatus, setSelectedBusinessStatus] = useState('');

  // 데이터 로드
  const loadData = async () => {
    try {
      setLoading(true);

      // 병렬로 모든 데이터 로드
      const [
        overviewRes,
        businessTypeRes,
        businessStatusRes,
        timelineRes,
        detailRes,
      ] = await Promise.all([
        fetch('/api/data-analysis/seoul-restaurants?type=overview'),
        fetch('/api/data-analysis/seoul-restaurants?type=business_type'),
        fetch('/api/data-analysis/seoul-restaurants?type=business_status'),
        fetch('/api/data-analysis/seoul-restaurants?type=timeline'),
        fetch(
          `/api/data-analysis/seoul-restaurants?type=details&page=1&limit=50&search=${searchTerm}&business_type=${selectedBusinessType}&business_status=${selectedBusinessStatus}`
        ),
      ]);

      const [overview, businessType, businessStatus, timeline, detail] =
        await Promise.all([
          overviewRes.json(),
          businessTypeRes.json(),
          businessStatusRes.json(),
          timelineRes.json(),
          detailRes.json(),
        ]);

      if (overview.success) setOverviewData(overview.data);
      if (businessType.success) setBusinessTypeData(businessType.data);
      if (businessStatus.success) setBusinessStatusData(businessStatus.data);
      if (timeline.success) setTimelineData(timeline.data);
      if (detail.success) {
        setDetailData(detail.data.items);
        setPagination(detail.data.pagination);
      }
    } catch (error) {
      console.error('데이터 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  // 상세 데이터만 다시 로드
  const loadDetailData = async (page = 1) => {
    try {
      const response = await fetch(
        `/api/data-analysis/seoul-restaurants?type=details&page=${page}&limit=50&search=${searchTerm}&business_type=${selectedBusinessType}&business_status=${selectedBusinessStatus}`
      );
      const result = await response.json();

      if (result.success) {
        setDetailData(result.data.items);
        setPagination(result.data.pagination);
      }
    } catch (error) {
      console.error('상세 데이터 로드 오류:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadDetailData();
  }, [searchTerm, selectedBusinessType, selectedBusinessStatus]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  if (loading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500'></div>
      </div>
    );
  }

  return (
    <div className='min-h-screen space-y-8 rounded-lg bg-gray-900 p-6'>
      {/* 전체 통계 카드 */}
      {overviewData && (
        <div className='grid grid-cols-1 gap-6 md:grid-cols-5'>
          <div className='rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-lg'>
            <div className='flex items-center'>
              <div className='rounded-lg bg-blue-800 p-2'>
                <svg
                  className='h-6 w-6 text-blue-300'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
                  />
                </svg>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-300'>총 음식점</p>
                <p className='text-2xl font-bold text-white'>
                  {formatNumber(overviewData.totalRecords)}
                </p>
              </div>
            </div>
          </div>

          <div className='rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-lg'>
            <div className='flex items-center'>
              <div className='rounded-lg bg-green-800 p-2'>
                <svg
                  className='h-6 w-6 text-green-300'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-300'>영업 중</p>
                <p className='text-2xl font-bold text-white'>
                  {formatNumber(overviewData.activeBusinesses)}
                </p>
              </div>
            </div>
          </div>

          <div className='rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-lg'>
            <div className='flex items-center'>
              <div className='rounded-lg bg-yellow-800 p-2'>
                <svg
                  className='h-6 w-6 text-yellow-300'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 00-2 2v0a2 2 0 002 2h.01M5 11a2 2 0 100-4 2 2 0 000 4z'
                  />
                </svg>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-300'>수집 배치</p>
                <p className='text-2xl font-bold text-white'>
                  {formatNumber(overviewData.batchCount)}
                </p>
              </div>
            </div>
          </div>

          <div className='rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-lg'>
            <div className='flex items-center'>
              <div className='rounded-lg bg-purple-800 p-2'>
                <svg
                  className='h-6 w-6 text-purple-300'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h8m-8 0H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2'
                  />
                </svg>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-300'>첫 수집</p>
                <p className='text-sm font-bold text-white'>
                  {formatDate(overviewData.firstCollection)}
                </p>
              </div>
            </div>
          </div>

          <div className='rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-lg'>
            <div className='flex items-center'>
              <div className='rounded-lg bg-orange-800 p-2'>
                <svg
                  className='h-6 w-6 text-orange-300'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-300'>최근 수집</p>
                <p className='text-sm font-bold text-white'>
                  {formatDate(overviewData.lastCollection)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 차트 섹션 */}
      <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
        {/* 업종별 분포 바차트 */}
        <div className='rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-lg'>
          <h3 className='mb-4 text-lg font-semibold text-white'>
            업종별 분포 (상위 10개)
          </h3>
          <ResponsiveContainer width='100%' height={300}>
            <BarChart data={businessTypeData.slice(0, 10)}>
              <CartesianGrid strokeDasharray='3 3' stroke='#374151' />
              <XAxis
                dataKey='type'
                angle={-45}
                textAnchor='end'
                height={100}
                interval={0}
                fontSize={12}
                tick={{ fill: '#d1d5db' }}
                axisLine={{ stroke: '#6b7280' }}
              />
              <YAxis
                tick={{ fill: '#d1d5db' }}
                axisLine={{ stroke: '#6b7280' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f3f4f6',
                }}
              />
              <Bar dataKey='count' fill='#60a5fa' />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 영업상태별 분포 파이차트 */}
        <div className='rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-lg'>
          <h3 className='mb-4 text-lg font-semibold text-white'>
            영업상태별 분포
          </h3>
          <ResponsiveContainer width='100%' height={300}>
            <PieChart>
              <Pie
                data={businessStatusData}
                cx='50%'
                cy='50%'
                labelLine={false}
                label={({ status, percent }) =>
                  `${status} ${(percent * 100).toFixed(1)}%`
                }
                outerRadius={80}
                fill='#60a5fa'
                dataKey='count'
              >
                {businessStatusData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      STATUS_COLORS[entry.status] ||
                      CHART_COLORS[index % CHART_COLORS.length]
                    }
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f3f4f6',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 시간대별 트렌드 */}
      {timelineData.length > 0 && (
        <div className='rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-lg'>
          <h3 className='mb-4 text-lg font-semibold text-white'>
            수집 트렌드 (최근 30일)
          </h3>
          <ResponsiveContainer width='100%' height={300}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray='3 3' stroke='#374151' />
              <XAxis
                dataKey='date'
                tickFormatter={value =>
                  new Date(value).toLocaleDateString('ko-KR', {
                    month: 'short',
                    day: 'numeric',
                  })
                }
                tick={{ fill: '#d1d5db' }}
                axisLine={{ stroke: '#6b7280' }}
              />
              <YAxis
                tick={{ fill: '#d1d5db' }}
                axisLine={{ stroke: '#6b7280' }}
              />
              <Tooltip
                labelFormatter={value =>
                  new Date(value).toLocaleDateString('ko-KR')
                }
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f3f4f6',
                }}
              />
              <Line
                type='monotone'
                dataKey='count'
                stroke='#34d399'
                strokeWidth={3}
                dot={{ r: 5, fill: '#34d399' }}
                activeDot={{ r: 7, fill: '#10b981' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 상세 데이터 그리드 */}
      <div className='rounded-lg border border-gray-700 bg-gray-800 shadow-lg'>
        <div className='border-b border-gray-600 p-6'>
          <h3 className='mb-4 text-lg font-semibold text-white'>상세 데이터</h3>

          {/* 필터 및 검색 */}
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            <div>
              <label className='mb-1 block text-sm font-medium text-gray-300'>
                검색
              </label>
              <input
                type='text'
                placeholder='사업장명 또는 관리번호 검색'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>

            <div>
              <label className='mb-1 block text-sm font-medium text-gray-300'>
                업종 필터
              </label>
              <select
                value={selectedBusinessType}
                onChange={e => setSelectedBusinessType(e.target.value)}
                className='w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value=''>전체 업종</option>
                {businessTypeData.slice(0, 15).map(item => (
                  <option key={item.type} value={item.type}>
                    {item.type} ({formatNumber(item.count)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className='mb-1 block text-sm font-medium text-gray-300'>
                영업상태 필터
              </label>
              <select
                value={selectedBusinessStatus}
                onChange={e => setSelectedBusinessStatus(e.target.value)}
                className='w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value=''>전체 상태</option>
                {businessStatusData.map(item => (
                  <option key={item.status} value={item.status}>
                    {item.status} ({formatNumber(item.count)})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 데이터 테이블 */}
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-700'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300'>
                  관리번호
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300'>
                  사업장명
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300'>
                  영업상태
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300'>
                  업종
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300'>
                  주소
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300'>
                  인허가일자
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300'>
                  수집일시
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-600 bg-gray-800'>
              {detailData.map((item, index) => (
                <tr
                  key={`${item.management_number}-${index}`}
                  className='transition-colors hover:bg-gray-700'
                >
                  <td className='whitespace-nowrap px-6 py-4 font-mono text-sm text-blue-300'>
                    {item.management_number}
                  </td>
                  <td className='max-w-xs truncate px-6 py-4 text-sm font-medium text-white'>
                    {item.business_name}
                  </td>
                  <td className='whitespace-nowrap px-6 py-4 text-sm'>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        item.business_status_name === '영업'
                          ? 'bg-green-800 text-green-200'
                          : item.business_status_name === '폐업'
                            ? 'bg-red-800 text-red-200'
                            : item.business_status_name === '휴업'
                              ? 'bg-yellow-800 text-yellow-200'
                              : 'bg-gray-700 text-gray-300'
                      } `}
                    >
                      {item.business_status_name}
                    </span>
                  </td>
                  <td className='max-w-xs truncate px-6 py-4 text-sm text-gray-300'>
                    {item.business_type}
                  </td>
                  <td className='max-w-xs truncate px-6 py-4 text-sm text-gray-400'>
                    {item.road_address || item.lot_address}
                  </td>
                  <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-400'>
                    {formatDate(item.license_date)}
                  </td>
                  <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-400'>
                    {formatDate(item.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        {pagination.pages > 1 && (
          <div className='flex items-center justify-between border-t border-gray-600 bg-gray-700 px-6 py-3'>
            <div className='text-sm text-gray-300'>
              전체 {formatNumber(pagination.total)}개 중{' '}
              {(pagination.page - 1) * pagination.limit + 1}-
              {Math.min(pagination.page * pagination.limit, pagination.total)}개
              표시
            </div>
            <div className='flex gap-2'>
              <button
                onClick={() => loadDetailData(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className='rounded border border-gray-600 px-3 py-1 text-sm text-gray-300 transition-colors hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50'
              >
                이전
              </button>
              <span className='px-3 py-1 text-sm font-medium text-gray-300'>
                {pagination.page} / {pagination.pages}
              </span>
              <button
                onClick={() => loadDetailData(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className='rounded border border-gray-600 px-3 py-1 text-sm text-gray-300 transition-colors hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50'
              >
                다음
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
