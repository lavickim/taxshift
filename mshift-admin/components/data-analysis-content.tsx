'use client';

import { useEffect, useState } from 'react';

import { DataCollectionStatusDashboard } from './data-collection-status-dashboard';
import { FranchiseBrandsAnalysis } from './franchise-brands-analysis';
import { GyeonggiDataAnalysis } from './gyeonggi-data-analysis';
import { GyeonggiDeliveryAnalysis } from './gyeonggi-delivery-analysis';
import { NationalPensionAnalysis } from './national-pension-analysis';
import { SegmentedKeywordAnalysis } from './segmented-keyword-analysis';
import { SeoulRestaurantsAnalysis } from './seoul-restaurants-analysis';

export function DataAnalysisContent() {
  const [activeTab, setActiveTab] = useState('data-collection-status');

  const tabs = [
    {
      id: 'data-collection-status',
      name: '📊 데이터 수집 현황',
      count: '95% 목표',
      icon: (
        <svg
          className='h-4 w-4'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
          />
        </svg>
      ),
    },
    {
      id: 'gyeonggi-delivery',
      name: '경기 데이터드림',
      icon: (
        <svg
          className='h-4 w-4'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
          />
        </svg>
      ),
    },
    {
      id: 'gyeonggi-delivery-stores',
      name: '경기도 배달특급',
      count: '30K',
      icon: (
        <svg
          className='h-4 w-4'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
          />
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.707 2.707a1 1 0 001.414 1.414L8 15m0 0l7-7'
          />
        </svg>
      ),
    },
    {
      id: 'seoul-restaurants',
      name: '서울시 음식점',
      count: '10K',
      icon: (
        <svg
          className='h-4 w-4'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
          />
        </svg>
      ),
    },
    {
      id: 'franchise-brands',
      name: '프랜차이즈 브랜드',
      count: '11K',
      icon: (
        <svg
          className='h-4 w-4'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'
          />
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
          />
        </svg>
      ),
    },
    {
      id: 'national-pension',
      name: '국민연금 사업장',
      count: '542K',
      icon: (
        <svg
          className='h-4 w-4'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
          />
        </svg>
      ),
    },
    {
      id: 'segmented-keywords',
      name: '세그먼트 키워드',
      count: '4.3K',
      icon: (
        <svg
          className='h-4 w-4'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
          />
          <circle cx='8' cy='8' r='2' />
          <circle cx='16' cy='16' r='2' />
          <circle cx='12' cy='12' r='1' />
        </svg>
      ),
    },
  ];

  return (
    <div className='w-full space-y-6'>
      {/* 탭 네비게이션 */}
      <div className='border-b border-gray-200'>
        <nav className='-mb-px flex space-x-8 overflow-x-auto'>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-1 py-2 text-sm font-medium ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              } `}
            >
              {tab.icon}
              {tab.name}
              {tab.count && (
                <span className='ml-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800'>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* 탭 컨텐츠 */}
      <div className='min-h-[500px]'>
        {activeTab === 'data-collection-status' && <DataCollectionStatusDashboard />}
        {activeTab === 'gyeonggi-delivery' && <GyeonggiDataAnalysis />}
        {activeTab === 'gyeonggi-delivery-stores' && (
          <GyeonggiDeliveryAnalysis />
        )}
        {activeTab === 'seoul-restaurants' && <SeoulRestaurantsAnalysis />}
        {activeTab === 'franchise-brands' && <FranchiseBrandsAnalysis />}
        {activeTab === 'national-pension' && <NationalPensionAnalysis />}
        {activeTab === 'segmented-keywords' && <SegmentedKeywordAnalysis />}
      </div>
    </div>
  );
}
