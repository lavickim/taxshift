#!/bin/bash

# MoneyShift Admin - TDD 기반 시작 스크립트

echo "🧪 MoneyShift Admin - TDD 검증 후 시작..."
echo "================================="

# mshift-admin 디렉토리로 이동
cd "$(dirname "$0")/mshift-admin"

# TDD 검증 실행
echo "🧪 TDD 테스트 검증 중..."
if ! ./start-with-tdd.sh --test-only; then
    echo "❌ TDD 테스트 실패! 모든 테스트가 통과해야만 서버를 시작할 수 있습니다."
    exit 1
fi

echo "✅ 모든 TDD 검증 통과!"
echo "🚀 NextJS Admin 서버 시작 중..."
echo "================================="

# 의존성이 설치되지 않았다면 설치
if [ ! -d "node_modules" ]; then
    echo "📦 의존성 설치 중..."
    yarn install
else
    echo "📦 의존성 설치 중..."
    yarn install
fi

# 개발 서버 시작
echo "🌐 NextJS 서버 시작..."
echo "주소: http://localhost:3000"
echo "중단: Ctrl+C"
echo "================================="

yarn dev