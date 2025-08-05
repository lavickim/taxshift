'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Receipt, 
  TrendingUp, 
  Download, 
  Eye, 
  UserCheck,
  Camera,
  PieChart,
  BarChart3,
  Calendar,
  MapPin,
  CreditCard
} from 'lucide-react';

interface TrojanStats {
  totalUsers: number;
  activeUsers: number;
  totalReceipts: number;
  totalTransactions: number;
  avgReceiptsPerUser: number;
  ocrAccuracy: number;
  premiumUsers: number;
  dataExports: number;
}

interface UserData {
  id: string;
  email: string;
  name: string;
  totalReceipts: number;
  totalTransactions: number;
  isPremium: boolean;
  dataCollectionConsent: boolean;
  createdAt: string;
  lastActiveAt: string;
}

interface ReceiptData {
  id: string;
  userId: string;
  merchantName: string;
  totalAmount: number;
  category: string;
  ocrConfidence: number;
  processingStatus: string;
  createdAt: string;
}

export default function TrojanHorseManagement() {
  const [stats, setStats] = useState<TrojanStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalReceipts: 0,
    totalTransactions: 0,
    avgReceiptsPerUser: 0,
    ocrAccuracy: 0,
    premiumUsers: 0,
    dataExports: 0,
  });

  const [users, setUsers] = useState<UserData[]>([]);
  const [receipts, setReceipts] = useState<ReceiptData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState('last7days');

  useEffect(() => {
    fetchTrojanStats();
    fetchUserData();
    fetchReceiptData();
  }, [selectedDateRange]);

  const fetchTrojanStats = async () => {
    try {
      setLoading(true);
      // Simulate API call - replace with actual endpoint
      const mockStats: TrojanStats = {
        totalUsers: 1247,
        activeUsers: 823,
        totalReceipts: 15439,
        totalTransactions: 18756,
        avgReceiptsPerUser: 12.4,
        ocrAccuracy: 94.2,
        premiumUsers: 187,
        dataExports: 145,
      };
      setStats(mockStats);
    } catch (error) {
      console.error('Failed to fetch trojan stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      // Simulate API call - replace with actual endpoint
      const mockUsers: UserData[] = [
        {
          id: '1',
          email: 'user1@example.com',
          name: '김철수',
          totalReceipts: 45,
          totalTransactions: 52,
          isPremium: true,
          dataCollectionConsent: true,
          createdAt: '2024-07-15T10:30:00Z',
          lastActiveAt: '2024-08-05T14:22:00Z',
        },
        {
          id: '2',
          email: 'user2@example.com',
          name: '이영희',
          totalReceipts: 23,
          totalTransactions: 31,
          isPremium: false,
          dataCollectionConsent: true,
          createdAt: '2024-07-20T09:15:00Z',
          lastActiveAt: '2024-08-04T16:45:00Z',
        },
        {
          id: '3',
          email: 'user3@example.com',
          name: '박민수',
          totalReceipts: 67,
          totalTransactions: 89,
          isPremium: true,
          dataCollectionConsent: false,
          createdAt: '2024-06-30T11:20:00Z',
          lastActiveAt: '2024-08-05T12:10:00Z',
        },
      ];
      setUsers(mockUsers);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  const fetchReceiptData = async () => {
    try {
      // Simulate API call - replace with actual endpoint
      const mockReceipts: ReceiptData[] = [
        {
          id: '1',
          userId: '1',
          merchantName: '스타벅스 강남점',
          totalAmount: 17710,
          category: '카페/음료',
          ocrConfidence: 0.96,
          processingStatus: 'COMPLETED',
          createdAt: '2024-08-05T14:22:00Z',
        },
        {
          id: '2',
          userId: '2',
          merchantName: '김밥천국 역삼점',
          totalAmount: 18000,
          category: '음식점',
          ocrConfidence: 0.91,
          processingStatus: 'COMPLETED',
          createdAt: '2024-08-05T12:15:00Z',
        },
        {
          id: '3',
          userId: '3',
          merchantName: 'SK에너지 강남주유소',
          totalAmount: 53190,
          category: '교통',
          ocrConfidence: 0.98,
          processingStatus: 'COMPLETED',
          createdAt: '2024-08-05T16:45:00Z',
        },
      ];
      setReceipts(mockReceipts);
    } catch (error) {
      console.error('Failed to fetch receipt data:', error);
    }
  };

  const exportDataForMoneyShift = async () => {
    try {
      setLoading(true);
      // This would export anonymized transaction data for MoneyShift analysis
      // Only users who consented to data collection
      const consentedUsers = users.filter(user => user.dataCollectionConsent);
      
      alert(`데이터 내보내기 시작: ${consentedUsers.length}명의 동의한 사용자 데이터를 MoneyShift 분석용으로 내보냅니다.`);
      
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert('데이터 내보내기 완료! MoneyShift 거래 분류 엔진 학습 데이터가 업데이트되었습니다.');
    } catch (error) {
      console.error('Failed to export data:', error);
      alert('데이터 내보내기 실패');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">🎯 Trojan Horse 데이터 수집</h1>
          <p className="text-gray-600 mt-2">
            가계부 앱을 통한 실제 거래 데이터 수집 및 분석 대시보드
          </p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedDateRange}
            onChange={(e) => setSelectedDateRange(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="last7days">최근 7일</option>
            <option value="last30days">최근 30일</option>
            <option value="last90days">최근 90일</option>
          </select>
          <Button 
            onClick={exportDataForMoneyShift}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Download className="w-4 h-4 mr-2" />
            MoneyShift 데이터 내보내기
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">총 사용자</p>
              <p className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</p>
              <p className="text-xs text-green-600">활성 사용자: {stats.activeUsers}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Receipt className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">수집된 영수증</p>
              <p className="text-2xl font-bold">{stats.totalReceipts.toLocaleString()}</p>
              <p className="text-xs text-blue-600">평균 {stats.avgReceiptsPerUser}개/사용자</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Camera className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">OCR 정확도</p>
              <p className="text-2xl font-bold">{stats.ocrAccuracy}%</p>
              <p className="text-xs text-green-600">매우 높음</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <TrendingUp className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">프리미엄 사용자</p>
              <p className="text-2xl font-bold">{stats.premiumUsers}</p>
              <p className="text-xs text-purple-600">전환율: {((stats.premiumUsers / stats.totalUsers) * 100).toFixed(1)}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">사용자 관리</TabsTrigger>
          <TabsTrigger value="receipts">영수증 데이터</TabsTrigger>
          <TabsTrigger value="analytics">데이터 분석</TabsTrigger>
          <TabsTrigger value="export">데이터 내보내기</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                사용자 목록
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">사용자</th>
                      <th className="text-left p-2">영수증</th>
                      <th className="text-left p-2">거래</th>
                      <th className="text-left p-2">구독</th>
                      <th className="text-left p-2">데이터 동의</th>
                      <th className="text-left p-2">마지막 활동</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </td>
                        <td className="p-2">
                          <Badge variant="outline">{user.totalReceipts}</Badge>
                        </td>
                        <td className="p-2">
                          <Badge variant="outline">{user.totalTransactions}</Badge>
                        </td>
                        <td className="p-2">
                          <Badge variant={user.isPremium ? "default" : "secondary"}>
                            {user.isPremium ? "프리미엄" : "무료"}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <Badge variant={user.dataCollectionConsent ? "default" : "destructive"}>
                            {user.dataCollectionConsent ? "동의" : "비동의"}
                          </Badge>
                        </td>
                        <td className="p-2 text-sm text-gray-500">
                          {formatDate(user.lastActiveAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receipts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Receipt className="w-5 h-5 mr-2" />
                최근 영수증 데이터
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">가맹점</th>
                      <th className="text-left p-2">금액</th>
                      <th className="text-left p-2">카테고리</th>
                      <th className="text-left p-2">OCR 신뢰도</th>
                      <th className="text-left p-2">처리 상태</th>
                      <th className="text-left p-2">수집 시간</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receipts.map((receipt) => (
                      <tr key={receipt.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{receipt.merchantName}</td>
                        <td className="p-2">{formatCurrency(receipt.totalAmount)}</td>
                        <td className="p-2">
                          <Badge variant="outline">{receipt.category}</Badge>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center">
                            <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full" 
                                style={{ width: `${receipt.ocrConfidence * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm">{(receipt.ocrConfidence * 100).toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="p-2">
                          <Badge variant="default">
                            {receipt.processingStatus}
                          </Badge>
                        </td>
                        <td className="p-2 text-sm text-gray-500">
                          {formatDate(receipt.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="w-5 h-5 mr-2" />
                  카테고리별 데이터 분포
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { category: '음식점', percentage: 35, color: 'bg-blue-500' },
                    { category: '카페/음료', percentage: 20, color: 'bg-green-500' },
                    { category: '편의점', percentage: 15, color: 'bg-yellow-500' },
                    { category: '쇼핑', percentage: 12, color: 'bg-purple-500' },
                    { category: '교통', percentage: 10, color: 'bg-red-500' },
                    { category: '기타', percentage: 8, color: 'bg-gray-500' },
                  ].map((item) => (
                    <div key={item.category} className="flex items-center">
                      <div className="w-20 text-sm">{item.category}</div>
                      <div className="flex-1 mx-3">
                        <div className="bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${item.color}`}
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="w-12 text-sm text-right">{item.percentage}%</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  데이터 품질 지표
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>OCR 정확도</span>
                      <span>94.2%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '94.2%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>데이터 완성도</span>
                      <span>87.6%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '87.6%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>중복 제거율</span>
                      <span>99.1%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '99.1%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>자동 분류 정확도</span>
                      <span>91.8%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-600 h-2 rounded-full" style={{ width: '91.8%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Alert>
            <Eye className="h-4 w-4" />
            <AlertDescription>
              <strong>개인정보 보호:</strong> 모든 데이터는 사용자 동의하에 수집되며, 
              MoneyShift 분석용으로 내보낼 때는 개인 식별 정보가 완전히 제거됩니다.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Download className="w-5 h-5 mr-2" />
                MoneyShift 학습 데이터 내보내기
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <UserCheck className="h-4 w-4" />
                <AlertDescription>
                  데이터 수집에 동의한 사용자: <strong>{users.filter(u => u.dataCollectionConsent).length}명</strong> / 
                  전체 {users.length}명 (동의율: {((users.filter(u => u.dataCollectionConsent).length / users.length) * 100).toFixed(1)}%)
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>내보내기 형식</Label>
                  <select className="w-full p-2 border rounded-md">
                    <option value="anonymized_json">익명화된 JSON</option>
                    <option value="training_csv">학습용 CSV</option>
                    <option value="pattern_analysis">패턴 분석 데이터</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label>데이터 범위</Label>
                  <select className="w-full p-2 border rounded-md">
                    <option value="last30days">최근 30일</option>
                    <option value="last90days">최근 90일</option>
                    <option value="all">전체 기간</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>포함할 데이터 유형</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'receipts', label: '영수증 OCR 데이터', checked: true },
                    { id: 'transactions', label: '거래 분류 데이터', checked: true },
                    { id: 'categories', label: '카테고리 매핑', checked: true },
                    { id: 'patterns', label: '소비 패턴 데이터', checked: false },
                  ].map((item) => (
                    <label key={item.id} className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        defaultChecked={item.checked}
                        className="rounded"
                      />
                      <span className="text-sm">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button 
                  onClick={exportDataForMoneyShift}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? (
                    <>처리 중...</>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      MoneyShift 학습 데이터 내보내기
                    </>
                  )}
                </Button>
              </div>

              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium mb-2">내보내기 통계</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>예상 레코드 수: <strong>12,447개</strong></div>
                  <div>파일 크기: <strong>~2.1MB</strong></div>
                  <div>처리 시간: <strong>~30초</strong></div>
                  <div>마지막 내보내기: <strong>2024-08-04</strong></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}