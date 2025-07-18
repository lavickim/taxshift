const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Next.js 앱이 있는 디렉토리 경로
  dir: './',
})

// Jest에 전달할 사용자 정의 설정
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'node',
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.tsx',
  ],
  collectCoverageFrom: [
    'lib/**/*.ts',
    'app/api/**/*.ts',
    '!lib/db/client.ts', // Prisma 클라이언트는 테스트 커버리지에서 제외
    '!lib/generated/**/*', // 생성된 파일들 제외
  ],
  coverageThreshold: {
    global: {
      statements: 90,
      branches: 90,
      functions: 90,
      lines: 90,
    },
  },
}

// createJestConfig는 비동기이므로 Next.js 설정을 로드할 수 있습니다
module.exports = createJestConfig(customJestConfig) 