#!/usr/bin/env node
/**
 * 포매팅만 실행하는 간단한 스크립트
 * ESLint 처리 없이 Prettier만 실행합니다.
 */

const { execSync } = require('child_process');

console.log('🎨 코드 포매팅 시작...');

try {
  // Prettier 실행 (핵심 소스 파일만)
  console.log('📝 Prettier 포매팅 중...');
  execSync(
    'npx prettier --write "app/**/*.{ts,tsx}" "components/**/*.{ts,tsx}" "lib/**/*.{ts,js}" "scripts/**/*.js" "*.{js,ts,json}" --ignore-path .prettierignore',
    {
      stdio: 'inherit',
      cwd: process.cwd(),
    }
  );

  console.log('✅ 코드 포매팅 완료!');
} catch (error) {
  console.error('❌ 포매팅 실패:', error.message);
  process.exit(1);
}
