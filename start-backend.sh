#!/bin/bash

# 백엔드 Java API 서버 시작 스크립트

echo "☕ Java API 서버 시작 중..."
echo "================================="

# mshift-api 디렉토리로 이동
cd "$(dirname "$0")/mshift-api"

# Maven 의존성 확인 및 컴파일
echo "🔧 Maven 프로젝트 컴파일 중..."
./mvnw clean compile

# Spring Boot 서버 시작
echo "🚀 Spring Boot 서버 시작..."
echo "주소: http://localhost:8080"
echo "API 문서: http://localhost:8080/api"
echo "중단: Ctrl+C"
echo "================================="

./mvnw spring-boot:run