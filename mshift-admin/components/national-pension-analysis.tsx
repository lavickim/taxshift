'use client'

import { useState, useEffect } from 'react'
import KeywordGraphSection from './keyword-graph/KeywordGraphSection'
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
  ResponsiveContainer,
  AreaChart,
  Area
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

interface StatusData {
  status: string
  count: number
}

interface RegionData {
  region: string
  count: number
}

interface IndustryData {
  industry: string
  count: number
  avgEmployees: number
}

interface CompanySizeData {
  category: string
  count: number
  totalEmployees: number
}

interface TopCompanyData {
  name: string
  industry: string
  employees: number
  monthlyAmount: number
  address: string
  region: string
}

interface AllCompanyData {
  name: string
  industry: string
  employees: number
  monthlyAmount: number
  address: string
  region: string
  status: string
  dataMonth: string
}

interface CompanyPaginationData {
  page: number
  limit: number
  total: number
  pages: number
}

interface CompanyFiltersData {
  search: string
  region: string
  industry: string
  sortBy: string
  sortOrder: string
}

const COLORS = {
  primary: ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'],
  success: ['#10b981', '#34d399', '#6ee7b7', '#9deccc', '#c6f6d5'],
  warning: ['#f59e0b', '#fbbf24', '#fcd34d', '#fde68a', '#fef3c7'],
  error: ['#ef4444', '#f87171', '#fca5a5', '#fecaca', '#fee2e2'],
  info: ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'],
  gradient: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe']
}

