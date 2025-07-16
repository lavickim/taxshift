'use client'

import { useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer
} from 'recharts'

interface OverviewData {
  totalRecords: number
  batchCount: number
  firstCollection: string
  lastCollection: string
}

interface IndustryData {
  industry: string
  count: number
}

interface RegionData {
  region: string
  count: number
}

interface TimelineData {
  date: string
  count: number
}

interface DetailData {
  business_reg_no: string
  store_name: string
  sigun_name: string
  industry_type: string
  refined_road_address: string
  refined_zipcode: string
  created_at: string
}

interface PaginationData {
  page: number
  limit: number
  total: number
  pages: number
}

// 어두운 테마 차트 색상 팔레트
const CHART_COLORS = [
  '#60a5fa', '#34d399', '#fbbf24', '#f87171', '#4ade80',
  '#fb923c', '#38bdf8', '#a78bfa', '#22d3ee', '#84cc16',
  '#f472b6', '#06b6d4', '#8b5cf6', '#10b981', '#ef4444',
  '#14b8a6', '#3b82f6', '#eab308', '#ec4899', '#059669'
]

export function GyeonggiDeliveryAnalysis() {
  const [loading, setLoading] = useState(true)
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null)
  const [industryData, setIndustryData] = useState<IndustryData[]>([])
  const [regionData, setRegionData] = useState<RegionData[]>([])
  const [timelineData, setTimelineData] = useState<TimelineData[]>([])
  const [detailData, setDetailData] = useState<DetailData[]>([])
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIndustry, setSelectedIndustry] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('')

  // 데이터 로드
  const loadData = async () => {
    try {
      setLoading(true)
      
      // 병렬로 모든 데이터 로드
      const [overviewRes, industryRes, regionRes, timelineRes, detailRes] = await Promise.all([
        fetch('/api/data-analysis/gyeonggi-delivery-stores?type=overview'),
        fetch('/api/data-analysis/gyeonggi-delivery-stores?type=industry'),
        fetch('/api/data-analysis/gyeonggi-delivery-stores?type=region'),
        fetch('/api/data-analysis/gyeonggi-delivery-stores?type=timeline'),
        fetch(`/api/data-analysis/gyeonggi-delivery-stores?type=details&page=1&limit=50&search=${searchTerm}&industry=${selectedIndustry}&region=${selectedRegion}`)
      ])

      const [overview, industry, region, timeline, detail] = await Promise.all([
        overviewRes.json(),
        industryRes.json(),
        regionRes.json(),
        timelineRes.json(),
        detailRes.json()
      ])

      if (overview.success) setOverviewData(overview.data)
      if (industry.success) setIndustryData(industry.data)
      if (region.success) setRegionData(region.data)
      if (timeline.success) setTimelineData(timeline.data)
      if (detail.success) {
        setDetailData(detail.data.items)
        setPagination(detail.data.pagination)
      }
    } catch (error) {
      console.error('데이터 로드 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  // 상세 데이터만 다시 로드
  const loadDetailData = async (page = 1) => {
    try {
      const response = await fetch(
        `/api/data-analysis/gyeonggi-delivery-stores?type=details&page=${page}&limit=50&search=${searchTerm}&industry=${selectedIndustry}&region=${selectedRegion}`
      )
      const result = await response.json()
      
      if (result.success) {
        setDetailData(result.data.items)
        setPagination(result.data.pagination)
      }
    } catch (error) {
      console.error('상세 데이터 로드 오류:', error)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    loadDetailData()
  }, [searchTerm, selectedIndustry, selectedRegion])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR')
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(num)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8 bg-gray-900 min-h-screen p-6 rounded-lg">
      {/* 전체 통계 카드 */}
      {overviewData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-blue-800 rounded-lg">
                <svg className="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">총 가맹점</p>
                <p className="text-2xl font-bold text-white">{formatNumber(overviewData.totalRecords)}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-green-800 rounded-lg">
                <svg className="w-6 h-6 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 00-2 2v0a2 2 0 002 2h.01M5 11a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">수집 배치</p>
                <p className="text-2xl font-bold text-white">{formatNumber(overviewData.batchCount)}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-purple-800 rounded-lg">
                <svg className="w-6 h-6 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h8m-8 0H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">첫 수집</p>
                <p className="text-sm font-bold text-white">{formatDate(overviewData.firstCollection)}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-orange-800 rounded-lg">
                <svg className="w-6 h-6 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">최근 수집</p>
                <p className="text-sm font-bold text-white">{formatDate(overviewData.lastCollection)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 차트 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 업종별 분포 바차트 */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-white">업종별 분포 (상위 10개)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={industryData.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="industry" 
                angle={-45}
                textAnchor="end"
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
                  color: '#f3f4f6'
                }}
              />
              <Bar dataKey="count" fill="#60a5fa" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 지역별 분포 파이차트 */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-white">지역별 분포 (상위 10개)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={regionData.slice(0, 10)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ region, percent }) => `${region} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#60a5fa"
                dataKey="count"
              >
                {regionData.slice(0, 10).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f3f4f6'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 시간대별 트렌드 */}
      {timelineData.length > 0 && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-white">수집 트렌드 (최근 30일)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                tick={{ fill: '#d1d5db' }}
                axisLine={{ stroke: '#6b7280' }}
              />
              <YAxis 
                tick={{ fill: '#d1d5db' }}
                axisLine={{ stroke: '#6b7280' }}
              />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString('ko-KR')}
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f3f4f6'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#34d399" 
                strokeWidth={3}
                dot={{ r: 5, fill: '#34d399' }}
                activeDot={{ r: 7, fill: '#10b981' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 상세 데이터 그리드 */}
      <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
        <div className="p-6 border-b border-gray-600">
          <h3 className="text-lg font-semibold mb-4 text-white">상세 데이터</h3>
          
          {/* 필터 및 검색 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">검색</label>
              <input
                type="text"
                placeholder="상호명 또는 사업자번호 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">업종 필터</label>
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">전체 업종</option>
                {industryData.slice(0, 15).map((item) => (
                  <option key={item.industry} value={item.industry}>
                    {item.industry} ({formatNumber(item.count)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">지역 필터</label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">전체 지역</option>
                {regionData.slice(0, 15).map((item) => (
                  <option key={item.region} value={item.region}>
                    {item.region} ({formatNumber(item.count)})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 데이터 테이블 */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  사업자번호
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  상호명
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  지역
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  업종
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  주소
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  수집일시
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-600">
              {detailData.map((item, index) => (
                <tr key={`${item.business_reg_no}-${index}`} className="hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-300">
                    {item.business_reg_no}
                  </td>
                  <td className="px-6 py-4 text-sm text-white max-w-xs truncate font-medium">
                    {item.store_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {item.sigun_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300 max-w-xs truncate">
                    {item.industry_type}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400 max-w-xs truncate">
                    {item.refined_road_address}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {formatDate(item.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        {pagination.pages > 1 && (
          <div className="px-6 py-3 border-t border-gray-600 bg-gray-700 flex items-center justify-between">
            <div className="text-sm text-gray-300">
              전체 {formatNumber(pagination.total)}개 중 {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)}개 표시
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => loadDetailData(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-3 py-1 text-sm border border-gray-600 rounded text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
              >
                이전
              </button>
              <span className="px-3 py-1 text-sm text-gray-300 font-medium">
                {pagination.page} / {pagination.pages}
              </span>
              <button
                onClick={() => loadDetailData(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="px-3 py-1 text-sm border border-gray-600 rounded text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
              >
                다음
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 