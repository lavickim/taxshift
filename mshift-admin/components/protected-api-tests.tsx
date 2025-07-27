'use client';

import { CompaniesManagement } from '@/components/companies-management';
import { GeminiTest } from '@/components/gemini-test';
import { TransactionsAnalysis } from '@/components/transactions-analysis';

export function ProtectedApiTests() {
  return (
    <div className='mx-auto w-full max-w-4xl space-y-6 rounded-lg border bg-card p-6 shadow-sm'>
      <div className='space-y-4 text-center'>
        <h2 className='text-2xl font-bold'>🚀 API 테스트 도구</h2>
        <p className='text-muted-foreground'>
          시스템의 다양한 API 기능을 테스트할 수 있습니다.
        </p>
      </div>

      <div className='space-y-8'>
        <GeminiTest />
        <TransactionsAnalysis />
        <CompaniesManagement />
      </div>
    </div>
  );
}
