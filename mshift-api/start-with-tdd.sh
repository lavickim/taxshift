#!/bin/bash

# MoneyShift API Backend - TDD 기반 시작 스크립트
# 모든 테스트가 통과해야만 서버가 시작됩니다.

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
GRAY='\033[0;90m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# 프리티 프린트 함수들
print_header() {
    echo -e "${BOLD}${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BOLD}${BLUE}║${NC}  ${WHITE}🚀 MoneyShift API Backend - TDD 기반 시작${NC}  ${BOLD}${BLUE}║${NC}"
    echo -e "${BOLD}${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
    echo
}

print_section() {
    echo -e "${BOLD}${CYAN}┌─ $1${NC}"
}

print_success() {
    echo -e "   ${GREEN}✓${NC} ${WHITE}$1${NC}"
}

print_info() {
    echo -e "   ${BLUE}ℹ${NC} ${GRAY}$1${NC}"
}

print_warning() {
    echo -e "   ${YELLOW}⚠${NC} ${YELLOW}$1${NC}"
}

print_error() {
    echo -e "   ${RED}✗${NC} ${RED}$1${NC}"
}

print_progress() {
    echo -e "   ${PURPLE}⏳${NC} ${WHITE}$1${NC}"
}

print_running() {
    echo -e "   ${CYAN}📋${NC} ${GRAY}$1${NC}"
}

# 간단한 스피너 함수 (bc 명령어 불필요)
show_spinner() {
    local message="$1"
    local delay=0.1
    local spinstr='|/-\'
    local temp
    
    while [ "$(ps a | awk '{print $1}' | grep $!)" ]; do
        temp=${spinstr#?}
        printf "\r   ${PURPLE}%c${NC} ${WHITE}%s${NC}" "$spinstr" "$message"
        spinstr=$temp${spinstr%"$temp"}
        sleep $delay
    done
    printf "\r\033[K"  # 스피너 지우기
}

print_header

# 1. Maven 프로젝트 검증
print_section "📦 Maven 프로젝트 검증"
if [ ! -f "pom.xml" ]; then
    print_error "pom.xml 파일이 없습니다. Maven 프로젝트 디렉토리인지 확인하세요."
    exit 1
fi
print_success "pom.xml 파일 확인 완료"
echo

# 2. Java 버전 체크
print_section "☕ Java 버전 검증"
JAVA_VERSION=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}')
if [[ ! "$JAVA_VERSION" =~ ^(17|21) ]]; then
    print_error "Java 17 이상이 필요합니다. 현재 버전: $JAVA_VERSION"
    exit 1
fi
print_success "Java 버전: $JAVA_VERSION ✨"
echo

# 3. 데이터베이스 연결 체크
print_section "🗄️ 데이터베이스 연결 확인"
if ! pg_isready -h localhost -p 5432 -U postgres 2>/dev/null; then
    print_error "PostgreSQL 데이터베이스 연결 실패"
    print_info "다음 명령어로 데이터베이스를 시작하세요: ${CYAN}./start-db.sh${NC}"
    exit 1
fi
print_success "PostgreSQL 연결 확인 ✨"
echo

# 4. 컴파일 체크
print_section "🔨 Maven 컴파일 검증"
print_progress "프로젝트 컴파일 중..."
if ! mvn clean compile -q; then
    print_error "Maven 컴파일 실패. 코드를 확인하세요."
    exit 1
fi
print_success "컴파일 성공 ✨"
echo

# 5. 정적 분석 및 체크섬 검증
print_section "🔍 정적 코드 분석"
if command -v spotbugs >/dev/null 2>&1; then
    print_progress "SpotBugs 분석 중..."
    mvn spotbugs:check -q || print_warning "SpotBugs 경고가 있습니다."
    print_success "정적 분석 완료"
else
    print_info "SpotBugs가 설치되지 않음 (건너뜀)"
fi
echo

# 6. 단위 테스트 실행
print_section "🧪 단위 테스트 실행"

