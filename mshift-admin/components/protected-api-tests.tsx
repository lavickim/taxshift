"use client";

import { GeminiTest } from "@/components/gemini-test";
import { TransactionsAnalysis } from "@/components/transactions-analysis";
import { CompaniesManagement } from "@/components/companies-management";

export function ProtectedApiTests() {
  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-card border rounded-lg shadow-sm space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">🚀 API 테스트 도구</h2>
        <p className="text-muted-foreground">
          시스템의 다양한 API 기능을 테스트할 수 있습니다.
        </p>
      </div>

      <div className="space-y-8">
        <GeminiTest />
        <TransactionsAnalysis />
        <CompaniesManagement />
      </div>
    </div>
  );
} 