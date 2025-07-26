'use client';

import { useState } from 'react';
import { ThemeSwitcher } from "@/components/theme-switcher";

import { DataAnalysisContent } from "@/components/data-analysis-content";
import { LLMManagement } from "@/components/llm-management";
import TagMappingManagement from "@/components/tag-mapping-management";
import { TestAndRuleExpansion } from "@/components/test-and-rule-expansion";
import { AccountingEngineManagement } from "@/components/accounting-engine-management";
import { RegexPreprocessingManagement } from "@/components/regex-preprocessing-management";
import { IntegratedTransactionTest } from "@/components/integrated-transaction-test";
import { RealTimeSystemDashboard } from "@/components/real-time-system-dashboard";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Rocket, BarChart3, Sparkles, Hash, Calculator, Regex, Zap, Activity, TrendingUp, AlertCircle, Cpu, Database, Gauge } from "lucide-react";

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
              대시보드
            </Button>
            <Button
              variant={activeTab === "data-analysis" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("data-analysis")}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              수집 데이터 현황
            </Button>

            <Button
              variant={activeTab === "regex-preprocessing" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("regex-preprocessing")}
            >
              <Regex className="mr-2 h-4 w-4" />
              정규식전처리엔진
            </Button>
            <Button
              variant={activeTab === "keyword-rules" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("keyword-rules")}
            >
              <Hash className="mr-2 h-4 w-4" />
              키워드처리엔진
            </Button>
            <Button
              variant={activeTab === "accounting-engine" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("accounting-engine")}
            >
              <Calculator className="mr-2 h-4 w-4" />
              복식부기엔진
            </Button>
            <Button
              variant={activeTab === "test-and-rule-expansion" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("test-and-rule-expansion")}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              테스트/엔진데이터 확장
            </Button>
            <Button
              variant={activeTab === "integrated-test" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("integrated-test")}
            >
              <Zap className="mr-2 h-4 w-4" />
              통합 처리 테스트
            </Button>
            <Button
              variant={activeTab === "llm" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("llm")}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              LLM 관리
            </Button>
          </nav>
        </aside>

        {/* 메인 콘텐츠 */}
        <main className="flex-1 p-6">
          {activeTab === "home" && <RealTimeSystemDashboard />}
          
          {activeTab === "data-analysis" && <DataAnalysisContent />}

          {activeTab === "keyword-rules" && <TagMappingManagement />}
          
          {activeTab === "regex-preprocessing" && <RegexPreprocessingManagement />}
          
          {activeTab === "integrated-test" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold">통합 거래 처리 테스트</h1>
                <p className="text-muted-foreground mt-2">
                  정규식 전처리 + 키워드 추출 통합 파이프라인 성능 테스트
                </p>
              </div>
              <IntegratedTransactionTest />
            </div>
          )}
          
          {activeTab === "test-and-rule-expansion" && <TestAndRuleExpansion />}
          
          {activeTab === "llm" && <LLMManagement />}
          
          {activeTab === "accounting-engine" && <AccountingEngineManagement />}
        </main>
      </div>
    </main>
  );
} 