export function NationalPensionAnalysis() {
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null)
  const [statusData, setStatusData] = useState<StatusData[]>([])
  const [regionData, setRegionData] = useState<RegionData[]>([])
  const [industryData, setIndustryData] = useState<IndustryData[]>([])
  const [companySizeData, setCompanySizeData] = useState<CompanySizeData[]>([])
  const [topCompanies, setTopCompanies] = useState<TopCompanyData[]>([])
  const [allCompanies, setAllCompanies] = useState<AllCompanyData[]>([])
  const [companyPagination, setCompanyPagination] = useState<CompanyPaginationData>({ page: 1, limit: 100, total: 0, pages: 0 })
  const [companyFilters, setCompanyFilters] = useState<CompanyFiltersData>({ search: '', region: '', industry: '', sortBy: 'employees', sortOrder: 'desc' })
  const [loading, setLoading] = useState(true)
  const [companiesLoading, setCompaniesLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const [overview, status, region, industry, companySize, topCompaniesData] = await Promise.all([
        fetch('/api/data-analysis/national-pension?type=overview').then(r => r.json()),
        fetch('/api/data-analysis/national-pension?type=status').then(r => r.json()),
        fetch('/api/data-analysis/national-pension?type=region').then(r => r.json()),
        fetch('/api/data-analysis/national-pension?type=industry').then(r => r.json()),
        fetch('/api/data-analysis/national-pension?type=company-size').then(r => r.json()),
        fetch('/api/data-analysis/national-pension?type=top-companies').then(r => r.json())
      ])

      if (overview.success) setOverviewData(overview.data)
      if (status.success) setStatusData(status.data)
      if (region.success) setRegionData(region.data.slice(0, 15))
      if (industry.success) setIndustryData(industry.data.slice(0, 15))
      if (companySize.success) setCompanySizeData(companySize.data)
      if (topCompaniesData.success) setTopCompanies(topCompaniesData.data.slice(0, 20))

    } catch (error) {
      console.error('데이터 로딩 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllCompanies = async (page = 1, filters = companyFilters) => {
    setCompaniesLoading(true)
    try {
      const queryParams = new URLSearchParams({
        type: 'all-companies',
        page: page.toString(),
        limit: '100',
        search: filters.search,
        region: filters.region,
        industry: filters.industry,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      })

      const response = await fetch(`/api/data-analysis/national-pension?${queryParams}`)
      const result = await response.json()

      if (result.success) {
        setAllCompanies(result.data.items)
        setCompanyPagination(result.data.pagination)
        setCompanyFilters(result.data.filters)
      }
    } catch (error) {
      console.error('전체 기업 데이터 로딩 오류:', error)
    } finally {
      setCompaniesLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'all-companies') {
      fetchAllCompanies()
    }
  }, [activeTab])

  // 컴포넌트 마운트 시 전체 기업 데이터도 미리 로드
  useEffect(() => {
    const loadInitialCompanies = async () => {
      try {
        const response = await fetch('/api/data-analysis/national-pension?type=all-companies&page=1&limit=100&sortBy=employees&sortOrder=desc')
        const result = await response.json()
        
        if (result.success) {
          setAllCompanies(result.data.items)
          setCompanyPagination(result.data.pagination)
          setCompanyFilters(result.data.filters)
        }
      } catch (error) {
        console.error('초기 기업 데이터 로딩 오류:', error)
      }
    }
    
    loadInitialCompanies()
  }, [])

  const handleFilterChange = (key: keyof CompanyFiltersData, value: string) => {
    const newFilters = { ...companyFilters, [key]: value }
    setCompanyFilters(newFilters)
    fetchAllCompanies(1, newFilters)
  }

  const handlePageChange = (page: number) => {
    fetchAllCompanies(page, companyFilters)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded-lg w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-gray-800 p-6 rounded-lg h-32"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-gray-800 p-6 rounded-lg h-96"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            🏢 국민연금 사업장 분석 대시보드
          </h1>
          <p className="text-gray-400 text-lg">
            전국 54만+ 사업장의 상세 분석 및 인사이트
          </p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
            {[
              { id: 'overview', name: '📊 개요', icon: '📊' },
              { id: 'industry', name: '🏭 업종별', icon: '🏭' },
              { id: 'size', name: '📈 규모별', icon: '📈' },
              { id: 'companies', name: '🏆 주요기업', icon: '🏆' },
              { id: 'all-companies', name: '🏢 전체기업', icon: '🏢' },
              { id: 'keyword-graph', name: '🕸️ 키워드그래프', icon: '🕸️' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* 개요 카드 */}
        {overviewData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-900 to-blue-800 p-6 rounded-xl shadow-xl border border-blue-700">
              <div className="flex items-center">
                <div className="p-3 bg-blue-600 rounded-lg">
                  <svg className="w-8 h-8 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-200">전체 사업장</p>
                  <p className="text-2xl font-bold text-white">
                    {overviewData.totalWorkplaces.toLocaleString()}개
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-900 to-green-800 p-6 rounded-xl shadow-xl border border-green-700">
              <div className="flex items-center">
                <div className="p-3 bg-green-600 rounded-lg">
                  <svg className="w-8 h-8 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-200">활성 사업장</p>
                  <p className="text-2xl font-bold text-white">
                    {overviewData.activeWorkplaces.toLocaleString()}개
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-900 to-purple-800 p-6 rounded-xl shadow-xl border border-purple-700">
              <div className="flex items-center">
                <div className="p-3 bg-purple-600 rounded-lg">
                  <svg className="w-8 h-8 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-purple-200">분포 지역</p>
                  <p className="text-2xl font-bold text-white">
                    {overviewData.regionCount}개 지역
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-900 to-orange-800 p-6 rounded-xl shadow-xl border border-orange-700">
              <div className="flex items-center">
                <div className="p-3 bg-orange-600 rounded-lg">
                  <svg className="w-8 h-8 text-orange-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-orange-200">활성률</p>
                  <p className="text-2xl font-bold text-white">
                    {((overviewData.activeWorkplaces / overviewData.totalWorkplaces) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 탭별 콘텐츠 */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 사업장 상태별 분포 */}
            <div className="bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <span className="mr-2">📊</span>
                사업장 상태별 분포
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({name, value, percent}) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS.success[index % COLORS.success.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [value.toLocaleString(), '사업장 수']} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* 지역별 상위 분포 */}
            <div className="bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <span className="mr-2">🗺️</span>
                지역별 사업장 분포 (상위 10개)
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={regionData.slice(0, 10)} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9ca3af" />
                  <YAxis dataKey="region" type="category" width={60} stroke="#9ca3af" />
                  <Tooltip 
                    formatter={(value: any) => [value.toLocaleString(), '사업장 수']}
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'industry' && (
          <div className="space-y-8">
            {/* 업종별 분포 차트 */}
            <div className="bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <span className="mr-2">🏭</span>
                업종별 사업장 분포 (상위 15개)
              </h3>
              <ResponsiveContainer width="100%" height={500}>
                <BarChart data={industryData} margin={{ top: 20, right: 30, left: 20, bottom: 150 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="industry" 
                    angle={-45} 
                    textAnchor="end" 
                    height={150}
                    interval={0}
                    stroke="#9ca3af"
                    fontSize={11}
                  />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    formatter={(value: any, name: string) => [
                      name === 'count' ? value.toLocaleString() + '개' : Math.round(value) + '명',
                      name === 'count' ? '사업장 수' : '평균 직원 수'
                    ]}
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  />
                  <Legend />
                  <Bar dataKey="count" fill="#8b5cf6" name="사업장 수" />
                  <Bar dataKey="avgEmployees" fill="#10b981" name="평균 직원 수" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 업종별 상세 테이블 */}
            <div className="bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <span className="mr-2">📋</span>
                업종별 상세 현황
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-gray-300">
                  <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left">순위</th>
                      <th className="px-6 py-3 text-left">업종명</th>
                      <th className="px-6 py-3 text-right">사업장 수</th>
                      <th className="px-6 py-3 text-right">평균 직원 수</th>
                      <th className="px-6 py-3 text-right">비중</th>
                    </tr>
                  </thead>
                  <tbody>
                    {industryData.map((item, index) => (
                      <tr key={index} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-700">
                        <td className="px-6 py-4 font-medium text-blue-400">#{index + 1}</td>
                        <td className="px-6 py-4">{item.industry}</td>
                        <td className="px-6 py-4 text-right font-mono">{item.count.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right font-mono">{item.avgEmployees}</td>
                        <td className="px-6 py-4 text-right">
                          <span className="bg-blue-900 text-blue-300 text-xs font-medium px-2.5 py-0.5 rounded">
                            {((item.count / overviewData!.totalWorkplaces) * 100).toFixed(2)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'size' && (
          <div className="space-y-8">
            {/* 기업 규모별 분포 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <span className="mr-2">📈</span>
                  기업 규모별 사업장 분포
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={companySizeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {companySizeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS.gradient[index % COLORS.gradient.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [value.toLocaleString(), '사업장 수']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <span className="mr-2">👥</span>
                  기업 규모별 총 직원 수
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={companySizeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      formatter={(value: any) => [value.toLocaleString(), '총 직원 수']}
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                    />
                    <Bar dataKey="totalEmployees" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 규모별 상세 분석 */}
            <div className="bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <span className="mr-2">📊</span>
                기업 규모별 상세 분석
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {companySizeData.map((item, index) => (
                  <div key={index} className="bg-gray-700 p-4 rounded-lg">
                    <div className="text-center">
                      <h4 className="text-lg font-bold text-white mb-2">{item.category}</h4>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm text-gray-400">사업장 수</p>
                          <p className="text-xl font-bold text-blue-400">{item.count.toLocaleString()}개</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">총 직원 수</p>
                          <p className="text-xl font-bold text-green-400">{item.totalEmployees.toLocaleString()}명</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">평균 직원 수</p>
                          <p className="text-lg font-bold text-yellow-400">
                            {item.totalEmployees > 0 ? Math.round(item.totalEmployees / item.count) : 0}명
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'companies' && (
          <div className="space-y-8">
            {/* 주요 기업 TOP 20 */}
            <div className="bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <span className="mr-2">🏆</span>
                직원 수 기준 주요 기업 TOP 20
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-gray-300">
                  <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left">순위</th>
                      <th className="px-4 py-3 text-left">기업명</th>
                      <th className="px-4 py-3 text-left">업종</th>
                      <th className="px-4 py-3 text-right">직원 수</th>
                      <th className="px-4 py-3 text-right">월 고지액</th>
                      <th className="px-4 py-3 text-left">지역</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topCompanies.map((company, index) => (
                      <tr key={index} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-700">
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            {index < 3 && (
                              <span className="mr-2">
                                {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                              </span>
                            )}
                            <span className="font-bold text-blue-400">#{index + 1}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 font-medium text-white max-w-xs truncate" title={company.name}>
                          {company.name}
                        </td>
                        <td className="px-4 py-4 text-gray-400 max-w-xs truncate" title={company.industry}>
                          {company.industry}
                        </td>
                        <td className="px-4 py-4 text-right font-mono text-green-400">
                          {company.employees.toLocaleString()}명
                        </td>
                        <td className="px-4 py-4 text-right font-mono text-yellow-400">
                          {(company.monthlyAmount / 100000000).toFixed(1)}억원
                        </td>
                        <td className="px-4 py-4">
                          <span className="bg-purple-900 text-purple-300 text-xs font-medium px-2.5 py-0.5 rounded">
                            {company.region}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 text-center">
                <button
                  onClick={() => setActiveTab('all-companies')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
                >
                  📋 전체 기업 목록 보기 (54만+ 기업)
                </button>
              </div>
            </div>

            {/* 기업 규모 분포 차트 */}
            <div className="bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <span className="mr-2">📊</span>
                주요 기업 직원 수 분포
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={topCompanies.slice(0, 15)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={100}
                    interval={0}
                    stroke="#9ca3af"
                    fontSize={10}
                  />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    formatter={(value: any) => [value.toLocaleString() + '명', '직원 수']}
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="employees" 
                    stroke="#8b5cf6" 
                    fill="url(#colorEmployees)" 
                    strokeWidth={2}
                  />
                  <defs>
                    <linearGradient id="colorEmployees" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'all-companies' && (
          <div className="space-y-8">
            {/* 전체 기업 필터 및 검색 */}
            <div className="bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <span className="mr-2">🏢</span>
                전체 기업 검색 및 필터
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">기업명 검색</label>
                  <input
                    type="text"
                    placeholder="기업명을 입력하세요"
                    value={companyFilters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">지역 필터</label>
                  <select
                    value={companyFilters.region}
                    onChange={(e) => handleFilterChange('region', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">전체 지역</option>
                    <option value="서울">서울</option>
                    <option value="경기">경기</option>
                    <option value="인천">인천</option>
                    <option value="부산">부산</option>
                    <option value="대구">대구</option>
                    <option value="광주">광주</option>
                    <option value="대전">대전</option>
                    <option value="울산">울산</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">업종 필터</label>
                  <input
                    type="text"
                    placeholder="업종명을 입력하세요"
                    value={companyFilters.industry}
                    onChange={(e) => handleFilterChange('industry', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">정렬 기준</label>
                  <div className="flex gap-2">
                    <select
                      value={companyFilters.sortBy}
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="employees">직원 수</option>
                      <option value="name">기업명</option>
                      <option value="monthly_amount">월 고지액</option>
                    </select>
                    <select
                      value={companyFilters.sortOrder}
                      onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="desc">내림차순</option>
                      <option value="asc">오름차순</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* 검색 결과 요약 */}
              <div className="flex justify-between items-center text-sm text-gray-400">
                <span>
                  총 {companyPagination.total.toLocaleString()}개 기업 
                  ({((companyPagination.page - 1) * companyPagination.limit) + 1}-{Math.min(companyPagination.page * companyPagination.limit, companyPagination.total)}번째 표시)
                </span>
                <span>
                  {companyPagination.page} / {companyPagination.pages} 페이지
                </span>
              </div>
            </div>

            {/* 전체 기업 데이터 그리드 */}
            <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700">
              <div className="p-6 border-b border-gray-700">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <span className="mr-2">📋</span>
                  전체 기업 목록
                </h3>
              </div>
              
              {companiesLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-gray-400">기업 데이터를 로딩 중...</span>
                </div>
              ) : allCompanies.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <p className="text-lg font-medium">검색 조건에 맞는 기업이 없습니다</p>
                  <p className="text-sm mt-1">필터 조건을 조정해보세요</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-gray-300">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left">순위</th>
                        <th className="px-4 py-3 text-left">기업명</th>
                        <th className="px-4 py-3 text-left">업종</th>
                        <th className="px-4 py-3 text-right">직원 수</th>
                        <th className="px-4 py-3 text-right">월 고지액</th>
                        <th className="px-4 py-3 text-left">지역</th>
                        <th className="px-4 py-3 text-left">상태</th>
                        <th className="px-4 py-3 text-left">기준월</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allCompanies.map((company, index) => (
                        <tr key={`${company.name}-${index}`} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-700">
                          <td className="px-4 py-4 font-medium text-blue-400">
                            #{((companyPagination.page - 1) * companyPagination.limit) + index + 1}
                          </td>
                          <td className="px-4 py-4 font-medium text-white max-w-xs truncate" title={company.name}>
                            {company.name}
                          </td>
                          <td className="px-4 py-4 text-gray-400 max-w-xs truncate" title={company.industry}>
                            {company.industry}
                          </td>
                          <td className="px-4 py-4 text-right font-mono text-green-400">
                            {company.employees.toLocaleString()}명
                          </td>
                          <td className="px-4 py-4 text-right font-mono text-yellow-400">
                            {company.monthlyAmount > 0 ? (company.monthlyAmount / 100000000).toFixed(1) + '억원' : '-'}
                          </td>
                          <td className="px-4 py-4">
                            <span className="bg-purple-900 text-purple-300 text-xs font-medium px-2.5 py-0.5 rounded">
                              {company.region}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${
                              company.status === '가입' 
                                ? 'bg-green-900 text-green-300' 
                                : 'bg-red-900 text-red-300'
                            }`}>
                              {company.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-gray-400">
                            {company.dataMonth}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 페이지네이션 */}
              {!companiesLoading && allCompanies.length > 0 && companyPagination.pages > 1 && (
                <div className="px-6 py-4 border-t border-gray-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={companyPagination.page <= 1}
                      className="px-3 py-1 text-sm border border-gray-600 rounded text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                    >
                      처음
                    </button>
                    <button
                      onClick={() => handlePageChange(companyPagination.page - 1)}
                      disabled={companyPagination.page <= 1}
                      className="px-3 py-1 text-sm border border-gray-600 rounded text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                    >
                      이전
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, companyPagination.pages) }, (_, i) => {
                      const pageNum = Math.max(1, companyPagination.page - 2) + i
                      if (pageNum <= companyPagination.pages) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-1 text-sm rounded transition-colors ${
                              pageNum === companyPagination.page
                                ? 'bg-blue-600 text-white'
                                : 'border border-gray-600 text-gray-300 hover:bg-gray-600'
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      }
                      return null
                    })}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(companyPagination.page + 1)}
                      disabled={companyPagination.page >= companyPagination.pages}
                      className="px-3 py-1 text-sm border border-gray-600 rounded text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                    >
                      다음
                    </button>
                    <button
                      onClick={() => handlePageChange(companyPagination.pages)}
                      disabled={companyPagination.page >= companyPagination.pages}
                      className="px-3 py-1 text-sm border border-gray-600 rounded text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                    >
                      마지막
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'keyword-graph' && (
          <div className="space-y-8">
            <KeywordGraphSection className="bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-700" />
          </div>
        )}
      </div>
    </div>
  )
}