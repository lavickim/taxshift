#!/bin/bash

echo "🚀 MoneyShift Admin Panel 시작"
echo "==============================="

# mshift-admin 디렉토리로 이동
cd mshift-admin

# 포트 3000이 사용 중인지 확인
if lsof -ti:3000 > /dev/null; then
    echo "⚠️ 포트 3000이 이미 사용 중입니다."
    echo "기존 프로세스를 종료할까요? (y/N)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo "🔄 기존 프로세스 종료 중..."
        lsof -ti:3000 | xargs kill -9 2>/dev/null || true
        sleep 2
    else
        echo "❌ 시작을 취소합니다."
        exit 1
    fi
fi

# node_modules 존재 확인
if [ ! -d "node_modules" ]; then
    echo "📦 의존성 패키지 설치 중..."
    yarn install || npm install
fi

# Prisma 클라이언트 생성
echo "🔧 Prisma 클라이언트 생성 중..."
yarn db:generate || npm run db:generate

# 환경 변수 확인
if [ ! -f ".env" ] && [ ! -f ".env.local" ]; then
    echo "⚠️ 환경 변수 파일(.env 또는 .env.local)이 없습니다."
    echo "데이터베이스 연결을 위해 환경 변수를 설정해주세요."
fi

echo "🌐 NextJS 개발 서버 시작 중..."
echo "   - URL: http://localhost:3000"
echo "   - 종료: Ctrl+C"
echo ""

# NextJS 개발 서버 시작
yarn dev || npm run dev