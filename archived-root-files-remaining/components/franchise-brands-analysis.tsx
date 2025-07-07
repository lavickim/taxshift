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
  totalBrands: number
  totalCompanies: number
  industryCount: number
  yearRange: {
    minYear: string
    maxYear: string
  }
}

interface CategoryData {
  category: string
  count: number
}

interface BrandData {
  company: string
  brandCount: number
}


interface DetailData {
  brand_name: string
  company_name: string
  industry_large_category: string
  industry_medium_category: string
  main_product: string
  business_year: string
  business_start_date: string
  representative_name: string
  created_at: string
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

export function FranchiseBrandsAnalysis() {
  const [loading, setLoading] = useState(true)
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null)
  const [categoryData, setCategoryData] = useState<CategoryData[]>([])
  const [brandData, setBrandData] = useState<BrandData[]>([])
  const [detailData, setDetailData] = useState<DetailData[]>([])
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  const loadData = async () => {
    try {
      setLoading(true)
      
      const [overviewRes, categoryRes, brandRes, detailRes] = await Promise.all([
        fetch('/api/data-analysis/franchise-brands?type=overview'),
        fetch('/api/data-analysis/franchise-brands?type=industry'),
        fetch('/api/data-analysis/franchise-brands?type=company'),
        fetch(`/api/data-analysis/franchise-brands?type=details&page=1&limit=50&search=${searchTerm}&industry=${selectedCategory}`)
      ])

      const [overview, category, brand, detail] = await Promise.all([
        overviewRes.json(),
        categoryRes.json(),
        brandRes.json(),
        detailRes.json()
      ])

      if (overview.success) setOverviewData(overview.data)
      if (category.success) setCategoryData(category.data)
      if (brand.success) setBrandData(brand.data)
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
        `/api/data-analysis/franchise-brands?type=details&page=${page}&limit=50&search=${searchTerm}&industry=${selectedCategory}`
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
  }, [searchTerm, selectedCategory])


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
      {overviewData && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-blue-800 rounded-lg">
                <svg className="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">총 브랜드</p>
                <p className="text-2xl font-bold text-white">{formatNumber(overviewData.totalBrands)}</p>
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
                <p className="text-sm font-medium text-gray-300">총 회사</p>
                <p className="text-2xl font-bold text-white">{formatNumber(overviewData.totalCompanies)}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-800 rounded-lg">
                <svg className="w-6 h-6 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 00-2 2v0a2 2 0 002 2h.01M5 11a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">업종 수</p>
                <p className="text-2xl font-bold text-white">{formatNumber(overviewData.industryCount)}</p>
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
                <p className="text-sm font-medium text-gray-300">최초 연도</p>
                <p className="text-sm font-bold text-white">{overviewData.yearRange.minYear}</p>
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
                <p className="text-sm font-medium text-gray-300">최근 연도</p>
                <p className="text-sm font-bold text-white">{overviewData.yearRange.maxYear}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-white">업종별 분포 (상위 10개)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="category" 
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
          <h3 className="text-lg font-semibold mb-4 text-white">회사별 분포 (상위 10개)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={brandData.slice(0, 10)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ company, percent }) => `${company} ${(percent * 100).toFixed(1)}%`}
                outerRadius={80}
                fill="#60a5fa"
                dataKey="brandCount"
              >
                {brandData.slice(0, 10).map((_, index) => (
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
                placeholder="브랜드명 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">업종 필터</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">전체 업종</option>
                {categoryData.slice(0, 15).map((item) => (
                  <option key={item.category} value={item.category}>
                    {item.category} ({formatNumber(item.count)})
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
                  브랜드명
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  회사명
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  업종
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  주요상품
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  사업연도
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  대표자
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-600">
              {detailData.map((item, index) => (
                <tr key={`${item.brand_name}-${index}`} className="hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 text-sm text-white font-medium">
                    {item.brand_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {item.company_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-blue-300 font-medium">
                    {item.industry_large_category}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {item.main_product}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {item.business_year}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {item.representative_name}
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