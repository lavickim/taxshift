'use client';

import { useState } from 'react';

// 기본 샘플 데이터
const DEFAULT_SAMPLE = `박광업 (대림카센터)
41가3000도공
세븐일레븐 충주기업
지에스25 이천하이
*주)동서 / 카페카주2호
지에스25이천하이닉스협력관점
회사 도메인 연장
주식회사애드컴
(주)부자 충주(상)주
체크입금
DNH*GODADDY#32131232131123 TEMPE
건강보험
김용훈
구글페이먼트코리아`;

export function TransactionsAnalysis() {
  const [transactions, setTransactions] = useState(DEFAULT_SAMPLE);
  const [normalizedResults, setNormalizedResults] = useState('');
  const [analysisResults, setAnalysisResults] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!transactions.trim()) {
      alert('거래 내역을 입력해주세요!');
      return;
    }

    setLoading(true);
    setNormalizedResults('');
    setAnalysisResults('');

    try {
      // 입력된 텍스트를 라인별로 분리하여 배열로 만들기
      const transactionArray = transactions
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      if (transactionArray.length === 0) {
        alert('유효한 거래 내역이 없습니다!');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/transactions-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactions: transactionArray }),
      });

      const data = await res.json();

      if (res.status === 401) {
        const authErrorMessage = '인증이 필요합니다. 다시 로그인해주세요.';
        setNormalizedResults(authErrorMessage);
        setAnalysisResults(authErrorMessage);
        return;
      }

      if (res.status === 403) {
        const accessErrorMessage = `접근 권한이 없습니다: ${data.message || data.error}`;
        setNormalizedResults(accessErrorMessage);
        setAnalysisResults(accessErrorMessage);
        return;
      }

      if (data.success) {
        setNormalizedResults(
          JSON.stringify(data.normalization_results, null, 2)
        );
        setAnalysisResults(JSON.stringify(data.analysis_results, null, 2));
      } else {
        const errorMessage = `Error: ${data.error}\n${data.details || ''}`;
        setNormalizedResults(errorMessage);
        setAnalysisResults(errorMessage);
      }
    } catch (error) {
      const errorMessage = `Network Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setNormalizedResults(errorMessage);
      setAnalysisResults(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTransactions(DEFAULT_SAMPLE);
    setNormalizedResults('');
    setAnalysisResults('');
  };

  return (
    <div className='mx-auto w-full max-w-6xl rounded-lg border bg-card p-6 shadow-sm'>
      <h2 className='mb-6 text-center text-2xl font-bold'>
        거래 내역 분석 (룰베이스 구축)
      </h2>

      <div className='space-y-6'>
        {/* 입력 섹션 */}
        <div className='space-y-4'>
          <div>
            <label
              htmlFor='transactions'
              className='mb-2 block text-sm font-medium'
            >
              거래 내역 입력 (한 줄에 하나씩):
            </label>
            <textarea
              id='transactions'
              value={transactions}
              onChange={e => setTransactions(e.target.value)}
              placeholder='거래 내역을 한 줄에 하나씩 입력하세요...'
              className='h-32 w-full resize-none rounded-md border border-border p-3 font-mono text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring'
            />
            <p className='mt-1 text-xs text-muted-foreground'>
              총{' '}
              {
                transactions.split('\n').filter(line => line.trim().length > 0)
                  .length
              }
              개 거래 내역
            </p>
          </div>

          <div className='flex gap-2'>
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className='flex-1 rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50'
            >
              {loading ? '분석 중...' : '2단계 분석 시작'}
            </button>
            <button
              onClick={handleReset}
              disabled={loading}
              className='rounded-md border border-border px-4 py-2 transition-colors hover:bg-muted/50'
            >
              리셋
            </button>
          </div>
        </div>

        {/* 결과 섹션 - 2단계로 나누어 표시 */}
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
          {/* 1단계: 정규화 결과 */}
          <div className='space-y-4'>
            <div>
              <label
                htmlFor='normalized-results'
                className='mb-2 block text-sm font-medium'
              >
                🔧 1단계: 정규화 결과 (Gemini 1.5 Flash):
              </label>
              <textarea
                id='normalized-results'
                value={normalizedResults}
                readOnly
                placeholder='여기에 정규화 결과가 표시됩니다...'
                className='h-80 w-full resize-none rounded-md border border-border bg-blue-50/50 p-3 font-mono text-xs focus:outline-none'
              />
            </div>

            {normalizedResults && (
              <div className='text-xs text-muted-foreground'>
                <p>🔧 정규화된 데이터에는 다음 정보가 포함됩니다:</p>
                <ul className='ml-2 mt-1 list-inside list-disc space-y-1'>
                  <li>original_text: 원본 거래 내역</li>
                  <li>normalized_entity_name: 정규화된 거래처명</li>
                  <li>entity_category: 업종 분류</li>
                  <li>location: 위치 정보</li>
                  <li>unique_key: 고유 키</li>
                </ul>
              </div>
            )}
          </div>

          {/* 2단계: 룰베이스 분석 결과 */}
          <div className='space-y-4'>
            <div>
              <label
                htmlFor='analysis-results'
                className='mb-2 block text-sm font-medium'
              >
                🚀 2단계: 룰베이스 분석 결과 (Gemini 2.0 Flash):
              </label>
              <textarea
                id='analysis-results'
                value={analysisResults}
                readOnly
                placeholder='여기에 룰베이스 분석 결과가 표시됩니다...'
                className='h-80 w-full resize-none rounded-md border border-border bg-green-50/50 p-3 font-mono text-xs focus:outline-none'
              />
            </div>

            {analysisResults && (
              <div className='text-xs text-muted-foreground'>
                <p>🚀 분석된 데이터에는 다음 정보가 포함됩니다:</p>
                <ul className='ml-2 mt-1 list-inside list-disc space-y-1'>
                  <li>entity_name: 거래처 명</li>
                  <li>confidence_score: 신뢰도 점수</li>
                  <li>is_ambiguous: 모호성 여부</li>
                  <li>user_question: 사용자 질문 (옵션 포함)</li>
                  <li>suggested_tag: 제안 태그</li>
                  <li>debit_account: 차변 계정</li>
                  <li>reasoning: 분석 근거</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
