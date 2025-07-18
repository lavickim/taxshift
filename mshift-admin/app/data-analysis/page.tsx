import { DataAnalysisContent } from '@/components/data-analysis-content'

export default function DataAnalysisPage() {
  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v5h5" />
            <path d="M3 8a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 4" />
            <path d="M21 21v-5h-5" />
            <path d="M21 16a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 20" />
          </svg>
          <span className="font-medium">데이터 분석 대시보드</span>
        </div>
      </div>

      <div className="animate-in flex-1 flex flex-col gap-6 max-w-7xl w-full">
        <DataAnalysisContent />
      </div>
    </div>
  )
} 