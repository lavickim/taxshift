#!/bin/bash

# Expense 백엔드 실행 스크립트
# Spring Boot 서버를 포트 8081에서 실행

echo "🚀 Expense 백엔드 시작 중..."

# 현재 디렉토리 확인
if [[ ! -d "mshift-expense-backend" ]]; then
    echo "❌ 오류: mshift-expense-backend 디렉토리를 찾을 수 없습니다."
    echo "   MoneyShift 프로젝트 루트에서 실행해주세요."
    exit 1
fi

# 포트 8081에서 실행 중인 프로세스 확인 및 종료
echo "🔍 포트 8081 확인 중..."
PORT_PID=$(lsof -ti:8081)
if [[ ! -z "$PORT_PID" ]]; then
    echo "⏹️  포트 8081에서 실행 중인 프로세스 종료 중... (PID: $PORT_PID)"
    kill -9 $PORT_PID
    sleep 3
fi

# Spring Boot 프로세스 확인 및 종료 (ExpenseApplication 기준)
echo "🔍 기존 Expense 백엔드 프로세스 확인 중..."
EXPENSE_PID=$(ps aux | grep ExpenseApplication | grep -v grep | awk '{print $2}')
if [[ ! -z "$EXPENSE_PID" ]]; then
    echo "⏹️  기존 Expense 백엔드 프로세스 종료 중... (PID: $EXPENSE_PID)"
    kill -9 $EXPENSE_PID
    sleep 3
fi

# PostgreSQL 및 Redis 컨테이너 시작
echo "🐳 데이터베이스 컨테이너 시작 중..."
docker start moneyshift-postgres moneyshift-redis 2>/dev/null || true
sleep 5

# Spring Boot 애플리케이션 시작
echo "🏗️  Expense 백엔드 빌드 및 실행 중..."
cd mshift-expense-backend

# 백그라운드에서 실행하고 PID 저장
nohup mvn spring-boot:run > ../backend-expense.log 2>&1 &
BACKEND_PID=$!

echo "📝 백엔드 PID: $BACKEND_PID (backend-expense.log에 로그 저장됨)"

# 서버 시작 대기
echo "⏳ 서버 시작 대기 중..."
for i in {1..30}; do
    if curl -s http://localhost:8081/api/actuator/health > /dev/null 2>&1; then
        echo "✅ Expense 백엔드가 성공적으로 시작되었습니다!"
        echo "🌐 백엔드 URL: http://localhost:8081/api"
        echo "📊 Health Check: http://localhost:8081/api/actuator/health"
        echo "📚 API 문서: http://localhost:8081/api/swagger-ui.html"
        echo ""
        echo "📋 주요 API 엔드포인트:"
        echo "   - POST /api/receipts/upload - 영수증 업로드"
        echo "   - GET  /api/receipts - 영수증 목록"
        echo "   - GET  /api/export/excel - 데이터 내보내기"
        echo ""
        echo "🎯 로그 확인: tail -f backend-expense.log"
        exit 0
    fi
    sleep 2
    echo -n "."
done

echo ""
echo "❌ 서버 시작에 실패했습니다. 로그를 확인해주세요:"
echo "   tail -f backend-expense.log"
exit 1