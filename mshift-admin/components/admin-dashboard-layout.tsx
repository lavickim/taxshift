'use client';

import { useState } from 'react';
import { ThemeSwitcher } from "@/components/theme-switcher";
import { AdminTestDashboard } from "@/components/admin-test-dashboard";

import { DataAnalysisContent } from "@/components/data-analysis-content";
import { CombinedRulesManagement } from "@/components/combined-rules-management";
import { LLMManagement } from "@/components/llm-management";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Rocket, Cpu, BarChart3, Settings, Sparkles } from "lucide-react";

export function AdminDashboardLayout() {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <main className="min-h-screen flex flex-col bg-background">
      {/* 상단 네비게이션 */}
      <nav className="w-full border-b border-b-foreground/10 h-16 bg-card">
        <div className="w-full flex justify-between items-center p-3 px-5 text-sm h-full">
          <div className="flex gap-5 items-center font-semibold">
            <Link href={"/"} className="text-xl font-bold text-primary">
              🚀 MoneyShift AI - 관리자 대시보드
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
          </div>
        </div>
      </nav>
      
      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 flex">
        {/* 사이드바 */}
        <aside className="w-64 bg-muted/30 border-r border-border p-4">
          <nav className="space-y-2">
            <Button
              variant={activeTab === "home" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("home")}
            >
              <Rocket className="mr-2 h-4 w-4" />
              홈 대시보드
            </Button>
            <Button
              variant={activeTab === "data-analysis" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("data-analysis")}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              데이터 분석
            </Button>

            <Button
              variant={activeTab === "rules" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("rules")}
            >
              <Cpu className="mr-2 h-4 w-4" />
              규칙 관리
            </Button>
            <Button
              variant={activeTab === "llm" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("llm")}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              LLM 관리
            </Button>
            <Button
              variant={activeTab === "admin-test" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("admin-test")}
            >
              <Settings className="mr-2 h-4 w-4" />
              관리자 테스트
            </Button>
          </nav>
        </aside>

        {/* 메인 콘텐츠 */}
        <main className="flex-1 p-6">
          {activeTab === "home" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold">MoneyShift AI 관리자 대시보드</h1>
                <p className="text-muted-foreground mt-2">
                  데이터 분석, 관리를 위한 통합 관리 시스템
                </p>
              </div>
              
              {/* 상태 카드들 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">데이터 분석</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">준비</div>
                    <Badge variant="secondary" className="mt-2">
                      <Clock className="mr-1 h-3 w-3" />
                      대기 중
                    </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">규칙 엔진</CardTitle>
                    <Cpu className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">활성</div>
                    <Badge variant="secondary" className="mt-2">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      정상 운영
                    </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">시스템 상태</CardTitle>
                    <Settings className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">정상</div>
                    <Badge variant="secondary" className="mt-2">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      모든 서비스 정상
                    </Badge>
                  </CardContent>
                </Card>
              </div>

              {/* 최근 활동 */}
              <Card>
                <CardHeader>
                  <CardTitle>최근 활동</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Docker PostgreSQL 연결 완료
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          데이터베이스가 성공적으로 연결되었습니다.
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-sm text-gray-500">
                        방금 전
                      </div>
                    </div>
                    
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {activeTab === "data-analysis" && <DataAnalysisContent />}

          {activeTab === "rules" && <CombinedRulesManagement />}
          
          {activeTab === "llm" && <LLMManagement />}
          
          {activeTab === "admin-test" && <AdminTestDashboard />}
        </main>
      </div>
    </main>
  );
} 