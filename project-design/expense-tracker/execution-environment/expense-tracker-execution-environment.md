# MoneyShift Expense Tracker 실행 환경 가이드
> 최종 업데이트: 2025-08-30

## 1. 시스템 아키텍처 개요

```
┌─────────────────────────────────────────────────────────┐
│                    Flutter Mobile App                    │
│              (Android Emulator / Physical Device)        │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼ HTTP (Port 8090)
┌─────────────────────────────────────────────────────────┐
│                 Spring Boot Backend API                  │
│                   mshift-expense-backend                 │
│                      (Port: 8090)                        │
└─────────────────────────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                ▼                       ▼
    ┌──────────────────┐    ┌──────────────────┐
    │   PostgreSQL     │    │      Redis       │
    │  (Port: 5433)    │    │   (Port: 6380)   │
    └──────────────────┘    └──────────────────┘
```

## 2. 개발 환경 정보

### 2.1 시스템 요구사항
- **OS**: macOS (Darwin) - Apple Silicon (ARM64)
- **Java**: 21 이상
- **Flutter**: 3.35.1
- **Docker**: 24.x 이상
- **Android SDK**: API 34

### 2.2 개발 도구
- VS Code / IntelliJ IDEA
- Android Studio
- Docker Desktop
- PostgreSQL Client (psql, pgAdmin, DBeaver 등)

## 3. Docker 환경 설정

### 3.1 Docker Compose 구성
**파일 위치**: `/Users/lavickim/_Dev/moneyshift/docker-compose.yml`

```yaml
services:
  trojan-postgres:
    image: postgres:15-alpine
    container_name: trojan-expense-db
    environment:
      POSTGRES_DB: trojan_expense_db
      POSTGRES_USER: trojan_user
      POSTGRES_PASSWORD: trojan_password
      POSTGRES_INITDB_ARGS: "--encoding=UTF-8"
    ports:
      - "5433:5432"
    volumes:
      - moneyshift_trojan_postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U trojan_user -d trojan_expense_db"]
      interval: 10s
      timeout: 5s
      retries: 3

  trojan-redis:
    image: redis:7-alpine
    container_name: trojan-expense-redis
    ports:
      - "6380:6379"
    command: redis-server --appendonly yes
    volumes:
      - trojan_redis_data:/data
```

### 3.2 컨테이너 관리 명령어

#### 컨테이너 시작
```bash
# 전체 시작
docker-compose up -d

# 특정 서비스만 시작
docker-compose up -d trojan-postgres trojan-redis
```

#### 컨테이너 상태 확인
```bash
# 실행 중인 컨테이너 확인
docker ps | grep trojan

# 로그 확인
docker logs trojan-expense-db
docker logs trojan-expense-redis
```

#### 컨테이너 중지
```bash
# 전체 중지
docker-compose down

# 데이터 보존하며 중지
docker-compose stop
```

### 3.3 Docker 볼륨 정보
| 볼륨명 | 용도 | 특징 |
|--------|------|------|
| moneyshift_trojan_postgres_data | PostgreSQL 데이터 | 영구 보존 |
| trojan_redis_data | Redis 데이터 | AOF 백업 |

## 4. 데이터베이스 접속 정보

### 4.1 PostgreSQL
```
Host: localhost
Port: 5433
Database: trojan_expense_db
Username: trojan_user
Password: trojan_password
```

### 4.2 접속 명령어
```bash
# psql 직접 접속
PGPASSWORD=trojan_password psql -h localhost -p 5433 -U trojan_user -d trojan_expense_db

# Docker 컨테이너 내부에서 접속
docker exec -it trojan-expense-db psql -U trojan_user -d trojan_expense_db
```

### 4.3 Redis
```
Host: localhost
Port: 6380
Password: (없음)
```

### 4.4 Redis 접속
```bash
# redis-cli 접속
redis-cli -p 6380

# Docker 컨테이너 내부에서 접속
docker exec -it trojan-expense-redis redis-cli
```

## 5. Spring Boot 백엔드 실행

### 5.1 프로젝트 위치
```
/Users/lavickim/_Dev/moneyshift/mshift-expense-backend
```

### 5.2 실행 명령
```bash
cd /Users/lavickim/_Dev/moneyshift/mshift-expense-backend

# Maven으로 실행
mvn spring-boot:run

# 또는 JAR 빌드 후 실행
mvn clean package
java -jar target/mshift-expense-backend-0.0.1-SNAPSHOT.jar
```

### 5.3 주요 설정 (application.yml)
```yaml
server:
  port: 8090

spring:
  datasource:
    url: jdbc:postgresql://localhost:5433/trojan_expense_db
    username: trojan_user
    password: trojan_password
    driver-class-name: org.postgresql.Driver
  
  jpa:
    hibernate:
      ddl-auto: create  # 개발 시: create, 운영 시: validate
    show-sql: true
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true

  data:
    redis:
      host: localhost
      port: 6380
```

### 5.4 API 확인
```bash
# 헬스 체크
curl http://localhost:8090/actuator/health

# API 테스트
curl http://localhost:8090/api/v1/categories?userId=1
```

## 6. Flutter 앱 실행

### 6.1 프로젝트 위치
```
/Users/lavickim/_Dev/moneyshift/mshift-expense-flutter
```

### 6.2 에뮬레이터 설정

#### AVD 목록 확인
```bash
flutter emulators
# 또는
emulator -list-avds
```

