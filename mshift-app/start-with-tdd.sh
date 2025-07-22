#!/bin/bash

# MoneyShift Mobile App - TDD 기반 시작 스크립트
# 모든 테스트가 통과해야만 앱이 시작됩니다.

set -e

echo "🧪 MoneyShift Mobile App - TDD 체크 시작..."
echo "================================================"

# 1. 의존성 설치 확인
echo "📦 의존성 체크 중..."
if [ ! -d "node_modules" ]; then
    echo "node_modules가 없습니다. yarn install을 실행합니다..."
    yarn install
fi

# 2. TypeScript 컴파일 체크
echo "🔍 TypeScript 컴파일 체크 중..."
if ! npx tsc --noEmit; then
    echo "❌ TypeScript 컴파일 오류가 있습니다. 수정 후 다시 시도하세요."
    exit 1
fi

# 3. ESLint 체크
echo "🔍 ESLint 체크 중..."
if command -v npx eslint >/dev/null 2>&1; then
    if ! npx eslint src --ext .ts,.tsx --max-warnings 0; then
        echo "❌ ESLint 오류가 있습니다. 수정 후 다시 시도하세요."
        exit 1
    fi
else
    echo "⚠️ ESLint가 설치되지 않았습니다. 건너뜁니다."
fi

# 4. Jest 테스트 실행
echo "🧪 Jest 테스트 실행 중..."
if ! yarn test --passWithNoTests --detectOpenHandles --forceExit; then
    echo "❌ 테스트 실패! 모든 테스트가 통과해야만 앱을 시작할 수 있습니다."
    echo ""
    echo "다음 명령어로 테스트를 개별 실행해서 문제를 찾아보세요:"
    echo "  yarn test --watch"
    echo "  yarn test [파일명]"
    echo ""
    exit 1
fi

# 5. 모든 체크 통과
echo ""
echo "✅ 모든 TDD 체크 통과!"

# --test-only 플래그 체크
if [[ "$1" == "--test-only" ]]; then
    echo "🧪 테스트 전용 모드: 앱 시작 없이 종료합니다."
    exit 0
fi

# Expo 개발 서버 시작
echo "================================================"
echo "🚀 MoneyShift Mobile App 시작 중..."
echo ""

exec yarn start