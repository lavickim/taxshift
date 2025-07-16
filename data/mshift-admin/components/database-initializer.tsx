'use client';

import { useEffect, useState } from 'react';

export function DatabaseInitializer({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initDB() {
      try {
        // 데이터베이스 초기화 API 호출
        const response = await fetch('/api/db/init', {
          method: 'POST',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Database initialization failed');
        }

        setIsInitialized(true);
      } catch (err) {
        console.error('Database initialization error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsInitialized(true); // 에러가 있어도 앱은 실행
      }
    }

    initDB();
  }, []);

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Initializing database...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 max-w-md">
          <div className="text-red-500 mb-4">⚠️</div>
          <h2 className="text-lg font-semibold mb-2">Database Connection Error</h2>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <p className="text-xs text-gray-500">
            Check your database configuration and try refreshing the page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 