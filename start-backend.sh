#!/bin/bash

# 백엔드 Java API 서버 시작 스크립트

echo "☕ Java API 서버 시작 중..."
echo "================================="

# 8080 포트 사용 프로세스 확인 및 종료
echo "🔍 포트 8080 사용 프로세스 확인 중..."
PORT_PID=$(lsof -ti :8080)

if [ ! -z "$PORT_PID" ]; then
    echo "⚠️  포트 8080이 이미 사용 중입니다 (PID: $PORT_PID)"
    echo "🔥 기존 프로세스 종료 중..."
    kill -9 $PORT_PID
    sleep 2
    echo "✅ 기존 프로세스 종료 완료"
else
    echo "✅ 포트 8080 사용 가능"
fi

# mshift-api 디렉토리로 이동
cd "$(dirname "$0")/mshift-api"

# Maven 의존성 확인 및 컴파일
echo "🔧 Maven 프로젝트 컴파일 중..."
mvn clean compile

# Spring Boot 서버 시작
echo "🚀 Spring Boot 서버 시작..."
echo "로컬 접근: http://localhost:8080/api"
echo "네트워크 접근: http://192.168.45.219:8080/api"
echo "모든 IP 접근: http://0.0.0.0:8080/api"
echo "테스트 URL: http://192.168.45.219:8080/api/rule-engine/health"
echo "중단: Ctrl+C"
echo "================================="

mvn spring-boot:run