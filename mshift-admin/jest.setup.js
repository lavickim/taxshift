import '@testing-library/jest-dom'

// 환경변수 설정 (테스트용)
process.env.NODE_ENV = 'test'

// 테스트 전역 설정
global.console = {
  ...console,
  // 테스트 중 불필요한 로그 출력 억제
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
} 