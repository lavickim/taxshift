import { LLMManagement } from '@/components/llm-management';

export default function LlmPage() {
  return (
    <div className='container mx-auto p-6'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold text-gray-800'>LLM 규칙 엔진 관리</h1>
        <p className='mt-2 text-gray-600'>
          AI 기반 규칙 학습, 하이브리드 처리, 그리고 LLM 추론 기능을 관리합니다.
        </p>
      </div>
      <LLMManagement />
    </div>
  );
}
