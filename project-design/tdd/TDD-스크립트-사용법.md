# MoneyShift TDD 스크립트 사용법

## 🚀 메인 실행 스크립트

### 전체 시스템 TDD 검증 후 시작
```bash
./start-all-with-tdd.sh
```
**동작:**
1. 데이터베이스 & Redis 상태 체크
2. Java API Backend TDD 검증 (mvn test)
3. NextJS Admin TDD 검증 (yarn test)
4. React Native Mobile TDD 검증 (yarn test)
5. 모든 테스트 통과 시에만 시스템 시작 (tmux 세션)

**결과 예시:**
```
🧪 MoneyShift 전체 시스템 - TDD 체크 시작...
================================================
✅ Database & Redis 준비 완료
✅ Java API Backend 테스트 통과
❌ NextJS Admin 테스트 실패
❌ React Native Mobile 테스트 실패

📊 TDD 체크 결과 요약
✅ 성공: 1/3
❌ 실패한 서비스: NextJS-Admin React-Native

각 서비스별 테스트를 개별적으로 실행하세요:
  cd mshift-admin && ./start-with-tdd.sh
  cd mshift-app && ./start-with-tdd.sh
```

---

### 단순 시스템 시작 (TDD 생략)
```bash
./start-all.sh
```
**동작:**
1. 데이터베이스 시작
2. Java API 백그라운드 시작
3. NextJS Admin 백그라운드 시작
4. 모든 서비스 PID 저장

**결과:**
```
✅ 모든 서비스 시작 완료!
🌐 NextJS Admin Panel: http://localhost:3000
☕ Java API Server: http://localhost:8080
🗄️ PostgreSQL: localhost:5432
🔴 Redis: localhost:6379

프로세스 ID:
  Backend PID: 12345
  Frontend PID: 12346
```

---

### 전체 시스템 중지
```bash
./stop-all.sh
```
**동작:**
1. PID 파일에서 프로세스 ID 읽기
2. 백엔드 서버 중지
3. 프론트엔드 서버 중지
4. Docker 컨테이너 중지 (PostgreSQL, Redis)
5. 로그 파일 삭제 옵션 제공

---

## ⚙️ 개별 서비스 TDD 스크립트

### Java API Backend
```bash
cd mshift-api
./start-with-tdd.sh                # TDD 검증 후 서버 시작
./start-with-tdd.sh --test-only     # 테스트만 실행
```

**TDD 체크 단계:**
1. Maven 프로젝트 검증
2. Java 버전 체크
3. 데이터베이스 연결 체크  
4. Maven 컴파일 체크
5. 정적 코드 분석
6. Unit Tests 실행 (11개)

**성공 시:**
```
✅ 모든 TDD 체크 통과!
🚀 MoneyShift API Backend 시작 중...
Spring Boot 애플리케이션이 포트 8080에서 실행됩니다.
```

---

### NextJS Admin
```bash
cd mshift-admin  
./start-with-tdd.sh                # TDD 검증 후 서버 시작
./start-with-tdd.sh --test-only     # 테스트만 실행
yarn test --watchAll=false         # 직접 테스트 실행
```

**TDD 체크 단계:**
1. Node.js 및 Yarn 버전 체크
2. 패키지 의존성 설치 확인
3. TypeScript 컴파일 체크
4. ESLint 검증
5. Jest 테스트 실행 (174개)

**테스트 실행 옵션:**
```bash
yarn test api/cache                 # 특정 디렉토리
yarn test transaction-cache.test.ts # 특정 파일
yarn test --coverage               # 커버리지 포함
yarn test --watch                  # Watch 모드
```

---

### React Native Mobile
```bash
cd mshift-app
./start-with-tdd.sh                # TDD 검증 후 Expo 시작
./start-with-tdd.sh --test-only     # 테스트만 실행
yarn test --watchAll=false         # 직접 테스트 실행
```

**TDD 체크 단계:**
1. Node.js 및 Expo CLI 확인
2. React Native 의존성 체크
3. TypeScript 컴파일 체크
4. Jest 테스트 실행 (25개)
5. 네이티브 모듈 호환성 체크

**개발 관련 스크립트:**
```bash
./start-app.sh                     # Expo 개발 서버 시작
./setup-app.sh                     # 의존성 재설치
expo start --clear                 # 캐시 클리어 후 시작
```

---

## 🗄️ 데이터베이스 및 인프라 스크립트

### 데이터베이스 관리
```bash
./scripts/setup/start-db.sh        # PostgreSQL + Redis 시작
docker-compose up -d               # 직접 Docker 시작
docker-compose down                # Docker 중지
```

**서비스 확인:**
```bash
# PostgreSQL 연결 테스트
psql -h localhost -p 5432 -U postgres -d moneyshift

# Redis 연결 테스트  
redis-cli -h localhost -p 6379 ping
```

---

### 개별 서비스 시작
```bash
./scripts/setup/start-backend.sh   # Java API만 시작
./scripts/setup/start-frontend.sh  # NextJS Admin만 시작
./scripts/setup/start-app.sh       # React Native만 시작
```

---

## 🧪 테스트 전용 스크립트

### 통합 테스트
```bash
./scripts/test/test-integration.sh    # 전체 통합 테스트
./scripts/test/test-integrated.sh     # 상세 통합 테스트
./scripts/test/test-admin.sh          # Admin 전용 테스트
./scripts/test/quick-test.sh          # 빠른 스모크 테스트
```

