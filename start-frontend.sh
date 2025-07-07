#!/bin/bash

# 프론트엔드 개발 서버 시작 스크립트

echo "🚀 NextJS 프론트엔드 서버 시작 중..."
echo "================================="

# mshift-admin 디렉토리로 이동
cd "$(dirname "$0")/mshift-admin"

# 의존성이 설치되지 않았다면 설치
if [ ! -d "node_modules" ]; then
    echo "📦 의존성 설치 중..."
    yarn install
fi

# 개발 서버 시작
echo "🌐 NextJS 서버 시작..."
echo "주소: http://localhost:3000"
echo "중단: Ctrl+C"
echo "================================="

yarn dev