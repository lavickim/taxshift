'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Database, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  RefreshCw,
  ExternalLink,
  FileText,
  BarChart3
} from 'lucide-react'

interface CollectionStatus {
  source: string
  table: string
  status: 'active' | 'planned' | 'completed'
  records: number
  lastUpdate: string
  dataQuality: 'high' | 'medium' | 'low'
  priority: 'high' | 'medium' | 'low'
}

export function DataCollectionStatus() {
  const [collectionData, setCollectionData] = useState<CollectionStatus[]>([])
  const [totalRecords, setTotalRecords] = useState(0)
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  // 실시간 데이터 로드
  const loadCollectionStatus = async () => {
    try {
      setLoading(true)
      
      // 경기 데이터드림 현황 확인
      const gyeonggiResponse = await fetch('/api/data-collection/gyeonggi-delivery?action=status')
      const gyeonggiResult = await gyeonggiResponse.json()
      
      let gyeonggiRecords = 0
      let gyeonggiLastUpdate = 'N/A'
      
      if (gyeonggiResult.success && gyeonggiResult.status) {
        gyeonggiRecords = gyeonggiResult.status.totalRecords || 0
        gyeonggiLastUpdate = gyeonggiResult.status.lastUpdate || 'N/A'
      }

      // 수집 상태 데이터 구성
      const statusData: CollectionStatus[] = [
        {
          source: '경기 데이터드림 - 배달특급',
          table: 'datacollection_gyeonggi_delivery',
          status: gyeonggiRecords > 0 ? 'active' : 'planned',
          records: gyeonggiRecords,
          lastUpdate: gyeonggiLastUpdate,
          dataQuality: 'high',
          priority: 'high'
        },
        {
          source: '서울 열린데이터광장',
          table: 'datacollection_seoul_business',
          status: 'planned',
          records: 0,
          lastUpdate: '계획됨',
          dataQuality: 'high',
          priority: 'high'
        },
        {
          source: '부산 공공데이터',
          table: 'datacollection_busan_business',
          status: 'planned',
          records: 0,
          lastUpdate: '계획됨',
          dataQuality: 'medium',
          priority: 'medium'
        },
        {
          source: '인천 공공데이터',
          table: 'datacollection_incheon_business',
          status: 'planned',
          records: 0,
          lastUpdate: '계획됨',
          dataQuality: 'medium',
          priority: 'medium'
        },
        {
          source: '사업자등록정보 진위확인',
          table: 'datacollection_business_verification',
          status: 'planned',
          records: 0,
          lastUpdate: '계획됨',
          dataQuality: 'high',
          priority: 'high'
        }
      ]

      setCollectionData(statusData)
      setTotalRecords(statusData.reduce((sum, item) => sum + item.records, 0))
      setLastRefresh(new Date())
      
    } catch (error) {
      console.error('수집 현황 로드 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCollectionStatus()
    // 5분마다 자동 새로고침
    const interval = setInterval(loadCollectionStatus, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-900 text-green-300 border-green-700">🟢 수집 중</Badge>
      case 'completed':
        return <Badge className="bg-blue-900 text-blue-300 border-blue-700">✅ 완료</Badge>
      case 'planned':
        return <Badge className="bg-gray-700 text-gray-300 border-gray-600">📋 계획됨</Badge>
      default:
        return <Badge variant="outline" className="border-gray-600 text-gray-400">❓ 알 수 없음</Badge>
    }
  }

  const getQualityBadge = (quality: string) => {
    switch (quality) {
      case 'high':
        return <Badge className="bg-emerald-900 text-emerald-300 border-emerald-700">A급</Badge>
      case 'medium':
        return <Badge className="bg-yellow-900 text-yellow-300 border-yellow-700">B급</Badge>
      case 'low':
        return <Badge className="bg-red-900 text-red-300 border-red-700">C급</Badge>
      default:
        return <Badge variant="outline" className="border-gray-600 text-gray-400">-</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-900 text-red-300 border-red-700">🔥 높음</Badge>
      case 'medium':
        return <Badge className="bg-orange-900 text-orange-300 border-orange-700">⚡ 중간</Badge>
      case 'low':
        return <Badge className="bg-blue-900 text-blue-300 border-blue-700">📝 낮음</Badge>
      default:
        return <Badge variant="outline" className="border-gray-600 text-gray-400">-</Badge>
    }
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(num)
  }

  const formatDate = (dateString: string) => {
    if (dateString === 'N/A' || dateString === '계획됨') return dateString
    try {
      return new Date(dateString).toLocaleString('ko-KR')
    } catch {
      return dateString
    }
  }

  return (
    <div className="space-y-6 bg-gray-900 min-h-screen p-6 rounded-lg">
      {/* 전체 현황 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-green-500 bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-300">총 수집 레코드</CardTitle>
              <Database className="h-4 w-4 text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{formatNumber(totalRecords)}</div>
            <p className="text-xs text-gray-400 mt-1">현재 활성 데이터</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-300">활성 수집 소스</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">
              {collectionData.filter(item => item.status === 'active').length}
            </div>
            <p className="text-xs text-gray-400 mt-1">총 {collectionData.length}개 중</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-300">계획된 소스</CardTitle>
              <Clock className="h-4 w-4 text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">
              {collectionData.filter(item => item.status === 'planned').length}
            </div>
            <p className="text-xs text-gray-400 mt-1">구현 대기 중</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-300">마지막 업데이트</CardTitle>
              <RefreshCw className="h-4 w-4 text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold text-orange-400">
              {lastRefresh.toLocaleTimeString('ko-KR')}
            </div>
            <p className="text-xs text-gray-400 mt-1">자동 새로고침</p>
          </CardContent>
        </Card>
      </div>

      {/* 데이터 소스별 상세 현황 */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-white">
              <BarChart3 className="h-5 w-5 text-blue-400" />
              데이터 소스별 수집 현황
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadCollectionStatus}
              disabled={loading}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              새로고침
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-600">
                  <TableHead className="text-gray-300">데이터 소스</TableHead>
                  <TableHead className="text-gray-300">테이블명</TableHead>
                  <TableHead className="text-gray-300">상태</TableHead>
                  <TableHead className="text-right text-gray-300">레코드 수</TableHead>
                  <TableHead className="text-gray-300">데이터 품질</TableHead>
                  <TableHead className="text-gray-300">우선순위</TableHead>
                  <TableHead className="text-gray-300">마지막 업데이트</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {collectionData.map((item, index) => (
                  <TableRow key={index} className="hover:bg-gray-700 border-gray-600 transition-colors">
                    <TableCell className="font-medium text-white">{item.source}</TableCell>
                    <TableCell className="font-mono text-sm text-blue-300">{item.table}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell className="text-right font-mono text-gray-300">
                      {item.records > 0 ? formatNumber(item.records) : '-'}
                    </TableCell>
                    <TableCell>{getQualityBadge(item.dataQuality)}</TableCell>
                    <TableCell>{getPriorityBadge(item.priority)}</TableCell>
                    <TableCell className="text-sm text-gray-400">
                      {formatDate(item.lastUpdate)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 전략 및 로드맵 */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <FileText className="h-5 w-5 text-blue-400" />
            수집 전략 및 로드맵
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* 파이프라인 시각화 */}
            <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
              <h4 className="font-semibold mb-3 text-white">📈 데이터 처리 파이프라인</h4>
              <div className="flex items-center justify-between text-sm">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-800 rounded-full flex items-center justify-center mb-2">
                    <Database className="h-6 w-6 text-blue-300" />
                  </div>
                  <span className="text-gray-300">다양한 소스</span>
                </div>
                <div className="flex-1 h-0.5 bg-gray-600 mx-4"></div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-800 rounded-full flex items-center justify-center mb-2">
                    <TrendingUp className="h-6 w-6 text-green-300" />
                  </div>
                  <span className="text-gray-300">임시 수집</span>
                </div>
                <div className="flex-1 h-0.5 bg-gray-600 mx-4"></div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-800 rounded-full flex items-center justify-center mb-2">
                    <RefreshCw className="h-6 w-6 text-purple-300" />
                  </div>
                  <span className="text-gray-300">데이터 정제</span>
                </div>
                <div className="flex-1 h-0.5 bg-gray-600 mx-4"></div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-800 rounded-full flex items-center justify-center mb-2">
                    <CheckCircle className="h-6 w-6 text-orange-300" />
                  </div>
                  <span className="text-gray-300">통합 DB</span>
                </div>
              </div>
            </div>

            {/* 현재 단계 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-900 p-4 rounded-lg border border-green-700">
                <h4 className="font-semibold text-green-300 mb-2">✅ 현재 진행 중 (Phase 1)</h4>
                <ul className="text-sm text-green-200 space-y-1">
                  <li>• 경기도 배달업체 데이터 수집</li>
                  <li>• 실시간 모니터링 시스템</li>
                  <li>• 중복 방지 및 배치 추적</li>
                </ul>
              </div>
              
              <div className="bg-blue-900 p-4 rounded-lg border border-blue-700">
                <h4 className="font-semibold text-blue-300 mb-2">🔄 다음 단계 (Phase 2)</h4>
                <ul className="text-sm text-blue-200 space-y-1">
                  <li>• 서울시 데이터 수집 시작</li>
                  <li>• 데이터 정제 파이프라인</li>
                  <li>• 사업자등록번호 검증</li>
                </ul>
              </div>
            </div>

            {/* 전체 전략 문서 링크 */}
            <div className="bg-gray-700 p-4 rounded-lg border-2 border-dashed border-gray-600">
              <div className="text-center">
                <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <h4 className="font-semibold text-white mb-2">상세 전략 문서</h4>
                <p className="text-sm text-gray-300 mb-3">
                  전체 데이터 수집 전략, 기술 스택, 로드맵 등 상세 정보는 
                  별도 문서에서 확인하실 수 있습니다.
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    window.open('/docs/data-collection-status', '_blank')
                  }}
                  className="border-gray-600 text-gray-300 hover:bg-gray-600"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  전략 문서 보기
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 