**통합 테스트 항목:**
1. 데이터베이스 연결 테스트
2. API 엔드포인트 응답 테스트
3. 서비스 간 통신 테스트
4. 캐시 레이어 동작 테스트
5. LLM 서비스 연동 테스트

---

### 테스트 결과 확인
```bash
# 상세 로그
tail -f test-results/integrated-test-report.log
tail -f test-results/rule-management-test.log

# 요약 리포트
cat test-results/test_summary.csv
```

---

## 📊 개발 워크플로우별 사용법

### 🔄 일반적인 개발 사이클

#### 1. 개발 시작 전 환경 체크
```bash
# 전체 시스템 상태 확인 및 시작
./start-all-with-tdd.sh

# 개발 중 개별 서비스 재시작
cd mshift-api && ./start-with-tdd.sh
```

#### 2. 코드 변경 후 테스트
```bash
# 변경된 서비스만 TDD 체크
cd mshift-admin && ./start-with-tdd.sh --test-only

# Watch 모드로 지속적 테스트
cd mshift-admin && yarn test --watch
```

#### 3. 배포 전 최종 검증
```bash
# 전체 시스템 TDD 검증
./start-all-with-tdd.sh

# 통합 테스트 추가 실행
./scripts/test/test-integration.sh
```

---

### 🐛 디버깅 및 문제 해결

#### 테스트 실패 시 디버깅
```bash
# Java Backend 상세 로그
cd mshift-api && mvn test -X

# NextJS 특정 테스트 디버깅  
cd mshift-admin && yarn test api/classify --verbose

# React Native Jest 캐시 클리어
cd mshift-app && yarn test --clearCache
```

#### 환경 이슈 해결
```bash
# 의존성 재설치
cd mshift-admin && rm -rf node_modules yarn.lock && yarn install
cd mshift-app && ./setup-app.sh

# Docker 컨테이너 재시작
docker-compose down && docker-compose up -d

# Java 캐시 클리어
cd mshift-api && mvn clean
```

---

### 🚀 배포 및 운영

#### 프로덕션 배포 전 체크리스트
```bash
# 1. 전체 TDD 검증
./start-all-with-tdd.sh

# 2. 통합 테스트 
./scripts/test/test-integration.sh

# 3. 성능 테스트 (필요시)
./scripts/test/test-performance.sh  # 향후 추가 예정

# 4. 빌드 테스트
cd mshift-admin && yarn build
cd mshift-api && mvn clean package
```

#### 운영 환경 모니터링
```bash
# 서비스 상태 확인
curl http://localhost:8080/actuator/health
curl http://localhost:3000/api/health

# 로그 모니터링
tail -f backend.log
tail -f frontend.log
```

---

## ⚙️ 고급 사용법

### 환경 변수 설정
```bash
# 개발 환경 설정
export ENVIRONMENT=development
export DB_URL=localhost:5432
export REDIS_URL=localhost:6379

# 테스트 환경 설정  
export NODE_ENV=test
export JEST_WORKERS=4
export MAVEN_OPTS="-Xmx2g"
```

### 성능 최적화 옵션
```bash
# Jest 병렬 실행 설정
cd mshift-admin && yarn test --maxWorkers=4

# Maven 병렬 빌드
cd mshift-api && mvn test -T 4

# Docker 리소스 제한
docker-compose up -d --scale postgres=1 --memory="2g"
```

### CI/CD 통합
```bash
# GitHub Actions에서 사용
- name: Run TDD Tests
  run: |
    chmod +x ./start-all-with-tdd.sh
    ./start-all-with-tdd.sh --ci-mode

# Jenkins에서 사용
pipeline {
  stage('TDD Verification') {
    steps {
      sh './start-all-with-tdd.sh --jenkins'
    }
  }
}
```

---

## 🎯 팁과 모범 사례

### 개발 효율성 팁
1. **Watch 모드 활용**: `yarn test --watch`로 실시간 피드백
2. **특정 테스트 실행**: 변경된 부분만 선택적 테스트
3. **병렬 실행**: 가능한 경우 병렬 옵션 사용
4. **캐시 활용**: 불필요한 재빌드 방지

### 문제 해결 순서
1. **로그 확인**: 상세 에러 메시지 파악
2. **환경 체크**: 의존성 및 서비스 상태 확인  
3. **캐시 클리어**: 빌드/테스트 캐시 초기화
4. **단계별 실행**: 각 단계별로 분리하여 문제 지점 파악

### 성능 고려사항
- **메모리 사용량**: 대용량 테스트 시 JVM 힙 조정
- **네트워크 지연**: 로컬 서비스 우선 사용
- **디스크 I/O**: SSD 사용 권장
- **CPU 활용**: 멀티코어 병렬 처리 활용

---

## 📞 지원 및 문의

### 도움 요청 시 제공할 정보
```bash
# 시스템 정보
./scripts/test/system-info.sh        # 향후 추가 예정

# 환경 정보
node --version
java --version  
docker --version

# 로그 파일
cat test-results/test_summary.csv
tail -100 backend.log
```

### 자주 발생하는 문제와 해결책
- **포트 충돌**: 다른 프로세스가 포트 사용 중
- **메모리 부족**: JVM 힙 사이즈 조정 필요
- **의존성 충돌**: package-lock.json 삭제 후 재설치
- **권한 문제**: 스크립트 실행 권한 확인

---

**모든 스크립트는 프로젝트 루트 디렉토리에서 실행하세요!** 🎯