# 테스트 실행하면서 진행 상황 표시
mvn test -q -Dspring.main.banner-mode=off -Dlogging.level.root=WARN > /tmp/test_output.log 2>&1 &
TEST_PID=$!

# 테스트 진행 상황 모니터링
print_progress "테스트 케이스 실행 중..."
LAST_TEST=""
SPINNER_CHARS="⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏"
COUNTER=0

while kill -0 $TEST_PID 2>/dev/null; do
    # 실행 중인 테스트 클래스 이름 추출해서 표시
    if [ -f /tmp/test_output.log ]; then
        RUNNING_TEST=$(tail -20 /tmp/test_output.log | grep -o "Running.*Test" | tail -1)
        if [ ! -z "$RUNNING_TEST" ] && [ "$RUNNING_TEST" != "$LAST_TEST" ]; then
            # 새로운 테스트 클래스 시작
            printf "\r\033[K"  # 현재 줄 지우기
            print_running "$RUNNING_TEST"
            LAST_TEST="$RUNNING_TEST"
        else
            # 스피너 표시
            SPINNER_CHAR=$(echo $SPINNER_CHARS | cut -c$((COUNTER % 10 + 1)))
            printf "\r   ${PURPLE}${SPINNER_CHAR}${NC} ${GRAY}테스트 실행 중...${NC}"
            COUNTER=$((COUNTER + 1))
        fi
    fi
    sleep 0.5
done

printf "\r\033[K"  # 마지막 스피너 지우기

# 테스트 결과 확인
wait $TEST_PID
TEST_RESULT=$?
TEST_OUTPUT=$(cat /tmp/test_output.log)

if [ $TEST_RESULT -ne 0 ]; then
    echo
    print_error "단위 테스트 실패! 서버 시작을 중단합니다."
    echo
    echo -e "${BOLD}${RED}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BOLD}${RED}║${NC}  ${WHITE}🔍 실패한 테스트 분석${NC}  ${BOLD}${RED}║${NC}"
    echo -e "${BOLD}${RED}╚══════════════════════════════════════════════════════════╝${NC}"
    echo
    echo -e "${YELLOW}🔍 실패 요약:${NC}"
    echo "$TEST_OUTPUT" | grep -E "(FAILED|ERROR|Tests run:|Failures:|Errors:|BUILD FAILURE)" | sed 's/^/   /' | tail -15
    echo
    echo -e "${YELLOW}💡 상세 로그:${NC}"
    echo "$TEST_OUTPUT" | grep -A 5 -B 5 "FAILED\|ERROR" | sed 's/^/   /' | head -20
    echo
    echo -e "${CYAN}🛠️ 문제 해결 방법:${NC}"
    echo -e "   ${WHITE}• 개별 테스트 실행:${NC} ${CYAN}mvn test -Dtest=ClassName${NC}"
    echo -e "   ${WHITE}• 특정 메서드 실행:${NC} ${CYAN}mvn test -Dtest=ClassName#methodName${NC}"
    echo
    rm -f /tmp/test_output.log
    exit 1
else
    # 성공한 테스트들 요약 표시
    echo
    print_success "모든 테스트 통과! 🎉"
    
    TOTAL_TESTS=$(echo "$TEST_OUTPUT" | grep -o "Tests run: [0-9]*" | sed 's/Tests run: //' | awk '{sum += $1} END {print sum}')
    TEST_CLASSES=$(echo "$TEST_OUTPUT" | grep "Running.*Test" | wc -l | tr -d ' ')
    
    if [ ! -z "$TOTAL_TESTS" ] && [ "$TOTAL_TESTS" -gt 0 ]; then
        echo -e "   ${BLUE}📊${NC} ${WHITE}총 ${GREEN}$TOTAL_TESTS${NC} ${WHITE}개 테스트가 ${GREEN}$TEST_CLASSES${NC} ${WHITE}개 클래스에서 성공${NC}"
    fi
    
    # 실행된 테스트 클래스들 표시 (예쁘게)
    echo -e "   ${BLUE}🧪${NC} ${WHITE}실행된 테스트 클래스들:${NC}"
    echo "$TEST_OUTPUT" | grep "Running.*Test" | sed 's/Running //' | sort | sed "s/^/      ${GRAY}▸ ${NC}/" | tail -10
