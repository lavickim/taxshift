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
  ResponsiveContainer
} from 'recharts'

interface OverviewData {
  totalWorkplaces: number
  activeWorkplaces: number
  regionCount: number
  dataRange: {
    minDate: string
    maxDate: string
  }
}

interface RegionData {
  region: string
  count: number
}

interface StatusData {
  status: string
  count: number
}

interface DetailData {
  id: number
  data_year_month: string
  workplace_name: string
  business_registration_number: string
  workplace_status_code: number
  address_road: string
  industry_name: string
  application_date: string
  re_registration_date: string
}

interface PaginationData {
  page: number
  limit: number
  total: number
  pages: number
}

const CHART_COLORS = [
  '#60a5fa', '#34d399', '#fbbf24', '#f87171', '#4ade80',
  '#fb923c', '#38bdf8', '#a78bfa', '#22d3ee', '#84cc16',
  '#f472b6', '#06b6d4', '#8b5cf6', '#10b981', '#ef4444',
  '#14b8a6', '#3b82f6', '#eab308', '#ec4899', '#059669'
]

export function NationalPensionAnalysis() {
  const [loading, setLoading] = useState(true)
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null)
  const [regionData, setRegionData] = useState<RegionData[]>([])
  const [statusData, setStatusData] = useState<StatusData[]>([])
  const [detailData, setDetailData] = useState<DetailData[]>([])
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('')

  const loadData = async () => {
    try {
      setLoading(true)
      
      const [overviewRes, regionRes, statusRes, detailRes] = await Promise.all([
        fetch('/api/data-analysis/national-pension?type=overview'),
        fetch('/api/data-analysis/national-pension?type=region'),
        fetch('/api/data-analysis/national-pension?type=status'),
        fetch(`/api/data-analysis/national-pension?type=details&page=1&limit=50&search=${searchTerm}&region=${selectedRegion}`)
      ])

      const [overview, region, status, detail] = await Promise.all([
        overviewRes.json(),
        regionRes.json(),
        statusRes.json(),
        detailRes.json()
      ])

      if (overview.success) setOverviewData(overview.data)
      if (region.success) setRegionData(region.data)
      if (status.success) setStatusData(status.data)
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

  const loadDetailData = async (page = 1) => {
    try {
      const response = await fetch(
        `/api/data-analysis/national-pension?type=details&page=${page}&limit=50&search=${searchTerm}&region=${selectedRegion}`
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
  }, [searchTerm, selectedRegion])

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(num)
  }

  const getStatusLabel = (code: number) => {
    return code === 1 ? '가입' : '탈퇴'
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
      {overviewData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-blue-800 rounded-lg">
                <svg className="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">총 사업장</p>
                <p className="text-2xl font-bold text-white">{formatNumber(overviewData.totalWorkplaces)}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-green-800 rounded-lg">
                <svg className="w-6 h-6 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">가입 사업장</p>
                <p className="text-2xl font-bold text-white">{formatNumber(overviewData.activeWorkplaces)}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-800 rounded-lg">
                <svg className="w-6 h-6 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">지역 수</p>
                <p className="text-2xl font-bold text-white">{formatNumber(overviewData.regionCount)}</p>
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
                <p className="text-sm font-medium text-gray-300">데이터 기준</p>
                <p className="text-sm font-bold text-white">{overviewData.dataRange.minDate}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-white">지역별 분포 (상위 10개)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={regionData.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="region" 
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

        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-white">사업장 상태별 분포</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ status, percent }) => `${status} ${(percent * 100).toFixed(1)}%`}
                outerRadius={80}
                fill="#60a5fa"
                dataKey="count"
              >
                {statusData.map((_, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={CHART_COLORS[index % CHART_COLORS.length]} 
                  />
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

      <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
        <div className="p-6 border-b border-gray-600">
          <h3 className="text-lg font-semibold mb-4 text-white">상세 데이터</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">검색</label>
              <input
                type="text"
                placeholder="사업장명 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
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

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  사업장명
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  사업자등록번호
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  주소
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  업종
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  신청일
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-600">
              {detailData.map((item, index) => (
                <tr key={`${item.id}-${index}`} className="hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 text-sm text-white font-medium">
                    {item.workplace_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {item.business_registration_number}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      item.workplace_status_code === 1 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {getStatusLabel(item.workplace_status_code)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {item.address_road}
                  </td>
                  <td className="px-6 py-4 text-sm text-blue-300">
                    {item.industry_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {item.application_date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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