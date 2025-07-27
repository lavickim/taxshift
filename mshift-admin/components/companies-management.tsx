'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Company {
  id: string;
  companyName: string;
  businessRegistrationNumber: string | null;
  taxpayerType: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    transactions: number;
    rules: number;
    ruleCandidates: number;
  };
}

export function CompaniesManagement() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    businessRegistrationNumber: '',
    taxpayerType: 'CORPORATION',
  });

  // 회사 목록 조회
  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/companies');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch companies');
      }

      setCompanies(data.companies);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // 새 회사 생성
  const createCompany = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create company');
      }

      // 성공 시 목록 새로고침 및 폼 초기화
      await fetchCompanies();
      setFormData({
        companyName: '',
        businessRegistrationNumber: '',
        taxpayerType: 'CORPORATION',
      });
      setShowCreateForm(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  if (loading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600'></div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-bold'>회사 관리</h2>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? '취소' : '새 회사 추가'}
        </Button>
      </div>

      {error && (
        <div className='rounded border border-red-200 bg-red-50 p-4'>
          <p className='text-red-600'>{error}</p>
        </div>
      )}

      {showCreateForm && (
        <form
          onSubmit={createCompany}
          className='space-y-4 rounded-lg bg-gray-50 p-6'
        >
          <h3 className='text-lg font-semibold'>새 회사 추가</h3>

          <div>
            <Label htmlFor='companyName'>회사명 *</Label>
            <Input
              id='companyName'
              value={formData.companyName}
              onChange={e =>
                setFormData(prev => ({ ...prev, companyName: e.target.value }))
              }
              required
            />
          </div>

          <div>
            <Label htmlFor='businessRegistrationNumber'>사업자등록번호</Label>
            <Input
              id='businessRegistrationNumber'
              value={formData.businessRegistrationNumber}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  businessRegistrationNumber: e.target.value,
                }))
              }
              placeholder='예: 123-45-67890'
            />
          </div>

          <div>
            <Label htmlFor='taxpayerType'>사업자 유형</Label>
            <select
              id='taxpayerType'
              value={formData.taxpayerType}
              onChange={e =>
                setFormData(prev => ({ ...prev, taxpayerType: e.target.value }))
              }
              className='w-full rounded border border-gray-300 p-2'
            >
              <option value='CORPORATION'>법인</option>
              <option value='SOLE_PROPRIETORSHIP'>개인사업자</option>
            </select>
          </div>

          <Button type='submit' className='w-full'>
            회사 생성
          </Button>
        </form>
      )}

      <div className='rounded-lg border border-gray-200 bg-white'>
        <div className='border-b border-gray-200 p-4'>
          <h3 className='text-lg font-semibold'>
            등록된 회사 ({companies.length}개)
          </h3>
        </div>

        {companies.length === 0 ? (
          <div className='p-8 text-center text-gray-500'>
            등록된 회사가 없습니다.
          </div>
        ) : (
          <div className='divide-y divide-gray-200'>
            {companies.map(company => (
              <div key={company.id} className='p-4'>
                <div className='flex items-start justify-between'>
                  <div>
                    <h4 className='font-semibold'>{company.companyName}</h4>
                    {company.businessRegistrationNumber && (
                      <p className='text-sm text-gray-600'>
                        사업자등록번호: {company.businessRegistrationNumber}
                      </p>
                    )}
                    <p className='text-sm text-gray-600'>
                      유형:{' '}
                      {company.taxpayerType === 'CORPORATION'
                        ? '법인'
                        : '개인사업자'}
                    </p>
                    <p className='text-xs text-gray-500'>
                      생성일:{' '}
                      {new Date(company.createdAt).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                  <div className='text-right text-sm text-gray-600'>
                    <p>거래내역: {company._count.transactions}건</p>
                    <p>규칙: {company._count.rules}개</p>
                    <p>규칙 후보: {company._count.ruleCandidates}개</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