fi

# 임시 파일 정리
rm -f /tmp/test_output.log
echo

# 7. 통합 테스트 (있는 경우)
print_section "🔄 통합 테스트 검증"
if ls src/test/java/**/*IT.java 1> /dev/null 2>&1; then
    print_progress "통합 테스트 실행 중..."
    IT_OUTPUT=$(mvn failsafe:integration-test failsafe:verify -q 2>&1)
    if [ $? -ne 0 ]; then
        echo
        print_error "통합 테스트 실패!"
        echo "$IT_OUTPUT" | grep -E "(FAILED|ERROR|BUILD FAILURE)" | sed 's/^/   /' | tail -10
        echo
        print_error "통합 테스트 실패로 서버 시작을 중단합니다."
        exit 1
    else
        print_success "통합 테스트 통과 ✨"
    fi
else
    print_info "통합 테스트 파일 없음 (건너뜀)"
fi
echo

# 8. 패키징 테스트
print_section "📦 JAR 패키징 검증"
print_progress "JAR 파일 빌드 중..."
PACKAGE_OUTPUT=$(mvn package -DskipTests -q 2>&1)
if [ $? -ne 0 ]; then
    print_error "패키징 실패! JAR 빌드 문제를 확인하세요."
    echo "$PACKAGE_OUTPUT" | grep -E "(ERROR|BUILD FAILURE)" | sed 's/^/   /' | tail -5
    echo
    print_error "패키징 실패로 서버 시작을 중단합니다."
    exit 1
else
    print_success "JAR 패키징 성공 ✨"
fi
echo

# 9. 모든 체크 통과
echo -e "${BOLD}${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${GREEN}║${NC}  ${WHITE}🎉 모든 TDD 검증 완료! 서버 시작 준비 완료${NC}  ${BOLD}${GREEN}║${NC}"
echo -e "${BOLD}${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo

# --test-only 플래그 체크
if [[ "$1" == "--test-only" ]]; then
    echo -e "${BLUE}🧪 테스트 전용 모드: 서버 시작 없이 종료합니다.${NC}"
    exit 0
fi

# Spring Boot 애플리케이션 시작
echo -e "${BOLD}${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${CYAN}║${NC}  ${WHITE}🚀 MoneyShift API Backend 서버 시작${NC}  ${BOLD}${CYAN}║${NC}"
echo -e "${BOLD}${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo
echo -e "${WHITE}📡 서버 정보:${NC}"
echo -e "   ${BLUE}▸${NC} ${WHITE}메인 URL:${NC} ${CYAN}http://localhost:8080/mshift-api${NC}"
echo -e "   ${BLUE}▸${NC} ${WHITE}Health Check:${NC} ${CYAN}http://localhost:8080/mshift-api/actuator/health${NC}"
echo -e "   ${BLUE}▸${NC} ${WHITE}API 테스트:${NC} ${CYAN}http://localhost:8080/mshift-api/v2/segmented-keywords/segments/statistics${NC}"
echo
echo -e "${PURPLE}✨ Spring Boot와 함께 서버가 시작됩니다...${NC}"
echo
echo -e "${GRAY}┌─────────────────────────────────────────────────────────────┐${NC}"
echo -e "${GRAY}│${NC} ${YELLOW}💡 팁: Ctrl+C를 눌러 서버를 중지할 수 있습니다${NC} ${GRAY}│${NC}"
echo -e "${GRAY}└─────────────────────────────────────────────────────────────┘${NC}"
echo

# 서버 시작 시에는 배너 표시 (테스트와 달리)
exec mvn spring-boot:run