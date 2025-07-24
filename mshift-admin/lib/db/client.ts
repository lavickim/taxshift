import { PrismaClient } from '../generated/prisma';
import { checkDatabaseUrl, logDatabaseInfo } from './connection';

// DATABASE_URL 확인
if (!checkDatabaseUrl()) {
  throw new Error('DATABASE_URL이 환경 변수에 설정되지 않았습니다. .env 파일에 Supabase에서 제공하는 DATABASE_URL을 추가해주세요.');
}

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Prisma 클라이언트 인스턴스 생성 (중복 방지)
let prisma: PrismaClient;

if (globalThis.prisma) {
  prisma = globalThis.prisma;
} else {
  prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
  
  if (process.env.NODE_ENV !== 'production') {
    globalThis.prisma = prisma;
  }
}

export { prisma };

/**
 * 데이터베이스 연결을 테스트합니다.
 */
export async function testDatabaseConnection(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

/**
 * 애플리케이션 종료 시 Prisma 클라이언트 연결을 정리합니다.
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
} 