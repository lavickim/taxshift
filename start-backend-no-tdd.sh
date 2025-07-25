#!/bin/bash

# MoneyShift API Backend - TDD 우회 시작 스크립트 (개발/디버깅용)

echo "🚀 MoneyShift API Backend - TDD 우회 모드 시작..."
echo "⚠️  경고: TDD 검증을 건너뜁니다. 개발/디버깅 목적으로만 사용하세요!"
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

# Maven 컴파일만 수행 (테스트 건너뛰기)
echo "🔧 Maven 프로젝트 컴파일 중 (테스트 건너뛰기)..."
mvn clean compile -DskipTests=true

# Spring Boot 서버 시작
echo "🚀 Spring Boot 서버 시작..."
echo "로컬 접근: http://localhost:8080/mshift-api"
echo "API 문서: http://localhost:8080/mshift-api/swagger-ui.html"
echo "전표 출력 API: http://localhost:8080/mshift-api/api/v2/accounting/vouchers"
echo "전표 템플릿 API: http://localhost:8080/mshift-api/api/v2/accounting/voucher-templates"
echo "중단: Ctrl+C"
echo "================================="

mvn spring-boot:run -DskipTests=true