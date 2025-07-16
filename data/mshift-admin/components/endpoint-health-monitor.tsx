'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Activity } from 'lucide-react';

interface EndpointResult {
  name: string;
  path: string;
  method: string;
  status: number;
  responseTime: number;
  healthy: boolean;
  critical: boolean;
  error?: string;
}

interface HealthSummary {
  overallHealth: boolean;
  criticalFailures: number;
  totalEndpoints: number;
  healthyEndpoints: number;
  timestamp: string;
  results: EndpointResult[];
}

export default function EndpointHealthMonitor() {
  const [healthData, setHealthData] = useState<HealthSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchHealthData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/health/endpoints');
      const data = await response.json();
      
      setHealthData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch health data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(fetchHealthData, 30000); // 30초마다 갱신
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getStatusIcon = (healthy: boolean, critical: boolean) => {
    if (healthy) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (critical) return <XCircle className="w-4 h-4 text-red-600" />;
    return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
  };

  const getStatusColor = (healthy: boolean, critical: boolean) => {
    if (healthy) return 'bg-green-100 text-green-800';
    if (critical) return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const getResponseTimeColor = (responseTime: number) => {
    if (responseTime < 100) return 'text-green-600';
    if (responseTime < 500) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              API 엔드포인트 헬스체크
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={autoRefresh ? 'bg-blue-50' : ''}
              >
                {autoRefresh ? 'Auto ON' : 'Auto OFF'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchHealthData}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                새로고침
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {healthData && (
            <div className="space-y-4">
              {/* 전체 상태 요약 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${healthData.overallHealth ? 'text-green-600' : 'text-red-600'}`}>
                    {healthData.overallHealth ? '✅' : '❌'}
                  </div>
                  <p className="text-sm text-gray-600">전체 상태</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {healthData.healthyEndpoints}/{healthData.totalEndpoints}
                  </div>
                  <p className="text-sm text-gray-600">정상 엔드포인트</p>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${healthData.criticalFailures > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {healthData.criticalFailures}
                  </div>
                  <p className="text-sm text-gray-600">중요 장애</p>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600">
                    {new Date(healthData.timestamp).toLocaleString('ko-KR')}
                  </div>
                  <p className="text-xs text-gray-500">마지막 확인</p>
                </div>
              </div>

              {/* 엔드포인트별 상세 상태 */}
              <div className="space-y-2">
                <h4 className="font-semibold">엔드포인트별 상태</h4>
                <div className="space-y-2">
                  {healthData.results.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(result.healthy, result.critical)}
                        <div>
                          <div className="font-medium">{result.name}</div>
                          <div className="text-sm text-gray-600">
                            {result.method} {result.path}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getStatusColor(result.healthy, result.critical)}>
                          {result.status || 'Error'}
                        </Badge>
                        {result.responseTime > 0 && (
                          <span className={`text-sm ${getResponseTimeColor(result.responseTime)}`}>
                            {result.responseTime}ms
                          </span>
                        )}
                        {result.critical && (
                          <Badge variant="destructive" className="text-xs">
                            중요
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 장애 엔드포인트 세부 정보 */}
              {healthData.results.some(r => !r.healthy) && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-red-600">장애 엔드포인트</h4>
                  <div className="space-y-2">
                    {healthData.results
                      .filter(r => !r.healthy)
                      .map((result, index) => (
                        <Alert key={index} className="border-red-200">
                          <XCircle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>{result.name}</strong>: {result.error || `HTTP ${result.status}`}
                            <br />
                            <span className="text-sm text-gray-600">{result.method} {result.path}</span>
                          </AlertDescription>
                        </Alert>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}