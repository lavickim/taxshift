'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Activity,
  Zap,
  Users,
  FileText,
  BarChart3
} from "lucide-react";

interface ProcessingStats {
  totalRules: number;
  activeRules: number;
  processingAccuracy: number;
  averageProcessingTime: number;
  dailyProcessedCount: number;
  conflictsDetected: number;
  weeklyTrend: {
    accuracy: number;
    processingTime: number;
    ruleCount: number;
    dailyCount: number;
  };
}

export function RegexPreprocessingDashboard() {
  const [stats, setStats] = useState<ProcessingStats>({
    totalRules: 247,
    activeRules: 231,
    processingAccuracy: 94.3,
    averageProcessingTime: 3.2,
    dailyProcessedCount: 1247,
    conflictsDetected: 3,
    weeklyTrend: {
      accuracy: 2.1,
      processingTime: -0.3,
      ruleCount: 12,
      dailyCount: 8
    }
  });

  const [recentActivity, setRecentActivity] = useState([
    {
      id: 1,
      time: "09:23",
      user: "김관리자",
      action: "편의점 규칙 수정",
      status: "success"
    },
    {
      id: 2,
      time: "09:15",
      user: "시스템",
      action: "새 패턴 5개 LLM 제안",
      status: "info"
    },
    {
      id: 3,
      time: "08:44",
      user: "이개발자",
      action: "카페 테스트 완료",
      status: "success"
    },
    {
      id: 4,
      time: "08:30",
      user: "시스템",
      action: "주간 성능 리포트 생성",
      status: "info"
    }
  ]);

  return (
    <div className="space-y-6">
      {/* 성능 그래프 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 성공률 추이 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              처리 통계 (최근 7일)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">성공률 추이</span>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  95.2%
                </Badge>
              </div>
              <div className="h-32 bg-muted/20 rounded-lg flex items-end justify-center p-4">
                <div className="flex items-end space-x-1 h-full">
                  {[90, 91, 93, 94, 95, 94, 95].map((value, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div 
                        className="bg-blue-500 rounded-t w-6 min-h-[4px]"
                        style={{ height: `${(value - 85) * 4}px` }}
                      />
                      <span className="text-xs text-muted-foreground mt-1">
                        {['월', '화', '수', '목', '금', '토', '일'][index]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">평균</span>
                  <div className="font-semibold">93.4%</div>
                </div>
                <div>
                  <span className="text-muted-foreground">최고</span>
                  <div className="font-semibold">95.2%</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 응답 시간 분포 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              응답 시간 분포
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">&lt; 1ms</span>
                  <span className="text-sm font-medium">45%</span>
                </div>
                <Progress value={45} className="h-2" />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">1-3ms</span>
                  <span className="text-sm font-medium">38%</span>
                </div>
                <Progress value={38} className="h-2" />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">3-5ms</span>
                  <span className="text-sm font-medium">12%</span>
                </div>
                <Progress value={12} className="h-2" />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">&gt; 5ms</span>
                  <span className="text-sm font-medium">5%</span>
                </div>
                <Progress value={5} className="h-2" />
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">평균 응답 시간</span>
                  <span className="font-semibold">2.8ms</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 시스템 활동 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 최근 활동 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              최근 활동
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {activity.status === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {activity.time} - {activity.user}: {activity.action}
                    </p>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full">
                모든 활동 보기
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 규칙 카테고리별 현황 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              카테고리별 규칙 현황
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: '법인구조', count: 45, active: 42, color: 'bg-blue-500' },
                { name: '주유소', count: 38, active: 35, color: 'bg-green-500' },
                { name: '대형마트', count: 52, active: 48, color: 'bg-purple-500' },
                { name: '해외서비스', count: 28, active: 26, color: 'bg-orange-500' },
                { name: '공공기관', count: 34, active: 32, color: 'bg-cyan-500' },
                { name: '기타', count: 50, active: 48, color: 'bg-gray-500' }
              ].map((category) => (
                <div key={category.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${category.color}`} />
                    <span className="text-sm font-medium">{category.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {category.active}/{category.count}
                    </Badge>
                    {category.active === category.count ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 빠른 액션 */}
      <Card>
        <CardHeader>
          <CardTitle>빠른 액션</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              새 규칙 추가
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              대량 테스트
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              패턴 최적화
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              성능 분석
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              LLM 패턴 생성
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}