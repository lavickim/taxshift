#!/bin/bash

# 데이터베이스 서비스 시작 스크립트

echo "🗄️ 데이터베이스 서비스 시작 중..."
echo "================================="

# Docker Compose로 PostgreSQL과 Redis 시작
echo "🐘 PostgreSQL 시작 중..."
echo "🔴 Redis 시작 중..."

docker-compose up -d postgres redis

echo ""
echo "✅ 데이터베이스 서비스 시작 완료!"
echo "--------------------------------"
echo "PostgreSQL: localhost:5432"
echo "  - 데이터베이스: moneyshift"
echo "  - 사용자: postgres"
echo "  - 비밀번호: postgres"
echo ""
echo "Redis: localhost:6379"
echo ""
echo "서비스 중지: docker-compose down"
echo "로그 확인: docker-compose logs postgres redis"
echo "================================="