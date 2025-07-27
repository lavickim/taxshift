import { PrismaClient } from '../generated/prisma';

declare global {
  var prisma: PrismaClient | undefined;
}

// Prisma 클라이언트 인스턴스 생성 (중복 방지)
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    });
  }
  prisma = global.prisma;
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
