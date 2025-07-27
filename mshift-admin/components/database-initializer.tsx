'use client';

import { useEffect, useState } from 'react';

export function DatabaseInitializer({
  children,
}: {
  children: React.ReactNode;
}) {
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
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <div className='mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600'></div>
          <p className='text-sm text-gray-600'>Initializing database...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='max-w-md p-6 text-center'>
          <div className='mb-4 text-red-500'>⚠️</div>
          <h2 className='mb-2 text-lg font-semibold'>
            Database Connection Error
          </h2>
          <p className='mb-4 text-sm text-gray-600'>{error}</p>
          <p className='text-xs text-gray-500'>
            Check your database configuration and try refreshing the page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
