#!/bin/bash

# MoneyShift Admin - TDD 기반 시작 스크립트
# 모든 테스트가 통과해야만 개발 서버가 시작됩니다.

set -e

echo "🧪 MoneyShift Admin - TDD 체크 시작..."
echo "================================================"

# 1. 의존성 설치 확인
echo "📦 의존성 체크 중..."
if [ ! -d "node_modules" ]; then
    echo "node_modules가 없습니다. yarn install을 실행합니다..."
    yarn install
fi

# 2. Prisma 클라이언트 생성
echo "🗄️ Prisma 클라이언트 생성 중..."
if ! yarn db:generate; then
    echo "❌ Prisma 클라이언트 생성 실패. 데이터베이스 설정을 확인하세요."
    exit 1
fi

# 3. TypeScript 컴파일 체크
echo "🔍 TypeScript 컴파일 체크 중..."
if ! npx tsc --noEmit --skipLibCheck; then
    echo "❌ TypeScript 컴파일 오류가 있습니다. 수정 후 다시 시도하세요."
    exit 1
fi

# 4. ESLint 체크
echo "🔍 ESLint 체크 중..."
if ! yarn lint; then
    echo "❌ ESLint 오류가 있습니다. 수정 후 다시 시도하세요."
    exit 1
fi

# 5. Jest 테스트 실행
echo "🧪 Jest 테스트 실행 중..."
if ! yarn test --passWithNoTests --detectOpenHandles --forceExit; then
    echo "❌ 테스트 실패! 모든 테스트가 통과해야만 서버를 시작할 수 있습니다."
    echo ""
    echo "다음 명령어로 테스트를 개별 실행해서 문제를 찾아보세요:"
    echo "  yarn test --watch"
    echo "  yarn test [파일명]"
    echo ""
    exit 1
fi

# 6. 빌드 테스트
echo "🏗️ 프로덕션 빌드 테스트 중..."
if ! yarn build; then
    echo "❌ 빌드 실패! 빌드 오류를 수정하세요."
    exit 1
fi

# 7. 모든 체크 통과
echo ""
echo "✅ 모든 TDD 체크 통과!"

# --test-only 플래그 체크
if [[ "$1" == "--test-only" ]]; then
    echo "🧪 테스트 전용 모드: 서버 시작 없이 종료합니다."
    exit 0
fi

# Next.js 개발 서버 시작
echo "================================================"
echo "🚀 MoneyShift Admin 개발 서버 시작 중..."
echo ""

exec yarn dev