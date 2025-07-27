import { v4 as uuidv4 } from 'uuid';

import { prisma } from '@/lib/db/client';

async function addCodeshiftCompany() {
  try {
    // "Codeshift Inc." 회사가 이미 있는지 확인
    const existingCompany = await prisma.company.findFirst({
      where: {
        companyName: 'Codeshift Inc.',
      },
    });

    if (existingCompany) {
      console.log('✅ "Codeshift Inc." 회사가 이미 존재합니다.');
      console.log('회사 정보:', existingCompany);
      return;
    }

    // 새로운 "Codeshift Inc." 회사 생성
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const company = await prisma.company.create({
      data: {
        id: uuidv4(),
        companyName: 'Codeshift Inc.',
        businessRegistrationNumber: '123-45-67890',
        taxpayerType: 'CORPORATION',
      },
    });

    console.log('🎉 "Codeshift Inc." 회사가 성공적으로 생성되었습니다!');
    console.log('회사 정보:', company);
  } catch (error) {
    console.error('❌ 회사 생성 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addCodeshiftCompany();
