#!/bin/bash

# MoneyShift API Backend - TDD 기반 시작 스크립트
# 모든 테스트가 통과해야만 서버가 시작됩니다.

set -e

echo "🧪 MoneyShift API Backend - TDD 체크 시작..."
echo "================================================"

# 1. Maven 프로젝트 검증
echo "📦 Maven 프로젝트 검증 중..."
if [ ! -f "pom.xml" ]; then
    echo "❌ pom.xml 파일이 없습니다. Maven 프로젝트 디렉토리인지 확인하세요."
    exit 1
fi

# 2. Java 버전 체크
echo "☕ Java 버전 체크 중..."
JAVA_VERSION=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}')
if [[ ! "$JAVA_VERSION" =~ ^(17|21) ]]; then
    echo "❌ Java 17 이상이 필요합니다. 현재 버전: $JAVA_VERSION"
    exit 1
fi

# 3. 데이터베이스 연결 체크
echo "🗄️ 데이터베이스 연결 체크 중..."
if ! pg_isready -h localhost -p 5432 -U postgres 2>/dev/null; then
    echo "❌ PostgreSQL 데이터베이스 연결 실패. 데이터베이스가 실행 중인지 확인하세요."
    echo "다음 명령어로 데이터베이스를 시작하세요: ./start-db.sh"
    exit 1
fi

# 4. 컴파일 체크
echo "🔨 Maven 컴파일 체크 중..."
if ! mvn clean compile -q; then
    echo "❌ Maven 컴파일 실패. 코드를 확인하세요."
    exit 1
fi

# 5. 정적 분석 및 체크섬 검증
echo "🔍 정적 코드 분석 중..."
if command -v spotbugs >/dev/null 2>&1; then
    mvn spotbugs:check -q || echo "⚠️ SpotBugs 경고가 있습니다."
fi

# 6. 단위 테스트 실행
echo "🧪 Unit Tests 실행 중..."

# 테스트 실행하면서 진행 상황 표시
mvn test -q -Dspring.main.banner-mode=off -Dlogging.level.root=WARN > /tmp/test_output.log 2>&1 &
TEST_PID=$!

# 테스트 진행 상황 모니터링
echo "   ⏳ 테스트 진행 중..."
while kill -0 $TEST_PID 2>/dev/null; do
    # 실행 중인 테스트 클래스 이름 추출해서 표시
    if [ -f /tmp/test_output.log ]; then
        CURRENT_TEST=$(tail -10 /tmp/test_output.log | grep -o "Tests run.*" | tail -1)
        RUNNING_TEST=$(tail -20 /tmp/test_output.log | grep -o "Running.*Test" | tail -1)
        if [ ! -z "$RUNNING_TEST" ]; then
            echo "   📋 $RUNNING_TEST"
        fi
    fi
    sleep 1
done

# 테스트 결과 확인
wait $TEST_PID
TEST_RESULT=$?
TEST_OUTPUT=$(cat /tmp/test_output.log)

if [ $TEST_RESULT -ne 0 ]; then
    echo ""
    echo "❌ 단위 테스트 실패! 모든 테스트가 통과해야만 서버를 시작할 수 있습니다."
    echo ""
    echo "🔍 실패한 테스트 요약:"
    echo "$TEST_OUTPUT" | grep -E "(FAILED|ERROR|Tests run:|Failures:|Errors:|BUILD FAILURE)" | tail -15
    echo ""
    echo "💡 상세 테스트 로그:"
    echo "$TEST_OUTPUT" | grep -A 5 -B 5 "FAILED\|ERROR" | head -20
    echo ""
    echo "🛠️ 다음 명령어로 테스트를 개별 실행해서 문제를 찾아보세요:"
    echo "  mvn test -Dtest=ClassName"
    echo "  mvn test -Dtest=ClassName#methodName"
    echo ""
    echo "🚫 테스트 실패로 서버 시작을 중단합니다."
    rm -f /tmp/test_output.log
    exit 1
else
    # 성공한 테스트들 요약 표시
    echo ""
    echo "✅ 모든 테스트 통과!"
    PASSED_TESTS=$(echo "$TEST_OUTPUT" | grep -o "Tests run: [0-9]*, Failures: 0, Errors: 0" | wc -l)
    TOTAL_TESTS=$(echo "$TEST_OUTPUT" | grep -o "Tests run: [0-9]*" | sed 's/Tests run: //' | awk '{sum += $1} END {print sum}')
    if [ ! -z "$TOTAL_TESTS" ] && [ "$TOTAL_TESTS" -gt 0 ]; then
        echo "   📊 총 $TOTAL_TESTS 개 테스트 성공"
    fi
    
    # 실행된 테스트 클래스들 표시
    echo "   🧪 실행된 테스트 클래스들:"
    echo "$TEST_OUTPUT" | grep "Running.*Test" | sed 's/Running /   - /' | tail -10
fi

# 임시 파일 정리
rm -f /tmp/test_output.log

# 7. 통합 테스트 (있는 경우)
echo "🔄 Integration Tests 체크 중..."
if ls src/test/java/**/*IT.java 1> /dev/null 2>&1; then
    echo "   ⏳ 통합 테스트 실행 중..."
    IT_OUTPUT=$(mvn failsafe:integration-test failsafe:verify -q 2>&1)
    if [ $? -ne 0 ]; then
        echo ""
        echo "❌ 통합 테스트 실패!"
        echo "$IT_OUTPUT" | grep -E "(FAILED|ERROR|BUILD FAILURE)" | tail -10
        echo ""
        echo "🚫 통합 테스트 실패로 서버 시작을 중단합니다."
        exit 1
    else
        echo "   ✅ 통합 테스트 통과!"
    fi
else
    echo "   ℹ️ 통합 테스트 파일 없음 (건너뜀)"
fi

# 8. 패키징 테스트
echo "📦 JAR 패키징 테스트 중..."
PACKAGE_OUTPUT=$(mvn package -DskipTests -q 2>&1)
if [ $? -ne 0 ]; then
    echo "❌ 패키징 실패! JAR 빌드 문제를 확인하세요."
    echo "$PACKAGE_OUTPUT" | grep -E "(ERROR|BUILD FAILURE)" | tail -5
    echo ""
    echo "🚫 패키징 실패로 서버 시작을 중단합니다."
    exit 1
else
    echo "   ✅ JAR 패키징 성공!"
fi

# 9. 모든 체크 통과
echo ""
echo "✅ 모든 TDD 체크 통과!"

# --test-only 플래그 체크
if [[ "$1" == "--test-only" ]]; then
    echo "🧪 테스트 전용 모드: 서버 시작 없이 종료합니다."
    exit 0
fi

# Spring Boot 애플리케이션 시작
echo "================================================"
echo "🚀 MoneyShift API Backend 시작 중..."
echo "📡 서버 URL: http://localhost:8080/mshift-api"
echo "🏥 Health Check: http://localhost:8080/mshift-api/actuator/health"
echo "🎯 API 테스트: http://localhost:8080/mshift-api/v2/segmented-keywords/segments/statistics"
echo ""
echo "✨ Spring Boot 로고와 함께 서버가 시작됩니다..."
echo ""

# 서버 시작 시에는 배너 표시 (테스트와 달리)
exec mvn spring-boot:run