#### 에뮬레이터 시작
```bash
# Flutter 명령으로 시작
flutter emulators --launch ExpenseTracker_ARM64

# 또는 직접 시작
emulator -avd ExpenseTracker_ARM64
```

### 6.3 Flutter 앱 실행
```bash
cd /Users/lavickim/_Dev/moneyshift/mshift-expense-flutter

# 의존성 설치
flutter pub get

# 디바이스 확인
flutter devices

# 앱 실행 (자동으로 디바이스 선택)
flutter run

# 특정 디바이스에 실행
flutter run -d emulator-5554
```

### 6.4 실제 기기에서 실행
```bash
# USB 디버깅 활성화 필요
# 기기 연결 확인
adb devices

# Flutter 실행
flutter run
```

## 7. 전체 시스템 시작 스크립트

### 7.1 start-all.sh
```bash
#!/bin/bash

echo "🚀 Starting MoneyShift Expense Tracker..."

# 1. Docker 컨테이너 시작
echo "📦 Starting Docker containers..."
cd /Users/lavickim/_Dev/moneyshift
docker-compose up -d trojan-postgres trojan-redis
sleep 5

# 2. 백엔드 서버 시작
echo "🔧 Starting Spring Boot backend..."
cd /Users/lavickim/_Dev/moneyshift/mshift-expense-backend
mvn spring-boot:run &
BACKEND_PID=$!
sleep 10

# 3. 에뮬레이터 시작
echo "📱 Starting Android emulator..."
emulator -avd ExpenseTracker_ARM64 &
sleep 15

# 4. Flutter 앱 실행
echo "🎯 Starting Flutter app..."
cd /Users/lavickim/_Dev/moneyshift/mshift-expense-flutter
flutter run

echo "✅ All services started!"
echo "Backend PID: $BACKEND_PID"
```

## 8. 문제 해결

### 8.1 포트 충돌 해결
```bash
# 포트 사용 확인
lsof -i :8090  # Spring Boot
lsof -i :5433  # PostgreSQL
lsof -i :6380  # Redis

# 프로세스 종료
kill -9 [PID]
```

### 8.2 에뮬레이터 문제
```bash
# 에뮬레이터 재시작
adb emu kill
emulator -avd ExpenseTracker_ARM64

# ADB 서버 재시작
adb kill-server
adb start-server
```

### 8.3 Flutter 빌드 문제
```bash
# 캐시 정리
flutter clean
flutter pub get

# Gradle 캐시 정리
cd android
./gradlew clean
```

### 8.4 Docker 문제
```bash
# 컨테이너 재시작
docker-compose restart

# 볼륨 확인
docker volume ls | grep moneyshift

# 로그 확인
docker-compose logs -f
```

## 9. 테스트 데이터 관리

### 9.1 샘플 데이터 로드
```bash
# SQL 파일 위치
/Users/lavickim/_Dev/moneyshift/mshift-expense-backend/src/main/resources/sample_data.sql

# 데이터 삽입
PGPASSWORD=trojan_password psql -h localhost -p 5433 -U trojan_user \
  -d trojan_expense_db -f sample_data.sql
```

### 9.2 데이터베이스 백업
```bash
# 전체 백업
PGPASSWORD=trojan_password pg_dump -h localhost -p 5433 -U trojan_user \
  trojan_expense_db > backup_$(date +%Y%m%d_%H%M%S).sql

# 테이블별 백업
PGPASSWORD=trojan_password pg_dump -h localhost -p 5433 -U trojan_user \
  -t et_transactions trojan_expense_db > transactions_backup.sql
```

### 9.3 데이터베이스 복구
```bash
# 전체 복구
PGPASSWORD=trojan_password psql -h localhost -p 5433 -U trojan_user \
  trojan_expense_db < backup_file.sql
```

## 10. 모니터링

### 10.1 로그 확인
```bash
# Spring Boot 로그
tail -f /Users/lavickim/_Dev/moneyshift/mshift-expense-backend/logs/app.log

# Docker 로그
docker logs -f trojan-expense-db
docker logs -f trojan-expense-redis

# Flutter 로그
flutter logs
```

### 10.2 성능 모니터링
```bash
# Docker 리소스 사용량
docker stats

# PostgreSQL 연결 수
PGPASSWORD=trojan_password psql -h localhost -p 5433 -U trojan_user -d trojan_expense_db \
  -c "SELECT count(*) FROM pg_stat_activity;"
```

## 11. 주의사항 및 팁

### 11.1 중요 주의사항
- ⚠️ Docker 볼륨 `moneyshift_trojan_postgres_data`는 삭제하지 말 것
- ⚠️ 포트 번호 확인: PostgreSQL(5433), Redis(6380), Spring Boot(8090)
- ⚠️ 에뮬레이터에서는 localhost 대신 `10.0.2.2` 사용

### 11.2 개발 팁
- 백엔드 API 변경 시 Flutter 앱 재시작 필요
- Docker 컨테이너는 한 번 시작하면 계속 유지
- 에뮬레이터는 `-no-snapshot-load` 옵션으로 깨끗한 상태 시작 가능

### 11.3 성능 최적화
- Redis 캐시 적극 활용
- JPA 쿼리 최적화 (N+1 문제 주의)
- Flutter 빌드 모드: 개발(debug) vs 배포(release)

---

## 문서 정보
- **작성일**: 2025-08-30
- **버전**: 1.0
- **관련 문서**: 
  - [가계부 앱 DB 정보](../db/가계부-앱-DB-정보.md)
  - [CLAUDE.md](../../CLAUDE.md)